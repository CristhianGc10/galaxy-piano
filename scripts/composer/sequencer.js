/**
 * GALAXY PIANO - MUSICAL SEQUENCER
 * Secuenciador musical avanzado para el modo compositor
 * Sprint 3 - Días 15-16: Interfaz de Entrada Completa
 */

class MusicalSequencer {
    constructor(audioEngine, starSystem) {
        this.audioEngine = audioEngine;
        this.starSystem = starSystem;
        
        // Configuración del secuenciador
        this.config = {
            defaultBPM: 120,
            maxTracks: 8,
            maxStepsPerTrack: 64,
            quantization: 16, // 16th notes
            defaultVelocity: 0.7,
            defaultDuration: 0.5, // beats
            defaultOctave: 4
        };
        
        // Estado del secuenciador
        this.state = {
            isPlaying: false,
            isPaused: false,
            isRecording: false,
            currentBPM: this.config.defaultBPM,
            currentStep: 0,
            totalSteps: 16,
            loop: true,
            metronome: false
        };
        
        // Sistema de pistas
        this.tracks = new Map();
        this.patterns = new Map();
        this.activePattern = null;
        
        // Timeline y scheduling
        this.timeline = [];
        this.scheduler = null;
        this.nextNoteTime = 0;
        this.lookAhead = 25; // ms
        this.scheduleAheadTime = 0.1; // seconds
        
        // Estado de entrada
        this.inputState = {
            currentTrack: 0,
            recordingNotes: new Set(),
            lastInputTime: 0,
            quantizeInput: true
        };
        
        console.log('🎼 MusicalSequencer inicializado');
        this.createDefaultPattern();
    }
    
    /**
     * 3.1 Crear patrón musical por defecto
     */
    createDefaultPattern() {
        const defaultPattern = {
            id: 'pattern-default',
            name: 'Nuevo Patrón',
            bpm: this.config.defaultBPM,
            steps: this.config.maxStepsPerTrack,
            tracks: [],
            createdAt: Date.now(),
            modifiedAt: Date.now()
        };
        
        // Crear pistas por defecto
        for (let i = 0; i < 4; i++) {
            defaultPattern.tracks.push(this.createEmptyTrack(i));
        }
        
        this.patterns.set('default', defaultPattern);
        this.activePattern = 'default';
        
        console.log('🎵 Patrón por defecto creado');
    }
    
    /**
     * Crear pista vacía
     */
    createEmptyTrack(trackNumber) {
        return {
            id: `track-${trackNumber}`,
            number: trackNumber,
            name: `Pista ${trackNumber + 1}`,
            muted: false,
            solo: false,
            volume: 0.7,
            pan: 0,
            octave: this.config.defaultOctave,
            instrument: 'piano',
            color: this.getTrackColor(trackNumber),
            steps: Array(this.config.maxStepsPerTrack).fill(null).map(() => ({
                notes: [],
                velocity: this.config.defaultVelocity,
                duration: this.config.defaultDuration,
                active: false
            }))
        };
    }
    
    /**
     * 3.2 Parser de notas múltiples avanzado
     */
    parseMusicalInput(input, options = {}) {
        const {
            allowChords = true,
            allowDurations = true,
            allowVelocities = true,
            defaultOctave = 4,
            defaultDuration = 0.5,
            defaultVelocity = 0.7
        } = options;
        
        if (!input || typeof input !== 'string') {
            return { success: false, error: 'Entrada inválida' };
        }
        
        const result = {
            success: true,
            notes: [],
            chords: [],
            totalDuration: 0,
            warnings: []
        };
        
        try {
            // Limpiar y dividir entrada
            const cleanInput = input.trim().replace(/\s+/g, ' ');
            const segments = cleanInput.split(/[,;]/).filter(s => s.length > 0);
            
            for (let segment of segments) {
                const parsedSegment = this.parseNoteSegment(segment.trim(), {
                    defaultOctave,
                    defaultDuration,
                    defaultVelocity
                });
                
                if (parsedSegment.success) {
                    if (parsedSegment.notes.length === 1) {
                        result.notes.push(parsedSegment.notes[0]);
                    } else if (parsedSegment.notes.length > 1 && allowChords) {
                        result.chords.push({
                            notes: parsedSegment.notes,
                            duration: parsedSegment.duration,
                            velocity: parsedSegment.velocity,
                            startTime: result.totalDuration
                        });
                    }
                    
                    result.totalDuration += parsedSegment.duration;
                } else {
                    result.warnings.push(`Segmento "${segment}": ${parsedSegment.error}`);
                }
            }
            
            if (result.notes.length === 0 && result.chords.length === 0) {
                result.success = false;
                result.error = 'No se encontraron notas válidas';
            }
            
        } catch (error) {
            result.success = false;
            result.error = `Error de parsing: ${error.message}`;
        }
        
        return result;
    }
    
