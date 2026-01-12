// Логика редактирования заявки с динамическим расчётом стоимости
// Аналогична логике создания заявки

let editCurrentCourse = null;
let editCurrentTutor = null;
let editCurrentOrder = null;

async function editOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Заявка не найдена', 'error');
        return;
    }

    currentEditOrderId = orderId;
    editCurrentOrder = order;

    try {
        // Загружаем полные данные курса и репетитора
        editCurrentCourse = await getCourse(order.course_id);
        editCurrentTutor = await getTutor(order.tutor_id);

        // Заполняем нередактируемые поля
        document.getElementById('edit-order-id').value = order.id;
        document.getElementById('edit-course-id').value = order.course_id;
        document.getElementById('edit-tutor-id').value = order.tutor_id;
        document.getElementById('edit-course-name').value = 
            editCurrentCourse.name;
        document.getElementById('edit-tutor-name').value = 
            editCurrentTutor.name;

        // Заполняем списки дат и времён
        populateEditStartDates();
        
        // Устанавливаем текущую дату
        document.getElementById('edit-start-date').value = order.date_start;
        
        // Триггерим событие для заполнения времён
        document.getElementById('edit-start-date')
            .dispatchEvent(new Event('change'));
        
        // Устанавливаем текущее время (убираем секунды)
        const timeWithoutSeconds = order.time_start.substring(0, 5);
        document.getElementById('edit-start-time').value = 
            timeWithoutSeconds;
        
        // Триггерим событие для обновления расчётов
        document.getElementById('edit-start-time')
            .dispatchEvent(new Event('change'));
        
        // Заполняем количество студентов
        document.getElementById('edit-students-number').value = order.persons;
        
        // Заполняем чекбоксы
        document.getElementById('edit-supplementary').checked = 
            Boolean(order.supplementary);
        document.getElementById('edit-personalized').checked = 
            Boolean(order.personalized);
        document.getElementById('edit-excursions').checked = 
            Boolean(order.excursions);
        document.getElementById('edit-assessment').checked = 
            Boolean(order.assessment);
        document.getElementById('edit-interactive').checked = 
            Boolean(order.interactive);

        // Обновляем инфо о продолжительности и цену
        updateEditDurationInfo();
        calculateEditTotalPrice();

        const modal = new bootstrap.Modal(
            document.getElementById('editOrderModal')
        );
        modal.show();
    } catch (error) {
        console.error('Error loading order for edit:', error);
        showNotification('Ошибка при загрузке данных заявки', 'error');
    }
}

