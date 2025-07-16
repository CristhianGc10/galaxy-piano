/**
 * GALAXY PIANO - MAIN APPLICATION v1.0 RELEASE
 * Aplicación principal optimizada con UI avanzada
 * Sprint 5 - Versión final de producción
 */

class GalaxyPiano {
    constructor() {
        this.version = '1.0.0'; // 🎉 RELEASE VERSION
        this.buildDate = '2024-12-19';
        this.currentMode = 'live';
        this.isInitialized = false;
        
        // UI Manager para experiencia avanzada
        this.uiManager = null;
        
        // Módulos principales
        this.audioEngine = null;
        this.galaxyRenderer = null;
        this.starSystem = null;
        this.sequencer = null;
        this.musicTheory = null;
        this.projectManager = null;
        this.waves2DRenderer = null;
        this.spectrum3DRenderer = null;
        this.fileManager = null;
        
        // Estado optimizado de la aplicación
        this.state = {
            volume: 50,
            currentNotes: [],
            isPlaying: false,
            audioReady: false,
            galaxyReady: false,
            composerReady: false,
            analysisReady: false,
            currentProject: null,
            autoSave: true,
            wavesVisible: true,
            spectrumVisible: true,
            analysisMode: 'realtime',
            
            // Nuevos estados v1.0
            performanceMode: 'auto', // 'auto', 'performance', 'quality'
            accessibilityMode: false,
            debugMode: false,
            fullscreen: false
        };
        
        // Referencias DOM
        this.elements = {};
        
        // Configuración de rendimiento
        this.performance = {
            targetFPS: 60,
            adaptiveQuality: true,
            memoryLimit: 100, // MB
            autoOptimize: true
        };
        
        console.log(`🌌 Galaxy Piano v${this.version} iniciando - Production Release 🎵`);
    }
    
    /**
     * 🚀 Inicialización optimizada con loading progresivo
     */
    async init() {
        try {
            console.log('🎬 Iniciando Galaxy Piano v1.0...');
            
            // 1. Inicializar UI Manager primero
            await this.initUIManager();
            
            // 2. Configurar referencias DOM
            this.initDOMReferences();
            
            // 3. Detectar capacidades del navegador
            await this.detectBrowserCapabilities();
            
            // 4. Inicialización progresiva con feedback visual
            await this.progressiveInitialization();
            
            // 5. Configurar evento listeners optimizados
            this.setupOptimizedEventListeners();
            
            // 6. Configurar interfaz completa
            this.setupCompleteUI();
            
            // 7. Ejecutar tests de integración
            await this.runProductionTests();
            
            // 8. Finalizar inicialización
            this.finalizeInitialization();
            
        } catch (error) {
            console.error('💥 Error crítico en inicialización:', error);
            this.handleCriticalError(error);
        }
    }
    
    /**
     * Inicializar UI Manager
     */
    async initUIManager() {
        if (typeof UIManager === 'undefined') {
            throw new Error('UIManager no está disponible');
        }
        
        this.uiManager = new UIManager();
        this.uiManager.updateLoadingProgress(5, 'Inicializando interfaz...');
        
        console.log('🎨 UI Manager inicializado');
    }
    
    /**
     * Inicialización progresiva con feedback
     */
    async progressiveInitialization() {
        const initSteps = [
            { fn: this.initAudioEngine, progress: 20, message: 'Cargando motor de audio...' },
            { fn: this.initGalaxyRenderer, progress: 35, message: 'Renderizando galaxia 3D...' },
            { fn: this.initStarSystem, progress: 45, message: 'Creando sistema de estrellas...' },
            { fn: this.initSequencer, progress: 55, message: 'Configurando compositor...' },
            { fn: this.initMusicTheory, progress: 65, message: 'Cargando IA musical...' },
            { fn: this.initProjectManager, progress: 75, message: 'Preparando proyectos...' },
            { fn: this.initWaves2DRenderer, progress: 85, message: 'Análisis de ondas 2D...' },
            { fn: this.initSpectrum3DRenderer, progress: 90, message: 'Espectro 3D avanzado...' },
            { fn: this.initFileManager, progress: 95, message: 'Sistema de archivos...' }
        ];
        
        for (const step of initSteps) {
            try {
                this.uiManager.updateLoadingProgress(step.progress, step.message);
                await step.fn.call(this);
                await this.delay(100); // Dar tiempo para UI feedback
            } catch (error) {
                console.error(`❌ Error en ${step.fn.name}:`, error);
                this.uiManager.showNotification(
                    `Error cargando ${step.message.toLowerCase()}`, 
                    'warning'
                );
                // Continuar con otros módulos
            }
        }
    }
    
