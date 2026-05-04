import { Question, PlayerMode } from './types';

export const KID_QUESTIONS: Question[] = [
  // Counting (max 5, with visuals)
  { id: 'k1',  text: 'How many apples?',    visual: '🍎',           options: ['1', '2', '3', '4'], correct: '1', mode: 'kid' },
  { id: 'k2',  text: 'How many stars?',     visual: '⭐⭐',          options: ['1', '2', '3', '4'], correct: '2', mode: 'kid' },
  { id: 'k3',  text: 'How many dogs?',      visual: '🐶🐶🐶',       options: ['2', '3', '4', '5'], correct: '3', mode: 'kid' },
  { id: 'k4',  text: 'How many hearts?',    visual: '❤️❤️❤️❤️',    options: ['2', '3', '4', '5'], correct: '4', mode: 'kid' },
  { id: 'k5',  text: 'How many fish?',      visual: '🐠🐠🐠🐠🐠',  options: ['3', '4', '5', '6'], correct: '5', mode: 'kid' },
  { id: 'k6',  text: 'How many cakes?',     visual: '🎂🎂',          options: ['1', '2', '3', '4'], correct: '2', mode: 'kid' },
  { id: 'k7',  text: 'How many suns?',      visual: '☀️☀️☀️',       options: ['2', '3', '4', '5'], correct: '3', mode: 'kid' },
  { id: 'k8',  text: 'How many cookies?',   visual: '🍪🍪🍪🍪',     options: ['2', '3', '4', '5'], correct: '4', mode: 'kid' },
  { id: 'k9',  text: 'How many balloons?',  visual: '🎈',            options: ['1', '2', '3', '4'], correct: '1', mode: 'kid' },
  { id: 'k10', text: 'How many bananas?',   visual: '🍌🍌🍌🍌🍌',  options: ['3', '4', '5', '6'], correct: '5', mode: 'kid' },

  // Colors
  { id: 'k11', text: 'What color is the sky?',      visual: '☁️',   options: ['Red', 'Blue', 'Green', 'Yellow'],  correct: 'Blue',   mode: 'kid' },
  { id: 'k12', text: 'What color is grass?',        visual: '🌿',   options: ['Blue', 'Red', 'Green', 'Orange'],  correct: 'Green',  mode: 'kid' },
  { id: 'k13', text: 'What color is a banana?',     visual: '🍌',   options: ['Red', 'Blue', 'Purple', 'Yellow'], correct: 'Yellow', mode: 'kid' },
  { id: 'k14', text: 'What color is a strawberry?', visual: '🍓',   options: ['Blue', 'Red', 'Green', 'Yellow'],  correct: 'Red',    mode: 'kid' },
  { id: 'k15', text: 'What color is a carrot?',     visual: '🥕',   options: ['Blue', 'Yellow', 'Orange', 'Red'], correct: 'Orange', mode: 'kid' },
  { id: 'k16', text: 'What color is a grape?',      visual: '🍇',   options: ['Red', 'Green', 'Yellow', 'Purple'],correct: 'Purple', mode: 'kid' },
  { id: 'k17', text: 'What color is snow?',         visual: '❄️',   options: ['White', 'Blue', 'Yellow', 'Red'],  correct: 'White',  mode: 'kid' },
  { id: 'k18', text: 'What color is a fire truck?', visual: '🚒',   options: ['Blue', 'Yellow', 'Red', 'Green'],  correct: 'Red',    mode: 'kid' },

  // Animal sounds
  { id: 'k19', text: 'What does a dog say?',   visual: '🐶', options: ['Moo', 'Meow', 'Woof', 'Quack'],  correct: 'Woof',  mode: 'kid' },
  { id: 'k20', text: 'What does a cat say?',   visual: '🐱', options: ['Woof', 'Oink', 'Moo', 'Meow'],   correct: 'Meow',  mode: 'kid' },
  { id: 'k21', text: 'What does a cow say?',   visual: '🐄', options: ['Woof', 'Moo', 'Quack', 'Roar'],  correct: 'Moo',   mode: 'kid' },
  { id: 'k22', text: 'What does a duck say?',  visual: '🦆', options: ['Moo', 'Woof', 'Quack', 'Oink'],  correct: 'Quack', mode: 'kid' },
  { id: 'k23', text: 'What does a pig say?',   visual: '🐷', options: ['Moo', 'Oink', 'Woof', 'Meow'],   correct: 'Oink',  mode: 'kid' },
  { id: 'k24', text: 'What does a sheep say?', visual: '🐑', options: ['Moo', 'Woof', 'Baa', 'Quack'],   correct: 'Baa',   mode: 'kid' },
  { id: 'k25', text: 'What does a lion say?',  visual: '🦁', options: ['Moo', 'Roar', 'Quack', 'Meow'],  correct: 'Roar',  mode: 'kid' },
  { id: 'k26', text: 'What does a frog say?',  visual: '🐸', options: ['Quack', 'Moo', 'Ribbit', 'Woof'],correct: 'Ribbit',mode: 'kid' },

  // Simple body parts / "how many"
  { id: 'k27', text: 'How many eyes do you have?',  options: ['1', '2', '3', '4'], correct: '2', mode: 'kid' },
  { id: 'k28', text: 'How many ears do you have?',  options: ['1', '2', '3', '4'], correct: '2', mode: 'kid' },
  { id: 'k29', text: 'How many noses do you have?', options: ['1', '2', '3', '4'], correct: '1', mode: 'kid' },
  { id: 'k30', text: 'How many hands do you have?', options: ['1', '2', '3', '4'], correct: '2', mode: 'kid' },
  { id: 'k31', text: 'How many legs do you have?',  options: ['1', '2', '3', '4'], correct: '2', mode: 'kid' },

  // Simple shapes
  { id: 'k32', text: 'What shape is a ball?',          visual: '⚽', options: ['Square', 'Triangle', 'Circle', 'Rectangle'], correct: 'Circle',    mode: 'kid' },
  { id: 'k33', text: 'What shape has 3 sides?',                      options: ['Circle', 'Square', 'Triangle', 'Rectangle'], correct: 'Triangle',  mode: 'kid' },
  { id: 'k34', text: 'What shape is a book?',          visual: '📚', options: ['Circle', 'Rectangle', 'Triangle', 'Star'],   correct: 'Rectangle', mode: 'kid' },
  { id: 'k35', text: 'What shape has 4 equal sides?',               options: ['Circle', 'Triangle', 'Square', 'Rectangle'], correct: 'Square',    mode: 'kid' },

  // Simple "what is this / which one"
  { id: 'k36', text: 'Which one do you eat?',           visual: '🍕 🚗 📚 🎸', options: ['Car', 'Pizza', 'Book', 'Guitar'],  correct: 'Pizza',   mode: 'kid' },
  { id: 'k37', text: 'Which one can fly?',              visual: '🐦 🐟 🐸 🐌', options: ['Fish', 'Frog', 'Bird', 'Snail'],  correct: 'Bird',    mode: 'kid' },
  { id: 'k38', text: 'Which one do you wear?',          visual: '👟 🍕 🌸 📚', options: ['Pizza', 'Flower', 'Shoe', 'Book'], correct: 'Shoe',    mode: 'kid' },
  { id: 'k39', text: 'Where do fish live?',             visual: '🐠',           options: ['Trees', 'Sky', 'Water', 'Sand'],  correct: 'Water',   mode: 'kid' },
  { id: 'k40', text: 'What do you drink?',              visual: '🥛',           options: ['Rock', 'Milk', 'Sand', 'Paper'],  correct: 'Milk',    mode: 'kid' },
  { id: 'k41', text: 'Which one is an animal?',         visual: '🐶 🚗 🌈 🍕', options: ['Car', 'Rainbow', 'Dog', 'Pizza'], correct: 'Dog',     mode: 'kid' },
  { id: 'k42', text: 'What do you use to eat soup?',    visual: '🥣',           options: ['Fork', 'Spoon', 'Knife', 'Straw'],correct: 'Spoon',   mode: 'kid' },
  { id: 'k43', text: 'Which animal is the biggest?',   visual: '🐘 🐭 🐱',    options: ['Mouse', 'Cat', 'Elephant', 'Same'],correct: 'Elephant',mode: 'kid' },
  { id: 'k44', text: 'What do you do with a book?',    visual: '📚',           options: ['Eat', 'Read', 'Drink', 'Wear'],   correct: 'Read',    mode: 'kid' },
  { id: 'k45', text: 'Which one gives us light?',       visual: '☀️ 🍕 🚗 🐕', options: ['Pizza', 'Sun', 'Car', 'Dog'],     correct: 'Sun',     mode: 'kid' },
  { id: 'k46', text: 'What does a baby sleep in?',      visual: '🛏️',          options: ['Crib', 'Box', 'Pool', 'Chair'],   correct: 'Crib',    mode: 'kid' },
  { id: 'k47', text: 'Which is hot?',                   visual: '🔥 ❄️',        options: ['Snow', 'Ice', 'Fire', 'Rain'],    correct: 'Fire',    mode: 'kid' },
  { id: 'k48', text: 'What do you use to brush teeth?', visual: '🪥',           options: ['Fork', 'Spoon', 'Toothbrush', 'Pen'], correct: 'Toothbrush', mode: 'kid' },
  { id: 'k49', text: 'Which animal hops?',              visual: '🐰 🐘 🐟 🦆', options: ['Elephant', 'Fish', 'Duck', 'Rabbit'], correct: 'Rabbit', mode: 'kid' },
  { id: 'k50', text: 'What color is a pumpkin?',        visual: '🎃',           options: ['Blue', 'Green', 'Orange', 'Red'],     correct: 'Orange', mode: 'kid' },
];

