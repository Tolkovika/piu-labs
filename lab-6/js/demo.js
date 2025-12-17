/**
 * Demo aplikacji Ajax
 * Prosta demonstracja użycia biblioteki z JSONPlaceholder
 */

// Inicjalizacja biblioteki Ajax
const api = new Ajax({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 5000
});

// Referencje do elementów DOM
const btnFetch = document.getElementById('btn-fetch');
const btnError = document.getElementById('btn-error');
const btnReset = document.getElementById('btn-reset');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const itemsList = document.getElementById('items-list');

// Funkcja pokazująca loader
function showLoader() {
    loader.classList.add('show');
    errorMessage.classList.remove('show');
}

// Funkcja ukrywająca loader
function hideLoader() {
    loader.classList.remove('show');
}

// Funkcja wyświetlająca błąd
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// Funkcja ukrywająca błąd
function hideError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

// Funkcja wyświetlająca listę użytkowników
function displayItems(users) {
    itemsList.innerHTML = '';

    users.forEach(user => {
        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
      <div class="item__id">#${user.id}</div>
      <div class="item__content">
        <div class="item__name">${user.name}</div>
        <div class="item__email">${user.email}</div>
      </div>
    `;
        itemsList.appendChild(li);
    });
}

// Przycisk "Pobierz dane"
btnFetch.addEventListener('click', async () => {
    showLoader();
    hideError();

    try {
        const users = await api.get('/users');
        hideLoader();
        displayItems(users);
    } catch (error) {
        hideLoader();
        showError(`Błąd: ${error.message}`);
    }
});

// Przycisk "Wywołaj błąd"
btnError.addEventListener('click', async () => {
    showLoader();
    hideError();

    try {
        // Wywołaj request na nieistniejący endpoint (404)
        await api.get('/nonexistent-endpoint-404');
    } catch (error) {
        hideLoader();
        showError(`Błąd: ${error.message}`);
    }
});

// Przycisk "Resetuj"
btnReset.addEventListener('click', () => {
    hideLoader();
    hideError();
    itemsList.innerHTML = '';
});
