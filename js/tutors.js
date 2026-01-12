let allTutors = [];
let filteredTutors = [];
let selectedCourseId = null;
let warningMessage = '';

async function loadAllTutors() {
    try {
        console.log('Loading all tutors...');
        allTutors = await getTutors();
        console.log('Tutors loaded:', allTutors);
        return allTutors;
    } catch (error) {
        console.error('Error loading tutors:', error);
        throw error;
    }
}

async function loadTutorsForCourse(courseId) {
    const tutorsContainer = document.getElementById('tutors-container');
    const loadingSpinner = document.getElementById('tutors-loading');

    try {
        selectedCourseId = courseId;
        loadingSpinner.style.display = 'block';
        tutorsContainer.innerHTML = '';
        warningMessage = '';

        console.log('Loading all tutors for course:', courseId);

        if (allTutors.length === 0) {
            await loadAllTutors();
        }

        const course = await getCourse(courseId);

        if (!course) {
            console.error('Course not found');
            filteredTutors = allTutors;
        } else {
            // Показываем только преподавателя, назначенного на курс
            // NOTE: Если бы в API было отдельное поле "language" для курса,
            // можно было бы реализовать продвинутую фильтрацию:
            // показывать всех преподавателей, которые предлагают этот язык
            const courseTutor = allTutors.find(t =>
                t.name === course.teacher
            );

            if (courseTutor) {
                filteredTutors = [courseTutor];
                console.log('Course:', course.name,
                    'Teacher:', course.teacher);
            } else {
                console.warn('Course teacher not found in tutors list');
                // Показываем предупреждение и всех доступных преподавателей
                warningMessage = `
                    <div class="col-12">
                        <div class="alert alert-warning" role="alert">
                            <strong>Преподаватель не найден</strong>
                            <p class="mb-0">
                                Преподаватель "${course.teacher}" 
                                для курса "${course.name}" 
                                не найден в базе данных. 
                                Показаны все доступные преподаватели.
                            </p>
                        </div>
                    </div>
                `;
                filteredTutors = allTutors;
            }
        }

        if (filteredTutors.length === 0) {
            filteredTutors = allTutors;
        }

        console.log('Filtered tutors:', filteredTutors);

        displayTutors();
        loadingSpinner.style.display = 'none';
    } catch (error) {
        loadingSpinner.style.display = 'none';
        tutorsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    Ошибка при загрузке репетиторов: ${error.message}
                </div>
            </div>
        `;
        console.error('Error loading tutors for course:', error);
    }
}

function displayTutors() {
    const tutorsContainer = document.getElementById('tutors-container');

    console.log('Displaying tutors:', {
        total: filteredTutors.length
    });

    if (filteredTutors.length === 0) {
        tutorsContainer.innerHTML = warningMessage + `
            <div class="col-12">
                <p class="text-center text-muted">
                    Репетиторов для этого курса не найдено
                </p>
            </div>
        `;
        return;
    }

    tutorsContainer.innerHTML = warningMessage + filteredTutors.map(tutor => `
        <div class="col-md-6 col-lg-4">
            <div class="tutor-card">
                <div class="tutor-header">
                    <div class="tutor-avatar">
                        ${getInitials(tutor.name)}
                    </div>
                    <div class="tutor-info">
                        <h3 class="tutor-name">${tutor.name}</h3>
                        <p class="tutor-language">
                            ${tutor.languages_offered.join(', ')}
                        </p>
                    </div>
                </div>
                <div class="tutor-details">
                    <div class="tutor-detail-item">
                        <strong>Опыт:</strong> 
                        ${tutor.work_experience} лет
                    </div>
                    <div class="tutor-detail-item">
                        <strong>Уровень:</strong> 
                        ${tutor.language_level}
                    </div>
                    <div class="tutor-detail-item">
                        <strong>Владеет языками:</strong> 
                        ${tutor.languages_spoken.join(', ')}
                    </div>
                    <div class="tutor-detail-item">
                        <strong>Стоимость:</strong> 
                        ${tutor.price_per_hour} ₽/час
                    </div>
                </div>
                <button class="btn btn-primary w-100 book-tutor-btn" 
                        data-tutor-id="${tutor.id}"
                        data-course-id="${selectedCourseId}">
                    Записаться
                </button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.book-tutor-btn').forEach(btn => {
        btn.addEventListener('click', handleTutorBooking);
    });
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function handleTutorBooking(event) {
    const button = event.target;
    const tutorId = button.getAttribute('data-tutor-id');
    const courseId = button.getAttribute('data-course-id');

    console.log('Opening booking modal for:', { tutorId, courseId });

    // Устанавливаем атрибуты на кнопку для передачи в модальное окно
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#orderModal');

    const modal = new bootstrap.Modal(
        document.getElementById('orderModal')
    );
    modal.show();
}

document.addEventListener('DOMContentLoaded', function () {
    loadAllTutors().catch(err => {
        console.error('Failed to preload tutors:', err);
    });
});

