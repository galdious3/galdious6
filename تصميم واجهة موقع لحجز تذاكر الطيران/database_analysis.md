# تحليل قاعدة البيانات الحالية وتصميم الهيكل المحسن

## تحليل قاعدة البيانات الحالية (mustafakk)

من خلال فحص الصور المرفقة لقاعدة البيانات الحالية (mustafakk)، يمكن ملاحظة ما يلي:

### جدول gal

يحتوي جدول `gal` على المعلومات التالية:

| اسم العمود | نوع البيانات | الوصف |
|------------|--------------|--------|
| id1 | INT | المعرف الفريد للرحلة (المفتاح الأساسي) |
| name citytf | VARCHAR(45) | اسم مدينة المغادرة |
| name cityl | INT | اسم مدينة الوصول |
| time tf | DOUBLE | وقت المغادرة |
| time l | DOUBLE | وقت الوصول |
| type of plans | VARCHAR(45) | نوع الخطة أو الرحلة (مثل airbuds) |
| price | DOUBLE | سعر الرحلة |
| travelers name | VARCHAR(45) | اسم المسافر (غير ظاهر في هيكل الجدول ولكن ظاهر في البيانات) |

### ملاحظات على قاعدة البيانات الحالية

1. **بساطة الهيكل**: قاعدة البيانات الحالية بسيطة جداً وتحتوي على جدول رئيسي واحد فقط (`gal`).
2. **محدودية المعلومات**: لا توجد معلومات عن شركات الطيران المختلفة.
3. **عدم وجود علاقات**: لا توجد علاقات بين الجداول (مثل العلاقة بين الرحلات والمسافرين).
4. **تسمية الأعمدة**: تسمية الأعمدة غير واضحة وغير متسقة (مثل `name citytf` و `name cityl`).
5. **نقص في البيانات**: لا توجد معلومات عن المقاعد المتاحة، أو تفاصيل الرحلة، أو حالة الحجز.

## تصميم هيكل قاعدة البيانات المحسن

بناءً على تحليل قاعدة البيانات الحالية ومتطلبات نظام حجز تذاكر الطيران المتكامل، يمكن تصميم هيكل قاعدة بيانات محسن يتضمن إضافة شركات طيران متعددة وأسعار مختلفة للرحلات.

### الجداول المقترحة

#### 1. جدول Airlines (شركات الطيران)

```sql
CREATE TABLE airlines (
    airline_id INT AUTO_INCREMENT PRIMARY KEY,
    airline_name VARCHAR(100) NOT NULL,
    airline_code VARCHAR(10) NOT NULL,
    logo_url VARCHAR(255),
    description TEXT,
    contact_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. جدول Airports (المطارات)

```sql
CREATE TABLE airports (
    airport_id INT AUTO_INCREMENT PRIMARY KEY,
    airport_name VARCHAR(100) NOT NULL,
    airport_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    location_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. جدول Flights (الرحلات)

```sql
CREATE TABLE flights (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    airline_id INT NOT NULL,
    flight_number VARCHAR(20) NOT NULL,
    departure_airport_id INT NOT NULL,
    arrival_airport_id INT NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    status ENUM('scheduled', 'delayed', 'cancelled', 'completed') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (airline_id) REFERENCES airlines(airline_id),
    FOREIGN KEY (departure_airport_id) REFERENCES airports(airport_id),
    FOREIGN KEY (arrival_airport_id) REFERENCES airports(airport_id)
);
```

#### 4. جدول Flight_Classes (درجات الرحلة)

```sql
CREATE TABLE flight_classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 5. جدول Flight_Prices (أسعار الرحلات)

```sql
CREATE TABLE flight_prices (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    class_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id),
    FOREIGN KEY (class_id) REFERENCES flight_classes(class_id)
);
```

#### 6. جدول Users (المستخدمين)

```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 7. جدول Bookings (الحجوزات)

