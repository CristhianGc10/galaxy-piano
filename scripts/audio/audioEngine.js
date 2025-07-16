/**
 * GALAXY PIANO - AUDIO ENGINE
 * Motor de audio con Web Audio API y síntesis
 * Sprint 1 - Audio Engine Base
 */

class AudioEngine {
    constructor() {
        // Configuración del motor
        this.config = {
            sampleRate: 44100,
            polyphony: 32, // Máximo de notas simultáneas
            masterVolume: 0.5,
            noteDecay: 2.0, // Segundos para decay natural
            oscillatorType: 'triangle', // Tipo de onda por defecto
            filterEnabled: true,
            reverbEnabled: false // Para futuras mejoras
        };
        
        // Estado del motor
        this.state = {
            isInitialized: false,
            isReady: false,
            activeNotes: new Map(), // noteNumber -> AudioNode
            masterGain: null,
            context: null,
            startTime: 0
        };
        
        // Estadísticas
        this.stats = {
            notesPlayed: 0,
            totalPlayTime: 0,
            peakPolyphony: 0,
            lastNoteTime: 0
        };
        
        console.log('🔊 AudioEngine constructor - Preparando Web Audio API');
    }
    
    /**
     * Inicializar Web Audio API y configurar nodos
     */
    async init() {
        try {
            console.log('🎵 Inicializando AudioEngine...');
            
            // 1. Crear contexto de audio
            await this.createAudioContext();
            
            // 2. Configurar nodos maestros
            this.setupMasterNodes();
            
            // 3. Configurar efectos básicos
            this.setupEffects();
            
            // 4. Test de funcionalidad
            await this.runAudioTest();
            
            this.state.isInitialized = true;
            this.state.isReady = true;
            this.state.startTime = this.state.context.currentTime;
            
            console.log('✅ AudioEngine inicializado correctamente');
            this.logAudioInfo();
            
        } catch (error) {
            console.error('❌ Error inicializando AudioEngine:', error);
            throw new Error(`Fallo de inicialización de audio: ${error.message}`);
        }
    }
    
    /**
     * Crear y configurar contexto de Web Audio API
     */
    async createAudioContext() {
        // Detectar API disponible
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        
        if (!AudioContextClass) {
            throw new Error('Web Audio API no soportada en este navegador');
        }
        
        // Crear contexto
        this.state.context = new AudioContextClass({
            sampleRate: this.config.sampleRate,
            latencyHint: 'interactive' // Baja latencia para performance en vivo
        });
        
        // Manejar estado suspendido (requerido por políticas del navegador)
        if (this.state.context.state === 'suspended') {
            console.log('🔇 Contexto de audio suspendido, esperando interacción del usuario...');
            
            // Intentar reanudar automáticamente cuando sea posible
            document.addEventListener('click', this.resumeAudioContext.bind(this), { once: true });
            document.addEventListener('keydown', this.resumeAudioContext.bind(this), { once: true });
        }
        
        console.log('🎛️ Contexto de audio creado:', {
            sampleRate: this.state.context.sampleRate,
            state: this.state.context.state,
            baseLatency: this.state.context.baseLatency || 'N/A',
            outputLatency: this.state.context.outputLatency || 'N/A'
        });
    }
    
    /**
     * Reanudar contexto de audio (manejo de políticas del navegador)
     */
    async resumeAudioContext() {
        if (this.state.context && this.state.context.state === 'suspended') {
            try {
                await this.state.context.resume();
                console.log('🔊 Contexto de audio reanudado');
            } catch (error) {
                console.error('❌ Error reanudando contexto:', error);
            }
        }
    }
    
    /**
     * Configurar nodos de audio maestros
     */
    setupMasterNodes() {
        const ctx = this.state.context;
        
        // Nodo de ganancia maestro
        this.state.masterGain = ctx.createGain();
        this.state.masterGain.gain.setValueAtTime(this.config.masterVolume, ctx.currentTime);
        
        // Conectar a destino final
        this.state.masterGain.connect(ctx.destination);
        
        console.log('🎚️ Nodos maestros configurados');
    }
    
    /**
     * Configurar efectos de audio básicos
     */
    setupEffects() {
        // Por ahora solo configuración básica
        // En futuros sprints: reverb, delay, chorus, etc.
        
        console.log('🎛️ Efectos básicos configurados');
    }
    
