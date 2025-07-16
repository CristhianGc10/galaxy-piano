/**
 * GALAXY PIANO - WAVES 2D VISUALIZATION
 * Visualización de ondas sinusoidales en tiempo real
 * Sprint 4 - Día 22-23: Análisis de Ondas 2D
 */

class Waves2DRenderer {
    constructor(canvasElement, audioEngine) {
        this.canvas = canvasElement;
        this.audioEngine = audioEngine;
        this.ctx = null;
        
        // Configuración del renderer
        this.config = {
            width: 800,
            height: 400,
            backgroundColor: '#0a0a0f',
            gridColor: '#1a1a2e',
            waveColors: [
                '#00ff88', '#ff0080', '#0088ff', '#ff8800',
                '#8800ff', '#ffff00', '#ff0040', '#00ffff'
            ],
            maxWaves: 8,
            sampleRate: 44100,
            bufferSize: 2048,
            timeScale: 1.0,
            amplitudeScale: 0.8,
            gridSize: 50,
            showGrid: true,
            showLabels: true,
            animationSpeed: 60 // FPS
        };
        
        // Estado del renderer
        this.state = {
            isInitialized: false,
            isAnimating: false,
            activeWaves: new Map(),
            audioContext: null,
            analyser: null,
            dataArray: null,
            animationFrame: null,
            currentTime: 0,
            zoom: 1.0,
            offset: { x: 0, y: 0 }
        };
        
        // Cache para optimización
        this.cache = {
            gridPattern: null,
            waveBuffers: new Map(),
            lastUpdate: 0
        };
        
        console.log('🌊 Waves2DRenderer constructor inicializado');
    }
    
    /**
     * 4.1 Inicializar canvas y contexto 2D
     */
    async init() {
        try {
            console.log('🎨 Inicializando Waves2D Renderer...');
            
            // Verificar canvas
            if (!this.canvas) {
                throw new Error('Canvas element no proporcionado');
            }
            
            // Configurar canvas
            this.setupCanvas();
            
            // Configurar contexto de audio para análisis
            await this.setupAudioAnalysis();
            
            // Configurar grid y UI base
            this.setupGrid();
            
            // Iniciar loop de animación
            this.startAnimation();
            
            this.state.isInitialized = true;
            console.log('✅ Waves2D Renderer inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando Waves2D:', error);
            throw error;
        }
    }
    
    /**
     * Configurar canvas y contexto 2D
     */
    setupCanvas() {
        this.ctx = this.canvas.getContext('2d');
        
        // Configurar dimensiones
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        
        // Configurar contexto
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Configurar estilos base
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.font = '12px monospace';
        
        console.log('🖼️ Canvas configurado:', this.config.width, 'x', this.config.height);
    }
    
    /**
     * 4.2 Configurar análisis de audio en tiempo real
     */
    async setupAudioAnalysis() {
        if (!this.audioEngine || !this.audioEngine.state.context) {
            console.warn('⚠️ AudioEngine no disponible para análisis');
            return;
        }
        
        try {
            this.state.audioContext = this.audioEngine.state.context;
            
            // Crear analizador de frecuencias
            this.state.analyser = this.state.audioContext.createAnalyser();
            this.state.analyser.fftSize = this.config.bufferSize;
            this.state.analyser.smoothingTimeConstant = 0.8;
            
            // Conectar al audio engine
            if (this.audioEngine.state.masterGain) {
                this.audioEngine.state.masterGain.connect(this.state.analyser);
            }
            
            // Buffer para datos de frecuencia
            this.state.dataArray = new Uint8Array(this.state.analyser.frequencyBinCount);
            
            console.log('🔊 Análisis de audio configurado');
            
        } catch (error) {
            console.warn('⚠️ Error configurando análisis de audio:', error);
        }
    }
    
