-- مخطط قاعدة بيانات نظام حجز تذاكر الطيران
-- تم التصميم بناءً على قاعدة بيانات mustafakk مع إضافة تحسينات

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS flight_booking_system;
USE flight_booking_system;

-- جدول المدن
CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    airport_code VARCHAR(10),
    UNIQUE (name, country)
);

-- جدول شركات الطيران
CREATE TABLE airlines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    logo VARCHAR(255),
    description TEXT,
    rating DECIMAL(2,1),
    UNIQUE (code)
);

-- جدول فئات الحجز
CREATE TABLE travel_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    UNIQUE (name)
);

-- جدول جداول الرحلات
CREATE TABLE flight_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    airline_id INT NOT NULL,
    flight_number VARCHAR(20) NOT NULL,
    from_city_id INT NOT NULL,
    to_city_id INT NOT NULL,
    day_of_week INT NOT NULL, -- 0 = الأحد، 1 = الاثنين، ... 6 = السبت
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    aircraft_type VARCHAR(50),
    status ENUM('active', 'cancelled', 'delayed') DEFAULT 'active',
    FOREIGN KEY (airline_id) REFERENCES airlines(id),
    FOREIGN KEY (from_city_id) REFERENCES cities(id),
    FOREIGN KEY (to_city_id) REFERENCES cities(id),
    UNIQUE (airline_id, flight_number, day_of_week)
);

-- جدول أسعار الرحلات حسب شركة الطيران وفئة الحجز
CREATE TABLE flight_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    airline_id INT NOT NULL,
    from_city_id INT NOT NULL,
    to_city_id INT NOT NULL,
    travel_class_id INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    FOREIGN KEY (airline_id) REFERENCES airlines(id),
    FOREIGN KEY (from_city_id) REFERENCES cities(id),
    FOREIGN KEY (to_city_id) REFERENCES cities(id),
    FOREIGN KEY (travel_class_id) REFERENCES travel_classes(id),
    UNIQUE (airline_id, from_city_id, to_city_id, travel_class_id)
);

-- جدول المستخدمين
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    passport_number VARCHAR(50),
    passport_expiry DATE,
    nationality VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (username),
    UNIQUE (email)
);

-- جدول الحجوزات
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(10) NOT NULL,
    user_id INT,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_email VARCHAR(100),
    passenger_phone VARCHAR(20),
    flight_schedule_id INT NOT NULL,
    travel_class_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    flight_date DATE NOT NULL,
    seat_number VARCHAR(10),
    bags_count INT DEFAULT 0,
    medical_discount BOOLEAN DEFAULT FALSE,
    base_price DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    booking_status ENUM('confirmed', 'cancelled', 'checked_in') DEFAULT 'confirmed',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (flight_schedule_id) REFERENCES flight_schedules(id),
    FOREIGN KEY (travel_class_id) REFERENCES travel_classes(id),
    UNIQUE (booking_reference)
);

-- جدول الخدمات الإضافية
CREATE TABLE ancillary_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE (name)
);

-- جدول أسعار الخدمات الإضافية حسب شركة الطيران
CREATE TABLE airline_ancillary_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    airline_id INT NOT NULL,
    ancillary_service_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    FOREIGN KEY (airline_id) REFERENCES airlines(id),
    FOREIGN KEY (ancillary_service_id) REFERENCES ancillary_services(id),
    UNIQUE (airline_id, ancillary_service_id)
);

-- جدول الخدمات الإضافية المحجوزة
CREATE TABLE booking_ancillaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    ancillary_service_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (ancillary_service_id) REFERENCES ancillary_services(id),
    UNIQUE (booking_id, ancillary_service_id)
);

-- جدول المدفوعات
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- إدخال بيانات أولية

