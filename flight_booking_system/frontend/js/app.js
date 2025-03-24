// نظام حجز تذاكر الطيران - ملف JavaScript الرئيسي
// يحتوي على وظائف للتفاعل مع واجهات برمجة التطبيقات الخلفية

// تكوين الاتصال بالخادم الخلفي
const API_BASE_URL = 'http://localhost:5000/api';

// كائن للتعامل مع طلبات API
const ApiService = {
    // دالة مساعدة لإرسال طلبات HTTP
    async fetchAPI(endpoint, options = {}) {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            
            // إعداد خيارات الطلب الافتراضية
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // لإرسال ملفات تعريف الارتباط مع الطلب
            };
            
            // دمج الخيارات المخصصة مع الخيارات الافتراضية
            const fetchOptions = {
                ...defaultOptions,
                ...options,
            };
            
            // إذا كان هناك بيانات في الجسم، قم بتحويلها إلى JSON
            if (fetchOptions.body && typeof fetchOptions.body === 'object') {
                fetchOptions.body = JSON.stringify(fetchOptions.body);
            }
            
            // إرسال الطلب
            const response = await fetch(url, fetchOptions);
            
            // التحقق من حالة الاستجابة
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'حدث خطأ في الطلب');
            }
            
            // إرجاع البيانات كـ JSON
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // دوال للتعامل مع المدن
    cities: {
        // الحصول على قائمة المدن
        async getAll() {
            return await ApiService.fetchAPI('/cities');
        },
        
        // الحصول على معلومات مدينة محددة
        async getById(cityId) {
            return await ApiService.fetchAPI(`/cities/${cityId}`);
        }
    },
    
    // دوال للتعامل مع شركات الطيران
    airlines: {
        // الحصول على قائمة شركات الطيران
        async getAll() {
            return await ApiService.fetchAPI('/airlines');
        },
        
        // الحصول على معلومات شركة طيران محددة
        async getById(airlineId) {
            return await ApiService.fetchAPI(`/airlines/${airlineId}`);
        },
        
        // الحصول على الخدمات الإضافية لشركة طيران محددة
        async getAncillaryServices(airlineId) {
            return await ApiService.fetchAPI(`/airlines/${airlineId}/ancillary_services`);
        }
    },
    
    // دوال للتعامل مع فئات الحجز
    travelClasses: {
        // الحصول على قائمة فئات الحجز
        async getAll() {
            return await ApiService.fetchAPI('/travel_classes');
        }
    },
    
    // دوال للتعامل مع الرحلات
    flights: {
        // البحث عن الرحلات المتاحة
        async search(searchParams) {
            return await ApiService.fetchAPI('/flights/search', {
                method: 'POST',
                body: searchParams
            });
        },
        
        // الحصول على تفاصيل رحلة محددة
        async getDetails(flightId) {
            return await ApiService.fetchAPI(`/flights/${flightId}`);
        }
    },
    
    // دوال للتعامل مع الخدمات الإضافية
    ancillaryServices: {
        // الحصول على قائمة الخدمات الإضافية
        async getAll() {
            return await ApiService.fetchAPI('/ancillary_services');
        }
    },
    
    // دوال للتعامل مع المستخدمين
    users: {
        // تسجيل مستخدم جديد
        async register(userData) {
            return await ApiService.fetchAPI('/users/register', {
                method: 'POST',
                body: userData
            });
        },
        
        // تسجيل دخول المستخدم
        async login(credentials) {
            return await ApiService.fetchAPI('/users/login', {
                method: 'POST',
                body: credentials
            });
        },
        
        // تسجيل خروج المستخدم
        async logout() {
            return await ApiService.fetchAPI('/users/logout', {
                method: 'POST'
            });
        },
        
        // الحصول على الملف الشخصي للمستخدم
        async getProfile() {
            return await ApiService.fetchAPI('/users/profile');
        },
        
        // تحديث الملف الشخصي للمستخدم
        async updateProfile(profileData) {
            return await ApiService.fetchAPI('/users/profile', {
                method: 'PUT',
                body: profileData
            });
        },
        
        // الحصول على حجوزات المستخدم
        async getBookings() {
            return await ApiService.fetchAPI('/users/bookings');
        }
    },
    
    // دوال للتعامل مع الحجوزات
    bookings: {
        // إنشاء حجز جديد
        async create(bookingData) {
            return await ApiService.fetchAPI('/bookings', {
                method: 'POST',
                body: bookingData
            });
        },
        
        // الحصول على تفاصيل حجز محدد
        async getById(bookingId) {
            return await ApiService.fetchAPI(`/bookings/${bookingId}`);
        },
        
        // الحصول على تفاصيل حجز بواسطة الرقم المرجعي
        async getByReference(bookingReference) {
            return await ApiService.fetchAPI(`/bookings/reference/${bookingReference}`);
        }
    },
    
    // دوال للتعامل مع المدفوعات
    payments: {
        // معالجة عملية دفع جديدة
        async process(paymentData) {
            return await ApiService.fetchAPI('/payments', {
                method: 'POST',
                body: paymentData
            });
        }
    }
};

