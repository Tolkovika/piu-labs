import { store } from './store.js';
import { randomColor } from './helpers.js';

/**
 * Moduł UI - zarządza interfejsem użytkownika i nasłuchuje zmian w store
 */
class UI {
    constructor() {
        // Elementy DOM
        this.addSquareBtn = null;
        this.addCircleBtn = null;
        this.recolorSquaresBtn = null;
        this.recolorCirclesBtn = null;
        this.shapesContainer = null;
        this.squaresCounter = null;
        this.circlesCounter = null;
        this.totalCounter = null;

        // Mapa ID → element DOM dla efektywnego renderowania
        this.shapeElements = new Map();
    }

    /**
     * Inicjalizuje UI - znajduje elementy DOM i podpina event listenery
     */
    init() {
        this.findElements();
        this.attachEventListeners();
        this.subscribeToStore();
        // Pierwsze renderowanie
        this.render();
    }

    /**
     * Znajduje wszystkie potrzebne elementy DOM
     */
    findElements() {
        this.addSquareBtn = document.getElementById('add-square');
        this.addCircleBtn = document.getElementById('add-circle');
        this.recolorSquaresBtn = document.getElementById('recolor-squares');
        this.recolorCirclesBtn = document.getElementById('recolor-circles');
        this.shapesContainer = document.getElementById('shapes-container');
        this.squaresCounter = document.getElementById('squares-count');
        this.circlesCounter = document.getElementById('circles-count');
        this.totalCounter = document.getElementById('total-count');
    }

    /**
     * Podpina event listenery do przycisków i kontenera
     */
    attachEventListeners() {
        // Przyciski dodawania kształtów
        this.addSquareBtn.addEventListener('click', () => {
            store.addShape('square', randomColor());
        });

        this.addCircleBtn.addEventListener('click', () => {
            store.addShape('circle', randomColor());
        });

        // Przyciski przekolorowywania
        this.recolorSquaresBtn.addEventListener('click', () => {
            store.recolorShapes('square');
        });

        this.recolorCirclesBtn.addEventListener('click', () => {
            store.recolorShapes('circle');
        });

        // Event delegation - usuwanie kształtów
        this.shapesContainer.addEventListener('click', (event) => {
            const shapeElement = event.target.closest('.shape');
            if (shapeElement) {
                const id = shapeElement.dataset.id;
                store.removeShape(id);
            }
        });
    }

    /**
     * Subskrybuje zmiany w store
     */
    subscribeToStore() {
        store.subscribe(() => this.render());
    }

    /**
     * Renderuje interfejs - częściowo (tylko zmiany)
     */
    render() {
        const state = store.getState();

        // Aktualizuj liczniki
        this.updateCounters();

        // Aktualizuj kształty - częściowe renderowanie
        this.updateShapes(state.shapes);
    }

    /**
     * Aktualizuje liczniki
     */
    updateCounters() {
        this.squaresCounter.textContent = store.getSquaresCount();
        this.circlesCounter.textContent = store.getCirclesCount();
        this.totalCounter.textContent = store.getTotalCount();
    }

    /**
     * Aktualizuje kształty w DOM - tylko zmiany, nie pełne przerenderowanie
     * @param {Array} shapes - Aktualna lista kształtów ze store
     */
    updateShapes(shapes) {
        const currentIds = new Set(shapes.map(s => s.id));
        const existingIds = new Set(this.shapeElements.keys());

        // Usuń kształty, które zniknęły ze stanu
        for (const id of existingIds) {
            if (!currentIds.has(id)) {
                const element = this.shapeElements.get(id);
                element.remove();
                this.shapeElements.delete(id);
            }
        }

        // Dodaj nowe kształty i zaktualizuj istniejące
        shapes.forEach(shape => {
            if (this.shapeElements.has(shape.id)) {
                // Zaktualizuj istniejący element (np. kolor)
                const element = this.shapeElements.get(shape.id);
                element.style.backgroundColor = shape.color;
            } else {
                // Utwórz nowy element
                const element = this.createShapeElement(shape);
                this.shapesContainer.appendChild(element);
                this.shapeElements.set(shape.id, element);
            }
        });

        // Zarządzaj widocznością empty-state
        this.updateEmptyState(shapes.length === 0);
    }

    /**
     * Pokazuje lub ukrywa komunikat o pustej liście
     * @param {boolean} isEmpty - Czy lista kształtów jest pusta
     */
    updateEmptyState(isEmpty) {
        let emptyState = this.shapesContainer.querySelector('.empty-state');

        if (isEmpty) {
            // Pokaż empty-state jeśli nie istnieje
            if (!emptyState) {
                emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.textContent = 'Kliknij przycisk, aby dodać kształt ✨';
                this.shapesContainer.appendChild(emptyState);
            }
        } else {
            // Usuń empty-state jeśli istnieje
            if (emptyState) {
                emptyState.remove();
            }
        }
    }

    /**
     * Tworzy element DOM dla kształtu
     * @param {Object} shape - Obiekt kształtu
     * @returns {HTMLElement} Element DOM
     */
    createShapeElement(shape) {
        const div = document.createElement('div');
        div.className = `shape ${shape.type}`;
        div.dataset.id = shape.id;
        div.style.backgroundColor = shape.color;
        div.title = 'Kliknij, aby usunąć';
        return div;
    }
}

// Eksportuj funkcję inicjalizującą
export function initUI() {
    const ui = new UI();
    ui.init();
}
