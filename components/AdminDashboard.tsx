import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { GuardianApplication } from '../types';
import { db } from '../firebaseConfig';
// @ts-ignore
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Shield, CheckCircle, XCircle, LogOut, Baby } from 'lucide-react-native';

interface AdminDashboardProps {
  userEmail: string;
  onExit: () => void;
  isDemo: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userEmail, onExit, isDemo }) => {
  const [applications, setApplications] = useState<GuardianApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('PENDING');

  const MOCK_APPS: GuardianApplication[] = [
    {
      id: 'mock1',
      guardianName: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      childName: 'Timmy',
      childAge: '8',
      relationship: 'Mother',
      notes: 'Timmy struggles with b/d reversals.',
      status: 'PENDING',
      dateApplied: new Date().toISOString()
    },
    {
      id: 'mock2',
      guardianName: 'Michael Chen',
      email: 'm.chen@example.com',
      childName: 'Lily',
      childAge: '10',
      relationship: 'Father',
      notes: 'Mild dyslexia.',
      status: 'PENDING',
      dateApplied: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    if (isDemo) {
      setTimeout(() => {
        setApplications(MOCK_APPS);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const q = query(collection(db, 'applications'), orderBy('dateApplied', 'desc'));
      const snapshot = await getDocs(q);
      const apps = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as GuardianApplication));
      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    if (isDemo) {
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      if (newStatus === 'APPROVED') {
        Alert.alert("DEMO", "Application approved. Email sent.");
      }
      return;
    }

    try {
      const appRef = doc(db, 'applications', appId);
      await updateDoc(appRef, { status: newStatus });
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter === 'ALL') return true;
    return app.status === filter;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
            <View style={styles.profileSection}>
                <View style={styles.iconBg}>
                    <Shield color="white" size={24} />
                </View>
                <View>
                    <Text style={styles.headerTitle}>Admin</Text>
                    <Text style={styles.headerSubtitle}>{userEmail}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={onExit} style={styles.logoutButton}>
                <LogOut size={20} color="#374151" />
            </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.bgBlue]}>
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={styles.statValueBlue}>{applications.filter(a => a.status === 'PENDING').length}</Text>
            </View>
            <View style={[styles.statCard, styles.bgGreen]}>
                <Text style={styles.statLabelGreen}>Users</Text>
                <Text style={styles.statValueGreen}>{applications.filter(a => a.status === 'APPROVED').length}</Text>
            </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['PENDING', 'APPROVED', 'ALL'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f as any)}
              style={[styles.filterChip, filter === f ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={[styles.chipText, filter === f ? styles.textWhite : styles.textGray]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.listContainer}>
           {loading ? (
             <ActivityIndicator size="large" color="#4A90E2" style={{marginTop: 40}} />
           ) : filteredApps.length === 0 ? (
             <View style={styles.emptyState}>
               <Text style={styles.emptyText}>No applications found.</Text>
             </View>
           ) : (
             <View style={styles.listContent}>
                {filteredApps.map((app) => (
                  <View key={app.id || Math.random()} style={styles.appCard}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.guardianName}>{app.guardianName}</Text>
                            <Text style={styles.guardianEmail}>{app.email}</Text>
                        </View>
                        <View style={[styles.statusBadge, app.status === 'PENDING' ? styles.badgeBlue : app.status === 'APPROVED' ? styles.badgeGreen : styles.badgeRed]}>
                            <Text style={[styles.badgeText, app.status === 'PENDING' ? styles.textBlue : app.status === 'APPROVED' ? styles.textGreen : styles.textRed]}>{app.status}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.childInfoCard}>
                        <Text style={styles.childLabel}><Baby size={12} /> Child Profile</Text>
                        <Text style={styles.childDetails}>{app.childName} ({app.childAge})</Text>
                        <Text style={styles.relationshipText}>{app.relationship}</Text>
                        {app.notes ? <Text style={styles.notesText}>{app.notes}</Text> : null}
                    </View>

                    {app.status === 'PENDING' && (
                        <View style={styles.actionRow}>
                             <TouchableOpacity 
                               onPress={() => app.id && handleStatusChange(app.id, 'APPROVED')}
                               style={styles.approveButton}
                             >
                               <CheckCircle size={16} color="white" />
                               <Text style={styles.buttonTextWhite}>Approve</Text>
                             </TouchableOpacity>
                             <TouchableOpacity 
                               onPress={() => app.id && handleStatusChange(app.id, 'REJECTED')}
                               style={styles.rejectButton}
                             >
                               <XCircle size={16} color="#ef4444" />
                               <Text style={styles.buttonTextRed}>Reject</Text>
                             </TouchableOpacity>
                        </View>
                    )}
                  </View>
                ))}
             </View>
           )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  bgBlue: { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
  bgGreen: { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
    textTransform: 'uppercase',
  },
  statValueBlue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  statLabelGreen: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#22C55E',
    textTransform: 'uppercase',
  },
  statValueGreen: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#15803D',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#1F2937' },
  chipInactive: { backgroundColor: '#F3F4F6' },
  chipText: { fontSize: 12, fontWeight: 'bold' },
  textWhite: { color: 'white' },
  textGray: { color: '#4B5563' },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    gap: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#9CA3AF',
  },
  appCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  guardianName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  guardianEmail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeBlue: { backgroundColor: '#EFF6FF' },
  badgeGreen: { backgroundColor: '#F0FDF4' },
  badgeRed: { backgroundColor: '#FEF2F2' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  textBlue: { color: '#1D4ED8' },
  textGreen: { color: '#15803D' },
  textRed: { color: '#B91C1C' },
  childInfoCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  childLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  childDetails: {
    fontSize: 14,
    fontWeight: '500',
  },
  relationshipText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
    borderLeftWidth: 2,
    borderColor: '#D1D5DB',
    paddingLeft: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  buttonTextWhite: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonTextRed: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
});
