export type QuizCategory = 'all' | 'science' | 'animals' | 'world';

export interface QuizQuestion {
  id: string;
  category: Exclude<QuizCategory, 'all'>;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  fact: string;
  benCorrectLine: string;
  benWrongLine: string;
}

export interface QuizSession {
  category: QuizCategory;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  selectedOption: number | null;
  lastPointsAwarded: number;
  isRevealed: boolean;
  timeRemaining: number;
  questionDuration: number;
  isFinished: boolean;
}

export const QUESTIONS_PER_ROUND = 8;
export const QUESTION_TIME_SECONDS = 20;

export const QUIZ_BANK: QuizQuestion[] = [
  {
    id: 'sci-1',
    category: 'science',
    prompt: 'Which gas makes up roughly 78% of the air we breathe on Earth?',
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'],
    correctIndex: 1,
    fact: 'Nitrogen accounts for 78% of Earth atmosphere, while oxygen is around 21%.',
    benCorrectLine: 'Yes! Classic lab air.',
    benWrongLine: 'No. Check the beaker label again.',
  },
  {
    id: 'sci-2',
    category: 'science',
    prompt: 'What is the chemical symbol for table salt, sodium chloride?',
    options: ['KCl', 'H2O', 'NaCl', 'CaCO3'],
    correctIndex: 2,
    fact: 'Sodium (Na) plus Chlorine (Cl) forms common crystal salt, NaCl.',
    benCorrectLine: 'Yes! Pure chemistry.',
    benWrongLine: 'No. Keep that off my pretzels.',
  },
  {
    id: 'sci-3',
    category: 'science',
    prompt: 'Which planet in our solar system spins on its side at nearly 98 degrees?',
    options: ['Venus', 'Uranus', 'Saturn', 'Neptune'],
    correctIndex: 1,
    fact: 'Uranus has an extreme axial tilt of 98 degrees, making it roll around the Sun.',
    benCorrectLine: 'Yes! Sideways spinner.',
    benWrongLine: 'No. Wrong telescope setting.',
  },
  {
    id: 'sci-4',
    category: 'science',
    prompt: 'At what temperature are Celsius and Fahrenheit exactly equal?',
    options: ['0 degrees', '-32 degrees', '-40 degrees', '100 degrees'],
    correctIndex: 2,
    fact: 'Both temperature scales cross at -40 degrees.',
    benCorrectLine: 'Yes! Freezing math.',
    benWrongLine: 'No. Recalibrate the thermometer.',
  },
  {
    id: 'sci-5',
    category: 'science',
    prompt: 'Which metal stays liquid at standard room temperature?',
    options: ['Gallium', 'Mercury', 'Lead', 'Zinc'],
    correctIndex: 1,
    fact: 'Mercury melts at -38.8 degrees Celsius, remaining liquid on a lab bench.',
    benCorrectLine: 'Yes! Shiny puddle.',
    benWrongLine: 'No. Too solid for that.',
  },
  {
    id: 'sci-6',
    category: 'science',
    prompt: 'What part of a plant cell performs photosynthesis using sunlight?',
    options: ['Chloroplast', 'Mitochondria', 'Ribosome', 'Vacuole'],
    correctIndex: 0,
    fact: 'Chloroplasts hold chlorophyll, capturing light energy to make sugars.',
    benCorrectLine: 'Yes! Green solar power.',
    benWrongLine: 'No. Look under the microscope.',
  },
  {
    id: 'sci-7',
    category: 'science',
    prompt: 'Roughly how long does light from the Sun take to reach Earth?',
    options: ['8 seconds', '8 minutes', '8 hours', '8 days'],
    correctIndex: 1,
    fact: 'Sunlight travels 150 million kilometers in about 8 minutes and 20 seconds.',
    benCorrectLine: 'Yes! Fast delivery.',
    benWrongLine: 'No. Speed of light is strict.',
  },
  {
    id: 'sci-8',
    category: 'science',
    prompt: 'What instrument measures atmospheric air pressure to forecast weather?',
    options: ['Anemometer', 'Barometer', 'Hygrometer', 'Spectrometer'],
    correctIndex: 1,
    fact: 'A barometer tracks rising or falling air pressure ahead of storms.',
    benCorrectLine: 'Yes! Storm watcher.',
    benWrongLine: 'No. Wrong dial on my desk.',
  },
  {
    id: 'ani-1',
    category: 'animals',
    prompt: 'How many hearts does an octopus have?',
    options: ['One', 'Two', 'Three', 'Four'],
    correctIndex: 2,
    fact: 'An octopus uses two branchial hearts for its gills and one systemic heart for its body.',
    benCorrectLine: 'Yes! Triple pulse.',
    benWrongLine: 'No. Count the tentacles later, hearts first.',
  },
  {
    id: 'ani-2',
    category: 'animals',
    prompt: 'Which scent receptors make dogs able to smell far better than humans?',
    options: ['Olfactory receptors', 'Gustatory papillae', 'Retinal cones', 'Cochlear hairs'],
    correctIndex: 0,
    fact: 'Dogs carry up to 300 million olfactory receptors in their noses compared to 6 million in humans.',
    benCorrectLine: 'Yes! Good nose, right?',
    benWrongLine: 'No. Trust a dog on noses.',
  },
  {
    id: 'ani-3',
    category: 'animals',
    prompt: 'Which mammal is capable of true sustained flight?',
    options: ['Flying squirrel', 'Sugar glider', 'Bat', 'Colugo'],
    correctIndex: 2,
    fact: 'Bats are the only mammals with powered flight; the others only glide.',
    benCorrectLine: 'Yes! Winged night flyer.',
    benWrongLine: 'No. Gliding does not count.',
  },
  {
    id: 'ani-4',
    category: 'animals',
    prompt: 'What is a group of crows commonly called?',
    options: ['A parliament', 'A murder', 'A caravan', 'A kettle'],
    correctIndex: 1,
    fact: 'Traditional collective nouns name a flock of crows a murder and owls a parliament.',
    benCorrectLine: 'Yes! Spooky vocabulary.',
    benWrongLine: 'No. Check the field guide.',
  },
  {
    id: 'ani-5',
    category: 'animals',
    prompt: 'Which sea creature has teeth strong enough to scrape rock and never wears them down?',
    options: ['Limpet', 'Seahorse', 'Jellyfish', 'Manatee'],
    correctIndex: 0,
    fact: 'Limpet teeth contain goethite nanofibers, making them one of nature strongest biological materials.',
    benCorrectLine: 'Yes! Tiny rock-chewer.',
    benWrongLine: 'No. Tougher than steel, actually.',
  },
  {
    id: 'ani-6',
    category: 'animals',
    prompt: 'Which bird can fly backward as well as hover in place?',
    options: ['Swift', 'Kingfisher', 'Hummingbird', 'Albatross'],
    correctIndex: 2,
    fact: 'Hummingbirds rotate their wings in a figure-eight pattern for full directional flight.',
    benCorrectLine: 'Yes! Reverse gear feathers.',
    benWrongLine: 'No. Too heavy for reverse.',
  },
  {
    id: 'ani-7',
    category: 'animals',
    prompt: 'Where are a cricket ears located?',
    options: ['On its antennae', 'On its front legs', 'On its wings', 'Behind its eyes'],
    correctIndex: 1,
    fact: 'Crickets have tympanal membranes tucked just below the knees of their front legs.',
    benCorrectLine: 'Yes! Knee listeners.',
    benWrongLine: 'No. Look at the front knees.',
  },
  {
    id: 'ani-8',
    category: 'animals',
    prompt: 'Which animal sleeps standing up while locking its leg joints?',
    options: ['Horse', 'Wolf', 'Otter', 'Badger'],
    correctIndex: 0,
    fact: 'Horses use a stay apparatus of ligaments and tendons to rest upright without tiring.',
    benCorrectLine: 'Yes! Standing nap.',
    benWrongLine: 'No. I prefer the armchair.',
  },
  {
    id: 'wld-1',
    category: 'world',
    prompt: 'Which ocean is the deepest on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Southern Ocean'],
    correctIndex: 2,
    fact: 'The Mariana Trench in the Pacific plunges nearly 11 kilometers below sea level.',
    benCorrectLine: 'Yes! Deep blue lab.',
    benWrongLine: 'No. Aim deeper.',
  },
  {
    id: 'wld-2',
    category: 'world',
    prompt: 'Which country contains more than half of all natural lakes in the world?',
    options: ['Finland', 'Canada', 'Norway', 'Brazil'],
    correctIndex: 1,
    fact: 'Canada is home to over 879,000 lakes, more than every other nation combined.',
    benCorrectLine: 'Yes! Plenty of fetch water.',
    benWrongLine: 'No. Check the northern map.',
  },
  {
    id: 'wld-3',
    category: 'world',
    prompt: 'Which musical instrument traditionally has 88 keys?',
    options: ['Accordion', 'Harpsichord', 'Grand piano', 'Pipe organ'],
    correctIndex: 2,
    fact: 'Modern standard pianos feature 52 white keys and 36 black keys, totaling 88.',
    benCorrectLine: 'Yes! Eighty-eight ivories.',
    benWrongLine: 'No. Count the octaves.',
  },
  {
    id: 'wld-4',
    category: 'world',
    prompt: 'Which ancient wonder stood in the harbor of Alexandria, Egypt?',
    options: ['Colossus of Rhodes', 'Lighthouse of Alexandria', 'Hanging Gardens', 'Temple of Artemis'],
    correctIndex: 1,
    fact: 'The Pharos Lighthouse guided ships into Alexandria for centuries with a giant mirror.',
    benCorrectLine: 'Yes! Bright beacon.',
    benWrongLine: 'No. Wrong port city.',
  },
  {
    id: 'wld-5',
    category: 'world',
    prompt: 'What is the hardest naturally occurring mineral on the Mohs scale?',
    options: ['Quartz', 'Corundum', 'Topaz', 'Diamond'],
    correctIndex: 3,
    fact: 'Diamond sits at 10 on the Mohs hardness scale.',
    benCorrectLine: 'Yes! Unscratchable.',
    benWrongLine: 'No. Needs carbon pressure.',
  },
  {
    id: 'wld-6',
    category: 'world',
    prompt: 'Which invention uses Morse code dots and dashes over wires?',
    options: ['Phonograph', 'Telegraph', 'Barograph', 'Kaleidoscope'],
    correctIndex: 1,
    fact: 'Samuel Morse electrical telegraph revolutionized long-distance messaging in the 1840s.',
    benCorrectLine: 'Yes! Beep-beep-dash.',
    benWrongLine: 'No. Wrong wire.',
  },
  {
    id: 'wld-7',
    category: 'world',
    prompt: 'Which spice comes from the dried stigmas of a crocus flower?',
    options: ['Turmeric', 'Cardamom', 'Saffron', 'Nutmeg'],
    correctIndex: 2,
    fact: 'Each crocus bloom yields just three delicate crimson stigmas, making saffron precious.',
    benCorrectLine: 'Yes! Fancy pantry pick.',
    benWrongLine: 'No. Smell the jar again.',
  },
  {
    id: 'wld-8',
    category: 'world',
    prompt: 'In binary code, what decimal number does 1010 represent?',
    options: ['6', '8', '10', '12'],
    correctIndex: 2,
    fact: 'Binary 1010 equals 1x8 + 0x4 + 1x2 + 0x1, which is 10.',
    benCorrectLine: 'Yes! Solid binary.',
    benWrongLine: 'No. Check the twos place.',
  },
];

