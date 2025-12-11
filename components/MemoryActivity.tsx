import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MemoryItem, Difficulty } from '../types';
import { ChevronLeft, ChevronRight, Play, CheckCircle, AlertCircle, Delete } from 'lucide-react-native';

interface MemoryActivityProps {
  items: MemoryItem[];
  difficulty: Difficulty;
  onComplete: (score: number) => void;
  onExit: () => void;
}

export const MemoryActivity: React.FC<MemoryActivityProps> = ({ items, difficulty, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'IDLE' | 'SHOW' | 'INPUT' | 'RESULT'>('IDLE');
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const currentItem = items[currentIndex];
  const isNumeric = currentItem.type === 'Numbers';

  const getDisplayTime = () => {
    switch(difficulty) {
      case Difficulty.MILD: return 2000;
      case Difficulty.MODERATE: return 3000;
      case Difficulty.SEVERE: return 4000;
      case Difficulty.PROFOUND: return 5000;
      default: return 3000;
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'SHOW' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 100) {
            setPhase('INPUT');
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const startLevel = () => {
    setInputValue('');
    setTimeLeft(getDisplayTime());
    setPhase('SHOW');
  };

  const handleKeypadPress = (key: string) => {
    if (key === 'DEL') {
        setInputValue(prev => prev.slice(0, -1));
    } else if (key === 'SUBMIT') {
        handleSubmit();
    } else {
        setInputValue(prev => prev + key);
    }
  };

  const handleSubmit = () => {
    setPhase('RESULT');
    const normalizedInput = inputValue.replace(/\s/g, '').toUpperCase();
    const normalizedTarget = currentItem.sequence.replace(/\s/g, '').toUpperCase();
    
    if (normalizedInput === normalizedTarget) {
      onComplete(100);
    } else {
      onComplete(50);
    }
  };

  const nextLevel = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setPhase('IDLE');
      setInputValue('');
    }
  };

  const prevLevel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setPhase('IDLE');
      setInputValue('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.backBtn}>
          <ChevronLeft size={24} color="#4B5563" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
            <Text style={styles.diffLabel}>{difficulty} Difficulty</Text>
            <Text style={styles.title}>Memory Level {currentIndex + 1}</Text>
        </View>
        <View style={{width: 40}} /> 
      </View>

      <View style={styles.card}>
         {/* Nav */}
         <View style={styles.navRow}>
            <TouchableOpacity onPress={prevLevel} disabled={currentIndex === 0} style={[styles.navBtn, currentIndex === 0 && styles.disabledBtn]}>
                <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity onPress={nextLevel} disabled={currentIndex === items.length - 1} style={[styles.navBtn, currentIndex === items.length - 1 && styles.disabledBtn]}>
                <ChevronRight size={24} color="#374151" />
            </TouchableOpacity>
        </View>

        {phase === 'IDLE' && (
            <View style={styles.centerContent}>
                <Text style={styles.promptText}>Remember the sequence...</Text>
                <TouchableOpacity onPress={startLevel} style={styles.playBtn}>
                    <Play size={48} color="white" fill="white" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                <Text style={styles.startLabel}>Tap to Start</Text>
            </View>
        )}

        {phase === 'SHOW' && (
            <View style={styles.centerContent}>
                <View style={styles.seqContainer}>
                    {currentItem.sequence.split(' ').map((char, i) => (
                        <View key={i} style={styles.seqCard}>
                            <Text style={styles.seqText}>{char}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${(timeLeft / getDisplayTime()) * 100}%` }]} />
                </View>
            </View>
        )}

        {phase === 'INPUT' && (
            <View style={styles.inputContainer}>
                <View style={styles.displayArea}>
                    {inputValue.split('').map((char, i) => (
                        <Text key={i} style={styles.displayText}>{char}</Text>
                    ))}
                </View>
                
                {isNumeric ? (
                    <View style={styles.keypad}>
                        {[1,2,3,4,5,6,7,8,9].map(n => (
                            <TouchableOpacity key={n} onPress={() => handleKeypadPress(n.toString())} style={styles.key}>
                                <Text style={styles.keyText}>{n}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setInputValue('')} style={[styles.key, styles.clearKey]}>
                            <Text style={styles.clearKeyText}>C</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleKeypadPress('0')} style={styles.key}>
                             <Text style={styles.keyText}>0</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleKeypadPress('DEL')} style={[styles.key, styles.delKey]}>
                            <Delete size={24} color="#4B5563" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text style={styles.infoText}>Please use keyboard (Not implemented for letters in demo)</Text>
                )}
                
                <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
                    <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
            </View>
        )}

        {phase === 'RESULT' && (
            <View style={styles.centerContent}>
                {inputValue.replace(/\s/g, '').toUpperCase() === currentItem.sequence.replace(/\s/g, '').toUpperCase() ? (
                    <View style={styles.resultBox}>
                        <CheckCircle size={64} color="#22C55E" style={{ marginBottom: 16 }} />
                        <Text style={[styles.resultTitle, { color: '#16A34A' }]}>Excellent!</Text>
                    </View>
                ) : (
                    <View style={styles.resultBox}>
                         <AlertCircle size={64} color="#F97316" style={{ marginBottom: 16 }} />
                         <Text style={[styles.resultTitle, { color: '#F97316' }]}>So Close!</Text>
                         <View style={styles.correctBox}>
                            <Text style={styles.correctText}>{currentItem.sequence}</Text>
                         </View>
                    </View>
                )}
                <TouchableOpacity onPress={nextLevel} style={styles.nextBtn}>
                    <Text style={styles.nextBtnText}>Next Challenge</Text>
                </TouchableOpacity>
            </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    backBtn: { flexDirection: 'row', alignItems: 'center' },
    backText: { fontWeight: 'bold', color: '#4B5563', marginLeft: 4 },
    headerCenter: { alignItems: 'center' },
    diffLabel: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    card: { backgroundColor: 'white', borderRadius: 24, padding: 20, borderWidth: 4, borderColor: '#F3E8FF', flex: 1 },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
    navBtn: { padding: 12, backgroundColor: '#F9FAFB', borderRadius: 25 },
    disabledBtn: { opacity: 0.5 },
    centerContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    promptText: { fontSize: 20, color: '#4B5563', marginBottom: 24 },
    playBtn: { width: 96, height: 96, backgroundColor: '#9333EA', borderRadius: 48, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    startLabel: { marginTop: 16, color: '#9333EA', fontWeight: 'bold', fontSize: 18 },
    seqContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 40 },
    seqCard: { width: 64, height: 80, backgroundColor: 'white', borderBottomWidth: 4, borderColor: '#8B5CF6', borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    seqText: { fontSize: 32, fontWeight: 'bold', color: '#1F2937' },
    progressBg: { width: '100%', height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#9333EA' },
    inputContainer: { alignItems: 'center', width: '100%' },
    displayArea: { flexDirection: 'row', gap: 4, minHeight: 60, marginBottom: 24, padding: 16, backgroundColor: '#F9FAFB', borderRadius: 12, width: '100%', justifyContent: 'center' },
    displayText: { fontSize: 32, fontWeight: 'bold', color: '#9333EA' },
    keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 280, marginBottom: 24 },
    key: { width: 70, height: 70, backgroundColor: 'white', borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    keyText: { fontSize: 24, fontWeight: 'bold', color: '#374151' },
    clearKey: { backgroundColor: '#FEE2E2' },
    clearKeyText: { color: '#DC2626', fontWeight: 'bold', fontSize: 20 },
    delKey: { backgroundColor: '#F3F4F6' },
    infoText: { color: '#9CA3AF' },
    submitBtn: { width: '100%', backgroundColor: '#9333EA', padding: 16, borderRadius: 16, alignItems: 'center' },
    submitText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    resultBox: { alignItems: 'center', marginBottom: 30 },
    resultTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
    correctBox: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 8 },
    correctText: { fontSize: 20, fontWeight: 'bold', color: '#4B5563' },
    nextBtn: { backgroundColor: '#1F2937', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
    nextBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});