let currentCourse = null;
let currentTutor = null;
let selectedStartDateTime = null;

const orderForm = document.getElementById('order-form');
const submitOrderBtn = document.getElementById('submit-order-btn');

// Открытие модального окна - заполнение данных о курсе и преподавателе
document.getElementById('orderModal')
    .addEventListener('show.bs.modal', async function (event) {
        const button = event.relatedTarget ||
            document.querySelector('[data-bs-target="#orderModal"]');

        if (!button) return;

        const courseId = button.getAttribute('data-course-id');
        const tutorId = button.getAttribute('data-tutor-id');

        try {
            currentCourse = await getCourse(courseId);
            currentTutor = await getTutor(tutorId);

            document.getElementById('order-course-id').value = courseId;
            document.getElementById('order-tutor-id').value = tutorId;
            document.getElementById('order-course-name').value =
                currentCourse.name;
            document.getElementById('order-tutor-name').value =
                currentTutor.name;

            populateStartDates();
            updateDurationInfo();
            calculateTotalPrice();
        } catch (error) {
            console.error('Error loading course/tutor data:', error);
            showNotification('Ошибка загрузки данных', 'error');
        }
    });

// Обработчик закрытия модального окна - очистка backdrop
document.getElementById('orderModal')
    .addEventListener('hidden.bs.modal', function () {
        // Принудительная очистка backdrop и восстановление прокрутки
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    });

// Заполнение списка дат начала курса
function populateStartDates() {
    const dateSelect = document.getElementById('order-start-date');
    dateSelect.innerHTML = '<option value="">Выберите дату</option>';

    if (!currentCourse || !currentCourse.start_dates) return;

    const uniqueDates = [
        ...new Set(currentCourse.start_dates.map(
            dt => dt.split('T')[0]
        ))
    ];

    uniqueDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        const dateObj = new Date(date);
        option.textContent = dateObj.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        dateSelect.appendChild(option);
    });
}

// При выборе даты - заполнить доступные времена
document.getElementById('order-start-date')
    .addEventListener('change', function () {
        const selectedDate = this.value;
        const timeSelect = document.getElementById('order-start-time');

        if (!selectedDate) {
            timeSelect.disabled = true;
            timeSelect.innerHTML =
                '<option value="">Сначала выберите дату</option>';
            return;
        }

        timeSelect.disabled = false;
        timeSelect.innerHTML = '<option value="">Выберите время</option>';

        const timesForDate = currentCourse.start_dates.filter(
            dt => dt.startsWith(selectedDate)
        );

        timesForDate.forEach(dateTime => {
            const time = dateTime.split('T')[1];
            const [hours, minutes] = time.split(':');
            const startTime = `${hours}:${minutes}`;

            const endTime = calculateEndTime(
                startTime,
                currentCourse.week_length
            );

            const option = document.createElement('option');
            option.value = startTime;
            option.textContent = `${startTime} - ${endTime}`;
            timeSelect.appendChild(option);
        });

        calculateTotalPrice();
    });

// При выборе времени
document.getElementById('order-start-time')
    .addEventListener('change', function () {
        const selectedDate =
            document.getElementById('order-start-date').value;
        const selectedTime = this.value;

        if (selectedDate && selectedTime) {
            selectedStartDateTime = `${selectedDate}T${selectedTime}:00`;
        }

        calculateTotalPrice();
    });

// Расчет времени окончания занятия
function calculateEndTime(startTime, weekLength) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + weekLength;
    return `${String(endHours).padStart(2, '0')}:${String(minutes)
        .padStart(2, '0')}`;
}

// Обновление информации о продолжительности
function updateDurationInfo() {
    if (!currentCourse) return;

    const totalWeeks = currentCourse.total_length;
    const weekLength = currentCourse.week_length;

    const selectedDate =
        document.getElementById('order-start-date').value;
    let endDateText = '';

    if (selectedDate) {
        const startDate = new Date(selectedDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (totalWeeks * 7));

        endDateText = `, окончание: ${endDate.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`;
    }

    document.getElementById('order-duration-info').value =
        `${totalWeeks} недель × ${weekLength} час/нед = ` +
        `${totalWeeks * weekLength} часов${endDateText}`;
}