    /**
     * 3.3 Parser de segmento individual
     */
    parseNoteSegment(segment, defaults) {
        const result = {
            success: true,
            notes: [],
            duration: defaults.defaultDuration,
            velocity: defaults.defaultVelocity
        };
        
        // Formatos soportados:
        // "40" - Nota simple
        // "C4" - Nota con nombre
        // "40+43+47" - Acorde
        // "C4+E4+G4" - Acorde con nombres
        // "40@0.5" - Nota con duración
        // "40@0.5v0.8" - Nota con duración y velocidad
        // "C4+E4+G4@1.0v0.9" - Acorde completo
        
        try {
            // Extraer duración si existe
            let notesPart = segment;
            const durationMatch = segment.match(/@([0-9.]+)/);
            if (durationMatch) {
                result.duration = parseFloat(durationMatch[1]);
                notesPart = segment.replace(/@[0-9.]+/, '');
            }
            
            // Extraer velocidad si existe
            const velocityMatch = segment.match(/v([0-9.]+)/);
            if (velocityMatch) {
                result.velocity = Math.min(1.0, parseFloat(velocityMatch[1]));
                notesPart = notesPart.replace(/v[0-9.]+/, '');
            }
            
            // Dividir notas (separadas por +)
            const noteStrings = notesPart.split('+').map(s => s.trim());
            
            for (let noteStr of noteStrings) {
                const noteNumber = this.parseNoteString(noteStr, defaults.defaultOctave);
                
                if (noteNumber !== null) {
                    result.notes.push({
                        number: noteNumber,
                        name: this.getNoteNameFromNumber(noteNumber),
                        duration: result.duration,
                        velocity: result.velocity
                    });
                } else {
                    result.success = false;
                    result.error = `Nota inválida: "${noteStr}"`;
                    break;
                }
            }
            
        } catch (error) {
            result.success = false;
            result.error = error.message;
        }
        
        return result;
    }
    
    /**
     * 3.4 Parser de nota individual (número o nombre)
     */
    parseNoteString(noteStr, defaultOctave) {
        // Si es número directo (1-88)
        const directNumber = parseInt(noteStr);
        if (!isNaN(directNumber) && directNumber >= 1 && directNumber <= 88) {
            return directNumber;
        }
        
        // Si es nombre musical (C4, F#3, etc.)
        const noteMatch = noteStr.match(/^([A-G][#b]?)([0-9]?)$/i);
        if (noteMatch) {
            const noteName = noteMatch[1].toUpperCase();
            const octave = noteMatch[2] ? parseInt(noteMatch[2]) : defaultOctave;
            
            return this.noteNameToNumber(noteName, octave);
        }
        
        return null;
    }
    
    /**
     * Convertir nombre de nota a número (1-88)
     */
    noteNameToNumber(noteName, octave) {
        const noteMap = {
            'C': 0, 'C#': 1, 'DB': 1,
            'D': 2, 'D#': 3, 'EB': 3,
            'E': 4,
            'F': 5, 'F#': 6, 'GB': 6,
            'G': 7, 'G#': 8, 'AB': 8,
            'A': 9, 'A#': 10, 'BB': 10,
            'B': 11
        };
        
        const noteIndex = noteMap[noteName];
        if (noteIndex === undefined) return null;
        
        // Calcular número MIDI y convertir a nuestro sistema
        const midiNumber = (octave * 12) + noteIndex + 12; // C0 = 12
        const ourNumber = midiNumber - 20; // Ajuste para nuestro sistema 1-88
        
        return (ourNumber >= 1 && ourNumber <= 88) ? ourNumber : null;
    }
    
    /**
     * Obtener nombre de nota desde número
     */
    getNoteNameFromNumber(noteNumber) {
        if (window.NoteMapping) {
            return window.NoteMapping.getNoteName(noteNumber);
        }
        
        // Fallback básico
        const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const midiNumber = noteNumber + 20;
        const noteIndex = (midiNumber - 12) % 12;
        const octave = Math.floor((midiNumber - 12) / 12);
        
        return names[noteIndex] + octave;
    }
    
    /**
     * 3.5 Validación avanzada de entrada musical
     */
    validateMusicalInput(parsedInput, options = {}) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            suggestions: []
        };
        
        if (!parsedInput.success) {
            validation.valid = false;
            validation.errors.push(parsedInput.error);
            return validation;
        }
        
        // Validar rango de notas
        const allNotes = [
            ...parsedInput.notes,
            ...parsedInput.chords.flatMap(chord => chord.notes)
        ];
        
        const outOfRange = allNotes.filter(note => note.number < 1 || note.number > 88);
        if (outOfRange.length > 0) {
            validation.valid = false;
            validation.errors.push(`Notas fuera de rango: ${outOfRange.map(n => n.number).join(', ')}`);
        }
        
        // Validar polifonía
        const maxSimultaneous = Math.max(
            parsedInput.chords.reduce((max, chord) => Math.max(max, chord.notes.length), 0),
            1
        );
        
        if (maxSimultaneous > 10) {
            validation.warnings.push(`Acorde muy complejo (${maxSimultaneous} notas simultáneas)`);
        }
        
        // Sugerir mejoras
        if (parsedInput.chords.length > 0) {
            validation.suggestions.push('Acordes detectados - considera usar el modo de análisis armónico');
        }
        
        if (parsedInput.totalDuration > 10) {
            validation.suggestions.push('Secuencia larga - considera dividir en múltiples patrones');
        }
        
        return validation;
    }
    
    /**
     * 3.6 Crear secuencia musical desde entrada
     */
    createSequenceFromInput(input, trackNumber = 0) {
        const parsed = this.parseMusicalInput(input);
        const validation = this.validateMusicalInput(parsed);
        
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join('. '),
                warnings: validation.warnings
            };
        }
        
