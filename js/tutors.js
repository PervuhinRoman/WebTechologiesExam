let allTutors = [];
let filteredTutors = [];
let selectedCourseId = null;

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

        console.log('Loading tutors for course:', courseId);

        if (allTutors.length === 0) {
            await loadAllTutors();
        }

        filteredTutors = allTutors.filter(tutor => {
            return tutor.course_id === parseInt(courseId);
        });

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
        tutorsContainer.innerHTML = `
            <div class="col-12">
                <p class="text-center text-muted">
                    Репетиторов для этого курса не найдено
                </p>
            </div>
        `;
        return;
    }

    tutorsContainer.innerHTML = filteredTutors.map(tutor => `
        <div class="col-md-6 col-lg-4">
            <div class="tutor-card">
                <div class="tutor-header">
                    <div class="tutor-avatar">
                        ${getInitials(tutor.name)}
                    </div>
                    <div class="tutor-info">
                        <h3 class="tutor-name">${tutor.name}</h3>
                        <p class="tutor-language">
                            ${tutor.language || 'Язык не указан'}
                        </p>
                    </div>
                </div>
                <p class="tutor-description">
                    ${tutor.description || 'Опытный преподаватель'}
                </p>
                <div class="tutor-experience">
                    <strong>Опыт:</strong> 
                    ${tutor.experience || 'не указан'}
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
    const tutorId = event.target.getAttribute('data-tutor-id');
    const courseId = event.target.getAttribute('data-course-id');

    console.log('Opening booking modal for:', { tutorId, courseId });

    document.getElementById('order-tutor-id').value = tutorId;
    document.getElementById('order-course-id').value = courseId;

    const modal = new bootstrap.Modal(
        document.getElementById('orderModal')
    );
    modal.show();
}

document.getElementById('tutors-search-form')
    .addEventListener('submit', function (e) {
        e.preventDefault();

        const searchQuery = document.getElementById('tutor-name-search')
            .value.toLowerCase();

        if (allTutors.length === 0) {
            return;
        }

        filteredTutors = allTutors.filter(tutor => {
            if (selectedCourseId) {
                if (tutor.course_id !== parseInt(selectedCourseId)) {
                    return false;
                }
            }

            if (!searchQuery) return true;

            const nameMatch = tutor.name.toLowerCase()
                .includes(searchQuery);
            const langMatch = tutor.language &&
                tutor.language.toLowerCase().includes(searchQuery);

            return nameMatch || langMatch;
        });

        displayTutors();
    });

document.addEventListener('DOMContentLoaded', function () {
    loadAllTutors().catch(err => {
        console.error('Failed to preload tutors:', err);
    });
});

