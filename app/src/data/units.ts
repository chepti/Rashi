import type { Unit } from './types';

// סדר הלמידה — נאמן לאתר המקורי: מהאותיות הדומות לכתב הרגיל אל הקשות,
// אות-אות. אף פעילות לא משתמשת באות שטרם נלמדה.
//
// אותיות "קלות" (דומות לכתב הרגיל): ג ה ו ז ט י כ ך ל מ ם נ ן ס ע פ ף ק ר ת
// נלמדות בהדרגה: א ← ח ← ב ← ש ← צ/ץ ← ד

const EASY = ['ג', 'ה', 'ו', 'ז', 'ט', 'י', 'כ', 'ך', 'ל', 'מ', 'ם', 'נ', 'ן', 'ס', 'ע', 'פ', 'ף', 'ק', 'ר', 'ת'];

export const UNITS: Unit[] = [
  // ─────────────────────────────── יחידה 1 ───────────────────────────────
  {
    id: 'similar',
    title: 'אותיות דומות',
    subtitle: 'רוב האותיות כבר מוכרות לכם!',
    icon: '🔎',
    newLetters: EASY,
    activities: [
      {
        type: 'intro',
        id: 'similar-intro',
        title: 'הכירו את כתב רש"י',
        instructions:
          'רוב אותיות כתב רש"י דומות מאוד לאותיות שאתם כבר מכירים. לחצו על כל כרטיס כדי להפוך אותו ולראות את האות בכתב רגיל.',
        letters: ['ג', 'ה', 'ו', 'ז', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'ק', 'ר', 'ת'],
      },
      {
        type: 'flashcards',
        id: 'similar-cards',
        title: 'פענחו את המילים',
        instructions: 'כתבו בכתב רגיל את מה שמופיע על הכרטיס. דייקו בכל אות!',
        cards: [
          { text: 'פרה' },
          { text: 'לימון' },
          { text: 'גמל' },
          { text: 'ספרים' },
          { text: 'מלפפון' },
          { text: 'כורסה' },
          { text: 'תפוז' },
          { text: 'נמלה' },
        ],
      },
      {
        type: 'quiz',
        id: 'similar-quiz',
        title: 'מה כתוב כאן?',
        instructions: 'קראו את המילה בכתב רש"י ובחרו את הקריאה הנכונה.',
        questions: [
          { prompt: 'מה כתוב כאן?', rashiText: 'גלגל', options: ['גלגל', 'גמל', 'גליל'], correct: 0 },
          { prompt: 'מה כתוב כאן?', rashiText: 'מטוס', options: ['מטען', 'מטוס', 'מנוס'], correct: 1 },
          { prompt: 'מה כתוב כאן?', rashiText: 'עוגה', options: ['עוגן', 'עגיל', 'עוגה'], correct: 2 },
          { prompt: 'מה כתוב כאן?', rashiText: 'סולם', options: ['סולם', 'סלט', 'סתם'], correct: 0 },
          { prompt: 'מה כתוב כאן?', rashiText: 'קוף', options: ['קול', 'קוף', 'כף'], correct: 1 },
          { prompt: 'מה כתוב כאן?', rashiText: 'נמר', options: ['גמר', 'נהר', 'נמר'], correct: 2 },
        ],
      },
      {
        type: 'wordsearch',
        id: 'similar-search',
        title: 'תפזורת ראשונה',
        instructions: 'מצאו את המילים המסתתרות בתפזורת. לחצו על האות הראשונה וגררו עד האות האחרונה.',
        words: ['פרה', 'ימין', 'נסיך', 'ספרים', 'מלפפון', 'כורסה', 'עיפרון', 'תרנגולת'],
        size: 10,
        fillPool: 'גהוזטיכלמנסעפקרת',
      },
    ],
  },

  // ─────────────────────────────── יחידה 2 ───────────────────────────────
  {
    id: 'alef',
    title: "האות א'",
    subtitle: 'האות הראשונה — והשונה',
    icon: '🌟',
    newLetters: ['א'],
    activities: [
      {
        type: 'intro',
        id: 'alef-intro',
        title: "מכירים את א'",
        instructions:
          'האות א׳ בכתב רש"י שונה מהצורה המוכרת. התבוננו היטב בצורתה — היא תלווה אתכם בכל מילה כמעט.',
        letters: ['א'],
      },
      {
        type: 'match',
        id: 'alef-match',
        title: 'גררו למקום הנכון',
        instructions: 'גררו כל מילה בכתב רגיל אל המילה המתאימה בכתב רש"י.',
        pairs: [
          { rashi: 'אתרוג' },
          { rashi: 'אלימלך' },
          { rashi: 'אלמלא' },
          { rashi: 'אריאל' },
          { rashi: 'אמא אוכלת אוזן המן' },
        ],
      },
      {
        type: 'flashcards',
        id: 'alef-cards',
        title: "מילים עם א'",
        instructions: 'כתבו בכתב רגיל את מה שמופיע על הכרטיס.',
        cards: [
          { text: 'א' },
          { text: 'אמא' },
          { text: 'אגס' },
          { text: 'אריה' },
          { text: 'ארמון' },
          { text: 'אטריות' },
          { text: 'מלאך' },
        ],
      },
      {
        type: 'story',
        id: 'alef-letter',
        title: 'מכתב קצר',
        instructions:
          'קראו את המכתב בכתב רש"י. אפשר להזיז את הקו המפריד כדי להציץ בכתב הרגיל — אבל נסו קודם לבד!',
        paragraphs: [
          'לאורי היקר,',
          'אני נמצאת עם אמא ועם עומר מול הכינרת. אנו קמים עליזים, אוכלים תפוזים ורואים מלא נופים.',
          'מתי אתם מגיעים? מתגעגעת אליכם,',
          'גלית',
        ],
        questions: [
          { prompt: 'מי כתבה את המכתב?', options: ['אמא', 'גלית', 'אורי'], correct: 1 },
          { prompt: 'איפה נמצאת גלית?', options: ['מול הכינרת', 'על הר גבוה', 'עם סבתא'], correct: 0 },
          { prompt: 'מה אוכלים בטיול?', options: ['גלידה', 'מלפפונים', 'תפוזים'], correct: 2 },
        ],
      },
    ],
  },

  // ─────────────────────────────── יחידה 3 ───────────────────────────────
  {
    id: 'het',
    title: "א' מול ח'",
    subtitle: 'שתי אותיות דומות — הבחינו בהבדל',
    icon: '👀',
    newLetters: ['ח'],
    activities: [
      {
        type: 'intro',
        id: 'het-intro',
        title: "מכירים את ח'",
        instructions:
          'בכתב רש"י יש דמיון בין א׳ ל-ח׳ (וקצת גם ל-מ׳). התבוננו היטב בהבדלים בין שלוש האותיות.',
        letters: ['א', 'ח', 'מ'],
      },
      {
        type: 'quiz',
        id: 'het-quiz',
        title: "א' או ח'?",
        instructions: 'איזו אות מופיעה על המסך? היזהרו — הן דומות!',
        questions: [
          { prompt: 'איזו אות זו?', rashiText: 'א', options: ['א', 'ח', 'מ'], correct: 0 },
          { prompt: 'איזו אות זו?', rashiText: 'ח', options: ['א', 'ח', 'מ'], correct: 1 },
          { prompt: 'איזו אות זו?', rashiText: 'מ', options: ['א', 'ח', 'מ'], correct: 2 },
          { prompt: 'מה כתוב כאן?', rashiText: 'אח', options: ['אח', 'חא', 'אא'], correct: 0 },
          { prompt: 'מה כתוב כאן?', rashiText: 'חם', options: ['אם', 'חם', 'מם'], correct: 1 },
          { prompt: 'מה כתוב כאן?', rashiText: 'אמת', options: ['חמת', 'אות', 'אמת'], correct: 2 },
        ],
      },
      {
        type: 'flashcards',
        id: 'het-cards',
        title: 'פענחו את המילים',
        instructions: 'כתבו בדיוק את מה שמופיע על הכרטיס — שימו לב מתי זו א׳ ומתי ח׳.',
        cards: [
          { text: 'ח' },
          { text: 'אח' },
          { text: 'אחות' },
          { text: 'לחם' },
          { text: 'חתול' },
          { text: 'אחראי' },
          { text: 'מאחרים' },
          { text: 'חקלאי' },
        ],
      },
      {
        type: 'wordsearch',
        id: 'het-search',
        title: "תפזורת א' ו-ח'",
        instructions: 'מצאו את המילים בתפזורת. כולן מכילות א׳ או ח׳.',
        words: ['אוח', 'לחם', 'חלום', 'חתול', 'תפוח', 'חמור', 'חגיגה'],
        size: 9,
        fillPool: 'אחגהוזטיכלמנסעפקרת',
      },
    ],
  },

  // ─────────────────────────────── יחידה 4 ───────────────────────────────
  {
    id: 'bet',
    title: "האות ב'",
    subtitle: "ב' עגולה מול כ' פתוחה",
    icon: '🏠',
    newLetters: ['ב'],
    activities: [
      {
        type: 'intro',
        id: 'bet-intro',
        title: "מכירים את ב'",
        instructions:
          'האות ב׳ בכתב רש"י דומה ל-כ׳. שימו לב: ל-ב׳ יש בסיס שטוח וזווית, ו-כ׳ מעוגלת יותר.',
        letters: ['ב', 'כ'],
      },
      {
        type: 'flashcards',
        id: 'bet-cards',
        title: 'פענחו את המילים',
        instructions: 'כתבו בדיוק את מה שמופיע על הכרטיס — הבחינו בין ב׳ ל-כ׳.',
        cards: [
          { text: 'ב' },
          { text: 'כ' },
          { text: 'בכבוד' },
          { text: 'בכיסא' },
          { text: 'כוכב' },
          { text: 'כבאיות' },
          { text: 'עכבר' },
          { text: 'כביר' },
        ],
      },
      {
        type: 'memory',
        id: 'bet-memory',
        title: 'משחק זיכרון',
        instructions: 'הפכו את הקלפים ומצאו כל זוג: מילה בכתב רש"י והמילה שלה בכתב רגיל.',
        pairs: [
          { a: 'בננה', b: 'בננה' },
          { a: 'כוכב', b: 'כוכב' },
          { a: 'עכבר', b: 'עכבר' },
          { a: 'בלון', b: 'בלון' },
          { a: 'כלב', b: 'כלב' },
          { a: 'ברווז', b: 'ברווז' },
        ],
      },
      {
        type: 'quiz',
        id: 'bet-quiz',
        title: "ב' או כ'?",
        instructions: 'קראו את המילה ובחרו את הקריאה הנכונה.',
        questions: [
          { prompt: 'מה כתוב כאן?', rashiText: 'בית', options: ['בית', 'כית', 'בות'], correct: 0 },
          { prompt: 'מה כתוב כאן?', rashiText: 'כלוב', options: ['בלוב', 'כלוב', 'כלוכ'], correct: 1 },
          { prompt: 'מה כתוב כאן?', rashiText: 'בגלל', options: ['כגלל', 'גבלל', 'בגלל'], correct: 2 },
          { prompt: 'מה כתוב כאן?', rashiText: 'כביש', options: ['כביש', 'בכיש', 'כבוש'], correct: 0, targetLetters: ['כ', 'ב'] },
          { prompt: 'מה כתוב כאן?', rashiText: 'אבטיח', options: ['אכטיח', 'אבטיח', 'חבטיא'], correct: 1 },
        ],
      },
    ],
  },

  // ─────────────────────────────── יחידה 5 ───────────────────────────────
  {
    id: 'shin',
    title: "האות ש'",
    subtitle: 'סוף סוף — ש׳!',
    icon: '☀️',
    newLetters: ['ש'],
    activities: [
      {
        type: 'intro',
        id: 'shin-intro',
        title: "מכירים את ש'",
        instructions: 'האות ש׳ בכתב רש"י מעוגלת ושונה מאוד מהצורה המוכרת. התבוננו היטב!',
        letters: ['ש'],
      },
      {
        type: 'flashcards',
        id: 'shin-cards',
        title: "מילים עם ש'",
        instructions: 'כתבו בכתב רגיל את מה שמופיע על הכרטיס.',
        cards: [
          { text: 'ש' },
          { text: 'שבת' },
          { text: 'שמש' },
          { text: 'שלוש' },
          { text: 'שועל' },
          { text: 'חשמל' },
          { text: 'שמלה' },
          { text: 'בשפע' },
        ],
      },
      {
        type: 'memory',
        id: 'shin-memory',
        title: 'זיכרון — ביטוי והמשכו',
        instructions: 'מצאו כל זוג: תחילת הביטוי בכתב רש"י — והמשכו בכתב רגיל.',
        pairs: [
          { a: 'מי שטרח בערב שבת', b: 'יאכל בשבת' },
          { a: 'מה ששנוא עליך', b: 'אל תעשה לחברך' },
          { a: 'שלום וברכה', b: 'ששון ושמחה' },
          { a: 'עכשיו', b: 'עכשיו' },
          { a: 'שקנאי', b: 'שקנאי' },
          { a: 'שרשראות', b: 'שרשראות' },
        ],
      },
      {
        type: 'quiz',
        id: 'shin-quiz',
        title: 'קריאה מהירה',
        instructions: 'קראו ובחרו את הקריאה הנכונה.',
        questions: [
          { prompt: 'מה כתוב כאן?', rashiText: 'שלום', options: ['שלום', 'סלום', 'מלוש'], correct: 0 },
          { prompt: 'מה כתוב כאן?', rashiText: 'משה', options: ['השמ', 'משה', 'מסה'], correct: 1 },
          { prompt: 'מה כתוב כאן?', rashiText: 'שבוע', options: ['שבוט', 'סבוע', 'שבוע'], correct: 2 },
          { prompt: 'מה כתוב כאן?', rashiText: 'אשכול', options: ['אשכול', 'אסכול', 'חשכול'], correct: 0 },
        ],
      },
    ],
  },

  // ─────────────────────────────── יחידה 6 ───────────────────────────────
  {
    id: 'tsadi',
    title: "צ' ו-ץ'",
    subtitle: 'האות המפתיעה ביותר',
    icon: '🌵',
    newLetters: ['צ', 'ץ'],
    activities: [
      {
        type: 'intro',
        id: 'tsadi-intro',
        title: "מכירים את צ' ו-ץ'",
        instructions: 'האות צ׳ בכתב רש"י נראית כמו ע׳ הפוכה, ו-ץ׳ הסופית יורדת מתחת לשורה. התבוננו היטב.',
        letters: ['צ', 'ץ', 'ע', 'ל'],
      },
      {
        type: 'flashcards',
        id: 'tsadi-cards',
        title: 'פענחו את המילים',
        instructions: 'כתבו בדיוק את מה שמופיע על הכרטיס.',
        cards: [
          { text: 'צ' },
          { text: 'ץ' },
          { text: 'עציץ' },
          { text: 'ציפור' },
          { text: 'מתרוצץ' },
          { text: 'צפצוף' },
          { text: 'ארץ' },
          { text: 'החצוצרן מחצרץ בחצוצרתו' },
        ],
      },
      {
        type: 'paint',
        id: 'tsadi-paint',
        title: 'ציור לפי הוראות',
        instructions:
          'קראו כל הוראה — היא כתובה בכתב רש"י! — וצבעו את המשבצות הנכונות. בסוף יתגלה ציור.',
        gridSize: 7,
        revealEmoji: '🌷',
        steps: [
          { text: 'צבעו את כל טור 4', cells: [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3]] },
          { text: 'צבעו בשורה 1 את טור 3 וטור 5', cells: [[0, 2], [0, 4]] },
          { text: 'צבעו בשורה 2 את טור 2 וטור 6', cells: [[1, 1], [1, 5]] },
          { text: 'צבעו בשורה 5 את טור 2 וטור 6', cells: [[4, 1], [4, 5]] },
          { text: 'צבעו בשורה 6 את טור 3 וטור 5', cells: [[5, 2], [5, 4]] },
        ],
      },
      {
        type: 'quiz',
        id: 'tsadi-quiz',
        title: "צ' או ע'?",
        instructions: 'קראו ובחרו את הקריאה הנכונה — היזהרו מהבלבול בין צ׳ ל-ע׳!',
        questions: [
          { prompt: 'מה כתוב כאן?', rashiText: 'עץ', options: ['עץ', 'צע', 'ץע'], correct: 0 },
          { prompt: 'מה כתוב כאן?', rashiText: 'צל', options: ['על', 'צל', 'לץ'], correct: 1 },
          { prompt: 'מה כתוב כאן?', rashiText: 'מצא', options: ['מעח', 'מאץ', 'מצא'], correct: 2 },
          { prompt: 'מה כתוב כאן?', rashiText: 'קפיצה', options: ['קפיצה', 'קפיעה', 'הציפק'], correct: 0 },
        ],
      },
    ],
  },

  // ─────────────────────────────── יחידה 7 ───────────────────────────────
  {
    id: 'dalet',
    title: "האות ד'",
    subtitle: 'מתקדמים! האות האחרונה',
    icon: '🚪',
    newLetters: ['ד'],
    activities: [
      {
        type: 'intro',
        id: 'dalet-intro',
        title: "מכירים את ד'",
        instructions: 'האות ד׳ בכתב רש"י דומה ל-ר׳ — חפשו את הפינה הבולטת שמבדילה ביניהן.',
        letters: ['ד', 'ר'],
      },
      {
        type: 'flashcards',
        id: 'dalet-cards',
        title: "מילים עם ד'",
        instructions: 'כתבו בכתב רגיל את מה שמופיע על הכרטיס.',
        cards: [
          { text: 'ד' },
          { text: 'דג' },
          { text: 'דוד' },
          { text: 'ילד' },
          { text: 'דרך' },
          { text: 'מדינה' },
          { text: 'דבורה' },
          { text: 'מגדל' },
        ],
      },
      {
        type: 'quiz',
        id: 'dalet-quiz',
        title: "ד' או ר'?",
        instructions: 'קראו ובחרו — היזהרו מהבלבול בין ד׳ ל-ר׳!',
        questions: [
          { prompt: 'מה כתוב כאן?', rashiText: 'דג', options: ['דג', 'רג', 'גד'], correct: 0 },
          { prompt: 'מה כתוב כאן?', rashiText: 'רץ', options: ['דץ', 'רץ', 'ץר'], correct: 1 },
          { prompt: 'מה כתוב כאן?', rashiText: 'ידיד', options: ['יריר', 'ידיר', 'ידיד'], correct: 2 },
          { prompt: 'מה כתוב כאן?', rashiText: 'דרדר', options: ['דרדר', 'רדרד', 'דדרר'], correct: 0 },
        ],
      },
      {
        type: 'wordsearch',
        id: 'dalet-search',
        title: 'תפזורת ערים',
        instructions:
          'מצאו את הערים בתפזורת. שימו לב — הפעם המילים כתובות הפוך: משמאל לימין או מלמעלה למטה!',
        words: ['אשדוד', 'חדרה', 'ערד', 'דימונה', 'שדרות', 'לוד', 'רחובות'],
        size: 10,
        reversed: true,
        fillPool: 'אבגדהוזחטיכלמנסעפצקרשת',
      },
    ],
  },

  // ─────────────────────────────── יחידה 8 ───────────────────────────────
  {
    id: 'story',
    title: 'הסיפור על רש"י',
    subtitle: 'קוראים סיפור אמיתי — בכתב רש"י',
    icon: '📜',
    newLetters: [],
    activities: [
      {
        type: 'story',
        id: 'rashi-story',
        title: 'הנס של אמו של רש"י',
        instructions:
          'קראו את הסיפור בכתב רש"י. הזיזו את הקו המפריד ימינה ושמאלה — האם תצליחו לקרוא את כולו בלי להציץ בכתב הרגיל?',
        paragraphs: [
          'מספרים, שכאשר היה רש"י בבטן אמו, הלכה האם בדרך צרה בעיר וורמיזא. לפתע הופיעו מולה בדהרה פרשים רבים, ונראה היה שהיא עומדת להירמס תחת פרסות סוסיהם.',
          'בבהלה גדולה היא נצמדה אל הקיר העשוי אבן. נעשה לה נס, ונהיה שקע עמוק בקיר בגודל כל גופה. בתוך אותו שקע הסתתרה עד שעברו כל הפרשים. כך ניצלו האם ובנה ממוות.',
          'השקע נשאר בקיר האבן שברחוב העיר וורמיזא, וניתן לראותו שם עד היום.',
        ],
        questions: [
          { prompt: 'איפה הלכה אמו של רש"י?', options: ['בשוק הגדול', 'בדרך צרה בעיר וורמיזא', 'בשדה פתוח'], correct: 1 },
          { prompt: 'מה הופיע מולה לפתע?', options: ['פרשים רבים', 'עגלה גדולה', 'להקת זאבים'], correct: 0 },
          { prompt: 'איזה נס קרה לה?', options: ['הסוסים נעצרו', 'היא הפכה לבלתי נראית', 'נהיה שקע עמוק בקיר והיא הסתתרה בו'], correct: 2 },
          { prompt: 'מה אפשר לראות בוורמיזא עד היום?', options: ['את השקע בקיר האבן', 'את פרסות הסוסים', 'את הספרים של רש"י'], correct: 0 },
        ],
      },
    ],
  },

  // ─────────────────────────────── יחידה 9 ───────────────────────────────
  {
    id: 'all',
    title: 'כל האותיות',
    subtitle: 'המסע הושלם — אתגר הגמר!',
    icon: '🏆',
    newLetters: [],
    activities: [
      {
        type: 'order',
        id: 'all-order',
        title: 'סדרו את האלף-בית',
        instructions: 'גררו את האותיות — בכתב רש"י! — וסדרו אותן לפי סדר האלף-בית, מימין לשמאל.',
        items: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'],
      },
      {
        type: 'flashcards',
        id: 'all-cards',
        title: 'אתגר המילים הגדול',
        instructions: 'כתבו בכתב רגיל את מה שמופיע על הכרטיס — הפעם עם כל האותיות!',
        cards: [
          { text: 'בראשית' },
          { text: 'שולחן' },
          { text: 'צפרדע' },
          { text: 'חצוצרה' },
          { text: 'אבטיח' },
          { text: 'דבש' },
          { text: 'ארנבת' },
          { text: 'שבת שלום' },
        ],
      },
      {
        type: 'quiz',
        id: 'all-final',
        title: 'מבחן הגמר',
        instructions: 'עשר שאלות — כל האותיות. בהצלחה!',
        questions: [
          { prompt: 'מה כתוב כאן?', rashiText: 'אדם', options: ['אדם', 'ארם', 'חדם'], correct: 0 },
          { prompt: 'מה כתוב כאן?', rashiText: 'חבר', options: ['אבר', 'חבר', 'חכר'], correct: 1 },
          { prompt: 'מה כתוב כאן?', rashiText: 'צדיק', options: ['עדיק', 'צריק', 'צדיק'], correct: 2 },
          { prompt: 'מה כתוב כאן?', rashiText: 'שביל', options: ['שביל', 'סביל', 'שכיל'], correct: 0 },
          { prompt: 'מה כתוב כאן?', rashiText: 'מדבר', options: ['מרבד', 'מדבר', 'מדכר'], correct: 1 },
          { prompt: 'מה כתוב כאן?', rashiText: 'חלוץ', options: ['אלוץ', 'חלוע', 'חלוץ'], correct: 2 },
          { prompt: 'מה כתוב כאן?', rashiText: 'אבדה', options: ['אבדה', 'חברה', 'אכדה'], correct: 0 },
          { prompt: 'מה כתוב כאן?', rashiText: 'שדכן', options: ['שרכן', 'שדכן', 'סדכן'], correct: 1 },
          { prompt: 'מה כתוב כאן?', rashiText: 'צחצח', options: ['עחעח', 'צאצא', 'צחצח'], correct: 2 },
          { prompt: 'מה כתוב כאן?', rashiText: 'ברוך הבא', options: ['ברוך הבא', 'כרוך הכא', 'ברון הבח'], correct: 0 },
        ],
      },
    ],
  },
];

/** האותיות המותרות עד יחידה מסוימת (כולל) */
export function lettersUpTo(unitIndex: number): string[] {
  const set = new Set<string>();
  for (let i = 0; i <= unitIndex && i < UNITS.length; i++) {
    UNITS[i].newLetters.forEach((l) => set.add(l));
  }
  return [...set];
}

export function totalActivities(): number {
  return UNITS.reduce((n, u) => n + u.activities.length, 0);
}