-- إدخال بيانات المدن
INSERT INTO cities (name, country, airport_code) VALUES
('بغداد', 'العراق', 'BGW'),
('لندن', 'المملكة المتحدة', 'LHR'),
('دبي', 'الإمارات العربية المتحدة', 'DXB'),
('القاهرة', 'مصر', 'CAI'),
('إسطنبول', 'تركيا', 'IST'),
('باريس', 'فرنسا', 'CDG'),
('روما', 'إيطاليا', 'FCO'),
('برلين', 'ألمانيا', 'BER'),
('مدريد', 'إسبانيا', 'MAD'),
('الدوحة', 'قطر', 'DOH'),
('أبوظبي', 'الإمارات العربية المتحدة', 'AUH'),
('عمّان', 'الأردن', 'AMM'),
('جدة', 'المملكة العربية السعودية', 'JED'),
('الرياض', 'المملكة العربية السعودية', 'RUH'),
('نيويورك', 'الولايات المتحدة', 'JFK'),
('طوكيو', 'اليابان', 'HND'),
('سيدني', 'أستراليا', 'SYD'),
('تورنتو', 'كندا', 'YYZ'),
('سنغافورة', 'سنغافورة', 'SIN'),
('هونغ كونغ', 'الصين', 'HKG');

-- إدخال بيانات شركات الطيران
INSERT INTO airlines (name, code, logo, description, rating) VALUES
('الخطوط الجوية العراقية', 'IA', 'iraqi_airways.png', 'شركة الطيران الوطنية للعراق', 3.5),
('طيران الإمارات', 'EK', 'emirates.png', 'شركة طيران إماراتية مقرها دبي', 4.8),
('الخطوط الجوية القطرية', 'QR', 'qatar_airways.png', 'شركة طيران قطرية مقرها الدوحة', 4.7),
('الخطوط الجوية التركية', 'TK', 'turkish_airlines.png', 'شركة طيران تركية مقرها إسطنبول', 4.5),
('الاتحاد للطيران', 'EY', 'etihad.png', 'شركة طيران إماراتية مقرها أبوظبي', 4.6),
('الخطوط الجوية الملكية الأردنية', 'RJ', 'royal_jordanian.png', 'شركة طيران أردنية مقرها عمّان', 4.0),
('الخطوط السعودية', 'SV', 'saudi_airlines.png', 'شركة الطيران الوطنية للمملكة العربية السعودية', 4.2),
('مصر للطيران', 'MS', 'egypt_air.png', 'شركة الطيران الوطنية لمصر', 3.8),
('الخطوط الجوية البريطانية', 'BA', 'british_airways.png', 'شركة الطيران الوطنية للمملكة المتحدة', 4.3),
('لوفتهانزا', 'LH', 'lufthansa.png', 'شركة طيران ألمانية مقرها فرانكفورت', 4.4),
('الخطوط الجوية الفرنسية', 'AF', 'air_france.png', 'شركة الطيران الوطنية لفرنسا', 4.2),
('طيران الشرق الأوسط', 'ME', 'middle_east_airlines.png', 'شركة الطيران الوطنية للبنان', 3.9),
('الخطوط الجوية الكويتية', 'KU', 'kuwait_airways.png', 'شركة الطيران الوطنية للكويت', 3.7),
('طيران الخليج', 'GF', 'gulf_air.png', 'شركة الطيران الوطنية للبحرين', 3.8),
('الخطوط الجوية العمانية', 'WY', 'oman_air.png', 'شركة الطيران الوطنية لسلطنة عمان', 4.0);

-- إدخال بيانات فئات الحجز
INSERT INTO travel_classes (name, description) VALUES
('الدرجة الاقتصادية', 'الدرجة الأساسية بأسعار معقولة'),
('درجة رجال الأعمال', 'درجة متميزة مع خدمات إضافية ومساحة أكبر'),
('الدرجة الأولى', 'أعلى درجة مع أقصى قدر من الراحة والخدمات الحصرية');

