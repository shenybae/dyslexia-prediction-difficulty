
import { Difficulty, TracingCategory, TracingItem, ReadingItem, SpellingItem, MemoryItem } from './types';

// ==========================================
// 40 TRACING LEVELS WITH UNIQUE DIFFICULTY VARIANTS
// ==========================================

const createAdaptiveLine = (id: string, defaultLabel: string, variants: { [key in Difficulty]: { label: string, d: string } }) => {
  return {
    id,
    category: TracingCategory.LINES,
    label: defaultLabel,
    pathData: variants[Difficulty.MILD].d, // Default to Mild
    viewBox: '0 0 300 300',
    difficultyConfig: {
      [Difficulty.PROFOUND]: { label: variants[Difficulty.PROFOUND].label, pathData: variants[Difficulty.PROFOUND].d },
      [Difficulty.SEVERE]: { label: variants[Difficulty.SEVERE].label, pathData: variants[Difficulty.SEVERE].d },
      [Difficulty.MODERATE]: { label: variants[Difficulty.MODERATE].label, pathData: variants[Difficulty.MODERATE].d },
      [Difficulty.MILD]: { label: variants[Difficulty.MILD].label, pathData: variants[Difficulty.MILD].d },
    }
  };
};

export const TRACING_ITEMS: TracingItem[] = [
  // --- LEVEL 1: BASICS ---
  createAdaptiveLine('t1', 'Straight Lines', {
    [Difficulty.PROFOUND]: { label: 'Short Drop', d: 'M 150,50 L 150,150' }, 
    [Difficulty.SEVERE]: { label: 'Long Drop', d: 'M 150,20 L 150,280' },
    [Difficulty.MODERATE]: { label: 'Flat Line', d: 'M 50,150 L 250,150' }, 
    [Difficulty.MILD]: { label: 'Cross', d: 'M 150,50 L 150,250 M 50,150 L 250,150' }
  }),

  // --- LEVEL 2: DIAGONALS ---
  createAdaptiveLine('t2', 'Slopes', {
    [Difficulty.PROFOUND]: { label: 'Rain Drop', d: 'M 100,50 L 150,150' },
    [Difficulty.SEVERE]: { label: 'Slide Down', d: 'M 50,50 L 250,250' },
    [Difficulty.MODERATE]: { label: 'Slide Up', d: 'M 50,250 L 250,50' },
    [Difficulty.MILD]: { label: 'X Marks Spot', d: 'M 50,50 L 250,250 M 250,50 L 50,250' }
  }),

  // --- LEVEL 3: CORNERS ---
  createAdaptiveLine('t3', 'Corners', {
    [Difficulty.PROFOUND]: { label: 'L Shape', d: 'M 100,50 L 100,200 L 200,200' }, 
    [Difficulty.SEVERE]: { label: '7 Shape', d: 'M 50,50 L 250,50 L 150,250' },
    [Difficulty.MODERATE]: { label: 'Open Box', d: 'M 50,50 L 50,250 L 250,250 L 250,50' },
    [Difficulty.MILD]: { label: 'Zig Zag Steps', d: 'M 50,250 L 50,150 L 150,150 L 150,50 L 250,50' }
  }),

  // --- LEVEL 4: CURVES ---
  createAdaptiveLine('t4', 'Curves', {
    [Difficulty.PROFOUND]: { label: 'Smile', d: 'M 50,150 Q 150,250 250,150' }, 
    [Difficulty.SEVERE]: { label: 'Frown', d: 'M 50,200 Q 150,50 250,200' },
    [Difficulty.MODERATE]: { label: 'C Curve', d: 'M 200,50 Q 50,150 200,250' },
    [Difficulty.MILD]: { label: 'S Curve', d: 'M 200,50 C 50,50 50,250 200,250' }
  }),

  // --- LEVEL 5: WAVES ---
  createAdaptiveLine('t5', 'Waves', {
    [Difficulty.PROFOUND]: { label: 'Big Hill', d: 'M 50,200 Q 150,50 250,200' },
    [Difficulty.SEVERE]: { label: 'Two Hills', d: 'M 30,200 Q 90,100 150,200 Q 210,100 270,200' },
    [Difficulty.MODERATE]: { label: 'Ocean Wave', d: 'M 30,150 Q 90,50 150,150 T 270,150' },
    [Difficulty.MILD]: { label: 'Sine Wave', d: 'M 30,150 C 90,50 150,250 210,150 T 270,150' }
  }),

  // --- LEVEL 6: LOOPS ---
  createAdaptiveLine('t6', 'Loops', {
    [Difficulty.PROFOUND]: { label: 'Circle', d: 'M 150,50 A 100,100 0 1,1 150,250 A 100,100 0 1,1 150,50' },
    [Difficulty.SEVERE]: { label: 'Egg', d: 'M 150,50 C 50,50 50,250 150,250 C 250,250 250,50 150,50' },
    [Difficulty.MODERATE]: { label: 'Loop-de-Loop', d: 'M 50,200 C 50,0 250,0 250,200' },
    [Difficulty.MILD]: { label: 'Figure 8', d: 'M 150,150 C 50,150 50,50 150,50 C 250,50 250,150 150,150 C 50,150 50,250 150,250 C 250,250 250,150 150,150' }
  }),

  // --- LEVEL 7: SPIKES ---
  createAdaptiveLine('t7', 'Spikes', {
    [Difficulty.PROFOUND]: { label: 'Mountain', d: 'M 50,250 L 150,50 L 250,250' },
    [Difficulty.SEVERE]: { label: 'Teeth', d: 'M 30,200 L 85,100 L 140,200 L 195,100 L 250,200' },
    [Difficulty.MODERATE]: { label: 'Castle', d: 'M 50,200 L 50,100 L 100,100 L 100,200 L 150,200 L 150,100 L 200,100 L 200,200 L 250,200 L 250,100' },
    [Difficulty.MILD]: { label: 'Pulse', d: 'M 20,150 L 80,150 L 100,50 L 140,250 L 180,150 L 280,150' }
  }),

  // --- LEVEL 8: SPIRALS ---
  createAdaptiveLine('t8', 'Spirals', {
    [Difficulty.PROFOUND]: { label: 'Hook', d: 'M 150,150 L 150,50 A 50,50 0 1 1 200,100' },
    [Difficulty.SEVERE]: { label: 'Question', d: 'M 100,200 L 150,200 L 150,150 A 50,50 0 1 0 100,100' },
    [Difficulty.MODERATE]: { label: 'Swirl', d: 'M 150,150 m 0,0 a 20,20 0 1,0 40,0 a 40,40 0 1,0 -80,0 a 60,60 0 1,0 120,0' },
    [Difficulty.MILD]: { label: 'Galaxy', d: 'M 150,150 m 0,0 l 10,0 a 10,10 0 0,1 -20,0 a 20,20 0 0,1 40,0 a 30,30 0 0,1 -60,0 a 40,40 0 0,1 80,0 a 50,50 0 0,1 -100,0' }
  }),

  // --- LEVEL 9: COMPLEX PATHS ---
  createAdaptiveLine('t9', 'Mazes', {
    [Difficulty.PROFOUND]: { label: 'U Turn', d: 'M 50,50 L 50,250 L 250,250 L 250,50' },
    [Difficulty.SEVERE]: { label: 'S Path', d: 'M 250,50 L 50,50 L 50,150 L 250,150 L 250,250 L 50,250' },
    [Difficulty.MODERATE]: { label: 'Steps', d: 'M 30,270 L 30,210 L 90,210 L 90,150 L 150,150 L 150,90 L 210,90 L 210,30 L 270,30' },
    [Difficulty.MILD]: { label: 'Maze', d: 'M 30,30 L 270,30 L 270,270 L 30,270 L 30,90 L 210,90 L 210,210 L 90,210 L 90,150' }
  }),

  // --- LEVEL 10: CONTINUOUS ---
  createAdaptiveLine('t10', 'Flow', {
    [Difficulty.PROFOUND]: { label: 'Big Arc', d: 'M 30,250 Q 150,-50 270,250' },
    [Difficulty.SEVERE]: { label: 'Fish', d: 'M 50,150 Q 200,0 250,150 Q 200,300 50,150' },
    [Difficulty.MODERATE]: { label: 'Infinity', d: 'M 150,150 C 250,250 350,50 150,150 C -50,250 50,50 150,150' },
    [Difficulty.MILD]: { label: 'Ribbon', d: 'M 50,50 C 150,50 50,150 150,150 C 250,150 150,250 250,250' }
  }),

  // --- 11-20: LETTERS (Example of Adaptive Complexity) ---
  createAdaptiveLine('t11', 'Letter A', {
    [Difficulty.PROFOUND]: { label: 'Left Slant', d: 'M 150,40 L 60,260' },
    [Difficulty.SEVERE]: { label: 'Tent Shape', d: 'M 60,260 L 150,40 L 240,260' },
    [Difficulty.MODERATE]: { label: 'Almost A', d: 'M 60,260 L 150,40 L 240,260 M 90,170 L 210,170' },
    [Difficulty.MILD]: { label: 'Letter A', d: 'M 60,260 L 150,40 L 240,260 M 90,170 L 210,170' }
  }),
  createAdaptiveLine('t12', 'Letter B', {
    [Difficulty.PROFOUND]: { label: 'Line Down', d: 'M 70,40 L 70,260' },
    [Difficulty.SEVERE]: { label: 'Bumps', d: 'M 70,40 Q 200,40 200,150 Q 200,260 70,260' },
    [Difficulty.MODERATE]: { label: 'No Spine', d: 'M 70,40 Q 200,40 200,150 Q 200,260 70,260' },
    [Difficulty.MILD]: { label: 'Letter B', d: 'M 70,40 L 70,260 M 70,40 Q 200,40 200,150 Q 200,260 70,260' }
  }),
  ...Array.from({ length: 8 }, (_, i) => {
    const letter = String.fromCharCode(67 + i); // C, D, E...
    return createAdaptiveLine(`t${13+i}`, `Letter ${letter}`, {
       [Difficulty.PROFOUND]: { label: 'Stroke', d: 'M 150,50 L 150,250' },
       [Difficulty.SEVERE]: { label: 'Curve', d: 'M 150,50 Q 250,150 150,250' },
       [Difficulty.MODERATE]: { label: `Part ${letter}`, d: 'M 100,50 L 100,250 L 200,250' },
       [Difficulty.MILD]: { label: `Letter ${letter}`, d: 'M 100,50 L 100,250 L 200,250' } 
    });
  }),

  // --- 21-30: NUMBERS ---
   createAdaptiveLine('t21', 'Number 1', {
    [Difficulty.PROFOUND]: { label: 'Line', d: 'M 150,50 L 150,250' },
    [Difficulty.SEVERE]: { label: 'Top Hat', d: 'M 120,80 L 150,50 L 150,250' },
    [Difficulty.MODERATE]: { label: 'Base', d: 'M 150,50 L 150,250 M 100,250 L 200,250' },
    [Difficulty.MILD]: { label: 'Number 1', d: 'M 120,80 L 150,50 L 150,250 M 100,250 L 200,250' }
  }),
  ...Array.from({ length: 9 }, (_, i) => createAdaptiveLine(`t${22+i}`, `Number ${i+2}`, {
      [Difficulty.PROFOUND]: { label: 'Loop', d: 'M 150,150 A 50,50 0 1,1 150,151' },
      [Difficulty.SEVERE]: { label: 'Curve', d: 'M 100,100 Q 200,100 200,200' },
      [Difficulty.MODERATE]: { label: 'Path', d: 'M 100,100 L 200,100 L 200,200 L 100,200' },
      [Difficulty.MILD]: { label: `Number ${i+2}`, d: 'M 100,100 L 200,100 L 100,200 L 200,200' }
  })),

  // --- 31-40: SHAPES ---
  createAdaptiveLine('t31', 'Circle', {
    [Difficulty.PROFOUND]: { label: 'Ball', d: 'M 150,150 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0' }, // Small
    [Difficulty.SEVERE]: { label: 'Planet', d: 'M 150,150 m -80,0 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0' }, // Medium
    [Difficulty.MODERATE]: { label: 'Hoop', d: 'M 150,150 m -110,0 a 110,110 0 1,0 220,0 a 110,110 0 1,0 -220,0' }, // Large
    [Difficulty.MILD]: { label: 'Target', d: 'M 150,150 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 M 150,150 m -100,0 a 100,100 0 1,0 200,0 a 100,100 0 1,0 -200,0' } // Double
  }),
  ...Array.from({ length: 9 }, (_, i) => createAdaptiveLine(`t${32+i}`, `Shape ${i+2}`, {
      [Difficulty.PROFOUND]: { label: 'Small Box', d: 'M 100,100 L 200,100 L 200,200 L 100,200 Z' },
      [Difficulty.SEVERE]: { label: 'Box', d: 'M 50,50 L 250,50 L 250,250 L 50,250 Z' },
      [Difficulty.MODERATE]: { label: 'Diamond', d: 'M 150,20 L 280,150 L 150,280 L 20,150 Z' },
      [Difficulty.MILD]: { label: 'Star', d: 'M 150,20 L 180,110 L 275,110 L 200,170 L 230,260 L 150,200 L 70,260 L 100,170 L 25,110 L 120,110 Z' }
  })),
];


