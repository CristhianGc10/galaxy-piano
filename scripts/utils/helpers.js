/**
 * GALAXY PIANO - HELPERS
 * Utilidades y funciones auxiliares
 * Sprint 1 - Fundación
 */

const GalaxyHelpers = {
    
    /**
     * Convertir número de nota (1-88) a frecuencia Hz
     */
    noteToFrequency(noteNumber) {
        // Fórmula estándar: f = 440 * 2^((n-69)/12)
        // Nota 69 = A4 = 440Hz
        // Ajustamos para nuestro sistema 1-88
        const adjustedNote = noteNumber + 20; // Nota 1 → 21 en sistema estándar
        return 440 * Math.pow(2, (adjustedNote - 69) / 12);
    },
    
    /**
     * Convertir número de nota a nombre musical
     */
    noteToName(noteNumber) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Ajustar para nuestro sistema 1-88
        const adjustedNote = noteNumber + 20; // Nota 1 → 21
        const noteIndex = (adjustedNote - 21) % 12; // C0 como base
        const octave = Math.floor((adjustedNote - 21) / 12);
        
        return noteNames[noteIndex] + octave;
    },
    
    /**
     * Obtener color de estrella según registro tonal
     */
    getStarColor(noteNumber) {
        if (noteNumber >= 1 && noteNumber <= 15) {
            return '#4a90e2'; // Azul - Graves extremos
        } else if (noteNumber >= 16 && noteNumber <= 30) {
            return '#87ceeb'; // Azul-Blanco - Graves
        } else if (noteNumber >= 31 && noteNumber <= 45) {
            return '#ffffff'; // Blanco - Medios-Graves
        } else if (noteNumber >= 46 && noteNumber <= 60) {
            return '#fffacd'; // Blanco-Amarillo - Medios-Agudos
        } else if (noteNumber >= 61 && noteNumber <= 75) {
            return '#ffd700'; // Amarillo - Agudos
        } else if (noteNumber >= 76 && noteNumber <= 85) {
            return '#ff6347'; // Naranja - Muy Agudos
        } else if (noteNumber >= 86 && noteNumber <= 88) {
            return '#ff0000'; // Rojo - Extremos Agudos
        }
        return '#ffffff'; // Blanco por defecto
    },
    
    /**
     * Calcular posición 3D para una nota en la galaxia
     */
    getNotePosition3D(noteNumber, timeOffset = 0) {
        // Mapear nota a coordenadas galácticas
        const angle = (noteNumber / 88) * Math.PI * 2; // Rotación completa
        const radius = 50 + (noteNumber / 88) * 100; // Radio variable
        const height = (noteNumber - 44) * 2; // Altura según registro
        
        return {
            x: Math.cos(angle + timeOffset) * radius,
            y: height,
            z: Math.sin(angle + timeOffset) * radius
        };
    },
    
    /**
     * Validar número de nota
     */
    isValidNote(noteNumber) {
        return Number.isInteger(noteNumber) && noteNumber >= 1 && noteNumber <= 88;
    },
    
    /**
     * Validar array de notas
     */
    validateNotes(notes) {
        if (!Array.isArray(notes)) {
            return { valid: false, error: 'Debe ser un array' };
        }
        
        if (notes.length === 0) {
            return { valid: false, error: 'Array vacío' };
        }
        
        const invalidNotes = notes.filter(note => !this.isValidNote(note));
        if (invalidNotes.length > 0) {
            return { 
                valid: false, 
                error: `Notas inválidas: ${invalidNotes.join(', ')}` 
            };
        }
        
        return { valid: true };
    },
    
    /**
     * Formatear tiempo en segundos a MM:SS
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    /**
     * Generar ID único
     */
    generateId() {
        return 'galaxy-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },
    
    /**
     * Interpolar entre dos valores
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },
    
    /**
     * Mapear valor de un rango a otro
     */
    map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },
    
    /**
     * Clamp valor entre min y max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * Convertir grados a radianes
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    /**
     * Convertir radianes a grados
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },
    
    /**
     * Obtener información del navegador
     */
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        const isChrome = userAgent.includes('Chrome');
        const isFirefox = userAgent.includes('Firefox');
        const isSafari = userAgent.includes('Safari') && !isChrome;
        const isEdge = userAgent.includes('Edge');
        
        return {
            isChrome,
            isFirefox,
            isSafari,
            isEdge,
            userAgent,
            webAudioSupported: !!(window.AudioContext || window.webkitAudioContext),
            webGLSupported: !!window.WebGLRenderingContext
        };
    },
    
    /**
     * Log con formato para Galaxy Piano
     */
    log(type, message, data = null) {
        const timestamp = new Date().toISOString().substr(11, 8);
        const emoji = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            debug: '🔍',
            audio: '🔊',
            galaxy: '🌌',
            note: '🎵'
        };
        
        const prefix = `${emoji[type] || 'ℹ️'} [${timestamp}] Galaxy Piano:`;
        
        if (data) {
            console.log(prefix, message, data);
        } else {
            console.log(prefix, message);
        }
    },
    
    /**
     * Detectar soporte de características del navegador
     */
    checkBrowserSupport() {
        const support = {
            webAudio: !!(window.AudioContext || window.webkitAudioContext),
            webGL: !!window.WebGLRenderingContext,
            es6: (function() {
                try {
                    eval('const test = () => {};');
                    return true;
                } catch (e) {
                    return false;
                }
            })(),
            localStorage: !!window.localStorage,
            fullscreen: !!(document.fullscreenEnabled || document.webkitFullscreenEnabled)
        };
        
        return support;
    },
    
    /**
     * Mostrar información de soporte
     */
    logBrowserSupport() {
        const support = this.checkBrowserSupport();
        const browserInfo = this.getBrowserInfo();
        
        this.log('info', 'Información del navegador:');
        console.table(browserInfo);
        
        this.log('info', 'Soporte de características:');
        console.table(support);
        
        // Warnings para características no soportadas
        if (!support.webAudio) {
            this.log('warning', 'Web Audio API no soportada. Audio limitado.');
        }
        
        if (!support.webGL) {
            this.log('warning', 'WebGL no soportado. Visualización 3D limitada.');
        }
        
        if (!support.es6) {
            this.log('warning', 'ES6 no soportado completamente.');
        }
        
        return support;
    }
};

// Hacer disponible globalmente
window.GalaxyHelpers = GalaxyHelpers;