        const pattern = this.patterns.get(this.activePattern);
        if (!pattern) {
            return { success: false, error: 'No hay patrón activo' };
        }
        
        const track = pattern.tracks[trackNumber];
        if (!track) {
            return { success: false, error: 'Pista inválida' };
        }
        
        // Limpiar pista
        track.steps.forEach(step => {
            step.notes = [];
            step.active = false;
        });
        
        // Añadir notas individuales
        parsed.notes.forEach((note, index) => {
            const stepIndex = Math.min(index, track.steps.length - 1);
            track.steps[stepIndex].notes.push(note.number);
            track.steps[stepIndex].velocity = note.velocity;
            track.steps[stepIndex].duration = note.duration;
            track.steps[stepIndex].active = true;
        });
        
        // Añadir acordes
        parsed.chords.forEach((chord, index) => {
            const stepIndex = Math.min(index + parsed.notes.length, track.steps.length - 1);
            track.steps[stepIndex].notes = chord.notes.map(note => note.number);
            track.steps[stepIndex].velocity = chord.velocity;
            track.steps[stepIndex].duration = chord.duration;
            track.steps[stepIndex].active = true;
        });
        
        // Actualizar timeline visual
        this.updateTrackTimeline(trackNumber);
        
        console.log(`🎵 Secuencia creada en pista ${trackNumber}:`, parsed);
        