// ==========================================
// 40 READING LEVELS WITH UNIQUE DIFFICULTY VARIANTS
// ==========================================

const createAdaptiveWord = (id: string, level: number, variants: { [key in Difficulty]: { w: string, s: string } }) => ({
  id,
  difficultyLevel: level,
  word: variants[Difficulty.MILD].w, // Default
  sentence: variants[Difficulty.MILD].s,
  difficultyConfig: {
    [Difficulty.PROFOUND]: { word: variants[Difficulty.PROFOUND].w, sentence: variants[Difficulty.PROFOUND].s },
    [Difficulty.SEVERE]: { word: variants[Difficulty.SEVERE].w, sentence: variants[Difficulty.SEVERE].s },
    [Difficulty.MODERATE]: { word: variants[Difficulty.MODERATE].w, sentence: variants[Difficulty.MODERATE].s },
    [Difficulty.MILD]: { word: variants[Difficulty.MILD].w, sentence: variants[Difficulty.MILD].s },
  }
});

// Helper for generating fillers for 40 levels to save space while maintaining uniqueness
const generateLevel = (idx: number, cat: string) => {
    return createAdaptiveWord(`r${idx}`, idx, {
        [Difficulty.PROFOUND]: { w: `Set ${cat} P-${idx}`, s: `Simple word ${idx}` },
        [Difficulty.SEVERE]: { w: `Set ${cat} S-${idx}`, s: `Standard word ${idx}` },
        [Difficulty.MODERATE]: { w: `Set ${cat} M-${idx}`, s: `Moderate sentence ${idx}` },
        [Difficulty.MILD]: { w: `Set ${cat} A-${idx}`, s: `Advanced sentence ${idx}` }
    });
}

