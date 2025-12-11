import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { ReadingItem, Difficulty } from '../types';
import { Mic, Volume2, Square, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { checkPronunciation } from '../services/gemini';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

interface ReadingActivityProps {
  items: ReadingItem[];
  difficulty: Difficulty;
  onComplete: (score: number) => void;
  onExit: () => void;
}

export const ReadingActivity: React.FC<ReadingActivityProps> = ({ items, onComplete, onExit, difficulty }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{score: number, text: string, breakdown?: string} | null>(null);

  const currentItem = items[currentIndex];
  const difficultyConfig = currentItem.difficultyConfig?.[difficulty];
  const activeWord = difficultyConfig?.word || currentItem.word;
  const activeSentence = difficultyConfig?.sentence || currentItem.sentence;

  const speak = (text: string) => {
    Speech.speak(text, { rate: 0.8 });
  };

  const startRecording = async () => {
    setFeedback(null);
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
      } else {
        Alert.alert("Permission needed", "Microphone access is required.");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setRecording(null);
    setIsProcessing(true);
    try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI(); 
        if (uri) {
            const result = await checkPronunciation(uri, activeWord);
            setFeedback({
                score: result.score,
                text: result.feedback,
                breakdown: result.phoneticBreakdown
            });
            onComplete(result.score);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsProcessing(false);
    }
  };

  const nextWord = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFeedback(null);
    }
  };

  const prevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFeedback(null);
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
            <Text style={styles.title}>Reading Level {currentIndex + 1}</Text>
        </View>
        <View style={{width: 40}} /> 
      </View>

      <View style={styles.card}>
        {/* Navigation */}
        <View style={styles.navRow}>
            <TouchableOpacity onPress={prevWord} disabled={currentIndex === 0} style={[styles.navBtn, currentIndex === 0 && styles.disabledBtn]}>
                <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity onPress={nextWord} disabled={currentIndex === items.length - 1} style={[styles.navBtn, currentIndex === items.length - 1 && styles.disabledBtn]}>
                <ChevronRight size={24} color="#374151" />
            </TouchableOpacity>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.word}>{activeWord}</Text>
          <Text style={styles.sentence}>{activeSentence}</Text>
        </View>

        <View style={styles.speakControls}>
           <TouchableOpacity onPress={() => speak(activeWord)} style={styles.speakBtn}>
              <View style={[styles.iconCircle, { backgroundColor: '#4A90E2' }]}>
                <Volume2 size={24} color="white" />
              </View>
              <Text style={styles.speakLabel}>Word</Text>
           </TouchableOpacity>

           <TouchableOpacity onPress={() => speak(activeSentence)} style={styles.speakBtn}>
              <View style={[styles.iconCircle, { backgroundColor: '#9333EA' }]}>
                <Volume2 size={24} color="white" />
              </View>
              <Text style={styles.speakLabel}>Sentence</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.actionContainer}>
          {!recording ? (
            <TouchableOpacity 
              onPress={startRecording}
              disabled={isProcessing}
              style={[styles.recordBtn, isProcessing && styles.disabledBtn]}
            >
              {isProcessing ? <ActivityIndicator color="white" /> : <Mic size={28} color="white" />}
              <Text style={styles.recordText}>{isProcessing ? 'Processing...' : 'Tap to Read'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={stopRecording}
              style={styles.stopBtn}
            >
              <Square size={28} color="white" fill="white" />
              <Text style={styles.recordText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>

        {feedback && (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackTitle}>Feedback</Text>
              <Text style={[styles.feedbackScore, { color: feedback.score > 80 ? '#16A34A' : '#F97316' }]}>
                {feedback.score}/100
              </Text>
            </View>
            <Text style={styles.feedbackText}>{feedback.text}</Text>
            {feedback.breakdown && (
              <View style={styles.phoneticsBox}>
                <Text style={styles.phoneticsText}>Phonetics: {feedback.breakdown}</Text>
              </View>
            )}
             <TouchableOpacity onPress={nextWord} style={styles.nextLink}>
                  <Text style={styles.nextLinkText}>Next Word</Text>
                  <ArrowRight size={16} color="#4A90E2" />
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
  card: { backgroundColor: 'white', borderRadius: 24, padding: 20, borderWidth: 4, borderColor: '#E8F5E9', flex: 1, alignItems: 'center' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  navBtn: { padding: 12, backgroundColor: '#F9FAFB', borderRadius: 25 },
  disabledBtn: { opacity: 0.5 },
  textContainer: { alignItems: 'center', marginVertical: 30 },
  word: { fontSize: 48, fontWeight: 'bold', color: '#4A90E2', marginBottom: 10, textAlign: 'center' },
  sentence: { fontSize: 18, color: '#4B5563', textAlign: 'center' },
  speakControls: { flexDirection: 'row', gap: 30, marginBottom: 40 },
  speakBtn: { alignItems: 'center', gap: 8 },
  iconCircle: { padding: 16, borderRadius: 30, elevation: 4 },
  speakLabel: { fontSize: 12, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase' },
  actionContainer: { marginBottom: 30 },
  recordBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#22C55E', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, elevation: 4 },
  stopBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EF4444', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, elevation: 4 },
  recordText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  feedbackCard: { backgroundColor: '#FFF9C4', padding: 16, borderRadius: 16, width: '100%', borderWidth: 2, borderColor: '#FEF08A' },
  feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  feedbackTitle: { fontWeight: 'bold', color: '#1F2937' },
  feedbackScore: { fontSize: 18, fontWeight: 'bold' },
  feedbackText: { color: '#1F2937', marginBottom: 8 },
  phoneticsBox: { backgroundColor: 'rgba(255,255,255,0.6)', padding: 8, borderRadius: 8, marginBottom: 8 },
  phoneticsText: { fontSize: 12, fontFamily: 'Courier', color: '#4B5563' },
  nextLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 4 },
  nextLinkText: { color: '#4A90E2', fontWeight: 'bold', fontSize: 14 }
});