-- إدخال بيانات الخدمات الإضافية
INSERT INTO ancillary_services (name, description) VALUES
('أمتعة إضافية', 'حقيبة إضافية بوزن 23 كجم'),
('اختيار المقعد', 'اختيار مقعد محدد قبل السفر'),
('وجبة خاصة', 'طلب وجبة خاصة (نباتية، حلال، إلخ)'),
('خدمة الاستقبال والتوديع', 'مساعدة خاصة في المطار'),
('الدخول إلى صالة الانتظار', 'الوصول إلى صالة الانتظار الخاصة في المطار'),
('تأمين السفر', 'تغطية تأمينية للرحلة'),
('خدمة الإنترنت', 'اتصال بالإنترنت أثناء الرحلة'),
('ترقية الدرجة', 'ترقية إلى درجة أعلى');

-- إدخال بيانات أسعار الخدمات الإضافية حسب شركة الطيران
INSERT INTO airline_ancillary_prices (airline_id, ancillary_service_id, price) VALUES
(1, 1, 50), (1, 2, 15), (1, 3, 20), (1, 4, 30), (1, 5, 40), (1, 6, 25), (1, 7, 15), (1, 8, 100),
(2, 1, 70), (2, 2, 20), (2, 3, 25), (2, 4, 40), (2, 5, 60), (2, 6, 30), (2, 7, 20), (2, 8, 150),
(3, 1, 65), (3, 2, 18), (3, 3, 22), (3, 4, 35), (3, 5, 55), (3, 6, 28), (3, 7, 18), (3, 8, 140),
(4, 1, 60), (4, 2, 16), (4, 3, 20), (4, 4, 32), (4, 5, 50), (4, 6, 26), (4, 7, 16), (4, 8, 130),
(5, 1, 68), (5, 2, 19), (5, 3, 24), (5, 4, 38), (5, 5, 58), (5, 6, 29), (5, 7, 19), (5, 8, 145),
(6, 1, 55), (6, 2, 15), (6, 3, 18), (6, 4, 30), (6, 5, 45), (6, 6, 24), (6, 7, 15), (6, 8, 120),
(7, 1, 62), (7, 2, 17), (7, 3, 21), (7, 4, 33), (7, 5, 52), (7, 6, 27), (7, 7, 17), (7, 8, 135);