export const GROWN_UP_QUESTIONS: Question[] = [
  {
    id: 'g1',
    text: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correct: 'Paris',
    mode: 'grown-up',
  },
  {
    id: 'g2',
    text: 'How many planets are in our solar system?',
    options: ['7', '8', '9', '10'],
    correct: '8',
    mode: 'grown-up',
  },
  {
    id: 'g3',
    text: 'Who wrote Romeo and Juliet?',
    options: ['Dickens', 'Shakespeare', 'Hemingway', 'Austen'],
    correct: 'Shakespeare',
    mode: 'grown-up',
  },
  {
    id: 'g4',
    text: 'What is the chemical formula for water?',
    options: ['CO2', 'O2', 'H2O', 'NaCl'],
    correct: 'H2O',
    mode: 'grown-up',
  },
  {
    id: 'g5',
    text: 'How many sides does a hexagon have?',
    options: ['5', '6', '7', '8'],
    correct: '6',
    mode: 'grown-up',
  },
  {
    id: 'g6',
    text: 'In what year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correct: '1945',
    mode: 'grown-up',
  },
  {
    id: 'g7',
    text: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correct: 'Pacific',
    mode: 'grown-up',
  },
  {
    id: 'g8',
    text: 'Who painted the Mona Lisa?',
    options: ['Picasso', 'Van Gogh', 'Da Vinci', 'Michelangelo'],
    correct: 'Da Vinci',
    mode: 'grown-up',
  },
  {
    id: 'g9',
    text: 'What is the capital of Japan?',
    options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
    correct: 'Tokyo',
    mode: 'grown-up',
  },
  {
    id: 'g10',
    text: 'What is the square root of 144?',
    options: ['10', '11', '12', '13'],
    correct: '12',
    mode: 'grown-up',
  },
  {
    id: 'g11',
    text: 'How many continents are there?',
    options: ['5', '6', '7', '8'],
    correct: '7',
    mode: 'grown-up',
  },
  {
    id: 'g12',
    text: 'What is the fastest land animal?',
    options: ['Lion', 'Horse', 'Cheetah', 'Greyhound'],
    correct: 'Cheetah',
    mode: 'grown-up',
  },
  {
    id: 'g13',
    text: 'What gas do plants absorb from the air?',
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    correct: 'Carbon Dioxide',
    mode: 'grown-up',
  },
  {
    id: 'g14',
    text: 'How many bones are in the adult human body?',
    options: ['186', '196', '206', '216'],
    correct: '206',
    mode: 'grown-up',
  },
  {
    id: 'g15',
    text: 'Who invented the telephone?',
    options: ['Edison', 'Tesla', 'Bell', 'Marconi'],
    correct: 'Bell',
    mode: 'grown-up',
  },
  {
    id: 'g16',
    text: 'What is the smallest planet in our solar system?',
    options: ['Mars', 'Mercury', 'Pluto', 'Venus'],
    correct: 'Mercury',
    mode: 'grown-up',
  },
  {
    id: 'g17',
    text: 'In which country was the game of chess invented?',
    options: ['China', 'Egypt', 'India', 'Persia'],
    correct: 'India',
    mode: 'grown-up',
  },
  {
    id: 'g18',
    text: 'What is the longest river in the world?',
    options: ['Amazon', 'Mississippi', 'Nile', 'Yangtze'],
    correct: 'Nile',
    mode: 'grown-up',
  },
  {
    id: 'g19',
    text: 'How many strings does a standard guitar have?',
    options: ['4', '5', '6', '7'],
    correct: '6',
    mode: 'grown-up',
  },
  {
    id: 'g20',
    text: 'What year did the Titanic sink?',
    options: ['1910', '1912', '1914', '1916'],
    correct: '1912',
    mode: 'grown-up',
  },
  { id: 'g21', text: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 'Canberra', mode: 'grown-up' },
  { id: 'g22', text: 'How many players are on a standard soccer team?', options: ['9', '10', '11', '12'], correct: '11', mode: 'grown-up' },
  { id: 'g23', text: 'What element has the symbol "Au"?', options: ['Silver', 'Gold', 'Aluminum', 'Copper'], correct: 'Gold', mode: 'grown-up' },
  { id: 'g24', text: 'Who was the first US President?', options: ['Lincoln', 'Jefferson', 'Washington', 'Adams'], correct: 'Washington', mode: 'grown-up' },
  { id: 'g25', text: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Quartz'], correct: 'Diamond', mode: 'grown-up' },
  { id: 'g26', text: 'How many feet are in a mile?', options: ['2,640', '5,280', '7,920', '10,560'], correct: '5,280', mode: 'grown-up' },
  { id: 'g27', text: 'Which country has the largest population?', options: ['USA', 'India', 'China', 'Russia'], correct: 'India', mode: 'grown-up' },
  { id: 'g28', text: 'What is the speed of light (approx) in km/s?', options: ['150,000', '200,000', '300,000', '400,000'], correct: '300,000', mode: 'grown-up' },
  { id: 'g29', text: 'In what year did the Berlin Wall fall?', options: ['1987', '1989', '1991', '1993'], correct: '1989', mode: 'grown-up' },
  { id: 'g30', text: 'What is the largest planet in our solar system?', options: ['Saturn', 'Neptune', 'Jupiter', 'Uranus'], correct: 'Jupiter', mode: 'grown-up' },
  { id: 'g31', text: 'Who wrote "Pride and Prejudice"?', options: ['Brontë', 'Austen', 'Eliot', 'Woolf'], correct: 'Austen', mode: 'grown-up' },
  { id: 'g32', text: 'What is 15% of 200?', options: ['20', '25', '30', '35'], correct: '30', mode: 'grown-up' },
  { id: 'g33', text: 'Which ocean is the smallest?', options: ['Indian', 'Southern', 'Arctic', 'Atlantic'], correct: 'Arctic', mode: 'grown-up' },
  { id: 'g34', text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'], correct: 'Mitochondria', mode: 'grown-up' },
  { id: 'g35', text: 'How many bones are in the human hand?', options: ['19', '25', '27', '31'], correct: '27', mode: 'grown-up' },
  { id: 'g36', text: 'What is the capital of Canada?', options: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'], correct: 'Ottawa', mode: 'grown-up' },
  { id: 'g37', text: 'Who developed the theory of relativity?', options: ['Newton', 'Bohr', 'Einstein', 'Hawking'], correct: 'Einstein', mode: 'grown-up' },
  { id: 'g38', text: 'What is the most spoken language in the world?', options: ['English', 'Spanish', 'Mandarin', 'Hindi'], correct: 'Mandarin', mode: 'grown-up' },
  { id: 'g39', text: 'How many chambers does the human heart have?', options: ['2', '3', '4', '5'], correct: '4', mode: 'grown-up' },
  { id: 'g40', text: 'What is the tallest mountain in the world?', options: ['K2', 'Kilimanjaro', 'Everest', 'Denali'], correct: 'Everest', mode: 'grown-up' },
  { id: 'g41', text: 'In which year did man first land on the moon?', options: ['1965', '1967', '1969', '1971'], correct: '1969', mode: 'grown-up' },
  { id: 'g42', text: 'What is the chemical symbol for iron?', options: ['Ir', 'In', 'Fe', 'Io'], correct: 'Fe', mode: 'grown-up' },
  { id: 'g43', text: 'How many time zones does Russia span?', options: ['9', '11', '13', '15'], correct: '11', mode: 'grown-up' },
  { id: 'g44', text: 'What is the capital of Brazil?', options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], correct: 'Brasília', mode: 'grown-up' },
  { id: 'g45', text: 'Who painted the Sistine Chapel ceiling?', options: ['Da Vinci', 'Raphael', 'Michelangelo', 'Botticelli'], correct: 'Michelangelo', mode: 'grown-up' },
  { id: 'g46', text: 'What is the square root of 256?', options: ['14', '15', '16', '17'], correct: '16', mode: 'grown-up' },
  { id: 'g47', text: 'Which gas makes up most of Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Hydrogen', 'Nitrogen'], correct: 'Nitrogen', mode: 'grown-up' },
  { id: 'g48', text: 'What is the currency of Japan?', options: ['Won', 'Yuan', 'Yen', 'Baht'], correct: 'Yen', mode: 'grown-up' },
  { id: 'g49', text: 'How many keys does a standard piano have?', options: ['76', '82', '88', '92'], correct: '88', mode: 'grown-up' },
  { id: 'g50', text: 'What is the largest country by land area?', options: ['Canada', 'China', 'USA', 'Russia'], correct: 'Russia', mode: 'grown-up' },
];

// ── Helpers ────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/&ldquo;/g, '\u201C').replace(/&rdquo;/g, '\u201D')
    .replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019')
    .replace(/&hellip;/g, '\u2026').replace(/&ndash;/g, '\u2013')
    .replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è')
    .replace(/&aacute;/g, 'á').replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&auml;/g, 'ä').replace(/&ouml;/g, 'ö').replace(/&uuml;/g, 'ü')
    .replace(/&szlig;/g, 'ß').replace(/&Auml;/g, 'Ä').replace(/&Ouml;/g, 'Ö');
}

