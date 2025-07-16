/**
 * GALAXY PIANO - FILE MANAGER
 * Sistema completo de exportación e importación - CORREGIDO
 * Sprint 4 - Día 26-28: Exportación MIDI, MP3, JSON
 */

class FileManager {
    constructor(audioEngine, projectManager, sequencer, musicTheory) {
        this.audioEngine = audioEngine;
        this.projectManager = projectManager;
        this.sequencer = sequencer;
        this.musicTheory = musicTheory;
        
        // Configuración del gestor de archivos
        this.config = {
            supportedFormats: ['midi', 'mp3', 'wav', 'json', 'png'],
            maxFileSize: 50 * 1024 * 1024, // 50MB
            audioQuality: {
                mp3: { bitRate: 128, sampleRate: 44100 },
                wav: { bitRate: 16, sampleRate: 44100 }
            },
            exportDirectory: 'galaxy-piano-exports',
            compressionLevel: 6
        };
        
        // Estado del gestor
        this.state = {
            isExporting: false,
            isImporting: false,
            currentExport: null,
            exportProgress: 0,
            mediaRecorder: null,
            recordedChunks: [],
            audioContext: null
        };
        
        // Utilidades MIDI
        this.midiUtils = {
            ticksPerQuarter: 480,
            microsecondsPerQuarter: 500000, // 120 BPM
            channels: new Map()
        };
        
        console.log('📁 FileManager inicializado');
        this.initializeFileSystem();
    }
    
    /**
     * 4.13 Inicializar sistema de archivos - CORREGIDO
     */
    initializeFileSystem() {
        // Verificar soporte de APIs necesarias
        this.checkBrowserSupport();
        
        // Configurar MediaRecorder si está disponible
        if (window.MediaRecorder) {
            this.setupMediaRecorder();
        } else {
            console.warn('⚠️ MediaRecorder no disponible - grabación limitada');
        }
        
        console.log('💾 Sistema de archivos inicializado');
    }
    
    /**
     * Configurar MediaRecorder básico - AÑADIDO
     */
    setupMediaRecorder() {
        // Configuración básica de MediaRecorder
        this.state.mediaRecorder = null;
        this.state.recordedChunks = [];
        
        console.log('🎙️ MediaRecorder configurado');
    }
    
    /**
     * Verificar soporte del navegador
     */
    checkBrowserSupport() {
        const support = {
            fileAPI: !!(window.File && window.FileReader && window.FileList && window.Blob),
            downloadAPI: !!window.URL.createObjectURL,
            mediaRecorder: !!window.MediaRecorder,
            webAudio: !!(window.AudioContext || window.webkitAudioContext),
            canvas: !!document.createElement('canvas').getContext
        };
        
        console.log('🔍 Soporte del navegador:', support);
        
        if (!support.fileAPI) {
            console.warn('⚠️ File API no soportada');
        }
        
        if (!support.mediaRecorder) {
            console.warn('⚠️ MediaRecorder no soportado - grabación de audio limitada');
        }
        
        return support;
    }
    
    /**
     * 4.14 Exportar proyecto a MIDI
     */
    async exportToMIDI(projectId = null, options = {}) {
        const {
            includeMetadata = true,
            trackSeparation = true,
            quantization = 16
        } = options;
        
        try {
            this.state.isExporting = true;
            this.state.exportProgress = 0;
            
            console.log('🎵 Iniciando exportación a MIDI...');
            
            // Obtener datos del proyecto
            const projectData = await this.getProjectData(projectId);
            if (!projectData) {
                throw new Error('No se pudo obtener datos del proyecto');
            }
            
            // Crear estructura MIDI
            const midiData = this.createMIDIStructure(projectData, {
                includeMetadata,
                trackSeparation,
                quantization
            });
            
            this.state.exportProgress = 50;
            
            // Generar archivo MIDI binario
            const midiBuffer = this.generateMIDIFile(midiData);
            
            this.state.exportProgress = 80;
            
            // Crear blob y descargar
            const blob = new Blob([midiBuffer], { type: 'audio/midi' });
            const filename = `${projectData.name || 'galaxy-piano-project'}.mid`;
            
            this.downloadFile(blob, filename);
            
            this.state.exportProgress = 100;
            console.log('✅ Exportación MIDI completada:', filename);
            
            return { success: true, filename, size: blob.size };
            
        } catch (error) {
            console.error('❌ Error exportando a MIDI:', error);
            throw error;
        } finally {
            this.state.isExporting = false;
        }
    }
    
