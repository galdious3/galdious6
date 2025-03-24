"""
نظام حجز تذاكر الطيران - ملف التكوين
ملف تكوين للخادم الخلفي
"""

import os

class Config:
    """فئة التكوين الأساسية"""
    # تكوين السر للجلسات
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'sky_booking_secret_key'
    
    # تكوين قاعدة البيانات
    MYSQL_HOST = os.environ.get('MYSQL_HOST') or 'localhost'
    MYSQL_USER = os.environ.get('MYSQL_USER') or 'root'
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or 'qwe123iop789'
    MYSQL_DB = os.environ.get('MYSQL_DB') or 'mustafakk'
    MYSQL_CURSORCLASS = 'DictCursor'
    
    # تكوين التطبيق
    DEBUG = False
    TESTING = False
    
    # تكوين CORS
    CORS_HEADERS = 'Content-Type'
    
    # تكوين البريد الإلكتروني
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') or True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or 'your-email@gmail.com'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or 'your-password'
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or 'your-email@gmail.com'

class DevelopmentConfig(Config):
    """فئة تكوين بيئة التطوير"""
    DEBUG = True
    
    # تكوين إضافي لبيئة التطوير
    TEMPLATES_AUTO_RELOAD = True

class TestingConfig(Config):
    """فئة تكوين بيئة الاختبار"""
    TESTING = True
    DEBUG = True
    
    # استخدام قاعدة بيانات اختبار منفصلة
    MYSQL_DB = 'mustafakk_test'

class ProductionConfig(Config):
    """فئة تكوين بيئة الإنتاج"""
    # تكوين إضافي لبيئة الإنتاج
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # تكوين مسجلات الأخطاء
        import logging
        from logging.handlers import RotatingFileHandler
        
        file_handler = RotatingFileHandler('logs/sky_booking.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('Sky Booking startup')

# قاموس التكوينات
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
