# عقد وتكامل Community API الموحّد (COMMUNITY_API_CONTRACT.md)

هذا المستند يحدد العقد البرمجي الكامل والنهائي لربط **موقع 1 («نحن معك»)** مع **موقع 2 (Community API & Admin Dashboard)**.

---

## 1. متغير البيئة المطلوب في موقع 1 (Site 1 Frontend Config)

في ملف `.env` الخاص بموقع 1:
```env
VITE_COMMUNITY_API_URL=https://ais-dev-tmdqsjahoadtfap55ogvcf-269432571738.europe-west2.run.app
```

---

## 2. سياسة الأمان وعزل المفاتيح (Security & Secrets Isolation)
- **موقع 1 لا يتسلم ولا يخزن أي Service Role Key الخاص بـ Supabase B.**
- جميع عمليات القراءة والكتابة والتحقق من الصلاحيات تمر عبر موقع 2.
- عند إرسال طلبات تفاعلية (إنشاء منشور، تعليق، تفاعل)، يرسل موقع 1 **Access Token** الخاص بجلسة الطالب في Supabase A عبر الترويسة:
  ```http
  Authorization: Bearer <Supabase-A-Access-Token>
  ```
- يتحقق موقع 2 خادمياً من صحة الـ Token وهوية المستخدم مباشرة مع Supabase A.

---

## 3. قائمة المسارات البرمجية (API Endpoints & Contracts)

### أ. تغذية المجتمع العامة (Public Feed)
- **المسار:** `GET /api/v1/community/posts`
- **الصلاحية:** عام (لا يتطلب تسجيل دخول).
- **الاستجابة:** يعيد المنشورات المقبولة (`status = 'published'`) فقط مع تعليقاتها وإحصائيات التفاعل.

**نموذج الاستجابة (JSON Payload):**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_1740348000_abc123",
      "author_name": "أحمد علي",
      "author_avatar": null,
      "post_text": "سؤال حول مسألة الرياضيات الفصل الثالث...",
      "media_urls": [],
      "media_type": "none",
      "reactions_count": 5,
      "comments_count": 2,
      "created_at": "2026-08-23T17:00:00.000Z",
      "comments": [
        {
          "id": "com_1740348100_xyz",
          "author_name": "سارة محمد",
          "comment_text": "الجواب هو استخدام قانون فيثاغورس...",
          "created_at": "2026-08-23T17:05:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": null,
    "hasMore": false
  }
}
```

---

### ب. إنشاء منشور جديد (Create Post)
- **المسار:** `POST /api/v1/community/posts`
- **الصلاحية:** يتطلب تسجيل دخول (`Authorization: Bearer <Token>`).
- **جسم الطلب (Request Body):**
```json
{
  "post_text": "نص المنشور أو السؤال...",
  "group_id": "grp_target_1"
}
```
- **حالة النشر الافتراضية:** يدخل المنشور بحالة `published` إذا كان من طالب موثق، أو `pending` إذا كان يتطلب مراجعة إدارية.

---

### ج. إضافة تعليق (Add Comment)
- **المسار:** `POST /api/v1/community/posts/:id/comments`
- **الصلاحية:** يتطلب تسجيل دخول (`Authorization: Bearer <Token>`).
- **جسم الطلب (Request Body):**
```json
{
  "comment_text": "نص التعليق..."
}
```

---

### د. التفاعل مع المنشور (Toggle Reaction)
- **المسار:** `PUT /api/v1/community/posts/:id/reaction`
- **الصلاحية:** يتطلب تسجيل دخول (`Authorization: Bearer <Token>`).
- **جسم الطلب (Request Body):**
```json
{
  "reaction_type": "like"
}
```

---

### هـ. رفع وسائط الصور (Media Upload Policy)
- خدمة الوسائط عبر Cloudflare R2 مؤجلة في هذه المرحلة.
- أي استدعاء لـ `POST /api/v1/community/media/presign` سيعيد بأمان:
```json
{
  "success": false,
  "code": "MEDIA_NOT_IMPLEMENTED",
  "error": "خدمة رفع الصور عبر Cloudflare R2 مؤجلة حالياً وليست مفعلة في هذه المرحلة."
}
```

---

## 4. رموز الأخطاء القياسية وكيفية التعامل معها (HTTP Error Handling)

| رمز الخطأ | الرمز البرمجي (Code) | المعنى والإجراء المطلوب في موقع 1 |
|:---:|---|---|
| **401** | `UNAUTHORIZED` / `TOKEN_EXPIRED` | جلسة المستخدم غير مسجلة أو منتهية؛ يجب توجيهه لتسجيل الدخول في منصة التعليم. |
| **403** | `FORBIDDEN_NOT_ACTIVE_ADMIN` | المستخدم حاول الوصول لمسار إداري دون امتلاك مقعد إشرافي نشط (من المقاعد الثلاثة). |
| **409** | `ADMIN_SEATS_FULL` | اكتمال المقاعد الإدارية الثلاثة (3/3)؛ يجب تجميد حساب قديم أولاً قبل إضافة جديد. |
| **501** | `MEDIA_NOT_IMPLEMENTED` | ميزة رفع الوسائط مؤجلة؛ تمنع الواجهة محاولات الرفع الوهمية. |
| **503** | `DATABASE_UNAVAILABLE` | تعذر الاتصال بـ Supabase B؛ تظهر رسالة للمستخدم بالمحاولة لاحقاً بدلاً من إظهار بيانات وهمية. |

---

## 5. نطاقات CORS المسموحة (Allowed Origins)
- `https://moryohh.github.io`
- النطاق النهائي لـ Vercel الخاص بموقع 1 عند إطلاقه.
