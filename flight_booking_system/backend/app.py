"""
نظام حجز تذاكر الطيران - الخادم الخلفي
تطبيق Flask للتعامل مع طلبات واجهة المستخدم وربطها بقاعدة البيانات
"""

from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
import pymysql
import os
import json
import datetime
import uuid
import hashlib
import re
from werkzeug.security import generate_password_hash, check_password_hash

# إنشاء تطبيق Flask
app = Flask(__name__, 
            static_folder='../frontend',
            template_folder='../frontend')

# تكوين السر للجلسات
app.secret_key = 'sky_booking_secret_key'

# تمكين CORS للسماح بالطلبات من الواجهة الأمامية
CORS(app)

# تكوين الاتصال بقاعدة البيانات MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'qwe123iop789'
app.config['MYSQL_DB'] = 'mustafakk'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

# إنشاء كائن اتصال بقاعدة البيانات
def get_db_connection():
    return pymysql.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB'],
        cursorclass=pymysql.cursors.DictCursor
    )

# دالة مساعدة لتنفيذ استعلامات قاعدة البيانات
def execute_query(query, params=None, fetch_all=False, commit=False):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if commit:
            connection.commit()
            return cursor.lastrowid
        
        if fetch_all:
            return cursor.fetchall()
        else:
            return cursor.fetchone()
    except Exception as e:
        print(f"Database error: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

# الصفحة الرئيسية
@app.route('/')
def index():
    return render_template('index.html')

# ===== واجهات برمجة التطبيقات للمدن =====

@app.route('/api/cities', methods=['GET'])
def get_cities():
    """الحصول على قائمة المدن"""
    cities = execute_query("SELECT * FROM cities", fetch_all=True)
    return jsonify(cities)

@app.route('/api/cities/<int:city_id>', methods=['GET'])
def get_city(city_id):
    """الحصول على معلومات مدينة محددة"""
    city = execute_query("SELECT * FROM cities WHERE id = %s", (city_id,))
    if city:
        return jsonify(city)
    return jsonify({"error": "City not found"}), 404

# ===== واجهات برمجة التطبيقات لشركات الطيران =====

@app.route('/api/airlines', methods=['GET'])
def get_airlines():
    """الحصول على قائمة شركات الطيران"""
    airlines = execute_query("SELECT * FROM airlines", fetch_all=True)
    return jsonify(airlines)

@app.route('/api/airlines/<int:airline_id>', methods=['GET'])
def get_airline(airline_id):
    """الحصول على معلومات شركة طيران محددة"""
    airline = execute_query("SELECT * FROM airlines WHERE id = %s", (airline_id,))
    if airline:
        return jsonify(airline)
    return jsonify({"error": "Airline not found"}), 404

# ===== واجهات برمجة التطبيقات لفئات الحجز =====

@app.route('/api/travel_classes', methods=['GET'])
def get_travel_classes():
    """الحصول على قائمة فئات الحجز"""
    travel_classes = execute_query("SELECT * FROM travel_classes", fetch_all=True)
    return jsonify(travel_classes)

# ===== واجهات برمجة التطبيقات للبحث عن الرحلات =====

@app.route('/api/flights/search', methods=['POST'])
def search_flights():
    """البحث عن الرحلات المتاحة"""
    data = request.json
    
    # استخراج معايير البحث
    from_city_id = data.get('from_city_id')
    to_city_id = data.get('to_city_id')
    departure_date = data.get('departure_date')
    return_date = data.get('return_date')
    passengers = data.get('passengers', 1)
    travel_class_id = data.get('travel_class_id', 1)  # الدرجة الاقتصادية افتراضياً
    
    # التحقق من البيانات المطلوبة
    if not all([from_city_id, to_city_id, departure_date]):
        return jsonify({"error": "Missing required parameters"}), 400
    
    # استخراج يوم الأسبوع من تاريخ المغادرة
    departure_day = datetime.datetime.strptime(departure_date, '%Y-%m-%d').weekday()
    
    # البحث عن الرحلات المتاحة
    query = """
    SELECT fs.*, a.name as airline_name, a.logo as airline_logo, 
           fc.name as from_city_name, tc.name as to_city_name,
           fp.base_price, fp.tax_percentage, fp.discount_percentage,
           tc1.name as travel_class_name
    FROM flight_schedules fs
    JOIN airlines a ON fs.airline_id = a.id
    JOIN cities fc ON fs.from_city_id = fc.id
    JOIN cities tc ON fs.to_city_id = tc.id
    JOIN flight_prices fp ON fs.airline_id = fp.airline_id 
                         AND fs.from_city_id = fp.from_city_id 
                         AND fs.to_city_id = fp.to_city_id
    JOIN travel_classes tc1 ON fp.travel_class_id = tc1.id
    WHERE fs.from_city_id = %s
    AND fs.to_city_id = %s
    AND fs.day_of_week = %s
    AND fp.travel_class_id = %s
    """
    
    flights = execute_query(query, (from_city_id, to_city_id, departure_day, travel_class_id), fetch_all=True)
    
    # حساب السعر النهائي لكل رحلة
    for flight in flights:
        base_price = float(flight['base_price'])
        tax_percentage = float(flight['tax_percentage'])
        discount_percentage = float(flight['discount_percentage'])
        
        tax_amount = base_price * (tax_percentage / 100)
        discount_amount = base_price * (discount_percentage / 100)
        final_price = base_price + tax_amount - discount_amount
        
        # ضرب السعر في عدد المسافرين
        flight['price_per_passenger'] = final_price
        flight['total_price'] = final_price * int(passengers)
    
    # البحث عن رحلات العودة إذا كان مطلوباً
    return_flights = []
    if return_date:
        return_day = datetime.datetime.strptime(return_date, '%Y-%m-%d').weekday()
        return_flights = execute_query(query, (to_city_id, from_city_id, return_day, travel_class_id), fetch_all=True)
        
        # حساب السعر النهائي لكل رحلة عودة
        for flight in return_flights:
            base_price = float(flight['base_price'])
            tax_percentage = float(flight['tax_percentage'])
            discount_percentage = float(flight['discount_percentage'])
            
            tax_amount = base_price * (tax_percentage / 100)
            discount_amount = base_price * (discount_percentage / 100)
            final_price = base_price + tax_amount - discount_amount
            
            # ضرب السعر في عدد المسافرين
            flight['price_per_passenger'] = final_price
            flight['total_price'] = final_price * int(passengers)
    
    return jsonify({
        "outbound_flights": flights,
        "return_flights": return_flights
    })

# ===== واجهات برمجة التطبيقات لتفاصيل الرحلة =====

@app.route('/api/flights/<int:flight_id>', methods=['GET'])
def get_flight_details(flight_id):
    """الحصول على تفاصيل رحلة محددة"""
    query = """
    SELECT fs.*, a.name as airline_name, a.logo as airline_logo, 
           fc.name as from_city_name, fc.airport_code as from_airport_code,
           tc.name as to_city_name, tc.airport_code as to_airport_code
    FROM flight_schedules fs
    JOIN airlines a ON fs.airline_id = a.id
    JOIN cities fc ON fs.from_city_id = fc.id
    JOIN cities tc ON fs.to_city_id = tc.id
    WHERE fs.id = %s
    """
    
    flight = execute_query(query, (flight_id,))
    
    if not flight:
        return jsonify({"error": "Flight not found"}), 404
    
    # الحصول على أسعار الرحلة لجميع فئات الحجز
    prices_query = """
    SELECT fp.*, tc.name as travel_class_name
    FROM flight_prices fp
    JOIN travel_classes tc ON fp.travel_class_id = tc.id
    WHERE fp.airline_id = %s
    AND fp.from_city_id = %s
    AND fp.to_city_id = %s
    """
    
    prices = execute_query(prices_query, 
                          (flight['airline_id'], flight['from_city_id'], flight['to_city_id']),
                          fetch_all=True)
    
    # حساب السعر النهائي لكل فئة حجز
    for price in prices:
        base_price = float(price['base_price'])
        tax_percentage = float(price['tax_percentage'])
        discount_percentage = float(price['discount_percentage'])
        
        tax_amount = base_price * (tax_percentage / 100)
        discount_amount = base_price * (discount_percentage / 100)
        final_price = base_price + tax_amount - discount_amount
        
        price['tax_amount'] = tax_amount
        price['discount_amount'] = discount_amount
        price['final_price'] = final_price
    
    flight['prices'] = prices
    
    return jsonify(flight)

# ===== واجهات برمجة التطبيقات للخدمات الإضافية =====

@app.route('/api/ancillary_services', methods=['GET'])
def get_ancillary_services():
    """الحصول على قائمة الخدمات الإضافية"""
    services = execute_query("SELECT * FROM ancillary_services", fetch_all=True)
    return jsonify(services)

@app.route('/api/airlines/<int:airline_id>/ancillary_services', methods=['GET'])
def get_airline_ancillary_services(airline_id):
    """الحصول على الخدمات الإضافية لشركة طيران محددة مع الأسعار"""
    query = """
    SELECT aap.*, as1.name, as1.description
    FROM airline_ancillary_prices aap
    JOIN ancillary_services as1 ON aap.ancillary_service_id = as1.id
    WHERE aap.airline_id = %s
    """
    
    services = execute_query(query, (airline_id,), fetch_all=True)
    return jsonify(services)

# ===== واجهات برمجة التطبيقات للمستخدمين =====

@app.route('/api/users/register', methods=['POST'])
def register_user():
    """تسجيل مستخدم جديد"""
    data = request.json
    
    # التحقق من البيانات المطلوبة
    required_fields = ['username', 'password', 'email', 'first_name', 'last_name', 'phone']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # التحقق من عدم وجود مستخدم بنفس اسم المستخدم أو البريد الإلكتروني
    existing_user = execute_query(
        "SELECT * FROM users WHERE username = %s OR email = %s",
        (data['username'], data['email'])
    )
    
    if existing_user:
        return jsonify({"error": "Username or email already exists"}), 400
    
    # تشفير كلمة المرور
    hashed_password = generate_password_hash(data['password'])
    
    # إنشاء المستخدم الجديد
    query = """
    INSERT INTO users (username, password, email, first_name, last_name, phone, address, 
                      date_of_birth, passport_number, passport_expiry, nationality, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
    """
    
    user_id = execute_query(query, (
        data['username'],
        hashed_password,
        data['email'],
        data['first_name'],
        data['last_name'],
        data['phone'],
        data.get('address', ''),
        data.get('date_of_birth', None),
        data.get('passport_number', ''),
        data.get('passport_expiry', None),
        data.get('nationality', ''),
    ), commit=True)
    
    if user_id:
        return jsonify({"success": True, "user_id": user_id})
    
    return jsonify({"error": "Failed to register user"}), 500

@app.route('/api/users/login', methods=['POST'])
def login_user():
    """تسجيل دخول المستخدم"""
    data = request.json
    
    # التحقق من البيانات المطلوبة
    if not all([data.get('username'), data.get('password')]):
        return jsonify({"error": "Username and password are required"}), 400
    
    # البحث عن المستخدم
    user = execute_query(
        "SELECT * FROM users WHERE username = %s",
        (data['username'],)
    )
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({"error": "Invalid username or password"}), 401
    
    # إنشاء جلسة للمستخدم
    session['user_id'] = user['id']
    session['username'] = user['username']
    
    # إزالة كلمة المرور من البيانات المرسلة
    user.pop('password', None)
    
    return jsonify({"success": True, "user": user})

@app.route('/api/users/logout', methods=['POST'])
def logout_user():
    """تسجيل خروج المستخدم"""
    session.clear()
    return jsonify({"success": True})

@app.route('/api/users/profile', methods=['GET'])
def get_user_profile():
    """الحصول على الملف الشخصي للمستخدم الحالي"""
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    user = execute_query(
        "SELECT * FROM users WHERE id = %s",
        (session['user_id'],)
    )
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # إزالة كلمة المرور من البيانات المرسلة
    user.pop('password', None)
    
    return jsonify(user)

@app.route('/api/users/profile', methods=['PUT'])
def update_user_profile():
    """تحديث الملف الشخصي للمستخدم الحالي"""
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    data = request.json
    
    # تحديث بيانات المستخدم
    query = """
    UPDATE users SET
        email = %s,
        first_name = %s,
        last_name = %s,
        phone = %s,
        address = %s,
        date_of_birth = %s,
        passport_number = %s,
        passport_expiry = %s,
        nationality = %s,
        updated_at = NOW()
    WHERE id = %s
    """
    
    execute_query(query, (
        data.get('email'),
        data.get('first_name'),
        data.get('last_name'),
        data.get('phone'),
        data.get('address', ''),
        data.get('date_of_birth', None),
        data.get('passport_number', ''),
        data.get('passport_expiry', None),
        data.get('nationality', ''),
        session['user_id']
    ), commit=True)
    
    return jsonify({"success": True})

# ===== واجهات برمجة التطبيقات للحجوزات =====

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    """إنشاء حجز جديد"""
    data = request.json
    
    # التحقق من البيانات المطلوبة
    required_fields = ['passenger_name', 'passenger_email', 'passenger_phone', 
                       'flight_schedule_id', 'travel_class_id', 'flight_date', 'bags_count']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # إنشاء رقم مرجعي للحجز
    booking_reference = str(uuid.uuid4())[:8].upper()
    
    # الحصول على معلومات الرحلة وسعرها
    flight_query = """
    SELECT fs.*, fp.base_price, fp.tax_percentage, fp.discount_percentage
    FROM flight_schedules fs
    JOIN flight_prices fp ON fs.airline_id = fp.airline_id 
                         AND fs.from_city_id = fp.from_city_id 
                         AND fs.to_city_id = fp.to_city_id
    WHERE fs.id = %s AND fp.travel_class_id = %s
    """
    
    flight = execute_query(flight_query, (data['flight_schedule_id'], data['travel_class_id']))
    
    if not flight:
        return jsonify({"error": "Flight not found"}), 404
    
    # حساب السعر النهائي
    base_price = float(flight['base_price'])
    tax_percentage = float(flight['tax_percentage'])
    discount_percentage = float(flight['discount_percentage'])
    
    tax_amount = base_price * (tax_percentage / 100)
    discount_amount = base_price * (discount_percentage / 100)
    
    # تطبيق الخصم الطبي إذا كان متاحاً
    medical_discount = 1 if data.get('medical_discount', False) else 0
    if medical_discount:
        discount_amount += base_price * 0.1  # خصم 10% للحالات الطبية
    
    final_price = base_price + tax_amount - discount_amount
    
    # إنشاء الحجز
    booking_query = """
    INSERT INTO bookings (
        booking_reference, user_id, passenger_name, passenger_email, passenger_phone,
        flight_schedule_id, travel_class_id, booking_date, flight_date, seat_number,
        bags_count, medical_discount, base_price, tax_amount, discount_amount,
        final_price, payment_status, booking_status
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    booking_id = execute_query(booking_query, (
        booking_reference,
        session.get('user_id'),  # يمكن أن يكون None للمستخدمين غير المسجلين
        data['passenger_name'],
        data['passenger_email'],
        data['passenger_phone'],
        data['flight_schedule_id'],
        data['travel_class_id'],
        data['flight_date'],
        data.get('seat_number', ''),
        data['bags_count'],
        medical_discount,
        base_price,
        tax_amount,
        discount_amount,
        final_price,
        'pending',  # حالة الدفع
        'confirmed'  # حالة الحجز
    ), commit=True)
    
    if not booking_id:
        return jsonify({"error": "Failed to create booking"}), 500
    
    # إضافة الخدمات الإضافية إذا كانت موجودة
    if 'ancillary_services' in data and data['ancillary_services']:
        for service in data['ancillary_services']:
            # الحصول على سعر الخدمة
            price_query = """
            SELECT price FROM airline_ancillary_prices
            WHERE airline_id = %s AND ancillary_service_id = %s
            """
            
            price_data = execute_query(price_query, (flight['airline_id'], service['id']))
            
            if price_data:
                service_price = float(price_data['price'])
                
                # إضافة الخدمة الإضافية للحجز
                service_query = """
                INSERT INTO booking_ancillaries (booking_id, ancillary_service_id, price)
                VALUES (%s, %s, %s)
                """
                
                execute_query(service_query, (booking_id, service['id'], service_price), commit=True)
    
    # الحصول على تفاصيل الحجز الكاملة
    booking = get_booking_details(booking_id)
    
    return jsonify({
        "success": True,
        "booking": booking
    })

@app.route('/api/bookings/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    """الحصول على تفاصيل حجز محدد"""
    booking = get_booking_details(booking_id)
    
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    
    # التحقق من أن المستخدم الحالي هو صاحب الحجز
    if 'user_id' in session and booking.get('user_id') and session['user_id'] != booking['user_id']:
        return jsonify({"error": "Unauthorized"}), 403
    
    return jsonify(booking)

@app.route('/api/bookings/reference/<string:booking_reference>', methods=['GET'])
def get_booking_by_reference(booking_reference):
    """الحصول على تفاصيل حجز بواسطة الرقم المرجعي"""
    booking_id_data = execute_query(
        "SELECT id FROM bookings WHERE booking_reference = %s",
        (booking_reference,)
    )
    
    if not booking_id_data:
        return jsonify({"error": "Booking not found"}), 404
    
    booking = get_booking_details(booking_id_data['id'])
    
    return jsonify(booking)

def get_booking_details(booking_id):
    """الحصول على تفاصيل حجز كاملة"""
    query = """
    SELECT b.*, fs.airline_id, fs.from_city_id, fs.to_city_id, fs.departure_time, fs.arrival_time,
           a.name as airline_name, a.logo as airline_logo,
           fc.name as from_city_name, fc.airport_code as from_airport_code,
           tc.name as to_city_name, tc.airport_code as to_airport_code,
           tc1.name as travel_class_name
    FROM bookings b
    JOIN flight_schedules fs ON b.flight_schedule_id = fs.id
    JOIN airlines a ON fs.airline_id = a.id
    JOIN cities fc ON fs.from_city_id = fc.id
    JOIN cities tc ON fs.to_city_id = tc.id
    JOIN travel_classes tc1 ON b.travel_class_id = tc1.id
    WHERE b.id = %s
    """
    
    booking = execute_query(query, (booking_id,))
    
    if not booking:
        return None
    
    # الحصول على الخدمات الإضافية للحجز
    services_query = """
    SELECT ba.*, as1.name, as1.description
    FROM booking_ancillaries ba
    JOIN ancillary_services as1 ON ba.ancillary_service_id = as1.id
    WHERE ba.booking_id = %s
    """
    
    services = execute_query(services_query, (booking_id,), fetch_all=True)
    booking['ancillary_services'] = services
    
    return booking

@app.route('/api/users/bookings', methods=['GET'])
def get_user_bookings():
    """الحصول على حجوزات المستخدم الحالي"""
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    query = """
    SELECT b.id, b.booking_reference, b.flight_date, b.booking_date, b.final_price,
           b.payment_status, b.booking_status,
           fs.departure_time, fs.arrival_time,
           a.name as airline_name,
           fc.name as from_city_name, fc.airport_code as from_airport_code,
           tc.name as to_city_name, tc.airport_code as to_airport_code,
           tc1.name as travel_class_name
    FROM bookings b
    JOIN flight_schedules fs ON b.flight_schedule_id = fs.id
    JOIN airlines a ON fs.airline_id = a.id
    JOIN cities fc ON fs.from_city_id = fc.id
    JOIN cities tc ON fs.to_city_id = tc.id
    JOIN travel_classes tc1 ON b.travel_class_id = tc1.id
    WHERE b.user_id = %s
    ORDER BY b.flight_date DESC
    """
    
    bookings = execute_query(query, (session['user_id'],), fetch_all=True)
    
    return jsonify(bookings)

# ===== واجهات برمجة التطبيقات للمدفوعات =====

@app.route('/api/payments', methods=['POST'])
def process_payment():
    """معالجة عملية دفع جديدة"""
    data = request.json
    
    # التحقق من البيانات المطلوبة
    required_fields = ['booking_id', 'amount', 'payment_method', 'card_number', 'card_holder', 'expiry_date', 'cvv']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # التحقق من وجود الحجز
    booking = execute_query(
        "SELECT * FROM bookings WHERE id = %s",
        (data['booking_id'],)
    )
    
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    
    # في بيئة حقيقية، هنا سيتم الاتصال ببوابة الدفع ومعالجة عملية الدفع
    # لأغراض هذا المثال، سنفترض أن عملية الدفع ناجحة دائماً
    
    # إنشاء معرف معاملة فريد
    transaction_id = str(uuid.uuid4())
    
    # تسجيل عملية الدفع
    payment_query = """
    INSERT INTO payments (booking_id, amount, payment_method, transaction_id, payment_date, status)
    VALUES (%s, %s, %s, %s, NOW(), %s)
    """
    
    payment_id = execute_query(payment_query, (
        data['booking_id'],
        data['amount'],
        data['payment_method'],
        transaction_id,
        'completed'
    ), commit=True)
    
    if not payment_id:
        return jsonify({"error": "Failed to process payment"}), 500
    
    # تحديث حالة الدفع في الحجز
    execute_query(
        "UPDATE bookings SET payment_status = 'paid' WHERE id = %s",
        (data['booking_id'],),
        commit=True
    )
    
    return jsonify({
        "success": True,
        "payment_id": payment_id,
        "transaction_id": transaction_id,
        "status": "completed"
    })

# ===== تشغيل التطبيق =====

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
