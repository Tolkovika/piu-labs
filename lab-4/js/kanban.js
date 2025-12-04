/**
 * ========================================
 * KANBAN BOARD APPLICATION - LAB 4
 * ========================================
 * Aplikacja tablicy Kanban z trzema kolumnami
 * Funkcjonalności:
 * - Dodawanie/usuwanie/edycja kart
 * - Przenoszenie kart między kolumnami
 * - Kolorowanie kart (pojedynczo i grupowo)
 * - Sortowanie alfabetyczne
 * - Persystencja danych w localStorage
 */

// ========== CONFIGURATION ==========
const STORAGE_KEY = 'kanbanBoardLab4';
const COLUMN_NAMES = ['todo', 'doing', 'done'];

// Pastelowe kolory dla kart (optymalne dla ciemnego tła)
const CARD_COLORS = [
    '#FFB3BA', // pastelowy różowy
    '#BAFFC9', // pastelowy zielony
    '#BAE1FF', // pastelowy niebieski
    '#FFFFBA', // pastelowy żółty
    '#FFD9BA', // pastelowy brzoskwiniowy
    '#E0BBE4', // pastelowy lawendowy
    '#FFDFD3', // pastelowy łososiowy
    '#C7CEEA', // pastelowy periwinkle
    '#B4F8C8', // pastelowy miętowy
    '#FBE7C6', // pastelowy piaskowy
];

// ========== GLOBAL STATE ==========
let cardIdCounter = 0;

// ========== DOM REFERENCES ==========
let columns = {};
let cardsContainers = {};
let countElements = {};

// ========== INITIALIZATION ==========
/**
 * Punkt wejścia aplikacji - inicjalizacja po załadowaniu DOM
 */
document.addEventListener('DOMContentLoaded', function () {
    initializeReferences();
    attachColumnEvents();
    loadState();
});

/**
 * Inicjalizacja referencji do elementów DOM
 */
function initializeReferences() {
    COLUMN_NAMES.forEach(colName => {
        const columnElement = document.querySelector(`[data-column="${colName}"]`);
        if (!columnElement) {
            console.error(`Nie znaleziono kolumny: ${colName}`);
            return;
        }
        columns[colName] = columnElement;
        cardsContainers[colName] = columnElement.querySelector('[data-cards-container]');
        countElements[colName] = columnElement.querySelector('.column__count');
    });
}

// ========== EVENT HANDLERS ==========

/**
 * Podłączenie nasłuchiwaczy zdarzeń dla kolumn
 * Używa delegacji zdarzeń dla lepszej wydajności
 */
function attachColumnEvents() {
    COLUMN_NAMES.forEach(colName => {
        const column = columns[colName];

        // Przycisk "Dodaj kartę"
        const addBtn = column.querySelector('.column__add-btn');
        addBtn.addEventListener('click', () => addCard(colName));

        // Przycisk "Koloruj kolumnę"
        const colorBtn = column.querySelector('.column__color-btn');
        colorBtn.addEventListener('click', () => colorColumn(colName));

        // Przycisk "Sortuj"
        const sortBtn = column.querySelector('.column__sort-btn');
        sortBtn.addEventListener('click', () => sortColumn(colName));

        // Delegacja zdarzeń dla kart w kontenerze
        const container = cardsContainers[colName];
        container.addEventListener('click', (e) => handleCardClick(e, colName));
        container.addEventListener('blur', handleCardBlur, true); // capture phase dla blur
    });
}

/**
 * Obsługa kliknięć w przyciski kart (delegacja zdarzeń)
 * @param {Event} event - Obiekt zdarzenia
 * @param {string} colName - Nazwa kolumny
 */
function handleCardClick(event, colName) {
    const target = event.target;

    // Usunięcie karty
    if (target.classList.contains('card__delete')) {
        const card = target.closest('.card');
        if (card) deleteCard(card, colName);
        return;
    }

    // Przeniesienie w lewo
    if (target.classList.contains('card__move-left')) {
        const card = target.closest('.card');
        if (card) moveCardLeft(card, colName);
        return;
    }

    // Przeniesienie w prawo
    if (target.classList.contains('card__move-right')) {
        const card = target.closest('.card');
        if (card) moveCardRight(card, colName);
        return;
    }

    // Kolorowanie pojedynczej karty
    if (target.classList.contains('card__color-one')) {
        const card = target.closest('.card');
        if (card) colorCard(card);
        return;
    }
}

/**
 * Obsługa utraty focusa - zapisanie zmian treści
 * @param {Event} event - Obiekt zdarzenia
 */
