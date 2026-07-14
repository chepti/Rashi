# מסע כתב רש"י

LMS ללימוד קריאת כתב רש"י — מסע משחקי לתלמידים ומעקב למורים.

**אתר חי:** https://chepti.com/rashi/  
**קוד:** https://github.com/chepti/Rashi

מבוסס על אתר תרגול כתב רש"י ועל חוברת העבודה של הרב מרדכי שמואל בלוך.  
נוצר ע״י חפציה בן ארצי · [חולמים תקשוב](https://chepti.com)

---

## מה יש כאן

### תלמידים
- מסע של **9 יחידות** בסדר פדגוגי (מהאותיות הדומות לכתב רגיל ועד כל האותיות)
- **מפת מסע** גלילה אנכית עם רקע מאויר, תחנות על השביל, וכוכבים
- **8 סוגי משחקים:** היכרות, כרטיסי תמלול, חידון, תפזורת (גם "הפוך"), התאמה, זיכרון, סיפור עם קו מפריד, סידור אלף-בית, ציור לפי הוראות
- נעילה הדרגתית — אין פעילות שמשתמשת באות שטרם נלמדה
- כניסה עם **קוד כיתה מספרי** או קישור `#/join/123456` (בלי סיסמה — רק כינוי + אימוג'י)
- **תרגול חופשי** בלי כיתה (נשמר ב־localStorage)

### מורים
- הרשמה / התחברות (אימייל+סיסמה; כניסת גוגל אופציונלית)
- יצירת כיתות עם קוד בן 6 ספרות וקישור הצטרפות
- **מפת חום** לפי אותיות (שליטה 0–100)
- **צפייה בכל שלבי המשחק** בלי נעילה
- עורך מיקומי תחנות: `#/path-edit`

### טכני
- פרונט: Vite + React + TypeScript, RTL, ניתוב ב־hash (`#/map`, `#/play/...`)
- בקאנד: PHP + SQLite (בלי MySQL)
- פונטים self-hosted: Noto Rashi Hebrew + Heebo

---

## מבנה הפרויקט

```
RASHI/
├── app/                 פרונטאנד (Vite + React + TS)
│   ├── public/          רקעים, פונטים — מועתקים ל-dist בבילד
│   ├── src/
│   │   ├── data/        תוכן: אותיות, טיפוסים, units.ts (כל היחידות והפעילויות)
│   │   ├── games/       רכיבי המשחקים + GameHost
│   │   ├── views/       מסכים: כניסה, הצטרפות, מפה, יחידה, משחק, מורה…
│   │   ├── lib/         API, שליטה, התקדמות, pathLayout (מיקומי תחנות)
│   │   └── ui/          מעטפות רקע, משוב, אייקונים
│   └── vite.config.ts   base: '/rashi/' + proxy ל-API בפיתוח
├── api/                 PHP + SQLite
│   ├── student.php      הצטרפות, דיווח ניסיון, התקדמות
│   ├── teacher.php      מורים, כיתות, מפת חום
│   ├── db.php           סכימה, טוקנים HMAC, תיקיית נתונים
│   └── config.php       GOOGLE_CLIENT_ID (אופציונלי)
└── README.md
```

---

## פיתוח מקומי

דרישות: Node.js 18+, PHP 8+ (ל־API).

```bash
# טרמינל 1 — פרונט
cd app
npm install
npm run dev
```

```bash
# טרמינל 2 — API (משורש הריפו)
php -S localhost:8090
```

ה־proxy ב־`vite.config.ts` מפנה `/rashi/api` → `http://localhost:8090/api`.

- **תרגול חופשי** עובד גם בלי PHP (הכול ב־localStorage).
- כניסת כיתה / לוח מורה דורשים את שרת ה־PHP.

בילד לבדיקה מקומית:

```bash
cd app
npm run build
npm run preview
```

---

## פריסה (Hostinger / שרת סטטי+PHP)

האתר החי יושב תחת `public_html/rashi/`:

```
public_html/rashi/     ← תוכן app/dist/*
public_html/rashi/api/ ← תיקיית api/
```

בסיס הנתונים נוצר אוטומטית מחוץ ל־web root כשאפשר (`~/rashi_data/rashi.db`), אחרת ב־`api/data/` (חסום ב־`.htaccess`).

### דחיפה טיפוסית

```powershell
cd app
npm run build
scp -r -F "T:\.ssh\config" dist/* hostinger:~/public_html/rashi/
scp -r -F "T:\.ssh\config" ..\api hostinger:~/public_html/rashi/
```

(התאימו את Host `hostinger` ב־`~/.ssh/config` או ב־`T:\.ssh\config`.)

### כניסת גוגל למורים (אופציונלי)

1. צרו OAuth Client ID ב־Google Cloud (סוג Web).
2. הוסיפו Authorized JavaScript origin של האתר שלכם.
3. הדביקו את ה־Client ID ב־`api/config.php` בשרת.

בלי זה — הרשמה עם אימייל וסיסמה עובדת כרגיל.

---

## איך להעתיק ולהתאים לעצמכם

הפרויקט בנוי כך שאפשר לשכפל אותו ללימוד נושא אחר / מותג אחר / נתיב אחר באתר.

### 1. שיבוט

```bash
git clone https://github.com/chepti/Rashi.git
cd Rashi/app
npm install
```

### 2. נתיב הבסיס (חשוב!)

האפליקציה רצה כברירת מחדל תחת `/rashi/`. אם אתם מעלים לנתיב אחר (למשל `/torah/` או לשורש `/`):

| קובץ | מה לשנות |
|------|-----------|
| `app/vite.config.ts` | `base: '/rashi/'` → הנתיב שלכם (לשורש: `base: '/'`) |
| אותו קובץ | ה־proxy: `/rashi/api` → `'/YOUR_BASE/api'` |
| `app/src/lib/api.ts` | `const API = '/rashi/api'` |
| `app/src/lib/pathLayout.ts` | נתיבי רקע המפה `/rashi/bg-journey…` |
| `app/src/ui/PageShell.tsx` | נתיבי רקעי העמודים |
| `app/index.html` | אם יש נתיבים מוחלטים לפונטים/favicon |

אחרי שינוי — `npm run build` והעלאה מחדש.

### 3. תוכן הלימוד (החלק העיקרי)

כל היחידות והפעילויות נמצאות ב־**קובץ אחד:**

`app/src/data/units.ts`

- כל יחידה: `id`, `title`, `subtitle`, `icon`, `newLetters`, `activities[]`
- סוגי פעילות מוגדרים ב־`app/src/data/types.ts` (`intro`, `flashcards`, `quiz`, `wordsearch`, `match`, `memory`, `story`, `order`, `paint`)
- אותיות / מיפוי רש"י↔רגיל: `app/src/data/letters.ts`

**טיפים להתאמה:**
- שמרו על כלל הפדגוגיה: בפעילות יופיעו רק אותיות שכבר נלמדו ביחידות קודמות (`newLetters`).
- אחרי הוספה/הסרה של פעילויות — עדכנו את מספר התחנות במפה (ראו סעיף 5).
- כותרות, הוראות וטקסטים בעברית — ערוך ישירות ב־`units.ts`.

### 4. מיתוג ומסכים

| מה | איפה |
|----|------|
| דף כניסה | `app/src/views/Landing.tsx` |
| הצטרפות לתלמיד | `app/src/views/Join.tsx` |
| לוח מורה | `app/src/views/Teacher.tsx` |
| צבעים / כפתורים | `app/src/styles.css` (`:root`) |
| משוב וקרדיט | `app/src/ui/Feedback.tsx` (מייל משוב, קישור לאתר) |
| רקעי כניסה / עמודים | `app/public/bg-*.webp` + `PageShell.tsx` |

### 5. מפת המסע והתחנות

- רקע המפה: `app/public/bg-journey.webp` (+ `bg-journey-tiny.webp` לטעינה מהירה)
- מיקומי תחנות (אחוזים על התמונה): `app/src/lib/pathLayout.ts` → `STATION_POS`
- מספר הנקודות ב־`STATION_POS` חייב להתאים למספר הפעילויות בכל היחידות
- לעריכה ויזואלית אחרי התחברות מורה: `#/path-edit` (גרירת תחנות) — ואז לשמור את המערך בחזרה לקוד אם רוצים ברירת מחדל קבועה
- המפה נפתחת **מתחתית** העמוד (תחילת המסע)

### 6. API ומסד נתונים

- אין צורך ב־MySQL — SQLite נוצר לבד בפריסה הראשונה
- אם מעתיקים לשרת חדש: העלו את תיקיית `api/` לצד קבצי ה־`dist`
- ודאו ש־PHP יכול לכתוב לתיקיית הנתונים (או מחוץ ל־web root)
- סודות/טוקנים מנוהלים ב־`api/db.php` — בשיבוט חדש מומלץ לבדוק שהמפתח/המנגנון מתאים לסביבה שלכם

### 7. רשימת בדיקה אחרי העתקה

1. שיניתם `base` + נתיבי `/rashi/` בכל הקבצים הרלוונטיים  
2. `npm run build` עובר בלי שגיאות  
3. דף הכניסה נטען בנתיב החדש  
4. תרגול חופשי עובד  
5. יצירת מורה + כיתה + הצטרפות תלמיד עובדים מול ה־API  
6. מפת המסע נפתחת מלמטה והתחנות על השביל  
7. עדכנתם קרדיט / מייל משוב / קישור ב־`Feedback.tsx`

---

## רישיון ושימוש

מותר לשכפל ולהתאים לשימוש חינוכי. נשמח לקרדיט ולקישור ל־[chepti.com](https://chepti.com).  
לשאלות ומשוב: chepti@gmail.com