// ── OpenTDB API pool ───────────────────────────────────────────

const kidPool:    Question[] = [];
const grownPool:  Question[] = [];
let kidToken      = '';
let grownToken    = '';
let fetchingKid   = false;
let fetchingGrown = false;
let uid           = 0;

async function getToken(): Promise<string> {
  try {
    const r = await fetch('https://opentdb.com/api_token.php?command=request',
      { signal: AbortSignal.timeout(6000) });
    const d = await r.json() as { token?: string };
    return d.token ?? '';
  } catch { return ''; }
}

async function fetchBatch(mode: PlayerMode, token: string): Promise<{ qs: Question[]; token: string }> {
  const diff = mode === 'kid' ? 'easy' : 'medium';
  let url = `https://opentdb.com/api.php?amount=50&difficulty=${diff}&type=multiple`;
  if (token) url += `&token=${token}`;

  const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const d = await r.json() as { response_code: number; results?: Record<string, unknown>[] };

  if (d.response_code === 4) {          // token exhausted — reset and retry once
    const newTok = await getToken();
    return fetchBatch(mode, newTok);
  }
  if (d.response_code !== 0 || !d.results?.length) return { qs: [], token };

  const qs: Question[] = (d.results as Array<{
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
  }>).map(item => {
    const opts = shuffle([item.correct_answer, ...item.incorrect_answers].map(decodeHtml));
    return {
      id: `api_${++uid}`,
      text: decodeHtml(item.question),
      options: opts,
      correct: decodeHtml(item.correct_answer),
      mode,
    };
  });

  return { qs, token };
}

