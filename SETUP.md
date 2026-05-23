# 🚀 دليل إعداد مشروع نبضة مع Firebase

## المتطلبات
- Node.js 18+
- حساب Google (لـ Firebase)

---

## الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [console.firebase.google.com](https://console.firebase.google.com)
2. اضغط **"Add project"** > سمّه `nabda-chat`
3. أوقف Google Analytics (اختياري للـ Free tier)
4. اضغط **"Create project"**

---

## الخطوة 2: تفعيل Firebase Authentication

1. من القائمة الجانبية: **Authentication > Get started**
2. اختر **"Email/Password"** > فعّله > اضغط **Save**

---

## الخطوة 3: إعداد Firestore

1. **Firestore Database > Create database**
2. اختر **"Start in production mode"** (سنضع Rules يدوياً)
3. اختر موقع قريب منك (مثل: `europe-west1` أو `us-central1`)
4. بعد الإنشاء، اذهب إلى **Rules** والصق محتوى `firestore.rules`
5. اضغط **Publish**

---

## الخطوة 4: إعداد Realtime Database (للـ Presence)

1. **Realtime Database > Create database**
2. اختر نفس المنطقة > **"Start in locked mode"**
3. بعد الإنشاء، اذهب إلى **Rules** والصق محتوى `database.rules.json`
4. اضغط **Publish**

---

## الخطوة 5: الحصول على إعدادات المشروع

1. **Project Settings** (⚙️) > **General**
2. اسحب للأسفل إلى **"Your apps"** > اضغط **"</> Web"**
3. سجّل اسماً للتطبيق > اضغط **Register app**
4. انسخ الـ `firebaseConfig` object

---

## الخطوة 6: إعداد المشروع محلياً

```bash
# 1. انسخ ملف متغيرات البيئة
cp .env.local.example .env.local

# 2. افتح .env.local وضع القيم من Firebase Console:
# NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nabda-chat.firebaseapp.com
# NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://nabda-chat-default-rtdb.firebaseio.com
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=nabda-chat
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nabda-chat.appspot.com
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
# NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123

# 3. تثبيت الحزم
npm install
# أو
pnpm install

# 4. تشغيل التطبيق
npm run dev
```

---

## الخطوة 7: إنشاء Firestore Indexes

عند أول تشغيل، قد تظهر في Console روابط لإنشاء indexes تلقائياً.
اضغط عليها وستنشئ الـ index في Firebase تلقائياً.

الـ indexes المطلوبة:
- `rooms` collection: `isPublic` ASC + `lastMessageAt` DESC
- `rooms` collection: `members` (array) + `isPublic` ASC + `lastMessageAt` DESC

---

## 📊 حدود Firebase Free Tier (Spark Plan)

| الخدمة | الحد المجاني |
|--------|-------------|
| Authentication | 10,000 مستخدم/شهر |
| Firestore Reads | 50,000 قراءة/يوم |
| Firestore Writes | 20,000 كتابة/يوم |
| Firestore Deletes | 20,000 حذف/يوم |
| Firestore Storage | 1 GB |
| Realtime DB | 1 GB storage، 10 GB/شهر |

### تقدير الاستخدام لـ 100 مستخدم نشط يومياً:
- كل مستخدم يرسل 20 رسالة = 2000 كتابة/يوم ✅
- تحميل الغرف والمستخدمين = ~5000 قراءة/يوم ✅
- **المجموع يبقى ضمن الحد المجاني بسهولة** 🎉

---

## 🔧 تحسينات الاستهلاك المطبّقة

1. **Pagination للرسائل**: تحميل 30 رسالة فقط في كل مرة
2. **Batch Writes**: دمج عدة عمليات في طلب واحد
3. **onSnapshot محدود**: listener للرسائل الجديدة فقط (آخر 30)
4. **getDocs للتاريخ**: بدلاً من listener إضافي للرسائل القديمة
5. **Presence في RTDB**: أرخص بكثير من Firestore للـ online status
6. **الغرف العامة**: تحميل مرة واحدة (getDocs) لا realtime

---

## 🚀 النشر على Vercel (مجاني)

```bash
# 1. ثبّت Vercel CLI
npm i -g vercel

# 2. النشر
vercel

# 3. أضف متغيرات البيئة في Vercel Dashboard:
# Settings > Environment Variables
# أضف كل متغيرات .env.local
```

---

## 📁 هيكل المشروع

```
nabda-chat/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── nabda/
│       ├── nabda-app.tsx      ← المكوّن الرئيسي
│       ├── auth-screen.tsx    ← شاشة تسجيل الدخول/التسجيل
│       ├── home-tab.tsx       ← الغرف والاستكشاف
│       ├── friends-tab.tsx    ← الأصدقاء والرسائل الخاصة
│       ├── profile-tab.tsx    ← الملف الشخصي
│       ├── room-chat.tsx      ← شاشة الدردشة (Realtime)
│       ├── bottom-nav.tsx     ← شريط التنقل السفلي
│       └── splash-screen.tsx  ← شاشة التحميل
├── hooks/
│   ├── use-auth.ts            ← Firebase Authentication
│   ├── use-chat.ts            ← Realtime Chat + Pagination
│   ├── use-rooms.ts           ← إدارة الغرف
│   ├── use-friends.ts         ← إدارة الأصدقاء
│   └── use-presence.ts        ← نظام الحضور (RTDB)
├── lib/
│   ├── firebase.ts            ← تهيئة Firebase
│   ├── types.ts               ← TypeScript interfaces
│   └── constants.ts           ← ثوابت ودوال مساعدة
├── firestore.rules            ← قواعد أمان Firestore
├── database.rules.json        ← قواعد أمان RTDB
└── .env.local.example         ← مثال متغيرات البيئة
```
