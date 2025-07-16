/**
 * GALAXY PIANO - MAIN APPLICATION COMPLETO
 * Aplicación principal completa con todas las funcionalidades
 * Sprint 5 - v1.0 Release Final
 */

class GalaxyPiano {
    constructor() {
        this.version = '1.0.0';
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
        
        // Estado de la aplicación
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
            performanceMode: 'auto',
            accessibilityMode: false,
            debugMode: false,
            fullscreen: false,
            browserCapabilities: {}
        };
        
        // Referencias DOM
        this.elements = {};
        
        // Configuración de rendimiento
        this.performance = {
            targetFPS: 60,
            adaptiveQuality: true,
            memoryLimit: 100,
            autoOptimize: true
        };
        
        console.log(`🌌 Galaxy Piano v${this.version} iniciando - Production Release 🎵`);
    }
    
    /**
     * ========================================
     * INICIALIZACIÓN PRINCIPAL
     * ========================================
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
    
    async initUIManager() {
        if (typeof UIManager === 'undefined') {
            throw new Error('UIManager no está disponible');
        }
        
        this.uiManager = new UIManager();
        this.uiManager.updateLoadingProgress(5, 'Inicializando interfaz...');
        
        console.log('🎨 UI Manager inicializado');
    }
    
    initDOMReferences() {
        this.elements = {
            // Inputs principales
            noteInput: document.getElementById('note-input'),
            composerNoteInput: document.getElementById('composer-note-input'),
            analysisNoteInput: document.getElementById('analysis-note-input'),
            
            // Controles de volumen
            volumeSlider: document.getElementById('volume'),
            volumeDisplay: document.getElementById('volume-display'),
            
            // Botones principales
            playButton: document.getElementById('play-btn'),
            stopButton: document.getElementById('stop-btn'),
            composerPlayButton: document.getElementById('composer-play-btn'),
            composerStopButton: document.getElementById('composer-stop-btn'),
            analyzeButton: document.getElementById('analyze-btn'),
            
            // Botones de proyecto
            newProjectButton: document.getElementById('new-project-btn'),
            saveProjectButton: document.getElementById('save-project-btn'),
            deleteProjectButton: document.getElementById('delete-project-btn'),
            
            // Botones de exportación
            exportMidiButton: document.getElementById('export-midi-btn'),
            exportMp3Button: document.getElementById('export-mp3-btn'),
            exportJsonButton: document.getElementById('export-json-btn'),
            exportScreenshotButton: document.getElementById('export-screenshot-btn'),
            
            // Canvas elements
            galaxyCanvas: document.getElementById('galaxy-canvas'),
            galaxyCanvasComposer: document.getElementById('galaxy-canvas-composer'),
            galaxyCanvasAnalysis: document.getElementById('galaxy-canvas-analysis'),
            wavesCanvas: document.getElementById('waves-canvas'),
            spectrumCanvas: document.getElementById('spectrum-canvas'),
            
            // Navegación
            navButtons: document.querySelectorAll('.nav-btn'),
            
            // Project management
            projectSelect: document.getElementById('project-select'),
            projectName: document.getElementById('project-name'),
            projectDescription: document.getElementById('project-description'),
            
            // Análisis
            chordAnalysis: document.getElementById('chord-analysis'),
            chordSuggestions: document.getElementById('chord-suggestions'),
            currentKey: document.getElementById('current-key'),
            currentScale: document.getElementById('current-scale'),
            chordProgression: document.getElementById('chord-progression'),
            
            // Status displays
            currentNotes: document.getElementById('current-notes'),
            chordInfo: document.getElementById('chord-info'),
            audioStatus: document.getElementById('audio-status'),
            galaxyStatus: document.getElementById('galaxy-status'),
            composerStatus: document.getElementById('composer-status'),
            analysisStatus: document.getElementById('analysis-status'),
            
            // BPM control
            bpmSlider: document.getElementById('bpm-slider'),
            bpmDisplay: document.getElementById('bpm-display'),
            
            // Sequencer
            addSequenceButton: document.getElementById('add-sequence-btn'),
            sequencerGrid: document.getElementById('sequencer-grid'),
            
            // Export progress
            exportProgress: document.getElementById('export-progress'),
            exportProgressFill: document.getElementById('export-progress-fill'),
            exportProgressText: document.getElementById('export-progress-text'),
            
            // Help
            helpButton: document.getElementById('help-btn'),
            helpModal: document.getElementById('help-modal')
        };
        
        console.log('📋 Referencias DOM configuradas');
    }
    
    /**
     * ========================================
     * DETECCIÓN DE CAPACIDADES
     * ========================================
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
        
        if (!capabilities.webGL) {
            this.performance.adaptiveQuality = false;
            this.uiManager.showNotification('WebGL no disponible - visualización limitada', 'warning');
        }
        
        if (!capabilities.webAudio) {
            throw new Error('Web Audio API no soportada - audio requerido');
        }
        
        this.state.browserCapabilities = capabilities;
    }
    
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
     * ========================================
     * INICIALIZACIÓN PROGRESIVA
     * ========================================
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
                await this.delay(100);
            } catch (error) {
                console.error(`❌ Error en ${step.fn.name}:`, error);
                this.uiManager.showNotification(`Error cargando ${step.message.toLowerCase()}`, 'warning');
            }
        }
    }
    
    async initAudioEngine() {
        if (typeof AudioEngine === 'undefined') {
            throw new Error('AudioEngine no disponible');
        }
        
        this.audioEngine = new AudioEngine();
        await this.audioEngine.init();
        
        this.state.audioReady = true;
        this.uiManager.updateModuleStatus('audio', 'active');
        
        console.log('🔊 Audio Engine inicializado');
    }
    
    async initGalaxyRenderer() {
        if (typeof GalaxyRenderer === 'undefined') {
            throw new Error('GalaxyRenderer no disponible');
        }
        
        const canvas = this.elements.galaxyCanvas;
        if (!canvas) {
            throw new Error('Canvas de galaxia no encontrado');
        }
        
        this.galaxyRenderer = new GalaxyRenderer(canvas);
        
        if (this.performance.adaptiveQuality) {
            this.optimizeGalaxySettings();
        }
        
        await this.galaxyRenderer.init();
        
        this.state.galaxyReady = true;
        this.uiManager.updateModuleStatus('galaxy', 'active');
        
        console.log('🌌 Galaxy Renderer inicializado');
    }
    
    optimizeGalaxySettings() {
        const isLowEnd = this.isLowEndDevice();
        
        if (isLowEnd) {
            this.galaxyRenderer.config.backgroundStars = 400;
            this.galaxyRenderer.config.starSize = 1.5;
            this.performance.targetFPS = 30;
            
            this.uiManager.showNotification('Modo de rendimiento activado', 'info', 2000);
        }
    }
    
    isLowEndDevice() {
        const hardwareConcurrency = navigator.hardwareConcurrency || 1;
        const memory = navigator.deviceMemory || 1;
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        
        return hardwareConcurrency < 4 || memory < 2 || isMobile;
    }
    
    initStarSystem() {
        if (typeof StarSystem === 'undefined') {
            throw new Error('StarSystem no disponible');
        }
        
        this.starSystem = new StarSystem(this.galaxyRenderer);
        
        if (this.isLowEndDevice()) {
            this.starSystem.config.maxStars = 50;
        }
        
        console.log('⭐ Star System inicializado');
    }
    
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
    
    initMusicTheory() {
        if (typeof MusicTheoryEngine === 'undefined') {
            console.warn('⚠️ MusicTheoryEngine no disponible - análisis limitado');
            return;
        }
        
        this.musicTheory = new MusicTheoryEngine();
        console.log('🎵 Music Theory Engine inicializado');
    }
    
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
     * ========================================
     * EVENT LISTENERS
     * ========================================
     */
    
    setupOptimizedEventListeners() {
        this.setupDebouncedInputs();
        this.setupOptimizedMouseEvents();
        this.setupKeyboardShortcuts();
        this.setupWindowEvents();
        
        console.log('🎧 Event listeners configurados');
    }
    
    setupDebouncedInputs() {
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
        
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', 
                this.throttle((e) => {
                    this.updateVolume(parseInt(e.target.value));
                }, 50)
            );
        }
        
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.addEventListener('input', (e) => {
                this.updateBPM(parseInt(e.target.value));
            });
        }
    }
    
    setupOptimizedMouseEvents() {
        const buttonMappings = {
            playButton: () => this.playNotes(),
            stopButton: () => this.stopNotes(),
            composerPlayButton: () => this.playComposerSequence(),
            composerStopButton: () => this.stopComposerSequence(),
            analyzeButton: () => this.analyzeNotes(),
            newProjectButton: () => this.createNewProject(),
            saveProjectButton: () => this.saveCurrentProject(),
            deleteProjectButton: () => this.deleteCurrentProject(),
            addSequenceButton: () => this.addSequenceToComposer(),
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
        
        // Navigation buttons
        this.elements.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = btn.dataset.mode;
                if (mode) {
                    this.switchMode(mode);
                }
            });
        });
        
        // Help button
        if (this.elements.helpButton) {
            this.elements.helpButton.addEventListener('click', () => {
                this.toggleHelpModal();
            });
        }
        
        // Project selector
        if (this.elements.projectSelect) {
            this.elements.projectSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.loadProject(e.target.value);
                }
            });
        }
    }
    
    setupKeyboardShortcuts() {
        // Los atajos están manejados por UIManager
        console.log('⌨️ Atajos de teclado configurados por UIManager');
    }
    
    setupWindowEvents() {
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 100));
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseNonEssentialSystems();
            } else {
                this.resumeNonEssentialSystems();
            }
        });
        
        window.addEventListener('beforeunload', () => {
            this.handleAppExit();
        });
    }
    
    /**
     * ========================================
     * INTERFAZ DE USUARIO
     * ========================================
     */
    
    setupCompleteUI() {
        this.updateSystemStatus();
        this.updateProjectSelector();
        this.initComposerMode();
        this.initAnalysisMode();
        
        console.log('🖥️ Interfaz completa configurada');
    }
    
    updateSystemStatus() {
        if (this.elements.audioStatus) {
            this.elements.audioStatus.textContent = this.state.audioReady ? '🔊 Audio: Listo' : '🔊 Audio: Cargando...';
        }
        
        if (this.elements.galaxyStatus) {
            this.elements.galaxyStatus.textContent = this.state.galaxyReady ? '🌌 Galaxy: Listo' : '🌌 Galaxy: Cargando...';
        }
        
        if (this.elements.composerStatus) {
            this.elements.composerStatus.textContent = this.state.composerReady ? '🎼 Compositor: Listo' : '🎼 Compositor: Preparando...';
        }
        
        if (this.elements.analysisStatus) {
            this.elements.analysisStatus.textContent = this.state.analysisReady ? '📊 Análisis: Listo' : '📊 Análisis: Inicializando...';
        }
    }
    
    updateProjectSelector() {
        if (!this.projectManager || !this.elements.projectSelect) return;
        
        const projects = this.projectManager.getProjectsList();
        const select = this.elements.projectSelect;
        
        select.innerHTML = '';
        
        if (projects.length === 0) {
            select.innerHTML = '<option value="">Sin proyectos</option>';
            return;
        }
        
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            option.selected = project.isCurrent;
            select.appendChild(option);
        });
    }
    
    initComposerMode() {
        if (this.elements.currentKey) {
            this.elements.currentKey.textContent = 'C Major';
        }
        
        if (this.elements.currentScale) {
            this.elements.currentScale.textContent = 'Mayor';
        }
        
        if (this.elements.chordProgression) {
            this.elements.chordProgression.textContent = 'I - vi - IV - V';
        }
        
        if (this.elements.bpmDisplay) {
            this.elements.bpmDisplay.textContent = '120 BPM';
        }
    }
    
    initAnalysisMode() {
        if (this.elements.chordAnalysis) {
            this.elements.chordAnalysis.textContent = '---';
        }
        
        if (this.elements.chordSuggestions) {
            this.elements.chordSuggestions.textContent = '---';
        }
    }
    
    /**
     * ========================================
     * FUNCIONES PRINCIPALES
     * ========================================
     */
    
    handleNoteInputChange(value, inputId) {
        if (!value.trim()) return;
        
        if (inputId === 'composer-note-input' && this.musicTheory) {
            this.analyzeComposerInput(value);
        }
        
        if (inputId === 'analysis-note-input' && this.musicTheory) {
            this.previewAnalysis(value);
        }
    }
    
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
            
            const invalidNotes = notes.filter(note => note < 1 || note > 88);
            if (invalidNotes.length > 0) {
                throw new Error(`Notas fuera de rango: ${invalidNotes.join(', ')}`);
            }
            
            this.uiManager.trackUserAction('play_notes', { notes, count: notes.length });
            
            await this.audioEngine.playNotes(notes);
            
            if (this.starSystem) {
                this.starSystem.createStars(notes, 2.0, 0.8);
            }
            
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
    
    stopNotes() {
        if (this.audioEngine) {
            this.audioEngine.stopAll();
        }
        
        this.state.currentNotes = [];
        this.updateNoteDisplay([]);
        
        this.uiManager.showNotification('Reproducción detenida', 'info', 1500);
    }
    
    async analyzeNotes() {
        const input = this.elements.analysisNoteInput?.value?.trim();
        if (!input) {
            this.uiManager.showNotification('Ingresa notas para analizar', 'warning');
            return;
        }
        
        try {
            const notes = this.parseNoteInput(input);
            
            this.uiManager.trackUserAction('analyze_notes', { notes, count: notes.length });
            
            await this.audioEngine.playNotes(notes, 3.0, 0.8);
            
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
    
    async playComposerSequence() {
        if (!this.sequencer) {
            this.uiManager.showNotification('Secuenciador no disponible', 'error');
            return;
        }
        
        try {
            await this.sequencer.playSequence();
            this.state.isPlaying = true;
            this.uiManager.showNotification('Secuencia iniciada', 'success', 2000);
        } catch (error) {
            this.handleActionError(error, 'Error reproduciendo secuencia');
        }
    }
    
    stopComposerSequence() {
        if (this.sequencer) {
            this.sequencer.stopSequence();
        }
        
        this.state.isPlaying = false;
        this.uiManager.showNotification('Secuencia detenida', 'info', 1500);
    }
    
    async addSequenceToComposer() {
        const input = this.elements.composerNoteInput?.value?.trim();
        if (!input) {
            this.uiManager.showNotification('Ingresa una secuencia musical', 'warning');
            return;
        }
        
        if (!this.sequencer) {
            this.uiManager.showNotification('Secuenciador no disponible', 'error');
            return;
        }
        
        try {
            const result = this.sequencer.createSequenceFromInput(input, 0);
            
            if (result.success) {
                this.uiManager.showNotification('Secuencia añadida', 'success', 2000);
                this.elements.composerNoteInput.value = '';
                this.updateSequencerDisplay();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.handleActionError(error, 'Error añadiendo secuencia');
        }
    }
    
    /**
     * ========================================
     * GESTIÓN DE PROYECTOS
     * ========================================
     */
    
    async createNewProject() {
        if (!this.projectManager) {
            this.uiManager.showNotification('Gestor de proyectos no disponible', 'error');
            return;
        }
        
        try {
            const project = this.projectManager.createProject({
                name: 'Nuevo Proyecto Musical',
                description: 'Descripción del proyecto'
            });
            
            await this.projectManager.loadProject(project.id);
            this.state.currentProject = project.id;
            
            this.updateProjectSelector();
            this.updateProjectMetadata(project);
            
            this.uiManager.showNotification('Nuevo proyecto creado', 'success');
        } catch (error) {
            this.handleActionError(error, 'Error creando proyecto');
        }
    }
    
    async saveCurrentProject() {
        if (!this.projectManager || !this.state.currentProject) {
            this.uiManager.showNotification('No hay proyecto para guardar', 'warning');
            return;
        }
        
        try {
            const projectData = this.gatherProjectData();
            await this.projectManager.saveProject(this.state.currentProject, projectData);
            
            this.uiManager.showNotification('Proyecto guardado', 'success', 2000);
        } catch (error) {
            this.handleActionError(error, 'Error guardando proyecto');
        }
    }
    
    async deleteCurrentProject() {
        if (!this.projectManager || !this.state.currentProject) {
            this.uiManager.showNotification('No hay proyecto para eliminar', 'warning');
            return;
        }
        
        if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
            return;
        }
        
        try {
            await this.projectManager.deleteProject(this.state.currentProject);
            this.state.currentProject = null;
            
            this.updateProjectSelector();
            this.uiManager.showNotification('Proyecto eliminado', 'success');
        } catch (error) {
            this.handleActionError(error, 'Error eliminando proyecto');
        }
    }
    
    async loadProject(projectId) {
        if (!this.projectManager) {
            this.uiManager.showNotification('Gestor de proyectos no disponible', 'error');
            return;
        }
        
        try {
            const project = await this.projectManager.loadProject(projectId);
            this.state.currentProject = projectId;
            
            this.updateProjectMetadata(project);
            this.uiManager.showNotification(`Proyecto cargado: ${project.name}`, 'success', 2000);
        } catch (error) {
            this.handleActionError(error, 'Error cargando proyecto');
        }
    }
    
    updateProjectMetadata(project) {
        if (this.elements.projectName) {
            this.elements.projectName.value = project.name || '';
        }
        
        if (this.elements.projectDescription) {
            this.elements.projectDescription.value = project.description || '';
        }
    }
    
    gatherProjectData() {
        return {
            name: this.elements.projectName?.value || 'Proyecto Sin Nombre',
            description: this.elements.projectDescription?.value || '',
            notes: this.state.currentNotes,
            bpm: this.getBPM(),
            volume: this.state.volume
        };
    }
    
    /**
     * ========================================
     * EXPORTACIÓN
     * ========================================
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
            this.uiManager.showNotification(`✅ MIDI guardado: ${result.filename}`, 'success');
            this.uiManager.trackUserAction('export', { format: 'midi', size: result.size });
        }
        
        return result;
    }
    
    async exportToMP3() {
        if (!this.fileManager) {
            throw new Error('Sistema de exportación no disponible');
        }
        
        this.uiManager.showNotification('Iniciando exportación MP3...', 'info');
        
        const result = await this.fileManager.exportToMP3(this.state.currentProject, {
            bitRate: 128,
            duration: 10000
        });
        
        if (result.success) {
            this.uiManager.showNotification(`✅ MP3 guardado: ${result.filename}`, 'success');
            this.uiManager.trackUserAction('export', { format: 'mp3', size: result.size });
        }
        
        return result;
    }
    
    async exportToJSON() {
        if (!this.fileManager) {
            throw new Error('Sistema de exportación no disponible');
        }
        
        this.uiManager.showNotification('Iniciando exportación JSON...', 'info');
        
        const result = await this.fileManager.exportToJSON(this.state.currentProject, {
            prettify: true,
            includeMetadata: true
        });
        
        if (result.success) {
            this.uiManager.showNotification(`✅ JSON guardado: ${result.filename}`, 'success');
            this.uiManager.trackUserAction('export', { format: 'json', size: result.size });
        }
        
        return result;
    }
    
    async exportScreenshot() {
        if (!this.fileManager) {
            throw new Error('Sistema de exportación no disponible');
        }
        
        this.uiManager.showNotification('Capturando imagen...', 'info');
        
        const result = await this.fileManager.exportGalaxyScreenshot('png', 0.9);
        
        if (result.success) {
            this.uiManager.showNotification(`✅ Imagen guardada: ${result.filename}`, 'success');
            this.uiManager.trackUserAction('export', { format: 'png', size: result.size });
        }
        
        return result;
    }
    
    /**
     * ========================================
     * GESTIÓN DE MODOS
     * ========================================
     */
    
    async switchMode(mode) {
        if (!['live', 'composer', 'analysis'].includes(mode) || mode === this.currentMode) {
            return;
        }
        
        const fromMode = this.currentMode;
        this.currentMode = mode;
        
        this.stopAllPlayback();
        
        await this.uiManager.animateModeTransition(fromMode, mode);
        
        this.updateNavigation(mode);
        
        if (mode === 'composer') {
            this.initComposerMode();
        } else if (mode === 'analysis') {
            this.initAnalysisMode();
        }
        
        document.body.className = 'galaxy-mode-' + mode;
        
        this.uiManager.trackUserAction('mode_switch', { from: fromMode, to: mode });
        this.uiManager.showNotification(`Modo ${mode} activado`, 'info', 1500);
        
        console.log('🔄 Modo cambiado:', fromMode, '→', mode);
    }
    
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
    
    updateNavigation(activeMode) {
        this.elements.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === activeMode);
        });
    }
    
    /**
     * ========================================
     * UTILIDADES Y HELPERS
     * ========================================
     */
    
    parseNoteInput(input) {
        if (!input || typeof input !== 'string') {
            return [];
        }
        
        const notes = input.split(',')
            .map(note => note.trim())
            .filter(note => note.length > 0)
            .map(note => {
                const num = parseInt(note);
                return isNaN(num) ? null : num;
            })
            .filter(note => note !== null);
        
        return notes;
    }
    
    updateVolume(volume) {
        this.state.volume = Math.max(0, Math.min(100, volume));
        
        if (this.audioEngine) {
            this.audioEngine.setVolume(this.state.volume / 100);
        }
        
        if (this.elements.volumeDisplay) {
            this.elements.volumeDisplay.textContent = this.state.volume + '%';
        }
        
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.value = this.state.volume;
        }
    }
    
    updateBPM(bpm) {
        if (this.elements.bpmDisplay) {
            this.elements.bpmDisplay.textContent = bpm + ' BPM';
        }
        
        if (this.sequencer) {
            this.sequencer.state.currentBPM = bpm;
        }
    }
    
    getBPM() {
        return this.elements.bpmSlider ? parseInt(this.elements.bpmSlider.value) : 120;
    }
    
    updateNoteDisplay(notes) {
        if (this.elements.currentNotes) {
            if (notes.length === 0) {
                this.elements.currentNotes.textContent = 'Notas: Ninguna';
            } else {
                this.elements.currentNotes.textContent = `Notas: ${notes.join(', ')}`;
            }
        }
    }
    
    updateChordInfo(chord) {
        if (this.elements.chordInfo) {
            this.elements.chordInfo.textContent = `Acorde: ${chord}`;
        }
        
        if (this.elements.chordAnalysis) {
            this.elements.chordAnalysis.textContent = chord;
        }
    }
    
    updateSequencerDisplay() {
        // Actualizar display del secuenciador
        console.log('📊 Actualizando display del secuenciador');
    }
    
    analyzeComposerInput(input) {
        // Análisis en tiempo real para el compositor
        console.log('🎵 Analizando entrada del compositor:', input);
    }
    
    previewAnalysis(input) {
        // Preview para el modo análisis
        console.log('🔬 Preview de análisis:', input);
    }
    
    toggleHelpModal() {
        if (this.elements.helpModal) {
            this.elements.helpModal.classList.toggle('hidden');
        }
    }
    
    pauseNonEssentialSystems() {
        if (this.galaxyRenderer && this.galaxyRenderer.state.isAnimating) {
            this.galaxyRenderer.stopAnimation();
        }
        
        if (this.spectrum3DRenderer && this.spectrum3DRenderer.state.isAnimating) {
            this.spectrum3DRenderer.stopAnimation();
        }
    }
    
    resumeNonEssentialSystems() {
        if (this.galaxyRenderer && !this.galaxyRenderer.state.isAnimating) {
            this.galaxyRenderer.startAnimation();
        }
        
        if (this.spectrum3DRenderer && !this.spectrum3DRenderer.state.isAnimating) {
            this.spectrum3DRenderer.startAnimation();
        }
    }
    
    handleWindowResize() {
        if (this.galaxyRenderer) {
            this.galaxyRenderer.handleResize();
        }
        
        if (this.spectrum3DRenderer) {
            this.spectrum3DRenderer.handleResize();
        }
    }
    
    handleAppExit() {
        if (this.projectManager && this.state.currentProject) {
            this.projectManager.saveCurrentProject().catch(console.error);
        }
    }
    
    /**
     * ========================================
     * TESTING Y FINALIZACIÓN
     * ========================================
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
    
    async testAudioSystem() {
        try {
            if (!this.audioEngine || !this.audioEngine.state.isReady) {
                return false;
            }
            
            await this.audioEngine.testNote(40, 0.1);
            return true;
        } catch (error) {
            console.error('❌ Test audio falló:', error);
            return false;
        }
    }
    
    testGalaxySystem() {
        return this.state.galaxyReady && this.galaxyRenderer && this.galaxyRenderer.state.isInitialized;
    }
    
    testUISystem() {
        return this.uiManager && 
               document.getElementById('toast-container') &&
               this.elements.noteInput !== null;
    }
    
    testPerformance() {
        const memoryMB = this.getMemoryUsage();
        const fps = this.uiManager.performanceData.fps;
        
        return memoryMB < this.performance.memoryLimit && fps > 30;
    }
    
    getMemoryUsage() {
        if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        return 0;
    }
    
    finalizeInitialization() {
        this.isInitialized = true;
        
        this.uiManager.updateLoadingProgress(100, '¡Listo para explorar el universo musical! 🌌');
        setTimeout(() => {
            this.uiManager.hideLoadingScreen();
        }, 800);
        
        this.updateSystemStatus();
        this.updateVolume(this.state.volume);
        this.switchMode('live');
        
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
     * ========================================
     * MANEJO DE ERRORES
     * ========================================
     */
    
    handleCriticalError(error) {
        console.error('💥 Error crítico:', error);
        
        this.uiManager.showNotification(
            'Error crítico de inicialización - recargando...', 
            'error',
            5000
        );
        
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
    
    handleActionError(error, context = 'Operación') {
        console.error(`❌ ${context}:`, error);
        this.uiManager.showNotification(`${context}: ${error.message}`, 'error');
    }
    
    isDevelopmentMode() {
        return this.uiManager ? this.uiManager.isDevelopmentMode() : false;
    }
    
    /**
     * ========================================
     * UTILIDADES DE TIMING
     * ========================================
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
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * ========================================
     * ESTADÍSTICAS Y INFO
     * ========================================
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
    
    /**
     * ========================================
     * DESTRUCTOR
     * ========================================
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

/**
 * ========================================
 * INICIALIZACIÓN AUTOMÁTICA
 * ========================================
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🌌 Galaxy Piano v1.0 - Starting Application...');
        
        window.galaxyPiano = new GalaxyPiano();
        await window.galaxyPiano.init();
        
        console.log('✨ Galaxy Piano completamente inicializado');
        
    } catch (error) {
        console.error('💥 Error fatal en inicialización:', error);
        
        // Fallback UI básico
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #0a0a0f; color: white; font-family: Arial; text-align: center;">
                <div>
                    <h1>🌌 Galaxy Piano</h1>
                    <p>Error de inicialización crítico</p>
                    <div style="margin: 20px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; font-family: monospace; font-size: 0.8rem; color: #ccc;">
                        ${error.message || error}
                    </div>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                        🔄 Recargar
                    </button>
                    <button onclick="localStorage.clear(); window.location.reload()" style="padding: 10px 20px; background: #ff8800; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                        🧹 Limpiar y Recargar
                    </button>
                </div>
            </div>
        `;
    }
});

// Cleanup global al cerrar
window.addEventListener('beforeunload', () => {
    if (window.galaxyPiano) {
        window.galaxyPiano.destroy();
    }
});

// Manejo de errores no capturados como último recurso
window.addEventListener('error', (event) => {
    console.error('🚨 Error no capturado:', event.error);
});

// Debug utilities en modo desarrollo
if (window.location.hostname === 'localhost' || window.location.search.includes('debug')) {
    window.debugGalaxyPiano = () => {
        if (window.galaxyPiano) {
            console.log('🔍 Galaxy Piano Debug Info:');
            console.table(window.galaxyPiano.getSystemStats());
        }
    };
    
    console.log('🛠️ Modo debug activado. Usa debugGalaxyPiano() para información del sistema.');
}