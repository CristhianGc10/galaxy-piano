/**
 * GALAXY PIANO - MAIN APPLICATION (Sprint 4 Complete)
 * Arquitectura completa con sistema de Análisis y Exportación
 * Sprint 4 Completo - Implementación total y funcional
 */

class GalaxyPiano {
    constructor() {
        this.version = '1.4.0'; // Sprint 4
        this.currentMode = 'live';
        this.isInitialized = false;
        
        // Módulos principales (Sprint 1 & 2)
        this.audioEngine = null;
        this.galaxyRenderer = null;
        this.starSystem = null;
        
        // Módulos Sprint 3
        this.sequencer = null;
        this.musicTheory = null;
        this.projectManager = null;
        
        // Nuevos módulos Sprint 4
        this.waves2DRenderer = null;
        this.spectrum3DRenderer = null;
        this.fileManager = null;
        
        // Estado de la aplicación expandido
        this.state = {
            volume: 50,
            currentNotes: [],
            isPlaying: false,
            audioReady: false,
            galaxyReady: false,
            composerReady: false,
            analysisReady: false, // NUEVO
            currentProject: null,
            autoSave: true,
            
            // Estados de visualización Sprint 4
            wavesVisible: true,
            spectrumVisible: true,
            analysisMode: 'realtime' // 'realtime', 'capture', 'playback'
        };
        
        // Referencias DOM expandidas
        this.elements = {};
        
        console.log('🌌 Galaxy Piano v' + this.version + ' iniciando - Sprint 4 Edition');
    }
    
    /**
     * Inicialización completa de la aplicación (Sprints 1-4)
     */
    async init() {
        try {
            console.log('🚀 Iniciando Galaxy Piano - Sprint 4 Complete...');
            
            // 1. Obtener referencias DOM
            this.initDOMReferences();
            
            // 2. Configurar event listeners
            this.setupEventListeners();
            
            // 3. Inicializar audio engine (Sprint 1)
            await this.initAudioEngine();
            
            // 4. Inicializar galaxy renderer (Sprint 2)
            await this.initGalaxyRenderer();
            
            // 5. Inicializar star system (Sprint 2)
            this.initStarSystem();
            
            // 6. Inicializar sequencer musical (Sprint 3)
            await this.initSequencer();
            
            // 7. Inicializar motor de teoría musical (Sprint 3)
            this.initMusicTheory();
            
            // 8. Inicializar gestor de proyectos (Sprint 3)
            await this.initProjectManager();
            
            // 9. NUEVO - Inicializar visualización de ondas 2D (Sprint 4)
            await this.initWaves2DRenderer();
            
            // 10. NUEVO - Inicializar análisis espectral 3D (Sprint 4)
            await this.initSpectrum3DRenderer();
            
            // 11. NUEVO - Inicializar gestor de archivos (Sprint 4)
            this.initFileManager();
            
            // 12. Configurar interfaz completa
            this.setupCompleteUI();
            
            // 13. Ejecutar tests de integración
            await this.runIntegrationTests();
            
            this.isInitialized = true;
            console.log('✅ Galaxy Piano Sprint 4 inicializado correctamente');
            
            this.updateSystemStatus();
            
        } catch (error) {
            console.error('❌ Error inicializando Galaxy Piano:', error);
            this.showError('Error de inicialización: ' + error.message);
        }
    }
    
    /**
     * Referencias DOM actualizadas para Sprint 4
     */
    initDOMReferences() {
        this.elements = {
            // Navigation
            navButtons: document.querySelectorAll('.nav-btn'),
            
            // Mode sections
            liveModeSection: document.getElementById('live-mode'),
            composerModeSection: document.getElementById('composer-mode'),
            analysisModeSection: document.getElementById('analysis-mode'),
            
            // Live mode controls
            noteInput: document.getElementById('note-input'),
            playButton: document.getElementById('play-btn'),
            stopButton: document.getElementById('stop-btn'),
            volumeSlider: document.getElementById('volume'),
            volumeDisplay: document.getElementById('volume-display'),
            
            // Composer mode controls
            composerNoteInput: document.getElementById('composer-note-input'),
            composerPlayButton: document.getElementById('composer-play-btn'),
            composerStopButton: document.getElementById('composer-stop-btn'),
            bpmSlider: document.getElementById('bpm-slider'),
            bpmDisplay: document.getElementById('bpm-display'),
            sequencerGrid: document.getElementById('sequencer-grid'),
            chordAnalysis: document.getElementById('chord-analysis'),
            chordSuggestions: document.getElementById('chord-suggestions'),
            addSequenceButton: document.getElementById('add-sequence-btn'),
            
            // Project management
            projectSelect: document.getElementById('project-select'),
            newProjectButton: document.getElementById('new-project-btn'),
            saveProjectButton: document.getElementById('save-project-btn'),
            deleteProjectButton: document.getElementById('delete-project-btn'),
            projectName: document.getElementById('project-name'),
            projectDescription: document.getElementById('project-description'),
            
            // Analysis mode controls (NUEVOS - Sprint 4)
            analysisNoteInput: document.getElementById('analysis-note-input'),
            analyzeButton: document.getElementById('analyze-btn'),
            wavesToggle: document.getElementById('waves-toggle'),
            spectrumToggle: document.getElementById('spectrum-toggle'),
            wavesCanvas: document.getElementById('waves-canvas'),
            spectrumCanvas: document.getElementById('spectrum-canvas'),
            
            // Export controls (NUEVOS - Sprint 4)
            exportMidiButton: document.getElementById('export-midi-btn'),
            exportMp3Button: document.getElementById('export-mp3-btn'),
            exportJsonButton: document.getElementById('export-json-btn'),
            exportScreenshotButton: document.getElementById('export-screenshot-btn'),
            exportProgress: document.getElementById('export-progress'),
            exportProgressFill: document.getElementById('export-progress-fill'),
            exportProgressText: document.getElementById('export-progress-text'),
            
            // Color mode controls (NUEVOS)
            spectrumColorMode: document.getElementById('spectrum-color-mode'),
            
            // Galaxy
            galaxyCanvas: document.getElementById('galaxy-canvas'),
            loadingIndicator: document.getElementById('loading'),
            
            // Status displays
            currentNotesDisplay: document.getElementById('current-notes'),
            chordInfoDisplay: document.getElementById('chord-info'),
            audioStatusDisplay: document.getElementById('audio-status'),
            galaxyStatusDisplay: document.getElementById('galaxy-status'),
            composerStatusDisplay: document.getElementById('composer-status'),
            projectStatusDisplay: document.getElementById('project-status'),
            analysisStatusDisplay: document.getElementById('analysis-status')
        };
        
        console.log('📋 Referencias DOM Sprint 4 obtenidas');
    }
    