// Обновить дату окончания при выборе даты начала
document.getElementById('order-start-date')
    .addEventListener('change', updateDurationInfo);

// При изменении количества студентов
document.getElementById('order-students-number')
    .addEventListener('input', calculateTotalPrice);

// При изменении чекбоксов
document.querySelectorAll(
    '#order-supplementary, #order-personalized, ' +
    '#order-excursions, #order-assessment, #order-interactive'
).forEach(checkbox => {
    checkbox.addEventListener('change', calculateTotalPrice);
});

// Расчет общей стоимости
function calculateTotalPrice() {
    if (!currentCourse) return;

    const courseFeePerHour = currentCourse.course_fee_per_hour;
    const durationInHours =
        currentCourse.total_length * currentCourse.week_length;
    const studentsNumber = parseInt(
        document.getElementById('order-students-number').value || 1
    );
    const selectedDate =
        document.getElementById('order-start-date').value;
    const selectedTime =
        document.getElementById('order-start-time').value;

    if (!selectedDate || !selectedTime) {
        document.getElementById('order-total-price').textContent = '—';
        document.getElementById('order-price-breakdown').textContent =
            'Выберите дату и время';
        return;
    }

    // Базовая стоимость
    let basePrice = courseFeePerHour * durationInHours;

    // Множитель за выходные/праздники
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getDay();
    const isWeekendOrHoliday = (dayOfWeek === 0 || dayOfWeek === 6)
        ? 1.5 : 1;
    basePrice *= isWeekendOrHoliday;

    // Доплата за утро (9:00-12:00)
    const [hours] = selectedTime.split(':').map(Number);
    const morningSurcharge = (hours >= 9 && hours < 12) ? 400 : 0;

    // Доплата за вечер (18:00-20:00)
    const eveningSurcharge = (hours >= 18 && hours < 20) ? 1000 : 0;

    // Умножаем на количество студентов
    let totalPrice = (basePrice + morningSurcharge + eveningSurcharge) *
        studentsNumber;

    // Проверяем автоматические опции
    const daysUntilStart = Math.floor(
        (dateObj - new Date()) / (1000 * 60 * 60 * 24)
    );
    const isEarlyRegistration = daysUntilStart >= 30;
    const isGroupEnrollment = studentsNumber >= 5;
    const isIntensiveCourse = currentCourse.week_length >= 5;

    // Отображаем автоматические опции
    displayAutomaticOptions(
        isEarlyRegistration,
        isGroupEnrollment,
        isIntensiveCourse
    );

    // Применяем автоматические опции
    if (isIntensiveCourse) {
        totalPrice *= 1.2; // +20%
    }

    // Дополнительные материалы
    if (document.getElementById('order-supplementary').checked) {
        totalPrice += 2000 * studentsNumber;
    }

    // Индивидуальные занятия
    if (document.getElementById('order-personalized').checked) {
        totalPrice += 1500 * currentCourse.total_length;
    }

    // Культурные экскурсии
    if (document.getElementById('order-excursions').checked) {
        totalPrice *= 1.25; // +25%
    }

    // Оценка уровня
    if (document.getElementById('order-assessment').checked) {
        totalPrice += 300;
    }

    // Интерактивная платформа
    if (document.getElementById('order-interactive').checked) {
        totalPrice *= 1.5; // +50%
    }

    // Применяем скидки (применяются после всех надбавок)
    if (isEarlyRegistration) {
        totalPrice *= 0.9; // -10%
    }

    if (isGroupEnrollment) {
        totalPrice *= 0.85; // -15%
    }

    // Отображаем результат
    document.getElementById('order-total-price').textContent =
        `${Math.round(totalPrice).toLocaleString('ru-RU')} ₽`;

    // Детализация
    const breakdown = buildPriceBreakdown(
        courseFeePerHour,
        durationInHours,
        basePrice,
        morningSurcharge,
        eveningSurcharge,
        studentsNumber,
        isWeekendOrHoliday,
        isEarlyRegistration,
        isGroupEnrollment,
        isIntensiveCourse,
        document.getElementById('order-supplementary').checked,
        document.getElementById('order-personalized').checked,
        document.getElementById('order-excursions').checked,
        document.getElementById('order-assessment').checked,
        document.getElementById('order-interactive').checked,
        currentCourse.total_length
    );
    document.getElementById('order-price-breakdown').innerHTML = breakdown;
}

