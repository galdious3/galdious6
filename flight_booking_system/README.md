# نظام حجز تذاكر الطيران

![شعار النظام](frontend/images/logo.png)

## نظرة عامة

نظام حجز تذاكر الطيران هو تطبيق ويب متكامل يتيح للمستخدمين البحث عن رحلات الطيران وحجزها ودفع ثمنها عبر الإنترنت. يوفر النظام واجهة مستخدم سهلة الاستخدام وعصرية مع خلفية قوية تتكامل مع قاعدة بيانات MySQL.

## المميزات الرئيسية

- **البحث عن الرحلات**: البحث عن رحلات الطيران بناءً على المدينة المغادرة والوجهة وتاريخ السفر وعدد المسافرين.
- **فلترة النتائج**: تصفية نتائج البحث حسب شركة الطيران والسعر ووقت المغادرة.
- **مقارنة الأسعار**: مقارنة أسعار الرحلات بين مختلف شركات الطيران.
- **اختيار فئة الحجز**: اختيار بين الدرجة الاقتصادية ودرجة رجال الأعمال والدرجة الأولى.
- **إدارة معلومات المسافر**: إدخال وتخزين معلومات المسافر الشخصية وبيانات جواز السفر.
- **الخدمات الإضافية**: إضافة خدمات إضافية مثل الوجبات الخاصة والأمتعة الإضافية.
- **معالجة الدفع**: دفع ثمن التذاكر بطرق دفع متعددة.
- **إدارة الحجوزات**: عرض وإدارة الحجوزات السابقة والقادمة.

## هيكل المشروع

```
flight_booking_system/
├── frontend/                  # ملفات الواجهة الأمامية
│   ├── css/                   # أنماط CSS
│   ├── js/                    # ملفات JavaScript
│   ├── images/                # الصور والأيقونات
│   ├── index.html             # الصفحة الرئيسية
│   ├── search-results.html    # صفحة نتائج البحث
│   ├── flight-details.html    # صفحة تفاصيل الرحلة
│   └── passenger-info.html    # صفحة معلومات المسافر
│
├── backend/                   # ملفات الخلفية
│   ├── app.py                 # تطبيق Flask الرئيسي
│   ├── helpers.py             # دوال مساعدة
│   ├── config.py              # ملف التكوين
│   └── run.py                 # نقطة الدخول للتطبيق
│
├── database/                  # ملفات قاعدة البيانات
│   └── database_schema.sql    # مخطط قاعدة البيانات
│
└── docs/                      # التوثيق
    ├── flight_booking_research.md       # بحث حول أنظمة حجز تذاكر الطيران
    ├── programming_functions_analysis.md # تحليل الوظائف البرمجية
    └── database_design.md               # تصميم قاعدة البيانات
```

## المتطلبات

### متطلبات الواجهة الأمامية
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Font Awesome

### متطلبات الخلفية
- Python 3.8+
- Flask
- PyMySQL
- Flask-CORS

### متطلبات قاعدة البيانات
- MySQL 8.0+

## التثبيت والإعداد

### 1. استنساخ المستودع
```bash
git clone https://github.com/yourusername/flight-booking-system.git
cd flight-booking-system
```

### 2. إعداد البيئة الافتراضية (اختياري)
```bash
python -m venv venv
source venv/bin/activate  # على Linux/Mac
venv\Scripts\activate     # على Windows
```

### 3. تثبيت التبعيات
```bash
pip install -r requirements.txt
```

### 4. إعداد قاعدة البيانات
```bash
mysql -u root -p < database/database_schema.sql
```

### 5. تكوين الاتصال بقاعدة البيانات
قم بتعديل ملف `backend/config.py` لتحديد إعدادات الاتصال بقاعدة البيانات الخاصة بك:
```python
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'your_username'
app.config['MYSQL_PASSWORD'] = 'your_password'
app.config['MYSQL_DB'] = 'mustafakk'
```

### 6. تشغيل التطبيق
```bash
cd backend
python run.py
```

## الاستخدام

1. افتح المتصفح وانتقل إلى `http://localhost:5000`
2. استخدم نموذج البحث في الصفحة الرئيسية للبحث عن الرحلات
3. اختر الرحلة المناسبة من نتائج البحث
4. أدخل معلومات المسافر
5. اختر الخدمات الإضافية (إن وجدت)
6. أكمل عملية الدفع
7. استلم تأكيد الحجز

## واجهات برمجة التطبيقات (APIs)

يوفر النظام مجموعة شاملة من واجهات برمجة التطبيقات للتفاعل مع الخلفية:

- `GET /api/cities` - الحصول على قائمة المدن
- `GET /api/airlines` - الحصول على قائمة شركات الطيران
- `POST /api/flights/search` - البحث عن الرحلات
- `GET /api/flights/:id` - الحصول على تفاصيل رحلة محددة
- `POST /api/bookings` - إنشاء حجز جديد
- `GET /api/bookings/:id` - الحصول على تفاصيل حجز محدد

للحصول على توثيق كامل لواجهات برمجة التطبيقات، راجع ملف [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md).

## المساهمة

نرحب بالمساهمات! يرجى اتباع الخطوات التالية:

1. افتح مشكلة (issue) لمناقشة التغيير الذي ترغب في إجرائه
2. قم بعمل fork للمستودع
3. قم بإنشاء فرع (branch) جديد (`git checkout -b feature/amazing-feature`)
4. قم بإجراء التغييرات وتأكيد التعديلات (`git commit -m 'Add amazing feature'`)
5. قم بدفع التغييرات إلى الفرع (`git push origin feature/amazing-feature`)
6. قم بفتح طلب سحب (Pull Request)

## الترخيص

هذا المشروع مرخص بموجب رخصة MIT - انظر ملف [LICENSE](LICENSE) للحصول على التفاصيل.

## الاتصال

إذا كان لديك أي أسئلة أو اقتراحات، يرجى التواصل معنا على:

- البريد الإلكتروني: contact@skybooking.com
- تويتر: [@SkyBooking](https://twitter.com/skybooking)
- موقع الويب: [www.skybooking.com](https://www.skybooking.com)
