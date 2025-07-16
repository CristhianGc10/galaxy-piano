/**
 * GALAXY PIANO - PROJECT MANAGER
 * Sistema completo de gestión de proyectos musicales
 * Sprint 3 - Días 19-21: Sistema de Proyectos CRUD
 */

class ProjectManager {
    constructor(audioEngine, galaxyRenderer, starSystem, sequencer, musicTheory) {
        this.audioEngine = audioEngine;
        this.galaxyRenderer = galaxyRenderer;
        this.starSystem = starSystem;
        this.sequencer = sequencer;
        this.musicTheory = musicTheory;
        
        // Configuración del gestor
        this.config = {
            maxProjects: 50,
            autoSaveInterval: 30000, // 30 segundos
            backupLimit: 5,
            compressionEnabled: true,
            encryptionEnabled: false,
            cloudSyncEnabled: false
        };
        
        // Estado del gestor
        this.state = {
            projects: new Map(),
            currentProject: null,
            isDirty: false,
            autoSaveTimer: null,
            lastSaved: null,
            totalProjects: 0
        };
        
        // Metadatos de proyectos
        this.projectMetadata = {
            version: '1.0.0',
            storageKey: 'galaxy-piano-projects',
            backupKey: 'galaxy-piano-backups',
            settingsKey: 'galaxy-piano-settings'
        };
        
        console.log('💾 ProjectManager inicializado');
        this.initializeStorage();
        this.setupAutoSave();
    }
    
    /**
     * 3.15 Inicializar sistema de almacenamiento
     */
    initializeStorage() {
        try {
            // Verificar disponibilidad de localStorage
            if (!this.isStorageAvailable()) {
                console.warn('⚠️ LocalStorage no disponible - funcionalidad limitada');
                return;
            }
            
            // Cargar proyectos existentes
            this.loadProjectsFromStorage();
            
            // Cargar configuración
            this.loadSettings();
            
            // Crear proyecto por defecto si no hay ninguno
            if (this.state.projects.size === 0) {
                this.createDefaultProject();
            }
            
            console.log('📂 Storage inicializado:', this.state.projects.size, 'proyectos cargados');
            
        } catch (error) {
            console.error('❌ Error inicializando storage:', error);
        }
    }
    
    /**
     * Verificar disponibilidad de localStorage
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 3.16 Crear nuevo proyecto
     */
    createProject(projectData = {}) {
        const defaultData = {
            name: 'Nuevo Proyecto Musical',
            description: 'Descripción del proyecto',
            bpm: 120,
            key: 'C',
            scale: 'major',
            timeSignature: [4, 4]
        };
        
        const mergedData = { ...defaultData, ...projectData };
        
        const project = {
            id: this.generateProjectId(),
            ...mergedData,
            
            // Metadatos
            version: this.projectMetadata.version,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            playCount: 0,
            totalDuration: 0,
            
            // Contenido musical
            patterns: new Map(),
            tracks: [],
            chordProgression: [],
            notes: [],
            
            // Configuración visual
            galaxySettings: {
                autoRotate: true,
                starSize: 3.0,
                colorScheme: 'spectral',
                backgroundStars: 1000
            },
            
            // Configuración de audio
            audioSettings: {
                masterVolume: 0.7,
                oscillatorType: 'triangle',
                reverbEnabled: false,
                filterEnabled: true
            },
            
            // Estado del proyecto
            state: {
                currentPattern: null,
                isPlaying: false,
                currentPosition: 0,
                loop: true
            }
        };
        
        // Guardar proyecto
        this.state.projects.set(project.id, project);
        this.state.totalProjects++;
        this.markDirty();
        
        console.log('📄 Proyecto creado:', project.name, `(ID: ${project.id})`);
        
        return project;
    }
    
    /**
     * Crear proyecto por defecto
     */
    createDefaultProject() {
        const defaultProject = this.createProject({
            name: 'Mi Primera Galaxia Musical',
            description: 'Explora el universo musical con Galaxy Piano',
            notes: [40, 43, 47], // C major chord
            chordProgression: ['C', 'Am', 'F', 'G']
        });
        
        this.loadProject(defaultProject.id);
        return defaultProject;
    }
    