export function shuffleQuestions(items: QuizQuestion[], rng: () => number = Math.random): QuizQuestion[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createQuizSession(
  category: QuizCategory,
  rng: () => number = Math.random
): QuizSession {
  const pool =
    category === 'all'
      ? QUIZ_BANK
      : QUIZ_BANK.filter((q) => q.category === category);
  const selected = shuffleQuestions(pool, rng).slice(0, QUESTIONS_PER_ROUND);

  return {
    category,
    questions: selected,
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctCount: 0,
    selectedOption: null,
    lastPointsAwarded: 0,
    isRevealed: false,
    timeRemaining: QUESTION_TIME_SECONDS,
    questionDuration: QUESTION_TIME_SECONDS,
    isFinished: false,
  };
}

export function submitAnswer(
  session: QuizSession,
  optionIndex: number
): { session: QuizSession; isCorrect: boolean } {
  if (session.isRevealed || session.isFinished) {
    return { session, isCorrect: false };
  }

  const current = session.questions[session.currentIndex];
  const isCorrect = optionIndex === current.correctIndex;
  const nextStreak = isCorrect ? session.streak + 1 : 0;
  const nextBestStreak = Math.max(session.bestStreak, nextStreak);
  const timeBonus = isCorrect ? Math.round(session.timeRemaining * 5) : 0;
  const streakBonus = isCorrect ? (nextStreak - 1) * 25 : 0;
  const points = isCorrect ? 100 + timeBonus + streakBonus : 0;

  return {
    isCorrect,
    session: {
      ...session,
      selectedOption: optionIndex,
      isRevealed: true,
      lastPointsAwarded: points,
      score: session.score + points,
      streak: nextStreak,
      bestStreak: nextBestStreak,
      correctCount: session.correctCount + (isCorrect ? 1 : 0),
    },
  };
}

export function tickQuestionTimer(session: QuizSession, dt: number): {
  session: QuizSession;
  timedOut: boolean;
} {
  if (session.isRevealed || session.isFinished) {
    return { session, timedOut: false };
  }
  const nextTime = Math.max(0, session.timeRemaining - dt);
  if (nextTime === 0) {
    return {
      timedOut: true,
      session: {
        ...session,
        timeRemaining: 0,
        selectedOption: -1,
        isRevealed: true,
        lastPointsAwarded: 0,
        streak: 0,
      },
    };
  }
  return {
    timedOut: false,
    session: {
      ...session,
      timeRemaining: nextTime,
    },
  };
}

export function advanceQuestion(session: QuizSession): QuizSession {
  if (!session.isRevealed || session.isFinished) {
    return session;
  }
  const nextIndex = session.currentIndex + 1;
  if (nextIndex >= session.questions.length) {
    return {
      ...session,
      isFinished: true,
    };
  }
  return {
    ...session,
    currentIndex: nextIndex,
    selectedOption: null,
    lastPointsAwarded: 0,
    isRevealed: false,
    timeRemaining: session.questionDuration,
  };
}

export function getQuizSummary(session: QuizSession): {
  accuracyPercent: number;
  rankTitle: string;
  totalQuestions: number;
} {
  const total = session.questions.length;
  const accuracy = total > 0 ? Math.round((session.correctCount / total) * 100) : 0;
  let rankTitle = 'Lab Apprentice';
  if (accuracy >= 90) {
    rankTitle = 'Chief Alchemist';
  } else if (accuracy >= 70) {
    rankTitle = 'Senior Researcher';
  } else if (accuracy >= 50) {
    rankTitle = 'Bench Assistant';
  }
  return {
    accuracyPercent: accuracy,
    rankTitle,
    totalQuestions: total,
  };
}
