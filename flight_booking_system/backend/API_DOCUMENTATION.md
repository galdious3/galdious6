"""
نظام حجز تذاكر الطيران - ملف التوثيق للخادم الخلفي
توثيق واجهات برمجة التطبيقات (API) للخادم الخلفي
"""

# واجهات برمجة التطبيقات لنظام حجز تذاكر الطيران

## مقدمة

هذا المستند يوثق واجهات برمجة التطبيقات (API) المتاحة في نظام حجز تذاكر الطيران. تم تطوير هذه الواجهات باستخدام إطار عمل Flask وتستخدم تنسيق JSON للبيانات.

## نقاط النهاية الأساسية

### الصفحة الرئيسية

```
GET /
```

تعرض الصفحة الرئيسية للتطبيق.

## واجهات برمجة التطبيقات للمدن

### الحصول على قائمة المدن

```
GET /api/cities
```

تعيد قائمة بجميع المدن المتاحة في النظام.

**مثال للاستجابة:**

```json
[
  {
    "id": 1,
    "name": "بغداد",
    "airport_code": "BGW"
  },
  {
    "id": 2,
    "name": "لندن",
    "airport_code": "LHR"
  }
]
```

### الحصول على معلومات مدينة محددة

```
GET /api/cities/<city_id>
```

تعيد معلومات مدينة محددة بواسطة المعرف.

**مثال للاستجابة:**

```json
{
  "id": 1,
  "name": "بغداد",
  "airport_code": "BGW"
}
```

## واجهات برمجة التطبيقات لشركات الطيران

### الحصول على قائمة شركات الطيران

```
GET /api/airlines
```

تعيد قائمة بجميع شركات الطيران المتاحة في النظام.

**مثال للاستجابة:**

```json
[
  {
    "id": 1,
    "name": "الخطوط الجوية العراقية",
    "logo": "iraqi_airways.png"
  },
  {
    "id": 2,
    "name": "طيران الإمارات",
    "logo": "emirates.png"
  }
]
```

### الحصول على معلومات شركة طيران محددة

```
GET /api/airlines/<airline_id>
```

تعيد معلومات شركة طيران محددة بواسطة المعرف.

**مثال للاستجابة:**

```json
{
  "id": 1,
  "name": "الخطوط الجوية العراقية",
  "logo": "iraqi_airways.png"
}
```

## واجهات برمجة التطبيقات لفئات الحجز

### الحصول على قائمة فئات الحجز

```
GET /api/travel_classes
```

تعيد قائمة بجميع فئات الحجز المتاحة في النظام.

**مثال للاستجابة:**

```json
[
  {
    "id": 1,
    "name": "الدرجة الاقتصادية"
  },
  {
    "id": 2,
    "name": "درجة رجال الأعمال"
  },
  {
    "id": 3,
    "name": "الدرجة الأولى"
  }
]
```

## واجهات برمجة التطبيقات للبحث عن الرحلات

### البحث عن الرحلات المتاحة

```
POST /api/flights/search
```

تبحث عن الرحلات المتاحة بناءً على معايير البحث.

**معلمات الطلب:**

```json
{
  "from_city_id": 1,
  "to_city_id": 2,
  "departure_date": "2025-04-15",
  "return_date": "2025-04-20",
  "passengers": 2,
  "travel_class_id": 1
}
```

**مثال للاستجابة:**

```json
{
  "outbound_flights": [
    {
      "id": 1,
      "airline_id": 1,
      "airline_name": "الخطوط الجوية العراقية",
      "airline_logo": "iraqi_airways.png",
      "from_city_id": 1,
      "from_city_name": "بغداد",
      "to_city_id": 2,
      "to_city_name": "لندن",
      "departure_time": "08:30",
      "arrival_time": "12:45",
      "day_of_week": 2,
      "base_price": 250.0,
      "tax_percentage": 10.0,
      "discount_percentage": 0.0,
      "price_per_passenger": 275.0,
      "total_price": 550.0,
      "travel_class_name": "الدرجة الاقتصادية"
    }
  ],
  "return_flights": [
    {
      "id": 2,
      "airline_id": 1,
      "airline_name": "الخطوط الجوية العراقية",
      "airline_logo": "iraqi_airways.png",
      "from_city_id": 2,
      "from_city_name": "لندن",
      "to_city_id": 1,
      "to_city_name": "بغداد",
      "departure_time": "14:30",
      "arrival_time": "20:45",
      "day_of_week": 0,
      "base_price": 250.0,
      "tax_percentage": 10.0,
      "discount_percentage": 0.0,
      "price_per_passenger": 275.0,
      "total_price": 550.0,
      "travel_class_name": "الدرجة الاقتصادية"
    }
  ]
}
```

