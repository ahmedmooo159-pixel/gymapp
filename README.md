# ⚡ وحش الجيم (Gym Assistant)

تطبيق ويب ذكي وشخصي مصمم خصيصاً للمبتدئين في الجيم لمساعدتهم في التمرين، التغذية، وحساب السعرات وتتبع أوزانهم خطوة بخطوة باللغة العربية (باللهجة المصرية البسيطة).

---

## 🌟 مميزات التطبيق

1. **تسجيل دخول آمن وفوري:** عبر حساب Google باستخدام Firebase Authentication.
2. **تجهيز خطة مخصصة (Onboarding):** نموذج تفاعلي لتحديد السن، الطول، الوزن، الهدف (تنشيف / تضخيم / ثبات)، مستوى النشاط، وأيام التمرين، ونوع الأدوات المتاحة (جيم متكامل / دمبلز / وزن الجسم).
3. **حسابات دقيقة علمياً (`js/calc.js`):**
   - معدل الحرق الأساسي (BMR) بمعادلة Mifflin-St Jeor.
   - الحرق الكلي اليومي (TDEE).
   - سعرات الهدف (Cut: -15% | Bulk: +10% | Maintain: 100%).
   - الماكروز بالجرام: البروتين (2.0 جم/كجم)، الدهون (0.9 جم/كجم)، الكاربوهيدرات (باقي السعرات).
4. **مكتبة تمارين شاملة (`data/exercises.json`):** 48 تمرين لمختلف عضلات الجسم بالأدوات والشرح خطوة بخطوة.
5. **جداول تدريبية ذكية (`js/plans.js`):**
   - 3 أيام: Full Body A / B / A
   - 4 أيام: Upper / Lower / Upper / Lower
   - 5-6 أيام: Push / Pull / Legs
   - فلترة تلقائية حسب الأدوات المتاحة ومراعاة أيام الراحة والاستشفاء.
6. **جلسة تمرين تفاعلية (`workout.html`):** تسجيل الأوزان والعدات لكل مجموعة، إظهار أوزان الجلسة السابقة للمقارنة، وعداد وقت راحة تفاعلي (60 إلى 90 ثانية) مع تنبيه صوتي واهتزاز.
7. **رسوم بيانية للتقدم (`progress.html`):** رسم بياني بالـ Chart.js لتطور وزن الجسم وتطور أوزان التمارين بمرور الوقت.
8. **كابتن ذكي (`coach.html`):** شات تفاعلي للإجابة عن أسئلة التمرين والتغذية والتنفس والأمان للمبتدئين.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Pure Vanilla Web:** HTML5 + CSS3 + JavaScript (ES Modules).
- **بدون أي أدوات بناء (No npm, No build step, No bundler).**
- **الخط والتصميم:** خط Cairo من Google Fonts، تصميم Dark Theme عصري ومريح للعين مع Glassmorphism، ودعم كامل للغة العربية والاتجاه من اليمين لليسار (`dir="rtl"`).
- **الرسوم البيانية:** Chart.js عبر CDN.
- **قواعد البيانات والمصادقة:** Firebase JS SDK v10.13.0 (CDN ES Modules).

---

## 📁 هيكل المشروع

```text
├── index.html            # صفحة البداية وتسجيل الدخول
├── onboarding.html       # نموذج إعداد الخطة متعدد الخطوات
├── dashboard.html        # لوحة التحكم وتمرين اليوم والماكروز
├── workout.html          # جلسة التمرين وتتبع المجموعات وعداد الراحة
├── nutrition.html        # شرح الماكروز والسعرات وتنظيم الوجبات
├── schedule.html         # الجدول الأسبوعي وأيام الراحة
├── progress.html         # الرسوم البيانية لتطور الوزن والقوة
├── settings.html         # تعديل البيانات وإعادة الحساب وتسجيل الخروج
├── coach.html            # شات الكابتن الذكي (AI Coach)
├── css/
│   └── style.css         # التصميم الكامل ونظام الألوان الداكن
├── js/
│   ├── firebase-config.js # إعدادات Firebase والاتصال
│   ├── auth.js           # تسجيل الدخول عبر جوجل وحماية الصفحات
│   ├── calc.js           # دوال الحسابات الرياضية والماكروز
│   ├── plans.js          # قوالب الجداول والفلترة
│   ├── db.js             # دوال القراءة والكتابة في Firestore
│   └── ui.js             # الإشعارات (Toasts) والشريط السفلي وعداد الراحة
├── data/
│   └── exercises.json    # مكتبة التمارين
├── firestore.rules       # قواعد حماية وأمان Firestore
├── vercel.json           # إعدادات نشر Vercel
└── README.md             # دليل الاستخدام والتشغيل
```

---

## 🚀 خطوات إعداد ونشر المشروع (Step-by-Step)

### 1. إعداد Firebase
1. افتح [Firebase Console](https://console.firebase.google.com/) وأنشئ مشروعاً جديداً.
2. من القائمة الجانبية: **Build > Authentication** -> اضغط **Get Started** -> فعّل **Google** كمزود لتسجيل الدخول.
3. من القائمة الجانبية: **Build > Firestore Database** -> اضغط **Create Database**.
4. ادخل على تبويب **Rules** في Firestore، والصق محتوى ملف `firestore.rules` ثم اضغط **Publish**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         match /{allSubcollections=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
       match /{document=**} {
         allow read, write: false;
       }
     }
   }
   ```
5. ملف `js/firebase-config.js` مجهز بالفعل ببيانات مشروع Firebase الخاصة بك.

---

### 2. النشر على Vercel (مجاناً وبدون أي أوامر بناء)
1. ارفع مجلد المشروع على حسابك في GitHub.
2. افتح [Vercel Dashboard](https://vercel.com/) واضغط **Add New > Project**.
3. اختر مستودع GitHub الخاص بالمشروع.
4. في إعدادات النشر:
   - **Framework Preset:** اختر **Other**.
   - **Build Command:** اتركه فارغاً.
   - **Output Directory:** اتركه فارغاً (`./`).
5. اضغط **Deploy**.
6. **خطوة أخيرة هامة:** انسخ رابط موقعك من Vercel (مثال: `gymapp.vercel.app`) وافتحه في **Firebase Console > Authentication > Settings > Authorized Domains** واضغط **Add Domain** والصق الرابط ليعمل تسجيل الدخول من جوجل على الرابط المنشور.

---

## 💻 الاختبار والتشغيل محلياً

لتشغيل المشروع محلياً يمكنك فتح المجلد بأي خادم محلي خفيف، مثل إضافة **Live Server** في VS Code، أو عن طريق بايثون:
```bash
python -m http.server 3000
```
ثم فتح المتصفح على `http://localhost:3000`.