    /**
     * 3.17 Cargar proyecto activo
     */
    async loadProject(projectId) {
        const project = this.state.projects.get(projectId);
        
        if (!project) {
            throw new Error(`Proyecto no encontrado: ${projectId}`);
        }
        
        try {
            // Guardar proyecto actual antes de cambiar
            if (this.state.currentProject) {
                await this.saveCurrentProject();
            }
            
            // Cambiar proyecto activo
            this.state.currentProject = projectId;
            
            // Aplicar configuración del proyecto
            await this.applyProjectConfiguration(project);
            
            // Actualizar timestamp de acceso
            project.lastAccessedAt = Date.now();
            this.markDirty();
            
            console.log('📂 Proyecto cargado:', project.name);
            
            return project;
            
        } catch (error) {
            console.error('❌ Error cargando proyecto:', error);
            throw error;
        }
    }
    
    /**
     * Aplicar configuración del proyecto a los sistemas
     */
    async applyProjectConfiguration(project) {
        try {
            // Configurar audio engine
            if (this.audioEngine && project.audioSettings) {
                this.audioEngine.setVolume(project.audioSettings.masterVolume);
                this.audioEngine.setOscillatorType(project.audioSettings.oscillatorType);
            }
            
            // Configurar galaxy renderer
            if (this.galaxyRenderer && project.galaxySettings) {
                // Aplicar configuración de galaxia
                const galaxyConfig = project.galaxySettings;
                if (galaxyConfig.autoRotate !== undefined) {
                    this.galaxyRenderer.config.autoRotate = galaxyConfig.autoRotate;
                }
                if (galaxyConfig.starSize !== undefined) {
                    this.galaxyRenderer.config.starSize = galaxyConfig.starSize;
                }
            }
            
            // Configurar sequencer
            if (this.sequencer && project.bpm) {
                this.sequencer.state.currentBPM = project.bpm;
            }
            
            // Configurar music theory
            if (this.musicTheory && project.key && project.scale) {
                this.musicTheory.analysisState.currentKey = project.key;
                this.musicTheory.analysisState.currentScale = project.scale;
            }
            
            // Cargar contenido musical
            if (project.notes && project.notes.length > 0) {
                // Crear estrellas iniciales
                if (this.starSystem) {
                    this.starSystem.createStars(project.notes, 2.0, 0.8);
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Error aplicando configuración:', error);
        }
    }
    
    /**
     * 3.18 Guardar proyecto actual
     */
    async saveProject(projectId = null, data = null) {
        const targetId = projectId || this.state.currentProject;
        if (!targetId) {
            throw new Error('No hay proyecto para guardar');
        }
        
        const project = this.state.projects.get(targetId);
        if (!project) {
            throw new Error(`Proyecto no encontrado: ${targetId}`);
        }
        
        try {
            // Actualizar datos si se proporcionan
            if (data) {
                Object.assign(project, data);
            }
            
            // Capturar estado actual de los sistemas
            await this.captureCurrentState(project);
            
            // Actualizar metadatos
            project.modifiedAt = Date.now();
            
            // Guardar en localStorage
            await this.saveProjectsToStorage();
            
            this.state.isDirty = false;
            this.state.lastSaved = Date.now();
            
            console.log('💾 Proyecto guardado:', project.name);
            
            return project;
            
        } catch (error) {
            console.error('❌ Error guardando proyecto:', error);
            throw error;
        }
    }
    
    /**
     * Capturar estado actual de todos los sistemas
     */
    async captureCurrentState(project) {
        try {
            // Capturar estado del sequencer
            if (this.sequencer) {
                const sequencerStats = this.sequencer.getStats();
                project.state.currentBPM = sequencerStats.currentBPM;
                project.state.isPlaying = sequencerStats.isPlaying;
                
                // Guardar patrones activos
                if (this.sequencer.patterns) {
                    project.patterns = new Map(this.sequencer.patterns);
                }
            }
            
            // Capturar progresión de acordes
            if (this.musicTheory) {
                const musicStats = this.musicTheory.getStats();
                project.chordProgression = [...this.musicTheory.analysisState.chordProgression];
                project.key = musicStats.currentKey;
                project.scale = musicStats.currentScale;
            }
            
            // Capturar configuración de galaxia
            if (this.galaxyRenderer) {
                const galaxyInfo = this.galaxyRenderer.getInfo();
                project.galaxySettings.autoRotate = galaxyInfo.autoRotate;
                project.galaxySettings.backgroundStars = galaxyInfo.backgroundStars;
            }
            
            // Capturar configuración de audio
            if (this.audioEngine) {
                const audioStats = this.audioEngine.getStats();
                project.audioSettings.masterVolume = audioStats.masterVolume;
                project.audioSettings.oscillatorType = this.audioEngine.config.oscillatorType;
            }
            
        } catch (error) {
            console.warn('⚠️ Error capturando estado:', error);
        }
    }
    
    /**
     * Guardar proyecto actual rápido
     */
    async saveCurrentProject() {
        if (this.state.currentProject) {
            return await this.saveProject(this.state.currentProject);
        }
    }
    
    /**
     * 3.19 Eliminar proyecto
     */
    async deleteProject(projectId) {
        const project = this.state.projects.get(projectId);
        if (!project) {
            throw new Error(`Proyecto no encontrado: ${projectId}`);
        }
        
        try {
            // Crear backup antes de eliminar
            await this.createBackup(project);
            
            // Eliminar del estado
            this.state.projects.delete(projectId);
            this.state.totalProjects--;
            
            // Si era el proyecto actual, cambiar a otro
            if (this.state.currentProject === projectId) {
                const remainingProjects = Array.from(this.state.projects.keys());
                if (remainingProjects.length > 0) {
                    await this.loadProject(remainingProjects[0]);
                } else {
                    // Crear nuevo proyecto por defecto
                    const newProject = this.createDefaultProject();
                    this.state.currentProject = newProject.id;
                }
            }
            
            // Guardar cambios
            await this.saveProjectsToStorage();
            this.markDirty();
            
            console.log('🗑️ Proyecto eliminado:', project.name);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error eliminando proyecto:', error);
            throw error;
        }
    }
    
    /**
     * 3.20 Obtener lista de proyectos
     */
    getProjectsList() {
        return Array.from(this.state.projects.values()).map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
            modifiedAt: project.modifiedAt,
            lastAccessedAt: project.lastAccessedAt,
            playCount: project.playCount,
            totalDuration: project.totalDuration,
            isCurrent: project.id === this.state.currentProject,
            hasAudio: project.notes && project.notes.length > 0,
            hasChords: project.chordProgression && project.chordProgression.length > 0,
            bpm: project.bpm,
            key: project.key,
            scale: project.scale
        })).sort((a, b) => b.modifiedAt - a.modifiedAt); // Más recientes primero
    }
    
    /**
     * Buscar proyectos
     */
    searchProjects(query, options = {}) {
        const {
            searchFields = ['name', 'description'],
            caseSensitive = false,
            exactMatch = false
        } = options;
        
        if (!query || query.trim().length === 0) {
            return this.getProjectsList();
        }
        
        const searchTerm = caseSensitive ? query : query.toLowerCase();
        
        return this.getProjectsList().filter(project => {
            return searchFields.some(field => {
                const fieldValue = caseSensitive ? project[field] : project[field]?.toLowerCase();
                
                if (exactMatch) {
                    return fieldValue === searchTerm;
                } else {
                    return fieldValue?.includes(searchTerm);
                }
            });
        });
    }
    
    /**
     * Duplicar proyecto
     */
    async duplicateProject(projectId, newName = null) {
        const originalProject = this.state.projects.get(projectId);
        if (!originalProject) {
            throw new Error(`Proyecto no encontrado: ${projectId}`);
        }
        
        // Crear copia del proyecto
        const duplicatedProject = JSON.parse(JSON.stringify(originalProject));
        
        // Actualizar metadatos
        duplicatedProject.id = this.generateProjectId();
        duplicatedProject.name = newName || `${originalProject.name} (Copia)`;
        duplicatedProject.createdAt = Date.now();
        duplicatedProject.modifiedAt = Date.now();
        duplicatedProject.playCount = 0;
        duplicatedProject.lastAccessedAt = null;
        
        // Convertir patrones de vuelta a Map
        if (duplicatedProject.patterns) {
            duplicatedProject.patterns = new Map(Object.entries(duplicatedProject.patterns));
        }
        
        // Guardar proyecto duplicado
        this.state.projects.set(duplicatedProject.id, duplicatedProject);
        this.state.totalProjects++;
        this.markDirty();
        
        console.log('📋 Proyecto duplicado:', duplicatedProject.name);
        
        return duplicatedProject;
    }
    
    /**
     * Cargar proyectos desde localStorage
     */
    loadProjectsFromStorage() {
        try {
            const storedData = localStorage.getItem(this.projectMetadata.storageKey);
            if (!storedData) return;
            
            const parsedData = JSON.parse(storedData);
            
            // Cargar proyectos
            if (parsedData.projects) {
                parsedData.projects.forEach(projectData => {
                    // Convertir patterns de objeto a Map
                    if (projectData.patterns) {
                        projectData.patterns = new Map(Object.entries(projectData.patterns));
                    }
                    
                    this.state.projects.set(projectData.id, projectData);
                });
            }
            
            // Cargar estado
            if (parsedData.state) {
                this.state.currentProject = parsedData.state.currentProject;
                this.state.totalProjects = parsedData.state.totalProjects || this.state.projects.size;
            }
            
        } catch (error) {
            console.error('❌ Error cargando proyectos:', error);
        }
    }
    
    /**
     * Guardar proyectos en localStorage
     */
    async saveProjectsToStorage() {
        try {
            // Convertir Maps a Objects para serialización
            const projectsArray = Array.from(this.state.projects.values()).map(project => {
                const serializedProject = { ...project };
                
                // Convertir patterns Map a objeto
                if (serializedProject.patterns instanceof Map) {
                    serializedProject.patterns = Object.fromEntries(serializedProject.patterns);
                }
                
                return serializedProject;
            });
            
            const dataToSave = {
                projects: projectsArray,
                state: {
                    currentProject: this.state.currentProject,
                    totalProjects: this.state.totalProjects,
                    lastSaved: Date.now()
                },
                metadata: this.projectMetadata
            };
            
            localStorage.setItem(this.projectMetadata.storageKey, JSON.stringify(dataToSave));
            
        } catch (error) {
            console.error('❌ Error guardando proyectos:', error);
            throw error;
        }
    }
    
    /**
     * Configurar auto-guardado
     */
    setupAutoSave() {
        if (this.state.autoSaveTimer) {
            clearInterval(this.state.autoSaveTimer);
        }
        
        this.state.autoSaveTimer = setInterval(async () => {
            if (this.state.isDirty && this.state.currentProject) {
                try {
                    await this.saveCurrentProject();
                    console.log('💾 Auto-guardado completado');
                } catch (error) {
                    console.warn('⚠️ Error en auto-guardado:', error);
                }
            }
        }, this.config.autoSaveInterval);
    }
    
    /**
     * Crear backup de proyecto
     */
    async createBackup(project) {
        try {
            const backups = this.getBackups();
            
            const backup = {
                id: this.generateProjectId(),
                originalId: project.id,
                projectData: JSON.parse(JSON.stringify(project)),
                createdAt: Date.now(),
                type: 'manual'
            };
            
            backups.push(backup);
            
            // Mantener solo los últimos N backups
            if (backups.length > this.config.backupLimit) {
                backups.splice(0, backups.length - this.config.backupLimit);
            }
            
            localStorage.setItem(this.projectMetadata.backupKey, JSON.stringify(backups));
            
            console.log('📦 Backup creado para:', project.name);
            
        } catch (error) {
            console.warn('⚠️ Error creando backup:', error);
        }
    }
    
    /**
     * Obtener lista de backups
     */
    getBackups() {
        try {
            const stored = localStorage.getItem(this.projectMetadata.backupKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('⚠️ Error cargando backups:', error);
            return [];
        }
    }
    
    /**
     * Cargar configuración
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(this.projectMetadata.settingsKey);
            if (stored) {
                const settings = JSON.parse(stored);
                Object.assign(this.config, settings);
            }
        } catch (error) {
            console.warn('⚠️ Error cargando configuración:', error);
        }
    }
    
    /**
     * Guardar configuración
     */
    saveSettings() {
        try {
            localStorage.setItem(this.projectMetadata.settingsKey, JSON.stringify(this.config));
        } catch (error) {
            console.warn('⚠️ Error guardando configuración:', error);
        }
    }
    
    /**
     * Marcar como modificado
     */
    markDirty() {
        this.state.isDirty = true;
    }
    
    /**
     * Generar ID único para proyecto
     */
    generateProjectId() {
        return 'proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 3.21 Test completo del sistema de proyectos
     */
    async testProjectManager() {
        console.log('🧪 Testing Project Manager...');
        
        const results = {
            creation: false,
            loading: false,
            saving: false,
            deletion: false,
            listing: false
        };
        
        try {
            // Test 1: Crear proyecto
            const testProject = this.createProject({
                name: 'Test Project',
                description: 'Proyecto de prueba',
                notes: [40, 43, 47]
            });
            results.creation = !!testProject.id;
            console.log('✅ Test 1 - Creación:', testProject.name);
            
            // Test 2: Cargar proyecto
            await this.loadProject(testProject.id);
            results.loading = this.state.currentProject === testProject.id;
            console.log('✅ Test 2 - Carga completada');
            
            // Test 3: Guardar proyecto
            testProject.description = 'Proyecto modificado';
            await this.saveProject(testProject.id, { description: testProject.description });
            results.saving = !this.state.isDirty;
            console.log('✅ Test 3 - Guardado completado');
            
            // Test 4: Listar proyectos
            const projectsList = this.getProjectsList();
            results.listing = projectsList.length > 0;
            console.log('✅ Test 4 - Lista:', projectsList.length, 'proyectos');
            
            // Test 5: Eliminar proyecto de prueba
            await this.deleteProject(testProject.id);
            results.deletion = !this.state.projects.has(testProject.id);
            console.log('✅ Test 5 - Eliminación completada');
            
        } catch (error) {
            console.error('❌ Error en test:', error);
        }
        
        const success = Object.values(results).every(result => result === true);
        console.log('🎯 Project Manager Test Result:', success ? 'PASSED' : 'FAILED');
        console.table(results);
        
        return results;
    }
    
    /**
     * Obtener estadísticas del gestor
     */
    getStats() {
        const projects = this.getProjectsList();
        
        return {
            totalProjects: this.state.totalProjects,
            currentProject: this.state.currentProject,
            isDirty: this.state.isDirty,
            lastSaved: this.state.lastSaved,
            storageUsed: this.getStorageUsage(),
            backupsCount: this.getBackups().length,
            averageProjectSize: projects.length > 0 ? 
                projects.reduce((sum, p) => sum + (p.totalDuration || 0), 0) / projects.length : 0,
            mostRecentProject: projects[0]?.name || 'N/A',
            autoSaveEnabled: !!this.state.autoSaveTimer
        };
    }
    
    /**
     * Calcular uso de almacenamiento
     */
    getStorageUsage() {
        try {
            const data = localStorage.getItem(this.projectMetadata.storageKey);
            return data ? (data.length / 1024).toFixed(2) + ' KB' : '0 KB';
        } catch (error) {
            return 'Error calculando';
        }
    }
    
    /**
     * Exportar proyecto a JSON
     */
    exportProject(projectId) {
        const project = this.state.projects.get(projectId);
        if (!project) {
            throw new Error(`Proyecto no encontrado: ${projectId}`);
        }
        
        const exportData = {
            ...project,
            exportedAt: Date.now(),
            exportVersion: this.projectMetadata.version
        };
        
        // Convertir Maps a Objects
        if (exportData.patterns instanceof Map) {
            exportData.patterns = Object.fromEntries(exportData.patterns);
        }
        
        return JSON.stringify(exportData, null, 2);
    }
    
    /**
     * Importar proyecto desde JSON
     */
    async importProject(jsonData) {
        try {
            const projectData = JSON.parse(jsonData);
            
            // Generar nuevo ID para evitar conflictos
            const originalId = projectData.id;
            projectData.id = this.generateProjectId();
            projectData.name = `${projectData.name} (Importado)`;
            
            // Convertir patterns de objeto a Map
            if (projectData.patterns) {
                projectData.patterns = new Map(Object.entries(projectData.patterns));
            }
            
            // Guardar proyecto importado
            this.state.projects.set(projectData.id, projectData);
            this.state.totalProjects++;
            this.markDirty();
            
            console.log('📥 Proyecto importado:', projectData.name);
            
            return projectData;
            
        } catch (error) {
            console.error('❌ Error importando proyecto:', error);
            throw new Error('Formato de proyecto inválido');
        }
    }
    
    /**
     * Destruir gestor y limpiar recursos
     */
    destroy() {
        console.log('🛑 Destruyendo Project Manager...');
        
        // Guardar estado actual
        if (this.state.isDirty && this.state.currentProject) {
            this.saveCurrentProject().catch(console.error);
        }
        
        // Limpiar auto-save
        if (this.state.autoSaveTimer) {
            clearInterval(this.state.autoSaveTimer);
        }
        
        // Limpiar referencias
        this.state.projects.clear();
        this.state.currentProject = null;
        
        console.log('✅ Project Manager destruido');
    }
}

// Exponer clase globalmente
window.ProjectManager = ProjectManager;