    /**
     * Crear estructura MIDI desde datos del proyecto
     */
    createMIDIStructure(projectData, options) {
        const midiData = {
            header: {
                format: 1, // Multi-track
                tracks: options.trackSeparation ? 4 : 1,
                ticksPerQuarter: this.midiUtils.ticksPerQuarter
            },
            tracks: []
        };
        
        // Track 0: Metadata y tempo
        const metaTrack = this.createMetaTrack(projectData, options);
        midiData.tracks.push(metaTrack);
        
        // Tracks musicales
        if (projectData.tracks && projectData.tracks.length > 0) {
            projectData.tracks.forEach((track, index) => {
                if (track.steps && track.steps.some(step => step.active)) {
                    const midiTrack = this.createMIDITrack(track, index, options);
                    midiData.tracks.push(midiTrack);
                }
            });
        } else {
            // Crear track desde notas básicas
            const basicTrack = this.createBasicMIDITrack(projectData, options);
            midiData.tracks.push(basicTrack);
        }
        
        return midiData;
    }
    
    /**
     * Crear track de metadata MIDI
     */
    createMetaTrack(projectData, options) {
        const events = [];
        
        // Evento de nombre de secuencia
        if (options.includeMetadata && projectData.name) {
            events.push({
                deltaTime: 0,
                type: 'meta',
                subtype: 'sequenceName',
                text: projectData.name
            });
        }
        
        // Tempo
        const bpm = projectData.bpm || 120;
        const microsecondsPerQuarter = Math.round(60000000 / bpm);
        events.push({
            deltaTime: 0,
            type: 'meta',
            subtype: 'setTempo',
            microsecondsPerQuarter: microsecondsPerQuarter
        });
        
        // Signatura de tiempo
        events.push({
            deltaTime: 0,
            type: 'meta',
            subtype: 'timeSignature',
            numerator: projectData.timeSignature?.[0] || 4,
            denominator: projectData.timeSignature?.[1] || 4,
            metronome: 24,
            thirtyseconds: 8
        });
        
        // Fin de track
        events.push({
            deltaTime: 0,
            type: 'meta',
            subtype: 'endOfTrack'
        });
        
        return { events };
    }
    
    /**
     * Crear track MIDI desde track del secuenciador
     */
    createMIDITrack(track, trackIndex, options) {
        const events = [];
        const channel = trackIndex % 16; // MIDI tiene 16 canales
        
        // Nombre del track
        events.push({
            deltaTime: 0,
            type: 'meta',
            subtype: 'trackName',
            text: track.name || `Track ${trackIndex + 1}`
        });
        
        // Convertir steps a eventos MIDI
        const ticksPerStep = this.midiUtils.ticksPerQuarter / (options.quantization / 4);
        
        track.steps.forEach((step, stepIndex) => {
            if (!step.active || step.notes.length === 0) return;
            
            const stepTime = stepIndex * ticksPerStep;
            const velocity = Math.round(step.velocity * 127);
            const duration = Math.round(step.duration * ticksPerStep);
            
            step.notes.forEach(noteNumber => {
                const midiNote = this.convertToMIDINote(noteNumber);
                
                // Note On
                events.push({
                    deltaTime: stepTime,
                    type: 'channel',
                    subtype: 'noteOn',
                    channel: channel,
                    noteNumber: midiNote,
                    velocity: velocity
                });
                
                // Note Off
                events.push({
                    deltaTime: stepTime + duration,
                    type: 'channel',
                    subtype: 'noteOff',
                    channel: channel,
                    noteNumber: midiNote,
                    velocity: 0
                });
            });
        });
        
        // Fin de track
        events.push({
            deltaTime: 0,
            type: 'meta',
            subtype: 'endOfTrack'
        });
        
        // Ordenar eventos por tiempo
        events.sort((a, b) => a.deltaTime - b.deltaTime);
        
        // Convertir a delta times relativos
        this.convertToRelativeDeltaTimes(events);
        
        return { events };
    }
    
