let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const coursesPerPage = 6;

async function loadCourses() {
    const coursesContainer = document.getElementById('courses-container');
    const loadingSpinner = document.getElementById('courses-loading');

    try {
        loadingSpinner.style.display = 'block';
        coursesContainer.innerHTML = '';

        console.log('Loading courses from API...');
        allCourses = await getCourses();
        console.log('Courses loaded:', allCourses);
        console.log('Total courses:', allCourses.length);

        filteredCourses = [...allCourses];

        displayCourses();
        setupPagination();

        loadingSpinner.style.display = 'none';
    } catch (error) {
        loadingSpinner.style.display = 'none';
        coursesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    Ошибка при загрузке курсов: ${error.message}
                </div>
            </div>
        `;
        console.error('Error loading courses:', error);
    }
}

function displayCourses() {
    const coursesContainer = document.getElementById('courses-container');
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const coursesToShow = filteredCourses.slice(startIndex, endIndex);

    console.log('Displaying courses:', {
        total: filteredCourses.length,
        page: currentPage,
        showing: coursesToShow.length
    });

    if (coursesToShow.length === 0) {
        coursesContainer.innerHTML = `
            <div class="col-12">
                <p class="text-center text-muted">
                    Курсы не найдены
                </p>
            </div>
        `;
        return;
    }

    coursesContainer.innerHTML = coursesToShow.map(course => {
        const totalHours = course.total_length * course.week_length;
        const totalPrice = totalHours * course.course_fee_per_hour;

        return `
        <div class="col-md-6 col-lg-4">
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-header">
                    <h3 class="course-title">${course.name}</h3>
                    <span class="course-level ${course.level.toLowerCase()}">
                        ${course.level}
                    </span>
                </div>
                <p class="course-teacher">
                    <strong>Преподаватель:</strong> ${course.teacher}
                </p>
                <p class="course-description">
                    ${course.description}
                </p>
                <div class="course-info">
                    <div class="course-info-item">
                        <strong>Длительность:</strong> 
                        ${course.total_length} недель × ${course.week_length} ч/нед
                    </div>
                    <div class="course-info-item">
                        <strong>Всего часов:</strong> 
                        ${totalHours} часов
                    </div>
                    <div class="course-info-item">
                        <strong>Стоимость:</strong> 
                        ${totalPrice.toLocaleString('ru-RU')} ₽
                    </div>
                </div>
                <button class="btn btn-primary w-100 select-course-btn" 
                        data-course-id="${course.id}">
                    Выбрать курс
                </button>
            </div>
        </div>
    `;
    }).join('');

    document.querySelectorAll('.select-course-btn').forEach(btn => {
        btn.addEventListener('click', handleCourseSelect);
    });
}

function getLevelLabel(level) {
    const levels = {
        'beginner': 'Начальный',
        'intermediate': 'Средний',
        'advanced': 'Продвинутый'
    };
    return levels[level] || level;
}

function setupPagination() {
    const paginationContainer =
        document.getElementById('courses-pagination');
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">
                Назад
            </a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item 
            ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">
                Вперёд
            </a>
        </li>
    `;

    paginationContainer.innerHTML = paginationHTML;

    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                displayCourses();
                setupPagination();
                document.getElementById('courses')
                    .scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function handleCourseSelect(event) {
    const courseId = event.target.getAttribute('data-course-id');
    displayCourseDetails(courseId);
    loadTutorsForCourse(courseId);
    document.getElementById('selected-course-section')
        .scrollIntoView({ behavior: 'smooth' });
}

async function displayCourseDetails(courseId) {
    const courseDetailsContainer =
        document.getElementById('selected-course-details');
    const selectedCourseSection =
        document.getElementById('selected-course-section');

    try {
        const course = allCourses.find(c => c.id === parseInt(courseId));

        if (!course) {
            console.error('Course not found:', courseId);
            return;
        }

        const totalHours = course.total_length * course.week_length;
        const totalPrice = totalHours * course.course_fee_per_hour;

        const startDatesHtml = course.start_dates
            .map(date => {
                const d = new Date(date);
                return `<li>${d.toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</li>`;
            })
            .join('');

        courseDetailsContainer.innerHTML = `
            <div class="course-details-card">
                <div class="row">
                    <div class="col-md-8">
                        <h3 class="course-details-title">${course.name}</h3>
                        <p class="course-details-level">
                            <strong>Уровень:</strong> 
                            <span class="badge bg-secondary">
                                ${course.level}
                            </span>
                        </p>
                        <p class="course-details-teacher">
                            <strong>Преподаватель:</strong> ${course.teacher}
                        </p>
                        <p class="course-details-description">
                            ${course.description}
                        </p>
                        <div class="course-details-info">
                            <div class="info-item">
                                <strong>Длительность:</strong> 
                                ${course.total_length} нед × ${course.week_length} ч
                            </div>
                            <div class="info-item">
                                <strong>Всего часов:</strong> 
                                ${totalHours} часов
                            </div>
                            <div class="info-item">
                                <strong>Стоимость за час:</strong> 
                                ${course.course_fee_per_hour} ₽
                            </div>
                            <div class="info-item">
                                <strong>Общая стоимость:</strong> 
                                ${totalPrice.toLocaleString('ru-RU')} ₽
                            </div>
                        </div>
                        <div class="course-start-dates">
                            <strong>Доступные даты начала:</strong>
                            <ul>
                                ${startDatesHtml}
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-4 text-center">
                        <div class="course-details-actions">
                            <button class="btn btn-outline-secondary btn-sm" 
                                    onclick="closeCourseDetails()">
                                Выбрать другой курс
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        selectedCourseSection.style.display = 'block';
    } catch (error) {
        console.error('Error displaying course details:', error);
    }
}

function closeCourseDetails() {
    document.getElementById('selected-course-section').style.display = 'none';
    document.getElementById('tutors-container').innerHTML =
        '<p class="text-center text-muted">Выберите курс</p>';
    document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('courses-search-form')
    .addEventListener('submit', function (e) {
        e.preventDefault();

        const nameSearch = document.getElementById('course-name-search')
            .value.toLowerCase();
        const levelFilter = document.getElementById('course-level-filter')
            .value;

        filteredCourses = allCourses.filter(course => {
            const nameMatch = !nameSearch ||
                course.name.toLowerCase().includes(nameSearch);
            const levelMatch = !levelFilter ||
                course.level.toLowerCase() === levelFilter.toLowerCase();
            return nameMatch && levelMatch;
        });

        currentPage = 1;
        displayCourses();
        setupPagination();
    });

document.addEventListener('DOMContentLoaded', loadCourses);

