/**
 * ========================================
 * AJAX LIBRARY - LAB 6
 * ========================================
 * Modułowa biblioteka do obsługi HTTP w JavaScript
 * 
 * Funkcjonalności:
 * - Uproszczony interfejs dla fetch()
 * - Automatyczna obsługa JSON (kodowanie/dekodowanie)
 * - Timeout z AbortController
 * - Globalna konfiguracja (headers, baseURL, timeout)
 * - Automatyczna obsługa błędów HTTP i sieci
 * - Metody: get, post, put, delete
 * - Async/await w całym kodzie
 */

class Ajax {
    /**
     * Konstruktor biblioteki Ajax
     * @param {Object} options - Globalne opcje konfiguracyjne
     * @param {string} options.baseURL - Bazowy URL dla wszystkich requestów (domyślnie '')
     * @param {Object} options.headers - Domyślne nagłówki HTTP (domyślnie {'Content-Type': 'application/json'})
     * @param {number} options.timeout - Timeout w milisekundach (domyślnie 5000)
     * 
     * @example
     * const api = new Ajax({
     *   baseURL: 'https://api.example.com',
     *   headers: { 'Authorization': 'Bearer token' },
     *   timeout: 10000
     * });
     */
    constructor(options = {}) {
        // Domyślna konfiguracja - zawsze ustawiona nawet bez parametrów
        this.config = {
            baseURL: options.baseURL || '',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: options.timeout || 5000
        };
    }

    /**
     * Prywatna metoda do wykonywania requestów
     * Centralizuje logikę fetch, timeout, error handling i JSON parsing
     * @private
     * @param {string} url - URL requestu (może być relatywny do baseURL)
     * @param {Object} options - Opcje requestu (metoda, headers, body, timeout)
     * @returns {Promise<any>} Odpowiedź w formacie JSON lub null
     * @throws {Error} Błąd sieci, HTTP lub timeout
     */
    async _request(url, options = {}) {
        // Połącz baseURL z url
        const fullURL = this.config.baseURL + url;

        // Merge globalnych opcji z lokalnymi
        // Lokalne opcje nadpisują globalne
        const mergedOptions = {
            headers: {
                ...this.config.headers,
                ...options.headers
            },
            ...options
        };

        // Timeout z AbortController
        const timeout = options.timeout !== undefined ? options.timeout : this.config.timeout;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            // Wykonaj fetch z signal dla timeout
            const response = await fetch(fullURL, {
                ...mergedOptions,
                signal: controller.signal
            });

            // Wyczyść timeout po otrzymaniu odpowiedzi
            clearTimeout(timeoutId);

            // Sprawdź czy odpowiedź jest OK (status 2xx)
            if (!response.ok) {
                // Pobierz dodatkowe informacje o błędzie z body
                let errorText = '';
                try {
                    errorText = await response.text();
                } catch (e) {
                    // Ignoruj błędy parsowania error message
                }

                throw new Error(
                    `HTTP Error ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`
                );
            }

            // Automatycznie parsuj JSON
            // Sprawdź content-type
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            // Sprawdź czy jest jakiś tekst w odpowiedzi
            const text = await response.text();
            if (text) {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    // Jeśli parsowanie JSON się nie uda, zwróć surowy tekst
                    return text;
                }
            }

            // Brak contentu (np. 204 No Content)
            return null;

        } catch (error) {
            // Wyczyść timeout w przypadku błędu
            clearTimeout(timeoutId);

            // Obsługa timeout
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${timeout}ms`);
            }

            // Obsługa błędów sieci
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error(`Network error: ${error.message}`);
            }

            // Przekaż dalej inne błędy (np. HTTP errors)
            throw error;
        }
    }

    /**
     * GET request - pobieranie danych
     * @param {string} url - URL requestu (relatywny do baseURL lub pełny)
     * @param {Object} options - Opcjonalne opcje requestu (headers, timeout)
     * @returns {Promise<any>} Odpowiedź w formacie JSON
     * @throws {Error} Błąd sieci, HTTP lub timeout
     * 
     * @example
     * const user = await api.get('/users/1');
     * const users = await api.get('/users', { timeout: 10000 });
     */
    async get(url, options = {}) {
        return this._request(url, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * POST request - tworzenie zasobu
     * @param {string} url - URL requestu
     * @param {Object} data - Dane do wysłania (automatycznie konwertowane na JSON)
     * @param {Object} options - Opcjonalne opcje requestu (headers, timeout)
     * @returns {Promise<any>} Odpowiedź w formacie JSON
     * @throws {Error} Błąd sieci, HTTP lub timeout
     * 
     * @example
     * const newPost = await api.post('/posts', {
     *   title: 'Tytuł',
     *   body: 'Treść'
     * });
     */
    async post(url, data = {}, options = {}) {
        return this._request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request - aktualizacja zasobu
     * @param {string} url - URL requestu
     * @param {Object} data - Dane do wysłania (automatycznie konwertowane na JSON)
     * @param {Object} options - Opcjonalne opcje requestu (headers, timeout)
     * @returns {Promise<any>} Odpowiedź w formacie JSON
     * @throws {Error} Błąd sieci, HTTP lub timeout
     * 
     * @example
     * const updated = await api.put('/posts/1', {
     *   title: 'Nowy tytuł'
     * });
     */
    async put(url, data = {}, options = {}) {
        return this._request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request - usuwanie zasobu
     * @param {string} url - URL requestu
     * @param {Object} options - Opcjonalne opcje requestu (headers, timeout)
     * @returns {Promise<any>} Odpowiedź w formacie JSON lub null
     * @throws {Error} Błąd sieci, HTTP lub timeout
     * 
     * @example
     * await api.delete('/posts/1');
     */
    async delete(url, options = {}) {
        return this._request(url, {
            ...options,
            method: 'DELETE'
        });
    }

    /**
     * PATCH request - częściowa aktualizacja zasobu (bonus)
     * @param {string} url - URL requestu
     * @param {Object} data - Dane do wysłania (automatycznie konwertowane na JSON)
     * @param {Object} options - Opcjonalne opcje requestu (headers, timeout)
     * @returns {Promise<any>} Odpowiedź w formacie JSON
     * @throws {Error} Błąd sieci, HTTP lub timeout
     * 
     * @example
     * const patched = await api.patch('/posts/1', { title: 'Nowy tytuł' });
     */
    async patch(url, data = {}, options = {}) {
        return this._request(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
}

// Export klasy (dla użycia jako moduł ES6 lub CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ajax;
}
