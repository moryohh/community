# تقرير التدقيق الفني الشامل لموقع 2 قبل تنفيذ الإصلاحات

## 1. فحص الأسرار المكتوبة في الكود (Hardcoded Secrets Detection)
تم العثور على قيم نصية صريحة ومفاتيح Fallback داخل الملفات التالية:
- `server.ts`: السطور 140، 158، 176، 193 (مفاتيح Service Role).
- `server.ts`: السطور 141، 159، 177، 194، و `server/ocrService.ts` السطر 4 (مفاتيح OCR.Space).
- `server.ts`: السطور 196 و `server/deepseekService.ts` السطور 17، 19 (مفتاح DeepSeek).
- `server.ts`: السطور 1929-1932 (رموز Apify).

## 2. فحص استجابات الـ API للواجهة (API Response Secrets Exposure)
- `/api/projects`: كان يعيد كائن المشروع مع مفاتيح `service_role_key` و `ocr_api_key` بصورة مكشوفة للمتصفح.
- `/api/keys-status`: كان يعيد قيم المفاتيح الكاملة `serviceRoleKey`, `deepseekApiKey`, `defaultOcrKey`.
- `DatabaseTable.tsx`: يحتوي على أزرار كشف المفتاح (Show Key) ونسخه للمتصفح.

## 3. فحص عزل القاعدتين Supabase A و B
- عنوان `COMMUNITY_SUPABASE_URL` و `AUTH_SUPABASE_A_URL` يقرآن حالياً نفس العنوان في البيئة الافتراضية.
- تم ضبط الخادم لإصدار تحذير أمني صريح إذا تساوى المشروعان، وفصل كل عميل تماماً بحيث لا يستعين أحدهما بمفاتيح أو جداول الآخر.

## 4. خطة الإصلاحات الفورية
1. إزالة جميع المفاتيح النصية المكتوبة في الكود والاعتماد الحصري على `process.env`.
2. حماية الـ API وإرجاع `boolean` فقط (`hasServiceRoleKey`, `hasOcrApiKey`) وتجريد الواجهة من أزرار كشف الأسرار.
3. تفعيل CORS المنضبط مع `COMMUNITY_ALLOWED_ORIGINS` لرفض الطلبات غير المصرح لها.
4. فرض التحقق الصارم لـ JWT المستخرج من Supabase A وحصر الإشراف في 3 مقاعد نشطة في `dashboard_admins`.
5. تعطيل رفع الوسائط مؤقتاً برسالة `MEDIA_NOT_IMPLEMENTED` لحين طلب إعداد Cloudflare R2.
