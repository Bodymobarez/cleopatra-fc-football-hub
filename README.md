**CERAMICA CLEOPATRA FC — Football Hub**

**About**

تطبيق ويب لنادي سيراميكا كليوباترا. يعمل محلياً مع Vite و React.

**Run locally**

1. استنسخ المستودع وادخل المجلد  
2. `npm install`  
3. أنشئ `.env` أو `.env.local` واضبط المتغيرات (يمكن استخدام الأسماء الجديدة أو القديمة):

```
VITE_CERAMICA_CLEOPATRA_APP_ID=your_app_id
VITE_CERAMICA_CLEOPATRA_APP_BASE_URL=your_backend_url
VITE_CERAMICA_CLEOPATRA_FUNCTIONS_VERSION=optional

# ما زال مدعوماً للتوافق مع الإعدادات السابقة:
# VITE_BASE44_APP_ID=...
# VITE_BASE44_APP_BASE_URL=...
# VITE_BASE44_FUNCTIONS_VERSION=...
```

`npm run dev` للتطوير، `npm run build` للإنتاج.

**Deploy**

مثال: Netlify مع `npm run build` ومجلد النشر `dist` (انظر `netlify.toml`).
