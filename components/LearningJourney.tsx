import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { UserProfile, Difficulty } from '../types';
import { Star, Lock, CheckCircle } from 'lucide-react-native';

export const LearningJourney: React.FC<{ user: UserProfile, onExit: () => void }> = ({ user, onExit }) => {
    const levels = [Difficulty.PROFOUND, Difficulty.SEVERE, Difficulty.MODERATE, Difficulty.MILD];
    const currentLevelIndex = levels.indexOf(user.assignedDifficulty);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Learning Journey</Text>
                <TouchableOpacity onPress={onExit}><Text style={styles.close}>Close</Text></TouchableOpacity>
            </View>

            <View style={styles.pathContainer}>
                {levels.map((level, idx) => {
                    const isCurrent = idx === currentLevelIndex;
                    const isLocked = idx > currentLevelIndex;
                    return (
                        <View key={level} style={[styles.node, isCurrent && styles.activeNode, isLocked && styles.lockedNode]}>
                             {isLocked ? <Lock color="#999" /> : isCurrent ? <Star fill="#FACC15" color="#FACC15" /> : <CheckCircle color="green" />}
                             <Text style={styles.nodeTitle}>{level}</Text>
                        </View>
                    )
                })}
            </View>
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDFBF7', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, marginTop: 30 },
    title: { fontSize: 28, fontWeight: 'bold' },
    close: { fontSize: 16, color: 'blue' },
    pathContainer: { gap: 20, paddingLeft: 20, borderLeftWidth: 2, borderColor: '#DDD' },
    node: { padding: 20, backgroundColor: 'white', borderRadius: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
    activeNode: { borderColor: '#4A90E2', borderWidth: 2, elevation: 4 },
    lockedNode: { opacity: 0.5 },
    nodeTitle: { fontSize: 18, fontWeight: 'bold' }
});