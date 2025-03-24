// نظام حجز تذاكر الطيران - ملف JavaScript للتكامل مع الخلفية

// استيراد ملف التطبيق الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    // تحميل ملف JavaScript الرئيسي
    const script = document.createElement('script');
    script.src = 'js/app.js';
    document.head.appendChild(script);
    
    // تهيئة الصفحة بعد تحميل الملف
    script.onload = function() {
        // تنفيذ دالة التهيئة
        initApp();
        
        // إضافة مستمعات الأحداث للعناصر التفاعلية
        setupEventListeners();
    };
});

// إعداد مستمعات الأحداث للعناصر التفاعلية
function setupEventListeners() {
    // مستمع حدث لتبديل عرض حقل تاريخ العودة في نموذج البحث
    const tripTypeRadios = document.querySelectorAll('input[name="trip_type"]');
    const returnDateField = document.getElementById('return_date_field');
    
    if (tripTypeRadios.length > 0 && returnDateField) {
        tripTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'round_trip') {
                    returnDateField.classList.remove('d-none');
                } else {
                    returnDateField.classList.add('d-none');
                }
            });
        });
    }
    
    // مستمع حدث لفلاتر نتائج البحث
    setupSearchFilters();
    
    // مستمع حدث للتبديل بين علامات التبويب في صفحة الملف الشخصي
    const profileTabs = document.querySelectorAll('button[data-bs-toggle="tab"]');
    if (profileTabs.length > 0) {
        profileTabs.forEach(tab => {
            tab.addEventListener('shown.bs.tab', function(event) {
                // تحديث المحتوى عند تبديل علامة التبويب
                const targetId = event.target.getAttribute('data-bs-target');
                if (targetId === '#bookings-tab-pane') {
                    UIHandler.loadUserBookings();
                }
            });
        });
    }
}

// إعداد فلاتر نتائج البحث
function setupSearchFilters() {
    const filterForm = document.getElementById('search-filters-form');
    if (!filterForm) return;
    
    // الحصول على نتائج البحث من التخزين المحلي
    const searchResults = JSON.parse(localStorage.getItem('searchResults'));
    if (!searchResults) return;
    
    // إعداد فلتر شركات الطيران
    setupAirlineFilter(searchResults);
    
    // إعداد فلتر نطاق السعر
    setupPriceRangeFilter(searchResults);
    
    // إعداد فلتر وقت المغادرة
    setupDepartureTimeFilter();
    
    // إضافة مستمع حدث لتقديم نموذج الفلاتر
    filterForm.addEventListener('submit', function(event) {
        event.preventDefault();
        applyFilters(searchResults);
    });
    
    // إضافة مستمع حدث لإعادة تعيين الفلاتر
    const resetButton = document.getElementById('reset-filters-btn');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            filterForm.reset();
            // إعادة عرض جميع النتائج
            displayFilteredResults(searchResults.outbound_flights, 'outbound-flights');
            if (searchResults.return_flights) {
                displayFilteredResults(searchResults.return_flights, 'return-flights');
            }
        });
    }
}

// إعداد فلتر شركات الطيران
function setupAirlineFilter(searchResults) {
    const airlinesContainer = document.getElementById('airlines-filter');
    if (!airlinesContainer) return;
    
    // استخراج شركات الطيران الفريدة من نتائج البحث
    const airlines = new Set();
    searchResults.outbound_flights.forEach(flight => {
        airlines.add(flight.airline_id);
    });
    
    if (searchResults.return_flights) {
        searchResults.return_flights.forEach(flight => {
            airlines.add(flight.airline_id);
        });
    }
    
    // إنشاء خيارات الفلتر
    airlinesContainer.innerHTML = '';
    airlines.forEach(airlineId => {
        // الحصول على معلومات شركة الطيران من أول رحلة تطابق المعرف
        const airlineInfo = searchResults.outbound_flights.find(flight => flight.airline_id == airlineId) || 
                           (searchResults.return_flights ? searchResults.return_flights.find(flight => flight.airline_id == airlineId) : null);
        
        if (airlineInfo) {
            const airlineOption = document.createElement('div');
            airlineOption.className = 'form-check';
            airlineOption.innerHTML = `
                <input class="form-check-input" type="checkbox" name="airline" id="airline_${airlineId}" value="${airlineId}" checked>
                <label class="form-check-label d-flex align-items-center" for="airline_${airlineId}">
                    <img src="images/airlines/${airlineInfo.airline_logo}" alt="${airlineInfo.airline_name}" class="me-2" width="20">
                    ${airlineInfo.airline_name}
                </label>
            `;
            airlinesContainer.appendChild(airlineOption);
        }
    });
}

