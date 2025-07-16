/**
 * GALAXY PIANO - NOTE MAPPING SYSTEM
 * Mapeo de notas musicales (1-88) a frecuencias y nombres
 * Sprint 1 - Audio Engine Base
 */

class NoteMapping {
    constructor() {
        // Mapeo completo de las 88 teclas del piano
        // Nota 1 = A0 (27.5 Hz)
        // Nota 40 = C4 (261.63 Hz) - Do central
        // Nota 88 = C8 (4186.01 Hz)
        
        this.noteData = this.generateNoteData();
        
        console.log('🎵 NoteMapping: Sistema de mapeo inicializado');
        console.log('📊 Total de notas:', Object.keys(this.noteData).length);
    }
    
    /**
     * Generar datos completos de las 88 notas del piano
     */
    generateNoteData() {
        const noteData = {};
        
        // Nombres de notas en orden cromático
        const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
        
        // Nota de referencia: A4 = 440 Hz (nota MIDI 69)
        // En nuestro sistema: A4 sería aproximadamente la nota 49
        
        for (let i = 1; i <= 88; i++) {
            // Calcular número MIDI equivalente
            // Nota 1 (A0) = MIDI 21
            const midiNumber = i + 20;
            
            // Calcular frecuencia usando la fórmula estándar
            // f = 440 * 2^((n-69)/12)
            const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);
            
            // Determinar nombre de nota y octava
            const noteIndex = (midiNumber - 21) % 12;
            const octave = Math.floor((midiNumber - 21) / 12);
            const noteName = noteNames[noteIndex] + octave;
            
            // Determinar registro tonal para color de estrella
            const register = this.getRegister(i);
            
            noteData[i] = {
                number: i,
                midiNumber: midiNumber,
                frequency: parseFloat(frequency.toFixed(2)),
                noteName: noteName,
                register: register,
                color: this.getColorByRegister(register)
            };
        }
        
        return noteData;
    }
    
    /**
     * Obtener registro tonal de una nota
     */
    getRegister(noteNumber) {
        if (noteNumber >= 1 && noteNumber <= 15) return 'graves-extremos';
        if (noteNumber >= 16 && noteNumber <= 30) return 'graves';
        if (noteNumber >= 31 && noteNumber <= 45) return 'medios-graves';
        if (noteNumber >= 46 && noteNumber <= 60) return 'medios-agudos';
        if (noteNumber >= 61 && noteNumber <= 75) return 'agudos';
        if (noteNumber >= 76 && noteNumber <= 85) return 'muy-agudos';
        if (noteNumber >= 86 && noteNumber <= 88) return 'extremos-agudos';
        return 'unknown';
    }
    
    /**
     * Obtener color según registro
     */
    getColorByRegister(register) {
        const colors = {
            'graves-extremos': '#4a90e2',    // Azul
            'graves': '#87ceeb',             // Azul-Blanco
            'medios-graves': '#ffffff',      // Blanco
            'medios-agudos': '#fffacd',      // Blanco-Amarillo
            'agudos': '#ffd700',             // Amarillo
            'muy-agudos': '#ff6347',         // Naranja
            'extremos-agudos': '#ff0000'     // Rojo
        };
        return colors[register] || '#ffffff';
    }
    
    /**
     * Obtener frecuencia de una nota
     */
    getFrequency(noteNumber) {
        const note = this.noteData[noteNumber];
        return note ? note.frequency : null;
    }
    
    /**
     * Obtener nombre de una nota
     */
    getNoteName(noteNumber) {
        const note = this.noteData[noteNumber];
        return note ? note.noteName : null;
    }
    
    /**
     * Obtener información completa de una nota
     */
    getNoteInfo(noteNumber) {
        return this.noteData[noteNumber] || null;
    }
    
    /**
     * Obtener múltiples notas
     */
    getNotesInfo(noteNumbers) {
        return noteNumbers.map(num => this.getNoteInfo(num)).filter(note => note !== null);
    }
    
    /**
     * Buscar nota por nombre (ej: "C4", "A#3")
     */
    findNoteByName(noteName) {
        for (const [number, data] of Object.entries(this.noteData)) {
            if (data.noteName === noteName) {
                return {
                    number: parseInt(number),
                    ...data
                };
            }
        }
        return null;
    }
    
    /**
     * Obtener todas las notas de un registro
     */
    getNotesByRegister(register) {
        return Object.values(this.noteData).filter(note => note.register === register);
    }
    
    /**
     * Validar si una nota existe
     */
    isValidNote(noteNumber) {
        return this.noteData.hasOwnProperty(noteNumber) && 
               noteNumber >= 1 && 
               noteNumber <= 88;
    }
    
    /**
     * Obtener rango de frecuencias
     */
    getFrequencyRange() {
        const frequencies = Object.values(this.noteData).map(note => note.frequency);
        return {
            min: Math.min(...frequencies),
            max: Math.max(...frequencies)
        };
    }
    
    /**
     * Encontrar la nota más cercana a una frecuencia
     */
    findClosestNote(frequency) {
        let closestNote = null;
        let minDifference = Infinity;
        
        for (const note of Object.values(this.noteData)) {
            const difference = Math.abs(note.frequency - frequency);
            if (difference < minDifference) {
                minDifference = difference;
                closestNote = note;
            }
        }
        
        return closestNote;
    }
    
    /**
     * Obtener estadísticas del mapeo
     */
    getStats() {
        const notes = Object.values(this.noteData);
        const frequencyRange = this.getFrequencyRange();
        
        // Contar notas por registro
        const registerCounts = {};
        notes.forEach(note => {
            registerCounts[note.register] = (registerCounts[note.register] || 0) + 1;
        });
        
        return {
            totalNotes: notes.length,
            frequencyRange: frequencyRange,
            registerCounts: registerCounts,
            sampleNotes: {
                lowest: notes[0],
                middle: notes[39], // Nota 40 (C4)
                highest: notes[87]  // Nota 88
            }
        };
    }
    
    /**
     * Logging de información para debug
     */
    logMappingInfo() {
        const stats = this.getStats();
        
        console.group('🎵 Note Mapping Information');
        console.log('📊 Total Notes:', stats.totalNotes);
        console.log('🌊 Frequency Range:', stats.frequencyRange);
        console.log('🎨 Register Distribution:', stats.registerCounts);
        
        console.group('🎹 Sample Notes');
        console.log('Lowest (Note 1):', stats.sampleNotes.lowest);
        console.log('Middle (Note 40 - C4):', stats.sampleNotes.middle);
        console.log('Highest (Note 88):', stats.sampleNotes.highest);
        console.groupEnd();
        
        console.groupEnd();
    }
    
    /**
     * Exportar datos para uso externo
     */
    exportData() {
        return {
            noteData: this.noteData,
            stats: this.getStats()
        };
    }
}

// Crear instancia global
window.NoteMapping = new NoteMapping();

// Log inicial para verificación
if (typeof window !== 'undefined' && window.console) {
    console.log('✅ NoteMapping cargado correctamente');
    console.log('🎵 Nota 40 (C4):', window.NoteMapping.getNoteInfo(40));
    console.log('🎵 Nota 1 (A0):', window.NoteMapping.getNoteInfo(1));
    console.log('🎵 Nota 88 (C8):', window.NoteMapping.getNoteInfo(88));
}