-- إدخال بيانات جداول الرحلات (أمثلة)
INSERT INTO flight_schedules (airline_id, flight_number, from_city_id, to_city_id, day_of_week, departure_time, arrival_time, aircraft_type) VALUES
-- الخطوط الجوية العراقية
(1, 'IA101', 1, 2, 0, '11:00', '14:00', 'Boeing 737'),
(1, 'IA102', 1, 2, 1, '12:00', '15:00', 'Boeing 737'),
(1, 'IA103', 1, 2, 2, '14:00', '17:00', 'Boeing 737'),
(1, 'IA104', 1, 2, 3, '13:00', '16:00', 'Boeing 737'),
(1, 'IA105', 1, 2, 5, '14:00', '17:00', 'Boeing 737'),
(1, 'IA106', 1, 2, 6, '14:00', '17:00', 'Boeing 737'),
(1, 'IA201', 1, 3, 0, '08:00', '10:00', 'Airbus A320'),
(1, 'IA202', 1, 3, 1, '10:00', '12:00', 'Airbus A320'),
(1, 'IA203', 1, 3, 2, '12:00', '14:00', 'Airbus A320'),
(1, 'IA204', 1, 3, 4, '10:00', '12:00', 'Airbus A320'),
(1, 'IA205', 1, 3, 5, '17:00', '19:00', 'Airbus A320'),
(1, 'IA206', 1, 3, 6, '13:00', '15:00', 'Airbus A320'),
-- طيران الإمارات
(2, 'EK301', 3, 1, 0, '09:00', '11:00', 'Boeing 777'),
(2, 'EK302', 3, 1, 2, '14:00', '16:00', 'Boeing 777'),
(2, 'EK303', 3, 1, 4, '19:00', '21:00', 'Boeing 777'),
(2, 'EK304', 3, 1, 6, '10:00', '12:00', 'Boeing 777'),
(2, 'EK401', 3, 4, 1, '08:00', '10:00', 'Airbus A380'),
(2, 'EK402', 3, 4, 3, '13:00', '15:00', 'Airbus A380'),
(2, 'EK403', 3, 4, 5, '18:00', '20:00', 'Airbus A380'),
-- الخطوط الجوية القطرية
(3, 'QR501', 10, 1, 0, '07:00', '09:30', 'Boeing 787'),
(3, 'QR502', 10, 1, 3, '15:00', '17:30', 'Boeing 787'),
(3, 'QR503', 10, 1, 6, '20:00', '22:30', 'Boeing 787'),
(3, 'QR601', 10, 5, 1, '06:00', '09:00', 'Airbus A350'),
(3, 'QR602', 10, 5, 4, '14:00', '17:00', 'Airbus A350'),
-- الخطوط الجوية التركية
(4, 'TK701', 5, 1, 0, '06:30', '09:30', 'Boeing 737'),
(4, 'TK702', 5, 1, 2, '12:30', '15:30', 'Boeing 737'),
(4, 'TK703', 5, 1, 4, '18:30', '21:30', 'Boeing 737'),
(4, 'TK704', 5, 1, 6, '08:30', '11:30', 'Boeing 737'),
-- الاتحاد للطيران
(5, 'EY801', 11, 1, 1, '07:30', '09:45', 'Boeing 787'),
(5, 'EY802', 11, 1, 4, '16:30', '18:45', 'Boeing 787'),
(5, 'EY901', 11, 3, 0, '08:00', '09:00', 'Airbus A320'),
(5, 'EY902', 11, 3, 3, '17:00', '18:00', 'Airbus A320'),
(5, 'EY903', 11, 3, 6, '12:00', '13:00', 'Airbus A320');

-- إدخال بيانات أسعار الرحلات حسب شركة الطيران وفئة الحجز
-- من بغداد إلى لندن
INSERT INTO flight_prices (airline_id, from_city_id, to_city_id, travel_class_id, base_price, tax_percentage, discount_percentage) VALUES
(1, 1, 2, 1, 500, 10, 0),    -- الخطوط الجوية العراقية - اقتصادي
(1, 1, 2, 2, 1200, 10, 0),   -- الخطوط الجوية العراقية - رجال أعمال
(1, 1, 2, 3, 2000, 10, 0),   -- الخطوط الجوية العراقية - درجة أولى
(2, 1, 2, 1, 650, 12, 5),    -- طيران الإمارات - اقتصادي
(2, 1, 2, 2, 1500, 12, 5),   -- طيران الإمارات - رجال أعمال
(2, 1, 2, 3, 2500, 12, 5),   -- طيران الإمارات - درجة أولى
(3, 1, 2, 1, 600, 11, 3),    -- الخطوط الجوية القطرية - اقتصادي
(3, 1, 2, 2, 1400, 11, 3),   -- الخطوط الجوية القطرية - رجال أعمال
(3, 1, 2, 3, 2300, 11, 3),   -- الخطوط الجوية القطرية - درجة أولى
(4, 1, 2, 1, 550, 10, 2),    -- الخطوط الجوية التركية - اقتصادي
(4, 1, 2, 2, 1300, 10, 2),   -- الخطوط الجوية التركية - رجال أعمال
(4, 1, 2, 3, 2200, 10, 2);   -- الخطوط الجوية التركية - درجة أولى

