"""
نظام حجز تذاكر الطيران - وحدات المساعدة للخادم الخلفي
وحدات مساعدة للتعامل مع العمليات المختلفة في النظام
"""

import datetime
import json
import re
import uuid
import hashlib
from flask import jsonify

class FlightHelper:
    """فئة مساعدة للتعامل مع عمليات الرحلات"""
    
    @staticmethod
    def calculate_flight_price(base_price, tax_percentage, discount_percentage, passengers=1, medical_discount=False):
        """حساب السعر النهائي للرحلة"""
        base_price = float(base_price)
        tax_percentage = float(tax_percentage)
        discount_percentage = float(discount_percentage)
        
        tax_amount = base_price * (tax_percentage / 100)
        discount_amount = base_price * (discount_percentage / 100)
        
        # تطبيق الخصم الطبي إذا كان متاحاً
        if medical_discount:
            discount_amount += base_price * 0.1  # خصم 10% للحالات الطبية
        
        final_price = base_price + tax_amount - discount_amount
        
        # ضرب السعر في عدد المسافرين
        total_price = final_price * int(passengers)
        
        return {
            'base_price': base_price,
            'tax_amount': tax_amount,
            'discount_amount': discount_amount,
            'price_per_passenger': final_price,
            'total_price': total_price
        }
    
    @staticmethod
    def get_day_of_week(date_str):
        """الحصول على يوم الأسبوع من تاريخ معين"""
        try:
            date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d')
            return date_obj.weekday()
        except ValueError:
            return None
    
    @staticmethod
    def format_flight_time(time_str):
        """تنسيق وقت الرحلة"""
        try:
            time_obj = datetime.datetime.strptime(time_str, '%H:%M')
            return time_obj.strftime('%I:%M %p')
        except ValueError:
            return time_str
    
    @staticmethod
    def calculate_flight_duration(departure_time, arrival_time):
        """حساب مدة الرحلة"""
        try:
            departure = datetime.datetime.strptime(departure_time, '%H:%M')
            arrival = datetime.datetime.strptime(arrival_time, '%H:%M')
            
            # التعامل مع الرحلات التي تمتد عبر منتصف الليل
            if arrival < departure:
                arrival += datetime.timedelta(days=1)
            
            duration = arrival - departure
            hours, remainder = divmod(duration.seconds, 3600)
            minutes, _ = divmod(remainder, 60)
            
            return f"{hours}h {minutes}m"
        except ValueError:
            return "N/A"

class BookingHelper:
    """فئة مساعدة للتعامل مع عمليات الحجز"""
    
    @staticmethod
    def generate_booking_reference():
        """إنشاء رقم مرجعي للحجز"""
        return str(uuid.uuid4())[:8].upper()
    
    @staticmethod
    def validate_passenger_info(data):
        """التحقق من صحة معلومات المسافر"""
        errors = {}
        
        # التحقق من الاسم
        if not data.get('passenger_name') or len(data.get('passenger_name', '')) < 3:
            errors['passenger_name'] = "يجب أن يكون اسم المسافر أكثر من 3 أحرف"
        
        # التحقق من البريد الإلكتروني
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not data.get('passenger_email') or not re.match(email_regex, data.get('passenger_email', '')):
            errors['passenger_email'] = "يرجى إدخال بريد إلكتروني صحيح"
        
        # التحقق من رقم الهاتف
        phone_regex = r'^\+?[0-9]{8,15}$'
        if not data.get('passenger_phone') or not re.match(phone_regex, data.get('passenger_phone', '')):
            errors['passenger_phone'] = "يرجى إدخال رقم هاتف صحيح"
        
        # التحقق من تاريخ الرحلة
        try:
            flight_date = datetime.datetime.strptime(data.get('flight_date', ''), '%Y-%m-%d')
            today = datetime.datetime.now().date()
            if flight_date.date() < today:
                errors['flight_date'] = "لا يمكن حجز رحلة في تاريخ سابق"
        except ValueError:
            errors['flight_date'] = "يرجى إدخال تاريخ صحيح"
        
        # التحقق من عدد الحقائب
        try:
            bags_count = int(data.get('bags_count', 0))
            if bags_count < 0 or bags_count > 10:
                errors['bags_count'] = "عدد الحقائب يجب أن يكون بين 0 و 10"
        except ValueError:
            errors['bags_count'] = "يرجى إدخال عدد صحيح للحقائب"
        
        return errors
    
    @staticmethod
    def format_booking_date(date_str):
        """تنسيق تاريخ الحجز"""
        try:
            date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
            return date_obj.strftime('%d %b %Y, %I:%M %p')
        except ValueError:
            return date_str