// إعداد فلتر نطاق السعر
function setupPriceRangeFilter(searchResults) {
    const priceRangeContainer = document.getElementById('price-range-container');
    if (!priceRangeContainer) return;
    
    // استخراج أدنى وأعلى سعر من نتائج البحث
    let minPrice = Number.MAX_VALUE;
    let maxPrice = 0;
    
    searchResults.outbound_flights.forEach(flight => {
        if (flight.price_per_passenger < minPrice) {
            minPrice = flight.price_per_passenger;
        }
        if (flight.price_per_passenger > maxPrice) {
            maxPrice = flight.price_per_passenger;
        }
    });
    
    if (searchResults.return_flights) {
        searchResults.return_flights.forEach(flight => {
            if (flight.price_per_passenger < minPrice) {
                minPrice = flight.price_per_passenger;
            }
            if (flight.price_per_passenger > maxPrice) {
                maxPrice = flight.price_per_passenger;
            }
        });
    }
    
    // تقريب الأسعار
    minPrice = Math.floor(minPrice / 100) * 100;
    maxPrice = Math.ceil(maxPrice / 100) * 100;
    
    // إنشاء عناصر نطاق السعر
    const priceSlider = document.getElementById('price-range');
    const minPriceDisplay = document.getElementById('min-price-display');
    const maxPriceDisplay = document.getElementById('max-price-display');
    
    if (priceSlider && minPriceDisplay && maxPriceDisplay) {
        // تعيين قيم النطاق
        priceSlider.setAttribute('min', minPrice);
        priceSlider.setAttribute('max', maxPrice);
        priceSlider.setAttribute('value', maxPrice);
        
        // تحديث عرض السعر
        minPriceDisplay.textContent = `$${minPrice}`;
        maxPriceDisplay.textContent = `$${maxPrice}`;
        
        // إضافة مستمع حدث لتغيير النطاق
        priceSlider.addEventListener('input', function() {
            maxPriceDisplay.textContent = `$${this.value}`;
        });
    }
}

// إعداد فلتر وقت المغادرة
function setupDepartureTimeFilter() {
    const departureTimeContainer = document.getElementById('departure-time-filter');
    if (!departureTimeContainer) return;
    
    // إنشاء خيارات وقت المغادرة
    const timeRanges = [
        { id: 'morning', label: 'صباحاً (00:00 - 11:59)', start: '00:00', end: '11:59' },
        { id: 'afternoon', label: 'ظهراً (12:00 - 17:59)', start: '12:00', end: '17:59' },
        { id: 'evening', label: 'مساءً (18:00 - 23:59)', start: '18:00', end: '23:59' }
    ];
    
    departureTimeContainer.innerHTML = '';
    timeRanges.forEach(range => {
        const timeOption = document.createElement('div');
        timeOption.className = 'form-check';
        timeOption.innerHTML = `
            <input class="form-check-input" type="checkbox" name="departure_time" id="${range.id}" value="${range.id}" checked>
            <label class="form-check-label" for="${range.id}">
                ${range.label}
            </label>
        `;
        departureTimeContainer.appendChild(timeOption);
    });
}