        return {
            success: true,
            parsed: parsed,
            validation: validation,
            trackNumber: trackNumber
        };
    }
    
    /**
     * Reproducir secuencia actual
     */
    async playSequence() {
        if (this.state.isPlaying) {
            this.stopSequence();
            return;
        }
        
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.currentStep = 0;
        
        this.setupScheduler();
        
        console.log('▶️ Reproduciendo secuencia musical');
    }
    
    /**
     * Configurar scheduler de audio
     */
    setupScheduler() {
        const stepDuration = (60 / this.state.currentBPM) / (this.config.quantization / 4);
        
        const schedule = () => {
            if (!this.state.isPlaying) return;
            
            // Reproducir step actual
            this.playCurrentStep();
            
            // Avanzar al siguiente step
            this.state.currentStep = (this.state.currentStep + 1) % this.state.totalSteps;
            
            // Continuar si está en loop o no ha terminado
            if (this.state.loop || this.state.currentStep < this.state.totalSteps - 1) {
                setTimeout(schedule, stepDuration * 1000);
            } else {
                this.stopSequence();
            }
        };
        
        schedule();
    }
    
    /**
     * Reproducir step actual de todas las pistas
     */
    async playCurrentStep() {
        const pattern = this.patterns.get(this.activePattern);
        if (!pattern) return;
        
        const allNotes = [];
        
        pattern.tracks.forEach(track => {
            if (track.muted) return;
            
            const step = track.steps[this.state.currentStep];
            if (!step || !step.active || step.notes.length === 0) return;
            
            // Añadir notas de esta pista
            step.notes.forEach(noteNumber => {
                allNotes.push({
                    noteNumber,
                    velocity: step.velocity * track.volume,
                    duration: step.duration,
                    trackNumber: track.number,
                    color: track.color
                });
            });
        });
        
        if (allNotes.length > 0) {
            // Reproducir audio
            const noteNumbers = allNotes.map(n => n.noteNumber);
            await this.audioEngine.playNotes(noteNumbers, allNotes[0].duration, allNotes[0].velocity);
            
            // Crear estrellas visuales
            if (this.starSystem) {
                this.starSystem.createStars(noteNumbers, allNotes[0].duration, allNotes[0].velocity);
            }
            
            console.log(`🎵 Step ${this.state.currentStep}: ${noteNumbers.length} notas`);
        }
    }
    
    /**
     * Detener secuencia
     */
    stopSequence() {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.currentStep = 0;
        
        if (this.audioEngine) {
            this.audioEngine.stopAll();
        }
        
        console.log('⏹️ Secuencia detenida');
    }
    
    /**
     * Obtener color de pista
     */
    getTrackColor(trackNumber) {
        const colors = [
            '#00ff88', '#ff0080', '#0088ff', '#ff8800',
            '#8800ff', '#ffff00', '#ff0040', '#00ffff'
        ];
        return colors[trackNumber % colors.length];
    }
    
    /**
     * Actualizar timeline visual de pista
     */
    updateTrackTimeline(trackNumber) {
        // Esta función será llamada por la UI para actualizar la visualización
        const pattern = this.patterns.get(this.activePattern);
        if (!pattern) return;
        
        const track = pattern.tracks[trackNumber];
        const activeSteps = track.steps.map((step, index) => ({
            step: index,
            active: step.active,
            notes: step.notes,
            velocity: step.velocity,
            duration: step.duration
        })).filter(s => s.active);
        
        console.log(`📊 Timeline pista ${trackNumber}:`, activeSteps);
        
        return activeSteps;
    }
    
    /**
     * Test de funcionalidad completa
     */
    async testSequencer() {
        console.log('🧪 Testing Musical Sequencer...');
        
        // Test 1: Parser básico
        const test1 = this.parseMusicalInput('40,43,47');
        console.log('Test 1 - Parser básico:', test1);
        
        // Test 2: Parser avanzado con acordes
        const test2 = this.parseMusicalInput('C4+E4+G4@1.0v0.8, A3@0.5');
        console.log('Test 2 - Parser avanzado:', test2);
        
        // Test 3: Crear secuencia
        const test3 = this.createSequenceFromInput('40+43+47@2.0, 38@1.0, 41+44+48@1.5', 0);
        console.log('Test 3 - Crear secuencia:', test3);
        
        // Test 4: Reproducir (breve)
        if (test3.success) {
            console.log('Test 4 - Reproduciendo secuencia...');
            await this.playSequence();
            
            setTimeout(() => {
                this.stopSequence();
                console.log('✅ Test completo del sequencer finalizado');
            }, 3000);
        }
        
        return {
            parser: test1.success && test2.success,
            sequencer: test3.success,
            audio: this.audioEngine?.state.isReady || false
        };
    }
    
    /**
     * Obtener estadísticas del secuenciador
     */
    getStats() {
        const pattern = this.patterns.get(this.activePattern);
        
        return {
            patterns: this.patterns.size,
            activeTracks: pattern ? pattern.tracks.filter(t => !t.muted).length : 0,
            totalSteps: this.state.totalSteps,
            currentBPM: this.state.currentBPM,
            isPlaying: this.state.isPlaying,
            activeSteps: pattern ? 
                pattern.tracks.reduce((total, track) => 
                    total + track.steps.filter(step => step.active).length, 0
                ) : 0
        };
    }
}

// Exponer clase globalmente
window.MusicalSequencer = MusicalSequencer;