    /**
     * Test básico de funcionalidad de audio
     */
    async runAudioTest() {
        return new Promise((resolve, reject) => {
            try {
                const ctx = this.state.context;
                
                // Crear oscilador de test silencioso
                const testOsc = ctx.createOscillator();
                const testGain = ctx.createGain();
                
                // Configurar como silencioso
                testGain.gain.setValueAtTime(0.001, ctx.currentTime);
                testOsc.frequency.setValueAtTime(440, ctx.currentTime);
                testOsc.type = 'sine';
                
                // Conectar y ejecutar test muy breve
                testOsc.connect(testGain);
                testGain.connect(this.state.masterGain);
                
                testOsc.start(ctx.currentTime);
                testOsc.stop(ctx.currentTime + 0.01); // 10ms de test
                
                testOsc.onended = () => {
                    console.log('✅ Test de audio completado');
                    resolve();
                };
                
                // Timeout de seguridad
                setTimeout(() => resolve(), 100);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Reproducir una o múltiples notas
     */
    async playNotes(notes, duration = null, velocity = 0.7) {
        if (!this.state.isReady) {
            throw new Error('AudioEngine no está listo');
        }
        
        // Asegurar que el contexto esté activo
        await this.resumeAudioContext();
        
        // Normalizar entrada
        const noteArray = Array.isArray(notes) ? notes : [notes];
        
        // Validar notas
        const validation = this.validateNotes(noteArray);
        if (!validation.valid) {
            throw new Error(`Notas inválidas: ${validation.error}`);
        }
        
        // Limitar polifonía
        if (this.state.activeNotes.size + noteArray.length > this.config.polyphony) {
            console.warn('⚠️ Límite de polifonía alcanzado, deteniendo notas más antiguas');
            this.limitPolyphony(noteArray.length);
        }
        
        console.log('🎵 Reproduciendo notas:', noteArray.map(n => 
            `${n} (${window.NoteMapping?.getNoteName(n) || 'N/A'})`
        ));
        
        // Reproducir cada nota
        const playedNotes = [];
        for (const noteNumber of noteArray) {
            try {
                const audioNode = this.createNoteNode(noteNumber, duration, velocity);
                this.state.activeNotes.set(noteNumber, audioNode);
                playedNotes.push(noteNumber);
                
                // Estadísticas
                this.stats.notesPlayed++;
                this.stats.lastNoteTime = this.state.context.currentTime;
                this.stats.peakPolyphony = Math.max(this.stats.peakPolyphony, this.state.activeNotes.size);
                
            } catch (error) {
                console.error(`❌ Error reproduciendo nota ${noteNumber}:`, error);
            }
        }
        
        return playedNotes;
    }
    
    /**
     * Crear nodo de audio para una nota específica
     */
    createNoteNode(noteNumber, duration = null, velocity = 0.7) {
        const ctx = this.state.context;
        const now = ctx.currentTime;
        
        // Obtener frecuencia de la nota
        const frequency = window.NoteMapping?.getFrequency(noteNumber) || this.calculateFrequency(noteNumber);
        
        // Crear oscilador principal
        const oscillator = ctx.createOscillator();
        oscillator.type = this.config.oscillatorType;
        oscillator.frequency.setValueAtTime(frequency, now);
        
        // Crear envelope ADSR simplificado
        const gainNode = ctx.createGain();
        const finalVolume = Math.max(0.1, Math.min(1.0, velocity)) * this.config.masterVolume;
        
        // Attack (subida rápida)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(finalVolume, now + 0.01);
        
        // Sustain y Release
        const noteDuration = duration || this.config.noteDecay;
        const releaseStart = now + Math.max(0.1, noteDuration - 0.5);
        
        gainNode.gain.setValueAtTime(finalVolume, releaseStart);
        gainNode.gain.exponentialRampToValueAtTime(0.001, releaseStart + 0.5);
        
        // Conectar nodos
        oscillator.connect(gainNode);
        gainNode.connect(this.state.masterGain);
        
        // Iniciar oscilador
        oscillator.start(now);
        oscillator.stop(releaseStart + 0.5);
        
        // Cleanup cuando termine
        oscillator.onended = () => {
            this.state.activeNotes.delete(noteNumber);
            oscillator.disconnect();
            gainNode.disconnect();
        };
        
        return {
            oscillator,
            gainNode,
            noteNumber,
            startTime: now,
            endTime: releaseStart + 0.5
        };
    }
    
    /**
     * Detener nota específica
     */
    stopNote(noteNumber) {
        const audioNode = this.state.activeNotes.get(noteNumber);
        if (audioNode) {
            const ctx = this.state.context;
            const now = ctx.currentTime;
            
            // Release rápido
            audioNode.gainNode.gain.cancelScheduledValues(now);
            audioNode.gainNode.gain.setValueAtTime(audioNode.gainNode.gain.value, now);
            audioNode.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            
            // Detener oscilador
            try {
                audioNode.oscillator.stop(now + 0.1);
            } catch (error) {
                // El oscilador ya puede estar detenido
            }
            
            console.log(`🔇 Nota ${noteNumber} detenida`);
        }
    }
    
    /**
     * Detener todas las notas activas
     */
    stopAll() {
        console.log('⏹️ Deteniendo todas las notas activas');
        
        const activeNotes = Array.from(this.state.activeNotes.keys());
        activeNotes.forEach(noteNumber => {
            this.stopNote(noteNumber);
        });
        
        // Limpiar mapa
        this.state.activeNotes.clear();
    }
    
    /**
     * Controlar volumen maestro (0.0 - 1.0)
     */
    setVolume(volume) {
        const normalizedVolume = Math.max(0, Math.min(1, volume));
        this.config.masterVolume = normalizedVolume;
        
        if (this.state.masterGain && this.state.context) {
            const now = this.state.context.currentTime;
            this.state.masterGain.gain.setValueAtTime(normalizedVolume, now);
        }
        
        console.log(`🔊 Volumen maestro: ${Math.round(normalizedVolume * 100)}%`);
    }
    
    /**
     * Obtener volumen actual
     */
    getVolume() {
        return this.config.masterVolume;
    }
    
    /**
     * Limitar polifonía deteniendo notas más antiguas
     */
    limitPolyphony(newNotesCount) {
        const notesToStop = this.state.activeNotes.size + newNotesCount - this.config.polyphony;
        
        if (notesToStop > 0) {
            const sortedNotes = Array.from(this.state.activeNotes.entries())
                .sort((a, b) => a[1].startTime - b[1].startTime)
                .slice(0, notesToStop);
            
            sortedNotes.forEach(([noteNumber]) => {
                this.stopNote(noteNumber);
            });
        }
    }
    
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
        
        for (const note of notes) {
            if (!Number.isInteger(note) || note < 1 || note > 88) {
                return { valid: false, error: `Nota inválida: ${note}` };
            }
        }
        
        return { valid: true };
    }
    
    /**
     * Calcular frecuencia de respaldo si NoteMapping no está disponible
     */
    calculateFrequency(noteNumber) {
        // Fórmula básica para piano estándar
        const midiNote = noteNumber + 20; // Ajuste aproximado
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
    
    /**
     * Obtener estadísticas de rendimiento
     */
    getStats() {
        const currentTime = this.state.context ? this.state.context.currentTime : 0;
        const uptime = currentTime - this.state.startTime;
        
        return {
            ...this.stats,
            uptime: uptime,
            activeNotes: this.state.activeNotes.size,
            contextState: this.state.context?.state || 'unknown',
            sampleRate: this.state.context?.sampleRate || 0,
            polyphonyLimit: this.config.polyphony,
            masterVolume: this.config.masterVolume
        };
    }
    
    /**
     * Información de debug del audio
     */
    logAudioInfo() {
        const ctx = this.state.context;
        const info = {
            '🎛️ Contexto': ctx.constructor.name,
            '📊 Sample Rate': ctx.sampleRate + ' Hz',
            '🔊 Estado': ctx.state,
            '⚡ Latencia Base': (ctx.baseLatency * 1000).toFixed(2) + ' ms',
            '🎚️ Volumen Maestro': Math.round(this.config.masterVolume * 100) + '%',
            '🎼 Polifonía Máx': this.config.polyphony,
            '🌊 Tipo Oscilador': this.config.oscillatorType
        };
        
        console.log('🔊 AudioEngine - Información del Sistema:');
        console.table(info);
    }
    
    /**
     * Test de nota específica (útil para debugging)
     */
    async testNote(noteNumber = 40, duration = 1.0) {
        console.log(`🧪 Test de nota ${noteNumber}...`);
        
        try {
            await this.playNotes([noteNumber], duration);
            console.log(`✅ Test de nota ${noteNumber} exitoso`);
            return true;
        } catch (error) {
            console.error(`❌ Test de nota ${noteNumber} falló:`, error);
            return false;
        }
    }
    
    /**
     * Cambiar tipo de oscilador (sine, square, triangle, sawtooth)
     */
    setOscillatorType(type) {
        const validTypes = ['sine', 'square', 'triangle', 'sawtooth'];
        if (validTypes.includes(type)) {
            this.config.oscillatorType = type;
            console.log(`🌊 Tipo de oscilador cambiado a: ${type}`);
        } else {
            console.error(`❌ Tipo de oscilador inválido: ${type}`);
        }
    }
    
    /**
     * Destruir motor de audio y limpiar recursos
     */
    async destroy() {
        console.log('🛑 Destruyendo AudioEngine...');
        
        // Detener todas las notas
        this.stopAll();
        
        // Cerrar contexto si es posible
        if (this.state.context && this.state.context.state !== 'closed') {
            try {
                await this.state.context.close();
            } catch (error) {
                console.warn('⚠️ Error cerrando contexto de audio:', error);
            }
        }
        
        // Limpiar referencias
        this.state.context = null;
        this.state.masterGain = null;
        this.state.activeNotes.clear();
        this.state.isReady = false;
        
        console.log('✅ AudioEngine destruido');
    }
}

// Exponer clase globalmente
window.AudioEngine = AudioEngine;