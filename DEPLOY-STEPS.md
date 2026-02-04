# העלאה ל-Git, Vercel ו-Neon – צעד אחר צעד

---

## חלק 1: יצירת מסד נתונים ב-Neon (DB)

זה המקום שבו יישמרו כל המשימות והמקורות. עושים את זה **פעם אחת**.

### שלב 1.1 – כניסה ל-Neon
1. פתח דפדפן וגלוש ל: **https://neon.tech**
2. לחץ **Sign up** או **Log in** (אפשר עם GitHub / Google).

### שלב 1.2 – יצירת פרויקט
1. אחרי הכניסה תיכנס ל-Dashboard.
2. לחץ **New Project**.
3. תן שם לפרויקט (למשל: `tasks-app`).
4. בחר Region (למשל `East US`).
5. לחץ **Create Project**.

### שלב 1.3 – העתקת כתובות החיבור
1. אחרי שהפרויקט נוצר, תופיע דף עם **Connection string**.
2. תראה שני סוגים:
   - **Pooled connection** – לכתוב ממנו את ה-URL הראשון.
   - **Direct connection** – לכתוב ממנו את ה-URL השני.
3. ליד כל אחד יש כפתור **Copy** – העתק כל URL למקום זמני (פנקס רשימות או קובץ).
4. אם לא רואים – לחץ על **Connection details** או **Dashboard** ואז **Connection string**.

**דוגמה (לא להדביק ככה – להשתמש ב-URLים האמיתיים שלך):**
```
Pooled:   postgresql://user:xxxx@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
Direct:   postgresql://user:xxxx@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```
(לפעמים ה-Direct שונה רק בפורט או ב-host – השתמש במה ש-Neon נותן.)

---

## חלק 2: הגדרת הפרויקט המקומי עם Neon

### שלב 2.1 – קובץ `.env`
1. בתיקיית הפרויקט (איפה ש-`package.json`) פתח או צור קובץ בשם **`.env`** (בלי סיומת).
2. אם יש כבר `.env` – פתח אותו. אם לא – צור קובץ חדש ושמור בשם `.env`.

### שלב 2.2 – הדבקת משתני הסביבה
הדבק בקובץ `.env` את שני השורות הבאות, והחלף את הערכים ב-URLים שהעתקת מ-Neon:

```
DATABASE_URL="הדבק כאן את ה-URL של Pooled connection"
DIRECT_URL="הדבק כאן את ה-URL של Direct connection"
```

**חשוב:** השאר את המרכאות. אין רווח לפני או אחרי `=`.

### שלב 2.3 – הרצת המיגרציות (יצירת הטבלאות)
1. פתח טרמינל בתיקיית הפרויקט.
2. הרץ:
   ```bash
   npm run db:migrate
   ```
3. אם יבקש שם למיגרציה – אפשר להקליד Enter או שם כמו `init`.
4. אם הכל עבד – יופיעו הודעות שהטבלאות נוצרו.

### שלב 2.4 – בדיקה שהאפליקציה עובדת עם Neon
1. הרץ:
   ```bash
   npm run dev
   ```
2. פתח בדפדפן: **http://localhost:3000**
3. נסה ליצור משימה ולשמור – אם נשמר, ה-DB מחובר.

עד כאן – ה-DB ב-Neon מוכן והפרויקט המקומי עובד איתו.

---

## חלק 3: העלאה ל-Git (GitHub)

מעלים את הקוד ל-GitHub כדי ש-Vercel יוכל לחבר אליו.

### שלב 3.1 – חשבון GitHub
1. אם אין לך חשבון – היכנס ל-**https://github.com** וצור חשבון.
2. אם יש – התחבר.

### שלב 3.2 – יצירת Repository חדש ב-GitHub
1. ב-GitHub לחץ **+** (למעלה מימין) → **New repository**.
2. **Repository name:** למשל `tasks-app` (או כל שם).
3. השאר **Private** או בחר **Public**.
4. **אל תסמן** "Add a README" או "Add .gitignore" – הפרויקט כבר יש לו.
5. לחץ **Create repository**.

