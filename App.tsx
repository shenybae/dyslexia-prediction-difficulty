
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { Screen, Difficulty, ProgressRecord, UserProfile } from './types';
import { TRACING_ITEMS, READING_ITEMS, SPELLING_ITEMS, MEMORY_ITEMS } from './constants';
import { TracingActivity } from './components/TracingActivity';
import { ReadingActivity } from './components/ReadingActivity';
import { SpellingActivity } from './components/SpellingActivity';
import { MemoryActivity } from './components/MemoryActivity';
import { ParentDashboard } from './components/ParentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginScreen } from './components/LoginScreen';
import { AssessmentFlow } from './components/AssessmentFlow';
import { LearningJourney } from './components/LearningJourney';
import { SignUpScreen } from './components/SignUpScreen';
import { TwoFactorAuth } from './components/TwoFactorAuth';
import { BookOpen, PenTool, Brain, ChevronRight, Star, Keyboard, Zap, User, GraduationCap, ArrowLeft, Lock, LogOut, Map, Target, Check, CheckCircle, ArrowRight } from 'lucide-react-native';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [is2FAVerified, setIs2FAVerified] = useState(false);
  
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [selectedActivityType, setSelectedActivityType] = useState<'TRACING' | 'READING' | 'SPELLING' | 'MEMORY' | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MILD);
  const [progressData, setProgressData] = useState<ProgressRecord[]>([]);

  // Focus Selection State
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const userData = docSnap.data() as UserProfile;
                setCurrentUser(userData);
                setDifficulty(userData.assignedDifficulty || Difficulty.MILD);
                
                // If focus areas exist in profile, use them
                if (userData.focusAreas) setSelectedFocus(userData.focusAreas);

                loadUserProgress(user.uid);

                if (userData.role === 'Admin') {
                   setCurrentScreen(Screen.ADMIN_DASHBOARD);
                } else if (userData.role === 'Guardian' && !is2FAVerified) {
                  setCurrentScreen(Screen.TWO_FACTOR);
                } else if (!userData.assessmentComplete) {
                    setCurrentScreen(Screen.ASSESSMENT);
                } else if (!userData.focusAreas) {
                    // New step: If assessment done but no focus areas, show focus select
                    setCurrentScreen(Screen.FOCUS_SELECT);
                } else {
                    setCurrentScreen(Screen.HOME);
                }
            } else {
                setCurrentUser({ uid: user.uid, email: user.email!, role: 'Guardian', childName: 'Student', assessmentComplete: false, assignedDifficulty: Difficulty.MILD });
                if (!is2FAVerified) {
                  setCurrentScreen(Screen.TWO_FACTOR);
                } else {
                  setCurrentScreen(Screen.ASSESSMENT);
                }
            }
        } catch (e) {
            console.error(e);
        }
      } else {
        if (!currentUser) {
            setCurrentScreen(Screen.LOGIN);
            setIs2FAVerified(false);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [is2FAVerified]);

  const loadUserProgress = async (uid: string) => {
      try {
          const progressRef = collection(db, 'users', uid, 'progress');
          const q = query(progressRef, orderBy('date', 'asc'));
          const snapshot = await getDocs(q);
          const records: ProgressRecord[] = snapshot.docs.map(doc => doc.data() as ProgressRecord);
          setProgressData(records);
      } catch (e) {
          console.error("Error loading progress", e);
      }
  };

  const handleSignOut = async () => {
      await signOut(auth);
      setCurrentUser(null);
      setCurrentScreen(Screen.LOGIN);
      setProgressData([]);
      setIs2FAVerified(false);
  };

  const handleDemoLogin = (role: 'Guardian' | 'Admin') => {
    const demoUser: UserProfile = {
      uid: 'demo-user-123',
      email: role === 'Admin' ? 'admin@lexilearn.com' : 'demo@lexilearn.com',
      childName: role === 'Admin' ? 'N/A' : 'Alex (Demo)',
      role: role,
      assessmentComplete: false, 
      assignedDifficulty: Difficulty.MILD
    };
    setCurrentUser(demoUser);
    setIs2FAVerified(true);

    if (role === 'Admin') {
      setCurrentScreen(Screen.ADMIN_DASHBOARD);
    } else {
      setCurrentScreen(Screen.ASSESSMENT);
    }
    setProgressData([]);
  };

  const handle2FASuccess = () => {
    setIs2FAVerified(true);
    if (!currentUser?.assessmentComplete) {
      setCurrentScreen(Screen.ASSESSMENT);
    } else {
      // Check for focus areas if assessment complete
      setCurrentScreen(Screen.HOME); 
    }
  };

  const handleAssessmentComplete = (updatedProfile: UserProfile) => {
      setCurrentUser(updatedProfile);
      setDifficulty(updatedProfile.assignedDifficulty);
      // Go to Focus Selection after assessment
      setCurrentScreen(Screen.FOCUS_SELECT);
  };

  const handleFocusSave = async () => {
      if (selectedFocus.length === 0) return;
      
      const updatedUser = { ...currentUser!, focusAreas: selectedFocus };
      setCurrentUser(updatedUser);

      if (currentUser?.uid && currentUser.uid !== 'demo-user-123') {
          try {
              await setDoc(doc(db, 'users', currentUser.uid), { focusAreas: selectedFocus }, { merge: true });
          } catch (e) {
              console.error(e);
          }
      }
      setCurrentScreen(Screen.HOME);
  };

  const handleStartActivity = (type: 'TRACING' | 'READING' | 'SPELLING' | 'MEMORY') => {
    setSelectedActivityType(type);
    setCurrentScreen(Screen.DIFFICULTY_SELECT);
  };

  const confirmDifficultyAndStart = (diff: Difficulty) => {
    setDifficulty(diff); 
    switch (selectedActivityType) {
      case 'TRACING': setCurrentScreen(Screen.TRACING); break;
      case 'READING': setCurrentScreen(Screen.READING); break;
      case 'SPELLING': setCurrentScreen(Screen.SPELLING); break;
      case 'MEMORY': setCurrentScreen(Screen.MEMORY); break;
    }
  };

  const handleActivityComplete = async (type: 'Tracing' | 'Reading' | 'Spelling' | 'Memory', score: number) => {
    const newRecord: ProgressRecord = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
      activityType: type,
      score,
      details: `Level ${difficulty}`
    };
    
    setProgressData(prev => [...prev, newRecord]);

    if (currentUser?.uid && currentUser.uid !== 'demo-user-123') {
        try {
            const progressRef = collection(db, 'users', currentUser.uid, 'progress');
            await addDoc(progressRef, newRecord);
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    }
  };

  const isDifficultyLocked = (diff: Difficulty) => {
      if (!currentUser?.assignedDifficulty) return false;
      return diff !== currentUser.assignedDifficulty;
  };

  const toggleFocus = (area: string) => {
      if (selectedFocus.includes(area)) {
          setSelectedFocus(prev => prev.filter(f => f !== area));
      } else {
          setSelectedFocus(prev => [...prev, area]);
      }
  };

  const renderFocusSelection = () => (
      <ScrollView contentContainerStyle={styles.centerContainer}>
          <Target size={64} color="#9333EA" style={{ marginBottom: 20, marginTop: 40 }} />
          <Text style={styles.title}>Choose Your Focus</Text>
          <Text style={styles.subtitle}>What activities do you want to work on today?</Text>

          <View style={styles.focusGrid}>
              {['Writing', 'Reading', 'Spelling', 'Memory'].map((area) => (
                  <TouchableOpacity 
                    key={area}
                    onPress={() => toggleFocus(area)}
                    style={[
                        styles.focusCard, 
                        selectedFocus.includes(area) && styles.focusCardActive
                    ]}
                  >
                      {selectedFocus.includes(area) ? (
                          <CheckCircle size={32} color="white" fill="#22C55E" />
                      ) : (
                          <View style={styles.emptyCircle} />
                      )}
                      <Text style={[styles.focusLabel, selectedFocus.includes(area) && styles.focusLabelActive]}>
                          {area}
                      </Text>
                  </TouchableOpacity>
              ))}
          </View>

          <TouchableOpacity 
            onPress={handleFocusSave} 
            style={[styles.startBtn, selectedFocus.length === 0 && styles.disabledBtn]}
            disabled={selectedFocus.length === 0}
          >
              <Text style={styles.startBtnText}>Continue to Dashboard</Text>
              <ArrowRight color="white" size={20} />
          </TouchableOpacity>
      </ScrollView>
  );

  const renderDifficultySelection = () => (
    <ScrollView contentContainerStyle={styles.centerContainer}>
      <Text style={styles.title}>Your Learning Path</Text>
      <Text style={styles.subtitle}>Based on your assessment, we have unlocked the perfect level for you.</Text>

      <View style={styles.diffGrid}>
        {Object.values(Difficulty).map((diff) => {
          const locked = isDifficultyLocked(diff);
          return (
            <TouchableOpacity
              key={diff}
              disabled={locked}
              onPress={() => confirmDifficultyAndStart(diff)}
              style={[
                styles.diffCard,
                locked ? styles.diffCardLocked : styles.diffCardActive
              ]}
            >
              {locked && <View style={styles.lockOverlay}><Lock color="#9CA3AF" size={32} /></View>}
              <View style={styles.diffHeader}>
                <Text style={[styles.diffTitle, locked && { color: '#9CA3AF' }]}>{diff}</Text>
                {!locked && <Star color="#FACC15" fill="#FACC15" size={20} />}
              </View>
              <Text style={styles.diffDesc}>
                {diff === Difficulty.MILD && "Standard guides."}
                {diff === Difficulty.MODERATE && "Enhanced guides."}
                {diff === Difficulty.SEVERE && "High support."}
                {diff === Difficulty.PROFOUND && "Maximum support."}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <TouchableOpacity onPress={() => setCurrentScreen(Screen.CHILD_DASHBOARD)} style={styles.cancelLink}>
        <Text style={styles.linkText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderLanding = () => (
    <ScrollView contentContainerStyle={styles.centerContainer}>
      <View style={{ alignItems: 'flex-end', width: '100%', marginBottom: 20 }}>
          <TouchableOpacity onPress={handleSignOut} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <LogOut size={20} color="#6B7280" />
              <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
      </View>

      <View style={styles.landingHeader}>
          <Brain size={64} color="#4A90E2" />
          <Text style={styles.logoText}>LexiLearn</Text>
      </View>
      
      <View style={styles.menuGrid}>
        <TouchableOpacity onPress={() => setCurrentScreen(Screen.CHILD_DASHBOARD)} style={[styles.menuCard, { borderColor: '#4A90E2' }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
             <User size={48} color="#4A90E2" />
          </View>
          <Text style={styles.menuTitle}>Student Area</Text>
          <Text style={styles.menuSub}>Play Activities</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentScreen(Screen.LEARNING_JOURNEY)} style={[styles.menuCard, { borderColor: '#9333EA' }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
             <Map size={48} color="#9333EA" />
          </View>
          <Text style={styles.menuTitle}>Learning Journey</Text>
          <Text style={styles.menuSub}>View My Path</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentScreen(Screen.DASHBOARD)} style={[styles.menuCard, { borderColor: '#16A34A' }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
             <GraduationCap size={48} color="#16A34A" />
          </View>
          <Text style={styles.menuTitle}>Parent Dashboard</Text>
          <Text style={styles.menuSub}>View Analytics</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderChildDashboard = () => {
    // Filter activities based on selection
    const showTracing = selectedFocus.includes('Writing');
    const showReading = selectedFocus.includes('Reading');
    const showSpelling = selectedFocus.includes('Spelling');
    const showMemory = selectedFocus.includes('Memory');

    return (
        <ScrollView contentContainerStyle={styles.centerContainer}>
        <View style={styles.dashHeader}>
            <TouchableOpacity onPress={() => setCurrentScreen(Screen.HOME)} style={styles.backLink}>
                <ArrowLeft color="#6B7280" />
                <Text style={styles.backLinkText}>Home</Text>
            </TouchableOpacity>
            <Text style={styles.dashTitle}>Children's Activity</Text>
            <View style={{width: 40}} />
        </View>

        <Text style={styles.welcomeText}>Welcome, <Text style={styles.highlight}>{currentUser?.childName}</Text>!</Text>
        <View style={styles.levelTag}>
            <Text style={styles.levelTagText}>{difficulty} Level</Text>
        </View>

        <View style={styles.activityGrid}>
            {showTracing && (
                <TouchableOpacity onPress={() => handleStartActivity('TRACING')} style={styles.activityCard}>
                    <View style={[styles.actIcon, { backgroundColor: '#DBEAFE' }]}>
                        <PenTool size={32} color="#2563EB" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.actTitle}>Tracing</Text>
                        <Text style={styles.actSub}>Lines & Letters</Text>
                    </View>
                    <ChevronRight size={24} color="#9CA3AF" />
                </TouchableOpacity>
            )}

            {showReading && (
                <TouchableOpacity onPress={() => handleStartActivity('READING')} style={styles.activityCard}>
                    <View style={[styles.actIcon, { backgroundColor: '#DCFCE7' }]}>
                        <BookOpen size={32} color="#16A34A" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.actTitle}>Reading</Text>
                        <Text style={styles.actSub}>Pronunciation</Text>
                    </View>
                    <ChevronRight size={24} color="#9CA3AF" />
                </TouchableOpacity>
            )}

            {showSpelling && (
                <TouchableOpacity onPress={() => handleStartActivity('SPELLING')} style={styles.activityCard}>
                    <View style={[styles.actIcon, { backgroundColor: '#FEF9C3' }]}>
                        <Keyboard size={32} color="#CA8A04" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.actTitle}>Spelling</Text>
                        <Text style={styles.actSub}>Make Words</Text>
                    </View>
                    <ChevronRight size={24} color="#9CA3AF" />
                </TouchableOpacity>
            )}

            {showMemory && (
                <TouchableOpacity onPress={() => handleStartActivity('MEMORY')} style={styles.activityCard}>
                    <View style={[styles.actIcon, { backgroundColor: '#F3E8FF' }]}>
                        <Zap size={32} color="#9333EA" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.actTitle}>Memory</Text>
                        <Text style={styles.actSub}>Recall</Text>
                    </View>
                    <ChevronRight size={24} color="#9CA3AF" />
                </TouchableOpacity>
            )}
        </View>
        </ScrollView>
    );
  };

  const renderScreen = () => {
    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4A90E2" /></View>;

    switch (currentScreen) {
      case Screen.LOGIN: 
        return <LoginScreen onDemoLogin={handleDemoLogin} onSignUpClick={() => setCurrentScreen(Screen.SIGN_UP)} />;
      case Screen.SIGN_UP:
        return <SignUpScreen onBack={() => setCurrentScreen(Screen.LOGIN)} />;
      case Screen.TWO_FACTOR:
        return (
          <TwoFactorAuth 
            email={currentUser?.email || ''} 
            onVerify={handle2FASuccess} 
            onCancel={handleSignOut} 
          />
        );
      case Screen.ADMIN_DASHBOARD:
        return (
          <AdminDashboard 
            userEmail={currentUser?.email || 'admin'} 
            onExit={handleSignOut}
            isDemo={currentUser?.uid === 'demo-user-123'}
          />
        );
      case Screen.ASSESSMENT: return currentUser ? <AssessmentFlow user={currentUser} onComplete={handleAssessmentComplete} /> : <View />;
      case Screen.FOCUS_SELECT: return renderFocusSelection();
      case Screen.TRACING:
        return (
          <TracingActivity 
            items={TRACING_ITEMS} 
            difficulty={difficulty}
            onComplete={(score) => handleActivityComplete('Tracing', score)}
            onExit={() => setCurrentScreen(Screen.CHILD_DASHBOARD)}
          />
        );
      case Screen.READING:
        return (
          <ReadingActivity 
            items={READING_ITEMS} 
            difficulty={difficulty}
            onComplete={(score) => handleActivityComplete('Reading', score)}
            onExit={() => setCurrentScreen(Screen.CHILD_DASHBOARD)}
          />
        );
      case Screen.SPELLING:
        return (
          <SpellingActivity 
            items={SPELLING_ITEMS}
            difficulty={difficulty}
            onComplete={(score) => handleActivityComplete('Spelling', score)}
            onExit={() => setCurrentScreen(Screen.CHILD_DASHBOARD)}
          />
        );
      case Screen.MEMORY:
        return (
          <MemoryActivity 
            items={MEMORY_ITEMS}
            difficulty={difficulty}
            onComplete={(score) => handleActivityComplete('Memory', score)}
            onExit={() => setCurrentScreen(Screen.CHILD_DASHBOARD)}
          />
        );
      case Screen.DIFFICULTY_SELECT:
        return renderDifficultySelection();
      case Screen.CHILD_DASHBOARD:
        return renderChildDashboard();
      case Screen.DASHBOARD:
        return (
          <ParentDashboard 
            progressData={progressData}
            childName={currentUser?.childName || "Student"}
            currentDifficulty={difficulty}
            focusAreas={selectedFocus}
            onUpdateChildName={() => {}} 
            onExit={() => setCurrentScreen(Screen.HOME)}
          />
        );
      case Screen.LEARNING_JOURNEY:
          return currentUser ? <LearningJourney user={currentUser} onExit={() => setCurrentScreen(Screen.HOME)} /> : null;
      default:
        return renderLanding();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2D2D2D', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30, maxWidth: 300 },
  logoutText: { color: '#6B7280', fontWeight: 'bold' },
  landingHeader: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 40, fontWeight: 'bold', color: '#2D2D2D', marginTop: 10 },
  menuGrid: { width: '100%', gap: 20 },
  menuCard: { backgroundColor: 'white', padding: 30, borderRadius: 20, borderWidth: 2, alignItems: 'center', elevation: 2 },
  iconCircle: { padding: 20, borderRadius: 50, marginBottom: 15 },
  menuTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  menuSub: { color: '#6B7280', marginTop: 5 },
  diffGrid: { width: '100%', gap: 15 },
  diffCard: { padding: 20, borderRadius: 16, borderWidth: 2, backgroundColor: '#EFF6FF', borderColor: '#4A90E2' },
  diffCardLocked: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB', opacity: 0.6 },
  diffCardActive: { elevation: 3 },
  lockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(229,231,235,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  diffHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  diffTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  diffDesc: { color: '#6B7280', fontSize: 12 },
  cancelLink: { marginTop: 30 },
  linkText: { color: '#6B7280', fontWeight: 'bold' },
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 30 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  backLinkText: { color: '#6B7280', fontWeight: 'bold' },
  dashTitle: { fontSize: 20, fontWeight: 'bold' },
  welcomeText: { fontSize: 24, color: '#4B5563', marginBottom: 5 },
  highlight: { color: '#4A90E2', fontWeight: 'bold' },
  levelTag: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 30 },
  levelTagText: { color: '#2563EB', fontWeight: 'bold', fontSize: 12 },
  activityGrid: { width: '100%', gap: 15 },
  activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 2, gap: 15 },
  actIcon: { padding: 12, borderRadius: 16 },
  actTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  actSub: { color: '#6B7280', fontSize: 12 },
  
  // Focus Selection Styles
  focusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center', marginBottom: 30 },
  focusCard: { width: '45%', backgroundColor: 'white', padding: 20, borderRadius: 20, alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#E5E7EB' },
  focusCardActive: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
  emptyCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#D1D5DB' },
  focusLabel: { fontWeight: 'bold', color: '#6B7280' },
  focusLabelActive: { color: '#16A34A' },
  startBtn: { flexDirection: 'row', gap: 10, backgroundColor: '#4A90E2', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 4 },
  startBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#9CA3AF', elevation: 0 },
});
