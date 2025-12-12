import { generateId, randomColor } from './helpers.js';

/**
 * Store zarządzający stanem aplikacji z wzorcem Observer
 */
class Store {
    constructor() {
        this.state = {
            shapes: []
        };
        this.listeners = [];
        this.STORAGE_KEY = 'shapes-app-state';

        // Wczytaj stan z localStorage przy starcie
        this.loadFromLocalStorage();
    }

    /**
     * Zwraca kopię stanu (tylko do odczytu)
     * @returns {Object} Kopia stanu
     */
    getState() {
        return { ...this.state, shapes: [...this.state.shapes] };
    }

    /**
     * Dodaje nowy kształt
     * @param {string} type - Typ kształtu: 'square' lub 'circle'
     * @param {string} color - Kolor w formacie #rrggbb
     */
    addShape(type, color) {
        const newShape = {
            id: generateId(),
            type,
            color
        };
        this.state.shapes.push(newShape);
        this.saveToLocalStorage();
        this.notify();
    }

    /**
     * Usuwa kształt o podanym ID
     * @param {string} id - ID kształtu do usunięcia
     */
    removeShape(id) {
        this.state.shapes = this.state.shapes.filter(shape => shape.id !== id);
        this.saveToLocalStorage();
        this.notify();
    }

    /**
     * Przekolorowuje wszystkie kształty danego typu
     * @param {string} type - Typ kształtu: 'square' lub 'circle'
     */
    recolorShapes(type) {
        this.state.shapes = this.state.shapes.map(shape => {
            if (shape.type === type) {
                return { ...shape, color: randomColor() };
            }
            return shape;
        });
        this.saveToLocalStorage();
        this.notify();
    }

    /**
     * Liczy wszystkie kwadraty
     * @returns {number} Liczba kwadratów
     */
    getSquaresCount() {
        return this.state.shapes.filter(shape => shape.type === 'square').length;
    }

    /**
     * Liczy wszystkie kółka
     * @returns {number} Liczba kółek
     */
    getCirclesCount() {
        return this.state.shapes.filter(shape => shape.type === 'circle').length;
    }

    /**
     * Liczy wszystkie kształty
     * @returns {number} Łączna liczba kształtów
     */
    getTotalCount() {
        return this.state.shapes.length;
    }

    /**
     * Rejestruje funkcję nasłuchującą zmian stanu
     * @param {Function} listener - Funkcja wywoływana przy zmianie stanu
     */
    subscribe(listener) {
        this.listeners.push(listener);
    }

    /**
     * Usuwa funkcję nasłuchującą
     * @param {Function} listener - Funkcja do usunięcia
     */
    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    /**
     * Powiadamia wszystkich subskrybentów o zmianie stanu
     */
    notify() {
        this.listeners.forEach(listener => listener());
    }

    /**
     * Zapisuje stan do localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.error('Błąd zapisu do localStorage:', error);
        }
    }

    /**
     * Wczytuje stan z localStorage
     */
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.state = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Błąd odczytu z localStorage:', error);
            this.state = { shapes: [] };
        }
    }
}

// Eksportuj pojedynczą instancję store
export const store = new Store();