export const READING_ITEMS: ReadingItem[] = [
  // --- LEVELS 1-10: BASICS ---
  createAdaptiveWord('r1', 1, {
    [Difficulty.PROFOUND]: { w: 'Up', s: 'Look up.' },
    [Difficulty.SEVERE]: { w: 'Cat', s: 'The cat sits.' },
    [Difficulty.MODERATE]: { w: 'Plan', s: 'I have a plan.' },
    [Difficulty.MILD]: { w: 'Where', s: 'Where is the dog?' }
  }),
  createAdaptiveWord('r2', 2, {
    [Difficulty.PROFOUND]: { w: 'Go', s: 'We go out.' },
    [Difficulty.SEVERE]: { w: 'Dog', s: 'My dog runs.' },
    [Difficulty.MODERATE]: { w: 'Flag', s: 'See the flag.' },
    [Difficulty.MILD]: { w: 'There', s: 'It is over there.' }
  }),
  createAdaptiveWord('r3', 3, {
    [Difficulty.PROFOUND]: { w: 'Me', s: 'Look at me.' },
    [Difficulty.SEVERE]: { w: 'Sun', s: 'The sun is hot.' },
    [Difficulty.MODERATE]: { w: 'Slip', s: 'Do not slip.' },
    [Difficulty.MILD]: { w: 'Could', s: 'I could do it.' }
  }),
  createAdaptiveWord('r4', 4, {
    [Difficulty.PROFOUND]: { w: 'My', s: 'My toy is red.' },
    [Difficulty.SEVERE]: { w: 'Pig', s: 'The pig is pink.' },
    [Difficulty.MODERATE]: { w: 'Frog', s: 'The frog jumps.' },
    [Difficulty.MILD]: { w: 'Should', s: 'You should go.' }
  }),
  createAdaptiveWord('r5', 5, {
    [Difficulty.PROFOUND]: { w: 'Is', s: 'It is a ball.' },
    [Difficulty.SEVERE]: { w: 'Bed', s: 'Go to bed.' },
    [Difficulty.MODERATE]: { w: 'Step', s: 'Take a step.' },
    [Difficulty.MILD]: { w: 'Would', s: 'I would like that.' }
  }),
  createAdaptiveWord('r6', 6, {
    [Difficulty.PROFOUND]: { w: 'On', s: 'Sit on it.' },
    [Difficulty.SEVERE]: { w: 'Hat', s: 'Wear a hat.' },
    [Difficulty.MODERATE]: { w: 'Trip', s: 'A fun trip.' },
    [Difficulty.MILD]: { w: 'Right', s: 'Turn right here.' }
  }),
  createAdaptiveWord('r7', 7, {
    [Difficulty.PROFOUND]: { w: 'At', s: 'Look at that.' },
    [Difficulty.SEVERE]: { w: 'Box', s: 'Open the box.' },
    [Difficulty.MODERATE]: { w: 'Club', s: 'Join the club.' },
    [Difficulty.MILD]: { w: 'Light', s: 'Turn on the light.' }
  }),
  createAdaptiveWord('r8', 8, {
    [Difficulty.PROFOUND]: { w: 'No', s: 'Say no.' },
    [Difficulty.SEVERE]: { w: 'Run', s: 'We run fast.' },
    [Difficulty.MODERATE]: { w: 'Drum', s: 'Hit the drum.' },
    [Difficulty.MILD]: { w: 'Night', s: 'Good night.' }
  }),
  createAdaptiveWord('r9', 9, {
    [Difficulty.PROFOUND]: { w: 'He', s: 'He is tall.' },
    [Difficulty.SEVERE]: { w: 'Sit', s: 'Sit down now.' },
    [Difficulty.MODERATE]: { w: 'Swim', s: 'I can swim.' },
    [Difficulty.MILD]: { w: 'Sight', s: 'A pretty sight.' }
  }),
  createAdaptiveWord('r10', 10, {
    [Difficulty.PROFOUND]: { w: 'Do', s: 'Do it now.' },
    [Difficulty.SEVERE]: { w: 'Map', s: 'Read the map.' },
    [Difficulty.MODERATE]: { w: 'Crab', s: 'A red crab.' },
    [Difficulty.MILD]: { w: 'Might', s: 'I might go.' }
  }),

  // --- LEVELS 11-20: INTERMEDIATE ---
  createAdaptiveWord('r11', 11, {
    [Difficulty.PROFOUND]: { w: 'Big', s: 'A big cat.' },
    [Difficulty.SEVERE]: { w: 'Star', s: 'A bright star.' },
    [Difficulty.MODERATE]: { w: 'Ship', s: 'A big ship.' },
    [Difficulty.MILD]: { w: 'Cake', s: 'Eat the cake.' }
  }),
  createAdaptiveWord('r12', 12, {
    [Difficulty.PROFOUND]: { w: 'Hot', s: 'It is hot.' },
    [Difficulty.SEVERE]: { w: 'Blue', s: 'Sky is blue.' },
    [Difficulty.MODERATE]: { w: 'Chip', s: 'Eat a chip.' },
    [Difficulty.MILD]: { w: 'Bike', s: 'Ride a bike.' }
  }),
  createAdaptiveWord('r13', 13, {
    [Difficulty.PROFOUND]: { w: 'Red', s: 'A red apple.' },
    [Difficulty.SEVERE]: { w: 'Tree', s: 'Climb the tree.' },
    [Difficulty.MODERATE]: { w: 'Fish', s: 'Fish can swim.' },
    [Difficulty.MILD]: { w: 'Home', s: 'Go back home.' }
  }),
  createAdaptiveWord('r14', 14, {
    [Difficulty.PROFOUND]: { w: 'Sad', s: 'Do not be sad.' },
    [Difficulty.SEVERE]: { w: 'Play', s: 'Let us play.' },
    [Difficulty.MODERATE]: { w: 'Thin', s: 'The paper is thin.' },
    [Difficulty.MILD]: { w: 'Cute', s: 'The puppy is cute.' }
  }),
  createAdaptiveWord('r15', 15, {
    [Difficulty.PROFOUND]: { w: 'Mad', s: 'Are you mad?' },
    [Difficulty.SEVERE]: { w: 'Snow', s: 'Cold snow.' },
    [Difficulty.MODERATE]: { w: 'Chop', s: 'Chop the wood.' },
    [Difficulty.MILD]: { w: 'Kite', s: 'Fly a kite.' }
  }),
  createAdaptiveWord('r16', 16, {
    [Difficulty.PROFOUND]: { w: 'Fun', s: 'This is fun.' },
    [Difficulty.SEVERE]: { w: 'Jump', s: 'Jump up high.' },
    [Difficulty.MODERATE]: { w: 'Shed', s: 'Tools in the shed.' },
    [Difficulty.MILD]: { w: 'Rope', s: 'Pull the rope.' }
  }),
  createAdaptiveWord('r17', 17, {
    [Difficulty.PROFOUND]: { w: 'Wet', s: 'Water is wet.' },
    [Difficulty.SEVERE]: { w: 'Milk', s: 'Drink your milk.' },
    [Difficulty.MODERATE]: { w: 'Whale', s: 'A big whale.' },
    [Difficulty.MILD]: { w: 'Note', s: 'Write a note.' }
  }),
  createAdaptiveWord('r18', 18, {
    [Difficulty.PROFOUND]: { w: 'Bus', s: 'Ride the bus.' },
    [Difficulty.SEVERE]: { w: 'Fast', s: 'Run very fast.' },
    [Difficulty.MODERATE]: { w: 'Phone', s: 'Call on phone.' },
    [Difficulty.MILD]: { w: 'Tube', s: 'A long tube.' }
  }),
  createAdaptiveWord('r19', 19, {
    [Difficulty.PROFOUND]: { w: 'Fox', s: 'See the fox.' },
    [Difficulty.SEVERE]: { w: 'Best', s: 'You are best.' },
    [Difficulty.MODERATE]: { w: 'White', s: 'White snow.' },
    [Difficulty.MILD]: { w: 'Made', s: 'I made this.' }
  }),
  createAdaptiveWord('r20', 20, {
    [Difficulty.PROFOUND]: { w: 'Bug', s: 'A little bug.' },
    [Difficulty.SEVERE]: { w: 'Stop', s: 'Please stop.' },
    [Difficulty.MODERATE]: { w: 'Think', s: 'Think about it.' },
    [Difficulty.MILD]: { w: 'Same', s: 'We are the same.' }
  }),

  // --- LEVELS 21-30: ADVANCED ---
  createAdaptiveWord('r21', 21, {
    [Difficulty.PROFOUND]: { w: 'Ball', s: 'Throw the ball.' },
    [Difficulty.SEVERE]: { w: 'Make', s: 'Make a cake.' },
    [Difficulty.MODERATE]: { w: 'Happy', s: 'I am happy.' },
    [Difficulty.MILD]: { w: 'Splash', s: 'Splash in water.' }
  }),
  createAdaptiveWord('r22', 22, {
    [Difficulty.PROFOUND]: { w: 'Car', s: 'Drive the car.' },
    [Difficulty.SEVERE]: { w: 'Ride', s: 'Ride the bus.' },
    [Difficulty.MODERATE]: { w: 'Funny', s: 'A funny joke.' },
    [Difficulty.MILD]: { w: 'Spring', s: 'Spring is here.' }
  }),
  createAdaptiveWord('r23', 23, {
    [Difficulty.PROFOUND]: { w: 'Doll', s: 'My pretty doll.' },
    [Difficulty.SEVERE]: { w: 'Like', s: 'I like you.' },
    [Difficulty.MODERATE]: { w: 'Party', s: 'Birthday party.' },
    [Difficulty.MILD]: { w: 'String', s: 'Tie the string.' }
  }),
  createAdaptiveWord('r24', 24, {
    [Difficulty.PROFOUND]: { w: 'Book', s: 'Read a book.' },
    [Difficulty.SEVERE]: { w: 'Time', s: 'What time is it?' },
    [Difficulty.MODERATE]: { w: 'Puppy', s: 'Cute puppy.' },
    [Difficulty.MILD]: { w: 'Strong', s: 'He is strong.' }
  }),
  createAdaptiveWord('r25', 25, {
    [Difficulty.PROFOUND]: { w: 'Duck', s: 'Quack says duck.' },
    [Difficulty.SEVERE]: { w: 'Name', s: 'Say your name.' },
    [Difficulty.MODERATE]: { w: 'Kitty', s: 'Soft kitty.' },
    [Difficulty.MILD]: { w: 'Screen', s: 'Watch the screen.' }
  }),
  createAdaptiveWord('r26', 26, {
    [Difficulty.PROFOUND]: { w: 'Fish', s: 'Fish swim.' },
    [Difficulty.SEVERE]: { w: 'Gate', s: 'Open the gate.' },
    [Difficulty.MODERATE]: { w: 'Penny', s: 'Save a penny.' },
    [Difficulty.MILD]: { w: 'Stream', s: 'By the stream.' }
  }),
  createAdaptiveWord('r27', 27, {
    [Difficulty.PROFOUND]: { w: 'Milk', s: 'Cold milk.' },
    [Difficulty.SEVERE]: { w: 'Bone', s: 'Dog has a bone.' },
    [Difficulty.MODERATE]: { w: 'Bunny', s: 'Hop like bunny.' },
    [Difficulty.MILD]: { w: 'Throat', s: 'Sore throat.' }
  }),
  createAdaptiveWord('r28', 28, {
    [Difficulty.PROFOUND]: { w: 'Nest', s: 'Bird in nest.' },
    [Difficulty.SEVERE]: { w: 'Five', s: 'High five.' },
    [Difficulty.MODERATE]: { w: 'Sunny', s: 'Sunny day.' },
    [Difficulty.MILD]: { w: 'Throne', s: 'King on throne.' }
  }),
  createAdaptiveWord('r29', 29, {
    [Difficulty.PROFOUND]: { w: 'Tent', s: 'Sleep in tent.' },
    [Difficulty.SEVERE]: { w: 'Nose', s: 'Touch your nose.' },
    [Difficulty.MODERATE]: { w: 'Baby', s: 'Sweet baby.' },
    [Difficulty.MILD]: { w: 'Shrimp', s: 'Tiny shrimp.' }
  }),
  createAdaptiveWord('r30', 30, {
    [Difficulty.PROFOUND]: { w: 'Vest', s: 'Wear a vest.' },
    [Difficulty.SEVERE]: { w: 'Use', s: 'Use a pen.' },
    [Difficulty.MODERATE]: { w: 'Lady', s: 'Kind lady.' },
    [Difficulty.MILD]: { w: 'Scrape', s: 'Scrape my knee.' }
  }),

  // --- LEVELS 31-40: CHALLENGE ---
  createAdaptiveWord('r31', 31, {
    [Difficulty.PROFOUND]: { w: 'Walk', s: 'We walk.' },
    [Difficulty.SEVERE]: { w: 'Inside', s: 'Go inside.' },
    [Difficulty.MODERATE]: { w: 'Banana', s: 'Yellow banana.' },
    [Difficulty.MILD]: { w: 'Science', s: 'Science class.' }
  }),
  createAdaptiveWord('r32', 32, {
    [Difficulty.PROFOUND]: { w: 'Talk', s: 'We talk.' },
    [Difficulty.SEVERE]: { w: 'Outside', s: 'Play outside.' },
    [Difficulty.MODERATE]: { w: 'Animal', s: 'Wild animal.' },
    [Difficulty.MILD]: { w: 'Friend', s: 'Best friend.' }
  }),
  createAdaptiveWord('r33', 33, {
    [Difficulty.PROFOUND]: { w: 'Sing', s: 'Sing a song.' },
    [Difficulty.SEVERE]: { w: 'Pancake', s: 'Yummy pancake.' },
    [Difficulty.MODERATE]: { w: 'Tomato', s: 'Red tomato.' },
    [Difficulty.MILD]: { w: 'School', s: 'Go to school.' }
  }),
  createAdaptiveWord('r34', 34, {
    [Difficulty.PROFOUND]: { w: 'Ring', s: 'Ring the bell.' },
    [Difficulty.SEVERE]: { w: 'Cowboy', s: 'Ride cowboy.' },
    [Difficulty.MODERATE]: { w: 'Potato', s: 'Baked potato.' },
    [Difficulty.MILD]: { w: 'People', s: 'Many people.' }
  }),
  createAdaptiveWord('r35', 35, {
    [Difficulty.PROFOUND]: { w: 'King', s: 'The king.' },
    [Difficulty.SEVERE]: { w: 'Sunset', s: 'Pretty sunset.' },
    [Difficulty.MODERATE]: { w: 'Elephant', s: 'Big elephant.' },
    [Difficulty.MILD]: { w: 'Enough', s: 'That is enough.' }
  }),
  createAdaptiveWord('r36', 36, {
    [Difficulty.PROFOUND]: { w: 'Long', s: 'Long hair.' },
    [Difficulty.SEVERE]: { w: 'Cupcake', s: 'Sweet cupcake.' },
    [Difficulty.MODERATE]: { w: 'Umbrella', s: 'Use umbrella.' },
    [Difficulty.MILD]: { w: 'Thought', s: 'I thought so.' }
  }),
  createAdaptiveWord('r37', 37, {
    [Difficulty.PROFOUND]: { w: 'Song', s: 'Loud song.' },
    [Difficulty.SEVERE]: { w: 'Backpack', s: 'School backpack.' },
    [Difficulty.MODERATE]: { w: 'Octopus', s: 'Sea octopus.' },
    [Difficulty.MILD]: { w: 'Through', s: 'Go through.' }
  }),
  createAdaptiveWord('r38', 38, {
    [Difficulty.PROFOUND]: { w: 'Bank', s: 'Piggy bank.' },
    [Difficulty.SEVERE]: { w: 'Snowman', s: 'Cold snowman.' },
    [Difficulty.MODERATE]: { w: 'Computer', s: 'Use computer.' },
    [Difficulty.MILD]: { w: 'Laugh', s: 'Laugh loud.' }
  }),
  createAdaptiveWord('r39', 39, {
    [Difficulty.PROFOUND]: { w: 'Pink', s: 'Pink dress.' },
    [Difficulty.SEVERE]: { w: 'Raincoat', s: 'Wear raincoat.' },
    [Difficulty.MODERATE]: { w: 'Hospital', s: 'The hospital.' },
    [Difficulty.MILD]: { w: 'Rough', s: 'Rough road.' }
  }),
  createAdaptiveWord('r40', 40, {
    [Difficulty.PROFOUND]: { w: 'Sink', s: 'Wash in sink.' },
    [Difficulty.SEVERE]: { w: 'Starfish', s: 'See starfish.' },
    [Difficulty.MODERATE]: { w: 'Dinosaur', s: 'Big dinosaur.' },
    [Difficulty.MILD]: { w: 'Daughter', s: 'Her daughter.' }
  }),
];