function populateEditStartDates() {
    const dateSelect = document.getElementById('edit-start-date');
    dateSelect.innerHTML = '<option value="">Выберите дату</option>';

    if (!editCurrentCourse || !editCurrentCourse.start_dates) return;

    const uniqueDates = [
        ...new Set(editCurrentCourse.start_dates.map(
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

function calculateEndTime(startTime, weekLength) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + weekLength;
    return `${String(endHours).padStart(2, '0')}:${String(minutes)
        .padStart(2, '0')}`;
}

function updateEditDurationInfo() {
    if (!editCurrentCourse) return;

    const totalWeeks = editCurrentCourse.total_length;
    const weekLength = editCurrentCourse.week_length;
    
    const selectedDate =
        document.getElementById('edit-start-date').value;
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

    document.getElementById('edit-duration-info').value = 
        `${totalWeeks} недель × ${weekLength} час/нед = ` +
        `${totalWeeks * weekLength} часов${endDateText}`;
}

function calculateEditTotalPrice() {
    if (!editCurrentCourse) return;

    const courseFeePerHour = editCurrentCourse.course_fee_per_hour;
    const durationInHours =
        editCurrentCourse.total_length * editCurrentCourse.week_length;
    const studentsNumber = parseInt(
        document.getElementById('edit-students-number').value || 1
    );
    const selectedDate =
        document.getElementById('edit-start-date').value;
    const selectedTime =
        document.getElementById('edit-start-time').value;

    if (!selectedDate || !selectedTime) {
        document.getElementById('edit-total-price').textContent = '—';
        document.getElementById('edit-price-breakdown').textContent = 
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
    const isIntensiveCourse = editCurrentCourse.week_length >= 5;

    // Отображаем автоматические опции
    displayEditAutomaticOptions(
        isEarlyRegistration,
        isGroupEnrollment,
        isIntensiveCourse
    );

    // Применяем автоматические опции
    if (isIntensiveCourse) {
        totalPrice *= 1.2; // +20%
    }

    // Дополнительные материалы
    if (document.getElementById('edit-supplementary').checked) {
        totalPrice += 2000 * studentsNumber;
    }

    // Индивидуальные занятия
    if (document.getElementById('edit-personalized').checked) {
        totalPrice += 1500 * editCurrentCourse.total_length;
    }

    // Культурные экскурсии
    if (document.getElementById('edit-excursions').checked) {
        totalPrice *= 1.25; // +25%
    }

    // Оценка уровня
    if (document.getElementById('edit-assessment').checked) {
        totalPrice += 300;
    }

    // Интерактивная платформа
    if (document.getElementById('edit-interactive').checked) {
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
    document.getElementById('edit-total-price').textContent = 
        `${Math.round(totalPrice).toLocaleString('ru-RU')} ₽`;

    // Детализация
    const breakdown = buildEditPriceBreakdown(
        basePrice,
        morningSurcharge,
        eveningSurcharge,
        studentsNumber,
        isWeekendOrHoliday,
        isEarlyRegistration,
        isGroupEnrollment,
        isIntensiveCourse
    );
    document.getElementById('edit-price-breakdown').innerHTML = breakdown;
}

function displayEditAutomaticOptions(early, group, intensive) {
    const container = document.getElementById('edit-automatic-options');
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

function buildEditPriceBreakdown(
    base,
    morning,
    evening,
    students,
    isWeekend,
    earlyDiscount,
    groupDiscount,
    intensive
) {
    const parts = [];

    if (isWeekend > 1) {
        parts.push('выходной день');
    }
    if (morning > 0) {
        parts.push('утреннее время');
    }
    if (evening > 0) {
        parts.push('вечернее время');
    }
    if (students > 1) {
        parts.push(`${students} студентов`);
    }

    let text = parts.length > 0 ? parts.join(', ') : 'базовая цена';
    
    return `Учтены: ${text}`;
}

// Event Listeners для формы редактирования
document.getElementById('edit-start-date')
    .addEventListener('change', function () {
        const selectedDate = this.value;
        const timeSelect = document.getElementById('edit-start-time');

        if (!selectedDate) {
            timeSelect.disabled = true;
            timeSelect.innerHTML =
                '<option value="">Сначала выберите дату</option>';
            return;
        }

        timeSelect.disabled = false;
        timeSelect.innerHTML = '<option value="">Выберите время</option>';

        const timesForDate = editCurrentCourse.start_dates.filter(
            dt => dt.startsWith(selectedDate)
        );

        timesForDate.forEach(dateTime => {
            const time = dateTime.split('T')[1];
            const [hours, minutes] = time.split(':');
            const startTime = `${hours}:${minutes}`;

            const endTime = calculateEndTime(
                startTime,
                editCurrentCourse.week_length
            );

            const option = document.createElement('option');
            option.value = startTime;
            option.textContent = `${startTime} - ${endTime}`;
            timeSelect.appendChild(option);
        });

        updateEditDurationInfo();
        calculateEditTotalPrice();
    });

document.getElementById('edit-start-time')
    .addEventListener('change', calculateEditTotalPrice);

document.getElementById('edit-students-number')
    .addEventListener('input', calculateEditTotalPrice);

document.querySelectorAll(
    '#edit-supplementary, #edit-personalized, ' +
    '#edit-excursions, #edit-assessment, #edit-interactive'
).forEach(checkbox => {
    checkbox.addEventListener('change', calculateEditTotalPrice);
});

async function saveEditedOrder() {
    if (!currentEditOrderId) return;

    const selectedDate =
        document.getElementById('edit-start-date').value;
    const selectedTime =
        document.getElementById('edit-start-time').value;
    const studentsNumber = parseInt(
        document.getElementById('edit-students-number').value
    );

    if (!selectedDate || !selectedTime || !studentsNumber) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }

    // Вычисляем финальную цену
    const priceText = document.getElementById('edit-total-price')
        .textContent;
    const price = parseInt(priceText.replace(/[^\d]/g, ''));

    // Вычисляем продолжительность
    const duration = editCurrentCourse.total_length *
        editCurrentCourse.week_length;

    // Вычисляем автоматические опции
    const dateObj = new Date(selectedDate);
    const daysUntilStart = Math.floor(
        (dateObj - new Date()) / (1000 * 60 * 60 * 24)
    );
    const isEarlyRegistration = daysUntilStart >= 30;
    const isGroupEnrollment = studentsNumber >= 5;
    const isIntensiveCourse = editCurrentCourse.week_length >= 5;

    try {
        const orderData = {
            date_start: selectedDate,
            time_start: selectedTime + ':00',
            duration: duration,
            price: price,
            persons: studentsNumber,
            early_registration: isEarlyRegistration ? 1 : 0,
            group_enrollment: isGroupEnrollment ? 1 : 0,
            intensive_course: isIntensiveCourse ? 1 : 0,
            supplementary: document.getElementById(
                'edit-supplementary'
            ).checked ? 1 : 0,
            personalized: document.getElementById(
                'edit-personalized'
            ).checked ? 1 : 0,
            excursions: document.getElementById(
                'edit-excursions'
            ).checked ? 1 : 0,
            assessment: document.getElementById(
                'edit-assessment'
            ).checked ? 1 : 0,
            interactive: document.getElementById(
                'edit-interactive'
            ).checked ? 1 : 0
        };

        await updateOrder(currentEditOrderId, orderData);
        showNotification('Заявка успешно обновлена', 'success');

        const modal = bootstrap.Modal.getInstance(
            document.getElementById('editOrderModal')
        );
        modal.hide();

        await loadOrders();
    } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Ошибка при обновлении заявки', 'error');
    }
}

// Event listener для кнопки сохранения
document.getElementById('save-order-btn')
    .addEventListener('click', saveEditedOrder);
