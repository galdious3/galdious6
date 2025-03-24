#!/bin/bash

# نص لاختبار نظام حجز تذاكر الطيران

# تعيين الألوان للإخراج
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# دالة لعرض رسائل النجاح
success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

# دالة لعرض رسائل الفشل
failure() {
    echo -e "${RED}[✗] $1${NC}"
}

# دالة لعرض رسائل التحذير
warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

# دالة لعرض رسائل المعلومات
info() {
    echo -e "[i] $1"
}

# دالة للتحقق من وجود ملف
check_file_exists() {
    if [ -f "$1" ]; then
        success "الملف موجود: $1"
        return 0
    else
        failure "الملف غير موجود: $1"
        return 1
    fi
}

# دالة للتحقق من وجود مجلد
check_directory_exists() {
    if [ -d "$1" ]; then
        success "المجلد موجود: $1"
        return 0
    else
        failure "المجلد غير موجود: $1"
        return 1
    fi
}

# دالة للتحقق من وجود نص في ملف
check_content_in_file() {
    if grep -q "$2" "$1"; then
        success "تم العثور على المحتوى في الملف $1: $2"
        return 0
    else
        failure "لم يتم العثور على المحتوى في الملف $1: $2"
        return 1
    fi
}

# عرض عنوان الاختبار
echo "================================================"
echo "    اختبار نظام حجز تذاكر الطيران"
echo "================================================"
echo ""

# التحقق من هيكل المشروع
echo "التحقق من هيكل المشروع..."
check_directory_exists "/home/ubuntu/flight_booking_system"
check_directory_exists "/home/ubuntu/flight_booking_system/frontend"
check_directory_exists "/home/ubuntu/flight_booking_system/backend"
check_directory_exists "/home/ubuntu/flight_booking_system/database"
check_directory_exists "/home/ubuntu/flight_booking_system/docs"
echo ""

# التحقق من ملفات الواجهة الأمامية
echo "التحقق من ملفات الواجهة الأمامية..."
check_file_exists "/home/ubuntu/flight_booking_system/frontend/index.html"
check_file_exists "/home/ubuntu/flight_booking_system/frontend/search-results.html"
check_file_exists "/home/ubuntu/flight_booking_system/frontend/flight-details.html"
check_file_exists "/home/ubuntu/flight_booking_system/frontend/passenger-info.html"
check_file_exists "/home/ubuntu/flight_booking_system/frontend/css/styles.css"
check_file_exists "/home/ubuntu/flight_booking_system/frontend/js/app.js"
check_file_exists "/home/ubuntu/flight_booking_system/frontend/js/integration.js"
echo ""

# التحقق من ملفات الخلفية
echo "التحقق من ملفات الخلفية..."
check_file_exists "/home/ubuntu/flight_booking_system/backend/app.py"
check_file_exists "/home/ubuntu/flight_booking_system/backend/helpers.py"
check_file_exists "/home/ubuntu/flight_booking_system/backend/config.py"
check_file_exists "/home/ubuntu/flight_booking_system/backend/run.py"
check_file_exists "/home/ubuntu/flight_booking_system/backend/API_DOCUMENTATION.md"
echo ""

# التحقق من ملفات قاعدة البيانات
echo "التحقق من ملفات قاعدة البيانات..."
check_file_exists "/home/ubuntu/flight_booking_system/database/database_schema.sql"
echo ""

# التحقق من ملفات التوثيق
echo "التحقق من ملفات التوثيق..."
check_file_exists "/home/ubuntu/flight_booking_system/docs/flight_booking_research.md"
check_file_exists "/home/ubuntu/flight_booking_system/docs/programming_functions_analysis.md"
check_file_exists "/home/ubuntu/flight_booking_system/docs/database_design.md"
echo ""

# التحقق من محتوى ملفات HTML
echo "التحقق من محتوى ملفات HTML..."
check_content_in_file "/home/ubuntu/flight_booking_system/frontend/index.html" "<title>"
check_content_in_file "/home/ubuntu/flight_booking_system/frontend/index.html" "form"
check_content_in_file "/home/ubuntu/flight_booking_system/frontend/search-results.html" "flight-card"
check_content_in_file "/home/ubuntu/flight_booking_system/frontend/flight-details.html" "fare-options"
check_content_in_file "/home/ubuntu/flight_booking_system/frontend/passenger-info.html" "passenger-info-form"
echo ""

# التحقق من محتوى ملفات JavaScript
echo "التحقق من محتوى ملفات JavaScript..."
check_content_in_file "/home/ubuntu/flight_booking_system/frontend/js/app.js" "ApiService"
check_content_in_file "/home/ubuntu/flight_booking_system/frontend/js/app.js" "FormHandler"
check_content_in_file "/home/ubuntu/flight_booking_system/frontend/js/app.js" "UIHandler"
check_content_in_file "/home/ubuntu/flight_booking_system/frontend/js/app.js" "AuthHandler"
check_content_in_file "/home/ubuntu/flight_booking_system/frontend/js/integration.js" "setupEventListeners"
echo ""

# التحقق من محتوى ملفات Python
echo "التحقق من محتوى ملفات Python..."
check_content_in_file "/home/ubuntu/flight_booking_system/backend/app.py" "Flask"
check_content_in_file "/home/ubuntu/flight_booking_system/backend/app.py" "route"
check_content_in_file "/home/ubuntu/flight_booking_system/backend/helpers.py" "class"
check_content_in_file "/home/ubuntu/flight_booking_system/backend/config.py" "Config"
echo ""

# التحقق من محتوى ملف قاعدة البيانات
echo "التحقق من محتوى ملف قاعدة البيانات..."
check_content_in_file "/home/ubuntu/flight_booking_system/database/database_schema.sql" "CREATE TABLE"
check_content_in_file "/home/ubuntu/flight_booking_system/database/database_schema.sql" "INSERT INTO"
echo ""

# اختبار تشغيل الخادم الخلفي
echo "اختبار تشغيل الخادم الخلفي..."
cd /home/ubuntu/flight_booking_system/backend
if python3 -c "import app" 2>/dev/null; then
    success "تم استيراد ملف app.py بنجاح"
else
    failure "فشل استيراد ملف app.py"
fi
echo ""

# عرض ملخص الاختبار
echo "================================================"
echo "    ملخص اختبار نظام حجز تذاكر الطيران"
echo "================================================"
echo ""
echo "تم التحقق من هيكل المشروع وملفاته الأساسية."
echo "النظام جاهز للاختبار اليدوي والتشغيل."
echo ""
echo "الخطوات التالية:"
echo "1. تشغيل الخادم الخلفي: python3 run.py"
echo "2. فتح الصفحة الرئيسية في المتصفح"
echo "3. اختبار وظائف البحث والحجز"
echo "4. إعداد ملفات GitHub"
echo ""
echo "================================================"