// Отображение автоматических опций
function displayAutomaticOptions(early, group, intensive) {
    const container = document.getElementById('automatic-options');
    let html = '';

    if (early) {
        html += `
            <div class="alert alert-success py-2 mb-2">
                ✓ Скидка за раннюю регистрацию: -10%
            </div>
        `;
    }

    if (group) {
        html += `
            <div class="alert alert-success py-2 mb-2">
                ✓ Скидка за групповую запись: -15%
            </div>
        `;
    }

    if (intensive) {
        html += `
            <div class="alert alert-info py-2 mb-2">
                ℹ Интенсивный курс: +20%
            </div>
        `;
    }

    container.innerHTML = html;
}

// Формирование детализации цены с полным расчётом
function buildPriceBreakdown(
    feePerHour,
    totalHours,
    basePriceAfterWeekend,
    morning,
    evening,
    students,
    weekendMultiplier,
    earlyDiscount,
    groupDiscount,
    intensive,
    supplementary,
    personalized,
    excursions,
    assessment,
    interactive,
    totalWeeks
) {
    let html = '<div class="price-calculation" ' +
        'style="font-size: 0.9em; line-height: 1.6;">';

    // Шаг 1: Базовая стоимость
    const baseBeforeWeekend = feePerHour * totalHours;
    html += `<div><strong>1. Базовая стоимость:</strong></div>`;
    html += `<div class="ms-3">` +
        `${feePerHour}₽/час × ${totalHours}ч = ` +
        `${baseBeforeWeekend.toLocaleString('ru-RU')}₽</div>`;

    // Шаг 2: Множитель за выходные
    if (weekendMultiplier > 1) {
        html += `<div class="mt-2"><strong>2. Выходной день:</strong></div>`;
        html += `<div class="ms-3">` +
            `${baseBeforeWeekend.toLocaleString('ru-RU')}₽ × 1.5 = ` +
            `${basePriceAfterWeekend.toLocaleString('ru-RU')}₽</div>`;
    } else {
        html += `<div class="mt-2"><strong>2. Будний день:</strong> ` +
            `множитель 1</div>`;
    }

    // Шаг 3: Доплаты за время
    let currentPrice = basePriceAfterWeekend;
    if (morning > 0 || evening > 0) {
        html += `<div class="mt-2">` +
            `<strong>3. Доплаты за время:</strong></div>`;
        if (morning > 0) {
            html += `<div class="ms-3">Утро (9:00-12:00): +${morning}₽</div>`;
        }
        if (evening > 0) {
            html += `<div class="ms-3">` +
                `Вечер (18:00-20:00): +${evening}₽</div>`;
        }
    }

    // Шаг 4: Умножение на количество студентов
    const beforeStudents = currentPrice + morning + evening;
    html += `<div class="mt-2">` +
        `<strong>4. На количество студентов:</strong></div>`;
    html += `<div class="ms-3">` +
        `(${basePriceAfterWeekend.toLocaleString('ru-RU')}₽`;
    if (morning > 0) html += ` + ${morning}₽`;
    if (evening > 0) html += ` + ${evening}₽`;
    html += `) × ${students} = ` +
        `${(beforeStudents * students).toLocaleString('ru-RU')}₽</div>`;

    currentPrice = beforeStudents * students;

    // Шаг 5: Автоматические надбавки
    if (intensive) {
        html += `<div class="mt-2">` +
            `<strong>5. Интенсивный курс:</strong> +20%</div>`;
        const after = currentPrice * 1.2;
        html += `<div class="ms-3">` +
            `${currentPrice.toLocaleString('ru-RU')}₽ × 1.2 = ` +
            `${Math.round(after).toLocaleString('ru-RU')}₽</div>`;
        currentPrice = after;
    }

    // Шаг 6: Дополнительные опции
    let hasOptions = false;
    let optionsStep = intensive ? 6 : 5;

    if (supplementary) {
        if (!hasOptions) {
            html += `<div class="mt-2">` +
                `<strong>${optionsStep}. Доп. опции:</strong></div>`;
            hasOptions = true;
        }
        const amount = 2000 * students;
        html += `<div class="ms-3">` +
            `Учебные материалы: +${amount.toLocaleString('ru-RU')}₽</div>`;
        currentPrice += amount;
    }

    if (personalized) {
        if (!hasOptions) {
            html += `<div class="mt-2">` +
                `<strong>${optionsStep}. Доп. опции:</strong></div>`;
            hasOptions = true;
        }
        const amount = 1500 * totalWeeks;
        html += `<div class="ms-3">` +
            `Индивид. занятия: +${amount.toLocaleString('ru-RU')}₽</div>`;
        currentPrice += amount;
    }

    if (excursions) {
        if (!hasOptions) {
            html += `<div class="mt-2">` +
                `<strong>${optionsStep}. Доп. опции:</strong></div>`;
            hasOptions = true;
        }
        const before = currentPrice;
        currentPrice *= 1.25;
        html += `<div class="ms-3">` +
            `Экскурсии: +25% ` +
            `(${Math.round(currentPrice - before).toLocaleString('ru-RU')}₽)` +
            `</div>`;
    }

    if (assessment) {
        if (!hasOptions) {
            html += `<div class="mt-2">` +
                `<strong>${optionsStep}. Доп. опции:</strong></div>`;
            hasOptions = true;
        }
        html += `<div class="ms-3">Оценка уровня: +300₽</div>`;
        currentPrice += 300;
    }

    if (interactive) {
        if (!hasOptions) {
            html += `<div class="mt-2">` +
                `<strong>${optionsStep}. Доп. опции:</strong></div>`;
            hasOptions = true;
        }
        const before = currentPrice;
        currentPrice *= 1.5;
        html += `<div class="ms-3">` +
            `Интер. платформа: +50% ` +
            `(${Math.round(currentPrice - before).toLocaleString('ru-RU')}₽)` +
            `</div>`;
    }

    // Шаг 7: Скидки (применяются последними)
    if (earlyDiscount || groupDiscount) {
        let discountStep = optionsStep + (hasOptions ? 1 : 0);
        html += `<div class="mt-2">` +
            `<strong>${discountStep}. Скидки:</strong></div>`;

        if (earlyDiscount) {
            const before = currentPrice;
            currentPrice *= 0.9;
            html += `<div class="ms-3">` +
                `Ранняя регистрация: -10% ` +
                `(-${Math.round(before - currentPrice)
                    .toLocaleString('ru-RU')}₽)</div>`;
        }

        if (groupDiscount) {
            const before = currentPrice;
            currentPrice *= 0.85;
            html += `<div class="ms-3">` +
                `Групповая запись: -15% ` +
                `(-${Math.round(before - currentPrice)
                    .toLocaleString('ru-RU')}₽)</div>`;
        }
    }

    html += '</div>';

    return html;
}

