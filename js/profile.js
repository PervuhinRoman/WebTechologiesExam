let allOrders = [];
let filteredOrders = [];
let currentEditOrderId = null;
let currentDeleteOrderId = null;
let allCoursesCache = [];
let allTutorsCache = [];

// Pagination
const ORDERS_PER_PAGE = 5;
let currentPage = 1;
let paginatedOrders = [];

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

        // Применяем начальную сортировку (сначала новые)
        filteredOrders.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA; // date-desc по умолчанию
        });

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
        document.getElementById('orders-pagination').style.display = 'none';
        return;
    }

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    const endIndex = startIndex + ORDERS_PER_PAGE;
    paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    ordersContainer.innerHTML = paginatedOrders.map((order) => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-number">Заявка #${order.id}</span>
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

    setupPagination(totalPages);
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

function getDiscountsAndSurcharges(order) {
    const items = [];

    if (order.early_registration) {
        items.push({ text: 'Ранняя регистрация', type: 'discount', value: '-10%' });
    }
    if (order.group_enrollment) {
        items.push({ text: 'Групповая запись', type: 'discount', value: '-15%' });
    }
    if (order.intensive_course) {
        items.push({ text: 'Интенсивный курс', type: 'surcharge', value: '+20%' });
    }
    if (order.supplementary) {
        items.push({ text: 'Дополнительные материалы', type: 'surcharge', value: '+2000₽/чел' });
    }
    if (order.personalized) {
        items.push({ text: 'Индивидуальные занятия', type: 'surcharge', value: '+1500₽/нед' });
    }
    if (order.excursions) {
        items.push({ text: 'Культурные экскурсии', type: 'surcharge', value: '+25%' });
    }
    if (order.assessment) {
        items.push({ text: 'Оценка уровня', type: 'surcharge', value: '+300₽' });
    }
    if (order.interactive) {
        items.push({ text: 'Интерактивная платформа', type: 'surcharge', value: '+50%' });
    }

    return items;
}

function setupPagination(totalPages) {
    const paginationNav = document.getElementById('orders-pagination');
    const paginationList = paginationNav.querySelector('.pagination');

    if (totalPages <= 1) {
        paginationNav.style.display = 'none';
        return;
    }

    paginationNav.style.display = 'block';
    paginationList.innerHTML = '';

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displayOrders();
        }
    });
    paginationList.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            displayOrders();
        });
        paginationList.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            displayOrders();
        }
    });
    paginationList.appendChild(nextLi);
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

        const course = allCoursesCache.find(c => c.id === order.course_id);
        const courseDescription = course ? course.description : 'Описание недоступно';

        const discountsAndSurcharges = getDiscountsAndSurcharges(order);

        let discountsHtml = '';
        let surchargesHtml = '';

        if (discountsAndSurcharges.length > 0) {
            const discounts = discountsAndSurcharges.filter(item => item.type === 'discount');
            const surcharges = discountsAndSurcharges.filter(item => item.type === 'surcharge');

            if (discounts.length > 0) {
                discountsHtml = `
                    <div class="alert alert-success mb-2">
                        <strong>Скидки:</strong><br>
                        ${discounts.map(d => `${d.text}: ${d.value}`).join('<br>')}
                    </div>
                `;
            }

            if (surcharges.length > 0) {
                surchargesHtml = `
                    <div class="alert alert-info mb-2">
                        <strong>Надбавки и дополнительные услуги:</strong><br>
                        ${surcharges.map(s => `${s.text}: ${s.value}`).join('<br>')}
                    </div>
                `;
            }
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
                <div class="detail-row mb-3">
                    <strong>Описание курса:</strong>
                    <p class="mt-1 text-muted">${courseDescription}</p>
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
                ${discountsHtml}
                ${surchargesHtml}
                <div class="detail-row mt-3">
                    <strong>Итоговая стоимость:</strong>
                    <span class="fs-4 text-primary">${order.price.toLocaleString('ru-RU')} ₽</span>
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

// editOrder и saveEditedOrder перемещены в editOrderLogic.js

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

        currentPage = 1;
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

        currentPage = 1;
        displayOrders();
    });

// save-order-btn listener перемещён в editOrderLogic.js

document.getElementById('confirm-delete-btn')
    .addEventListener('click', deleteOrderConfirmed);

// Обработчик закрытия модального окна - очистка backdrop
document.getElementById('deleteOrderModal')
    .addEventListener('hidden.bs.modal', function () {
        // Принудительная очистка backdrop и восстановление прокрутки
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    });

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

