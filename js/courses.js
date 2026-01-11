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

    coursesContainer.innerHTML = coursesToShow.map(course => `
        <div class="col-md-6 col-lg-4">
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-header">
                    <h3 class="course-title">${course.name}</h3>
                    <span class="course-level ${course.level}">
                        ${getLevelLabel(course.level)}
                    </span>
                </div>
                <p class="course-description">
                    ${course.description || 'Описание курса'}
                </p>
                <div class="course-info">
                    <div class="course-info-item">
                        <strong>Длительность:</strong> 
                        ${course.duration || 'не указана'}
                    </div>
                    <div class="course-info-item">
                        <strong>Цена:</strong> 
                        ${course.price ? course.price + ' ₽' : 'уточняйте'}
                    </div>
                </div>
                <button class="btn btn-primary w-100 select-course-btn" 
                        data-course-id="${course.id}">
                    Выбрать курс
                </button>
            </div>
        </div>
    `).join('');

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
    loadTutorsForCourse(courseId);
    document.getElementById('tutors-section')
        .scrollIntoView({ behavior: 'smooth' });
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
            const levelMatch = !levelFilter || course.level === levelFilter;
            return nameMatch && levelMatch;
        });

        currentPage = 1;
        displayCourses();
        setupPagination();
    });

document.addEventListener('DOMContentLoaded', loadCourses);