function handleCardBlur(event) {
    const target = event.target;
    if (target.classList.contains('card__body')) {
        saveState();
    }
}

// ========== CARD OPERATIONS ==========

/**
 * Dodanie nowej karty do kolumny
 * @param {string} colName - Nazwa kolumny
 * @param {Object} cardData - Opcjonalne dane karty (przy ładowaniu z localStorage)
 */
function addCard(colName, cardData = null) {
    const id = cardData ? cardData.id : generateCardId();
    const text = cardData ? cardData.text : '';
    const color = cardData ? cardData.color : getRandomColor();

    const cardElement = createCardElement(id, text, color, colName);
    cardsContainers[colName].appendChild(cardElement);

    updateColumnCount(colName);
    saveState();

    // Fokus na nowej karcie (tylko jeśli nie ładujemy z localStorage)
    if (!cardData) {
        const body = cardElement.querySelector('.card__body');
        body.focus();
    }
}

/**
 * Utworzenie elementu karty
 * @param {string} id - Unikalny identyfikator karty
 * @param {string} text - Treść karty
 * @param {string} color - Kolor tła karty
 * @param {string} colName - Nazwa kolumny
 * @returns {HTMLElement} Element karty
 */
function createCardElement(id, text, color, colName) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;
    card.style.backgroundColor = color;
    card.setAttribute('role', 'listitem');

    // Header z przyciskiem usuwania
    const header = document.createElement('div');
    header.className = 'card__header';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'card__delete';
    deleteBtn.title = 'Usuń kartę';
    deleteBtn.setAttribute('aria-label', 'Usuń tę kartę');
    deleteBtn.textContent = '×';

    header.appendChild(deleteBtn);

    // Body z treścią (edytowalny)
    const body = document.createElement('div');
    body.className = 'card__body';
    body.contentEditable = 'true';
    body.textContent = text;
    body.setAttribute('aria-label', 'Treść karty - kliknij aby edytować');

    // Footer z przyciskami
    const footer = document.createElement('div');
    footer.className = 'card__footer';

    const moveLeftBtn = document.createElement('button');
    moveLeftBtn.className = 'card__move-left';
    moveLeftBtn.textContent = '←';
    moveLeftBtn.title = 'Przenieś do poprzedniej kolumny';
    moveLeftBtn.setAttribute('aria-label', 'Przenieś kartę w lewo');
    if (colName === 'todo') {
        moveLeftBtn.disabled = true;
        moveLeftBtn.setAttribute('aria-disabled', 'true');
    }

    const colorBtn = document.createElement('button');
    colorBtn.className = 'card__color-one';
    colorBtn.textContent = '🎨';
    colorBtn.title = 'Zmień kolor karty';
    colorBtn.setAttribute('aria-label', 'Zmień kolor tej karty');

    const moveRightBtn = document.createElement('button');
    moveRightBtn.className = 'card__move-right';
    moveRightBtn.textContent = '→';
    moveRightBtn.title = 'Przenieś do następnej kolumny';
    moveRightBtn.setAttribute('aria-label', 'Przenieś kartę w prawo');
    if (colName === 'done') {
        moveRightBtn.disabled = true;
        moveRightBtn.setAttribute('aria-disabled', 'true');
    }

    footer.appendChild(moveLeftBtn);
    footer.appendChild(colorBtn);
    footer.appendChild(moveRightBtn);

    // Złożenie karty
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    return card;
}

/**
 * Usunięcie karty
 * @param {HTMLElement} cardElement - Element karty do usunięcia
 * @param {string} colName - Nazwa kolumny
 */
function deleteCard(cardElement, colName) {
    cardElement.remove();
    updateColumnCount(colName);
    saveState();
}

/**
 * Przeniesienie karty w lewo (do poprzedniej kolumny)
 * @param {HTMLElement} cardElement - Element karty
 * @param {string} currentCol - Aktualna kolumna
 */
function moveCardLeft(cardElement, currentCol) {
    const currentIndex = COLUMN_NAMES.indexOf(currentCol);
    if (currentIndex <= 0) return; // już w pierwszej kolumnie

    const targetCol = COLUMN_NAMES[currentIndex - 1];
    moveCardToColumn(cardElement, currentCol, targetCol);
}

/**
 * Przeniesienie karty w prawo (do następnej kolumny)
 * @param {HTMLElement} cardElement - Element karty
 * @param {string} currentCol - Aktualna kolumna
 */