-- من بغداد إلى دبي
INSERT INTO flight_prices (airline_id, from_city_id, to_city_id, travel_class_id, base_price, tax_percentage, discount_percentage) VALUES
(1, 1, 3, 1, 300, 10, 0),    -- الخطوط الجوية العراقية - اقتصادي
(1, 1, 3, 2, 700, 10, 0),    -- الخطوط الجوية العراقية - رجال أعمال
(1, 1, 3, 3, 1200, 10, 0),   -- الخطوط الجوية العراقية - درجة أولى
(2, 1, 3, 1, 350, 12, 5),    -- طيران الإمارات - اقتصادي
(2, 1, 3, 2, 800, 12, 5),    -- طيران الإمارات - رجال أعمال
(2, 1, 3, 3, 1400, 12, 5),   -- طيران الإمارات - درجة أولى
(3, 1, 3, 1, 330, 11, 3),    -- الخطوط الجوية القطرية - اقتصادي
(3, 1, 3, 2, 750, 11, 3),    -- الخطوط الجوية القطرية - رجال أعمال
(3, 1, 3, 3, 1300, 11, 3),   -- الخطوط الجوية القطرية - درجة أولى
(5, 1, 3, 1, 340, 11, 4),    -- الاتحاد للطيران - اقتصادي
(5, 1, 3, 2, 780, 11, 4),    -- الاتحاد للطيران - رجال أعمال
(5, 1, 3, 3, 1350, 11, 4);   -- الاتحاد للطيران - درجة أولى

-- من دبي إلى بغداد
INSERT INTO flight_prices (airline_id, from_city_id, to_city_id, travel_class_id, base_price, tax_percentage, discount_percentage) VALUES
(1, 3, 1, 1, 320, 10, 0),    -- الخطوط الجوية العراقية - اقتصادي
(1, 3, 1, 2, 720, 10, 0),    -- الخطوط الجوية العراقية - رجال أعمال
(1, 3, 1, 3, 1250, 10, 0),   -- الخطوط الجوية العراقية - درجة أولى
(2, 3, 1, 1, 370, 12, 5),    -- طيران الإمارات - اقتصادي
(2, 3, 1, 2, 820, 12, 5),    -- طيران الإمارات - رجال أعمال
(2, 3, 1, 3, 1450, 12, 5),   -- طيران الإمارات - درجة أولى
(5, 3, 1, 1, 360, 11, 4),    -- الاتحاد للطيران - اقتصادي
(5, 3, 1, 2, 800, 11, 4),    -- الاتحاد للطيران - رجال أعمال
(5, 3, 1, 3, 1400, 11, 4);   -- الاتحاد للطيران - درجة أولى

-- من الدوحة إلى بغداد
INSERT INTO flight_prices (airline_id, from_city_id, to_city_id, travel_class_id, base_price, tax_percentage, discount_percentage) VALUES
(3, 10, 1, 1, 340, 11, 3),    -- الخطوط الجوية القطرية - اقتصادي
(3, 10, 1, 2, 760, 11, 3),    -- الخطوط الجوية القطرية - رجال أعمال
(3, 10, 1, 3, 1320, 11, 3);   -- الخطوط الجوية القطرية - درجة أولى

-- من إسطنبول إلى بغداد
INSERT INTO flight_prices (airline_id, from_city_id, to_city_id, travel_class_id, base_price, tax_percentage, discount_percentage) VALUES
(4, 5, 1, 1, 310, 10, 2),    -- الخطوط الجوية التركية - اقتصادي
(4, 5, 1, 2, 730, 10, 2),    -- الخطوط الجوية التركية - رجال أعمال
(4, 5, 1, 3, 1280, 10, 2);   -- الخطوط الجوية التركية - درجة أولى

-- من أبوظبي إلى بغداد
INSERT INTO flight_prices (airline_id, from_city_id, to_city_id, travel_class_id, base_price, tax_percentage, discount_percentage) VALUES
(5, 11, 1, 1, 330, 11, 4),    -- الاتحاد للطيران - اقتصادي
(5, 11, 1, 2, 750, 11, 4),    -- الاتحاد للطيران - رجال أعمال
(5, 11, 1, 3, 1300, 11, 4);   -- الاتحاد للطيران - درجة أولى
