import { initUI } from './ui.js';

/**
 * Punkt wejścia aplikacji
 */
function init() {
    initUI();
}

// Inicjalizuj aplikację po załadowaniu DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