class UserHelper:
    """فئة مساعدة للتعامل مع عمليات المستخدمين"""
    
    @staticmethod
    def validate_user_data(data, is_registration=True):
        """التحقق من صحة بيانات المستخدم"""
        errors = {}
        
        # التحقق من اسم المستخدم
        if is_registration:
            if not data.get('username') or len(data.get('username', '')) < 4:
                errors['username'] = "يجب أن يكون اسم المستخدم أكثر من 4 أحرف"
        
        # التحقق من كلمة المرور
        if is_registration:
            if not data.get('password') or len(data.get('password', '')) < 6:
                errors['password'] = "يجب أن تكون كلمة المرور أكثر من 6 أحرف"
        
        # التحقق من البريد الإلكتروني
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if is_registration and (not data.get('email') or not re.match(email_regex, data.get('email', ''))):
            errors['email'] = "يرجى إدخال بريد إلكتروني صحيح"
        
        # التحقق من الاسم الأول واسم العائلة
        if is_registration:
            if not data.get('first_name') or len(data.get('first_name', '')) < 2:
                errors['first_name'] = "يرجى إدخال الاسم الأول"
            
            if not data.get('last_name') or len(data.get('last_name', '')) < 2:
                errors['last_name'] = "يرجى إدخال اسم العائلة"
        
        # التحقق من رقم الهاتف
        phone_regex = r'^\+?[0-9]{8,15}$'
        if is_registration and (not data.get('phone') or not re.match(phone_regex, data.get('phone', ''))):
            errors['phone'] = "يرجى إدخال رقم هاتف صحيح"
        
        return errors
    
    @staticmethod
    def mask_sensitive_data(data):
        """إخفاء البيانات الحساسة"""
        masked_data = data.copy()
        
        # إخفاء رقم جواز السفر
        if 'passport_number' in masked_data and masked_data['passport_number']:
            passport_length = len(masked_data['passport_number'])
            masked_data['passport_number'] = '*' * (passport_length - 4) + masked_data['passport_number'][-4:]
        
        # إخفاء رقم الهاتف
        if 'phone' in masked_data and masked_data['phone']:
            phone_length = len(masked_data['phone'])
            masked_data['phone'] = '*' * (phone_length - 4) + masked_data['phone'][-4:]
        
        return masked_data

class PaymentHelper:
    """فئة مساعدة للتعامل مع عمليات الدفع"""
    
    @staticmethod
    def validate_payment_data(data):
        """التحقق من صحة بيانات الدفع"""
        errors = {}
        
        # التحقق من رقم البطاقة
        card_regex = r'^[0-9]{13,19}$'
        if not data.get('card_number') or not re.match(card_regex, data.get('card_number', '')):
            errors['card_number'] = "يرجى إدخال رقم بطاقة صحيح"
        
        # التحقق من اسم حامل البطاقة
        if not data.get('card_holder') or len(data.get('card_holder', '')) < 3:
            errors['card_holder'] = "يرجى إدخال اسم حامل البطاقة"
        
        # التحقق من تاريخ انتهاء الصلاحية
        expiry_regex = r'^(0[1-9]|1[0-2])\/([0-9]{2})$'
        if not data.get('expiry_date') or not re.match(expiry_regex, data.get('expiry_date', '')):
            errors['expiry_date'] = "يرجى إدخال تاريخ انتهاء الصلاحية بتنسيق MM/YY"
        else:
            # التحقق من أن تاريخ انتهاء الصلاحية لم ينته بعد
            month, year = data.get('expiry_date').split('/')
            expiry_date = datetime.datetime(2000 + int(year), int(month), 1) + datetime.timedelta(days=32)
            expiry_date = expiry_date.replace(day=1) - datetime.timedelta(days=1)
            
            if expiry_date.date() < datetime.datetime.now().date():
                errors['expiry_date'] = "البطاقة منتهية الصلاحية"
        
        # التحقق من رمز الأمان
        cvv_regex = r'^[0-9]{3,4}$'
        if not data.get('cvv') or not re.match(cvv_regex, data.get('cvv', '')):
            errors['cvv'] = "يرجى إدخال رمز الأمان الصحيح"
        
        return errors
    
    @staticmethod
    def mask_card_number(card_number):
        """إخفاء رقم البطاقة"""
        if not card_number:
            return ""
        
        return '*' * (len(card_number) - 4) + card_number[-4:]
    
    @staticmethod
    def generate_transaction_id():
        """إنشاء معرف معاملة فريد"""
        return str(uuid.uuid4())

class ResponseHelper:
    """فئة مساعدة للتعامل مع الردود"""
    
    @staticmethod
    def success_response(data=None, message=None):
        """إنشاء رد نجاح"""
        response = {
            "success": True
        }
        
        if data is not None:
            response["data"] = data
        
        if message is not None:
            response["message"] = message
        
        return jsonify(response)
    
    @staticmethod
    def error_response(message, status_code=400, errors=None):
        """إنشاء رد خطأ"""
        response = {
            "success": False,
            "message": message
        }
        
        if errors is not None:
            response["errors"] = errors
        
        return jsonify(response), status_code