## واجهات برمجة التطبيقات لتفاصيل الرحلة

### الحصول على تفاصيل رحلة محددة

```
GET /api/flights/<flight_id>
```

تعيد تفاصيل رحلة محددة بواسطة المعرف.

**مثال للاستجابة:**

```json
{
  "id": 1,
  "airline_id": 1,
  "airline_name": "الخطوط الجوية العراقية",
  "airline_logo": "iraqi_airways.png",
  "from_city_id": 1,
  "from_city_name": "بغداد",
  "from_airport_code": "BGW",
  "to_city_id": 2,
  "to_city_name": "لندن",
  "to_airport_code": "LHR",
  "departure_time": "08:30",
  "arrival_time": "12:45",
  "day_of_week": 2,
  "prices": [
    {
      "id": 1,
      "airline_id": 1,
      "from_city_id": 1,
      "to_city_id": 2,
      "travel_class_id": 1,
      "travel_class_name": "الدرجة الاقتصادية",
      "base_price": 250.0,
      "tax_percentage": 10.0,
      "discount_percentage": 0.0,
      "tax_amount": 25.0,
      "discount_amount": 0.0,
      "final_price": 275.0
    },
    {
      "id": 2,
      "airline_id": 1,
      "from_city_id": 1,
      "to_city_id": 2,
      "travel_class_id": 2,
      "travel_class_name": "درجة رجال الأعمال",
      "base_price": 500.0,
      "tax_percentage": 10.0,
      "discount_percentage": 0.0,
      "tax_amount": 50.0,
      "discount_amount": 0.0,
      "final_price": 550.0
    }
  ]
}
```

## واجهات برمجة التطبيقات للخدمات الإضافية

### الحصول على قائمة الخدمات الإضافية

```
GET /api/ancillary_services
```

تعيد قائمة بجميع الخدمات الإضافية المتاحة في النظام.

**مثال للاستجابة:**

```json
[
  {
    "id": 1,
    "name": "وجبة خاصة",
    "description": "وجبة خاصة حسب الطلب"
  },
  {
    "id": 2,
    "name": "أمتعة إضافية",
    "description": "حقيبة إضافية بوزن 23 كجم"
  }
]
```

### الحصول على الخدمات الإضافية لشركة طيران محددة

```
GET /api/airlines/<airline_id>/ancillary_services
```

تعيد قائمة بالخدمات الإضافية المتاحة لشركة طيران محددة مع الأسعار.

**مثال للاستجابة:**

```json
[
  {
    "id": 1,
    "airline_id": 1,
    "ancillary_service_id": 1,
    "name": "وجبة خاصة",
    "description": "وجبة خاصة حسب الطلب",
    "price": 15.0
  },
  {
    "id": 2,
    "airline_id": 1,
    "ancillary_service_id": 2,
    "name": "أمتعة إضافية",
    "description": "حقيبة إضافية بوزن 23 كجم",
    "price": 50.0
  }
]
```

## واجهات برمجة التطبيقات للمستخدمين

### تسجيل مستخدم جديد

```
POST /api/users/register
```

تسجيل مستخدم جديد في النظام.

**معلمات الطلب:**

```json
{
  "username": "ahmed123",
  "password": "password123",
  "email": "ahmed@example.com",
  "first_name": "أحمد",
  "last_name": "محمد",
  "phone": "+9641234567890",
  "address": "بغداد، العراق",
  "date_of_birth": "1990-01-01",
  "passport_number": "A12345678",
  "passport_expiry": "2030-01-01",
  "nationality": "عراقي"
}
```