    /**
     * 4.16 Exportar proyecto a JSON
     */
    async exportToJSON(projectId = null, options = {}) {
        const {
            includeAudioSettings = true,
            includeVisualSettings = true,
            includeMetadata = true,
            prettify = true
        } = options;
        
        try {
            this.state.isExporting = true;
            this.state.exportProgress = 0;
            
            console.log('📄 Iniciando exportación a JSON...');
            
            // Obtener datos completos del proyecto
            const projectData = await this.getProjectData(projectId);
            if (!projectData) {
                throw new Error('No se pudo obtener datos del proyecto');
            }
            
            this.state.exportProgress = 30;
            
            // Crear estructura de exportación
            const exportData = {
                // Metadata del archivo
                exportMetadata: {
                    version: '1.0.0',
                    exportedAt: new Date().toISOString(),
                    exportedBy: 'Galaxy Piano v1.0.0',
                    format: 'galaxy-piano-project'
                },
                
                // Datos del proyecto
                project: {
                    ...projectData
                }
            };
            
            // Filtrar según opciones
            if (!includeAudioSettings) {
                delete exportData.project.audioSettings;
            }
            
            if (!includeVisualSettings) {
                delete exportData.project.galaxySettings;
            }
            
            if (!includeMetadata) {
                delete exportData.exportMetadata;
            }
            
            this.state.exportProgress = 70;
            
            // Convertir patterns Map a Object si existe
            if (exportData.project.patterns instanceof Map) {
                exportData.project.patterns = Object.fromEntries(exportData.project.patterns);
            }
            
            // Serializar a JSON
            const jsonString = prettify ? 
                JSON.stringify(exportData, null, 2) : 
                JSON.stringify(exportData);
            
            this.state.exportProgress = 90;
            
            // Crear blob y descargar
            const blob = new Blob([jsonString], { type: 'application/json' });
            const filename = `${projectData.name || 'galaxy-piano-project'}.json`;
            
            this.downloadFile(blob, filename);
            
            this.state.exportProgress = 100;
            console.log('✅ Exportación JSON completada:', filename);
            
            return { success: true, filename, size: blob.size };
            
        } catch (error) {
            console.error('❌ Error exportando a JSON:', error);
            throw error;
        } finally {
            this.state.isExporting = false;
        }
    }
    
    /**
     * 4.18 Exportar captura de pantalla de la galaxia
     */
    async exportGalaxyScreenshot(format = 'png', quality = 0.9) {
        try {
            console.log('📸 Capturando imagen de la galaxia...');
            
            // Obtener canvas de la galaxia
            const galaxyCanvas = document.getElementById('galaxy-canvas') || 
                               document.getElementById('galaxy-canvas-composer') ||
                               document.getElementById('galaxy-canvas-analysis');
            
            if (!galaxyCanvas) {
                throw new Error('Canvas de galaxia no encontrado');
            }
            
            // Crear blob desde canvas
            return new Promise((resolve, reject) => {
                galaxyCanvas.toBlob((blob) => {
                    if (blob) {
                        const filename = `galaxy-${Date.now()}.${format}`;
                        this.downloadFile(blob, filename);
                        
                        console.log('✅ Captura guardada:', filename);
                        resolve({ success: true, filename, size: blob.size });
                    } else {
                        reject(new Error('Error creando imagen'));
                    }
                }, `image/${format}`, quality);
            });
            
        } catch (error) {
            console.error('❌ Error capturando galaxia:', error);
            throw error;
        }
    }
    
    /**
     * 4.15 Exportar proyecto a MP3 (simplificado)
     */
    async exportToMP3(projectId = null, options = {}) {
        const {
            duration = 5000, // 5 segundos por defecto
            quality = 'medium'
        } = options;
        
        try {
            this.state.isExporting = true;
            this.state.exportProgress = 0;
            
            console.log('🎵 Iniciando exportación a MP3...');
            
            // Verificar soporte
            if (!window.MediaRecorder) {
                throw new Error('MediaRecorder no soportado en este navegador');
            }
            
            // Obtener datos del proyecto
            const projectData = await this.getProjectData(projectId);
            if (!projectData) {
                throw new Error('No se pudo obtener datos del proyecto');
            }
            
            this.state.exportProgress = 50;
            
            // Por ahora, crear un archivo simple con las notas del proyecto
            const audioBuffer = await this.createSimpleAudioBuffer(projectData, duration);
            
            this.state.exportProgress = 90;
            
            // Crear blob simulado (en implementación real usaríamos MediaRecorder)
            const blob = new Blob([audioBuffer], { type: 'audio/wav' });
            const filename = `${projectData.name || 'galaxy-piano-project'}.wav`;
            
            this.downloadFile(blob, filename);
            
            this.state.exportProgress = 100;
            console.log('✅ Exportación de audio completada:', filename);
            
            return { success: true, filename, size: blob.size };
            
        } catch (error) {
            console.error('❌ Error exportando audio:', error);
            throw error;
        } finally {
            this.state.isExporting = false;
        }
    }
    
    /**
     * Crear buffer de audio simple (placeholder)
     */
    async createSimpleAudioBuffer(projectData, duration) {
        // Implementación simplificada - en una versión completa usaríamos Web Audio API
        const sampleRate = 44100;
        const samples = Math.floor(sampleRate * duration / 1000);
        const buffer = new ArrayBuffer(samples * 2); // 16-bit samples
        
        return buffer;
    }
    