function moveCardRight(cardElement, currentCol) {
    const currentIndex = COLUMN_NAMES.indexOf(currentCol);
    if (currentIndex >= COLUMN_NAMES.length - 1) return; // już w ostatniej kolumnie

    const targetCol = COLUMN_NAMES[currentIndex + 1];
    moveCardToColumn(cardElement, currentCol, targetCol);
}

/**
 * Przeniesienie karty między kolumnami
 * @param {HTMLElement} cardElement - Element karty
 * @param {string} fromCol - Kolumna źródłowa
 * @param {string} toCol - Kolumna docelowa
 */
function moveCardToColumn(cardElement, fromCol, toCol) {
    // Pobierz dane karty
    const id = cardElement.dataset.id;
    const text = cardElement.querySelector('.card__body').textContent;
    const color = cardElement.style.backgroundColor;

    // Usuń kartę ze starej kolumny
    cardElement.remove();
    updateColumnCount(fromCol);

    // Dodaj kartę do nowej kolumny
    const newCard = createCardElement(id, text, color, toCol);
    cardsContainers[toCol].appendChild(newCard);
    updateColumnCount(toCol);

    saveState();
}

/**
 * Zmiana koloru pojedynczej karty
 * @param {HTMLElement} cardElement - Element karty
 */
function colorCard(cardElement) {
    const newColor = getRandomColor();
    cardElement.style.backgroundColor = newColor;
    saveState();
}

/**
 * Zmiana koloru wszystkich kart w kolumnie
 * @param {string} colName - Nazwa kolumny
 */
function colorColumn(colName) {
    const cards = cardsContainers[colName].querySelectorAll('.card');
    cards.forEach(card => {
        const newColor = getRandomColor();
        card.style.backgroundColor = newColor;
    });
    saveState();
}

/**
 * Sortowanie kart w kolumnie alfabetycznie
 * @param {string} colName - Nazwa kolumny
 */
function sortColumn(colName) {
    const container = cardsContainers[colName];
    const cards = Array.from(container.querySelectorAll('.card'));

    // Sortuj według treści (case-insensitive, polish locale)
    cards.sort((a, b) => {
        const textA = a.querySelector('.card__body').textContent.trim().toLowerCase();
        const textB = b.querySelector('.card__body').textContent.trim().toLowerCase();
        return textA.localeCompare(textB, 'pl');
    });

    // Przekładaj karty w posortowanej kolejności
    cards.forEach(card => container.appendChild(card));

    saveState();
}

// ========== COUNTER ==========

/**
 * Aktualizacja licznika kart w kolumnie
 * @param {string} colName - Nazwa kolumny
 */
function updateColumnCount(colName) {
    const count = cardsContainers[colName].querySelectorAll('.card').length;
    countElements[colName].textContent = count;
}

// ========== LOCAL STORAGE ==========

/**
 * Zapisanie stanu tablicy do localStorage
 */
function saveState() {
    const state = {
        columns: {}
    };

    COLUMN_NAMES.forEach(colName => {
        const cards = cardsContainers[colName].querySelectorAll('.card');
        state.columns[colName] = Array.from(cards).map(card => ({
            id: card.dataset.id,
            text: card.querySelector('.card__body').textContent,
            color: card.style.backgroundColor
        }));
    });

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Błąd zapisywania do localStorage:', e);
    }
}

/**
 * Wczytanie stanu tablicy z localStorage
 */
function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        // Brak zapisanego stanu - tablica pusta
        COLUMN_NAMES.forEach(colName => updateColumnCount(colName));
        return;
    }

    try {
        const state = JSON.parse(saved);

        // Wczytaj karty do każdej kolumny
        COLUMN_NAMES.forEach(colName => {
            const columnData = state.columns[colName] || [];
            columnData.forEach(cardData => {
                addCard(colName, cardData);
                // Aktualizuj counter dla największego ID
                const numId = parseInt(cardData.id.split('-')[1]);
                if (!isNaN(numId) && numId >= cardIdCounter) {
                    cardIdCounter = numId + 1;
                }
            });
        });
    } catch (e) {
        console.error('Błąd wczytywania stanu z localStorage:', e);
        COLUMN_NAMES.forEach(colName => updateColumnCount(colName));
    }
}

// ========== UTILITIES ==========

/**
 * Generowanie unikalnego ID dla karty
 * @returns {string} Unikalny identyfikator
 */
function generateCardId() {
    return `card-${cardIdCounter++}-${Date.now()}`;
}

/**
 * Losowy kolor z palety
 * @returns {string} Kod koloru hex
 */
function getRandomColor() {
    return CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
}
