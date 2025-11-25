/* ============================================
   TINY ARCADE - Utility Functions
   Common helpers for games
   ============================================ */

// ============================================
// Score Manager - Local Storage based
// ============================================
class ScoreManager {
    constructor(gameKey) {
        this.key = `tiny-arcade-${gameKey}-best`;
    }

    getBest() {
        return parseInt(localStorage.getItem(this.key) || '0');
    }

    setBest(score) {
        localStorage.setItem(this.key, score.toString());
    }

    update(currentScore) {
        const best = this.getBest();
        if (currentScore > best) {
            this.setBest(currentScore);
            return true; // New high score!
        }
        return false;
    }

    clear() {
        localStorage.removeItem(this.key);
    }
}

// ============================================
// Display Updater - DOM helpers
// ============================================
class DisplayUpdater {
    constructor(elementIds = {}) {
        this.elements = {};
        for (const [key, id] of Object.entries(elementIds)) {
            const el = document.getElementById(id);
            if (el) {
                this.elements[key] = el;
            }
        }
    }

    update(key, value) {
        if (this.elements[key]) {
            this.elements[key].textContent = value;
        }
    }

    updateFormatted(key, value) {
        if (this.elements[key]) {
            this.elements[key].textContent = value.toLocaleString();
        }
    }

    bump(key, duration = 150) {
        if (this.elements[key]) {
            this.elements[key].classList.add('bump');
            setTimeout(() => {
                this.elements[key].classList.remove('bump');
            }, duration);
        }
    }

    updateWithBump(key, value, formatted = false) {
        if (formatted) {
            this.updateFormatted(key, value);
        } else {
            this.update(key, value);
        }
        this.bump(key);
    }

    show(key) {
        if (this.elements[key]) {
            this.elements[key].classList.add('visible');
        }
    }

    hide(key) {
        if (this.elements[key]) {
            this.elements[key].classList.remove('visible');
        }
    }
}

// ============================================
// Input Handler - Keyboard mapping
// ============================================
class InputHandler {
    constructor() {
        this.callbacks = {};
        this.enabled = true;

        document.addEventListener('keydown', (e) => this.handleKey(e));
    }

    handleKey(e) {
        if (!this.enabled) return;

        const key = e.key.toLowerCase();
        const callback = this.callbacks[key] || this.callbacks[e.key];

        if (callback) {
            e.preventDefault();
            callback(e);
        }
    }

    on(keys, callback) {
        if (Array.isArray(keys)) {
            keys.forEach(key => {
                this.callbacks[key.toLowerCase()] = callback;
            });
        } else {
            this.callbacks[keys.toLowerCase()] = callback;
        }
        return this;
    }

    onArrows(callback) {
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(key => {
            this.callbacks[key] = (e) => callback(key.replace('Arrow', '').toLowerCase(), e);
        });
        return this;
    }

    onWASD(callback) {
        const map = { w: 'up', a: 'left', s: 'down', d: 'right' };
        Object.entries(map).forEach(([key, dir]) => {
            this.callbacks[key] = (e) => callback(dir, e);
        });
        return this;
    }

    onDirection(callback) {
        this.onArrows(callback);
        this.onWASD(callback);
        return this;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    clear() {
        this.callbacks = {};
    }
}

// ============================================
// Game State Manager
// ============================================
class GameState {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.started = false;
        this.listeners = {};
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.emit('reset');
    }

    start() {
        this.started = true;
        this.emit('start');
    }

    end() {
        this.gameOver = true;
        this.emit('gameOver');
    }

    togglePause() {
        this.paused = !this.paused;
        this.emit('pause', this.paused);
        return this.paused;
    }

    addScore(points) {
        this.score += points;
        this.emit('score', this.score);
        return this.score;
    }

    setLevel(level) {
        this.level = level;
        this.emit('level', this.level);
    }

    // Simple event system
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

// ============================================
// Utility Functions
// ============================================

// Random integer in range [min, max]
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random element from array
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Linear interpolation
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Check collision between two rectangles
function rectCollision(r1, r2) {
    return r1.x < r2.x + r2.w &&
           r1.x + r1.w > r2.x &&
           r1.y < r2.y + r2.h &&
           r1.y + r1.h > r2.y;
}

// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