// Валидация формы
function validateOrderForm() {
    const studentsNumber = parseInt(
        document.getElementById('order-students-number').value
    );
    const selectedDate =
        document.getElementById('order-start-date').value;
    const selectedTime =
        document.getElementById('order-start-time').value;

    const errors = [];

    if (!selectedDate) {
        errors.push('Выберите дату начала курса');
    }

    if (!selectedTime) {
        errors.push('Выберите время занятий');
    }

    if (!studentsNumber || studentsNumber < 1 || studentsNumber > 20) {
        errors.push('Количество студентов должно быть от 1 до 20');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Сброс формы
function resetOrderForm() {
    orderForm.reset();
    document.getElementById('order-start-time').disabled = true;
    document.getElementById('order-start-time').innerHTML =
        '<option value="">Сначала выберите дату</option>';
    document.getElementById('order-total-price').textContent = '0 ₽';
    document.getElementById('order-price-breakdown').textContent = '';
    document.getElementById('automatic-options').innerHTML = '';
    currentCourse = null;
    currentTutor = null;
    selectedStartDateTime = null;
}

// Отправка заявки
submitOrderBtn.addEventListener('click', async function () {
    const validation = validateOrderForm();

    if (!validation.isValid) {
        showNotification(validation.errors.join('<br>'), 'error');
        return;
    }

    await submitOrder();
});

async function submitOrder() {
    const courseId = parseInt(
        document.getElementById('order-course-id').value
    );
    const tutorId = parseInt(
        document.getElementById('order-tutor-id').value
    );
    const selectedDate =
        document.getElementById('order-start-date').value;
    const selectedTime =
        document.getElementById('order-start-time').value;
    const studentsNumber = parseInt(
        document.getElementById('order-students-number').value
    );

    // Вычисляем финальную цену
    const priceText = document.getElementById('order-total-price')
        .textContent;
    const price = parseInt(priceText.replace(/[^\d]/g, ''));

    // Вычисляем продолжительность
    const duration = currentCourse.total_length *
        currentCourse.week_length;

    // Вычисляем автоматические опции
    const dateObj = new Date(selectedDate);
    const daysUntilStart = Math.floor(
        (dateObj - new Date()) / (1000 * 60 * 60 * 24)
    );
    const isEarlyRegistration = daysUntilStart >= 30;
    const isGroupEnrollment = studentsNumber >= 5;
    const isIntensiveCourse = currentCourse.week_length >= 5;

    submitOrderBtn.disabled = true;
    submitOrderBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm"></span> ' +
        'Отправка...';

    try {
        const orderData = {
            course_id: courseId,
            tutor_id: tutorId,
            date_start: selectedDate,
            time_start: selectedTime + ':00',
            duration: duration,
            price: price,
            persons: studentsNumber,
            early_registration: isEarlyRegistration ? 1 : 0,
            group_enrollment: isGroupEnrollment ? 1 : 0,
            intensive_course: isIntensiveCourse ? 1 : 0,
            supplementary: document.getElementById(
                'order-supplementary'
            ).checked ? 1 : 0,
            personalized: document.getElementById(
                'order-personalized'
            ).checked ? 1 : 0,
            excursions: document.getElementById(
                'order-excursions'
            ).checked ? 1 : 0,
            assessment: document.getElementById(
                'order-assessment'
            ).checked ? 1 : 0,
            interactive: document.getElementById(
                'order-interactive'
            ).checked ? 1 : 0
        };

        console.log('Submitting order:', orderData);

        const result = await createOrder(orderData);

        console.log('Order created:', result);

        showNotification(
            'Заявка успешно отправлена! ' +
            'Вы можете просмотреть её в личном кабинете.',
            'success'
        );

        resetOrderForm();

        const modal = bootstrap.Modal.getInstance(
            document.getElementById('orderModal')
        );
        modal.hide();

    } catch (error) {
        console.error('Error submitting order:', error);
        showNotification(
            'Ошибка при отправке заявки: ' + error.message,
            'error'
        );
    } finally {
        submitOrderBtn.disabled = false;
        submitOrderBtn.textContent = 'Отправить заявку';
    }
}

// Уведомления
function showNotification(message, type = 'info') {
    let notificationArea = document.getElementById('notification-area');

    if (!notificationArea) {
        notificationArea = document.createElement('div');
        notificationArea.id = 'notification-area';
        notificationArea.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(notificationArea);
    }

    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' :
            type === 'success' ? 'success' : 'info'
        } alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" 
                data-bs-dismiss="alert"></button>
    `;

    notificationArea.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 150);
    }, 5000);
}