    /**
     * Event listeners expandidos para Sprint 4
     */
    setupEventListeners() {
        // Navigation
        this.elements.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Live mode
        if (this.elements.playButton) {
            this.elements.playButton.addEventListener('click', () => {
                this.playNotes();
            });
        }
        
        if (this.elements.stopButton) {
            this.elements.stopButton.addEventListener('click', () => {
                this.stopNotes();
            });
        }
        
        if (this.elements.noteInput) {
            this.elements.noteInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.playNotes();
                }
            });
        }
        
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', (e) => {
                this.updateVolume(parseInt(e.target.value));
            });
        }
        
        // Composer mode
        if (this.elements.composerPlayButton) {
            this.elements.composerPlayButton.addEventListener('click', () => {
                this.playComposerSequence();
            });
        }
        
        if (this.elements.composerStopButton) {
            this.elements.composerStopButton.addEventListener('click', () => {
                this.stopComposerSequence();
            });
        }
        
        if (this.elements.composerNoteInput) {
            this.elements.composerNoteInput.addEventListener('input', (e) => {
                this.analyzeComposerInput(e.target.value);
            });
            
            this.elements.composerNoteInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addToSequence();
                }
            });
        }
        
        if (this.elements.addSequenceButton) {
            this.elements.addSequenceButton.addEventListener('click', () => {
                this.addToSequence();
            });
        }
        
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.addEventListener('input', (e) => {
                this.updateBPM(parseInt(e.target.value));
            });
        }
        
        // Project management
        if (this.elements.newProjectButton) {
            this.elements.newProjectButton.addEventListener('click', () => {
                this.createNewProject();
            });
        }
        
        if (this.elements.saveProjectButton) {
            this.elements.saveProjectButton.addEventListener('click', () => {
                this.saveCurrentProject();
            });
        }
        
        if (this.elements.deleteProjectButton) {
            this.elements.deleteProjectButton.addEventListener('click', () => {
                this.deleteCurrentProject();
            });
        }
        
        if (this.elements.projectSelect) {
            this.elements.projectSelect.addEventListener('change', (e) => {
                this.loadSelectedProject(e.target.value);
            });
        }
        
        if (this.elements.projectName) {
            this.elements.projectName.addEventListener('input', (e) => {
                this.updateProjectMetadata('name', e.target.value);
            });
        }
        
        if (this.elements.projectDescription) {
            this.elements.projectDescription.addEventListener('input', (e) => {
                this.updateProjectMetadata('description', e.target.value);
            });
        }
        
        // Analysis mode (NUEVO Sprint 4)
        if (this.elements.analyzeButton) {
            this.elements.analyzeButton.addEventListener('click', () => {
                this.analyzeNotes();
            });
        }
        
        if (this.elements.analysisNoteInput) {
            this.elements.analysisNoteInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzeNotes();
                }
            });
            
            this.elements.analysisNoteInput.addEventListener('input', (e) => {
                this.previewAnalysis(e.target.value);
            });
        }
        
        if (this.elements.wavesToggle) {
            this.elements.wavesToggle.addEventListener('click', () => {
                this.toggleWavesVisualization();
            });
        }
        
        if (this.elements.spectrumToggle) {
            this.elements.spectrumToggle.addEventListener('click', () => {
                this.toggleSpectrumVisualization();
            });
        }
        
        // Export controls (NUEVO Sprint 4)
        if (this.elements.exportMidiButton) {
            this.elements.exportMidiButton.addEventListener('click', () => {
                this.exportToMIDI();
            });
        }
        
        if (this.elements.exportMp3Button) {
            this.elements.exportMp3Button.addEventListener('click', () => {
                this.exportToMP3();
            });
        }
        
        if (this.elements.exportJsonButton) {
            this.elements.exportJsonButton.addEventListener('click', () => {
                this.exportToJSON();
            });
        }
        
        if (this.elements.exportScreenshotButton) {
            this.elements.exportScreenshotButton.addEventListener('click', () => {
                this.exportScreenshot();
            });
        }
        
        if (this.elements.spectrumColorMode) {
            this.elements.spectrumColorMode.addEventListener('change', (e) => {
                this.changeSpectrumColorMode(e.target.value);
            });
        }
        
        // Window events
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
        
        window.addEventListener('beforeunload', () => {
            this.handleAppExit();
        });
        
        console.log('🎧 Event listeners Sprint 4 configurados');
    }
    
    /**
     * Inicializar audio engine (Sprint 1)
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
            
            this.updateAudioStatus('Listo');
            
        } catch (error) {
            console.error('❌ Error inicializando audio:', error);
            this.updateAudioStatus('Error: ' + error.message);
            this.showError('Error de audio: ' + error.message);
        }
    }
    
    /**
     * Inicializar galaxy renderer (Sprint 2)
     */
    async initGalaxyRenderer() {
        try {
            if (typeof GalaxyRenderer === 'undefined') {
                throw new Error('GalaxyRenderer no está disponible');
            }
            
            this.galaxyRenderer = new GalaxyRenderer(this.elements.galaxyCanvas);
            await this.galaxyRenderer.init();
            
            this.state.galaxyReady = true;
            console.log('🌌 Galaxy Renderer inicializado');
            
            this.updateGalaxyStatus('Listo');
            this.hideLoading();
            
        } catch (error) {
            console.error('❌ Error inicializando galaxy:', error);
            this.updateGalaxyStatus('Error: ' + error.message);
            this.showError('Error de galaxia: ' + error.message);
        }
    }
    
    /**
     * Inicializar star system (Sprint 2)
     */
    initStarSystem() {
        try {
            if (typeof StarSystem === 'undefined') {
                throw new Error('StarSystem no está disponible');
            }
            
            this.starSystem = new StarSystem(this.galaxyRenderer);
            console.log('⭐ Star System inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando star system:', error);
        }
    }
    
    /**
     * Inicializar sequencer musical (Sprint 3)
     */
    async initSequencer() {
        try {
            if (typeof MusicalSequencer === 'undefined') {
                throw new Error('MusicalSequencer no está disponible');
            }
            
            this.sequencer = new MusicalSequencer(this.audioEngine, this.starSystem);
            
            console.log('🎼 Musical Sequencer inicializado');
            this.updateComposerStatus('Sequencer listo');
            
        } catch (error) {
            console.error('❌ Error inicializando sequencer:', error);
            this.updateComposerStatus('Error: ' + error.message);
        }
    }
    
    /**
     * Inicializar motor de teoría musical (Sprint 3)
     */
    initMusicTheory() {
        try {
            if (typeof MusicTheoryEngine === 'undefined') {
                throw new Error('MusicTheoryEngine no está disponible');
            }
            
            this.musicTheory = new MusicTheoryEngine();
            
            console.log('🎵 Music Theory Engine inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando music theory:', error);
        }
    }
    
    /**
     * Inicializar gestor de proyectos (Sprint 3)
     */
    async initProjectManager() {
        try {
            if (typeof ProjectManager === 'undefined') {
                throw new Error('ProjectManager no está disponible');
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
            
            this.updateProjectsUI();
            
            console.log('💾 Project Manager inicializado');
            this.updateProjectStatus('Listo');
            
        } catch (error) {
            console.error('❌ Error inicializando project manager:', error);
            this.updateProjectStatus('Error: ' + error.message);
        }
    }
    
    /**
     * NUEVO - Inicializar visualización de ondas 2D (Sprint 4)
     */
    async initWaves2DRenderer() {
        try {
            if (typeof Waves2DRenderer === 'undefined') {
                console.warn('⚠️ Waves2DRenderer no está disponible - funcionalidad limitada');
                return;
            }
            
            this.waves2DRenderer = new Waves2DRenderer(this.elements.wavesCanvas, this.audioEngine);
            await this.waves2DRenderer.init();
            
            console.log('🌊 Waves2D Renderer inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando Waves2D:', error);
            this.updateAnalysisStatus('Error: Ondas 2D no disponibles');
        }
    }
    
    /**
     * NUEVO - Inicializar análisis espectral 3D (Sprint 4)
     */
    async initSpectrum3DRenderer() {
        try {
            if (typeof Spectrum3DRenderer === 'undefined') {
                console.warn('⚠️ Spectrum3DRenderer no está disponible - funcionalidad limitada');
                return;
            }
            
            this.spectrum3DRenderer = new Spectrum3DRenderer(this.elements.spectrumCanvas, this.audioEngine);
            await this.spectrum3DRenderer.init();
            
            console.log('📊 Spectrum3D Renderer inicializado');
            this.state.analysisReady = true;
            
        } catch (error) {
            console.error('❌ Error inicializando Spectrum3D:', error);
            this.updateAnalysisStatus('Error: Espectro 3D no disponible');
        }
    }
    
    /**
     * NUEVO - Inicializar gestor de archivos (Sprint 4)
     */
    initFileManager() {
        try {
            if (typeof FileManager === 'undefined') {
                console.warn('⚠️ FileManager no está disponible - exportación limitada');
                return;
            }
            
            this.fileManager = new FileManager(
                this.audioEngine,
                this.projectManager,
                this.sequencer,
                this.musicTheory
            );
            
            console.log('📁 File Manager inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando File Manager:', error);
        }
    }
    
    /**
     * Configurar interfaz completa
     */
    setupCompleteUI() {
        // Configuración básica
        this.updateVolume(this.state.volume);
        this.switchMode('live');
        this.updateNoteDisplay([]);
        this.updateChordInfo('---');
        
        // Configuración de composer
        this.updateBPM(120);
        this.updateComposerStatus('Listo');
        
        // Configuración inicial de proyectos
        this.updateProjectsUI();
        
        // Configuración de análisis (Sprint 4)
        this.updateAnalysisStatus('Listo');
        this.updateVisualizationToggles();
        this.updateExportControls();
        
        console.log('🎨 UI completa configurada');
    }
    
    /**
     * Cambiar modo de aplicación
     */
    switchMode(mode) {
        if (!['live', 'composer', 'analysis'].includes(mode)) {
            console.error('Modo inválido:', mode);
            return;
        }
        
        this.currentMode = mode;
        
        // Detener reproducción al cambiar modo
        this.stopNotes();
        if (this.sequencer) {
            this.sequencer.stopSequence();
        }
        
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
        
        // Actualizar clase del body
        document.body.className = 'galaxy-mode-' + mode;
        
        // Configuraciones específicas por modo
        if (mode === 'composer') {
            this.initComposerMode();
        } else if (mode === 'analysis') {
            this.initAnalysisMode();
        }
        
        console.log('🔄 Modo cambiado a:', mode);
    }
    
    /**
     * Inicializar modo compositor
     */
    initComposerMode() {
        // Actualizar UI de composer
        this.updateSequencerGrid();
        this.updateChordAnalysis();
        this.updateChordSuggestions();
        
        console.log('🎼 Modo Compositor inicializado');
    }
    
    /**
     * NUEVO - Inicializar modo análisis (Sprint 4)
     */
    initAnalysisMode() {
        // Configurar visualizaciones
        this.updateVisualizationToggles();
        
        // Configurar controles de exportación
        this.updateExportControls();
        
        // Redimensionar canvas si es necesario
        if (this.waves2DRenderer && this.spectrum3DRenderer) {
            setTimeout(() => {
                this.handleWindowResize();
            }, 100);
        }
        
        console.log('📊 Modo Análisis inicializado');
        this.updateAnalysisStatus('Listo');
    }
    
    /**
     * Reproducir notas desde input (Live mode)
     */
    async playNotes() {
        if (!this.state.audioReady) {
            this.showError('Audio no está listo');
            return;
        }
        
        const input = this.elements.noteInput?.value?.trim();
        if (!input) {
            this.showError('Ingresa una nota (1-88)');
            return;
        }
        
        try {
            const notes = this.parseNoteInput(input);
            
            if (notes.length === 0) {
                this.showError('Formato de nota inválido');
                return;
            }
            
            const invalidNotes = notes.filter(note => note < 1 || note > 88);
            if (invalidNotes.length > 0) {
                this.showError('Notas fuera de rango (1-88): ' + invalidNotes.join(', '));
                return;
            }
            
            console.log('🎵 Reproduciendo notas:', notes);
            
            // Reproducir con audio engine
            await this.audioEngine.playNotes(notes);
            
            // Crear estrellas visuales
            if (this.starSystem) {
                this.starSystem.createStars(notes, 2.0, 0.8);
            }
            
            // Analizar acordes con music theory
            if (this.musicTheory && notes.length > 1) {
                const analysis = this.musicTheory.analyzeChord(notes);
                if (analysis.bestMatch) {
                    this.updateChordInfo(analysis.bestMatch.displayName);
                }
            }
            
            // Actualizar estado
            this.state.currentNotes = notes;
            this.state.isPlaying = true;
            
            this.updateNoteDisplay(notes);
            
        } catch (error) {
            console.error('❌ Error reproduciendo notas:', error);
            this.showError('Error de reproducción: ' + error.message);
        }
    }
    
    /**
     * NUEVO - Analizar notas en modo análisis (Sprint 4)
     */
    async analyzeNotes() {
        if (!this.state.audioReady) {
            this.showError('Sistema de audio no está listo');
            return;
        }
        
        const input = this.elements.analysisNoteInput?.value?.trim();
        if (!input) {
            this.showError('Ingresa notas para analizar');
            return;
        }
        
        try {
            const notes = this.parseNoteInput(input);
            
            if (notes.length === 0) {
                this.showError('Formato de nota inválido');
                return;
            }
            
            console.log('📊 Analizando notas:', notes);
            
            // Reproducir con audio engine
            await this.audioEngine.playNotes(notes, 3.0, 0.8);
            
            // Crear visualizaciones
            if (this.state.wavesVisible && this.waves2DRenderer) {
                if (notes.length === 1) {
                    this.waves2DRenderer.addNote(notes[0], 3000, 0.8);
                } else {
                    this.waves2DRenderer.addChord(notes, 3000, 0.8);
                }
            }
            
            // Crear estrellas en galaxia
            if (this.starSystem) {
                this.starSystem.createStars(notes, 3.0, 0.8);
            }
            
            // Análisis musical
            if (this.musicTheory && notes.length > 1) {
                const analysis = this.musicTheory.analyzeChord(notes);
                if (analysis.bestMatch) {
                    this.updateChordInfo(analysis.bestMatch.displayName);
                    this.showSuccess(`Acorde detectado: ${analysis.bestMatch.displayName}`);
                }
            }
            
            // Actualizar estado
            this.state.currentNotes = notes;
            this.updateNoteDisplay(notes);
            
        } catch (error) {
            console.error('❌ Error analizando notas:', error);
            this.showError('Error de análisis: ' + error.message);
        }
    }
    
    /**
     * Reproducir secuencia del compositor
     */
    async playComposerSequence() {
        if (!this.sequencer) {
            this.showError('Sequencer no está listo');
            return;
        }
        
        try {
            await this.sequencer.playSequence();
            console.log('▶️ Secuencia del compositor iniciada');
        } catch (error) {
            console.error('❌ Error reproduciendo secuencia:', error);
            this.showError('Error en secuencia: ' + error.message);
        }
    }
    
    /**
     * Detener secuencia del compositor
     */
    stopComposerSequence() {
        if (this.sequencer) {
            this.sequencer.stopSequence();
        }
        console.log('⏹️ Secuencia del compositor detenida');
    }
    
    /**
     * Analizar entrada del compositor en tiempo real
     */
    analyzeComposerInput(input) {
        if (!this.sequencer || !this.musicTheory || !input.trim()) {
            this.updateChordAnalysis('---');
            this.updateChordSuggestions([]);
            return;
        }
        
        try {
            // Parsear entrada
            const parsed = this.sequencer.parseMusicalInput(input);
            
            if (parsed.success && parsed.chords.length > 0) {
                // Analizar primer acorde
                const firstChord = parsed.chords[0];
                const noteNumbers = firstChord.notes.map(note => note.number);
                
                const analysis = this.musicTheory.analyzeChord(noteNumbers);
                
                if (analysis.bestMatch) {
                    this.updateChordAnalysis(analysis.bestMatch.displayName, analysis.confidence);
                    this.updateChordSuggestions(analysis.suggestions);
                } else {
                    this.updateChordAnalysis('No identificado');
                    this.updateChordSuggestions([]);
                }
            } else if (parsed.success && parsed.notes.length > 1) {
                // Analizar como acorde simple
                const noteNumbers = parsed.notes.map(note => note.number);
                const analysis = this.musicTheory.analyzeChord(noteNumbers);
                
                if (analysis.bestMatch) {
                    this.updateChordAnalysis(analysis.bestMatch.displayName, analysis.confidence);
                    this.updateChordSuggestions(analysis.suggestions);
                }
            } else {
                this.updateChordAnalysis('---');
                this.updateChordSuggestions([]);
            }
            
        } catch (error) {
            console.error('❌ Error analizando entrada:', error);
        }
    }
    
    /**
     * Añadir entrada a la secuencia
     */
    addToSequence() {
        const input = this.elements.composerNoteInput?.value?.trim();
        if (!input || !this.sequencer) {
            return;
        }
        
        try {
            const result = this.sequencer.createSequenceFromInput(input, 0);
            
            if (result.success) {
                this.updateSequencerGrid();
                if (this.elements.composerNoteInput) {
                    this.elements.composerNoteInput.value = '';
                }
                this.showSuccess('Secuencia añadida correctamente');
            } else {
                this.showError(result.error);
            }
            
        } catch (error) {
            console.error('❌ Error añadiendo a secuencia:', error);
            this.showError('Error en secuencia: ' + error.message);
        }
    }
    
    /**
     * NUEVO - Vista previa de análisis en tiempo real (Sprint 4)
     */
    previewAnalysis(input) {
        if (!input.trim()) {
            this.updateChordInfo('---');
            return;
        }
        
        try {
            const notes = this.parseNoteInput(input);
            
            if (notes.length > 1 && this.musicTheory) {
                const analysis = this.musicTheory.analyzeChord(notes);
                if (analysis.bestMatch) {
                    this.updateChordInfo(`Preview: ${analysis.bestMatch.displayName}`);
                }
            }
            
        } catch (error) {
            // Silenciar errores de preview
        }
    }
    
    /**
     * NUEVO - Toggle visualización de ondas (Sprint 4)
     */
    toggleWavesVisualization() {
        this.state.wavesVisible = !this.state.wavesVisible;
        
        if (this.elements.wavesToggle) {
            this.elements.wavesToggle.classList.toggle('active', this.state.wavesVisible);
        }
        
        if (this.elements.wavesCanvas) {
            this.elements.wavesCanvas.style.display = this.state.wavesVisible ? 'block' : 'none';
        }
        
        console.log('🌊 Ondas 2D:', this.state.wavesVisible ? 'ON' : 'OFF');
    }
    
    /**
     * NUEVO - Toggle visualización de espectro (Sprint 4)
     */
    toggleSpectrumVisualization() {
        this.state.spectrumVisible = !this.state.spectrumVisible;
        
        if (this.elements.spectrumToggle) {
            this.elements.spectrumToggle.classList.toggle('active', this.state.spectrumVisible);
        }
        
        if (this.elements.spectrumCanvas) {
            this.elements.spectrumCanvas.style.display = this.state.spectrumVisible ? 'block' : 'none';
        }
        
        console.log('📊 Espectro 3D:', this.state.spectrumVisible ? 'ON' : 'OFF');
    }
    
    /**
     * NUEVO - Cambiar modo de color del espectro (Sprint 4)
     */
    changeSpectrumColorMode(mode) {
        if (this.spectrum3DRenderer) {
            this.spectrum3DRenderer.setColorMode(mode);
            console.log('🎨 Modo de color del espectro:', mode);
        }
    }
    
    /**
     * NUEVO - Exportar a MIDI (Sprint 4)
     */
    async exportToMIDI() {
        if (!this.fileManager) {
            this.showError('Sistema de exportación no disponible');
            return;
        }
        
        try {
            this.showExportProgress(true);
            this.updateExportProgress(0, 'Preparando exportación MIDI...');
            
            const result = await this.fileManager.exportToMIDI(this.state.currentProject, {
                includeMetadata: true,
                trackSeparation: true,
                quantization: 16
            });
            
            if (result.success) {
                this.updateExportProgress(100, 'MIDI exportado correctamente');
                this.showSuccess(`MIDI guardado: ${result.filename}`);
            }
            
        } catch (error) {
            console.error('❌ Error exportando MIDI:', error);
            this.showError('Error exportando MIDI: ' + error.message);
        } finally {
            setTimeout(() => this.showExportProgress(false), 2000);
        }
    }
    
    /**
     * NUEVO - Exportar a MP3 (Sprint 4)
     */
    async exportToMP3() {
        if (!this.fileManager) {
            this.showError('Sistema de exportación no disponible');
            return;
        }
        
        try {
            this.showExportProgress(true);
            this.updateExportProgress(0, 'Preparando grabación MP3...');
            
            const result = await this.fileManager.exportToMP3(this.state.currentProject, {
                bitRate: 128,
                sampleRate: 44100,
                fadeOut: true
            });
            
            if (result.success) {
                this.updateExportProgress(100, 'MP3 exportado correctamente');
                this.showSuccess(`MP3 guardado: ${result.filename}`);
            }
            
        } catch (error) {
            console.error('❌ Error exportando MP3:', error);
            this.showError('Error exportando MP3: ' + error.message);
        } finally {
            setTimeout(() => this.showExportProgress(false), 2000);
        }
    }
    
    /**
     * NUEVO - Exportar a JSON (Sprint 4)
     */
    async exportToJSON() {
        if (!this.fileManager) {
            this.showError('Sistema de exportación no disponible');
            return;
        }
        
        try {
            this.showExportProgress(true);
            this.updateExportProgress(0, 'Preparando exportación JSON...');
            
            const result = await this.fileManager.exportToJSON(this.state.currentProject, {
                includeAudioSettings: true,
                includeVisualSettings: true,
                prettify: true
            });
            
            if (result.success) {
                this.updateExportProgress(100, 'JSON exportado correctamente');
                this.showSuccess(`JSON guardado: ${result.filename}`);
            }
            
        } catch (error) {
            console.error('❌ Error exportando JSON:', error);
            this.showError('Error exportando JSON: ' + error.message);
        } finally {
            setTimeout(() => this.showExportProgress(false), 2000);
        }
    }
    
    /**
     * NUEVO - Exportar captura de pantalla (Sprint 4)
     */
    async exportScreenshot() {
        if (!this.fileManager) {
            this.showError('Sistema de exportación no disponible');
            return;
        }
        
        try {
            this.showExportProgress(true);
            this.updateExportProgress(50, 'Capturando imagen...');
            
            const result = await this.fileManager.exportGalaxyScreenshot('png', 0.9);
            
            if (result.success) {
                this.updateExportProgress(100, 'Captura guardada correctamente');
                this.showSuccess(`Imagen guardada: ${result.filename}`);
            }
            
        } catch (error) {
            console.error('❌ Error capturando imagen:', error);
            this.showError('Error capturando imagen: ' + error.message);
        } finally {
            setTimeout(() => this.showExportProgress(false), 2000);
        }
    }
    
    /**
     * Parser de entrada de notas
     */
    parseNoteInput(input) {
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
     * Detener notas
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
     * Actualizar volumen
     */
    updateVolume(volume) {
        this.state.volume = Math.max(0, Math.min(100, volume));
        
        if (this.audioEngine) {
            this.audioEngine.setVolume(this.state.volume / 100);
        }
        
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.value = this.state.volume;
        }
        
        if (this.elements.volumeDisplay) {
            this.elements.volumeDisplay.textContent = this.state.volume + '%';
        }
    }
    
    /**
     * Actualizar BPM
     */
    updateBPM(bpm) {
        const clampedBPM = Math.max(60, Math.min(200, bpm));
        
        if (this.sequencer) {
            this.sequencer.state.currentBPM = clampedBPM;
        }
        
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.value = clampedBPM;
        }
        
        if (this.elements.bpmDisplay) {
            this.elements.bpmDisplay.textContent = clampedBPM + ' BPM';
        }
        
        console.log('🥁 BPM actualizado:', clampedBPM);
    }
    
    /**
     * Crear nuevo proyecto
     */
    async createNewProject() {
        if (!this.projectManager) return;
        
        try {
            const projectName = prompt('Nombre del nuevo proyecto:') || 'Nuevo Proyecto';
            
            const newProject = this.projectManager.createProject({
                name: projectName,
                description: 'Nuevo proyecto musical'
            });
            
            await this.projectManager.loadProject(newProject.id);
            this.state.currentProject = newProject.id;
            
            this.updateProjectsUI();
            this.showSuccess('Proyecto creado: ' + projectName);
            
        } catch (error) {
            console.error('❌ Error creando proyecto:', error);
            this.showError('Error creando proyecto: ' + error.message);
        }
    }
    
    /**
     * Guardar proyecto actual
     */
    async saveCurrentProject() {
        if (!this.projectManager || !this.state.currentProject) return;
        
        try {
            await this.projectManager.saveCurrentProject();
            this.showSuccess('Proyecto guardado');
            
        } catch (error) {
            console.error('❌ Error guardando proyecto:', error);
            this.showError('Error guardando: ' + error.message);
        }
    }
    
    /**
     * Eliminar proyecto actual
     */
    async deleteCurrentProject() {
        if (!this.projectManager || !this.state.currentProject) return;
        
        const confirmDelete = confirm('¿Estás seguro de eliminar este proyecto?');
        if (!confirmDelete) return;
        
        try {
            await this.projectManager.deleteProject(this.state.currentProject);
            this.state.currentProject = null;
            
            this.updateProjectsUI();
            this.showSuccess('Proyecto eliminado');
            
        } catch (error) {
            console.error('❌ Error eliminando proyecto:', error);
            this.showError('Error eliminando: ' + error.message);
        }
    }
    
    /**
     * Cargar proyecto seleccionado
     */
    async loadSelectedProject(projectId) {
        if (!this.projectManager || !projectId) return;
        
        try {
            await this.projectManager.loadProject(projectId);
            this.state.currentProject = projectId;
            
            this.updateProjectsUI();
            this.showSuccess('Proyecto cargado');
            
        } catch (error) {
            console.error('❌ Error cargando proyecto:', error);
            this.showError('Error cargando: ' + error.message);
        }
    }
    
    /**
     * Actualizar metadatos del proyecto
     */
    updateProjectMetadata(field, value) {
        if (!this.projectManager || !this.state.currentProject) return;
        
        try {
            const project = this.projectManager.state.projects.get(this.state.currentProject);
            if (project) {
                project[field] = value;
                project.modifiedAt = Date.now();
                this.projectManager.markDirty();
            }
            
        } catch (error) {
            console.error('❌ Error actualizando metadata:', error);
        }
    }
    
    /**
     * Actualizar display de notas
     */
    updateNoteDisplay(notes) {
        if (!this.elements.currentNotesDisplay) return;
        
        if (notes.length === 0) {
            this.elements.currentNotesDisplay.textContent = 'Notas: Ninguna';
        } else {
            const noteNames = notes.map(note => {
                if (typeof window.NoteMapping !== 'undefined') {
                    return `${note} (${window.NoteMapping.getNoteName(note)})`;
                }
                return note.toString();
            });
            this.elements.currentNotesDisplay.textContent = 'Notas: ' + noteNames.join(', ');
        }
    }
    
    /**
     * Actualizar información de acorde
     */
    updateChordInfo(chordName) {
        if (this.elements.chordInfoDisplay) {
            this.elements.chordInfoDisplay.textContent = 'Acorde: ' + chordName;
        }
    }
    
    /**
     * Actualizar análisis de acordes
     */
    updateChordAnalysis(chordName = '---', confidence = 0) {
        if (this.elements.chordAnalysis) {
            const confidenceText = confidence > 0 ? ` (${Math.round(confidence * 100)}%)` : '';
            this.elements.chordAnalysis.textContent = `Acorde: ${chordName}${confidenceText}`;
        }
    }
    
    /**
     * Actualizar sugerencias de acordes
     */
    updateChordSuggestions(suggestions = []) {
        if (this.elements.chordSuggestions) {
            if (suggestions.length === 0) {
                this.elements.chordSuggestions.textContent = 'Sugerencias: ---';
            } else {
                const suggestionText = suggestions.slice(0, 3).map(s => s.chord).join(', ');
                this.elements.chordSuggestions.textContent = `Sugerencias: ${suggestionText}`;
            }
        }
    }
    
    /**
     * Actualizar UI de proyectos
     */
    updateProjectsUI() {
        if (!this.projectManager) return;
        
        try {
            const projects = this.projectManager.getProjectsList();
            
            // Actualizar selector de proyectos
            if (this.elements.projectSelect) {
                this.elements.projectSelect.innerHTML = '';
                
                projects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.name;
                    option.selected = project.id === this.state.currentProject;
                    this.elements.projectSelect.appendChild(option);
                });
            }
            
            // Actualizar campos del proyecto actual
            if (this.state.currentProject) {
                const currentProject = projects.find(p => p.id === this.state.currentProject);
                
                if (currentProject) {
                    if (this.elements.projectName) {
                        this.elements.projectName.value = currentProject.name;
                    }
                    if (this.elements.projectDescription) {
                        this.elements.projectDescription.value = currentProject.description;
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ Error actualizando UI de proyectos:', error);
        }
    }
    
    /**
     * Actualizar grid del secuenciador
     */
    updateSequencerGrid() {
        // Placeholder para visualización del secuenciador
        console.log('🎛️ Grid del secuenciador actualizado');
    }
    
    /**
     * NUEVO - Mostrar/ocultar progreso de exportación (Sprint 4)
     */
    showExportProgress(show) {
        if (this.elements.exportProgress) {
            this.elements.exportProgress.classList.toggle('active', show);
        }
    }
    
    /**
     * NUEVO - Actualizar progreso de exportación (Sprint 4)
     */
    updateExportProgress(percentage, text) {
        if (this.elements.exportProgressFill) {
            this.elements.exportProgressFill.style.width = percentage + '%';
        }
        
        if (this.elements.exportProgressText) {
            this.elements.exportProgressText.textContent = text;
        }
    }
    
    /**
     * NUEVO - Manejar redimensionamiento de ventana (Sprint 4)
     */
    handleWindowResize() {
        // Galaxy renderer
        if (this.galaxyRenderer) {
            this.galaxyRenderer.handleResize();
        }
        
        // Spectrum 3D renderer
        if (this.spectrum3DRenderer) {
            this.spectrum3DRenderer.handleResize();
        }
    }
    
    /**
     * NUEVO - Actualizar toggles de visualización (Sprint 4)
     */
    updateVisualizationToggles() {
        if (this.elements.wavesToggle) {
            this.elements.wavesToggle.classList.toggle('active', this.state.wavesVisible);
        }
        
        if (this.elements.spectrumToggle) {
            this.elements.spectrumToggle.classList.toggle('active', this.state.spectrumVisible);
        }
    }
    
    /**
     * NUEVO - Actualizar controles de exportación (Sprint 4)
     */
    updateExportControls() {
        const hasProject = !!this.state.currentProject;
        
        // Habilitar/deshabilitar botones según disponibilidad
        if (this.elements.exportMidiButton) {
            this.elements.exportMidiButton.disabled = !hasProject;
        }
        
        if (this.elements.exportMp3Button) {
            this.elements.exportMp3Button.disabled = !hasProject || !window.MediaRecorder;
        }
        
        if (this.elements.exportJsonButton) {
            this.elements.exportJsonButton.disabled = !hasProject;
        }
    }
    
    /**
     * Actualizar estados del sistema
     */
    updateSystemStatus() {
        this.updateAudioStatus();
        this.updateGalaxyStatus();
        this.updateComposerStatus();
        this.updateProjectStatus();
        this.updateAnalysisStatus();
    }
    
    /**
     * Actualizar estado del audio
     */
    updateAudioStatus(customStatus = null) {
        if (!this.elements.audioStatusDisplay) return;
        
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
        if (!this.elements.galaxyStatusDisplay) return;
        
        let status, className;
        
        if (customStatus) {
            status = customStatus;
            className = customStatus.includes('Error') ? 'error-state' : 'success-state';
        } else if (this.state.galaxyReady) {
            status = 'Listo';
            className = 'success-state';
        } else {
            status = 'Cargando...';
            className = 'loading-state';
        }
        
        this.elements.galaxyStatusDisplay.textContent = '🌌 Galaxy: ' + status;
        this.elements.galaxyStatusDisplay.className = className;
    }
    
    /**
     * Actualizar estado del compositor
     */
    updateComposerStatus(status = 'Listo') {
        if (this.elements.composerStatusDisplay) {
            this.elements.composerStatusDisplay.textContent = '🎼 Compositor: ' + status;
        }
    }
    
    /**
     * Actualizar estado de proyectos
     */
    updateProjectStatus(status = 'Listo') {
        if (this.elements.projectStatusDisplay) {
            this.elements.projectStatusDisplay.textContent = '💾 Proyectos: ' + status;
        }
    }
    
    /**
     * NUEVO - Actualizar estado del análisis (Sprint 4)
     */
    updateAnalysisStatus(status = 'Listo') {
        if (this.elements.analysisStatusDisplay) {
            this.elements.analysisStatusDisplay.textContent = '📊 Análisis: ' + status;
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
     * Mostrar mensaje de error
     */
    showError(message) {
        console.error('⚠️ Error:', message);
        alert('Galaxy Piano - Error: ' + message);
    }
    
    /**
     * Mostrar mensaje de éxito
     */
    showSuccess(message) {
        console.log('✅ Éxito:', message);
        // TODO: Implementar notificaciones visuales elegantes
    }
    
    /**
     * Manejar salida de aplicación
     */
    handleAppExit() {
        if (this.projectManager && this.state.currentProject) {
            // Auto-guardado al salir
            this.projectManager.saveCurrentProject().catch(console.error);
        }
    }
    
    /**
     * Verificar si el modo de test está habilitado
     */
    isTestModeEnabled() {
        return window.location.hash.includes('test') || window.location.search.includes('test');
    }
    
    /**
     * Ejecutar tests de integración
     */
    async runIntegrationTests() {
        if (!this.isTestModeEnabled()) return;
        
        console.log('🧪 Ejecutando tests de integración Sprint 4...');
        
        const testResults = {
            audio: false,
            galaxy: false,
            sequencer: false,
            musicTheory: false,
            projectManager: false,
            waves2D: false, // NUEVO
            spectrum3D: false, // NUEVO
            fileManager: false // NUEVO
        };
        
        try {
            // Tests existentes (Sprint 1-3)
            if (this.audioEngine) {
                testResults.audio = await this.audioEngine.testNote(40, 0.5);
            }
            
            if (this.sequencer) {
                const sequencerTest = await this.sequencer.testSequencer();
                testResults.sequencer = sequencerTest.parser && sequencerTest.sequencer;
            }
            
            if (this.musicTheory) {
                const musicTest = await this.musicTheory.testMusicTheory();
                testResults.musicTheory = musicTest.chordDetection && musicTest.suggestions;
            }
            
            if (this.projectManager) {
                const projectTest = await this.projectManager.testProjectManager();
                testResults.projectManager = Object.values(projectTest).every(r => r === true);
            }
            
            testResults.galaxy = this.state.galaxyReady;
            
            // Nuevos tests Sprint 4
            if (this.waves2DRenderer) {
                const wavesTest = await this.waves2DRenderer.testWaves2D();
                testResults.waves2D = wavesTest.initialization && wavesTest.animation;
            }
            
            if (this.spectrum3DRenderer) {
                const spectrumTest = await this.spectrum3DRenderer.testSpectrum3D();
                testResults.spectrum3D = spectrumTest.initialization && spectrumTest.animation;
            }
            
            if (this.fileManager) {
                const fileTest = await this.fileManager.testFileManager();
                testResults.fileManager = fileTest.browserSupport && fileTest.jsonExport;
            }
            
            console.log('🎯 Resultados de integración Sprint 4:', testResults);
            
            const allPassed = Object.values(testResults).every(result => result === true);
            if (allPassed) {
                console.log('✅ Todos los tests de integración Sprint 4 PASARON');
            } else {
                console.log('⚠️ Algunos tests de integración Sprint 4 FALLARON');
            }
            
        } catch (error) {
            console.error('❌ Error en tests de integración Sprint 4:', error);
        }
    }
    
    /**
     * Obtener estadísticas completas del sistema
     */
    getSystemStats() {
        const stats = {
            version: this.version,
            mode: this.currentMode,
            initialized: this.isInitialized,
            
            // Módulos principales
            audio: this.audioEngine?.getStats() || null,
            galaxy: this.galaxyRenderer?.getInfo() || null,
            stars: this.starSystem?.getStats() || null,
            
            // Módulos Sprint 3
            sequencer: this.sequencer?.getStats() || null,
            musicTheory: this.musicTheory?.getStats() || null,
            projects: this.projectManager?.getStats() || null,
            
            // Nuevos módulos Sprint 4
            waves2D: this.waves2DRenderer?.getStats() || null,
            spectrum3D: this.spectrum3DRenderer?.getStats() || null,
            fileManager: this.fileManager?.getStats() || null,
            
            // Estado de la aplicación
            state: this.state
        };
        
        return stats;
    }
    
    /**
     * Destruir aplicación completa
     */
    destroy() {
        // Destruir módulos Sprint 4
        if (this.waves2DRenderer) {
            this.waves2DRenderer.destroy();
        }
        
        if (this.spectrum3DRenderer) {
            this.spectrum3DRenderer.destroy();
        }
        
        if (this.fileManager) {
            this.fileManager.destroy();
        }
        
        // Destruir módulos Sprint 3
        if (this.projectManager) {
            this.projectManager.destroy();
        }
        
        // Destruir módulos existentes
        if (this.audioEngine) {
            this.audioEngine.destroy();
        }
        
        if (this.galaxyRenderer) {
            this.galaxyRenderer.destroy();
        }
        
        if (this.starSystem) {
            this.starSystem.destroy();
        }
        
        console.log('🛑 Galaxy Piano Sprint 4 destruido');
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