    /**
     * Detectar capacidades del navegador
     */
    async detectBrowserCapabilities() {
        const capabilities = {
            webAudio: !!(window.AudioContext || window.webkitAudioContext),
            webGL: !!window.WebGLRenderingContext,
            canvas2D: !!document.createElement('canvas').getContext,
            mediaRecorder: !!window.MediaRecorder,
            localStorage: this.testLocalStorage(),
            performance: !!window.performance,
            requestAnimationFrame: !!window.requestAnimationFrame
        };
        
        console.log('🔍 Capacidades del navegador:', capabilities);
        
        // Ajustar configuración según capacidades
        if (!capabilities.webGL) {
            this.performance.adaptiveQuality = false;
            this.uiManager.showNotification(
                'WebGL no disponible - visualización limitada', 
                'warning'
            );
        }
        
        if (!capabilities.webAudio) {
            throw new Error('Web Audio API no soportada - audio requerido');
        }
        
        this.state.browserCapabilities = capabilities;
    }
    
    /**
     * Test de localStorage
     */
    testLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Inicializar audio engine optimizado
     */
    async initAudioEngine() {
        if (typeof AudioEngine === 'undefined') {
            throw new Error('AudioEngine no disponible');
        }
        
        this.audioEngine = new AudioEngine();
        await this.audioEngine.init();
        
        this.state.audioReady = true;
        this.uiManager.updateModuleStatus('audio', 'active');
        
        console.log('🔊 Audio Engine optimizado inicializado');
    }
    
    /**
     * Inicializar galaxy renderer con optimización adaptativa
     */
    async initGalaxyRenderer() {
        if (typeof GalaxyRenderer === 'undefined') {
            throw new Error('GalaxyRenderer no disponible');
        }
        
        const canvas = this.elements.galaxyCanvas;
        if (!canvas) {
            throw new Error('Canvas de galaxia no encontrado');
        }
        
        this.galaxyRenderer = new GalaxyRenderer(canvas);
        
        // Configuración adaptativa según rendimiento
        if (this.performance.adaptiveQuality) {
            this.optimizeGalaxySettings();
        }
        
        await this.galaxyRenderer.init();
        
        this.state.galaxyReady = true;
        this.uiManager.updateModuleStatus('galaxy', 'active');
        
        console.log('🌌 Galaxy Renderer optimizado inicializado');
    }
    
    /**
     * Optimizar configuración de galaxia
     */
    optimizeGalaxySettings() {
        // Detectar rendimiento del dispositivo
        const isLowEnd = this.isLowEndDevice();
        
        if (isLowEnd) {
            this.galaxyRenderer.config.backgroundStars = 400;
            this.galaxyRenderer.config.starSize = 1.5;
            this.performance.targetFPS = 30;
            
            this.uiManager.showNotification(
                'Modo de rendimiento activado', 
                'info', 
                2000
            );
        }
    }
    
    /**
     * Detectar dispositivo de bajo rendimiento
     */
    isLowEndDevice() {
        // Heurísticas básicas
        const hardwareConcurrency = navigator.hardwareConcurrency || 1;
        const memory = navigator.deviceMemory || 1;
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        
        return hardwareConcurrency < 4 || memory < 2 || isMobile;
    }
    
    /**
     * Inicializar star system optimizado
     */
    initStarSystem() {
        if (typeof StarSystem === 'undefined') {
            throw new Error('StarSystem no disponible');
        }
        
        this.starSystem = new StarSystem(this.galaxyRenderer);
        
        // Configuración adaptativa
        if (this.isLowEndDevice()) {
            this.starSystem.config.maxStars = 50;
        }
        
        console.log('⭐ Star System optimizado inicializado');
    }
    
