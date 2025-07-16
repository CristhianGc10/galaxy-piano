/**
 * GALAXY PIANO - MAIN APPLICATION (Sprint 3 Update)
 * Arquitectura completa con sistema de Compositor
 * Sprint 3 Completo - Integración total
 */

class GalaxyPiano {
    constructor() {
        this.version = '1.3.0'; // Sprint 3
        this.currentMode = 'live';
        this.isInitialized = false;
        
        // Módulos principales (Sprint 1 & 2)
        this.audioEngine = null;
        this.galaxyRenderer = null;
        this.starSystem = null;
        
        // Nuevos módulos (Sprint 3)
        this.sequencer = null;
        this.musicTheory = null;
        this.projectManager = null;
        
        // Estado de la aplicación expandido
        this.state = {
            volume: 50,
            currentNotes: [],
            isPlaying: false,
            audioReady: false,
            galaxyReady: false,
            composerReady: false,
            currentProject: null,
            autoSave: true
        };
        
        // Referencias DOM expandidas
        this.elements = {};
        
        console.log('🌌 Galaxy Piano v' + this.version + ' iniciando - Sprint 3 Edition');
    }
    
    /**
     * Inicialización completa de la aplicación (Sprints 1-3)
     */
    async init() {
        try {
            console.log('🚀 Iniciando Galaxy Piano - Sprint 3 Complete...');
            
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
            
            // 9. Configurar interfaz completa
            this.setupCompleteUI();
            
            // 10. Ejecutar tests de integración
            await this.runIntegrationTests();
            
            this.isInitialized = true;
            console.log('✅ Galaxy Piano Sprint 3 inicializado correctamente');
            
            this.updateSystemStatus();
            
        } catch (error) {
            console.error('❌ Error inicializando Galaxy Piano:', error);
            this.showError('Error de inicialización: ' + error.message);
        }
    }
    
