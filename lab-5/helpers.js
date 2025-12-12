/**
 * Generuje unikatowy identyfikator dla kształtu
 * @returns {string} Unikalny ID (timestamp + losowy hex)
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Generuje losowy kolor w formacie hex
 * @returns {string} Kolor w formacie #rrggbb
 */
export function randomColor() {
    const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}