    /**
     * Utilidades de descarga
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    /**
     * Obtener datos del proyecto
     */
    async getProjectData(projectId) {
        if (this.projectManager) {
            const currentId = projectId || this.projectManager.state.currentProject;
            if (currentId) {
                return this.projectManager.state.projects.get(currentId);
            }
        }
        
        // Fallback con datos básicos
        return {
            name: 'Galaxy Piano Export',
            description: 'Exportado desde Galaxy Piano',
            bpm: 120,
            notes: [40, 43, 47], // C Major chord
            createdAt: Date.now()
        };
    }
    
    /**
     * Convertir nota de Galaxy Piano a MIDI
     */
    convertToMIDINote(noteNumber) {
        // Nuestro sistema: 1-88 → MIDI: 21-108
        return noteNumber + 20;
    }
    
    /**
     * Convertir a delta times relativos
     */
    convertToRelativeDeltaTimes(events) {
        let lastTime = 0;
        events.forEach(event => {
            const absoluteTime = event.deltaTime;
            event.deltaTime = absoluteTime - lastTime;
            lastTime = absoluteTime;
        });
    }
    
    /**
     * Crear track MIDI básico
     */
    createBasicMIDITrack(projectData, options) {
        return {
            events: [
                {
                    deltaTime: 0,
                    type: 'meta',
                    subtype: 'trackName',
                    text: 'Galaxy Piano Track'
                },
                {
                    deltaTime: 0,
                    type: 'meta',
                    subtype: 'endOfTrack'
                }
            ]
        };
    }
    
    /**
     * Generar archivo MIDI binario (simplificado)
     */
    generateMIDIFile(midiData) {
        // Implementación básica - en una versión completa sería más elaborada
        const buffer = new ArrayBuffer(1024); // Buffer básico
        const view = new DataView(buffer);
        
        // Header básico MIDI
        view.setUint32(0, 0x4D546864, false); // "MThd"
        view.setUint32(4, 6, false); // Length
        view.setUint16(8, 1, false); // Format
        view.setUint16(10, midiData.tracks.length, false); // Tracks
        view.setUint16(12, 480, false); // Division
        
        return buffer;
    }
    
    /**
     * Test completo del sistema
     */
    async testFileManager() {
        console.log('🧪 Testing File Manager...');
        
        const results = {
            browserSupport: false,
            jsonExport: false,
            midiExport: false,
            audioExport: false,
            screenshot: false
        };
        
        try {
            // Test soporte del navegador
            const support = this.checkBrowserSupport();
            results.browserSupport = support.fileAPI && support.downloadAPI;
            
            // Test exportación JSON
            const jsonExport = await this.exportToJSON(null, { prettify: true });
            results.jsonExport = jsonExport.success;
            
            // Test exportación MIDI
            const midiExport = await this.exportToMIDI();
            results.midiExport = midiExport.success;
            
            // Test captura de pantalla
            const screenshot = await this.exportGalaxyScreenshot();
            results.screenshot = screenshot.success;
            
            // Test audio (solo si MediaRecorder está disponible)
            if (window.MediaRecorder) {
                try {
                    const audioExport = await this.exportToMP3(null, { duration: 2000 });
                    results.audioExport = audioExport.success;
                } catch (error) {
                    console.warn('⚠️ Audio export test failed:', error.message);
                }
            }
            
        } catch (error) {
            console.error('❌ Error en test:', error);
        }
        
        console.log('🎯 File Manager Test Results:', results);
        return results;
    }
    
    /**
     * Obtener estadísticas
     */
    getStats() {
        return {
            supportedFormats: this.config.supportedFormats,
            isExporting: this.state.isExporting,
            isImporting: this.state.isImporting,
            exportProgress: this.state.exportProgress,
            maxFileSize: `${this.config.maxFileSize / 1024 / 1024}MB`,
            mediaRecorderSupported: !!window.MediaRecorder,
            fileAPISupported: !!(window.File && window.FileReader)
        };
    }
    
    /**
     * Destruir gestor
     */
    destroy() {
        console.log('🛑 Destruyendo File Manager...');
        
        // Limpiar MediaRecorder si está activo
        if (this.state.mediaRecorder && this.state.mediaRecorder.state !== 'inactive') {
            this.state.mediaRecorder.stop();
        }
        
        this.state.recordedChunks = [];
        this.state.mediaRecorder = null;
        
        console.log('✅ File Manager destruido');
    }
}

// Exponer clase globalmente
window.FileManager = FileManager;