    /**
     * Configurar grid de fondo
     */
    setupGrid() {
        // Pre-renderizar grid para optimización
        const gridCanvas = document.createElement('canvas');
        gridCanvas.width = this.config.width;
        gridCanvas.height = this.config.height;
        const gridCtx = gridCanvas.getContext('2d');
        
        gridCtx.strokeStyle = this.config.gridColor;
        gridCtx.lineWidth = 0.5;
        gridCtx.globalAlpha = 0.3;
        
        // Líneas verticales
        for (let x = 0; x < this.config.width; x += this.config.gridSize) {
            gridCtx.beginPath();
            gridCtx.moveTo(x, 0);
            gridCtx.lineTo(x, this.config.height);
            gridCtx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 0; y < this.config.height; y += this.config.gridSize) {
            gridCtx.beginPath();
            gridCtx.moveTo(0, y);
            gridCtx.lineTo(this.config.width, y);
            gridCtx.stroke();
        }
        
        // Línea central
        gridCtx.strokeStyle = this.config.gridColor;
        gridCtx.lineWidth = 1;
        gridCtx.globalAlpha = 0.6;
        gridCtx.beginPath();
        gridCtx.moveTo(0, this.config.height / 2);
        gridCtx.lineTo(this.config.width, this.config.height / 2);
        gridCtx.stroke();
        
        this.cache.gridPattern = gridCanvas;
        console.log('📐 Grid pre-renderizado');
    }
    
    /**
     * 4.3 Crear onda sinusoidal para nota específica
     */
    createWaveForNote(noteNumber, frequency, amplitude = 0.8, phase = 0) {
        const waveId = `wave-${noteNumber}-${Date.now()}`;
        
        const wave = {
            id: waveId,
            noteNumber: noteNumber,
            frequency: frequency,
            amplitude: amplitude,
            phase: phase,
            color: this.getWaveColor(noteNumber),
            startTime: performance.now(),
            duration: 3000, // 3 segundos por defecto
            active: true,
            
            // Parámetros de visualización
            samples: this.generateWaveSamples(frequency, amplitude, phase),
            fadeOut: false,
            fadeStart: 0
        };
        
        this.state.activeWaves.set(waveId, wave);
        
        console.log(`🌊 Onda creada: ${noteNumber} (${frequency.toFixed(2)} Hz)`);
        
        // Programar fade out
        setTimeout(() => {
            this.fadeOutWave(waveId);
        }, wave.duration - 1000);
        
        return wave;
    }
    
    /**
     * Generar muestras de onda sinusoidal
     */
    generateWaveSamples(frequency, amplitude, phase) {
        const samples = [];
        const sampleCount = this.config.width;
        const timeStep = 1 / this.config.sampleRate;
        const wavelength = this.config.sampleRate / frequency;
        const pixelsPerSample = this.config.width / wavelength;
        
        for (let x = 0; x < sampleCount; x++) {
            const time = (x / this.config.width) * this.config.timeScale;
            const sample = Math.sin(2 * Math.PI * frequency * time + phase) * amplitude;
            
            samples.push({
                x: x,
                y: (this.config.height / 2) + (sample * (this.config.height / 2) * this.config.amplitudeScale),
                amplitude: sample
            });
        }
        
        return samples;
    }
    
    /**
     * 4.4 Obtener color de onda según registro musical
     */
    getWaveColor(noteNumber) {
        // Usar el mismo sistema de colores que las estrellas
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
    }
    
    /**
     * 4.5 Iniciar loop de animación
     */
    startAnimation() {
        if (this.state.isAnimating) return;
        
        this.state.isAnimating = true;
        this.animate();
        
        console.log('🎬 Animación de ondas iniciada');
    }
    
    /**
     * Loop principal de animación
     */
    animate() {
        if (!this.state.isAnimating) return;
        
        this.state.animationFrame = requestAnimationFrame(() => this.animate());
        
        // Actualizar tiempo
        this.state.currentTime += 1000 / this.config.animationSpeed;
        
        // Limpiar canvas
        this.clearCanvas();
        
        // Dibujar grid
        if (this.config.showGrid) {
            this.drawGrid();
        }
        
        // Dibujar ondas activas
        this.drawActiveWaves();
        
        // Dibujar análisis de audio en tiempo real
        if (this.state.analyser) {
            this.drawRealtimeAnalysis();
        }
        
        // Dibujar labels
        if (this.config.showLabels) {
            this.drawLabels();
        }
        
        // Limpiar ondas inactivas
        this.cleanupInactiveWaves();
    }
    
