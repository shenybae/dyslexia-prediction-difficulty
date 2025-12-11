
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { ProgressRecord, Difficulty } from '../types';
import { Edit2, Save, Shield, ArrowLeft, Target, Clock, Calendar } from 'lucide-react-native';

interface DashboardProps {
  progressData: ProgressRecord[];
  childName: string;
  currentDifficulty: Difficulty;
  focusAreas?: string[];
  onUpdateChildName: (name: string) => void;
  onExit: () => void;
}

export const ParentDashboard: React.FC<DashboardProps> = ({ progressData, childName, currentDifficulty, focusAreas, onUpdateChildName, onExit }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(childName);

  const handleSaveName = () => {
    onUpdateChildName(tempName);
    setIsEditingName(false);
  };

  const data = progressData.length > 0 ? progressData : [
    { date: 'Mon', activityType: 'Tracing', score: 65, details: 'Lines' },
    { date: 'Tue', activityType: 'Reading', score: 70, details: 'Words' },
    { date: 'Wed', activityType: 'Spelling', score: 60, details: 'CVC' },
    { date: 'Thu', activityType: 'Reading', score: 82, details: 'Sentences' },
    { date: 'Fri', activityType: 'Memory', score: 90, details: 'Numbers' },
  ];

  const avgScore = Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length);

  return (
    <ScrollView style={styles.container}>
       <View style={styles.content}>
         {/* Header */}
         <View style={styles.header}>
            <View style={styles.titleRow}>
                {isEditingName ? (
                    <View style={styles.editRow}>
                        <TextInput 
                            value={tempName} 
                            onChangeText={setTempName}
                            style={styles.nameInput}
                            autoFocus
                        />
                        <TouchableOpacity onPress={handleSaveName} style={styles.saveBtn}>
                            <Save size={20} color="#15803D" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.nameBtn}>
                        <Text style={styles.nameText}>{childName}'s Progress</Text>
                        <Edit2 size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity onPress={onExit} style={styles.backBtn}>
                <ArrowLeft size={18} color="#374151" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
         </View>

         {/* Stats Cards */}
         <View style={styles.statsGrid}>
             <View style={[styles.statCard, { borderLeftColor: '#4A90E2' }]}>
                 <Text style={styles.statLabel}>Avg Score</Text>
                 <Text style={styles.statValue}>{avgScore || 0}%</Text>
             </View>
             <View style={[styles.statCard, { borderLeftColor: '#22C55E' }]}>
                 <Text style={styles.statLabel}>Activities</Text>
                 <Text style={styles.statValue}>{data.length}</Text>
             </View>
             <View style={[styles.statCard, { borderLeftColor: '#EAB308' }]}>
                 <Text style={styles.statLabel}>Current Level</Text>
                 <Text style={styles.statValue}>{currentDifficulty}</Text>
             </View>
         </View>

        {/* Focus Areas */}
        {focusAreas && focusAreas.length > 0 && (
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <Target size={20} color="#9333EA" />
                    <Text style={styles.sectionTitle}>Focus Areas</Text>
                </View>
                <View style={styles.focusGrid}>
                    {focusAreas.map((area, idx) => (
                        <View key={idx} style={styles.focusChip}>
                            <Text style={styles.focusText}>{area}</Text>
                        </View>
                    ))}
                </View>
            </View>
        )}

         {/* Simple Bar Chart */}
         <View style={styles.chartCard}>
             <Text style={styles.chartTitle}>Progress Over Time</Text>
             <View style={styles.chartContainer}>
                {data.slice(-7).map((entry, index) => (
                    <View key={index} style={styles.barGroup}>
                         <View style={styles.barTrack}>
                             <View 
                                style={[
                                    styles.barFill, 
                                    { height: `${entry.score}%`, backgroundColor: entry.score > 70 ? '#22C55E' : '#4A90E2' }
                                ]} 
                             />
                         </View>
                         <Text style={styles.barLabel}>{typeof entry.date === 'string' ? entry.date.slice(0,3) : ''}</Text>
                    </View>
                ))}
             </View>
         </View>

         {/* Performance by Session */}
         <View style={styles.sectionCard}>
             <View style={styles.sectionHeader}>
                 <Clock size={20} color="#1F2937" />
                 <Text style={styles.sectionTitle}>Recent Performance</Text>
             </View>
             {data.slice(-5).reverse().map((record, index) => (
                 <View key={index} style={styles.sessionRow}>
                     <View>
                        <Text style={styles.sessionType}>{record.activityType}</Text>
                        <View style={styles.sessionDateRow}>
                            <Calendar size={12} color="#9CA3AF" />
                            <Text style={styles.sessionDate}>{record.date}</Text>
                        </View>
                     </View>
                     <View style={styles.scoreBadge}>
                         <Text style={[styles.scoreText, { color: record.score >= 80 ? '#16A34A' : record.score >= 60 ? '#D97706' : '#DC2626' }]}>
                             {record.score}%
                         </Text>
                     </View>
                 </View>
             ))}
         </View>

         {/* Insights */}
         <View style={styles.insightCard}>
             <Shield color="#2563EB" size={24} style={{ marginTop: 2 }} />
             <View style={{ flex: 1 }}>
                 <Text style={styles.insightTitle}>AI Insights</Text>
                 <Text style={styles.insightText}>
                    {childName} is showing consistent effort. 
                    {avgScore > 80 ? " Excellent performance! Consider increasing difficulty." : " Keep practicing to improve accuracy."}
                 </Text>
             </View>
         </View>
       </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7' },
    content: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    nameInput: { fontSize: 24, fontWeight: 'bold', borderBottomWidth: 2, borderColor: '#4A90E2', color: '#1F2937', minWidth: 150 },
    saveBtn: { backgroundColor: '#DCFCE7', padding: 8, borderRadius: 8 },
    nameBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    nameText: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    backText: { fontWeight: 'bold', color: '#374151' },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 16, borderLeftWidth: 6, elevation: 2 },
    statLabel: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
    
    // Section Cards
    sectionCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, elevation: 2, marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    
    // Focus Areas
    focusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    focusChip: { backgroundColor: '#F3E8FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D8B4FE' },
    focusText: { color: '#7E22CE', fontWeight: 'bold' },

    // Performance List
    sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F3F4F6' },
    sessionType: { fontWeight: 'bold', color: '#374151', fontSize: 16 },
    sessionDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    sessionDate: { color: '#9CA3AF', fontSize: 12 },
    scoreBadge: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#F9FAFB', borderRadius: 12 },
    scoreText: { fontWeight: 'bold' },

    chartCard: { backgroundColor: 'white', padding: 24, borderRadius: 16, elevation: 2, marginBottom: 20 },
    chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
    chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150 },
    barGroup: { alignItems: 'center', flex: 1 },
    barTrack: { height: '100%', width: 20, backgroundColor: '#F3F4F6', borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
    barFill: { width: '100%', borderRadius: 10 },
    barLabel: { marginTop: 8, fontSize: 12, color: '#6B7280' },
    insightCard: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, padding: 20, borderRadius: 16, flexDirection: 'row', gap: 12 },
    insightTitle: { fontWeight: 'bold', color: '#1E40AF', marginBottom: 4 },
    insightText: { color: '#1E3A8A', lineHeight: 20 }
});