```sql
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'completed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

#### 8. جدول Booking_Details (تفاصيل الحجز)

```sql
CREATE TABLE booking_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    flight_id INT NOT NULL,
    price_id INT NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_email VARCHAR(100),
    passenger_phone VARCHAR(20),
    seat_number VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id),
    FOREIGN KEY (price_id) REFERENCES flight_prices(price_id)
);
```

#### 9. جدول Payments (المدفوعات)

```sql
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);
```

### مخطط العلاقات بين الجداول

```
Airlines (1) --- (*) Flights
Airports (1) --- (*) Flights (departure)
Airports (1) --- (*) Flights (arrival)
Flights (1) --- (*) Flight_Prices
Flight_Classes (1) --- (*) Flight_Prices
Users (1) --- (*) Bookings
Bookings (1) --- (*) Booking_Details
Bookings (1) --- (*) Payments
Flights (1) --- (*) Booking_Details
Flight_Prices (1) --- (*) Booking_Details
```

## بيانات أولية للجداول

### بيانات جدول Airlines (شركات الطيران)

```sql
INSERT INTO airlines (airline_name, airline_code, logo_url, description) VALUES
('الخطوط الجوية القطرية', 'QTR', '/images/airlines/qatar.png', 'شركة طيران قطرية تأسست عام 1993'),
('طيران الإمارات', 'UAE', '/images/airlines/emirates.png', 'شركة طيران إماراتية تأسست عام 1985'),
('الخطوط الجوية التركية', 'THY', '/images/airlines/turkish.png', 'شركة طيران تركية تأسست عام 1933'),
('الخطوط الجوية البريطانية', 'BAW', '/images/airlines/british.png', 'شركة طيران بريطانية تأسست عام 1974'),
('الخطوط الجوية الأمريكية', 'AAL', '/images/airlines/american.png', 'شركة طيران أمريكية تأسست عام 1926');
```

### بيانات جدول Airports (المطارات)

```sql
INSERT INTO airports (airport_name, airport_code, city, country) VALUES
('مطار حمد الدولي', 'DOH', 'الدوحة', 'قطر'),
('مطار دبي الدولي', 'DXB', 'دبي', 'الإمارات العربية المتحدة'),
('مطار إسطنبول الدولي', 'IST', 'إسطنبول', 'تركيا'),
('مطار هيثرو', 'LHR', 'لندن', 'المملكة المتحدة'),
('مطار جون كينيدي الدولي', 'JFK', 'نيويورك', 'الولايات المتحدة الأمريكية'),
('مطار بغداد الدولي', 'BGW', 'بغداد', 'العراق'),
('مطار القاهرة الدولي', 'CAI', 'القاهرة', 'مصر'),
('مطار الملك عبد العزيز الدولي', 'JED', 'جدة', 'المملكة العربية السعودية');
```

### بيانات جدول Flight_Classes (درجات الرحلة)

```sql
INSERT INTO flight_classes (class_name, description) VALUES
('اقتصادية', 'درجة اقتصادية بأسعار معقولة'),
('اقتصادية ممتازة', 'درجة اقتصادية بمساحة أكبر للقدمين'),
('رجال الأعمال', 'درجة رجال الأعمال مع خدمات متميزة'),
('الدرجة الأولى', 'درجة أولى مع أقصى درجات الراحة والخدمة');
```

## مميزات هيكل قاعدة البيانات المحسن

1. **دعم شركات طيران متعددة**: يمكن إضافة أي عدد من شركات الطيران.
2. **أسعار مختلفة للرحلات**: يمكن تحديد أسعار مختلفة لنفس الرحلة بناءً على درجة الرحلة.
3. **إدارة المطارات**: يمكن إدارة معلومات المطارات بشكل منفصل.
4. **نظام حجز متكامل**: يدعم إنشاء حجوزات وتتبع حالتها.
5. **إدارة المستخدمين**: يدعم تسجيل المستخدمين وإدارة حساباتهم.
6. **نظام دفع**: يدعم تتبع المدفوعات وحالتها.
7. **تتبع المقاعد**: يمكن تتبع المقاعد المتاحة والمحجوزة.
8. **تقارير شاملة**: يمكن إنشاء تقارير شاملة عن الحجوزات والإيرادات.

## خطوات ترحيل البيانات من قاعدة البيانات القديمة

1. إنشاء الجداول الجديدة في قاعدة البيانات mustafakk.
2. إدخال البيانات الأساسية (شركات الطيران، المطارات، درجات الرحلة).
3. ترحيل بيانات الرحلات من جدول `gal` إلى الجداول الجديدة:
   - استخراج بيانات المدن وإدخالها في جدول `airports`.
   - إنشاء رحلات في جدول `flights` باستخدام البيانات المستخرجة.
   - إنشاء أسعار للرحلات في جدول `flight_prices`.
4. إنشاء حسابات المستخدمين وترحيل بيانات المسافرين.
5. إنشاء الحجوزات وتفاصيلها بناءً على البيانات المتاحة.

## الخلاصة

تم تصميم هيكل قاعدة بيانات محسن لنظام حجز تذاكر الطيران يتضمن إضافة شركات طيران متعددة وأسعار مختلفة للرحلات. يوفر هذا التصميم مرونة وقابلية للتوسع لتلبية متطلبات نظام حجز تذاكر الطيران المتكامل.