// تطبيق الفلاتر على نتائج البحث
function applyFilters(searchResults) {
    // الحصول على قيم الفلاتر
    const selectedAirlines = Array.from(document.querySelectorAll('input[name="airline"]:checked')).map(input => input.value);
    const maxPrice = document.getElementById('price-range').value;
    const selectedTimes = Array.from(document.querySelectorAll('input[name="departure_time"]:checked')).map(input => input.value);
    
    // تصفية رحلات الذهاب
    const filteredOutbound = searchResults.outbound_flights.filter(flight => {
        // فلتر شركة الطيران
        if (!selectedAirlines.includes(flight.airline_id.toString())) {
            return false;
        }
        
        // فلتر السعر
        if (flight.price_per_passenger > maxPrice) {
            return false;
        }
        
        // فلتر وقت المغادرة
        const departureHour = parseInt(flight.departure_time.split(':')[0]);
        const isMorning = departureHour >= 0 && departureHour < 12;
        const isAfternoon = departureHour >= 12 && departureHour < 18;
        const isEvening = departureHour >= 18 && departureHour < 24;
        
        if (
            (isMorning && !selectedTimes.includes('morning')) ||
            (isAfternoon && !selectedTimes.includes('afternoon')) ||
            (isEvening && !selectedTimes.includes('evening'))
        ) {
            return false;
        }
        
        return true;
    });
    
    // عرض رحلات الذهاب المصفاة
    displayFilteredResults(filteredOutbound, 'outbound-flights');
    
    // تصفية رحلات العودة إذا كانت موجودة
    if (searchResults.return_flights) {
        const filteredReturn = searchResults.return_flights.filter(flight => {
            // فلتر شركة الطيران
            if (!selectedAirlines.includes(flight.airline_id.toString())) {
                return false;
            }
            
            // فلتر السعر
            if (flight.price_per_passenger > maxPrice) {
                return false;
            }
            
            // فلتر وقت المغادرة
            const departureHour = parseInt(flight.departure_time.split(':')[0]);
            const isMorning = departureHour >= 0 && departureHour < 12;
            const isAfternoon = departureHour >= 12 && departureHour < 18;
            const isEvening = departureHour >= 18 && departureHour < 24;
            
            if (
                (isMorning && !selectedTimes.includes('morning')) ||
                (isAfternoon && !selectedTimes.includes('afternoon')) ||
                (isEvening && !selectedTimes.includes('evening'))
            ) {
                return false;
            }
            
            return true;
        });
        
        // عرض رحلات العودة المصفاة
        displayFilteredResults(filteredReturn, 'return-flights');
    }
}

// عرض نتائج البحث المصفاة
function displayFilteredResults(flights, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (flights.length === 0) {
        container.innerHTML = '<div class="alert alert-info">لا توجد رحلات تطابق معايير البحث المحددة.</div>';
        return;
    }
    
    container.innerHTML = '';
    
    flights.forEach(flight => {
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
                        <button class="btn btn-primary w-100 select-flight-btn" data-flight-id="${flight.id}" data-class-id="${flight.travel_class_id}" data-date="${flight.flight_date}">
                            اختيار
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(flightCard);
    });
    
    // إضافة مستمعي أحداث لأزرار اختيار الرحلة
    const selectButtons = container.querySelectorAll('.select-flight-btn');
    selectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const flightId = button.getAttribute('data-flight-id');
            const classId = button.getAttribute('data-class-id');
            const date = button.getAttribute('data-date');
            
            // تخزين معلومات الرحلة المختارة
            if (containerId === 'outbound-flights') {
                localStorage.setItem('selectedFlightId', flightId);
                localStorage.setItem('selectedClassId', classId);
                localStorage.setItem('departureDate', date);
            } else {
                localStorage.setItem('selectedReturnFlightId', flightId);
                localStorage.setItem('selectedReturnClassId', classId);
                localStorage.setItem('returnDate', date);
            }
            
            // الانتقال إلى صفحة تفاصيل الرحلة
            window.location.href = 'flight-details.html';
        });
    });
}