    /**
     * Limpiar canvas
     */
    clearCanvas() {
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    }
    
    /**
     * Dibujar grid de fondo
     */
    drawGrid() {
        if (this.cache.gridPattern) {
            this.ctx.drawImage(this.cache.gridPattern, 0, 0);
        }
    }
    
    /**
     * 4.6 Dibujar ondas activas con animación
     */
    drawActiveWaves() {
        this.state.activeWaves.forEach(wave => {
            if (!wave.active) return;
            
            const elapsed = performance.now() - wave.startTime;
            const progress = elapsed / wave.duration;
            
            // Calcular alpha para fade in/out
            let alpha = 1.0;
            if (progress < 0.1) {
                alpha = progress / 0.1; // Fade in
            } else if (wave.fadeOut) {
                alpha = Math.max(0, 1 - ((elapsed - wave.fadeStart) / 1000)); // Fade out
            }
            
            // Configurar contexto
            this.ctx.globalAlpha = alpha;
            this.ctx.strokeStyle = wave.color;
            this.ctx.lineWidth = 2;
            this.ctx.shadowColor = wave.color;
            this.ctx.shadowBlur = 5;
            
            // Dibujar onda animada
            this.ctx.beginPath();
            
            const timeOffset = (performance.now() / 1000) * wave.frequency * 2 * Math.PI;
            
            for (let x = 0; x < this.config.width; x++) {
                const time = (x / this.config.width) * this.config.timeScale;
                const sample = Math.sin(2 * Math.PI * wave.frequency * time + wave.phase + timeOffset) * wave.amplitude;
                const y = (this.config.height / 2) + (sample * (this.config.height / 2) * this.config.amplitudeScale);
                
                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        });
        
        // Reset alpha
        this.ctx.globalAlpha = 1.0;
    }
    
    /**
     * Dibujar análisis en tiempo real del audio
     */
    drawRealtimeAnalysis() {
        if (!this.state.analyser || !this.state.dataArray) return;
        
        // Obtener datos de frecuencia
        this.state.analyser.getByteFrequencyData(this.state.dataArray);
        
        // Dibujar espectro como overlay
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#00ff88';
        
        const barWidth = this.config.width / this.state.dataArray.length;
        
        for (let i = 0; i < this.state.dataArray.length; i++) {
            const barHeight = (this.state.dataArray[i] / 255) * (this.config.height / 4);
            const x = i * barWidth;
            const y = this.config.height - barHeight;
            
            this.ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    
    /**
     * Dibujar etiquetas informativas
     */
    drawLabels() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        // Información de ondas activas
        let y = 20;
        this.ctx.fillText(`Ondas Activas: ${this.state.activeWaves.size}`, 10, y);
        
        y += 20;
        this.state.activeWaves.forEach(wave => {
            const noteName = this.getNoteNameFromNumber(wave.noteNumber);
            this.ctx.fillStyle = wave.color;
            this.ctx.fillText(`${noteName} (${wave.frequency.toFixed(1)} Hz)`, 10, y);
            y += 15;
        });
        
        // Información de tiempo
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Time: ${(this.state.currentTime / 1000).toFixed(2)}s`, this.config.width - 10, 20);
    }
    
    /**
     * Desvanecer onda específica
     */
    fadeOutWave(waveId) {
        const wave = this.state.activeWaves.get(waveId);
        if (wave) {
            wave.fadeOut = true;
            wave.fadeStart = performance.now();
            
            setTimeout(() => {
                this.state.activeWaves.delete(waveId);
            }, 1000);
        }
    }
    
    /**
     * Limpiar ondas inactivas
     */
    cleanupInactiveWaves() {
        const now = performance.now();
        
        this.state.activeWaves.forEach((wave, waveId) => {
            const elapsed = now - wave.startTime;
            if (elapsed > wave.duration + 1000) { // +1s de gracia
                this.state.activeWaves.delete(waveId);
            }
        });
    }
    
    /**
     * Interfaz pública: Agregar nota para visualización
     */
    addNote(noteNumber, duration = 3000, velocity = 0.8) {
        if (!this.state.isInitialized) {
            console.warn('⚠️ Waves2D no inicializado');
            return;
        }
        
        // Obtener frecuencia de la nota
        const frequency = this.getNoteFrequency(noteNumber);
        if (!frequency) {
            console.error('❌ Frecuencia inválida para nota:', noteNumber);
            return;
        }
        
        // Crear onda visual
        const wave = this.createWaveForNote(noteNumber, frequency, velocity);
        wave.duration = duration;
        
        return wave;
    }
    
    /**
     * Interfaz pública: Agregar múltiples notas (acorde)
     */
    addChord(noteNumbers, duration = 3000, velocity = 0.8) {
        const waves = [];
        
        noteNumbers.forEach((noteNumber, index) => {
            const phase = (index * Math.PI) / noteNumbers.length; // Desfase para claridad visual
            const frequency = this.getNoteFrequency(noteNumber);
            
            if (frequency) {
                const wave = this.createWaveForNote(noteNumber, frequency, velocity, phase);
                wave.duration = duration;
                waves.push(wave);
            }
        });
        
        console.log(`🎵 Acorde visualizado: ${noteNumbers.length} ondas`);
        return waves;
    }
    
    /**
     * Limpiar todas las ondas
     */
    clearAllWaves() {
        this.state.activeWaves.clear();
        console.log('🧹 Todas las ondas eliminadas');
    }
    
    /**
     * Obtener frecuencia de nota
     */
    getNoteFrequency(noteNumber) {
        if (window.NoteMapping) {
            return window.NoteMapping.getFrequency(noteNumber);
        }
        
        // Fallback
        const midiNote = noteNumber + 20;
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
    
    /**
     * Obtener nombre de nota
     */
    getNoteNameFromNumber(noteNumber) {
        if (window.NoteMapping) {
            return window.NoteMapping.getNoteName(noteNumber);
        }
        
        return `Note${noteNumber}`;
    }
    
    /**
     * Detener animación
     */
    stopAnimation() {
        this.state.isAnimating = false;
        
        if (this.state.animationFrame) {
            cancelAnimationFrame(this.state.animationFrame);
        }
        
        console.log('⏸️ Animación de ondas detenida');
    }
    
    /**
     * Configurar zoom y pan
     */
    setZoom(zoom) {
        this.state.zoom = Math.max(0.1, Math.min(5.0, zoom));
        console.log('🔍 Zoom:', this.state.zoom);
    }
    
    /**
     * Test de funcionalidad
     */
    async testWaves2D() {
        console.log('🧪 Testing Waves2D Renderer...');
        
        // Test nota individual
        const wave1 = this.addNote(40, 2000, 0.8); // C4
        
        setTimeout(() => {
            // Test acorde
            this.addChord([40, 43, 47], 3000, 0.7); // C Major
        }, 1000);
        
        setTimeout(() => {
            // Test limpieza
            this.clearAllWaves();
        }, 5000);
        
        return {
            initialization: this.state.isInitialized,
            animation: this.state.isAnimating,
            audioAnalysis: !!this.state.analyser
        };
    }
    
    /**
     * Obtener estadísticas
     */
    getStats() {
        return {
            activeWaves: this.state.activeWaves.size,
            isAnimating: this.state.isAnimating,
            currentTime: this.state.currentTime,
            zoom: this.state.zoom,
            audioAnalysisEnabled: !!this.state.analyser,
            canvasSize: `${this.config.width}x${this.config.height}`
        };
    }
    
    /**
     * Destruir renderer
     */
    destroy() {
        console.log('🛑 Destruyendo Waves2D Renderer...');
        
        this.stopAnimation();
        this.clearAllWaves();
        
        // Limpiar referencias
        this.state.audioContext = null;
        this.state.analyser = null;
        this.state.dataArray = null;
        
        console.log('✅ Waves2D Renderer destruido');
    }
}

// Exponer clase globalmente
window.Waves2DRenderer = Waves2DRenderer;