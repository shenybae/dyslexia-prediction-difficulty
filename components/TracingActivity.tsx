import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, PanResponder, Dimensions, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { TracingItem, Difficulty } from '../types';
import { DIFFICULTY_SETTINGS } from '../constants';
import { Eraser, ChevronLeft, Activity, AlertCircle, ScanLine } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { svgPathProperties } from 'svg-path-properties';

interface TracingActivityProps {
  items: TracingItem[];
  difficulty: Difficulty;
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface Point {
  x: number;
  y: number;
  visited: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = SCREEN_WIDTH - 32; // Padding
const SCALE = CANVAS_SIZE / 300; // Map SVG 300x300 to screen size

export const TracingActivity: React.FC<TracingActivityProps> = ({ items, difficulty, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userPath, setUserPath] = useState<string>('');
  const [result, setResult] = useState<{score: number, precision: number, progress: number, errors: number} | null>(null);
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);
  const [liveStats, setLiveStats] = useState({ precision: 100, errors: 0, progress: 0 });

  const currentItem = items[currentIndex];
  const difficultyConfig = currentItem.difficultyConfig?.[difficulty];
  const activePathData = difficultyConfig?.pathData || currentItem.pathData;
  const activeLabel = difficultyConfig?.label || currentItem.label;
  const settings = DIFFICULTY_SETTINGS[difficulty];

  // Logic Refs
  const checkpointsRef = useRef<Point[]>([]);
  const statsRef = useRef({ total: 0, valid: 0, errors: 0 });
  const pathPropertiesRef = useRef<any>(null);

  // Initialize Level
  useEffect(() => {
    // Generate Checkpoints logic (No DOM)
    const properties = new svgPathProperties(activePathData);
    pathPropertiesRef.current = properties;
    const len = properties.getTotalLength();
    const numPoints = Math.max(10, Math.floor(len / 15));
    const points: Point[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const pt = properties.getPointAtLength((i / numPoints) * len);
      points.push({ x: pt.x * SCALE, y: pt.y * SCALE, visited: false });
    }

    checkpointsRef.current = points;
    resetState();

  }, [currentIndex, difficulty]);

  const resetState = () => {
    setUserPath('');
    setResult(null);
    setIsOutOfBounds(false);
    setLiveStats({ precision: 100, errors: 0, progress: 0 });
    statsRef.current = { total: 0, valid: 0, errors: 0 };
    checkpointsRef.current.forEach(p => p.visited = false);
  };

  const handleTouch = (x: number, y: number) => {
    if (!pathPropertiesRef.current) return;

    // Convert screen coordinates back to SVG coordinates (0-300) for logic
    const svgX = x / SCALE;
    const svgY = y / SCALE;

    let isInside = false;
    const scaledTolerance = (settings.strokeWidth / 2 + settings.tolerance) * 0.8; 

    for (const cp of checkpointsRef.current) {
        // Distance in SVG units
        const d = Math.hypot(cp.x/SCALE - svgX, cp.y/SCALE - svgY);
        if (d < scaledTolerance) {
            isInside = true;
            break;
        }
    }

    statsRef.current.total++;

    if (isInside) {
      statsRef.current.valid++;
      setIsOutOfBounds(false);

      // Update Visited (Progress)
      checkpointsRef.current.forEach(cp => {
          if (!cp.visited) {
              const dist = Math.hypot(cp.x/SCALE - svgX, cp.y/SCALE - svgY);
              if (dist < 30) cp.visited = true; // Visit radius
          }
      });
    } else {
       statsRef.current.errors++;
       if (!isOutOfBounds) {
           setIsOutOfBounds(true);
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       }
    }

    // Update Live Stats Throttled
    if (statsRef.current.total % 5 === 0) {
        const visited = checkpointsRef.current.filter(c => c.visited).length;
        const total = checkpointsRef.current.length;
        const precision = Math.round((statsRef.current.valid / statsRef.current.total) * 100);
        setLiveStats({
            precision,
            errors: statsRef.current.errors,
            progress: Math.round((visited / total) * 100)
        });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setUserPath(`M ${locationX} ${locationY}`);
        handleTouch(locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setUserPath(prev => `${prev} L ${locationX} ${locationY}`);
        handleTouch(locationX, locationY);
      },
      onPanResponderRelease: () => {
        calculateScore();
      }
    })
  ).current;

