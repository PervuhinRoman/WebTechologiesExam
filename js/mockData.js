const MOCK_COURSES = [
    {
        id: 1,
        name: 'Английский для начинающих',
        description: 'Базовый курс английского языка для новичков. Изучение грамматики, лексики и произношения.',
        teacher: 'Анна Смирнова',
        level: 'Beginner',
        total_length: 8,
        week_length: 2,
        start_dates: [
            '2026-02-01T09:00:00',
            '2026-02-01T14:00:00',
            '2026-02-15T10:00:00',
            '2026-03-01T09:00:00'
        ],
        course_fee_per_hour: 500,
        created_at: '2026-01-05T10:00:00',
        updated_at: '2026-01-05T10:00:00'
    },
    {
        id: 2,
        name: 'Разговорный английский',
        description: 'Практика разговорной речи и произношения с носителями языка.',
        teacher: 'Джон Смит',
        level: 'Intermediate',
        total_length: 6,
        week_length: 3,
        start_dates: [
            '2026-02-05T11:00:00',
            '2026-02-20T15:00:00',
            '2026-03-05T11:00:00'
        ],
        course_fee_per_hour: 600,
        created_at: '2026-01-06T11:00:00',
        updated_at: '2026-01-06T11:00:00'
    },
    {
        id: 3,
        name: 'Business English',
        description: 'Деловой английский для профессионалов. Презентации, переговоры, деловая переписка.',
        teacher: 'Роберт Браун',
        level: 'Advanced',
        total_length: 10,
        week_length: 2,
        start_dates: [
            '2026-02-10T18:00:00',
            '2026-03-01T18:00:00'
        ],
        course_fee_per_hour: 800,
        created_at: '2026-01-07T12:00:00',
        updated_at: '2026-01-07T12:00:00'
    },
    {
        id: 4,
        name: 'Немецкий язык A1',
        description: 'Начальный уровень немецкого языка. Алфавит, базовая грамматика, повседневные фразы.',
        teacher: 'Ханс Мюллер',
        level: 'Beginner',
        total_length: 12,
        week_length: 2,
        start_dates: [
            '2026-02-03T10:00:00',
            '2026-02-17T10:00:00',
            '2026-03-03T10:00:00'
        ],
        course_fee_per_hour: 550,
        created_at: '2026-01-08T13:00:00',
        updated_at: '2026-01-08T13:00:00'
    },
    {
        id: 5,
        name: 'Французский для путешествий',
        description: 'Практический французский для туристов. Общение в отелях, ресторанах, магазинах.',
        teacher: 'Пьер Дюпон',
        level: 'Beginner',
        total_length: 4,
        week_length: 3,
        start_dates: [
            '2026-02-08T12:00:00',
            '2026-02-22T12:00:00'
        ],
        course_fee_per_hour: 450,
        created_at: '2026-01-09T14:00:00',
        updated_at: '2026-01-09T14:00:00'
    },
    {
        id: 6,
        name: 'Испанский разговорный',
        description: 'Интенсивный курс разговорного испанского языка с погружением в культуру.',
        teacher: 'Карлос Гарсия',
        level: 'Intermediate',
        total_length: 8,
        week_length: 3,
        start_dates: [
            '2026-02-12T16:00:00',
            '2026-03-01T16:00:00'
        ],
        course_fee_per_hour: 550,
        created_at: '2026-01-10T15:00:00',
        updated_at: '2026-01-10T15:00:00'
    },
    {
        id: 7,
        name: 'Китайский язык HSK 1',
        description: 'Подготовка к экзамену HSK уровень 1. Иероглифика, тоны, базовая грамматика.',
        teacher: 'Ли Вэй',
        level: 'Beginner',
        total_length: 16,
        week_length: 2,
        start_dates: [
            '2026-02-15T13:00:00',
            '2026-03-01T13:00:00'
        ],
        course_fee_per_hour: 700,
        created_at: '2026-01-11T16:00:00',
        updated_at: '2026-01-11T16:00:00'
    },
    {
        id: 8,
        name: 'Итальянский для продвинутых',
        description: 'Углубленное изучение итальянского языка. Литература, искусство, история.',
        teacher: 'Джузеппе Росси',
        level: 'Advanced',
        total_length: 10,
        week_length: 2,
        start_dates: [
            '2026-02-18T17:00:00',
            '2026-03-05T17:00:00'
        ],
        course_fee_per_hour: 650,
        created_at: '2026-01-12T17:00:00',
        updated_at: '2026-01-12T17:00:00'
    }
];

const MOCK_TUTORS = [
    {
        id: 1,
        name: 'Ирина Петровна',
        work_experience: 8,
        languages_spoken: ['Русский', 'Английский', 'Французский'],
        languages_offered: ['Английский', 'Французский'],
        language_level: 'Advanced',
        price_per_hour: 800,
        created_at: '2026-01-05T10:00:00',
        updated_at: '2026-01-05T10:00:00'
    },
    {
        id: 2,
        name: 'Мария Ивановна',
        work_experience: 5,
        languages_spoken: ['Русский', 'Английский'],
        languages_offered: ['Английский'],
        language_level: 'Intermediate',
        price_per_hour: 600,
        created_at: '2026-01-06T11:00:00',
        updated_at: '2026-01-06T11:00:00'
    },
    {
        id: 3,
        name: 'Александр Сергеевич',
        work_experience: 12,
        languages_spoken: ['Русский', 'Немецкий', 'Английский'],
        languages_offered: ['Немецкий'],
        language_level: 'Advanced',
        price_per_hour: 900,
        created_at: '2026-01-07T12:00:00',
        updated_at: '2026-01-07T12:00:00'
    },
    {
        id: 4,
        name: 'Елена Павловна',
        work_experience: 7,
        languages_spoken: ['Русский', 'Испанский', 'Португальский'],
        languages_offered: ['Испанский'],
        language_level: 'Advanced',
        price_per_hour: 750,
        created_at: '2026-01-08T13:00:00',
        updated_at: '2026-01-08T13:00:00'
    },
    {
        id: 5,
        name: 'Дмитрий Александрович',
        work_experience: 10,
        languages_spoken: ['Русский', 'Китайский', 'Английский'],
        languages_offered: ['Китайский'],
        language_level: 'Advanced',
        price_per_hour: 1000,
        created_at: '2026-01-09T14:00:00',
        updated_at: '2026-01-09T14:00:00'
    }
];

