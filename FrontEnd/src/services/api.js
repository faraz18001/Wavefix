const API_BASE = 'http://localhost:8000';

// Login user and get token
export async function loginUser(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }

    return response.json();
}

// Register new user
export async function registerUser(username, password, email = null) {
    const body = { username, password };
    if (email) {
        body.email = email;
    }

    const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
}

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Get current user info
export async function getCurrentUser() {
    const response = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
    });

    if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return null;
    }

    if (!response.ok) {
        throw new Error('Failed to get user info');
    }

    return response.json();
}

// Get chat sessions
export async function getChatSessions() {
    const response = await fetch(`${API_BASE}/chat/sessions`, {
        headers: getAuthHeaders()
    });

    if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return [];
    }

    if (!response.ok) {
        throw new Error('Failed to get chat sessions');
    }

    return response.json();
}

// Get messages for a session
export async function getSessionMessages(sessionId) {
    const response = await fetch(`${API_BASE}/chat/${sessionId}/messages`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to get messages');
    }

    return response.json();
}

// Send chat message
export async function sendChatMessage(message, sessionId = null) {
    const body = { message };
    if (sessionId) {
        body.session_id = String(sessionId);
    }

    const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
    });

    if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return null;
    }

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send message');
    }

    return response.json();
}

// Delete a chat session
export async function deleteChatSession(sessionId) {
    const response = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    return response.ok;
}

// Logout
export function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    window.location.href = '/login';
}