    /**
     * Inicializar sequencer con validación
     */
    async initSequencer() {
        if (typeof MusicalSequencer === 'undefined') {
            console.warn('⚠️ MusicalSequencer no disponible - modo compositor limitado');
            return;
        }
        
        this.sequencer = new MusicalSequencer(this.audioEngine, this.starSystem);
        
        this.state.composerReady = true;
        this.uiManager.updateModuleStatus('composer', 'active');
        
        console.log('🎼 Musical Sequencer inicializado');
    }
    
    /**
     * Inicializar music theory
     */
    initMusicTheory() {
        if (typeof MusicTheoryEngine === 'undefined') {
            console.warn('⚠️ MusicTheoryEngine no disponible - análisis limitado');
            return;
        }
        
        this.musicTheory = new MusicTheoryEngine();
        console.log('🎵 Music Theory Engine inicializado');
    }
    
    /**
     * Inicializar project manager
     */
    async initProjectManager() {
        if (typeof ProjectManager === 'undefined') {
            console.warn('⚠️ ProjectManager no disponible - sin persistencia');
            return;
        }
        
        this.projectManager = new ProjectManager(
            this.audioEngine,
            this.galaxyRenderer,
            this.starSystem,
            this.sequencer,
            this.musicTheory
        );
        
        // Cargar proyecto inicial
        const projects = this.projectManager.getProjectsList();
        if (projects.length > 0) {
            const currentProject = projects.find(p => p.isCurrent) || projects[0];
            await this.projectManager.loadProject(currentProject.id);
            this.state.currentProject = currentProject.id;
        }
        
        console.log('💾 Project Manager inicializado');
    }
    
    /**
     * Inicializar waves 2D renderer
     */
    async initWaves2DRenderer() {
        if (typeof Waves2DRenderer === 'undefined') {
            console.warn('⚠️ Waves2DRenderer no disponible - sin análisis 2D');
            return;
        }
        
        const canvas = this.elements.wavesCanvas;
        if (!canvas) {
            console.warn('⚠️ Canvas de ondas no encontrado');
            return;
        }
        
        this.waves2DRenderer = new Waves2DRenderer(canvas, this.audioEngine);
        await this.waves2DRenderer.init();
        
        console.log('🌊 Waves2D Renderer inicializado');
    }
    
    /**
     * Inicializar spectrum 3D renderer
     */
    async initSpectrum3DRenderer() {
        if (typeof Spectrum3DRenderer === 'undefined') {
            console.warn('⚠️ Spectrum3DRenderer no disponible - sin espectro 3D');
            return;
        }
        
        const canvas = this.elements.spectrumCanvas;
        if (!canvas) {
            console.warn('⚠️ Canvas de espectro no encontrado');
            return;
        }
        
        this.spectrum3DRenderer = new Spectrum3DRenderer(canvas, this.audioEngine);
        await this.spectrum3DRenderer.init();
        
        this.state.analysisReady = true;
        this.uiManager.updateModuleStatus('analysis', 'active');
        
        console.log('📊 Spectrum3D Renderer inicializado');
    }
    
    /**
     * Inicializar file manager
     */
    initFileManager() {
        if (typeof FileManager === 'undefined') {
            console.warn('⚠️ FileManager no disponible - sin exportación');
            return;
        }
        
        this.fileManager = new FileManager(
            this.audioEngine,
            this.projectManager,
            this.sequencer,
            this.musicTheory
        );
        
        console.log('📁 File Manager inicializado');
    }
    
    /**
     * Configurar event listeners optimizados
     */
    setupOptimizedEventListeners() {
        // Debounced event listeners para mejor rendimiento
        this.setupDebouncedInputs();
        this.setupOptimizedMouseEvents();
        this.setupKeyboardShortcuts();
        this.setupWindowEvents();
        
        console.log('🎧 Event listeners optimizados configurados');
    }
    