**مثال للاستجابة:**

```json
{
  "success": true,
  "user_id": 1
}
```

### تسجيل دخول المستخدم

```
POST /api/users/login
```

تسجيل دخول المستخدم إلى النظام.

**معلمات الطلب:**

```json
{
  "username": "ahmed123",
  "password": "password123"
}
```

**مثال للاستجابة:**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "ahmed123",
    "email": "ahmed@example.com",
    "first_name": "أحمد",
    "last_name": "محمد"
  }
}
```

### تسجيل خروج المستخدم

```
POST /api/users/logout
```

تسجيل خروج المستخدم من النظام.

**مثال للاستجابة:**

```json
{
  "success": true
}
```

### الحصول على الملف الشخصي للمستخدم

```
GET /api/users/profile
```

تعيد معلومات الملف الشخصي للمستخدم الحالي.

**مثال للاستجابة:**

```json
{
  "id": 1,
  "username": "ahmed123",
  "email": "ahmed@example.com",
  "first_name": "أحمد",
  "last_name": "محمد",
  "phone": "+9641234567890",
  "address": "بغداد، العراق",
  "date_of_birth": "1990-01-01",
  "passport_number": "A12345678",
  "passport_expiry": "2030-01-01",
  "nationality": "عراقي"
}
```

### تحديث الملف الشخصي للمستخدم

```
PUT /api/users/profile
```

تحديث معلومات الملف الشخصي للمستخدم الحالي.

**معلمات الطلب:**

```json
{
  "email": "ahmed.new@example.com",
  "first_name": "أحمد",
  "last_name": "محمد",
  "phone": "+9641234567890",
  "address": "بغداد، العراق",
  "date_of_birth": "1990-01-01",
  "passport_number": "A12345678",
  "passport_expiry": "2030-01-01",
  "nationality": "عراقي"
}
```

**مثال للاستجابة:**

```json
{
  "success": true
}
```

## واجهات برمجة التطبيقات للحجوزات

### إنشاء حجز جديد

```
POST /api/bookings
```

إنشاء حجز جديد في النظام.

**معلمات الطلب:**

```json
{
  "passenger_name": "أحمد محمد",
  "passenger_email": "ahmed@example.com",
  "passenger_phone": "+9641234567890",
  "flight_schedule_id": 1,
  "travel_class_id": 1,
  "flight_date": "2025-04-15",
  "bags_count": 2,
  "medical_discount": false,
  "ancillary_services": [
    {
      "id": 1
    },
    {
      "id": 2
    }
  ]
}
```

**مثال للاستجابة:**

```json
{
  "success": true,
  "booking": {
    "id": 1,
    "booking_reference": "ABC12345",
    "passenger_name": "أحمد محمد",
    "passenger_email": "ahmed@example.com",
    "passenger_phone": "+9641234567890",
    "flight_schedule_id": 1,
    "airline_id": 1,
    "airline_name": "الخطوط الجوية العراقية",
    "airline_logo": "iraqi_airways.png",
    "from_city_id": 1,
    "from_city_name": "بغداد",
    "from_airport_code": "BGW",
    "to_city_id": 2,
    "to_city_name": "لندن",
    "to_airport_code": "LHR",
    "departure_time": "08:30",
    "arrival_time": "12:45",
    "travel_class_id": 1,
    "travel_class_name": "الدرجة الاقتصادية",
    "booking_date": "2025-03-22 21:30:00",
    "flight_date": "2025-04-15",
    "bags_count": 2,
    "medical_discount": 0,
    "base_price": 250.0,
    "tax_amount": 25.0,
    "discount_amount": 0.0,
    "final_price": 275.0,
    "payment_status": "pending",
    "booking_status": "confirmed",
    "ancillary_services": [
      {
        "id": 1,
        "booking_id": 1,
        "ancillary_service_id": 1,
        "name": "وجبة خاصة",
        "description": "وجبة خاصة حسب الطلب",
        "price": 15.0
      },
      {
        "id": 2,
        "booking_id": 1,
        "ancillary_service_id": 2,
        "name": "أمتعة إضافية",
        "description": "حقيبة إضافية بوزن 23 كجم",
        "price": 50.0
      }
    ]
  }
}
```

### الحصول على تفاصيل حجز محدد

```
GET /api/bookings/<booking_id>
```

تعيد تفاصيل حجز محدد بواسطة المعرف.

**مثال للاستجابة:**

```json
{
  "id": 1,
  "booking_reference": "ABC12345",
  "passenger_name": "أحمد محمد",
  "passenger_email": "ahmed@example.com",
  "passenger_phone": "+9641234567890",
  "flight_schedule_id": 1,
  "airline_id": 1,
  "airline_name": "الخطوط الجوية العراقية",
  "airline_logo": "iraqi_airways.png",
  "from_city_id": 1,
  "from_city_name": "بغداد",
  "from_airport_code": "BGW",
  "to_city_id": 2,
  "to_city_name": "لندن",
  "to_airport_code": "LHR",
  "departure_time": "08:30",
  "arrival_time": "12:45",
  "travel_class_id": 1,
  "travel_class_name": "الدرجة الاقتصادية",
  "booking_date": "2025-03-22 21:30:00",
  "flight_date": "2025-04-15",
  "bags_count": 2,
  "medical_discount": 0,
  "base_price": 250.0,
  "tax_amount": 25.0,
  "discount_amount": 0.0,
  "final_price": 275.0,
  "payment_status": "pending",
  "booking_status": "confirmed",
  "ancillary_services": [
    {
      "id": 1,
      "booking_id": 1,
      "ancillary_service_id": 1,
      "name": "وجبة خاصة",
      "description": "وجبة خاصة حسب الطلب",
      "price": 15.0
    },
    {
      "id": 2,
      "booking_id": 1,
      "ancillary_service_id": 2,
      "name": "أمتعة إضافية",
      "description": "حقيبة إضافية بوزن 23 كجم",
      "price": 50.0
    }
  ]
}
```

### الحصول على تفاصيل حجز بواسطة الرقم المرجعي

```
GET /api/bookings/reference/<booking_reference>
```

تعيد تفاصيل حجز بواسطة الرقم المرجعي.

**مثال للاستجابة:**

نفس استجابة `GET /api/bookings/<booking_id>`

### الحصول على حجوزات المستخدم الحالي

```
GET /api/users/bookings
```

تعيد قائمة بجميع حجوزات المستخدم الحالي.

**مثال للاستجابة:**

```json
[
  {
    "id": 1,
    "booking_reference": "ABC12345",
    "flight_date": "2025-04-15",
    "booking_date": "2025-03-22 21:30:00",
    "final_price": 275.0,
    "payment_status": "pending",
    "booking_status": "confirmed",
    "departure_time": "08:30",
    "arrival_time": "12:45",
    "airline_name": "الخطوط الجوية العراقية",
    "from_city_name": "بغداد",
    "from_airport_code": "BGW",
    "to_city_name": "لندن",
    "to_airport_code": "LHR",
    "travel_class_name": "الدرجة الاقتصادية"
  }
]
```

## واجهات برمجة التطبيقات للمدفوعات

### معالجة عملية دفع جديدة

```
POST /api/payments
```

معالجة عملية دفع جديدة لحجز.

**معلمات الطلب:**

```json
{
  "booking_id": 1,
  "amount": 275.0,
  "payment_method": "credit_card",
  "card_number": "4111111111111111",
  "card_holder": "أحمد محمد",
  "expiry_date": "12/25",
  "cvv": "123"
}
```

**مثال للاستجابة:**

```json
{
  "success": true,
  "payment_id": 1,
  "transaction_id": "abc123def456",
  "status": "completed"
}
```

## ملاحظات

- جميع الطلبات التي تتطلب مصادقة يجب أن تكون مسبوقة بتسجيل الدخول.
- يتم إرجاع أخطاء المصادقة برمز حالة 401.
- يتم إرجاع أخطاء الوصول برمز حالة 403.
- يتم إرجاع أخطاء البيانات غير الصالحة برمز حالة 400.
- يتم إرجاع أخطاء العنصر غير الموجود برمز حالة 404.
- يتم إرجاع أخطاء الخادم الداخلية برمز حالة 500.
