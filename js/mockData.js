const MOCK_COURSES = [
    {
        id: 1,
        name: 'Английский для начинающих',
        description: 'Базовый курс английского языка для новичков',
        level: 'beginner',
        duration: '3 месяца',
        price: 15000
    },
    {
        id: 2,
        name: 'Разговорный английский',
        description: 'Практика разговорной речи и произношения',
        level: 'intermediate',
        duration: '2 месяца',
        price: 18000
    },
    {
        id: 3,
        name: 'Business English',
        description: 'Деловой английский для профессионалов',
        level: 'advanced',
        duration: '4 месяца',
        price: 25000
    },
    {
        id: 4,
        name: 'Немецкий язык A1',
        description: 'Начальный уровень немецкого языка',
        level: 'beginner',
        duration: '4 месяца',
        price: 16000
    },
    {
        id: 5,
        name: 'Французский для путешествий',
        description: 'Практический французский для туристов',
        level: 'beginner',
        duration: '2 месяца',
        price: 14000
    },
    {
        id: 6,
        name: 'Испанский разговорный',
        description: 'Интенсивный курс разговорного испанского',
        level: 'intermediate',
        duration: '3 месяца',
        price: 17000
    },
    {
        id: 7,
        name: 'Китайский язык HSK 1',
        description: 'Подготовка к экзамену HSK уровень 1',
        level: 'beginner',
        duration: '5 месяцев',
        price: 20000
    },
    {
        id: 8,
        name: 'Итальянский для продвинутых',
        description: 'Углубленное изучение итальянского языка',
        level: 'advanced',
        duration: '4 месяца',
        price: 22000
    }
];

const MOCK_TUTORS = [
    {
        id: 1,
        course_id: 1,
        name: 'Анна Смирнова',
        language: 'Английский',
        description: 'Опытный преподаватель с 8-летним стажем',
        experience: '8 лет'
    },
    {
        id: 2,
        course_id: 1,
        name: 'Джон Смит',
        language: 'Английский',
        description: 'Носитель языка из Великобритании',
        experience: '5 лет'
    },
    {
        id: 3,
        course_id: 2,
        name: 'Мария Иванова',
        language: 'Английский',
        description: 'Специалист по разговорной практике',
        experience: '10 лет'
    },
    {
        id: 4,
        course_id: 3,
        name: 'Роберт Браун',
        language: 'Английский',
        description: 'MBA, эксперт в бизнес-английском',
        experience: '12 лет'
    },
    {
        id: 5,
        course_id: 4,
        name: 'Ханс Мюллер',
        language: 'Немецкий',
        description: 'Носитель немецкого языка из Берлина',
        experience: '7 лет'
    },
    {
        id: 6,
        course_id: 4,
        name: 'Ольга Петрова',
        language: 'Немецкий',
        description: 'Сертифицированный преподаватель',
        experience: '6 лет'
    },
    {
        id: 7,
        course_id: 5,
        name: 'Пьер Дюпон',
        language: 'Французский',
        description: 'Носитель языка из Парижа',
        experience: '9 лет'
    },
    {
        id: 8,
        course_id: 6,
        name: 'Карлос Гарсия',
        language: 'Испанский',
        description: 'Преподаватель из Мадрида',
        experience: '8 лет'
    },
    {
        id: 9,
        course_id: 7,
        name: 'Ли Вэй',
        language: 'Китайский',
        description: 'Эксперт по подготовке к HSK',
        experience: '11 лет'
    },
    {
        id: 10,
        course_id: 8,
        name: 'Джузеппе Росси',
        language: 'Итальянский',
        description: 'Преподаватель высшей категории',
        experience: '15 лет'
    }
];

let MOCK_ORDERS = [
    {
        id: 1,
        course_id: 1,
        tutor_id: 1,
        full_name: 'Иванов Иван Иванович',
        email: 'ivanov@example.com',
        phone: '+79161234567',
        lesson_date: '2026-01-20',
        lesson_time: '10:00',
        comment: 'Хочу начать изучение английского с нуля',
        created_at: '2026-01-10T14:30:00'
    },
    {
        id: 2,
        course_id: 2,
        tutor_id: 3,
        full_name: 'Петрова Мария Сергеевна',
        email: 'petrova@example.com',
        phone: '+79167654321',
        lesson_date: '2026-01-18',
        lesson_time: '15:00',
        comment: 'Нужна практика разговорного английского',
        created_at: '2026-01-11T09:15:00'
    },
    {
        id: 3,
        course_id: 4,
        tutor_id: 5,
        full_name: 'Сидоров Петр Александрович',
        email: 'sidorov@example.com',
        phone: '+79169876543',
        lesson_date: '2026-01-25',
        lesson_time: '18:00',
        comment: null,
        created_at: '2026-01-12T11:45:00'
    },
    {
        id: 4,
        course_id: 7,
        tutor_id: 9,
        full_name: 'Козлова Анна Дмитриевна',
        email: 'kozlova@example.com',
        phone: '+79163456789',
        lesson_date: '2026-01-22',
        lesson_time: '14:00',
        comment: 'Готовлюсь к экзамену HSK',
        created_at: '2026-01-13T16:20:00'
    },
    {
        id: 5,
        course_id: 3,
        tutor_id: 4,
        full_name: 'Смирнов Алексей Владимирович',
        email: 'smirnov@example.com',
        phone: '+79165555555',
        lesson_date: '2026-01-28',
        lesson_time: '12:00',
        comment: 'Нужен английский для работы в международной компании',
        created_at: '2026-01-14T10:00:00'
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
                created_at: new Date().toISOString()
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
                ...options.body
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