    /**
     * Configurar inputs con debounce
     */
    setupDebouncedInputs() {
        // Input de notas con debounce
        const noteInputs = [
            this.elements.noteInput,
            this.elements.composerNoteInput,
            this.elements.analysisNoteInput
        ].filter(Boolean);
        
        noteInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', this.debounce((e) => {
                    this.handleNoteInputChange(e.target.value, input.id);
                }, 300));
            }
        });
        
        // Volume slider con throttle
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', 
                this.throttle((e) => {
                    this.updateVolume(parseInt(e.target.value));
                }, 50)
            );
        }
    }
    
    /**
     * Configurar eventos de mouse optimizados
     */
    setupOptimizedMouseEvents() {
        // Botones principales
        const buttonMappings = {
            playButton: () => this.playNotes(),
            stopButton: () => this.stopNotes(),
            composerPlayButton: () => this.playComposerSequence(),
            composerStopButton: () => this.stopComposerSequence(),
            analyzeButton: () => this.analyzeNotes(),
            exportMidiButton: () => this.exportToMIDI(),
            exportMp3Button: () => this.exportToMP3(),
            exportJsonButton: () => this.exportToJSON(),
            exportScreenshotButton: () => this.exportScreenshot()
        };
        
        Object.entries(buttonMappings).forEach(([elementKey, handler]) => {
            const element = this.elements[elementKey];
            if (element) {
                element.addEventListener('click', async (e) => {
                    e.preventDefault();
                    this.uiManager.setLoadingState(elementKey, true);
                    
                    try {
                        await handler();
                        this.uiManager.trackUserAction('button_click', { button: elementKey });
                    } catch (error) {
                        this.handleActionError(error, `Error en ${elementKey}`);
                    } finally {
                        this.uiManager.setLoadingState(elementKey, false);
                    }
                });
            }
        });
    }
    
    /**
     * Configurar atajos de teclado
     */
    setupKeyboardShortcuts() {
        // Los atajos están manejados por UIManager
        console.log('⌨️ Atajos de teclado configurados por UIManager');
    }
    
    /**
     * Configurar eventos de ventana
     */
    setupWindowEvents() {
        // Resize optimizado con debounce
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 100));
        
        // Visibility API para optimización
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseNonEssentialSystems();
            } else {
                this.resumeNonEssentialSystems();
            }
        });
        
        // Cleanup al cerrar
        window.addEventListener('beforeunload', () => {
            this.handleAppExit();
        });
    }
    
    /**
     * Pausar sistemas no esenciales
     */
    pauseNonEssentialSystems() {
        if (this.galaxyRenderer && this.galaxyRenderer.state.isAnimating) {
            this.galaxyRenderer.stopAnimation();
        }
        
        if (this.spectrum3DRenderer && this.spectrum3DRenderer.state.isAnimating) {
            this.spectrum3DRenderer.stopAnimation();
        }
    }
    
    /**
     * Reanudar sistemas
     */
    resumeNonEssentialSystems() {
        if (this.galaxyRenderer && !this.galaxyRenderer.state.isAnimating) {
            this.galaxyRenderer.startAnimation();
        }
        
        if (this.spectrum3DRenderer && !this.spectrum3DRenderer.state.isAnimating) {
            this.spectrum3DRenderer.startAnimation();
        }
    }
    
    /**
     * Manejar cambios en input de notas
     */
    handleNoteInputChange(value, inputId) {
        if (!value.trim()) return;
        
        // Análisis en tiempo real para compositor
        if (inputId === 'composer-note-input' && this.musicTheory) {
            this.analyzeComposerInput(value);
        }
        
        // Preview para análisis
        if (inputId === 'analysis-note-input' && this.musicTheory) {
            this.previewAnalysis(value);
        }
    }
    
    /**
     * Reproducir notas optimizado
     */
    async playNotes() {
        const input = this.elements.noteInput?.value?.trim();
        if (!input) {
            this.uiManager.showNotification('Ingresa una nota (1-88)', 'warning');
            return;
        }
        
        try {
            const notes = this.parseNoteInput(input);
            
            if (notes.length === 0) {
                throw new Error('Formato de nota inválido');
            }
            
            // Validación optimizada
            const invalidNotes = notes.filter(note => note < 1 || note > 88);
            if (invalidNotes.length > 0) {
                throw new Error(`Notas fuera de rango: ${invalidNotes.join(', ')}`);
            }
            
            // Reproducir con feedback
            this.uiManager.trackUserAction('play_notes', { notes, count: notes.length });
            
            await this.audioEngine.playNotes(notes);
            
            if (this.starSystem) {
                this.starSystem.createStars(notes, 2.0, 0.8);
            }
            
            // Análisis musical si hay múltiples notas
            if (this.musicTheory && notes.length > 1) {
                const analysis = this.musicTheory.analyzeChord(notes);
                if (analysis.bestMatch) {
                    this.updateChordInfo(analysis.bestMatch.displayName);
                    this.uiManager.showNotification(
                        `Acorde: ${analysis.bestMatch.displayName}`, 
                        'success', 
                        2000
                    );
                }
            }
            
            this.state.currentNotes = notes;
            this.updateNoteDisplay(notes);
            
        } catch (error) {
            this.handleActionError(error, 'Error reproduciendo notas');
        }
    }
    
    /**
     * Analizar notas en modo análisis
     */
    async analyzeNotes() {
        const input = this.elements.analysisNoteInput?.value?.trim();
        if (!input) {
            this.uiManager.showNotification('Ingresa notas para analizar', 'warning');
            return;
        }
        
        try {
            const notes = this.parseNoteInput(input);
            
            this.uiManager.trackUserAction('analyze_notes', { notes, count: notes.length });
            
            // Reproducir audio
            await this.audioEngine.playNotes(notes, 3.0, 0.8);
            
            // Visualizaciones
            if (this.state.wavesVisible && this.waves2DRenderer) {
                if (notes.length === 1) {
                    this.waves2DRenderer.addNote(notes[0], 3000, 0.8);
                } else {
                    this.waves2DRenderer.addChord(notes, 3000, 0.8);
                }
            }
            
            if (this.starSystem) {
                this.starSystem.createStars(notes, 3.0, 0.8);
            }
            
            // Análisis musical
            if (this.musicTheory && notes.length > 1) {
                const analysis = this.musicTheory.analyzeChord(notes);
                if (analysis.bestMatch) {
                    this.updateChordInfo(analysis.bestMatch.displayName);
                    this.uiManager.showNotification(
                        `✨ Análisis: ${analysis.bestMatch.displayName} (${Math.round(analysis.confidence * 100)}%)`, 
                        'success'
                    );
                }
            }
            
            this.state.currentNotes = notes;
            this.updateNoteDisplay(notes);
            
        } catch (error) {
            this.handleActionError(error, 'Error en análisis');
        }
    }
    
    /**
     * Exportar a MIDI optimizado
     */
    async exportToMIDI() {
        if (!this.fileManager) {
            throw new Error('Sistema de exportación no disponible');
        }
        
        this.uiManager.showNotification('Iniciando exportación MIDI...', 'info');
        
        const result = await this.fileManager.exportToMIDI(this.state.currentProject, {
            includeMetadata: true,
            trackSeparation: true,
            quantization: 16
        });
        
        if (result.success) {
            this.uiManager.showNotification(
                `✅ MIDI guardado: ${result.filename}`, 
                'success'
            );
            this.uiManager.trackUserAction('export', { format: 'midi', size: result.size });
        }
        
        return result;
    }
    
    /**
     * Cambiar modo con animación
     */
    async switchMode(mode) {
        if (!['live', 'composer', 'analysis'].includes(mode) || mode === this.currentMode) {
            return;
        }
        
        const fromMode = this.currentMode;
        this.currentMode = mode;
        
        // Detener reproducción
        this.stopAllPlayback();
        
        // Animación de transición
        await this.uiManager.animateModeTransition(fromMode, mode);
        
        // Actualizar navegación
        this.updateNavigation(mode);
        
        // Configuraciones específicas
        if (mode === 'composer') {
            this.initComposerMode();
        } else if (mode === 'analysis') {
            this.initAnalysisMode();
        }
        
        // Actualizar clase del body
        document.body.className = 'galaxy-mode-' + mode;
        
        this.uiManager.trackUserAction('mode_switch', { from: fromMode, to: mode });
        this.uiManager.showNotification(`Modo ${mode} activado`, 'info', 1500);
        
        console.log('🔄 Modo cambiado:', fromMode, '→', mode);
    }
    
    /**
     * Detener toda reproducción
     */
    stopAllPlayback() {
        if (this.audioEngine) {
            this.audioEngine.stopAll();
        }
        
        if (this.sequencer) {
            this.sequencer.stopSequence();
        }
        
        this.state.isPlaying = false;
        this.state.currentNotes = [];
        this.updateNoteDisplay([]);
    }
    
    /**
     * Actualizar navegación
     */
    updateNavigation(activeMode) {
        this.elements.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === activeMode);
        });
    }
    
    /**
     * Tests de producción
     */
    async runProductionTests() {
        if (!this.isDevelopmentMode()) return;
        
        console.log('🧪 Ejecutando tests de producción...');
        
        const testResults = {
            audio: await this.testAudioSystem(),
            galaxy: this.testGalaxySystem(),
            ui: this.testUISystem(),
            performance: this.testPerformance()
        };
        
        const allPassed = Object.values(testResults).every(result => result === true);
        
        if (allPassed) {
            console.log('✅ Todos los tests de producción PASARON');
            this.uiManager.showNotification('✅ Sistema verificado', 'success', 2000);
        } else {
            console.warn('⚠️ Algunos tests fallaron:', testResults);
            this.uiManager.showNotification('⚠️ Verificación con advertencias', 'warning');
        }
        
        return testResults;
    }
    
    /**
     * Test sistema de audio
     */
    async testAudioSystem() {
        try {
            if (!this.audioEngine || !this.audioEngine.state.isReady) {
                return false;
            }
            
            // Test nota básica
            await this.audioEngine.testNote(40, 0.1);
            return true;
        } catch (error) {
            console.error('❌ Test audio falló:', error);
            return false;
        }
    }
    
    /**
     * Test sistema de galaxia
     */
    testGalaxySystem() {
        return this.state.galaxyReady && this.galaxyRenderer && this.galaxyRenderer.state.isInitialized;
    }
    
    /**
     * Test sistema de UI
     */
    testUISystem() {
        return this.uiManager && 
               document.getElementById('toast-container') &&
               this.elements.noteInput !== null;
    }
    
    /**
     * Test rendimiento
     */
    testPerformance() {
        const memoryMB = this.getMemoryUsage();
        const fps = this.uiManager.performanceData.fps;
        
        return memoryMB < this.performance.memoryLimit && fps > 30;
    }
    
    /**
     * Obtener uso de memoria
     */
    getMemoryUsage() {
        if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        return 0;
    }
    
    /**
     * Finalizar inicialización
     */
    finalizeInitialization() {
        this.isInitialized = true;
        
        // Ocultar loading screen
        this.uiManager.updateLoadingProgress(100, '¡Listo para explorar el universo musical! 🌌');
        setTimeout(() => {
            this.uiManager.hideLoadingScreen();
        }, 800);
        
        // Estado inicial
        this.updateSystemStatus();
        this.updateVolume(this.state.volume);
        this.switchMode('live');
        
        // Bienvenida
        setTimeout(() => {
            this.uiManager.showNotification(
                `🎉 ¡Bienvenido a Galaxy Piano v${this.version}!`, 
                'success',
                3000
            );
        }, 1000);
        
        console.log(`✨ Galaxy Piano v${this.version} inicializado correctamente`);
        this.uiManager.trackUserAction('app_initialized', { 
            version: this.version,
            loadTime: performance.now()
        });
    }
    
    /**
     * Manejar error crítico
     */
    handleCriticalError(error) {
        console.error('💥 Error crítico:', error);
        
        // Mostrar error amigable
        this.uiManager.showNotification(
            'Error crítico de inicialización - recargando...', 
            'error',
            5000
        );
        
        // Auto-reload después de delay
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
    
    /**
     * Manejar errores de acciones
     */
    handleActionError(error, context = 'Operación') {
        console.error(`❌ ${context}:`, error);
        this.uiManager.showNotification(`${context}: ${error.message}`, 'error');
    }
    
    /**
     * Verificar modo desarrollo
     */
    isDevelopmentMode() {
        return this.uiManager.isDevelopmentMode();
    }
    
    /**
     * Utilidades de debounce y throttle
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
    }
    
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
    }
    
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Obtener estadísticas completas del sistema
     */
    getSystemStats() {
        return {
            version: this.version,
            buildDate: this.buildDate,
            mode: this.currentMode,
            initialized: this.isInitialized,
            uptime: performance.now(),
            
            modules: {
                audio: this.audioEngine?.getStats() || null,
                galaxy: this.galaxyRenderer?.getInfo() || null,
                stars: this.starSystem?.getStats() || null,
                sequencer: this.sequencer?.getStats() || null,
                musicTheory: this.musicTheory?.getStats() || null,
                projects: this.projectManager?.getStats() || null,
                waves2D: this.waves2DRenderer?.getStats() || null,
                spectrum3D: this.spectrum3DRenderer?.getStats() || null,
                fileManager: this.fileManager?.getStats() || null
            },
            
            performance: {
                memory: this.getMemoryUsage(),
                fps: this.uiManager.performanceData.fps,
                targetFPS: this.performance.targetFPS
            },
            
            state: this.state
        };
    }
    
    // Mantener métodos existentes para compatibilidad
    initDOMReferences() { /* Implementación existente */ }
    updateVolume(volume) { /* Implementación existente */ }
    parseNoteInput(input) { /* Implementación existente */ }
    updateNoteDisplay(notes) { /* Implementación existente */ }
    updateChordInfo(chord) { /* Implementación existente */ }
    updateSystemStatus() { /* Implementación existente */ }
    playComposerSequence() { /* Implementación existente */ }
    stopComposerSequence() { /* Implementación existente */ }
    stopNotes() { /* Implementación existente */ }
    analyzeComposerInput(input) { /* Implementación existente */ }
    previewAnalysis(input) { /* Implementación existente */ }
    exportToMP3() { /* Implementación existente */ }
    exportToJSON() { /* Implementación existente */ }
    exportScreenshot() { /* Implementación existente */ }
    initComposerMode() { /* Implementación existente */ }
    initAnalysisMode() { /* Implementación existente */ }
    handleWindowResize() { /* Implementación existente */ }
    handleAppExit() { /* Implementación existente */ }
    
    /**
     * Destruir aplicación completa
     */
    destroy() {
        // Destruir en orden inverso
        if (this.fileManager) this.fileManager.destroy();
        if (this.spectrum3DRenderer) this.spectrum3DRenderer.destroy();
        if (this.waves2DRenderer) this.waves2DRenderer.destroy();
        if (this.projectManager) this.projectManager.destroy();
        if (this.starSystem) this.starSystem.destroy();
        if (this.galaxyRenderer) this.galaxyRenderer.destroy();
        if (this.audioEngine) this.audioEngine.destroy();
        if (this.uiManager) this.uiManager.destroy();
        
        console.log(`🛑 Galaxy Piano v${this.version} destruido`);
    }
}

// Inicialización automática optimizada
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.galaxyPiano = new GalaxyPiano();
        await window.galaxyPiano.init();
    } catch (error) {
        console.error('💥 Error fatal en inicialización:', error);
        
        // Fallback UI básico
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #0a0a0f; color: white; font-family: Arial;">
                <div style="text-align: center;">
                    <h1>🌌 Galaxy Piano</h1>
                    <p>Error de inicialización crítico</p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🔄 Recargar
                    </button>
                </div>
            </div>
        `;
    }
});

// Cleanup global
window.addEventListener('beforeunload', () => {
    if (window.galaxyPiano) {
        window.galaxyPiano.destroy();
    }
});