async function prefetch(mode: PlayerMode): Promise<void> {
  if (mode === 'kid') {
    if (fetchingKid) return;
    fetchingKid = true;
    try {
      if (!kidToken) kidToken = await getToken();
      const { qs, token } = await fetchBatch(mode, kidToken);
      kidToken = token;
      kidPool.push(...qs);
      console.log(`[questions] +${qs.length} kid questions from API (pool=${kidPool.length})`);
    } catch (e) {
      console.warn('[questions] kid API fetch failed:', (e as Error).message);
    }
    fetchingKid = false;
  } else {
    if (fetchingGrown) return;
    fetchingGrown = true;
    try {
      if (!grownToken) grownToken = await getToken();
      const { qs, token } = await fetchBatch(mode, grownToken);
      grownToken = token;
      grownPool.push(...qs);
      console.log(`[questions] +${qs.length} grown-up questions from API (pool=${grownPool.length})`);
    } catch (e) {
      console.warn('[questions] grown-up API fetch failed:', (e as Error).message);
    }
    fetchingGrown = false;
  }
}

// ── Static fallback queues (used when API pool is empty) ───────

const kidQueue:   Question[] = [];
const grownQueue: Question[] = [];

// ── Public API ─────────────────────────────────────────────────

export function getNextQuestion(mode: PlayerMode): Question {
  // Kids questions are curated for 4/5 year olds — always use static bank only
  if (mode === 'kid') {
    if (kidQueue.length === 0) kidQueue.push(...shuffle(KID_QUESTIONS));
    return kidQueue.shift()!;
  }

  // Grown-up mode: use API pool with static fallback
  if (grownPool.length < 15) prefetch(mode);
  if (grownPool.length > 0) {
    const idx = Math.floor(Math.random() * grownPool.length);
    return grownPool.splice(idx, 1)[0];
  }
  if (grownQueue.length === 0) grownQueue.push(...shuffle(GROWN_UP_QUESTIONS));
  return grownQueue.shift()!;
}

export function resetQueues(): void {
  kidQueue.length = 0;
  grownQueue.length = 0;
  if (grownPool.length < 20) prefetch('grown-up');
}

// Start fetching grown-up questions on boot (kids use curated static bank only)
prefetch('grown-up');