    /**
     * Referencias DOM actualizadas para Sprint 3
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
            
            // Composer mode controls (nuevos)
            composerNoteInput: document.getElementById('composer-note-input'),
            composerPlayButton: document.getElementById('composer-play-btn'),
            composerStopButton: document.getElementById('composer-stop-btn'),
            bpmSlider: document.getElementById('bpm-slider'),
            bpmDisplay: document.getElementById('bpm-display'),
            sequencerGrid: document.getElementById('sequencer-grid'),
            chordAnalysis: document.getElementById('chord-analysis'),
            chordSuggestions: document.getElementById('chord-suggestions'),
            
            // Project management (nuevos)
            projectSelect: document.getElementById('project-select'),
            newProjectButton: document.getElementById('new-project-btn'),
            saveProjectButton: document.getElementById('save-project-btn'),
            deleteProjectButton: document.getElementById('delete-project-btn'),
            projectName: document.getElementById('project-name'),
            projectDescription: document.getElementById('project-description'),
            
            // Galaxy
            galaxyCanvas: document.getElementById('galaxy-canvas'),
            loadingIndicator: document.getElementById('loading'),
            
            // Status displays
            currentNotesDisplay: document.getElementById('current-notes'),
            chordInfoDisplay: document.getElementById('chord-info'),
            audioStatusDisplay: document.getElementById('audio-status'),
            galaxyStatusDisplay: document.getElementById('galaxy-status'),
            composerStatusDisplay: document.getElementById('composer-status'),
            projectStatusDisplay: document.getElementById('project-status')
        };
        
        console.log('📋 Referencias DOM expandidas obtenidas');
    }
    
    /**
     * Event listeners expandidos para Sprint 3
     */
    setupEventListeners() {
        // Navigation existente
        this.elements.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Live mode existente
        this.elements.playButton?.addEventListener('click', () => {
            this.playNotes();
        });
        
        this.elements.stopButton?.addEventListener('click', () => {
            this.stopNotes();
        });
        
        this.elements.noteInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.playNotes();
            }
        });
        
        this.elements.volumeSlider?.addEventListener('input', (e) => {
            this.updateVolume(parseInt(e.target.value));
        });
        
        // Composer mode (nuevos)
        this.elements.composerPlayButton?.addEventListener('click', () => {
            this.playComposerSequence();
        });
        
        this.elements.composerStopButton?.addEventListener('click', () => {
            this.stopComposerSequence();
        });
        
        this.elements.composerNoteInput?.addEventListener('input', (e) => {
            this.analyzeComposerInput(e.target.value);
        });
        
        this.elements.composerNoteInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addToSequence();
            }
        });
        
        this.elements.bpmSlider?.addEventListener('input', (e) => {
            this.updateBPM(parseInt(e.target.value));
        });
        
        // Project management (nuevos)
        this.elements.newProjectButton?.addEventListener('click', () => {
            this.createNewProject();
        });
        
        this.elements.saveProjectButton?.addEventListener('click', () => {
            this.saveCurrentProject();
        });
        
        this.elements.deleteProjectButton?.addEventListener('click', () => {
            this.deleteCurrentProject();
        });
        
        this.elements.projectSelect?.addEventListener('change', (e) => {
            this.loadSelectedProject(e.target.value);
        });
        
        this.elements.projectName?.addEventListener('input', (e) => {
            this.updateProjectMetadata('name', e.target.value);
        });
        
        this.elements.projectDescription?.addEventListener('input', (e) => {
            this.updateProjectMetadata('description', e.target.value);
        });
        
        // Window events
        window.addEventListener('resize', () => {
            if (this.galaxyRenderer) {
                this.galaxyRenderer.handleResize();
            }
        });
        
        window.addEventListener('beforeunload', () => {
            this.handleAppExit();
        });
        
        console.log('🎧 Event listeners expandidos configurados');
    }
    
    /**
     * Inicializar audio engine (Sprint 1 - sin cambios)
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
     * Inicializar galaxy renderer (Sprint 2 - mejorado)
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
            
        } catch (error) {
            console.error('❌ Error inicializando galaxy:', error);
            this.updateGalaxyStatus('Error: ' + error.message);
            this.showError('Error de galaxia: ' + error.message);
        }
    }
    
    /**
     * Inicializar star system (Sprint 2 - sin cambios)
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
     * Inicializar sequencer musical (Sprint 3 - NUEVO)
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
     * Inicializar motor de teoría musical (Sprint 3 - NUEVO)
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
     * Inicializar gestor de proyectos (Sprint 3 - NUEVO)
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
     * Configurar interfaz completa (Sprint 3)
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
        
        console.log('🎨 UI completa configurada');
    }
    
    /**
     * Cambiar modo de aplicación (actualizado)
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
     * Inicializar modo compositor (NUEVO)
     */
    initComposerMode() {
        // Actualizar UI de composer
        this.updateSequencerGrid();
        this.updateChordAnalysis();
        this.updateChordSuggestions();
        
        console.log('🎼 Modo Compositor inicializado');
    }
    
    /**
     * Inicializar modo análisis (placeholder para Sprint 4)
     */
    initAnalysisMode() {
        console.log('📊 Modo Análisis preparado (Sprint 4)');
    }
    
    /**
     * Reproducir notas desde input (Live mode - sin cambios)
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
     * Reproducir secuencia del compositor (NUEVO)
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
     * Detener secuencia del compositor (NUEVO)
     */
    stopComposerSequence() {
        if (this.sequencer) {
            this.sequencer.stopSequence();
        }
        console.log('⏹️ Secuencia del compositor detenida');
    }
    
    /**
     * Analizar entrada del compositor en tiempo real (NUEVO)
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
     * Añadir entrada a la secuencia (NUEVO)
     */
    addToSequence() {
        const input = this.elements.composerNoteInput?.value.trim();
        if (!input || !this.sequencer) {
            return;
        }
        
        try {
            const result = this.sequencer.createSequenceFromInput(input, 0);
            
            if (result.success) {
                this.updateSequencerGrid();
                this.elements.composerNoteInput.value = '';
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
     * Actualizar BPM (NUEVO)
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
     * Crear nuevo proyecto (NUEVO)
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
     * Guardar proyecto actual (NUEVO)
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
     * Eliminar proyecto actual (NUEVO)
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
     * Cargar proyecto seleccionado (NUEVO)
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
     * Actualizar metadatos del proyecto (NUEVO)
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
     * Actualizar UI de proyectos (NUEVO)
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
     * Actualizar grid del secuenciador (NUEVO)
     */
    updateSequencerGrid() {
        // Placeholder para visualización del secuenciador
        // Se implementará completamente en la UI
        console.log('🎛️ Grid del secuenciador actualizado');
    }
    
    /**
     * Actualizar análisis de acordes (NUEVO)
     */
    updateChordAnalysis(chordName = '---', confidence = 0) {
        if (this.elements.chordAnalysis) {
            const confidenceText = confidence > 0 ? ` (${Math.round(confidence * 100)}%)` : '';
            this.elements.chordAnalysis.textContent = `Acorde: ${chordName}${confidenceText}`;
        }
    }
    
    /**
     * Actualizar sugerencias de acordes (NUEVO)
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
     * Actualizar estado del compositor (NUEVO)
     */
    updateComposerStatus(status = 'Listo') {
        if (this.elements.composerStatusDisplay) {
            this.elements.composerStatusDisplay.textContent = '🎼 Compositor: ' + status;
        }
    }
    
    /**
     * Actualizar estado de proyectos (NUEVO)
     */
    updateProjectStatus(status = 'Listo') {
        if (this.elements.projectStatusDisplay) {
            this.elements.projectStatusDisplay.textContent = '💾 Proyectos: ' + status;
        }
    }
    
    /**
     * Ejecutar tests de integración (NUEVO)
     */
    async runIntegrationTests() {
        if (!this.isTestModeEnabled()) return;
        
        console.log('🧪 Ejecutando tests de integración...');
        
        const testResults = {
            audio: false,
            galaxy: false,
            sequencer: false,
            musicTheory: false,
            projectManager: false
        };
        
        try {
            // Test Audio Engine
            if (this.audioEngine) {
                testResults.audio = await this.audioEngine.testNote(40, 0.5);
            }
            
            // Test Sequencer
            if (this.sequencer) {
                const sequencerTest = await this.sequencer.testSequencer();
                testResults.sequencer = sequencerTest.parser && sequencerTest.sequencer;
            }
            
            // Test Music Theory
            if (this.musicTheory) {
                const musicTest = await this.musicTheory.testMusicTheory();
                testResults.musicTheory = musicTest.chordDetection && musicTest.suggestions;
            }
            
            // Test Project Manager
            if (this.projectManager) {
                const projectTest = await this.projectManager.testProjectManager();
                testResults.projectManager = Object.values(projectTest).every(r => r === true);
            }
            
            // Test Galaxy (básico)
            testResults.galaxy = this.state.galaxyReady;
            
            console.log('🎯 Resultados de integración:', testResults);
            
            const allPassed = Object.values(testResults).every(result => result === true);
            if (allPassed) {
                console.log('✅ Todos los tests de integración PASARON');
            } else {
                console.log('⚠️ Algunos tests de integración FALLARON');
            }
            
        } catch (error) {
            console.error('❌ Error en tests de integración:', error);
        }
    }
    
    /**
     * Verificar si el modo de test está habilitado
     */
    isTestModeEnabled() {
        return window.location.hash.includes('test') || window.location.search.includes('test');
    }
    
    /**
     * Manejar salida de aplicación (NUEVO)
     */
    handleAppExit() {
        if (this.projectManager && this.state.currentProject) {
            // Auto-guardado al salir
            this.projectManager.saveCurrentProject().catch(console.error);
        }
    }
    
    /**
     * Mostrar mensaje de éxito (NUEVO)
     */
    showSuccess(message) {
        console.log('✅ Éxito:', message);
        // TODO: Implementar notificaciones visuales
    }
    
    /**
     * Obtener estadísticas completas del sistema (actualizado)
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
            
            // Nuevos módulos Sprint 3
            sequencer: this.sequencer?.getStats() || null,
            musicTheory: this.musicTheory?.getStats() || null,
            projects: this.projectManager?.getStats() || null,
            
            // Estado de la aplicación
            state: this.state
        };
        
        return stats;
    }
    
    // Métodos existentes sin cambios...
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
    
    updateVolume(volume) {
        this.state.volume = Math.max(0, Math.min(100, volume));
        
        if (this.audioEngine) {
            this.audioEngine.setVolume(this.state.volume / 100);
        }
        
        this.elements.volumeSlider.value = this.state.volume;
        this.elements.volumeDisplay.textContent = this.state.volume + '%';
    }
    
    updateNoteDisplay(notes) {
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
    
    updateChordInfo(chordName) {
        this.elements.chordInfoDisplay.textContent = 'Acorde: ' + chordName;
    }
    
    updateSystemStatus() {
        this.updateAudioStatus();
        this.updateGalaxyStatus();
        this.updateComposerStatus();
        this.updateProjectStatus();
    }
    
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
    
    updateGalaxyStatus(customStatus = null) {
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
    
    hideLoading() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.classList.add('hidden');
        }
    }
    
    showError(message) {
        console.error('⚠️ Error:', message);
        alert('Galaxy Piano - Error: ' + message);
    }
    
    /**
     * Destruir aplicación completa (actualizado)
     */
    destroy() {
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
        
        console.log('🛑 Galaxy Piano Sprint 3 destruido');
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