let MOCK_ORDERS = [
    {
        id: 1,
        tutor_id: 0,
        course_id: 1,
        date_start: '2026-02-01',
        time_start: '09:00',
        duration: 16,
        persons: 1,
        price: 8000,
        early_registration: true,
        group_enrollment: false,
        intensive_course: false,
        supplementary: true,
        personalized: false,
        excursions: false,
        assessment: true,
        interactive: true,
        student_id: 1,
        created_at: '2026-01-10T14:30:00',
        updated_at: '2026-01-10T14:30:00'
    },
    {
        id: 2,
        tutor_id: 1,
        course_id: 0,
        date_start: '2026-02-05',
        time_start: '15:00',
        duration: 10,
        persons: 1,
        price: 8000,
        early_registration: false,
        group_enrollment: false,
        intensive_course: true,
        supplementary: false,
        personalized: true,
        excursions: false,
        assessment: false,
        interactive: true,
        student_id: 1,
        created_at: '2026-01-11T09:15:00',
        updated_at: '2026-01-11T09:15:00'
    },
    {
        id: 3,
        tutor_id: 0,
        course_id: 4,
        date_start: '2026-02-03',
        time_start: '10:00',
        duration: 24,
        persons: 2,
        price: 26400,
        early_registration: true,
        group_enrollment: true,
        intensive_course: false,
        supplementary: true,
        personalized: false,
        excursions: true,
        assessment: true,
        interactive: false,
        student_id: 1,
        created_at: '2026-01-12T11:45:00',
        updated_at: '2026-01-12T11:45:00'
    },
    {
        id: 4,
        tutor_id: 5,
        course_id: 0,
        date_start: '2026-02-10',
        time_start: '14:00',
        duration: 15,
        persons: 1,
        price: 15000,
        early_registration: false,
        group_enrollment: false,
        intensive_course: true,
        supplementary: true,
        personalized: true,
        excursions: false,
        assessment: true,
        interactive: true,
        student_id: 1,
        created_at: '2026-01-13T16:20:00',
        updated_at: '2026-01-13T16:20:00'
    },
    {
        id: 5,
        tutor_id: 0,
        course_id: 3,
        date_start: '2026-02-10',
        time_start: '18:00',
        duration: 20,
        persons: 1,
        price: 16000,
        early_registration: true,
        group_enrollment: false,
        intensive_course: false,
        supplementary: false,
        personalized: false,
        excursions: false,
        assessment: true,
        interactive: true,
        student_id: 1,
        created_at: '2026-01-14T10:00:00',
        updated_at: '2026-01-14T10:00:00'
    }
];
let mockOrderIdCounter = 6;

// Флаг использования mock-данных
// Установите в false когда API будет доступно
const USE_MOCK_DATA = true;

async function mockApiRequest(endpoint, options = {}) {
    console.log('Mock API Request:', endpoint, options);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (endpoint.includes('/courses')) {
        if (endpoint.match(/\/courses\/\d+/)) {
            const id = parseInt(endpoint.match(/\/courses\/(\d+)/)[1]);
            const course = MOCK_COURSES.find(c => c.id === id);
            if (!course) throw new Error('Course not found');
            return course;
        }
        return MOCK_COURSES;
    }

    if (endpoint.includes('/tutors')) {
        if (endpoint.match(/\/tutors\/\d+/)) {
            const id = parseInt(endpoint.match(/\/tutors\/(\d+)/)[1]);
            const tutor = MOCK_TUTORS.find(t => t.id === id);
            if (!tutor) throw new Error('Tutor not found');
            return tutor;
        }
        return MOCK_TUTORS;
    }

    if (endpoint.includes('/orders')) {
        const orderIdMatch = endpoint.match(/\/orders\/(\d+)/);

        if (options.method === 'POST') {
            const newOrder = {
                id: mockOrderIdCounter++,
                ...options.body,
                student_id: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            MOCK_ORDERS.push(newOrder);
            return newOrder;
        }

        if (options.method === 'PUT' && orderIdMatch) {
            const id = parseInt(orderIdMatch[1]);
            const index = MOCK_ORDERS.findIndex(o => o.id === id);
            if (index === -1) throw new Error('Order not found');
            MOCK_ORDERS[index] = {
                ...MOCK_ORDERS[index],
                ...options.body,
                updated_at: new Date().toISOString()
            };
            return MOCK_ORDERS[index];
        }

        if (options.method === 'DELETE' && orderIdMatch) {
            const id = parseInt(orderIdMatch[1]);
            const index = MOCK_ORDERS.findIndex(o => o.id === id);
            if (index === -1) throw new Error('Order not found');
            MOCK_ORDERS.splice(index, 1);
            return { id: id };
        }

        if (orderIdMatch) {
            const id = parseInt(orderIdMatch[1]);
            const order = MOCK_ORDERS.find(o => o.id === id);
            if (!order) throw new Error('Order not found');
            return order;
        }

        return MOCK_ORDERS;
    }

    throw new Error('Unknown endpoint');
}
