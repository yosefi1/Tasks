# רק Git – חיבור הפרויקט ל־https://github.com/yosefi1/Tasks

עושים **רק** את זה: לחבר את התיקייה המקומית לרפו ב-GitHub ולדחוף את הקוד.

---

## שלב 1 – פתח טרמינל בתיקיית הפרויקט

וודא שאתה בתיקייה שיש בה את הקבצים `package.json` ו-`prisma` (תיקיית הפרויקט).

---

## שלב 2 – הרץ את הפקודות הבאות, אחת אחרי השנייה

**פקודה 1** – אם עדיין לא הרצת `git init` בפרויקט:
```bash
git init
```

**פקודה 2** – להוסיף את כל הקבצים:
```bash
git add .
```

**פקודה 3** – לשמור commit ראשון:
```bash
git commit -m "Initial commit - task manager"
```

**פקודה 4** – לחבר את הרפו שלך ב-GitHub (הכתובת שלך):
```bash
git remote add origin https://github.com/yosefi1/Tasks.git
```

**פקודה 5** – לוודא שהענף הראשי נקרא main:
```bash
git branch -M main
```

**פקודה 6** – לדחוף את הקוד ל-GitHub:
```bash
git push -u origin main
```

---

## אם פקודה 6 מבקשת התחברות

- אם יבקש **Username**: הכנס את שם המשתמש ב-GitHub (למשל `yosefi1`).
- אם יבקש **Password**: **אל** תשים את סיסמת החשבון. GitHub דורש **Personal Access Token**:
  1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token (classic)
  3. סמן scope כמו `repo`
  4. Generate והעתק את ה-Token
  5. כשהטרמינל מבקש Password – הדבק את ה-Token (לא יופיע על המסך – זה תקין)

---

## סיום

אחרי ש-`git push` מצליח – גלוש ל־https://github.com/yosefi1/Tasks ותראה שם את כל הקבצים. רק Git, בלי Vercel ובלי DB בשלב הזה.
