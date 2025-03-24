"""
نظام حجز تذاكر الطيران - ملف التشغيل الرئيسي
ملف لتشغيل الخادم الخلفي
"""

import os
from app import app
from config import config

if __name__ == '__main__':
    # تحديد بيئة التشغيل من متغيرات البيئة أو استخدام بيئة التطوير افتراضياً
    env = os.environ.get('FLASK_ENV', 'development')
    
    # تطبيق التكوين المناسب
    app.config.from_object(config[env])
    
    # إنشاء مجلد السجلات إذا لم يكن موجوداً
    if not os.path.exists('logs'):
        os.mkdir('logs')
    
    # تشغيل التطبيق
    app.run(host='0.0.0.0', port=5000, debug=(env == 'development'))
