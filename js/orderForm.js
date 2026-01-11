const orderForm = document.getElementById('order-form');
const submitOrderBtn = document.getElementById('submit-order-btn');

function validateOrderForm() {
    const fullName = document.getElementById('order-full-name')
        .value.trim();
    const email = document.getElementById('order-email').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const date = document.getElementById('order-date').value;
    const time = document.getElementById('order-time').value;

    const errors = [];

    if (!fullName || fullName.length < 2) {
        errors.push('Введите корректное ФИО (минимум 2 символа)');
        highlightField('order-full-name', false);
    } else {
        highlightField('order-full-name', true);
    }

    if (!validateEmail(email)) {
        errors.push('Введите корректный email');
        highlightField('order-email', false);
    } else {
        highlightField('order-email', true);
    }

    if (!validatePhone(phone)) {
        errors.push(
            'Введите корректный телефон (формат: +7XXXXXXXXXX)'
        );
        highlightField('order-phone', false);
    } else {
        highlightField('order-phone', true);
    }

    if (!date) {
        errors.push('Выберите дату занятия');
        highlightField('order-date', false);
    } else {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            errors.push('Дата занятия не может быть в прошлом');
            highlightField('order-date', false);
        } else {
            highlightField('order-date', true);
        }
    }

    if (!time) {
        errors.push('Выберите время занятия');
        highlightField('order-time', false);
    } else {
        const timeValue = parseInt(time.split(':')[0]);
        if (timeValue < 8 || timeValue >= 22) {
            errors.push('Время занятия должно быть с 08:00 до 22:00');
            highlightField('order-time', false);
        } else {
            highlightField('order-time', true);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^\+?[78][\d]{10}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function highlightField(fieldId, isValid) {
    const field = document.getElementById(fieldId);
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
    }
}

function clearFormValidation() {
    const fields = [
        'order-full-name',
        'order-email',
        'order-phone',
        'order-date',
        'order-time'
    ];

    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.classList.remove('is-valid', 'is-invalid');
    });
}

function resetOrderForm() {
    orderForm.reset();
    clearFormValidation();
}

orderForm.addEventListener('input', function (e) {
    if (e.target.classList.contains('is-invalid')) {
        validateOrderForm();
    }
});

submitOrderBtn.addEventListener('click', async function () {
    const validation = validateOrderForm();

    if (!validation.isValid) {
        showNotification(validation.errors.join('<br>'), 'error');
        return;
    }

    await submitOrder();
});

async function submitOrder() {
    const courseId = document.getElementById('order-course-id').value;
    const tutorId = document.getElementById('order-tutor-id').value;
    const fullName = document.getElementById('order-full-name')
        .value.trim();
    const email = document.getElementById('order-email').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const date = document.getElementById('order-date').value;
    const time = document.getElementById('order-time').value;
    const comment = document.getElementById('order-comment').value.trim();

    submitOrderBtn.disabled = true;
    submitOrderBtn.textContent = 'Отправка...';

    try {
        const orderData = {
            course_id: parseInt(courseId),
            tutor_id: parseInt(tutorId),
            full_name: fullName,
            email: email,
            phone: phone,
            lesson_date: date,
            lesson_time: time,
            comment: comment || null
        };

        console.log('Submitting order:', orderData);

        const result = await createOrder(orderData);

        console.log('Order created:', result);

        showNotification('Заявка успешно отправлена!', 'success');

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

function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notification-area');

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;

    notificationArea.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

