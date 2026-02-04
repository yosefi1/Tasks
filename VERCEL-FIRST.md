# קודם Vercel, אחר כך DB

## עכשיו (בלי DB)
- **Build** לא מריץ מיגרציות ולא דורש חיבור ל-DB.
- תוכל לעשות **Deploy** ב-Vercel בלי להגדיר שום Environment Variables – והדיפלוי אמור לעבור.

## אחרי שהדיפלוי עובד
כשתרצה שהמשימות והמקורות יישמרו:
1. צור פרויקט ב-**Neon** (neon.tech) והעתק Pooled + Direct connection.
2. ב-**Vercel** → הפרויקט → **Settings** → **Environment Variables**: הוסף `DATABASE_URL` ו-`DIRECT_URL`.
3. **פעם אחת** הרץ מיגרציות (מהמחשב שלך):
   ```bash
   set DATABASE_URL=ה-URL-של-Neon
   set DIRECT_URL=ה-URL-של-Neon
   npm run db:deploy
   ```
   (ב-Mac/Linux: `export DATABASE_URL=...` ו-`export DIRECT_URL=...`)
4. ב-Vercel: **Redeploy** (או פשוט דחוף commit חדש) – מהרגע הזה האפליקציה תשתמש ב-Neon והנתונים יישמרו.

**למה Prisma?**  
זה ה-layer שמחבר את האפליקציה ל-DB (קריאה/כתיבה). בלי DB – האתר עולה אבל לא שומר נתונים. עם Neon + משתני הסביבה – הכל נשמר.
