let allOrders = [];
let filteredOrders = [];
let currentEditOrderId = null;
let currentDeleteOrderId = null;

async function loadOrders() {
    const ordersContainer = document.getElementById('orders-container');
    const loadingSpinner = document.getElementById('orders-loading');

    try {
        loadingSpinner.style.display = 'block';
        ordersContainer.innerHTML = '';

        console.log('Loading orders...');
        allOrders = await getOrders();
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
                        <strong>Дата занятия:</strong> 
                        ${order.lesson_date} в ${order.lesson_time}
                    </div>
                    <div class="info-row">
                        <strong>Контакт:</strong> 
                        ${order.email}
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
    if (typeof MOCK_COURSES === 'undefined') return 'Курс #' + courseId;
    const course = MOCK_COURSES.find(c => c.id === courseId);
    return course ? course.name : 'Неизвестный курс';
}

function getTutorNameById(tutorId) {
    if (typeof MOCK_TUTORS === 'undefined') return 'Репетитор #' + tutorId;
    const tutor = MOCK_TUTORS.find(t => t.id === tutorId);
    return tutor ? tutor.name : 'Неизвестный репетитор';
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
                    <strong>ФИО:</strong>
                    <span>${order.full_name}</span>
                </div>
                <div class="detail-row">
                    <strong>Email:</strong>
                    <span>${order.email}</span>
                </div>
                <div class="detail-row">
                    <strong>Телефон:</strong>
                    <span>${order.phone}</span>
                </div>
                <div class="detail-row">
                    <strong>Дата занятия:</strong>
                    <span>${order.lesson_date}</span>
                </div>
                <div class="detail-row">
                    <strong>Время занятия:</strong>
                    <span>${order.lesson_time}</span>
                </div>
                ${order.comment ? `
                <div class="detail-row">
                    <strong>Комментарий:</strong>
                    <span>${order.comment}</span>
                </div>
                ` : ''}
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
    document.getElementById('edit-full-name').value = order.full_name;
    document.getElementById('edit-email').value = order.email;
    document.getElementById('edit-phone').value = order.phone;
    document.getElementById('edit-date').value = order.lesson_date;
    document.getElementById('edit-time').value = order.lesson_time;
    document.getElementById('edit-comment').value = order.comment || '';

    const modal = new bootstrap.Modal(
        document.getElementById('editOrderModal')
    );
    modal.show();
}

async function saveEditedOrder() {
    if (!currentEditOrderId) return;

    const orderData = {
        full_name: document.getElementById('edit-full-name').value.trim(),
        email: document.getElementById('edit-email').value.trim(),
        phone: document.getElementById('edit-phone').value.trim(),
        lesson_date: document.getElementById('edit-date').value,
        lesson_time: document.getElementById('edit-time').value,
        comment: document.getElementById('edit-comment').value.trim() || null
    };

    if (!orderData.full_name || !orderData.email || !orderData.phone ||
        !orderData.lesson_date || !orderData.lesson_time) {
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
            const courseName = getCourseNameById(order.course_id).toLowerCase();
            const tutorName = getTutorNameById(order.tutor_id).toLowerCase();
            const fullName = order.full_name.toLowerCase();

            return courseName.includes(searchQuery) ||
                tutorName.includes(searchQuery) ||
                fullName.includes(searchQuery);
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

