// כל אותיות האלף-בית, כולל סופיות, עם דירוג הקושי בכתב רש"י.
// difficulty: 'easy' = דומה לכתב הרגיל, נלמדות כמקשה אחת בשלב הראשון.
// האותיות הקשות נלמדות אחת-אחת לפי סדר היחידות (ראו units.ts).

export interface LetterInfo {
  ch: string;        // האות בכתב רגיל (יוניקוד רגיל — הפונט "Rashi" מרנדר אותה בכתב רש"י)
  name: string;      // שם האות
  final?: boolean;   // אות סופית
  hard?: boolean;    // אות "קשה" — שונה מהותית מהכתב הרגיל
  hint?: string;     // סימן לזכירה (מהאתר המקורי)
}

export const LETTERS: LetterInfo[] = [
  { ch: 'א', name: 'אלף', hard: true, hint: 'א׳ דומה לחיבור של כ׳ ונקודה — שימו לב לרגל הימנית המעוגלת' },
  { ch: 'ב', name: 'בית', hard: true, hint: 'ב׳ בכתב רש״י עגולה למטה, בניגוד לכ׳ שפתוחה' },
  { ch: 'ג', name: 'גימל' },
  { ch: 'ד', name: 'דלת', hard: true, hint: 'ד׳ דומה לר׳ עם פינה בולטת — חפשו את הזווית' },
  { ch: 'ה', name: 'הא' },
  { ch: 'ו', name: 'וו' },
  { ch: 'ז', name: 'זין' },
  { ch: 'ח', name: 'חית', hard: true, hint: 'ח׳ דומה לא׳ אבל הגג שלה ישר ומחובר' },
  { ch: 'ט', name: 'טית' },
  { ch: 'י', name: 'יוד' },
  { ch: 'כ', name: 'כף' },
  { ch: 'ך', name: 'כף סופית', final: true },
  { ch: 'ל', name: 'למד' },
  { ch: 'מ', name: 'מם' },
  { ch: 'ם', name: 'מם סופית', final: true },
  { ch: 'נ', name: 'נון' },
  { ch: 'ן', name: 'נון סופית', final: true },
  { ch: 'ס', name: 'סמך' },
  { ch: 'ע', name: 'עין' },
  { ch: 'פ', name: 'פא' },
  { ch: 'ף', name: 'פא סופית', final: true },
  { ch: 'צ', name: 'צדי', hard: true, hint: 'צ׳ בכתב רש״י דומה לע׳ הפוכה' },
  { ch: 'ץ', name: 'צדי סופית', final: true, hard: true, hint: 'ץ׳ יורדת מתחת לשורה עם זנב ארוך' },
  { ch: 'ק', name: 'קוף' },
  { ch: 'ר', name: 'ריש' },
  { ch: 'ש', name: 'שין', hard: true, hint: 'ש׳ בכתב רש״י מעוגלת, כמעט כמו ם׳ עם פתח' },
  { ch: 'ת', name: 'תו' },
];

export const ALL_CHARS = LETTERS.map((l) => l.ch);

// סדר עמודות למפת החום של המורה — לפי סדר האלף-בית
export const HEATMAP_ORDER = ALL_CHARS;

// מיפוי אות-סופית לאות רגילה לצורך צבירת נתונים (סופיות נספרות בנפרד)
export const FINAL_TO_BASE: Record<string, string> = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ',
};

const HEBREW_RE = /[א-ת]/;

/** מפרק מחרוזת לאותיות עבריות בלבד */
export function hebrewLetters(text: string): string[] {
  return [...text].filter((c) => HEBREW_RE.test(c));
}

/** אילו אותיות ייחודיות מופיעות בטקסט */
export function uniqueLetters(text: string): string[] {
  return [...new Set(hebrewLetters(text))];
}
