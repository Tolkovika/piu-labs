/**
 * Demo aplikacji dla biblioteki Ajax
 */

// Inicjalizacja biblioteki Ajax z globalną konfiguracją
const api = new Ajax({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Pomocnicza funkcja do wyświetlania wyników
function displayResult(elementId, data, isError = false) {
    const element = document.getElementById(elementId);
    element.className = `result-box ${isError ? 'error' : 'success'} show`;

    if (typeof data === 'string') {
        element.textContent = data;
    } else {
        element.textContent = JSON.stringify(data, null, 2);
    }
}

// Pomocnicza funkcja do wyświetlania loadera
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.className = 'result-box loading';
    element.textContent = 'Ładowanie...';
}

// ========== GET REQUESTS ==========

document.getElementById('btn-get').addEventListener('click', async () => {
    showLoading('result-get');
    try {
        const user = await api.get('/users/1');
        displayResult('result-get', user);
    } catch (error) {
        displayResult('result-get', `Błąd: ${error.message}`, true);
    }
});

document.getElementById('btn-get-all').addEventListener('click', async () => {
    showLoading('result-get');
    try {
        const users = await api.get('/users');
        displayResult('result-get', {
            message: `Pobrano ${users.length} użytkowników`,
            first3: users.slice(0, 3)
        });
    } catch (error) {
        displayResult('result-get', `Błąd: ${error.message}`, true);
    }
});

// ========== POST REQUEST ==========

document.getElementById('btn-post').addEventListener('click', async () => {
    showLoading('result-post');

    const title = document.getElementById('post-title').value;
    const body = document.getElementById('post-body').value;

    if (!title || !body) {
        displayResult('result-post', 'Błąd: Wypełnij wszystkie pola', true);
        return;
    }

    try {
        const newPost = await api.post('/posts', {
            title: title,
            body: body,
            userId: 1
        });

        displayResult('result-post', {
            message: 'Post utworzony pomyślnie!',
            data: newPost
        });

        // Wyczyść formularz
        document.getElementById('post-title').value = '';
        document.getElementById('post-body').value = '';
    } catch (error) {
        displayResult('result-post', `Błąd: ${error.message}`, true);
    }
});

// ========== PUT REQUEST ==========

document.getElementById('btn-put').addEventListener('click', async () => {
    showLoading('result-put');

    const id = document.getElementById('put-id').value;
    const title = document.getElementById('put-title').value;

    if (!id || !title) {
        displayResult('result-put', 'Błąd: Wypełnij wszystkie pola', true);
        return;
    }

    try {
        const updated = await api.put(`/posts/${id}`, {
            id: parseInt(id),
            title: title,
            body: 'Updated body',
            userId: 1
        });

        displayResult('result-put', {
            message: `Post ${id} zaktualizowany!`,
            data: updated
        });
    } catch (error) {
        displayResult('result-put', `Błąd: ${error.message}`, true);
    }
});

// ========== DELETE REQUEST ==========

document.getElementById('btn-delete').addEventListener('click', async () => {
    showLoading('result-delete');

    const id = document.getElementById('delete-id').value;

    if (!id) {
        displayResult('result-delete', 'Błąd: Podaj ID posta', true);
        return;
    }

    try {
        await api.delete(`/posts/${id}`);
        displayResult('result-delete', {
            message: `Post ${id} usunięty pomyślnie!`,
            note: 'JSONPlaceholder nie usuwa danych rzeczywiście, ale zwraca OK'
        });
    } catch (error) {
        displayResult('result-delete', `Błąd: ${error.message}`, true);
    }
});

// ========== CUSTOM CONFIG TESTS ==========

// Test timeout
document.getElementById('btn-timeout').addEventListener('click', async () => {
    showLoading('result-custom');

    // Stwórz instancję z bardzo krótkim timeoutem
    const fastApi = new Ajax({
        baseURL: 'https://jsonplaceholder.typicode.com',
        timeout: 100 // 100ms - prawdopodobnie timeout
    });

    try {
        await fastApi.get('/users');
        displayResult('result-custom', 'Request zakończony (nie timeout)');
    } catch (error) {
        displayResult('result-custom', `Oczekiwany timeout: ${error.message}`, true);
    }
});

// Test błędu 404
document.getElementById('btn-error').addEventListener('click', async () => {
    showLoading('result-custom');

    try {
        await api.get('/invalid-endpoint-404');
    } catch (error) {
        displayResult('result-custom', `Oczekiwany błąd 404: ${error.message}`, true);
    }
});

// ========== INITIAL DEMO ==========

// Automatycznie załaduj przykładowe dane przy starcie
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await api.get('/users/1');
        displayResult('result-get', {
            message: 'Automatyczne demo przy starcie',
            user: user
        });
    } catch (error) {
        console.error('Błąd początkowego demo:', error);
    }
});