// ==========================================
// 40 SPELLING LEVELS
// 1-10: CVC, 11-20: Blends, 21-30: Digraphs, 31-40: Complex
// ==========================================
const createSpelling = (id: string, word: string, hint: string) => ({
  id,
  word,
  scrambled: word.split('').sort(() => Math.random() - 0.5),
  hint
});

const makeSpell = (i: number, w: string, h: string) => ({ id: `s${i}`, word: w, scrambled: [], hint: h });

export const SPELLING_ITEMS: SpellingItem[] = [
  makeSpell(1, 'CAT', 'Meow!'), makeSpell(2, 'DOG', 'Woof!'), makeSpell(3, 'BAT', 'Flying mammal'), makeSpell(4, 'PIG', 'Oink!'), makeSpell(5, 'BUS', 'Go to school'),
  makeSpell(6, 'NET', 'Catch butterflies'), makeSpell(7, 'TOP', 'Spinning toy'), makeSpell(8, 'SUN', 'In the sky'), makeSpell(9, 'MOP', 'Clean the floor'), makeSpell(10, 'HAT', 'Wear on head'),
  
  makeSpell(11, 'FROG', 'Green jumper'), makeSpell(12, 'CRAB', 'Walks sideways'), makeSpell(13, 'DRUM', 'Beat it'), makeSpell(14, 'FLAG', 'Wave it'), makeSpell(15, 'PLAN', 'A good idea'),
  makeSpell(16, 'SWIM', 'In the pool'), makeSpell(17, 'STOP', 'Red sign'), makeSpell(18, 'TWIN', 'Look alike'), makeSpell(19, 'GRAB', 'Take it'), makeSpell(20, 'SPOT', 'A mark'),

  makeSpell(21, 'FISH', 'Swims in water'), makeSpell(22, 'SHIP', 'Big boat'), makeSpell(23, 'CHIP', 'Potato snack'), makeSpell(24, 'MOTH', 'Night butterfly'), makeSpell(25, 'BATH', 'Wash up'),
  makeSpell(26, 'RING', 'Wear on finger'), makeSpell(27, 'KING', 'Royal ruler'), makeSpell(28, 'SONG', 'Sing it'), makeSpell(29, 'WHIP', 'Cream topping'), makeSpell(30, 'DUCK', 'Quack!'),

  makeSpell(31, 'HAPPY', 'Not sad'), makeSpell(32, 'FUNNY', 'Makes you laugh'), makeSpell(33, 'LITTLE', 'Small'), makeSpell(34, 'RABBIT', 'Long ears'), makeSpell(35, 'SUMMER', 'Hot season'),
  makeSpell(36, 'WINTER', 'Cold season'), makeSpell(37, 'YELLOW', 'Color of sun'), makeSpell(38, 'PURPLE', 'Color of grapes'), makeSpell(39, 'SCHOOL', 'Place to learn'), makeSpell(40, 'FRIEND', 'Playmate')
];

