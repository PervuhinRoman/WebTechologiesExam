let allOrders = [];
let filteredOrders = [];
let currentEditOrderId = null;
let currentDeleteOrderId = null;
let allCoursesCache = [];
let allTutorsCache = [];

async function loadOrders() {
    const ordersContainer = document.getElementById('orders-container');
    const loadingSpinner = document.getElementById('orders-loading');

    try {
        loadingSpinner.style.display = 'block';
        ordersContainer.innerHTML = '';

        console.log('Loading orders...');

        // Загружаем все данные параллельно
        const [orders, courses, tutors] = await Promise.all([
            getOrders(),
            getCourses(),
            getTutors()
        ]);

        allOrders = orders;
        allCoursesCache = courses;
        allTutorsCache = tutors;

        console.log('Orders loaded:', allOrders);

        filteredOrders = [...allOrders];
        displayOrders();

        loadingSpinner.style.display = 'none';
    } catch (error) {
        loadingSpinner.style.display = 'none';
        ordersContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Ошибка при загрузке заявок: ${error.message}
            </div>
        `;
        console.error('Error loading orders:', error);
    }
}

function displayOrders() {
    const ordersContainer = document.getElementById('orders-container');

    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <p>У вас пока нет заявок</p>
                <a href="index.html#courses" class="btn btn-primary">
                    Выбрать курс
                </a>
            </div>
        `;
        return;
    }

    ordersContainer.innerHTML = filteredOrders.map((order, index) => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-number">Заявка #${index + 1}</span>
                <span class="order-date">
                    ${formatDate(order.created_at || new Date())}
                </span>
            </div>
            <div class="order-body">
                <div class="order-info">
                    <div class="info-row">
                        <strong>Курс:</strong> 
                        ${getCourseNameById(order.course_id)}
                    </div>
                    <div class="info-row">
                        <strong>Репетитор:</strong> 
                        ${getTutorNameById(order.tutor_id)}
                    </div>
                    <div class="info-row">
                        <strong>Дата начала:</strong> 
                        ${order.date_start} в ${order.time_start}
                    </div>
                    <div class="info-row">
                        <strong>Продолжительность:</strong> 
                        ${order.duration} часов
                    </div>
                    <div class="info-row">
                        <strong>Стоимость:</strong> 
                        ${order.price} ₽
                    </div>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-sm btn-outline-primary" 
                        onclick="viewOrderDetails(${order.id})">
                    👁️ Подробнее
                </button>
                <button class="btn btn-sm btn-outline-warning" 
                        onclick="editOrder(${order.id})">
                    ✏️ Редактировать
                </button>
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="confirmDeleteOrder(${order.id})">
                    🗑️ Удалить
                </button>
            </div>
        </div>
    `).join('');
}

function getCourseNameById(courseId) {
    if (courseId === 0) return 'Не указан';
    const course = allCoursesCache.find(c => c.id === courseId);
    return course ? course.name : 'Неизвестный курс';
}

function getTutorNameById(tutorId) {
    if (tutorId === 0) return 'Не указан';
    const tutor = allTutorsCache.find(t => t.id === tutorId);
    return tutor ? tutor.name : 'Неизвестный репетитор';
}

function getOptionsText(order) {
    const options = [];
    if (order.early_registration) options.push('Ранняя регистрация');
    if (order.group_enrollment) options.push('Групповая запись');
    if (order.intensive_course) options.push('Интенсивный курс');
    if (order.supplementary) options.push('Дополнительные материалы');
    if (order.personalized) options.push('Персонализированный подход');
    if (order.excursions) options.push('Экскурсии');
    if (order.assessment) options.push('Оценка знаний');
    if (order.interactive) options.push('Интерактивные занятия');
    return options.length > 0 ? options.join(', ') : 'Нет';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function viewOrderDetails(orderId) {
    try {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) {
            showNotification('Заявка не найдена', 'error');
            return;
        }

        const detailsBody = document.getElementById('order-details-body');
        detailsBody.innerHTML = `
            <div class="order-details">
                <div class="detail-row">
                    <strong>Дата создания:</strong>
                    <span>${formatDate(order.created_at || new Date())}</span>
                </div>
                <div class="detail-row">
                    <strong>Курс:</strong>
                    <span>${getCourseNameById(order.course_id)}</span>
                </div>
                <div class="detail-row">
                    <strong>Репетитор:</strong>
                    <span>${getTutorNameById(order.tutor_id)}</span>
                </div>
                <div class="detail-row">
                    <strong>Дата начала:</strong>
                    <span>${order.date_start}</span>
                </div>
                <div class="detail-row">
                    <strong>Время начала:</strong>
                    <span>${order.time_start}</span>
                </div>
                <div class="detail-row">
                    <strong>Продолжительность:</strong>
                    <span>${order.duration} часов</span>
                </div>
                <div class="detail-row">
                    <strong>Количество человек:</strong>
                    <span>${order.persons}</span>
                </div>
                <div class="detail-row">
                    <strong>Стоимость:</strong>
                    <span>${order.price} ₽</span>
                </div>
                <div class="detail-row">
                    <strong>Дополнительные опции:</strong>
                    <span>
                        ${getOptionsText(order)}
                    </span>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(
            document.getElementById('orderDetailsModal')
        );
        modal.show();
    } catch (error) {
        console.error('Error viewing order:', error);
        showNotification('Ошибка при просмотре заявки', 'error');
    }
}

function editOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Заявка не найдена', 'error');
        return;
    }

    currentEditOrderId = orderId;

    document.getElementById('edit-order-id').value = order.id;
    document.getElementById('edit-date').value = order.date_start;
    document.getElementById('edit-time').value = order.time_start;
    document.getElementById('edit-duration').value = order.duration;
    document.getElementById('edit-persons').value = order.persons;

    const modal = new bootstrap.Modal(
        document.getElementById('editOrderModal')
    );
    modal.show();
}

async function saveEditedOrder() {
    if (!currentEditOrderId) return;

    const orderData = {
        date_start: document.getElementById('edit-date').value,
        time_start: document.getElementById('edit-time').value,
        duration: parseInt(document.getElementById('edit-duration').value),
        persons: parseInt(document.getElementById('edit-persons').value)
    };

    if (!orderData.date_start || !orderData.time_start ||
        !orderData.duration || !orderData.persons) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }

    try {
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

function confirmDeleteOrder(orderId) {
    currentDeleteOrderId = orderId;
    const modal = new bootstrap.Modal(
        document.getElementById('deleteOrderModal')
    );
    modal.show();
}

async function deleteOrderConfirmed() {
    if (!currentDeleteOrderId) return;

    try {
        await deleteOrder(currentDeleteOrderId);
        showNotification('Заявка успешно удалена', 'success');

        const modal = bootstrap.Modal.getInstance(
            document.getElementById('deleteOrderModal')
        );
        modal.hide();

        await loadOrders();
    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Ошибка при удалении заявки', 'error');
    }
}

document.getElementById('orders-search')
    .addEventListener('input', function (e) {
        const searchQuery = e.target.value.toLowerCase();

        filteredOrders = allOrders.filter(order => {
            const courseName = getCourseNameById(order.course_id)
                .toLowerCase();
            const tutorName = getTutorNameById(order.tutor_id)
                .toLowerCase();
            const dateStart = order.date_start.toLowerCase();

            return courseName.includes(searchQuery) ||
                tutorName.includes(searchQuery) ||
                dateStart.includes(searchQuery);
        });

        displayOrders();
    });

document.getElementById('orders-sort')
    .addEventListener('change', function (e) {
        const sortValue = e.target.value;

        filteredOrders.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);

            if (sortValue === 'date-desc') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

        displayOrders();
    });

document.getElementById('save-order-btn')
    .addEventListener('click', saveEditedOrder);

document.getElementById('confirm-delete-btn')
    .addEventListener('click', deleteOrderConfirmed);

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

document.addEventListener('DOMContentLoaded', loadOrders);

