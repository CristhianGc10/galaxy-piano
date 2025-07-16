/**
 * GALAXY PIANO - MAIN APPLICATION
 * Sprint 2 - Integración Audio + Visual COMPLETA
 */

class GalaxyPiano {
    constructor() {
        this.version = '2.0.0';
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
            galaxyReady: false,
            starSystemReady: false
        };
        
        // Referencias DOM
        this.elements = {};
        
        console.log('🌌 Galaxy Piano v' + this.version + ' iniciando...');
        console.log('🎯 Sprint 2: Sistema de Estrellas Musicales');
    }
    
    /**
     * Inicialización completa de la aplicación
     */
    async init() {
        try {
            console.log('🚀 Iniciando Galaxy Piano Sprint 2...');
            
            // 1. Verificar dependencias
            this.checkDependencies();
            
            // 2. Obtener referencias DOM
            this.initDOMReferences();
            
            // 3. Configurar event listeners
            this.setupEventListeners();
            
            // 4. Inicializar audio engine
            await this.initAudioEngine();
            
            // 5. Inicializar galaxy renderer
            await this.initGalaxyRenderer();
            
            // 6. Inicializar star system
            await this.initStarSystem();
            
            // 7. Configurar interfaz inicial
            this.setupInitialUI();
            
            this.isInitialized = true;
            console.log('✅ Galaxy Piano Sprint 2 inicializado correctamente');
            
            this.updateSystemStatus();
            this.hideLoading();
            
            // Test inicial
            setTimeout(() => this.runInitialTest(), 1000);
            
        } catch (error) {
            console.error('❌ Error inicializando Galaxy Piano:', error);
            this.showError('Error de inicialización: ' + error.message);
        }
    }
    
    /**
     * Verificar que todas las dependencias estén cargadas
     */
    checkDependencies() {
        const dependencies = {
            'Three.js': typeof THREE !== 'undefined',
            'AudioEngine': typeof AudioEngine !== 'undefined',
            'GalaxyRenderer': typeof GalaxyRenderer !== 'undefined',
            'StarSystem': typeof StarSystem !== 'undefined',
            'NoteMapping': typeof window.NoteMapping !== 'undefined'
        };
        
        console.log('🔍 Verificando dependencias:');
        let allOk = true;
        
        Object.entries(dependencies).forEach(([name, available]) => {
            const status = available ? '✅' : '❌';
            console.log(`   ${status} ${name}`);
            if (!available) allOk = false;
        });
        
        if (!allOk) {
            throw new Error('Dependencias faltantes. Verificar carga de scripts.');
        }
        
        console.log('✅ Todas las dependencias disponibles');
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
        
        // Verificar elementos críticos
        if (!this.elements.galaxyCanvas) {
            throw new Error('Canvas #galaxy-canvas no encontrado');
        }
        
        console.log('📋 Referencias DOM obtenidas y verificadas');
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
            console.log('🔊 Inicializando Audio Engine...');
            
            this.audioEngine = new AudioEngine();
            await this.audioEngine.init();
            
            this.state.audioReady = true;
            console.log('✅ Audio Engine listo');
            
            this.updateAudioStatus('Listo');
            
        } catch (error) {
            console.error('❌ Error inicializando audio:', error);
            this.updateAudioStatus('Error: ' + error.message);
            this.showError('Error de audio: ' + error.message);
        }
    }
    
    /**
     * Inicializar renderer de galaxia
     */
    async initGalaxyRenderer() {
        try {
            console.log('🌌 Inicializando Galaxy Renderer...');
            this.updateGalaxyStatus('Inicializando espacio 3D...');
            
            // Crear instancia del renderer
            this.galaxyRenderer = new GalaxyRenderer(this.elements.galaxyCanvas);
            
            // Inicializar
            await this.galaxyRenderer.init();
            
            this.state.galaxyReady = true;
            console.log('✅ Galaxy Renderer listo');
            
            this.updateGalaxyStatus('Espacio 3D listo');
            
        } catch (error) {
            console.error('❌ Error inicializando galaxy renderer:', error);
            this.updateGalaxyStatus('Error: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Inicializar sistema de estrellas
     */
    async initStarSystem() {
        try {
            console.log('⭐ Inicializando Star System...');
            this.updateGalaxyStatus('Configurando estrellas...');
            
            if (!this.galaxyRenderer) {
                throw new Error('GalaxyRenderer debe estar inicializado primero');
            }
            
            // Crear instancia del sistema de estrellas
            this.starSystem = new StarSystem(this.galaxyRenderer);
            
            this.state.starSystemReady = true;
            console.log('✅ Star System listo');
            
            this.updateGalaxyStatus('Listo');
            
        } catch (error) {
            console.error('❌ Error inicializando star system:', error);
            this.updateGalaxyStatus('Error: ' + error.message);
            throw error;
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
     * Test inicial del sistema
     */
    runInitialTest() {
        console.log('🧪 Ejecutando test inicial...');
        
        if (this.state.audioReady && this.state.galaxyReady && this.state.starSystemReady) {
            console.log('✅ Todos los sistemas listos');
            console.log('🎯 Prueba escribir "40" y hacer clic en "🎵 Tocar"');
            console.log('🎨 O usa los botones de test de colores');
        } else {
            console.log('⚠️ Algunos sistemas no están listos:');
            console.log('   Audio:', this.state.audioReady ? '✅' : '❌');
            console.log('   Galaxy:', this.state.galaxyReady ? '✅' : '❌');
            console.log('   Stars:', this.state.starSystemReady ? '✅' : '❌');
        }
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
     * Reproducir notas con integración audio-visual completa
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
            
            // 1. REPRODUCIR AUDIO
            await this.audioEngine.playNotes(notes, 3.0); // 3 segundos
            
            // 2. CREAR ESTRELLAS (integración visual)
            if (this.starSystem && this.state.starSystemReady) {
                const stars = this.starSystem.createStars(notes, 3.0, 1.0);
                console.log('⭐ Estrellas creadas:', stars.length);
            } else {
                console.log('⚠️ StarSystem no disponible');
            }
            
            // 3. ACTUALIZAR UI
            this.state.currentNotes = notes;
            this.state.isPlaying = true;
            
            this.updateNoteDisplay(notes);
            this.detectAndDisplayChord(notes);
            
            console.log('✅ Reproducción completa: audio + visual');
            
        } catch (error) {
            console.error('❌ Error reproduciendo notas:', error);
            this.showError('Error de reproducción: ' + error.message);
        }
    }
    
    /**
     * Detener todas las notas y estrellas
     */
    stopNotes() {
        console.log('⏹️ Deteniendo todo...');
        
        // 1. Detener audio
        if (this.audioEngine) {
            this.audioEngine.stopAll();
        }
        
        // 2. Detener estrellas
        if (this.starSystem) {
            this.starSystem.stopAll();
        }
        
        this.state.isPlaying = false;
        this.state.currentNotes = [];
        
        this.updateNoteDisplay([]);
        this.updateChordInfo('---');
        
        console.log('✅ Todo detenido');
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
                if (window.NoteMapping) {
                    const info = window.NoteMapping.getNoteInfo(note);
                    return `${note} (${info?.noteName || 'N/A'})`;
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
        
        // Detección básica de acordes
        if (notes.length === 3) {
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
        this.updateAudioStatus();
        this.updateGalaxyStatus();
    }
    
    /**
     * Actualizar estado del audio
     */
    updateAudioStatus(customStatus = null) {
        let status, className;
        
        if (customStatus) {
            status = customStatus;
            className = customStatus.includes('Error') ? 'error-state' : 'success-state';
        } else if (this.state.audioReady) {
            status = 'Listo';
            className = 'success-state';
        } else {
            status = 'Cargando...';
            className = 'loading-state';
        }
        
        this.elements.audioStatusDisplay.textContent = '🔊 Audio: ' + status;
        this.elements.audioStatusDisplay.className = className;
    }
    
    /**
     * Actualizar estado de la galaxia
     */
    updateGalaxyStatus(customStatus = null) {
        let status, className;
        
        if (customStatus) {
            status = customStatus;
            className = customStatus.includes('Error') ? 'error-state' : 'loading-state';
        } else if (this.state.galaxyReady && this.state.starSystemReady) {
            status = 'Listo';
            className = 'success-state';
        } else if (this.state.galaxyReady) {
            status = 'Configurando estrellas...';
            className = 'loading-state';
        } else {
            status = 'Cargando...';
            className = 'loading-state';
        }
        
        this.elements.galaxyStatusDisplay.textContent = '🌌 Galaxy: ' + status;
        this.elements.galaxyStatusDisplay.className = className;
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
        alert('Galaxy Piano - Error: ' + message);
    }
    
    /**
     * Métodos de debug y testing
     */
    testStarColors() {
        console.log('🧪 Testing colores de estrellas...');
        
        if (!this.starSystem) {
            console.log('❌ StarSystem no disponible');
            return;
        }
        
        // Test de cada color
        const testNotes = [1, 15, 30, 45, 60, 75, 88];
        const colors = ['Azul', 'Azul-Blanco', 'Blanco', 'Blanco-Amarillo', 'Amarillo', 'Naranja', 'Rojo'];
        
        testNotes.forEach((note, index) => {
            setTimeout(() => {
                console.log(`🎨 Test ${colors[index]} - Nota ${note}`);
                this.starSystem.testStar(note, 2.0);
            }, index * 1000);
        });
    }
    
    getSystemInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            state: this.state,
            audioStats: this.audioEngine?.getStats(),
            galaxyInfo: this.galaxyRenderer?.getInfo(),
            starStats: this.starSystem?.getStats()
        };
    }
    
    /**
     * Cleanup al cerrar la aplicación
     */
    destroy() {
        if (this.audioEngine) {
            this.audioEngine.destroy();
        }
        
        if (this.starSystem) {
            this.starSystem.destroy();
        }
        
        if (this.galaxyRenderer) {
            this.galaxyRenderer.destroy();
        }
        
        console.log('🛑 Galaxy Piano destruido');
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Esperar un poco para asegurar que todos los scripts estén cargados
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.galaxyPiano = new GalaxyPiano();
        await window.galaxyPiano.init();
        
    } catch (error) {
        console.error('❌ Error crítico inicializando Galaxy Piano:', error);
        
        // Mostrar información de debug
        setTimeout(() => {
            console.log('\n🔍 INFORMACIÓN DE DEBUG:');
            console.log('========================');
            console.log('Three.js:', typeof THREE !== 'undefined' ? '✅' : '❌');
            console.log('AudioEngine:', typeof AudioEngine !== 'undefined' ? '✅' : '❌');
            console.log('GalaxyRenderer:', typeof GalaxyRenderer !== 'undefined' ? '✅' : '❌');
            console.log('StarSystem:', typeof StarSystem !== 'undefined' ? '✅' : '❌');
            console.log('NoteMapping:', typeof window.NoteMapping !== 'undefined' ? '✅' : '❌');
            console.log('Canvas:', document.getElementById('galaxy-canvas') ? '✅' : '❌');
        }, 1000);
    }
});

// Cleanup al cerrar la ventana
window.addEventListener('beforeunload', () => {
    if (window.galaxyPiano) {
        window.galaxyPiano.destroy();
    }
});

// Funciones globales para testing
window.testStar = (note = 40) => {
    if (window.galaxyPiano?.starSystem) {
        window.galaxyPiano.starSystem.testStar(note, 3.0);
    } else {
        console.log('⚠️ StarSystem no disponible');
    }
};

window.testColors = () => {
    if (window.galaxyPiano) {
        window.galaxyPiano.testStarColors();
    }
};

window.getGalaxyInfo = () => {
    if (window.galaxyPiano) {
        console.table(window.galaxyPiano.getSystemInfo());
    }
};