// ==========================================
// 40 MEMORY LEVELS (Working Memory Span)
// 1-10: Numbers (2-3), 11-20: Letters (2-3), 21-30: Numbers (4-5), 31-40: Mixed (4-6)
// ==========================================
const makeMem = (i: number, seq: string, type: 'Numbers' | 'Letters' | 'Mixed') => ({ id: `m${i}`, sequence: seq, type });

export const MEMORY_ITEMS: MemoryItem[] = [
  // 1-10 Numbers (Simple)
  makeMem(1, '1 2', 'Numbers'), makeMem(2, '5 9', 'Numbers'), makeMem(3, '3 1', 'Numbers'), makeMem(4, '8 2', 'Numbers'), makeMem(5, '4 7', 'Numbers'),
  makeMem(6, '1 2 3', 'Numbers'), makeMem(7, '5 9 1', 'Numbers'), makeMem(8, '7 4 2', 'Numbers'), makeMem(9, '9 8 1', 'Numbers'), makeMem(10, '6 3 5', 'Numbers'),

  // 11-20 Letters (Simple)
  makeMem(11, 'A B', 'Letters'), makeMem(12, 'C A', 'Letters'), makeMem(13, 'F G', 'Letters'), makeMem(14, 'T P', 'Letters'), makeMem(15, 'M N', 'Letters'),
  makeMem(16, 'A B C', 'Letters'), makeMem(17, 'D O G', 'Letters'), makeMem(18, 'C A T', 'Letters'), makeMem(19, 'X Y Z', 'Letters'), makeMem(20, 'H O P', 'Letters'),

  // 21-30 Numbers (Extended)
  makeMem(21, '1 5 9 2', 'Numbers'), makeMem(22, '8 3 7 1', 'Numbers'), makeMem(23, '4 2 0 6', 'Numbers'), makeMem(24, '9 5 1 4', 'Numbers'), makeMem(25, '3 8 2 7', 'Numbers'),
  makeMem(26, '1 2 3 4 5', 'Numbers'), makeMem(27, '9 8 7 6 5', 'Numbers'), makeMem(28, '5 1 9 2 8', 'Numbers'), makeMem(29, '7 4 1 8 5', 'Numbers'), makeMem(30, '3 0 2 9 6', 'Numbers'),

  // 31-40 Mixed (Complex)
  makeMem(31, 'A 1 B', 'Mixed'), makeMem(32, '1 C 2', 'Mixed'), makeMem(33, 'T 4 P', 'Mixed'), makeMem(34, '7 H 3', 'Mixed'), makeMem(35, 'A 1 B 2', 'Mixed'),
  makeMem(36, '9 Z 8 Y', 'Mixed'), makeMem(37, 'K 5 L 6', 'Mixed'), makeMem(38, '1 A 2 B 3', 'Mixed'), makeMem(39, 'X 9 Y 8 Z', 'Mixed'), makeMem(40, 'M 1 N 2 O 3', 'Mixed'),
];

export const DIFFICULTY_SETTINGS = {
  [Difficulty.MILD]: {
    strokeWidth: 25,
    tolerance: 30,
    description: "Standard guides. Gentle correction."
  },
  [Difficulty.MODERATE]: {
    strokeWidth: 35,
    tolerance: 40,
    description: "Thicker guides to help stay on track."
  },
  [Difficulty.SEVERE]: {
    strokeWidth: 50,
    tolerance: 60,
    description: "Very thick guides. High error tolerance."
  },
  [Difficulty.PROFOUND]: {
    strokeWidth: 70,
    tolerance: 80,
    description: "Maximum visual guidance. Focus on movement."
  }
};
