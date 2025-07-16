/**
 * GALAXY PIANO - MAIN APPLICATION
 * Arquitectura Modular y Punto de Entrada
 * Sprint 1 - Fundación
 */

class GalaxyPiano {
    constructor() {
        this.version = '1.0.0';
        this.currentMode = 'live';
        this.isInitialized = false;
        
        // Módulos principales
        this.audioEngine = null;
        this.galaxyRenderer = null;
        this.starSystem = null;
        
        // Estado de la aplicación
        this.state = {
            volume: 50,
            currentNotes: [],
            isPlaying: false,
            audioReady: false,
            galaxyReady: false
        };
        
        // Referencias DOM
        this.elements = {};
        
        console.log('🌌 Galaxy Piano v' + this.version + ' iniciando...');
    }
    
    /**
     * Inicialización de la aplicación
     */
    async init() {
        try {
            console.log('🚀 Iniciando Galaxy Piano...');
            
            // 1. Obtener referencias DOM
            this.initDOMReferences();
            
            // 2. Configurar event listeners
            this.setupEventListeners();
            
            // 3. Inicializar audio engine
            await this.initAudioEngine();
            
            // 4. Inicializar galaxy renderer (preparación)
            this.initGalaxyRenderer();
            
            // 5. Configurar interfaz inicial
            this.setupInitialUI();
            
            this.isInitialized = true;
            console.log('✅ Galaxy Piano inicializado correctamente');
            
            this.updateSystemStatus();
            
        } catch (error) {
            console.error('❌ Error inicializando Galaxy Piano:', error);
            this.showError('Error de inicialización: ' + error.message);
        }
    }
    
    /**
     * Obtener referencias a elementos DOM
     */
    initDOMReferences() {
        this.elements = {
            // Navigation
            navButtons: document.querySelectorAll('.nav-btn'),
            
            // Mode sections
            liveModeSection: document.getElementById('live-mode'),
            composerModeSection: document.getElementById('composer-mode'),
            analysisModeSection: document.getElementById('analysis-mode'),
            
            // Controls
            noteInput: document.getElementById('note-input'),
            playButton: document.getElementById('play-btn'),
            stopButton: document.getElementById('stop-btn'),
            volumeSlider: document.getElementById('volume'),
            volumeDisplay: document.getElementById('volume-display'),
            
            // Galaxy
            galaxyCanvas: document.getElementById('galaxy-canvas'),
            loadingIndicator: document.getElementById('loading'),
            
            // Status displays
            currentNotesDisplay: document.getElementById('current-notes'),
            chordInfoDisplay: document.getElementById('chord-info'),
            audioStatusDisplay: document.getElementById('audio-status'),
            galaxyStatusDisplay: document.getElementById('galaxy-status')
        };
        
        console.log('📋 Referencias DOM obtenidas');
    }
    
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Navigation
        this.elements.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Play button
        this.elements.playButton.addEventListener('click', () => {
            this.playNotes();
        });
        
        // Stop button
        this.elements.stopButton.addEventListener('click', () => {
            this.stopNotes();
        });
        
