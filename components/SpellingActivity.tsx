import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SpellingItem, Difficulty } from '../types';
import { ChevronLeft, ChevronRight, Volume2, RotateCcw, CheckCircle } from 'lucide-react-native';
import * as Speech from 'expo-speech';

interface SpellingActivityProps {
  items: SpellingItem[];
  difficulty: Difficulty;
  onComplete: (score: number) => void;
  onExit: () => void;
}

export const SpellingActivity: React.FC<SpellingActivityProps> = ({ items, difficulty, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLetters, setCurrentLetters] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<(string | null)[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  const currentItem = items[currentIndex];

  useEffect(() => {
    resetLevel();
  }, [currentIndex]);

  const resetLevel = () => {
    const letters = currentItem.word.split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setCurrentLetters(shuffled);
    setUserAnswer(new Array(letters.length).fill(null));
    setIsCorrect(false);
    setFeedback('');
  };

  const playTTS = (text: string) => {
    Speech.speak(text);
  };

  const handleLetterClick = (letter: string, index: number) => {
    if (isCorrect) return;

    const firstEmptyIndex = userAnswer.findIndex(val => val === null);
    if (firstEmptyIndex !== -1) {
      const newAnswer = [...userAnswer];
      newAnswer[firstEmptyIndex] = letter;
      setUserAnswer(newAnswer);

      const newLetters = [...currentLetters];
      newLetters.splice(index, 1);
      setCurrentLetters(newLetters);

      if (firstEmptyIndex === userAnswer.length - 1) {
        checkAnswer(newAnswer as string[]);
      }
    }
  };

  const handleSlotClick = (index: number) => {
    if (isCorrect) return;
    const letter = userAnswer[index];
    if (letter) {
      setCurrentLetters([...currentLetters, letter]);
      const newAnswer = [...userAnswer];
      newAnswer[index] = null;
      setUserAnswer(newAnswer);
      setFeedback('');
    }
  };

  const checkAnswer = (answer: string[]) => {
    const joined = answer.join('');
    if (joined === currentItem.word) {
      setIsCorrect(true);
      setFeedback('Correct!');
      onComplete(100);
    } else {
      setFeedback('Try again!');
    }
  };

  const nextLevel = () => {
    if (currentIndex < items.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevLevel = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
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
            <Text style={styles.title}>Spelling Level {currentIndex + 1}</Text>
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

        <View style={styles.controls}>
            <TouchableOpacity onPress={() => playTTS(currentItem.word)} style={styles.ttsBtn}>
                <Volume2 size={32} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => playTTS(currentItem.hint)} style={styles.hintBtn}>
                <Text style={styles.hintText}>Hint: {currentItem.hint}</Text>
            </TouchableOpacity>
        </View>

        {/* Slots */}
        <View style={styles.slotsContainer}>
            {userAnswer.map((char, idx) => (
                <TouchableOpacity 
                    key={idx} 
                    onPress={() => handleSlotClick(idx)}
                    style={[
                        styles.slot,
                        char ? styles.filledSlot : styles.emptySlot,
                        isCorrect && styles.correctSlot
                    ]}
                >
                    <Text style={[styles.slotText, isCorrect && styles.correctText]}>{char}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {feedback !== '' && (
            <View style={styles.feedbackRow}>
                {isCorrect && <CheckCircle size={24} color="#16A34A" />}
                <Text style={[styles.feedbackText, isCorrect ? styles.feedbackSuccess : styles.feedbackError]}>
                    {feedback}
                </Text>
            </View>
        )}

        {/* Bank */}
        <View style={styles.bankContainer}>
            {currentLetters.map((letter, idx) => (
                <TouchableOpacity 
                    key={`${letter}-${idx}`} 
                    onPress={() => handleLetterClick(letter, idx)}
                    disabled={isCorrect}
                    style={styles.bankBtn}
                >
                    <Text style={styles.bankText}>{letter}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <TouchableOpacity onPress={resetLevel} style={styles.resetBtn}>
            <RotateCcw size={18} color="#6B7280" />
            <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
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
    card: { backgroundColor: 'white', borderRadius: 24, padding: 20, borderWidth: 4, borderColor: '#FEF08A', flex: 1, alignItems: 'center' },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
    navBtn: { padding: 12, backgroundColor: '#F9FAFB', borderRadius: 25 },
    disabledBtn: { opacity: 0.5 },
    controls: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30 },
    ttsBtn: { padding: 16, backgroundColor: '#DBEAFE', borderRadius: 30 },
    hintBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#FEF9C3', borderRadius: 24 },
    hintText: { color: '#854D0E', fontWeight: 'bold' },
    slotsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 30 },
    slot: { width: 56, height: 64, borderBottomWidth: 4, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    emptySlot: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
    filledSlot: { backgroundColor: '#EFF6FF', borderColor: '#60A5FA' },
    correctSlot: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
    slotText: { fontSize: 32, fontWeight: 'bold', color: '#1E40AF' },
    correctText: { color: '#166534' },
    feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
    feedbackText: { fontSize: 20, fontWeight: 'bold' },
    feedbackSuccess: { color: '#16A34A' },
    feedbackError: { color: '#F97316' },
    bankContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', backgroundColor: '#F9FAFB', padding: 20, borderRadius: 16, width: '100%' },
    bankBtn: { width: 56, height: 56, backgroundColor: 'white', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
    bankText: { fontSize: 24, fontWeight: 'bold', color: '#374151' },
    resetBtn: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 20 },
    resetText: { color: '#6B7280', fontWeight: 'bold' }
});