### שלב 3.3 – חיבור הפרויקט ל-Git (בטרמינל)
1. בטרמינל, וודא שאתה **בתיקיית הפרויקט** (איפה ש-`package.json`).
2. הרץ את הפקודות הבאות **אחת אחרי השנייה**:

```bash
git init
```
(יוצר מאגר Git בתיקייה.)

```bash
git add .
```
(מוסיף את כל הקבצים.)

```bash
git commit -m "Initial commit - task manager with Neon"
```
(שומר את המצב הנוכחי.)

### שלב 3.4 – חיבור ל-GitHub והעלאה
1. חזור לדף ה-Repository שיצרת ב-GitHub.
2. תראה בלוק "…or push an existing repository from the command line".
3. Copy את השורה שנראית בערך כך (עם השם והמשתמש שלך):

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

4. **החלף** `YOUR_USERNAME` ו-`YOUR_REPO_NAME` בשם המשתמש ובשם הרפו שלך.
5. הדבק והרץ את השורה בטרמינל.
6. אחר כך הרץ:

```bash
git branch -M main
git push -u origin main
```

7. אם יבקש סיסמה – השתמש ב-**Personal Access Token** של GitHub (לא סיסמת החשבון).  
   (ב-GitHub: Settings → Developer settings → Personal access tokens → Generate new token.)

אחרי ש-`git push` מצליח – כל הקוד נמצא ב-GitHub.

---

## חלק 4: פריסה ב-Vercel וחיבור ל-Neon

כאן מחברים את האתר ל-Vercel ומגדירים את ה-DB.

### שלב 4.1 – כניסה ל-Vercel
1. גלוש ל-**https://vercel.com**
2. לחץ **Sign up** או **Log in** (נוח להתחבר עם **GitHub**).

### שלב 4.2 – ייבוא הפרויקט מ-GitHub
1. בדשבורד של Vercel לחץ **Add New…** → **Project**.
2. תחת **Import Git Repository** תראה את רשימת הרפואים מ-GitHub.
3. בחר את הרפו של הפרויקט (למשל `tasks-app`) ולחץ **Import**.

### שלב 4.3 – הגדרת משתני הסביבה (חשוב)
1. לפני שלוחצים Deploy – גלול ל-**Environment Variables**.
2. הוסף **שני** משתנים:

   **משתנה 1:**
   - **Name:** `DATABASE_URL`
   - **Value:** הדבק את **אותו** Pooled connection URL שהשתמשת בו ב-`.env` המקומי.
   - **Environment:** סמן את כולם (Production, Preview, Development).

   **משתנה 2:**
   - **Name:** `DIRECT_URL`
   - **Value:** הדבק את **אותו** Direct connection URL מ-Neon.
   - **Environment:** סמן את כולם.

3. לחץ **Add** אחרי כל משתנה.

### שלב 4.4 – פריסה (Deploy)
1. לחץ **Deploy**.
2. Vercel יבנה את הפרויקט (install, migrate, build). זה יכול לקחת דקה-שתיים.
3. אם הכל ירוק – יופיע **Visit** או כתובת האתר (למשל `tasks-app-xxx.vercel.app`).

### שלב 4.5 – וידוא שה-DB מחובר
1. לחץ **Visit** ופתח את האתר.
2. נסה ליצור משימה חדשה ולשמור.
3. רענן את הדף – אם המשימה נשארת, הנתונים נשמרים ב-Neon והכל מחובר.

---

## סיכום זרימה

1. **Neon** – יוצרים פרויקט, מעתיקים Pooled + Direct.
2. **מקומי** – יוצרים `.env` עם `DATABASE_URL` ו-`DIRECT_URL`, מריצים `npm run db:migrate` ו-`npm run dev`.
3. **GitHub** – יוצרים Repository, מריצים `git init`, `git add .`, `git commit`, `git remote add origin`, `git push`.
4. **Vercel** – Import מ-GitHub, מוסיפים `DATABASE_URL` ו-`DIRECT_URL`, לוחצים Deploy.

מכאן – כל שינוי שתעלה ל-Git (ו-push ל-GitHub) יכול להפעיל דיפלוי אוטומטי ב-Vercel, והנתונים ימשיכו להישמר ב-Neon.
