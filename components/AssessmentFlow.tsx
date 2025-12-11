import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Brain, Clock, CheckCircle, ArrowRight, Eye, Volume2, Trophy, Star, Delete } from 'lucide-react-native';
import { Difficulty, UserProfile } from '../types';
// @ts-ignore
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import * as Speech from 'expo-speech';

interface AssessmentFlowProps {
  user: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

const TASKS = [
  'Word Recognition Speed',
  'Letter Accuracy',
  'Phoneme Matching',
  'Word Sequencing',
  'Reading Comprehension',
  'Working Memory Span',
  'Visual Processing Speed',
  'Spelling Recognition'
];

export const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ user, onComplete }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [scores, setScores] = useState<number[]>(new Array(8).fill(0));
  const [isProcessing, setIsProcessing] = useState(false);
  const [calculatedProfile, setCalculatedProfile] = useState<UserProfile | null>(null);
  
  // Task State
  const [subStep, setSubStep] = useState(0);
  const [gameState, setGameState] = useState<'INTRO' | 'ACTIVE' | 'FEEDBACK' | 'SUMMARY'>('INTRO');
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]); 
  
  // Refs
  const startTimeRef = useRef<number>(0);

  // ==============================================================================
  // DATASETS (Truncated for brevity, normally same as before)
  // ==============================================================================
  const task1Data = [
    { target: 'THEY', options: ['THEY', 'THEM', 'THEN', 'THAT'] },
    { target: 'WENT', options: ['WANT', 'WENT', 'SEND', 'BENT'] },
    { target: 'WITH', options: ['WISH', 'WITH', 'WHICH', 'WILT'] },
    { target: 'STOP', options: ['SPOT', 'SLOP', 'STOP', 'STEP'] },
    { target: 'VERY', options: ['VARY', 'VERY', 'EVER', 'VEER'] },
    { target: 'HERE', options: ['HEAR', 'HERE', 'HERD', 'HARE'] },
    { target: 'FROM', options: ['FORM', 'FARM', 'FROM', 'FOAM'] },
    { target: 'LOOK', options: ['LUCK', 'LOOK', 'LOCK', 'LACK'] },
    { target: 'GOOD', options: ['GOAD', 'GOLD', 'GOOD', 'FOOD'] },
    { target: 'HAVE', options: ['HAVE', 'HATE', 'HIVE', 'HOVE'] },
    { target: 'SOME', options: ['SAME', 'SOME', 'COME', 'SUMS'] },
    { target: 'SAID', options: ['SAND', 'SAID', 'SAD', 'SEED'] },
    { target: 'WERE', options: ['WEAR', 'WIRE', 'WERE', 'WHERE'] },
    { target: 'THAT', options: ['THIS', 'THAT', 'WHAT', 'THEN'] },
    { target: 'YOUR', options: ['YEAR', 'YOUR', 'YOU', 'YORE'] },
    { target: 'WHEN', options: ['THEN', 'WHEN', 'WHOM', 'WINE'] },
    { target: 'MAKE', options: ['MADE', 'MAKE', 'CAKE', 'LAKE'] },
    { target: 'LIKE', options: ['LICK', 'LIKE', 'LACK', 'LOOK'] },
    { target: 'INTO', options: ['ONTO', 'INTO', 'UNTIL', 'ANTI'] },
    { target: 'TIME', options: ['TAME', 'TIME', 'TEAM', 'DIME'] }
  ];

  const task2Data = [
    { q: 'b', options: ['d', 'b', 'p', 'q'] },
    { q: 'd', options: ['b', 'd', 'q', 'p'] },
    { q: 'p', options: ['q', 'p', 'g', 'b'] },
    { q: 'q', options: ['p', 'g', 'q', 'b'] },
    { q: 'm', options: ['w', 'n', 'm', 'u'] },
    { q: 'n', options: ['u', 'n', 'h', 'm'] },
    { q: 'u', options: ['n', 'v', 'u', 'y'] },
    { q: 'w', options: ['m', 'v', 'w', 'vv'] },
    { q: 'f', options: ['t', 'f', 'l', 'j'] },
    { q: 't', options: ['f', 'l', 't', 'i'] },
    { q: 'g', options: ['q', 'g', 'y', 'j'] },
    { q: 'j', options: ['i', 'j', 'l', 'y'] },
    { q: 'l', options: ['i', '1', 'l', 't'] },
    { q: 'i', options: ['l', 'j', 'i', '!'] },
    { q: 'h', options: ['n', 'h', 'b', 'k'] },
    { q: 'r', options: ['n', 'r', 'v', 'c'] },
    { q: 'c', options: ['e', 'c', 'o', 'a'] },
    { q: 'e', options: ['c', 'e', 'o', 'a'] },
    { q: 'o', options: ['c', 'e', 'o', '0'] },
    { q: 'a', options: ['o', 'a', 'e', 'u'] },
    { q: 's', options: ['z', '5', 's', 'c'] },
    { q: 'z', options: ['s', '2', 'z', 'x'] },
    { q: 'x', options: ['k', 'x', 'z', 'y'] },
    { q: 'y', options: ['v', 'y', 'u', 'j'] },
    { q: 'v', options: ['u', 'v', 'y', 'w'] },
    { q: 'k', options: ['x', 'k', 'h', 'f'] },
    { q: 'b', options: ['d', 'b', 'h', '6'] }, 
    { q: 'd', options: ['b', 'd', 'cl', 'o'] },
    { q: 'p', options: ['q', '9', 'p', 'o'] },
    { q: 'q', options: ['p', '9', 'q', 'g'] }
  ];

  const task3Data = [
    { sound: 'A as in Apple', text: 'A', options: ['A', 'E', 'O'] },
    { sound: 'Buh as in Bat', text: 'B', options: ['D', 'B', 'P'] },
    { sound: 'Kuh as in Cat', text: 'C', options: ['C', 'S', 'K'] }, 
    { sound: 'Duh as in Dog', text: 'D', options: ['B', 'D', 'T'] },
    { sound: 'Ehh as in Egg', text: 'E', options: ['A', 'I', 'E'] },
    { sound: 'Fff as in Fish', text: 'F', options: ['V', 'PH', 'F'] },
    { sound: 'Guh as in Goat', text: 'G', options: ['J', 'G', 'C'] },
    { sound: 'Hhh as in Hat', text: 'H', options: ['W', 'H', 'F'] },
    { sound: 'Ihh as in Igloo', text: 'I', options: ['E', 'I', 'Y'] },
    { sound: 'Juh as in Jar', text: 'J', options: ['G', 'J', 'Y'] },
    { sound: 'Kuh as in Kite', text: 'K', options: ['C', 'K', 'Q'] },
    { sound: 'Lll as in Lamp', text: 'L', options: ['I', 'L', 'R'] },
    { sound: 'Mmm as in Mouse', text: 'M', options: ['N', 'W', 'M'] },
    { sound: 'Nnn as in Nest', text: 'N', options: ['M', 'U', 'N'] },
    { sound: 'O as in Octopus', text: 'O', options: ['A', 'O', 'U'] },
    { sound: 'Puh as in Pig', text: 'P', options: ['B', 'Q', 'P'] },
    { sound: 'Shh as in Ship', text: 'SH', options: ['S', 'SH', 'CH'] },
    { sound: 'Ch as in Chair', text: 'CH', options: ['TR', 'SH', 'CH'] },
    { sound: 'Th as in Thumb', text: 'TH', options: ['F', 'V', 'TH'] },
    { sound: 'Ing as in Ring', text: 'NG', options: ['N', 'NK', 'NG'] }
  ];

  const task4Data = [
    { target: 'CAT', scrambled: ['T', 'A', 'C'] },
    { target: 'DOG', scrambled: ['G', 'D', 'O'] },
    { target: 'SUN', scrambled: ['N', 'S', 'U'] },
    { target: 'PIG', scrambled: ['G', 'I', 'P'] },
    { target: 'BUS', scrambled: ['S', 'B', 'U'] }, 
    { target: 'FROG', scrambled: ['O', 'G', 'R', 'F'] },
    { target: 'JUMP', scrambled: ['P', 'M', 'U', 'J'] },
    { target: 'MILK', scrambled: ['K', 'L', 'I', 'M'] },
    { target: 'FAST', scrambled: ['S', 'T', 'A', 'F'] },
    { target: 'STOP', scrambled: ['P', 'O', 'T', 'S'] }, 
    { target: 'HOUSE', scrambled: ['S', 'E', 'O', 'H', 'U'] },
    { target: 'WATER', scrambled: ['R', 'E', 'T', 'A', 'W'] },
    { target: 'APPLE', scrambled: ['L', 'E', 'P', 'A', 'P'] },
    { target: 'TABLE', scrambled: ['E', 'L', 'B', 'A', 'T'] }, 
    { target: 'SCHOOL', scrambled: ['L', 'O', 'O', 'H', 'C', 'S'] } 
  ];

  const task5Passage = "The brown dog ran through the park. It chased a red ball. The dog was very happy.";
  const task5Data = [
    { q: "What color was the dog?", a: "Brown", options: ["Black", "Brown", "White"] },
    { q: "Where did the dog run?", a: "The Park", options: ["The City", "The Park", "The House"] },
    { q: "What did the dog chase?", a: "A Red Ball", options: ["A Cat", "A Stick", "A Red Ball"] },
    { q: "How did the dog feel?", a: "Happy", options: ["Sad", "Happy", "Angry"] },
    { q: "What does 'chased' mean?", a: "Ran after", options: ["Ran after", "Ate", "Slept"] }
  ];

  const task7Symbols = ['★', '☀', '▲', '♦', '♥', '♣', '♠', '●', '■'];

  const task8Data = [
      { correct: 'cat', incorrect: 'cta' },
      { correct: 'dog', incorrect: 'dgo' },
      { correct: 'bird', incorrect: 'brid' },
      { correct: 'girl', incorrect: 'gril' },
      { correct: 'play', incorrect: 'paly' },
      { correct: 'home', incorrect: 'hoem' },
      { correct: 'friend', incorrect: 'freind' },
      { correct: 'school', incorrect: 'skool' },
      { correct: 'teacher', incorrect: 'teecher' },
      { correct: 'people', incorrect: 'peeple' },
      { correct: 'because', incorrect: 'becuase' },
      { correct: 'beautiful', incorrect: 'beutiful' },
      { correct: 'different', incorrect: 'difrent' },
      { correct: 'important', incorrect: 'importent' },
      { correct: 'necessary', incorrect: 'neccessary' },
      { correct: 'separate', incorrect: 'seperate' },
      { correct: 'receive', incorrect: 'recieve' },
      { correct: 'believe', incorrect: 'beleive' },
      { correct: 'surprise', incorrect: 'suprise' },
      { correct: 'through', incorrect: 'thru' }
  ];


  // ==============================================================================
  // LOGIC
  // ==============================================================================

  const playSound = (text: string) => {
    Speech.speak(text, { language: 'en-US' });
  };

  const handleTask1Answer = (word: string) => {
    const timeTaken = Date.now() - startTimeRef.current;
    const isCorrect = word === task1Data[subStep].target;
    const recordedTime = isCorrect ? timeTaken : 3000;
    const newData = [...accumulatedData, recordedTime];
    setAccumulatedData(newData);

    if (subStep < task1Data.length - 1) {
      setSubStep(prev => prev + 1);
      startTimeRef.current = Date.now();
    } else {
      const avgTime = newData.reduce((a, b) => a + b, 0) / newData.length;
      let score = 100 - ((avgTime - 500) / 25);
      score = Math.max(10, Math.min(100, score));
      saveScoreAndNext(0, Math.round(score));
    }
  };

  const handleTask2Answer = (ans: string) => {
    const isCorrect = ans === task2Data[subStep].q;
    const newData = [...accumulatedData, isCorrect];
    setAccumulatedData(newData);

    if (subStep < task2Data.length - 1) {
      setSubStep(prev => prev + 1);
    } else {
      const correctCount = newData.filter(Boolean).length;
      const score = (correctCount / task2Data.length) * 100;
      saveScoreAndNext(1, Math.round(score));
    }
  };

  const handleTask3Answer = (ans: string) => {
    const isCorrect = ans === task3Data[subStep].text;
    const newData = [...accumulatedData, isCorrect];
    setAccumulatedData(newData);
    if (subStep < task3Data.length - 1) {
      setSubStep(prev => prev + 1);
    } else {
      const correctCount = newData.filter(Boolean).length;
      const score = (correctCount / task3Data.length) * 100;
      saveScoreAndNext(2, Math.round(score));
    }
  };

  // Task 4
  const [t4CurrentInput, setT4CurrentInput] = useState<string[]>([]);
  const handleTask4Tap = (letter: string) => setT4CurrentInput([...t4CurrentInput, letter]);
  const handleTask4Reset = () => setT4CurrentInput([]);
  const handleTask4Submit = () => {
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    const isCorrect = t4CurrentInput.join('') === task4Data[subStep].target;
    setAccumulatedData([...accumulatedData, { isCorrect, time: timeTaken }]);
    setT4CurrentInput([]);
    if (subStep < task4Data.length - 1) {
      setSubStep(prev => prev + 1);
      startTimeRef.current = Date.now();
    } else {
      const data = [...accumulatedData, { isCorrect, time: timeTaken }];
      const correctCount = data.filter(d => d.isCorrect).length;
      const totalTime = data.reduce((a, b) => a + b.time, 0);
      const avgTime = totalTime / data.length;
      const baseScore = (correctCount / task4Data.length) * 100;
      const timePenalty = avgTime / 10; 
      let finalScore = baseScore - timePenalty;
      saveScoreAndNext(3, Math.round(Math.max(0, finalScore)));
    }
  };

  const handleTask5Answer = (ans: string) => {
    const isCorrect = ans === task5Data[subStep].a;
    const newData = [...accumulatedData, isCorrect];
    setAccumulatedData(newData);
    if (subStep < task5Data.length - 1) {
      setSubStep(prev => prev + 1);
    } else {
      const correctCount = newData.filter(Boolean).length;
      const score = (correctCount / 5) * 100;
      saveScoreAndNext(4, Math.round(score));
    }
  };

  // Task 6 Memory
  const [memSequence, setMemSequence] = useState('');
  const [memInput, setMemInput] = useState('');
  const [memPhase, setMemPhase] = useState<'SHOW' | 'INPUT'>('SHOW');
  const [memSpan, setMemSpan] = useState(2);
  const [memStrikes, setMemStrikes] = useState(0);
  const [maxSpan, setMaxSpan] = useState(0);

  const startMemRound = (span: number) => {
    let s = '';
    for(let i=0; i<span; i++) s += Math.floor(Math.random()*10);
    setMemSequence(s);
    setMemPhase('SHOW');
    setMemInput('');
    setTimeout(() => {
        setMemPhase('INPUT');
    }, 2000);
  };

  const handleMemSubmit = () => {
    const isCorrect = memInput === memSequence;
    if (isCorrect) {
        setMaxSpan(Math.max(maxSpan, memSpan));
        setMemStrikes(0); 
        const nextSpan = memSpan + 1;
        setMemSpan(nextSpan);
        startMemRound(nextSpan);
    } else {
        const newStrikes = memStrikes + 1;
        setMemStrikes(newStrikes);
        if (newStrikes >= 2) {
            saveScoreAndNext(5, Math.min(100, maxSpan * 10));
        } else {
            startMemRound(memSpan);
        }
    }
  };

  // Task 7
  const [t7Target, setT7Target] = useState('');
  const [t7Options, setT7Options] = useState<string[]>([]);
  const [t7Round, setT7Round] = useState(0);

  const setupT7Round = () => {
      const target = task7Symbols[Math.floor(Math.random() * task7Symbols.length)];
      setT7Target(target);
      const opts = [...task7Symbols].sort(() => Math.random() - 0.5).slice(0, 5);
      if(!opts.includes(target)) opts[Math.floor(Math.random()*5)] = target;
      setT7Options(opts);
      startTimeRef.current = Date.now();
  };

  const handleTask7Answer = (sym: string) => {
      if (sym === t7Target) {
          const time = Date.now() - startTimeRef.current;
          const newData = [...accumulatedData, time];
          setAccumulatedData(newData);
          if (t7Round < 24) {
              setT7Round(prev => prev + 1);
              setupT7Round();
          } else {
              const avgTime = newData.reduce((a,b)=>a+b,0) / newData.length;
              let score = 100 - ((avgTime - 400) / 21);
              score = Math.max(5, Math.min(100, score));
              saveScoreAndNext(6, Math.round(score));
          }
      }
  };

  // Task 8
  const handleTask8Answer = (word: string) => {
      const isCorrect = task8Data[subStep].correct === word;
      const newData = [...accumulatedData, isCorrect];
      setAccumulatedData(newData);
      if (subStep < task8Data.length - 1) {
          setSubStep(prev => prev + 1);
      } else {
          const correctCount = newData.filter(Boolean).length;
          const score = (correctCount / task8Data.length) * 100;
          saveScoreAndNext(7, Math.round(score));
      }
  };

  const saveScoreAndNext = (taskIndex: number, score: number) => {
    const newScores = [...scores];
    newScores[taskIndex] = score;
    setScores(newScores);
    setAccumulatedData([]);
    setSubStep(0);
    setT7Round(0);
    
    if (taskIndex < 7) {
      setCurrentTaskIndex(prev => prev + 1);
      setGameState('INTRO');
    } else {
      finishAssessment(newScores);
    }
  };

  const finishAssessment = async (finalScores: number[]) => {
    setIsProcessing(true);
    const average = Math.round(finalScores.reduce((a,b) => a+b, 0) / finalScores.length);
    let assignedDiff = Difficulty.PROFOUND;
    if (average >= 80) assignedDiff = Difficulty.MILD; 
    else if (average >= 60) assignedDiff = Difficulty.MILD;
    else if (average >= 40) assignedDiff = Difficulty.MODERATE;
    else if (average >= 20) assignedDiff = Difficulty.SEVERE;
    else assignedDiff = Difficulty.PROFOUND;

    await new Promise(resolve => setTimeout(resolve, 2000));

    const assessmentScores = {
        wordRecognition: finalScores[0],
        letterAccuracy: finalScores[1],
        phonemeMatching: finalScores[2],
        wordSequencing: finalScores[3],
        readingComp: finalScores[4],
        workingMemory: finalScores[5],
        visualProcessing: finalScores[6],
        spelling: finalScores[7],
        overallAverage: average
    };

    const updatedProfile: UserProfile = {
        ...user,
        assessmentComplete: true,
        assignedDifficulty: assignedDiff,
        assessmentScores: assessmentScores as any
    };

    if (user.uid !== 'demo-user-123' && user.uid) {
        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                assessmentComplete: true,
                assignedDifficulty: assignedDiff,
                assessmentScores: assessmentScores
            }, { merge: true });
        } catch (e) {
            console.error("Save failed", e);
        }
    }
    setCalculatedProfile(updatedProfile);
    setIsProcessing(false);
  };

  // ==============================================================================
  // RENDERING
  // ==============================================================================

  const renderIntro = () => (
    <View style={styles.introContainer}>
      <View style={styles.introIcon}>
         {currentTaskIndex === 0 && <Clock size={40} color="#4A90E2" />}
         {currentTaskIndex === 1 && <Eye size={40} color="#4A90E2" />}
         {currentTaskIndex === 2 && <Volume2 size={40} color="#4A90E2" />}
         {currentTaskIndex === 3 && <ArrowRight size={40} color="#4A90E2" />}
         {currentTaskIndex === 4 && <Brain size={40} color="#4A90E2" />}
         {currentTaskIndex === 5 && <Brain size={40} color="#4A90E2" />}
         {currentTaskIndex === 6 && <Eye size={40} color="#4A90E2" />}
         {currentTaskIndex === 7 && <CheckCircle size={40} color="#4A90E2" />}
      </View>
      <Text style={styles.introTitle}>Assessment {currentTaskIndex + 1}: {TASKS[currentTaskIndex]}</Text>
      
      <Text style={styles.introDesc}>
         {currentTaskIndex === 0 && "Identify and tap the correct word among the options. Speed counts! (20 trials)"}
         {currentTaskIndex === 1 && "Identify the target letter correctly. Watch out for b/d and p/q! (30 trials)"}
         {currentTaskIndex === 2 && "Listen to the phoneme sound and tap the matching letter. (20 trials)"}
         {currentTaskIndex === 3 && "Unscramble the letters to form the correct word. Both accuracy and speed matter. (15 trials)"}
         {currentTaskIndex === 4 && "Read the short passage about the brown dog and answer 5 questions."}
         {currentTaskIndex === 5 && "Memorize the sequence of numbers shown for 2 seconds. The sequence will get longer."}
         {currentTaskIndex === 6 && "Match the target symbol at the top with the options below. Move fast! (25 trials)"}
         {currentTaskIndex === 7 && "Choose the correctly spelled word from the pair. (20 trials)"}
      </Text>

      <TouchableOpacity 
        onPress={() => {
            setGameState('ACTIVE');
            if(currentTaskIndex === 0) startTimeRef.current = Date.now();
            if(currentTaskIndex === 3) startTimeRef.current = Date.now();
            if(currentTaskIndex === 5) startMemRound(2);
            if(currentTaskIndex === 6) setupT7Round();
        }}
        style={styles.startButton}
      >
        <Text style={styles.startButtonText}>Start Task</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTaskContent = () => {
    switch(currentTaskIndex) {
        case 0:
            const t1 = task1Data[subStep];
            return (
                <View style={styles.taskContainer}>
                    <Text style={styles.progressText}>Word {subStep+1}/20</Text>
                    <Text style={styles.instructionText}>Find: <Text style={styles.targetText}>{t1.target}</Text></Text>
                    <View style={styles.gridContainer}>
                        {t1.options.sort(() => Math.random() - 0.5).map((opt, i) => (
                            <TouchableOpacity key={i} onPress={() => handleTask1Answer(opt)} style={styles.optionCard}>
                                <Text style={styles.optionText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        case 1:
            const t2 = task2Data[subStep];
            return (
                <View style={styles.taskContainer}>
                    <Text style={styles.progressText}>Letter {subStep+1}/30</Text>
                    <Text style={styles.instructionText}>Find the letter</Text>
                    <Text style={styles.bigTargetText}>{t2.q}</Text>
                    <View style={styles.gridContainer}>
                        {t2.options.map((opt, i) => (
                            <TouchableOpacity key={i} onPress={() => handleTask2Answer(opt)} style={styles.smallOptionCard}>
                                <Text style={styles.largeOptionText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        case 2:
            const t3 = task3Data[subStep];
            return (
                <View style={styles.taskContainer}>
                     <Text style={styles.progressText}>Phoneme {subStep+1}/20</Text>
                     <TouchableOpacity onPress={() => playSound(t3.sound)} style={styles.soundButton}>
                         <Volume2 size={48} color="white" />
                     </TouchableOpacity>
                     <Text style={styles.subInstruction}>Tap to hear sound</Text>
                     <View style={styles.gridContainer}>
                        {t3.options.map((opt, i) => (
                            <TouchableOpacity key={i} onPress={() => handleTask3Answer(opt)} style={styles.mediumOptionCard}>
                                <Text style={styles.largeOptionText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        case 3:
             const t4 = task4Data[subStep];
             return (
                 <View style={styles.taskContainer}>
                     <Text style={styles.progressText}>Word {subStep+1}/15</Text>
                     <View style={styles.wordSlotContainer}>
                         {t4CurrentInput.map((char, i) => (
                             <Text key={i} style={styles.wordSlotChar}>{char}</Text>
                         ))}
                     </View>
                     <View style={styles.scrambleContainer}>
                         {t4.scrambled.map((char, i) => (
                             <TouchableOpacity key={i} onPress={() => handleTask4Tap(char)} style={styles.scrambleCard}>
                                 <Text style={styles.scrambleText}>{char}</Text>
                             </TouchableOpacity>
                         ))}
                     </View>
                     <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={handleTask4Reset} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Clear</Text></TouchableOpacity>
                        <TouchableOpacity onPress={handleTask4Submit} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Submit</Text></TouchableOpacity>
                     </View>
                 </View>
             );
        case 4:
             const t5 = task5Data[subStep];
             return (
                 <View style={styles.wideContainer}>
                     <Text style={styles.progressTextCenter}>Question {subStep+1}/5</Text>
                     <View style={styles.passageCard}>
                         <Text style={styles.passageText}>{task5Passage}</Text>
                     </View>
                     <Text style={styles.questionText}>{t5.q}</Text>
                     <View style={styles.optionsList}>
                         {t5.options.map((opt, i) => (
                             <TouchableOpacity key={i} onPress={() => handleTask5Answer(opt)} style={styles.listOption}>
                                 <Text style={styles.listOptionText}>{opt}</Text>
                             </TouchableOpacity>
                         ))}
                     </View>
                 </View>
             );
        case 5: // Memory
            if (memPhase === 'SHOW') {
                return (
                    <View style={styles.taskContainer}>
                        <Text style={styles.instructionText}>Memorize this sequence</Text>
                        <View style={styles.memoryGrid}>
                            {memSequence.split('').map((char, i) => (
                                <View key={i} style={styles.memoryCard}>
                                    <Text style={styles.memoryText}>{char}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )
            }
            return (
                <View style={styles.taskContainer}>
                    <Text style={styles.instructionText}>Enter the sequence</Text>
                    <View style={styles.inputDisplay}>
                        {memInput.split('').map((char, i) => (
                            <View key={i} style={styles.inputCard}>
                                <Text style={styles.inputText}>{char}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.numpad}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                            <TouchableOpacity 
                                key={num} 
                                onPress={() => setMemInput(p => p + num.toString())}
                                style={styles.numKey}
                            >
                                <Text style={styles.numKeyText}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                         <TouchableOpacity onPress={() => setMemInput('')} style={styles.actionKeyRed}>
                            <Text style={styles.actionKeyTextRed}>C</Text>
                        </TouchableOpacity>
                         <TouchableOpacity onPress={() => setMemInput(p => p.slice(0,-1))} style={styles.actionKeyGray}>
                            <Delete size={24} color="#444" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handleMemSubmit} style={styles.primaryButtonFull}>
                        <Text style={styles.primaryButtonText}>Submit Answer</Text>
                    </TouchableOpacity>
                </View>
            );
        case 6:
            return (
                <View style={styles.taskContainer}>
                    <Text style={styles.progressText}>Round {t7Round+1}/25</Text>
                    <Text style={styles.bigTargetSymbol}>{t7Target}</Text>
                    <View style={styles.gridContainer}>
                        {t7Options.map((opt, i) => (
                            <TouchableOpacity key={i} onPress={() => handleTask7Answer(opt)} style={styles.smallOptionCard}>
                                <Text style={styles.largeOptionText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        case 7:
             const t8 = task8Data[subStep];
             const pair = [t8.correct, t8.incorrect].sort(() => Math.random() - 0.5);
             return (
                 <View style={styles.wideContainer}>
                     <Text style={styles.progressTextCenter}>Word {subStep+1}/20</Text>
                     <View style={styles.verticalGap}>
                        {pair.map((word, i) => (
                            <TouchableOpacity key={i} onPress={() => handleTask8Answer(word)} style={styles.wordCard}>
                                <Text style={styles.wordCardText}>{word}</Text>
                            </TouchableOpacity>
                        ))}
                     </View>
                 </View>
             );
        default: return null;
    }
  };

  const renderResultScreen = () => {
    if (!calculatedProfile) return null;
    const diff = calculatedProfile.assignedDifficulty;
    return (
        <View style={styles.resultContainer}>
            <View style={styles.resultIconBg}>
                <Trophy size={48} color="#ca8a04" />
            </View>
            <Text style={styles.resultTitle}>Assessment Complete!</Text>
            <Text style={styles.resultSubtitle}>
                We have analyzed your performance across 8 different skills.
            </Text>
            <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Recommended Level</Text>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreValue}>{diff}</Text>
                    <Star color="#4A90E2" fill="#4A90E2" />
                </View>
                <Text style={styles.scoreDesc}>
                    {diff === Difficulty.MILD && "Excellent performance! We've set your activities to standard mode."}
                    {diff === Difficulty.MODERATE && "Good job! We've added some extra guides to help you master tricky areas."}
                    {diff === Difficulty.SEVERE && "We've customized the app with high-support guides."}
                    {diff === Difficulty.PROFOUND && "We've enabled maximum support and simplified tasks."}
                </Text>
            </View>
            <TouchableOpacity 
                onPress={() => onComplete(calculatedProfile)}
                style={styles.continueButton}
            >
                <Text style={styles.continueButtonText}>Continue to Dashboard</Text>
                <ArrowRight color="white" />
            </TouchableOpacity>
        </View>
    );
  };

  if (isProcessing) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>Calculating Learning Path...</Text>
          </View>
      )
  }

  if (calculatedProfile) return renderResultScreen();

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>ASSESSMENT PROGRESS</Text>
          <Text style={styles.progressLabel}>{Math.round(((currentTaskIndex) / 8) * 100)}%</Text>
        </View>
        <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, {width: `${((currentTaskIndex)/8)*100}%`}]} />
        </View>
      </View>

      <View style={styles.contentCard}>
        {gameState === 'INTRO' ? renderIntro() : renderTaskContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    padding: 16,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 6,
  },
  contentCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    padding: 24,
    borderWidth: 2,
    borderColor: '#EFF6FF',
    justifyContent: 'center',
  },
  introContainer: {
    alignItems: 'center',
    padding: 16,
  },
  introIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#EFF6FF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2D2D2D',
  },
  introDesc: {
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  startButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 30,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  taskContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressText: {
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  instructionText: {
    marginBottom: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  targetText: {
    fontWeight: 'bold',
    color: 'black',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  optionCard: {
    width: '45%',
    height: 96,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bigTargetText: {
    fontSize: 80,
    fontWeight: 'bold',
    marginBottom: 48,
    color: '#4A90E2',
  },
  smallOptionCard: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeOptionText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  soundButton: {
    padding: 32,
    backgroundColor: '#66BB6A',
    borderRadius: 60,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
  },
  subInstruction: {
    color: '#9CA3AF',
    marginBottom: 32,
  },
  mediumOptionCard: {
    width: 96,
    height: 96,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordSlotContainer: {
    height: 96,
    borderBottomWidth: 4,
    borderColor: '#4A90E2',
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 8,
    width: '100%',
  },
  wordSlotChar: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  scrambleContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  scrambleCard: {
    width: 64,
    height: 64,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrambleText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingHorizontal: 16,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontWeight: 'bold',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  wideContainer: {
    width: '100%',
  },
  progressTextCenter: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  passageCard: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  passageText: {
    fontSize: 18,
    lineHeight: 28,
  },
  questionText: {
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  optionsList: {
    gap: 12,
  },
  listOption: {
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent', // Can highlight selected
  },
  listOptionText: {
    fontSize: 18,
    fontWeight: '500',
  },
  memoryGrid: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 48,
    flexWrap: 'wrap',
  },
  memoryCard: {
    width: 64,
    height: 80,
    backgroundColor: 'white',
    borderBottomWidth: 4,
    borderColor: '#4A90E2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memoryText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  inputDisplay: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 32,
    minHeight: 80,
    flexWrap: 'wrap',
  },
  inputCard: {
    width: 48,
    height: 64,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
  },
  numKey: {
    width: 80,
    height: 64,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderBottomWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numKeyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  actionKeyRed: {
    width: 80,
    height: 64,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionKeyTextRed: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionKeyGray: {
    width: 80,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonFull: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bigTargetSymbol: {
    fontSize: 96,
    marginBottom: 48,
    color: '#66BB6A',
    fontWeight: 'bold',
  },
  verticalGap: {
    gap: 24,
  },
  wordCard: {
    paddingVertical: 32,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wordCardText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FDFBF7',
  },
  resultIconBg: {
    width: 96,
    height: 96,
    backgroundColor: '#FEF9C3',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultSubtitle: {
    color: '#6B7280',
    marginBottom: 32,
    fontSize: 18,
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E7FF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  scoreLabel: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '800',
    color: '#4A90E2',
  },
  scoreDesc: {
    color: '#4B5563',
    textAlign: 'center',
  },
  continueButton: {
    width: '100%',
    paddingVertical: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