  const calculateScore = () => {
    const visited = checkpointsRef.current.filter(c => c.visited).length;
    const total = checkpointsRef.current.length;
    const progress = (visited / total) * 100;
    const precision = statsRef.current.total > 0 ? (statsRef.current.valid / statsRef.current.total) * 100 : 0;

    const finalScore = Math.min(100, Math.round((progress * 0.7) + (precision * 0.3)));

    if (progress > 20) {
        setResult({
            score: finalScore,
            precision: Math.round(precision),
            progress: Math.round(progress),
            errors: statsRef.current.errors
        });

        if (progress > 85) onComplete(finalScore);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.backButton}>
          <ChevronLeft color="#4b5563" size={24} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.difficultyLabel}>{difficulty} Difficulty</Text>
          <Text style={styles.taskTitle}>{currentIndex + 1}. {activeLabel}</Text>
        </View>
        <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{currentIndex + 1}/40</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
         <View style={styles.statItem}>
            <Activity size={14} color={liveStats.precision > 80 ? 'green' : 'orange'} />
            <Text style={styles.statText}>{liveStats.precision}%</Text>
         </View>
         <View style={styles.statItem}>
            <ScanLine size={14} color="blue" />
            <Text style={styles.statText}>{liveStats.progress}%</Text>
         </View>
         <View style={styles.statItem}>
            <AlertCircle size={14} color={liveStats.errors === 0 ? 'green' : 'red'} />
            <Text style={styles.statText}>{liveStats.errors}</Text>
         </View>
      </View>

      {/* Canvas Area */}
      <View 
        style={[
            styles.canvasContainer, 
            isOutOfBounds ? styles.canvasError : styles.canvasNormal,
            { width: CANVAS_SIZE + 8, height: CANVAS_SIZE + 8 }
        ]}
      >
        <View 
             style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
             {...panResponder.panHandlers}
        >
            <Svg height={CANVAS_SIZE} width={CANVAS_SIZE} viewBox={`0 0 ${300} ${300}`}>
                {/* Guide Path */}
                <Path
                    d={activePathData}
                    stroke="#e2e8f0"
                    strokeWidth={settings.strokeWidth + settings.tolerance}
                    fill="none"
                    strokeLinecap="round"
                />
                <Path
                    d={activePathData}
                    stroke="#cbd5e1"
                    strokeWidth={settings.strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="10, 10"
                />
            </Svg>

            {/* Overlay SVG for user drawing which uses absolute coordinates */}
            <Svg style={styles.overlaySvg} height={CANVAS_SIZE} width={CANVAS_SIZE}>
                <Path
                    d={userPath}
                    stroke="rgba(74, 144, 226, 0.6)"
                    strokeWidth={settings.strokeWidth * SCALE} // Scale stroke to screen
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </View>

        {/* Result Overlay */}
        {result && (
             <View style={styles.resultOverlay}>
                 <Text style={styles.resultTitle}>
                     {result.score > 70 ? 'Great Job!' : 'Keep Going!'}
                 </Text>
                 <Text style={styles.resultScore}>{result.score}</Text>
                 
                 <View style={styles.resultActions}>
                     {result.progress > 85 ? (
                         <TouchableOpacity 
                            onPress={() => {
                                if (currentIndex < items.length - 1) setCurrentIndex(prev => prev + 1);
                                else onExit();
                            }}
                            style={styles.nextButton}
                         >
                             <Text style={styles.buttonTextWhite}>Next</Text>
                         </TouchableOpacity>
                     ) : (
                        <TouchableOpacity 
                            onPress={resetState}
                            style={styles.retryButton}
                         >
                             <Text style={styles.buttonTextGray}>Retry</Text>
                         </TouchableOpacity>
                     )}
                 </View>
             </View>
        )}
      </View>

      <View style={styles.footerControls}>
        <TouchableOpacity onPress={resetState} style={styles.clearButton}>
            <Eraser color="#dc2626" size={20} />
            <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#4B5563',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  titleContainer: {
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  counterBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  counterText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  canvasContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  canvasNormal: {
    borderColor: '#E6F3F7',
  },
  canvasError: {
    borderColor: '#F87171',
  },
  overlaySvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  resultOverlay: {
    position: 'absolute',
    top: '25%',
    left: 40,
    right: 40,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#4A90E2',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2D2D2D',
  },
  resultScore: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonTextWhite: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonTextGray: {
    color: '#374151',
    fontWeight: 'bold',
  },
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  clearButtonText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
});