        // Note input - Enter key
        this.elements.noteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.playNotes();
            }
        });
        
        // Volume control
        this.elements.volumeSlider.addEventListener('input', (e) => {
            this.updateVolume(parseInt(e.target.value));
        });
        
        // Galaxy canvas resize
        window.addEventListener('resize', () => {
            if (this.galaxyRenderer) {
                this.galaxyRenderer.handleResize();
            }
        });
        
        console.log('🎧 Event listeners configurados');
    }
    
    /**
     * Inicializar motor de audio
     */
    async initAudioEngine() {
        try {
            if (typeof AudioEngine === 'undefined') {
                throw new Error('AudioEngine no está disponible');
            }
            
            this.audioEngine = new AudioEngine();
            await this.audioEngine.init();
            
            this.state.audioReady = true;
            console.log('🔊 Audio Engine inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando audio:', error);
            this.showError('Error de audio: ' + error.message);
        }
    }
    
    /**
     * Inicializar renderer de galaxia
     */
    initGalaxyRenderer() {
        try {
            // Por ahora solo preparamos el contenedor
            // En Sprint 2 implementaremos el renderer 3D completo
            this.updateGalaxyStatus('Preparando espacio 3D...');
            
            // Simular carga
            setTimeout(() => {
                this.state.galaxyReady = true;
                this.updateGalaxyStatus('Listo (Sprint 2)');
                this.hideLoading();
            }, 2000);
            
            console.log('🌌 Galaxy Renderer preparado');
            
        } catch (error) {
            console.error('❌ Error preparando galaxy:', error);
            this.showError('Error de galaxia: ' + error.message);
        }
    }
    
    /**
     * Configurar interfaz inicial
     */
    setupInitialUI() {
        // Volumen inicial
        this.updateVolume(this.state.volume);
        
        // Modo inicial
        this.switchMode('live');
        
        // Status inicial
        this.updateNoteDisplay([]);
        this.updateChordInfo('---');
        
        console.log('🎨 UI inicial configurada');
    }
    
    /**
     * Cambiar modo de la aplicación
     */
    switchMode(mode) {
        if (!['live', 'composer', 'analysis'].includes(mode)) {
            console.error('Modo inválido:', mode);
            return;
        }
        
        this.currentMode = mode;
        
        // Actualizar navegación
        this.elements.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Mostrar sección correspondiente
        document.querySelectorAll('.mode-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(mode + '-mode');
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Actualizar clase del body para estilos específicos
        document.body.className = 'galaxy-mode-' + mode;
        
        console.log('🔄 Modo cambiado a:', mode);
    }
    
    /**
     * Reproducir notas desde el input
     */
    async playNotes() {
        if (!this.state.audioReady) {
            this.showError('Audio no está listo');
            return;
        }
        
        const input = this.elements.noteInput.value.trim();
        if (!input) {
            this.showError('Ingresa una nota (1-88)');
            return;
        }
        
        try {
            // Parsear notas del input
            const notes = this.parseNoteInput(input);
            
            if (notes.length === 0) {
                this.showError('Formato de nota inválido');
                return;
            }
            
            // Validar rango
            const invalidNotes = notes.filter(note => note < 1 || note > 88);
            if (invalidNotes.length > 0) {
                this.showError('Notas fuera de rango (1-88): ' + invalidNotes.join(', '));
                return;
            }
            
            console.log('🎵 Reproduciendo notas:', notes);
            
            // Reproducir con audio engine
            await this.audioEngine.playNotes(notes);
            
            // Actualizar estado
            this.state.currentNotes = notes;
            this.state.isPlaying = true;
            
            // Actualizar UI
            this.updateNoteDisplay(notes);
            this.detectAndDisplayChord(notes);
            
            // En Sprint 2: Crear estrellas en la galaxia
            // this.starSystem.createStars(notes);
            
        } catch (error) {
            console.error('❌ Error reproduciendo notas:', error);
            this.showError('Error de reproducción: ' + error.message);
        }
    }
    
    /**
     * Detener todas las notas
     */
    stopNotes() {
        if (this.audioEngine) {
            this.audioEngine.stopAll();
        }
        
        this.state.isPlaying = false;
        this.state.currentNotes = [];
        
        this.updateNoteDisplay([]);
        this.updateChordInfo('---');
        
        console.log('⏹️ Notas detenidas');
    }
    
    /**
     * Parsear input de notas
     */
    parseNoteInput(input) {
        // Soportar formatos: "40", "40,43,47", "40 43 47"
        const cleanInput = input.replace(/\s+/g, ',');
        const noteStrings = cleanInput.split(',').filter(s => s.length > 0);
        
        const notes = [];
        for (const noteStr of noteStrings) {
            const note = parseInt(noteStr.trim());
            if (!isNaN(note)) {
                notes.push(note);
            }
        }
        
        return notes;
    }
    
    /**
     * Actualizar volumen
     */
    updateVolume(volume) {
        this.state.volume = Math.max(0, Math.min(100, volume));
        
        if (this.audioEngine) {
            this.audioEngine.setVolume(this.state.volume / 100);
        }
        
        this.elements.volumeSlider.value = this.state.volume;
        this.elements.volumeDisplay.textContent = this.state.volume + '%';
    }
    
    /**
     * Actualizar display de notas actuales
     */
    updateNoteDisplay(notes) {
        if (notes.length === 0) {
            this.elements.currentNotesDisplay.textContent = 'Notas: Ninguna';
        } else {
            const noteNames = notes.map(note => {
                if (typeof NoteMapping !== 'undefined') {
                    return NoteMapping.getNoteName(note);
                }
                return note.toString();
            });
            this.elements.currentNotesDisplay.textContent = 'Notas: ' + noteNames.join(', ');
        }
    }
    
    /**
     * Detectar y mostrar información de acorde
     */
    detectAndDisplayChord(notes) {
        if (notes.length < 2) {
            this.updateChordInfo('---');
            return;
        }
        
        // Detección básica de acordes (expandir en Sprint 3)
        if (notes.length === 3) {
            // Ejemplo: C major = notas 40,44,47 (C4,E4,G4)
            const sortedNotes = [...notes].sort((a, b) => a - b);
            const intervals = [
                sortedNotes[1] - sortedNotes[0],
                sortedNotes[2] - sortedNotes[1]
            ];
            
            if (intervals[0] === 4 && intervals[1] === 3) {
                this.updateChordInfo('Acorde Mayor');
            } else if (intervals[0] === 3 && intervals[1] === 4) {
                this.updateChordInfo('Acorde Menor');
            } else {
                this.updateChordInfo('Acorde Personalizado');
            }
        } else {
            this.updateChordInfo('Multi-nota (' + notes.length + ')');
        }
    }
    
    /**
     * Actualizar información de acorde
     */
    updateChordInfo(chordName) {
        this.elements.chordInfoDisplay.textContent = 'Acorde: ' + chordName;
    }
    
    /**
     * Actualizar estado del sistema
     */
    updateSystemStatus() {
        // Audio status
        if (this.state.audioReady) {
            this.elements.audioStatusDisplay.textContent = '🔊 Audio: Listo';
            this.elements.audioStatusDisplay.className = 'success-state';
        } else {
            this.elements.audioStatusDisplay.textContent = '🔇 Audio: Cargando...';
            this.elements.audioStatusDisplay.className = 'loading-state';
        }
    }
    
    /**
     * Actualizar estado de la galaxia
     */
    updateGalaxyStatus(status) {
        this.elements.galaxyStatusDisplay.textContent = '🌌 Galaxy: ' + status;
        
        if (this.state.galaxyReady) {
            this.elements.galaxyStatusDisplay.className = 'success-state';
        } else {
            this.elements.galaxyStatusDisplay.className = 'loading-state';
        }
    }
    
    /**
     * Ocultar indicador de carga
     */
    hideLoading() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.classList.add('hidden');
        }
    }
    
    /**
     * Mostrar error al usuario
     */
    showError(message) {
        console.error('⚠️ Error:', message);
        
        // TODO: Implementar sistema de notificaciones más elegante
        alert('Galaxy Piano - Error: ' + message);
    }
    
    /**
     * Cleanup al cerrar la aplicación
     */
    destroy() {
        if (this.audioEngine) {
            this.audioEngine.destroy();
        }
        
        if (this.galaxyRenderer) {
            this.galaxyRenderer.destroy();
        }
        
        console.log('🛑 Galaxy Piano destruido');
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    window.galaxyPiano = new GalaxyPiano();
    await window.galaxyPiano.init();
});

// Cleanup al cerrar la ventana
window.addEventListener('beforeunload', () => {
    if (window.galaxyPiano) {
        window.galaxyPiano.destroy();
    }
});