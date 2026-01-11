const API_BASE_URL = 'https://edu.std-900.ist.mospolytech.ru/api';
const API_KEY = 'fd0ca332-f6dc-4694-9d19-27e96b8648d0';

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const config = {
        ...options,
        headers
    };

    if (options.body && typeof options.body === 'object') {
        const formData = new FormData();
        for (const key in options.body) {
            if (options.body.hasOwnProperty(key)) {
                formData.append(key, options.body[key]);
            }
        }
        config.body = formData;
        delete config.headers['Content-Type'];
    }

    try {
        console.log('API Request:', url);
        const response = await fetch(url, config);
        console.log('API Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);
        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

async function getCourses() {
    return apiRequest(`/courses?api_key=${API_KEY}`);
}

async function getCourse(courseId) {
    return apiRequest(`/courses/${courseId}?api_key=${API_KEY}`);
}

async function getTutors() {
    return apiRequest(`/tutors?api_key=${API_KEY}`);
}

async function getTutor(tutorId) {
    return apiRequest(`/tutors/${tutorId}?api_key=${API_KEY}`);
}

async function getOrders() {
    return apiRequest(`/orders?api_key=${API_KEY}`);
}

async function getOrder(orderId) {
    return apiRequest(`/orders/${orderId}?api_key=${API_KEY}`);
}

async function createOrder(orderData) {
    return apiRequest(`/orders?api_key=${API_KEY}`, {
        method: 'POST',
        body: orderData
    });
}

async function updateOrder(orderId, orderData) {
    return apiRequest(`/orders/${orderId}?api_key=${API_KEY}`, {
        method: 'PUT',
        body: orderData
    });
}

async function deleteOrder(orderId) {
    return apiRequest(`/orders/${orderId}?api_key=${API_KEY}`, {
        method: 'DELETE'
    });
}