// كائن للتعامل مع نماذج البحث والحجز
const FormHandler = {
    // تهيئة نموذج البحث عن الرحلات
    initSearchForm() {
        const searchForm = document.getElementById('flight-search-form');
        if (!searchForm) return;
        
        // تحميل المدن لقوائم المنسدلة
        this.loadCitiesDropdowns();
        
        // إضافة مستمع حدث لتقديم النموذج
        searchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // جمع بيانات النموذج
            const formData = new FormData(searchForm);
            const searchParams = {
                from_city_id: formData.get('from_city_id'),
                to_city_id: formData.get('to_city_id'),
                departure_date: formData.get('departure_date'),
                passengers: formData.get('passengers') || 1,
                travel_class_id: formData.get('travel_class_id') || 1
            };
            
            // إضافة تاريخ العودة إذا كان موجوداً
            const returnDate = formData.get('return_date');
            if (returnDate) {
                searchParams.return_date = returnDate;
            }
            
            try {
                // عرض مؤشر التحميل
                UIHandler.showLoader();
                
                // البحث عن الرحلات
                const results = await ApiService.flights.search(searchParams);
                
                // تخزين نتائج البحث في التخزين المحلي
                localStorage.setItem('searchResults', JSON.stringify(results));
                localStorage.setItem('searchParams', JSON.stringify(searchParams));
                
                // الانتقال إلى صفحة نتائج البحث
                window.location.href = 'search-results.html';
            } catch (error) {
                UIHandler.showError('حدث خطأ أثناء البحث عن الرحلات', error.message);
            } finally {
                UIHandler.hideLoader();
            }
        });
    },
    
    // تحميل المدن للقوائم المنسدلة
    async loadCitiesDropdowns() {
        try {
            const cities = await ApiService.cities.getAll();
            
            // تحديث قائمة مدن المغادرة
            const fromCitySelect = document.getElementById('from_city_id');
            if (fromCitySelect) {
                fromCitySelect.innerHTML = '<option value="" disabled selected>اختر مدينة المغادرة</option>';
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.id;
                    option.textContent = city.name;
                    fromCitySelect.appendChild(option);
                });
            }
            
            // تحديث قائمة مدن الوصول
            const toCitySelect = document.getElementById('to_city_id');
            if (toCitySelect) {
                toCitySelect.innerHTML = '<option value="" disabled selected>اختر مدينة الوصول</option>';
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.id;
                    option.textContent = city.name;
                    toCitySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading cities:', error);
            UIHandler.showError('تعذر تحميل قائمة المدن', error.message);
        }
    },
    
    // تهيئة نموذج معلومات المسافر
    initPassengerForm() {
        const passengerForm = document.getElementById('passenger-info-form');
        if (!passengerForm) return;
        
        // إضافة مستمع حدث لتقديم النموذج
        passengerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // جمع بيانات النموذج
            const formData = new FormData(passengerForm);
            const passengerData = {
                passenger_name: `${formData.get('first_name')} ${formData.get('last_name')}`,
                passenger_email: formData.get('email'),
                passenger_phone: formData.get('phone'),
                flight_schedule_id: localStorage.getItem('selectedFlightId'),
                travel_class_id: localStorage.getItem('selectedClassId') || 1,
                flight_date: localStorage.getItem('departureDate'),
                bags_count: formData.get('bags_count') || 1,
                medical_discount: formData.get('medical_discount') === 'on'
            };
            
            try {
                // عرض مؤشر التحميل
                UIHandler.showLoader();
                
                // تخزين بيانات المسافر في التخزين المحلي
                localStorage.setItem('passengerData', JSON.stringify(passengerData));
                
                // الانتقال إلى صفحة الخدمات الإضافية
                window.location.href = 'ancillary-services.html';
            } catch (error) {
                UIHandler.showError('حدث خطأ أثناء معالجة معلومات المسافر', error.message);
            } finally {
                UIHandler.hideLoader();
            }
        });
    },
    
    // تهيئة نموذج الخدمات الإضافية
    async initAncillaryServicesForm() {
        const servicesForm = document.getElementById('ancillary-services-form');
        if (!servicesForm) return;
        
        try {
            // الحصول على معرف شركة الطيران من الرحلة المختارة
            const flightId = localStorage.getItem('selectedFlightId');
            const flightDetails = await ApiService.flights.getDetails(flightId);
            const airlineId = flightDetails.airline_id;
            
            // تحميل الخدمات الإضافية لشركة الطيران
            const services = await ApiService.airlines.getAncillaryServices(airlineId);
            
            // عرض الخدمات الإضافية
            const servicesContainer = document.getElementById('services-container');
            if (servicesContainer && services.length > 0) {
                servicesContainer.innerHTML = '';
                
                services.forEach(service => {
                    const serviceItem = document.createElement('div');
                    serviceItem.className = 'form-check mb-3 border p-3 rounded';
                    serviceItem.innerHTML = `
                        <input class="form-check-input" type="checkbox" name="ancillary_services" id="service_${service.ancillary_service_id}" value="${service.ancillary_service_id}">
                        <label class="form-check-label d-flex justify-content-between w-100" for="service_${service.ancillary_service_id}">
                            <div>
                                <span class="d-block fw-bold">${service.name}</span>
                                <small class="text-muted">${service.description}</small>
                            </div>
                            <span class="text-primary fw-bold">$${service.price.toFixed(2)}</span>
                        </label>
                    `;
                    servicesContainer.appendChild(serviceItem);
                });
            } else {
                servicesContainer.innerHTML = '<p class="text-center">لا توجد خدمات إضافية متاحة لهذه الرحلة</p>';
            }
            
            // إضافة مستمع حدث لتقديم النموذج
            servicesForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                // جمع بيانات الخدمات المختارة
                const selectedServices = [];
                const checkboxes = servicesForm.querySelectorAll('input[name="ancillary_services"]:checked');
                
                checkboxes.forEach(checkbox => {
                    selectedServices.push({
                        id: parseInt(checkbox.value)
                    });
                });
                
                try {
                    // عرض مؤشر التحميل
                    UIHandler.showLoader();
                    
                    // تخزين الخدمات المختارة في التخزين المحلي
                    localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
                    
                    // الانتقال إلى صفحة الدفع
                    window.location.href = 'payment.html';
                } catch (error) {
                    UIHandler.showError('حدث خطأ أثناء معالجة الخدمات الإضافية', error.message);
                } finally {
                    UIHandler.hideLoader();
                }
            });
        } catch (error) {
            console.error('Error loading ancillary services:', error);
            UIHandler.showError('تعذر تحميل الخدمات الإضافية', error.message);
        }
    },
    
    // تهيئة نموذج الدفع
    initPaymentForm() {
        const paymentForm = document.getElementById('payment-form');
        if (!paymentForm) return;
        
        // عرض ملخص الحجز
        this.displayBookingSummary();
        
        // إضافة مستمع حدث لتقديم النموذج
        paymentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // جمع بيانات النموذج
            const formData = new FormData(paymentForm);
            
            try {
                // عرض مؤشر التحميل
                UIHandler.showLoader();
                
                // إنشاء الحجز
                const passengerData = JSON.parse(localStorage.getItem('passengerData'));
                const selectedServices = JSON.parse(localStorage.getItem('selectedServices') || '[]');
                
                const bookingData = {
                    ...passengerData,
                    ancillary_services: selectedServices
                };
                
                // إرسال طلب إنشاء الحجز
                const bookingResult = await ApiService.bookings.create(bookingData);
                
                // معالجة الدفع
                const paymentData = {
                    booking_id: bookingResult.booking.id,
                    amount: bookingResult.booking.final_price,
                    payment_method: formData.get('payment_method'),
                    card_number: formData.get('card_number'),
                    card_holder: formData.get('card_holder'),
                    expiry_date: formData.get('expiry_date'),
                    cvv: formData.get('cvv')
                };
                
                // إرسال طلب معالجة الدفع
                const paymentResult = await ApiService.payments.process(paymentData);
                
                // تخزين معلومات الحجز في التخزين المحلي
                localStorage.setItem('bookingResult', JSON.stringify(bookingResult));
                localStorage.setItem('paymentResult', JSON.stringify(paymentResult));
                
                // مسح بيانات البحث والحجز المؤقتة
                this.clearTemporaryData();
                
                // الانتقال إلى صفحة التأكيد
                window.location.href = 'confirmation.html';
            } catch (error) {
                UIHandler.showError('حدث خطأ أثناء معالجة الدفع', error.message);
            } finally {
                UIHandler.hideLoader();
            }
        });
    },
    
    // عرض ملخص الحجز في صفحة الدفع
    async displayBookingSummary() {
        try {
            const summaryContainer = document.getElementById('booking-summary');
            if (!summaryContainer) return;
            
            // الحصول على بيانات الرحلة والمسافر
            const flightId = localStorage.getItem('selectedFlightId');
            const flightDetails = await ApiService.flights.getDetails(flightId);
            const passengerData = JSON.parse(localStorage.getItem('passengerData'));
            const selectedClassId = localStorage.getItem('selectedClassId') || 1;
            
            // العثور على سعر الفئة المختارة
            const selectedClass = flightDetails.prices.find(price => price.travel_class_id == selectedClassId);
            
            // حساب السعر الإجمالي
            let totalPrice = selectedClass ? selectedClass.final_price : 0;
            
            // إضافة أسعار الخدمات الإضافية
            const selectedServices = JSON.parse(localStorage.getItem('selectedServices') || '[]');
            if (selectedServices.length > 0) {
                const airlineServices = await ApiService.airlines.getAncillaryServices(flightDetails.airline_id);
                
                selectedServices.forEach(service => {
                    const serviceDetails = airlineServices.find(s => s.ancillary_service_id == service.id);
                    if (serviceDetails) {
                        totalPrice += serviceDetails.price;
                    }
                });
            }
            
            // عرض ملخص الحجز
            summaryContainer.innerHTML = `
                <div class="d-flex align-items-center mb-3">
                    <img src="images/airlines/${flightDetails.airline_logo}" alt="${flightDetails.airline_name}" class="me-3" width="40">
                    <div>
                        <h6 class="mb-0">${flightDetails.airline_name}</h6>
                        <p class="text-muted mb-0">${flightDetails.id} | ${passengerData.flight_date}</p>
                    </div>
                </div>
                <div class="summary-route mb-3">
                    <div class="d-flex justify-content-between">
                        <div>
                            <p class="mb-0"><strong>${flightDetails.from_city_name} (${flightDetails.from_airport_code})</strong></p>
                            <p class="text-muted mb-0">${flightDetails.departure_time}</p>
                        </div>
                        <div class="text-center">
                            <i class="fas fa-plane text-primary"></i>
                        </div>
                        <div class="text-end">
                            <p class="mb-0"><strong>${flightDetails.to_city_name} (${flightDetails.to_airport_code})</strong></p>
                            <p class="text-muted mb-0">${flightDetails.arrival_time}</p>
                        </div>
                    </div>
                </div>
                <div class="summary-details mb-3">
                    <p class="mb-1"><i class="fas fa-user text-primary me-2"></i> ${passengerData.passenger_name}</p>
                    <p class="mb-1"><i class="fas fa-tag text-primary me-2"></i> ${selectedClass ? selectedClass.travel_class_name : 'الدرجة الاقتصادية'}</p>
                </div>
                <hr>
                <div class="price-breakdown">
                    <div class="d-flex justify-content-between mb-2">
                        <span>سعر التذكرة الأساسي</span>
                        <span>$${selectedClass ? selectedClass.base_price.toFixed(2) : '0.00'}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>الضرائب والرسوم</span>
                        <span>$${selectedClass ? selectedClass.tax_amount.toFixed(2) : '0.00'}</span>
                    </div>
                    ${selectedClass && selectedClass.discount_amount > 0 ? `
                    <div class="d-flex justify-content-between mb-2">
                        <span>الخصومات</span>
                        <span>-$${selectedClass.discount_amount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${selectedServices.length > 0 ? `
                    <div class="d-flex justify-content-between mb-2">
                        <span>الخدمات الإضافية</span>
                        <span>$${(totalPrice - (selectedClass ? selectedClass.final_price : 0)).toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <hr>
                    <div class="d-flex justify-content-between mb-3 fw-bold">
                        <span>الإجمالي</span>
                        <span class="text-primary">$${totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error displaying booking summary:', error);
            UIHandler.showError('تعذر عرض ملخص الحجز', error.message);
        }
    },
    
    // مسح بيانات البحث والحجز المؤقتة
    clearTemporaryData() {
        localStorage.removeItem('searchResults');
        localStorage.removeItem('searchParams');
        localStorage.removeItem('selectedFlightId');
        localStorage.removeItem('selectedClassId');
        localStorage.removeItem('departureDate');
        localStorage.removeItem('passengerData');
        localStorage.removeItem('selectedServices');
    }
};

// كائن للتعامل مع واجهة المستخدم
const UIHandler = {
    // عرض مؤشر التحميل
    showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.remove('d-none');
        } else {
            // إنشاء مؤشر التحميل إذا لم يكن موجوداً
            const newLoader = document.createElement('div');
            newLoader.id = 'loader';
            newLoader.className = 'loader-overlay';
            newLoader.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">جاري التحميل...</span>
                </div>
            `;
            document.body.appendChild(newLoader);
        }
    },
    
    // إخفاء مؤشر التحميل
    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('d-none');
        }
    },
    
    // عرض رسالة خطأ
    showError(title, message) {
        // إنشاء عنصر التنبيه
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-danger alert-dismissible fade show';
        alertElement.setAttribute('role', 'alert');
        alertElement.innerHTML = `
            <strong>${title}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // إضافة التنبيه إلى الصفحة
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.appendChild(alertElement);
        } else {
            // إنشاء حاوية التنبيهات إذا لم تكن موجودة
            const newAlertContainer = document.createElement('div');
            newAlertContainer.id = 'alert-container';
            newAlertContainer.className = 'alert-container';
            newAlertContainer.appendChild(alertElement);
            document.body.insertBefore(newAlertContainer, document.body.firstChild);
        }
        
        // إزالة التنبيه بعد 5 ثوانٍ
        setTimeout(() => {
            alertElement.remove();
        }, 5000);
    },
    
    // عرض رسالة نجاح
    showSuccess(title, message) {
        // إنشاء عنصر التنبيه
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-success alert-dismissible fade show';
        alertElement.setAttribute('role', 'alert');
        alertElement.innerHTML = `
            <strong>${title}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // إضافة التنبيه إلى الصفحة
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.appendChild(alertElement);
        } else {
            // إنشاء حاوية التنبيهات إذا لم تكن موجودة
            const newAlertContainer = document.createElement('div');
            newAlertContainer.id = 'alert-container';
            newAlertContainer.className = 'alert-container';
            newAlertContainer.appendChild(alertElement);
            document.body.insertBefore(newAlertContainer, document.body.firstChild);
        }
        
        // إزالة التنبيه بعد 5 ثوانٍ
        setTimeout(() => {
            alertElement.remove();
        }, 5000);
    },
    
    // عرض نتائج البحث عن الرحلات
    displaySearchResults() {
        const resultsContainer = document.getElementById('search-results-container');
        if (!resultsContainer) return;
        
        // الحصول على نتائج البحث من التخزين المحلي
        const searchResults = JSON.parse(localStorage.getItem('searchResults'));
        const searchParams = JSON.parse(localStorage.getItem('searchParams'));
        
        if (!searchResults || !searchParams) {
            resultsContainer.innerHTML = '<div class="alert alert-info">لا توجد نتائج بحث. يرجى العودة إلى الصفحة الرئيسية وإجراء بحث جديد.</div>';
            return;
        }
        
        // تحديث عنوان نتائج البحث
        const resultsTitle = document.getElementById('search-results-title');
        if (resultsTitle) {
            resultsTitle.textContent = `نتائج البحث: ${searchParams.from_city_id} إلى ${searchParams.to_city_id}`;
        }
        
        // عرض رحلات الذهاب
        const outboundFlights = searchResults.outbound_flights;
        if (outboundFlights && outboundFlights.length > 0) {
            const outboundContainer = document.getElementById('outbound-flights');
            if (outboundContainer) {
                outboundContainer.innerHTML = '';
                
                outboundFlights.forEach(flight => {
                    const flightCard = document.createElement('div');
                    flightCard.className = 'card flight-card mb-4';
                    flightCard.innerHTML = `
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="airline-info d-flex align-items-center">
                                        <img src="images/airlines/${flight.airline_logo}" alt="${flight.airline_name}" class="me-2" width="40">
                                        <div>
                                            <h6 class="mb-0">${flight.airline_name}</h6>
                                            <p class="text-muted mb-0">رحلة ${flight.id}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-5">
                                    <div class="flight-route d-flex justify-content-between align-items-center">
                                        <div class="text-center">
                                            <h5 class="mb-0">${flight.departure_time}</h5>
                                            <p class="mb-0">${flight.from_city_name}</p>
                                        </div>
                                        <div class="flight-duration text-center">
                                            <div class="flight-line"></div>
                                            <p class="text-muted mb-0">مباشر</p>
                                        </div>
                                        <div class="text-center">
                                            <h5 class="mb-0">${flight.arrival_time}</h5>
                                            <p class="mb-0">${flight.to_city_name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <div class="flight-price text-center">
                                        <h5 class="text-primary mb-0">$${flight.price_per_passenger.toFixed(2)}</h5>
                                        <p class="text-muted mb-0">${flight.travel_class_name}</p>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-primary w-100 select-flight-btn" data-flight-id="${flight.id}" data-class-id="${flight.travel_class_id}" data-date="${searchParams.departure_date}">
                                        اختيار
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    outboundContainer.appendChild(flightCard);
                });
                
                // إضافة مستمعي أحداث لأزرار اختيار الرحلة
                const selectButtons = outboundContainer.querySelectorAll('.select-flight-btn');
                selectButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const flightId = button.getAttribute('data-flight-id');
                        const classId = button.getAttribute('data-class-id');
                        const date = button.getAttribute('data-date');
                        
                        // تخزين معلومات الرحلة المختارة
                        localStorage.setItem('selectedFlightId', flightId);
                        localStorage.setItem('selectedClassId', classId);
                        localStorage.setItem('departureDate', date);
                        
                        // الانتقال إلى صفحة تفاصيل الرحلة
                        window.location.href = 'flight-details.html';
                    });
                });
            }
        } else {
            const outboundContainer = document.getElementById('outbound-flights');
            if (outboundContainer) {
                outboundContainer.innerHTML = '<div class="alert alert-info">لا توجد رحلات متاحة للذهاب في التاريخ المحدد.</div>';
            }
        }
        
        // عرض رحلات العودة إذا كانت موجودة
        const returnFlights = searchResults.return_flights;
        const returnContainer = document.getElementById('return-flights');
        
        if (returnContainer) {
            if (returnFlights && returnFlights.length > 0) {
                const returnTitle = document.getElementById('return-flights-title');
                if (returnTitle) {
                    returnTitle.classList.remove('d-none');
                }
                
                returnContainer.innerHTML = '';
                
                returnFlights.forEach(flight => {
                    const flightCard = document.createElement('div');
                    flightCard.className = 'card flight-card mb-4';
                    flightCard.innerHTML = `
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="airline-info d-flex align-items-center">
                                        <img src="images/airlines/${flight.airline_logo}" alt="${flight.airline_name}" class="me-2" width="40">
                                        <div>
                                            <h6 class="mb-0">${flight.airline_name}</h6>
                                            <p class="text-muted mb-0">رحلة ${flight.id}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-5">
                                    <div class="flight-route d-flex justify-content-between align-items-center">
                                        <div class="text-center">
                                            <h5 class="mb-0">${flight.departure_time}</h5>
                                            <p class="mb-0">${flight.from_city_name}</p>
                                        </div>
                                        <div class="flight-duration text-center">
                                            <div class="flight-line"></div>
                                            <p class="text-muted mb-0">مباشر</p>
                                        </div>
                                        <div class="text-center">
                                            <h5 class="mb-0">${flight.arrival_time}</h5>
                                            <p class="mb-0">${flight.to_city_name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <div class="flight-price text-center">
                                        <h5 class="text-primary mb-0">$${flight.price_per_passenger.toFixed(2)}</h5>
                                        <p class="text-muted mb-0">${flight.travel_class_name}</p>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-primary w-100 select-return-flight-btn" data-flight-id="${flight.id}" data-class-id="${flight.travel_class_id}" data-date="${searchParams.return_date}">
                                        اختيار
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    returnContainer.appendChild(flightCard);
                });
                
                // إضافة مستمعي أحداث لأزرار اختيار رحلة العودة
                const selectReturnButtons = returnContainer.querySelectorAll('.select-return-flight-btn');
                selectReturnButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const flightId = button.getAttribute('data-flight-id');
                        const classId = button.getAttribute('data-class-id');
                        const date = button.getAttribute('data-date');
                        
                        // تخزين معلومات رحلة العودة المختارة
                        localStorage.setItem('selectedReturnFlightId', flightId);
                        localStorage.setItem('selectedReturnClassId', classId);
                        localStorage.setItem('returnDate', date);
                        
                        // الانتقال إلى صفحة تفاصيل الرحلة
                        window.location.href = 'flight-details.html';
                    });
                });
            } else if (searchParams.return_date) {
                returnContainer.innerHTML = '<div class="alert alert-info">لا توجد رحلات متاحة للعودة في التاريخ المحدد.</div>';
            } else {
                returnContainer.innerHTML = '';
            }
        }
    },
    
    // عرض تفاصيل الرحلة المختارة
    async displayFlightDetails() {
        const detailsContainer = document.getElementById('flight-details-container');
        if (!detailsContainer) return;
        
        // الحصول على معرف الرحلة المختارة من التخزين المحلي
        const flightId = localStorage.getItem('selectedFlightId');
        
        if (!flightId) {
            detailsContainer.innerHTML = '<div class="alert alert-info">لم يتم اختيار رحلة. يرجى العودة إلى صفحة نتائج البحث واختيار رحلة.</div>';
            return;
        }
        
        try {
            // عرض مؤشر التحميل
            this.showLoader();
            
            // الحصول على تفاصيل الرحلة
            const flightDetails = await ApiService.flights.getDetails(flightId);
            
            // تحديث عنوان تفاصيل الرحلة
            const flightTitle = document.getElementById('flight-title');
            if (flightTitle) {
                flightTitle.textContent = `${flightDetails.from_city_name} إلى ${flightDetails.to_city_name}`;
            }
            
            // عرض معلومات الرحلة
            const flightInfo = document.getElementById('flight-info');
            if (flightInfo) {
                flightInfo.innerHTML = `
                    <div class="d-flex align-items-center mb-4">
                        <img src="images/airlines/${flightDetails.airline_logo}" alt="${flightDetails.airline_name}" class="me-3" width="60">
                        <div>
                            <h5 class="mb-0">${flightDetails.airline_name}</h5>
                            <p class="text-muted mb-0">رحلة ${flightDetails.id} | ${localStorage.getItem('departureDate')}</p>
                        </div>
                    </div>
                    
                    <div class="flight-route mb-4">
                        <div class="row">
                            <div class="col-md-5 text-center text-md-start">
                                <h5 class="mb-0">${flightDetails.departure_time}</h5>
                                <p class="mb-1">${flightDetails.from_city_name} (${flightDetails.from_airport_code})</p>
                                <p class="text-muted mb-0">مطار ${flightDetails.from_city_name} الدولي</p>
                            </div>
                            <div class="col-md-2 d-flex flex-column align-items-center justify-content-center my-3 my-md-0">
                                <div class="flight-duration-line position-relative">
                                    <i class="fas fa-plane text-primary position-absolute top-50 start-50 translate-middle"></i>
                                </div>
                                <span class="mt-2 text-muted">مباشر</span>
                            </div>
                            <div class="col-md-5 text-center text-md-end">
                                <h5 class="mb-0">${flightDetails.arrival_time}</h5>
                                <p class="mb-1">${flightDetails.to_city_name} (${flightDetails.to_airport_code})</p>
                                <p class="text-muted mb-0">مطار ${flightDetails.to_city_name} الدولي</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // عرض خيارات فئات الحجز
            const fareOptions = document.getElementById('fare-options');
            if (fareOptions && flightDetails.prices && flightDetails.prices.length > 0) {
                fareOptions.innerHTML = '';
                
                flightDetails.prices.forEach(price => {
                    const option = document.createElement('div');
                    option.className = 'form-check mb-3 border p-3 rounded';
                    
                    // تحديد الفئة المختارة مسبقاً
                    const selectedClassId = localStorage.getItem('selectedClassId');
                    const isChecked = selectedClassId && price.travel_class_id == selectedClassId;
                    
                    option.innerHTML = `
                        <input class="form-check-input" type="radio" name="fareOption" id="fare_${price.travel_class_id}" value="${price.travel_class_id}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label d-flex justify-content-between w-100" for="fare_${price.travel_class_id}">
                            <div>
                                <span class="d-block fw-bold">${price.travel_class_name}</span>
                                <small class="text-muted">${this.getTravelClassDescription(price.travel_class_id)}</small>
                            </div>
                            <span class="text-primary fw-bold">$${price.final_price.toFixed(2)}</span>
                        </label>
                    `;
                    fareOptions.appendChild(option);
                });
                
                // إضافة مستمع حدث لتغيير فئة الحجز
                const radioButtons = fareOptions.querySelectorAll('input[name="fareOption"]');
                radioButtons.forEach(radio => {
                    radio.addEventListener('change', () => {
                        if (radio.checked) {
                            localStorage.setItem('selectedClassId', radio.value);
                        }
                    });
                });
            }
            
            // إضافة مستمع حدث لزر متابعة الحجز
            const continueButton = document.getElementById('continue-booking-btn');
            if (continueButton) {
                continueButton.addEventListener('click', () => {
                    window.location.href = 'passenger-info.html';
                });
            }
        } catch (error) {
            console.error('Error displaying flight details:', error);
            this.showError('تعذر عرض تفاصيل الرحلة', error.message);
        } finally {
            this.hideLoader();
        }
    },
    
    // الحصول على وصف فئة الحجز
    getTravelClassDescription(classId) {
        switch (parseInt(classId)) {
            case 1:
                return 'أمتعة مسجلة + وجبة';
            case 2:
                return 'أمتعة إضافية + وجبة فاخرة + صالة VIP';
            case 3:
                return 'تجربة سفر فاخرة مع جميع المزايا';
            default:
                return '';
        }
    },
    
    // عرض تفاصيل تأكيد الحجز
    displayBookingConfirmation() {
        const confirmationContainer = document.getElementById('booking-confirmation');
        if (!confirmationContainer) return;
        
        // الحصول على معلومات الحجز من التخزين المحلي
        const bookingResult = JSON.parse(localStorage.getItem('bookingResult'));
        const paymentResult = JSON.parse(localStorage.getItem('paymentResult'));
        
        if (!bookingResult || !bookingResult.booking) {
            confirmationContainer.innerHTML = '<div class="alert alert-info">لا توجد معلومات حجز. يرجى العودة إلى الصفحة الرئيسية وإجراء حجز جديد.</div>';
            return;
        }
        
        const booking = bookingResult.booking;
        
        // عرض معلومات تأكيد الحجز
        confirmationContainer.innerHTML = `
            <div class="text-center mb-5">
                <div class="confirmation-icon mb-4">
                    <i class="fas fa-check-circle text-success"></i>
                </div>
                <h3 class="mb-2">تم تأكيد الحجز بنجاح!</h3>
                <p class="text-muted">تم إرسال تفاصيل الحجز إلى بريدك الإلكتروني ${booking.passenger_email}</p>
                <div class="booking-reference mt-4">
                    <h5>الرقم المرجعي للحجز</h5>
                    <div class="reference-code">${booking.booking_reference}</div>
                </div>
            </div>
            
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-light py-3">
                    <h5 class="mb-0">تفاصيل الرحلة</h5>
                </div>
                <div class="card-body p-4">
                    <div class="d-flex align-items-center mb-4">
                        <img src="images/airlines/${booking.airline_logo}" alt="${booking.airline_name}" class="me-3" width="60">
                        <div>
                            <h5 class="mb-0">${booking.airline_name}</h5>
                            <p class="text-muted mb-0">رحلة ${booking.flight_schedule_id} | ${booking.flight_date}</p>
                        </div>
                    </div>
                    
                    <div class="flight-route mb-4">
                        <div class="row">
                            <div class="col-md-5 text-center text-md-start">
                                <h5 class="mb-0">${booking.departure_time}</h5>
                                <p class="mb-1">${booking.from_city_name} (${booking.from_airport_code})</p>
                                <p class="text-muted mb-0">مطار ${booking.from_city_name} الدولي</p>
                            </div>
                            <div class="col-md-2 d-flex flex-column align-items-center justify-content-center my-3 my-md-0">
                                <div class="flight-duration-line position-relative">
                                    <i class="fas fa-plane text-primary position-absolute top-50 start-50 translate-middle"></i>
                                </div>
                                <span class="mt-2 text-muted">مباشر</span>
                            </div>
                            <div class="col-md-5 text-center text-md-end">
                                <h5 class="mb-0">${booking.arrival_time}</h5>
                                <p class="mb-1">${booking.to_city_name} (${booking.to_airport_code})</p>
                                <p class="text-muted mb-0">مطار ${booking.to_city_name} الدولي</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="passenger-details">
                        <h6 class="mb-3">معلومات المسافر</h6>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <p class="mb-1 text-muted">الاسم</p>
                                <p class="mb-3 fw-bold">${booking.passenger_name}</p>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-1 text-muted">فئة الحجز</p>
                                <p class="mb-3 fw-bold">${booking.travel_class_name}</p>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-1 text-muted">البريد الإلكتروني</p>
                                <p class="mb-3">${booking.passenger_email}</p>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-1 text-muted">رقم الهاتف</p>
                                <p class="mb-3">${booking.passenger_phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-light py-3">
                    <h5 class="mb-0">تفاصيل الدفع</h5>
                </div>
                <div class="card-body p-4">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <p class="mb-1 text-muted">حالة الدفع</p>
                            <p class="mb-3"><span class="badge bg-success">تم الدفع</span></p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1 text-muted">رقم المعاملة</p>
                            <p class="mb-3">${paymentResult ? paymentResult.transaction_id : 'غير متوفر'}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1 text-muted">تاريخ الدفع</p>
                            <p class="mb-3">${new Date().toLocaleDateString('ar-EG')}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1 text-muted">المبلغ الإجمالي</p>
                            <p class="mb-3 fw-bold text-primary">$${booking.final_price.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <a href="index.html" class="btn btn-primary me-2">العودة إلى الصفحة الرئيسية</a>
                <button class="btn btn-outline-primary" onclick="window.print()">
                    <i class="fas fa-print me-2"></i> طباعة التذكرة
                </button>
            </div>
        `;
    },
    
    // تهيئة صفحة الملف الشخصي للمستخدم
    async initUserProfile() {
        const profileContainer = document.getElementById('user-profile');
        if (!profileContainer) return;
        
        try {
            // عرض مؤشر التحميل
            this.showLoader();
            
            // الحصول على معلومات المستخدم
            const userProfile = await ApiService.users.getProfile();
            
            // عرض معلومات المستخدم
            profileContainer.innerHTML = `
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-light py-3">
                        <h5 class="mb-0">المعلومات الشخصية</h5>
                    </div>
                    <div class="card-body p-4">
                        <form id="profile-form">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label for="first_name" class="form-label">الاسم الأول</label>
                                    <input type="text" class="form-control" id="first_name" name="first_name" value="${userProfile.first_name || ''}" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="last_name" class="form-label">اسم العائلة</label>
                                    <input type="text" class="form-control" id="last_name" name="last_name" value="${userProfile.last_name || ''}" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="email" class="form-label">البريد الإلكتروني</label>
                                    <input type="email" class="form-control" id="email" name="email" value="${userProfile.email || ''}" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="phone" class="form-label">رقم الهاتف</label>
                                    <input type="tel" class="form-control" id="phone" name="phone" value="${userProfile.phone || ''}" required>
                                </div>
                                <div class="col-12">
                                    <label for="address" class="form-label">العنوان</label>
                                    <input type="text" class="form-control" id="address" name="address" value="${userProfile.address || ''}">
                                </div>
                                <div class="col-md-6">
                                    <label for="date_of_birth" class="form-label">تاريخ الميلاد</label>
                                    <input type="date" class="form-control" id="date_of_birth" name="date_of_birth" value="${userProfile.date_of_birth || ''}">
                                </div>
                                <div class="col-md-6">
                                    <label for="nationality" class="form-label">الجنسية</label>
                                    <input type="text" class="form-control" id="nationality" name="nationality" value="${userProfile.nationality || ''}">
                                </div>
                                <div class="col-md-6">
                                    <label for="passport_number" class="form-label">رقم جواز السفر</label>
                                    <input type="text" class="form-control" id="passport_number" name="passport_number" value="${userProfile.passport_number || ''}">
                                </div>
                                <div class="col-md-6">
                                    <label for="passport_expiry" class="form-label">تاريخ انتهاء جواز السفر</label>
                                    <input type="date" class="form-control" id="passport_expiry" name="passport_expiry" value="${userProfile.passport_expiry || ''}">
                                </div>
                                <div class="col-12 mt-4">
                                    <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            // إضافة مستمع حدث لنموذج تحديث الملف الشخصي
            const profileForm = document.getElementById('profile-form');
            if (profileForm) {
                profileForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    
                    // جمع بيانات النموذج
                    const formData = new FormData(profileForm);
                    const profileData = {
                        first_name: formData.get('first_name'),
                        last_name: formData.get('last_name'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        address: formData.get('address'),
                        date_of_birth: formData.get('date_of_birth'),
                        nationality: formData.get('nationality'),
                        passport_number: formData.get('passport_number'),
                        passport_expiry: formData.get('passport_expiry')
                    };
                    
                    try {
                        // عرض مؤشر التحميل
                        this.showLoader();
                        
                        // تحديث الملف الشخصي
                        await ApiService.users.updateProfile(profileData);
                        
                        // عرض رسالة نجاح
                        this.showSuccess('تم التحديث بنجاح', 'تم تحديث معلومات الملف الشخصي بنجاح.');
                    } catch (error) {
                        this.showError('تعذر تحديث الملف الشخصي', error.message);
                    } finally {
                        this.hideLoader();
                    }
                });
            }
            
            // تحميل حجوزات المستخدم
            this.loadUserBookings();
        } catch (error) {
            console.error('Error loading user profile:', error);
            profileContainer.innerHTML = '<div class="alert alert-info">يرجى تسجيل الدخول لعرض الملف الشخصي.</div>';
        } finally {
            this.hideLoader();
        }
    },
    
    // تحميل حجوزات المستخدم
    async loadUserBookings() {
        const bookingsContainer = document.getElementById('user-bookings');
        if (!bookingsContainer) return;
        
        try {
            // الحصول على حجوزات المستخدم
            const bookings = await ApiService.users.getBookings();
            
            if (bookings && bookings.length > 0) {
                bookingsContainer.innerHTML = `
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-light py-3">
                            <h5 class="mb-0">حجوزاتي</h5>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th>الرقم المرجعي</th>
                                            <th>من</th>
                                            <th>إلى</th>
                                            <th>التاريخ</th>
                                            <th>الحالة</th>
                                            <th>السعر</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${bookings.map(booking => `
                                            <tr>
                                                <td>${booking.booking_reference}</td>
                                                <td>${booking.from_city_name}</td>
                                                <td>${booking.to_city_name}</td>
                                                <td>${booking.flight_date}</td>
                                                <td><span class="badge ${booking.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}">${booking.payment_status === 'paid' ? 'مدفوع' : 'قيد الانتظار'}</span></td>
                                                <td>$${booking.final_price.toFixed(2)}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary view-booking-btn" data-booking-id="${booking.id}">
                                                        عرض التفاصيل
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
                
                // إضافة مستمعي أحداث لأزرار عرض تفاصيل الحجز
                const viewButtons = bookingsContainer.querySelectorAll('.view-booking-btn');
                viewButtons.forEach(button => {
                    button.addEventListener('click', async () => {
                        const bookingId = button.getAttribute('data-booking-id');
                        
                        try {
                            // عرض مؤشر التحميل
                            this.showLoader();
                            
                            // الحصول على تفاصيل الحجز
                            const booking = await ApiService.bookings.getById(bookingId);
                            
                            // عرض تفاصيل الحجز في نافذة منبثقة
                            this.showBookingDetails(booking);
                        } catch (error) {
                            this.showError('تعذر عرض تفاصيل الحجز', error.message);
                        } finally {
                            this.hideLoader();
                        }
                    });
                });
            } else {
                bookingsContainer.innerHTML = `
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-light py-3">
                            <h5 class="mb-0">حجوزاتي</h5>
                        </div>
                        <div class="card-body p-4">
                            <div class="text-center py-4">
                                <i class="fas fa-ticket-alt text-muted mb-3" style="font-size: 3rem;"></i>
                                <h5>لا توجد حجوزات</h5>
                                <p class="text-muted">لم تقم بإجراء أي حجوزات حتى الآن.</p>
                                <a href="index.html" class="btn btn-primary mt-2">البحث عن رحلات</a>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading user bookings:', error);
            bookingsContainer.innerHTML = '<div class="alert alert-info">يرجى تسجيل الدخول لعرض الحجوزات.</div>';
        }
    },
    
    // عرض تفاصيل الحجز في نافذة منبثقة
    showBookingDetails(booking) {
        // إنشاء عنصر النافذة المنبثقة
        const modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.id = 'bookingDetailsModal';
        modalElement.setAttribute('tabindex', '-1');
        modalElement.setAttribute('aria-labelledby', 'bookingDetailsModalLabel');
        modalElement.setAttribute('aria-hidden', 'true');
        
        modalElement.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="bookingDetailsModalLabel">تفاصيل الحجز #${booking.booking_reference}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="booking-details">
                            <div class="d-flex align-items-center mb-4">
                                <img src="images/airlines/${booking.airline_logo}" alt="${booking.airline_name}" class="me-3" width="60">
                                <div>
                                    <h5 class="mb-0">${booking.airline_name}</h5>
                                    <p class="text-muted mb-0">رحلة ${booking.flight_schedule_id} | ${booking.flight_date}</p>
                                </div>
                            </div>
                            
                            <div class="flight-route mb-4">
                                <div class="row">
                                    <div class="col-md-5 text-center text-md-start">
                                        <h5 class="mb-0">${booking.departure_time}</h5>
                                        <p class="mb-1">${booking.from_city_name} (${booking.from_airport_code})</p>
                                        <p class="text-muted mb-0">مطار ${booking.from_city_name} الدولي</p>
                                    </div>
                                    <div class="col-md-2 d-flex flex-column align-items-center justify-content-center my-3 my-md-0">
                                        <div class="flight-duration-line position-relative">
                                            <i class="fas fa-plane text-primary position-absolute top-50 start-50 translate-middle"></i>
                                        </div>
                                        <span class="mt-2 text-muted">مباشر</span>
                                    </div>
                                    <div class="col-md-5 text-center text-md-end">
                                        <h5 class="mb-0">${booking.arrival_time}</h5>
                                        <p class="mb-1">${booking.to_city_name} (${booking.to_airport_code})</p>
                                        <p class="text-muted mb-0">مطار ${booking.to_city_name} الدولي</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row g-4">
                                <div class="col-md-6">
                                    <h6 class="mb-3">معلومات المسافر</h6>
                                    <p class="mb-2"><strong>الاسم:</strong> ${booking.passenger_name}</p>
                                    <p class="mb-2"><strong>البريد الإلكتروني:</strong> ${booking.passenger_email}</p>
                                    <p class="mb-2"><strong>رقم الهاتف:</strong> ${booking.passenger_phone}</p>
                                    <p class="mb-2"><strong>عدد الحقائب:</strong> ${booking.bags_count}</p>
                                    <p class="mb-2"><strong>فئة الحجز:</strong> ${booking.travel_class_name}</p>
                                </div>
                                
                                <div class="col-md-6">
                                    <h6 class="mb-3">معلومات الحجز</h6>
                                    <p class="mb-2"><strong>الرقم المرجعي:</strong> ${booking.booking_reference}</p>
                                    <p class="mb-2"><strong>تاريخ الحجز:</strong> ${booking.booking_date}</p>
                                    <p class="mb-2"><strong>حالة الحجز:</strong> <span class="badge bg-success">مؤكد</span></p>
                                    <p class="mb-2"><strong>حالة الدفع:</strong> <span class="badge ${booking.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}">${booking.payment_status === 'paid' ? 'مدفوع' : 'قيد الانتظار'}</span></p>
                                    <p class="mb-2"><strong>السعر الإجمالي:</strong> <span class="text-primary fw-bold">$${booking.final_price.toFixed(2)}</span></p>
                                </div>
                            </div>
                            
                            ${booking.ancillary_services && booking.ancillary_services.length > 0 ? `
                                <div class="mt-4">
                                    <h6 class="mb-3">الخدمات الإضافية</h6>
                                    <ul class="list-group">
                                        ${booking.ancillary_services.map(service => `
                                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span class="fw-bold">${service.name}</span>
                                                    <p class="text-muted mb-0 small">${service.description}</p>
                                                </div>
                                                <span class="text-primary">$${service.price.toFixed(2)}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        <button type="button" class="btn btn-primary" onclick="window.print()">
                            <i class="fas fa-print me-2"></i> طباعة التذكرة
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة النافذة المنبثقة إلى الصفحة
        document.body.appendChild(modalElement);
        
        // إنشاء كائن النافذة المنبثقة وعرضها
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // إزالة النافذة المنبثقة من الصفحة عند إغلاقها
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
        });
    }
};

// كائن للتعامل مع المصادقة
const AuthHandler = {
    // تهيئة نموذج تسجيل الدخول
    initLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;
        
        // إضافة مستمع حدث لتقديم النموذج
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // جمع بيانات النموذج
            const formData = new FormData(loginForm);
            const credentials = {
                username: formData.get('username'),
                password: formData.get('password')
            };
            
            try {
                // عرض مؤشر التحميل
                UIHandler.showLoader();
                
                // إرسال طلب تسجيل الدخول
                const result = await ApiService.users.login(credentials);
                
                // تخزين معلومات المستخدم في التخزين المحلي
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // عرض رسالة نجاح
                UIHandler.showSuccess('تم تسجيل الدخول بنجاح', 'مرحباً بك في نظام حجز تذاكر الطيران.');
                
                // الانتقال إلى الصفحة الرئيسية بعد ثانيتين
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } catch (error) {
                UIHandler.showError('تعذر تسجيل الدخول', error.message);
            } finally {
                UIHandler.hideLoader();
            }
        });
    },
    
    // تهيئة نموذج التسجيل
    initRegisterForm() {
        const registerForm = document.getElementById('register-form');
        if (!registerForm) return;
        
        // إضافة مستمع حدث لتقديم النموذج
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // جمع بيانات النموذج
            const formData = new FormData(registerForm);
            const userData = {
                username: formData.get('username'),
                password: formData.get('password'),
                email: formData.get('email'),
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                phone: formData.get('phone')
            };
            
            try {
                // عرض مؤشر التحميل
                UIHandler.showLoader();
                
                // إرسال طلب التسجيل
                const result = await ApiService.users.register(userData);
                
                // عرض رسالة نجاح
                UIHandler.showSuccess('تم التسجيل بنجاح', 'يمكنك الآن تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور.');
                
                // الانتقال إلى صفحة تسجيل الدخول بعد ثانيتين
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                UIHandler.showError('تعذر إنشاء الحساب', error.message);
            } finally {
                UIHandler.hideLoader();
            }
        });
    },
    
    // تسجيل خروج المستخدم
    async logout() {
        try {
            // عرض مؤشر التحميل
            UIHandler.showLoader();
            
            // إرسال طلب تسجيل الخروج
            await ApiService.users.logout();
            
            // مسح معلومات المستخدم من التخزين المحلي
            localStorage.removeItem('user');
            
            // الانتقال إلى الصفحة الرئيسية
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            UIHandler.hideLoader();
        }
    },
    
    // التحقق من حالة تسجيل دخول المستخدم
    checkLoginStatus() {
        const user = JSON.parse(localStorage.getItem('user'));
        const authLinks = document.getElementById('auth-links');
        
        if (authLinks) {
            if (user) {
                // عرض اسم المستخدم وروابط الملف الشخصي وتسجيل الخروج
                authLinks.innerHTML = `
                    <div class="dropdown">
                        <button class="btn btn-outline-primary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-user me-1"></i> ${user.first_name || user.username}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li><a class="dropdown-item" href="profile.html">الملف الشخصي</a></li>
                            <li><a class="dropdown-item" href="bookings.html">حجوزاتي</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" id="logout-btn">تسجيل الخروج</a></li>
                        </ul>
                    </div>
                `;
                
                // إضافة مستمع حدث لزر تسجيل الخروج
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (event) => {
                        event.preventDefault();
                        this.logout();
                    });
                }
            } else {
                // عرض روابط تسجيل الدخول والتسجيل
                authLinks.innerHTML = `
                    <a href="login.html" class="btn btn-outline-primary me-2">
                        <i class="fas fa-sign-in-alt me-1"></i> تسجيل الدخول
                    </a>
                    <a href="register.html" class="btn btn-primary">
                        <i class="fas fa-user-plus me-1"></i> التسجيل
                    </a>
                `;
            }
        }
    }
};

// دالة التهيئة الرئيسية
function initApp() {
    // التحقق من حالة تسجيل دخول المستخدم
    AuthHandler.checkLoginStatus();
    
    // تهيئة النماذج حسب الصفحة الحالية
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'index.html':
        case '':
            FormHandler.initSearchForm();
            break;
        
        case 'search-results.html':
            UIHandler.displaySearchResults();
            break;
        
        case 'flight-details.html':
            UIHandler.displayFlightDetails();
            break;
        
        case 'passenger-info.html':
            FormHandler.initPassengerForm();
            break;
        
        case 'ancillary-services.html':
            FormHandler.initAncillaryServicesForm();
            break;
        
        case 'payment.html':
            FormHandler.initPaymentForm();
            break;
        
        case 'confirmation.html':
            UIHandler.displayBookingConfirmation();
            break;
        
        case 'login.html':
            AuthHandler.initLoginForm();
            break;
        
        case 'register.html':
            AuthHandler.initRegisterForm();
            break;
        
        case 'profile.html':
            UIHandler.initUserProfile();
            break;
        
        case 'bookings.html':
            UIHandler.loadUserBookings();
            break;
    }
}

// تنفيذ دالة التهيئة عند اكتمال تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);
