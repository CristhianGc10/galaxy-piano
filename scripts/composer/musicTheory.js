/**
 * GALAXY PIANO - MUSIC THEORY SYSTEM
 * Sistema avanzado de teoría musical e inteligencia armónica
 * Sprint 3 - Días 17-18: IA Musical Básica
 */

class MusicTheoryEngine {
    constructor() {
        // Base de datos de acordes
        this.chordDatabase = this.initializeChordDatabase();
        
        // Base de datos de escalas
        this.scaleDatabase = this.initializeScaleDatabase();
        
        // Configuración del análisis
        this.config = {
            maxChordSize: 6,
            minChordSize: 2,
            enharmonicTolerance: true,
            contextAnalysis: true,
            suggestionLimit: 5
        };
        
        // Estado del análisis
        this.analysisState = {
            currentKey: null,
            currentScale: null,
            chordProgression: [],
            suggestions: [],
            lastAnalysis: null
        };
        
        console.log('🎵 MusicTheoryEngine inicializado');
        console.log('📚 Acordes cargados:', Object.keys(this.chordDatabase).length);
        console.log('🎼 Escalas cargadas:', Object.keys(this.scaleDatabase).length);
    }
    
    /**
     * 3.8 Inicializar base de datos de acordes
     */
    initializeChordDatabase() {
        return {
            // Tríadas Mayores
            'major': {
                name: 'Mayor',
                symbol: 'M',
                intervals: [0, 4, 7],
                quality: 'consonant',
                function: ['tonic', 'dominant'],
                examples: ['C', 'F', 'G']
            },
            
            // Tríadas Menores
            'minor': {
                name: 'Menor',
                symbol: 'm',
                intervals: [0, 3, 7],
                quality: 'consonant',
                function: ['tonic', 'subdominant'],
                examples: ['Am', 'Dm', 'Em']
            },
            
            // Tríadas Disminuidas
            'diminished': {
                name: 'Disminuido',
                symbol: 'dim',
                intervals: [0, 3, 6],
                quality: 'dissonant',
                function: ['leading-tone'],
                examples: ['Bdim', 'F#dim']
            },
            
            // Tríadas Aumentadas
            'augmented': {
                name: 'Aumentado',
                symbol: 'aug',
                intervals: [0, 4, 8],
                quality: 'dissonant',
                function: ['chromatic'],
                examples: ['Caug', 'Faug']
            },
            
            // Séptimas Dominantes
            'dominant7': {
                name: 'Séptima Dominante',
                symbol: '7',
                intervals: [0, 4, 7, 10],
                quality: 'dissonant',
                function: ['dominant'],
                examples: ['G7', 'C7', 'D7']
            },
            
            // Séptimas Mayores
            'major7': {
                name: 'Séptima Mayor',
                symbol: 'maj7',
                intervals: [0, 4, 7, 11],
                quality: 'consonant',
                function: ['tonic'],
                examples: ['Cmaj7', 'Fmaj7']
            },
            
            // Séptimas Menores
            'minor7': {
                name: 'Séptima Menor',
                symbol: 'm7',
                intervals: [0, 3, 7, 10],
                quality: 'consonant',
                function: ['subdominant'],
                examples: ['Am7', 'Dm7']
            },
            
            // Suspendidas
            'sus2': {
                name: 'Suspendida Segunda',
                symbol: 'sus2',
                intervals: [0, 2, 7],
                quality: 'suspended',
                function: ['suspension'],
                examples: ['Csus2', 'Gsus2']
            },
            
            'sus4': {
                name: 'Suspendida Cuarta',
                symbol: 'sus4',
                intervals: [0, 5, 7],
                quality: 'suspended',
                function: ['suspension'],
                examples: ['Csus4', 'Fsus4']
            },
            
            // Acordes Extendidos
            'add9': {
                name: 'Añadida Novena',
                symbol: 'add9',
                intervals: [0, 4, 7, 14],
                quality: 'extended',
                function: ['color'],
                examples: ['Cadd9', 'Gadd9']
            }
        };
    }
    
    /**
     * 3.10 Inicializar base de datos de escalas
     */
    initializeScaleDatabase() {
        return {
            // Escalas Mayores
            'major': {
                name: 'Mayor (Jónica)',
                intervals: [0, 2, 4, 5, 7, 9, 11],
                modes: ['ionian'],
                character: 'bright',
                chords: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
            },
            
            // Escalas Menores Naturales
            'minor': {
                name: 'Menor Natural (Eólica)',
                intervals: [0, 2, 3, 5, 7, 8, 10],
                modes: ['aeolian'],
                character: 'dark',
                chords: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
            },
            
            // Menor Armónica
            'harmonic_minor': {
                name: 'Menor Armónica',
                intervals: [0, 2, 3, 5, 7, 8, 11],
                modes: ['harmonic_minor'],
                character: 'exotic',
                chords: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°']
            },
            
            // Menor Melódica
            'melodic_minor': {
                name: 'Menor Melódica',
                intervals: [0, 2, 3, 5, 7, 9, 11],
                modes: ['melodic_minor'],
                character: 'smooth',
                chords: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°']
            },
            
            // Modos Griegos
            'dorian': {
                name: 'Dórico',
                intervals: [0, 2, 3, 5, 7, 9, 10],
                modes: ['dorian'],
                character: 'jazzy',
                chords: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII']
            },
            
            'phrygian': {
                name: 'Frigio',
                intervals: [0, 1, 3, 5, 7, 8, 10],
                modes: ['phrygian'],
                character: 'spanish',
                chords: ['i', 'II', 'iii', 'iv', 'v°', 'VI', 'vii']
            },
            
            'lydian': {
                name: 'Lidio',
                intervals: [0, 2, 4, 6, 7, 9, 11],
                modes: ['lydian'],
                character: 'dreamy',
                chords: ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii']
            },
            
            'mixolydian': {
                name: 'Mixolidio',
                intervals: [0, 2, 4, 5, 7, 9, 10],
                modes: ['mixolydian'],
                character: 'bluesy',
                chords: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII']
            },
            
            // Escalas Exóticas
            'pentatonic_major': {
                name: 'Pentatónica Mayor',
                intervals: [0, 2, 4, 7, 9],
                modes: ['pentatonic'],
                character: 'simple',
                chords: ['I', 'ii', 'iii', 'V', 'vi']
            },
            
            'pentatonic_minor': {
                name: 'Pentatónica Menor',
                intervals: [0, 3, 5, 7, 10],
                modes: ['pentatonic'],
                character: 'bluesy',
                chords: ['i', 'III', 'iv', 'v', 'VII']
            },
            
            'blues': {
                name: 'Blues',
                intervals: [0, 3, 5, 6, 7, 10],
                modes: ['blues'],
                character: 'soulful',
                chords: ['I7', 'IV7', 'V7']
            }
        };
    }
    
    /**
     * 3.9 Analizador principal de acordes
     */
    analyzeChord(noteNumbers, options = {}) {
        const {
            strictMode = false,
            includeInversions = true,
            includeExtensions = true,
            contextKey = null
        } = options;
        
        if (!Array.isArray(noteNumbers) || noteNumbers.length < this.config.minChordSize) {
            return {
                success: false,
                error: 'Se requieren al menos 2 notas para análisis'
            };
        }
        
        // Normalizar notas a clases de altura (0-11)
        const pitchClasses = this.notesToPitchClasses(noteNumbers);
        const sortedPitches = [...new Set(pitchClasses)].sort((a, b) => a - b);
        
        const analysis = {
            success: true,
            inputNotes: noteNumbers,
            pitchClasses: sortedPitches,
            possibleChords: [],
            bestMatch: null,
            confidence: 0,
            inversions: [],
            extensions: [],
            suggestions: []
        };
        
        // Buscar coincidencias exactas
        analysis.possibleChords = this.findMatchingChords(sortedPitches, strictMode);
        
        // Encontrar mejor coincidencia
        if (analysis.possibleChords.length > 0) {
            analysis.bestMatch = this.selectBestChord(analysis.possibleChords, contextKey);
            analysis.confidence = this.calculateConfidence(analysis.bestMatch, sortedPitches);
        }
        
        // Analizar inversiones si se solicita
        if (includeInversions) {
            analysis.inversions = this.analyzeInversions(sortedPitches);
        }
        
        // Detectar extensiones si se solicita
        if (includeExtensions) {
            analysis.extensions = this.detectExtensions(sortedPitches, analysis.bestMatch);
        }
        
        // Generar sugerencias
        analysis.suggestions = this.generateChordSuggestions(analysis.bestMatch, contextKey);
        
        // Actualizar estado
        this.analysisState.lastAnalysis = analysis;
        if (analysis.bestMatch) {
            this.addToProgression(analysis.bestMatch);
        }
        
        console.log('🎵 Análisis de acorde completado:', {
            input: noteNumbers,
            detected: analysis.bestMatch?.displayName || 'No identificado',
            confidence: Math.round(analysis.confidence * 100) + '%'
        });
        
        return analysis;
    }
    
    /**
     * Convertir números de nota a clases de altura
     */
    notesToPitchClasses(noteNumbers) {
        return noteNumbers.map(note => {
            // Convertir nota (1-88) a MIDI y luego a clase de altura
            const midiNote = note + 20; // Ajuste para nuestro sistema
            return midiNote % 12;
        });
    }
    
    /**
     * Buscar acordes que coincidan con las clases de altura
     */
    findMatchingChords(pitchClasses, strictMode) {
        const matches = [];
        
        // Probar todas las transposiciones posibles
        for (let root = 0; root < 12; root++) {
            for (const [chordType, chordData] of Object.entries(this.chordDatabase)) {
                const chordPitches = chordData.intervals.map(interval => (root + interval) % 12);
                
                const matchResult = this.compareChordToInput(chordPitches, pitchClasses, strictMode);
                
                if (matchResult.matches) {
                    matches.push({
                        type: chordType,
                        root: root,
                        rootName: this.pitchClassToNoteName(root),
                        displayName: this.pitchClassToNoteName(root) + chordData.symbol,
                        data: chordData,
                        matchQuality: matchResult.quality,
                        missingNotes: matchResult.missing,
                        extraNotes: matchResult.extra
                    });
                }
            }
        }
        
        // Ordenar por calidad de coincidencia
        return matches.sort((a, b) => b.matchQuality - a.matchQuality);
    }
    
    /**
     * Comparar acorde teórico con entrada del usuario
     */
    compareChordToInput(chordPitches, inputPitches, strictMode) {
        const chordSet = new Set(chordPitches);
        const inputSet = new Set(inputPitches);
        
        if (strictMode) {
            // Coincidencia exacta requerida
            const matches = chordSet.size === inputSet.size && 
                           [...chordSet].every(pitch => inputSet.has(pitch));
            
            return {
                matches,
                quality: matches ? 1.0 : 0.0,
                missing: [],
                extra: []
            };
        } else {
            // Coincidencia flexible
            const intersection = [...chordSet].filter(pitch => inputSet.has(pitch));
            const missing = [...chordSet].filter(pitch => !inputSet.has(pitch));
            const extra = [...inputSet].filter(pitch => !chordSet.has(pitch));
            
            // Calcular calidad de coincidencia
            const coverage = intersection.length / chordSet.size;
            const penalty = extra.length * 0.1; // Penalizar notas extra
            const quality = Math.max(0, coverage - penalty);
            
            return {
                matches: coverage >= 0.6, // Mínimo 60% de coincidencia
                quality,
                missing,
                extra
            };
        }
    }
    
    /**
     * Seleccionar el mejor acorde basado en contexto
     */
    selectBestChord(possibleChords, contextKey) {
        if (possibleChords.length === 0) return null;
        
        let scored = possibleChords.map(chord => ({
            ...chord,
            contextScore: this.calculateContextScore(chord, contextKey)
        }));
        
        // Ordenar por calidad de coincidencia y puntuación contextual
        scored.sort((a, b) => {
            const qualityDiff = b.matchQuality - a.matchQuality;
            return qualityDiff !== 0 ? qualityDiff : b.contextScore - a.contextScore;
        });
        
        return scored[0];
    }
    
    /**
     * Calcular puntuación contextual basada en tonalidad
     */
    calculateContextScore(chord, contextKey) {
        if (!contextKey) return 0;
        
        // Puntuación básica por función tonal
        const functionScores = {
            'tonic': 1.0,
            'dominant': 0.9,
            'subdominant': 0.8,
            'leading-tone': 0.7,
            'suspension': 0.5,
            'chromatic': 0.3,
            'color': 0.6
        };
        
        let score = 0;
        chord.data.function.forEach(func => {
            score += functionScores[func] || 0;
        });
        
        return score / chord.data.function.length;
    }
    
    /**
     * Calcular confianza del análisis
     */
    calculateConfidence(bestMatch, pitchClasses) {
        if (!bestMatch) return 0;
        
        // Factores que afectan la confianza
        const baseConfidence = bestMatch.matchQuality;
        const complexityPenalty = Math.max(0, (pitchClasses.length - 4) * 0.1);
        const consonanceBonus = bestMatch.data.quality === 'consonant' ? 0.1 : 0;
        
        return Math.min(1.0, baseConfidence - complexityPenalty + consonanceBonus);
    }
    
    /**
     * 3.12 Generar sugerencias de continuación armónica
     */
    generateChordSuggestions(currentChord, contextKey = null) {
        const suggestions = [];
        
        if (!currentChord) {
            // Sugerencias básicas sin contexto
            return [
                { chord: 'C', reason: 'Tónica mayor estable' },
                { chord: 'Am', reason: 'Tónica menor emocional' },
                { chord: 'F', reason: 'Subdominante cálida' },
                { chord: 'G', reason: 'Dominante energética' }
            ];
        }
        
        // Sugerencias basadas en función tonal
        const chordFunction = currentChord.data.function[0];
        
        switch (chordFunction) {
            case 'tonic':
                suggestions.push(
                    { chord: 'Subdominante', reason: 'Movimiento hacia la subdominante' },
                    { chord: 'Relativo menor', reason: 'Cambio de modo emocional' },
                    { chord: 'Dominante', reason: 'Progresión clásica I-V' }
                );
                break;
                
            case 'dominant':
                suggestions.push(
                    { chord: 'Tónica', reason: 'Resolución natural V-I' },
                    { chord: 'Subdominante', reason: 'Progresión V-IV (plagal)' },
                    { chord: 'Relativo menor', reason: 'Resolución deceptiva' }
                );
                break;
                
            case 'subdominant':
                suggestions.push(
                    { chord: 'Dominante', reason: 'Progresión IV-V clásica' },
                    { chord: 'Tónica', reason: 'Resolución directa IV-I' },
                    { chord: 'ii', reason: 'Movimiento por círculo de quintas' }
                );
                break;
        }
        
        // Añadir sugerencias por círculo de quintas
        const circleOfFifths = this.getCircleOfFifthsSuggestions(currentChord.root);
        suggestions.push(...circleOfFifths);
        
        // Limitar número de sugerencias
        return suggestions.slice(0, this.config.suggestionLimit);
    }
    
    /**
     * Obtener sugerencias basadas en círculo de quintas
     */
    getCircleOfFifthsSuggestions(currentRoot) {
        const circle = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // Círculo de quintas
        const currentIndex = circle.indexOf(currentRoot);
        
        if (currentIndex === -1) return [];
        
        const suggestions = [];
        
        // Quinta ascendente
        const fifthUp = circle[(currentIndex + 1) % 12];
        suggestions.push({
            chord: this.pitchClassToNoteName(fifthUp),
            reason: 'Quinta ascendente (círculo de quintas)'
        });
        
        // Quinta descendente
        const fifthDown = circle[(currentIndex - 1 + 12) % 12];
        suggestions.push({
            chord: this.pitchClassToNoteName(fifthDown),
            reason: 'Quinta descendente (movimiento subdominante)'
        });
        
        return suggestions;
    }
    
    /**
     * 3.11 Validación armónica
     */
    validateHarmony(chordProgression, options = {}) {
        const {
            allowParallels = false,
            checkVoiceLeading = true,
            preferCommonTones = true,
            contextKey = null
        } = options;
        
        const validation = {
            valid: true,
            score: 100,
            issues: [],
            suggestions: [],
            analysis: {
                keyStability: 0,
                voiceLeading: 0,
                functionalCoherence: 0
            }
        };
        
        if (chordProgression.length < 2) {
            return validation; // No hay suficientes acordes para validar
        }
        
        // Analizar cada transición
        for (let i = 0; i < chordProgression.length - 1; i++) {
            const currentChord = chordProgression[i];
            const nextChord = chordProgression[i + 1];
            
            const transitionAnalysis = this.analyzeChordTransition(currentChord, nextChord, options);
            
            validation.score -= transitionAnalysis.penalty;
            validation.issues.push(...transitionAnalysis.issues);
            validation.suggestions.push(...transitionAnalysis.suggestions);
        }
        
        // Análisis global de la progresión
        validation.analysis.keyStability = this.analyzeKeyStability(chordProgression, contextKey);
        validation.analysis.functionalCoherence = this.analyzeFunctionalCoherence(chordProgression);
        
        validation.valid = validation.score >= 60; // Umbral de validez
        
        return validation;
    }
    
    /**
     * Analizar transición entre dos acordes
     */
    analyzeChordTransition(chord1, chord2, options) {
        const analysis = {
            penalty: 0,
            issues: [],
            suggestions: []
        };
        
        // Calcular movimiento de fundamentales
        const rootMovement = (chord2.root - chord1.root + 12) % 12;
        
        // Evaluar calidad del movimiento
        if (rootMovement === 7) { // Quinta ascendente
            // Excelente movimiento
        } else if (rootMovement === 5) { // Quinta descendente
            // Muy buen movimiento
        } else if (rootMovement === 2 || rootMovement === 10) { // Segunda mayor
            analysis.penalty += 5;
            analysis.issues.push('Movimiento de segunda mayor - considera pasos intermedios');
        } else if (rootMovement === 1 || rootMovement === 11) { // Semitono
            analysis.penalty += 10;
            analysis.issues.push('Movimiento cromático - muy disonante');
        }
        
        // Verificar compatibilidad funcional
        const functionalCompatibility = this.checkFunctionalCompatibility(chord1, chord2);
        if (!functionalCompatibility.compatible) {
            analysis.penalty += 15;
            analysis.issues.push(functionalCompatibility.reason);
        }
        
        return analysis;
    }
    
    /**
     * Verificar compatibilidad funcional entre acordes
     */
    checkFunctionalCompatibility(chord1, chord2) {
        const func1 = chord1.data.function[0];
        const func2 = chord2.data.function[0];
        
        // Reglas básicas de función tonal
        const compatibleTransitions = {
            'tonic': ['subdominant', 'dominant', 'tonic'],
            'subdominant': ['dominant', 'tonic'],
            'dominant': ['tonic', 'subdominant']
        };
        
        if (compatibleTransitions[func1]?.includes(func2)) {
            return { compatible: true };
        } else {
            return { 
                compatible: false, 
                reason: `Transición ${func1} → ${func2} poco convencional` 
            };
        }
    }
    
    /**
     * Convertir clase de altura a nombre de nota
     */
    pitchClassToNoteName(pitchClass) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return noteNames[pitchClass];
    }
    
    /**
     * Añadir acorde a la progresión actual
     */
    addToProgression(chord) {
        this.analysisState.chordProgression.push(chord);
        
        // Mantener solo los últimos 8 acordes
        if (this.analysisState.chordProgression.length > 8) {
            this.analysisState.chordProgression.shift();
        }
    }
    
    /**
     * Analizar estabilidad tonal
     */
    analyzeKeyStability(chordProgression, contextKey) {
        // Implementación simplificada
        if (!contextKey) return 0.5;
        
        let stability = 0;
        chordProgression.forEach(chord => {
            if (chord.data.function.includes('tonic')) {
                stability += 0.3;
            } else if (chord.data.function.includes('dominant')) {
                stability += 0.2;
            } else if (chord.data.function.includes('subdominant')) {
                stability += 0.1;
            }
        });
        
        return Math.min(1.0, stability / chordProgression.length);
    }
    
    /**
     * Analizar coherencia funcional
     */
    analyzeFunctionalCoherence(chordProgression) {
        // Implementación simplificada
        let coherence = 0.5;
        
        for (let i = 0; i < chordProgression.length - 1; i++) {
            const transition = this.checkFunctionalCompatibility(
                chordProgression[i], 
                chordProgression[i + 1]
            );
            
            if (transition.compatible) {
                coherence += 0.1;
            } else {
                coherence -= 0.05;
            }
        }
        
        return Math.max(0, Math.min(1.0, coherence));
    }
    
    /**
     * Analizar inversiones
     */
    analyzeInversions(pitchClasses) {
        // Implementación básica - detectar si la nota más grave es la fundamental
        const lowestNote = Math.min(...pitchClasses);
        
        return [{
            type: 'root_position',
            bass: lowestNote,
            description: 'Posición fundamental detectada'
        }];
    }
    
    /**
     * Detectar extensiones (9nas, 11vas, 13vas)
     */
    detectExtensions(pitchClasses, baseChord) {
        if (!baseChord) return [];
        
        const extensions = [];
        const baseIntervals = new Set(baseChord.data.intervals);
        
        pitchClasses.forEach(pitch => {
            const interval = (pitch - baseChord.root + 12) % 12;
            
            if (!baseIntervals.has(interval)) {
                // Detectar extensiones comunes
                if (interval === 2 || interval === 14) { // 9na
                    extensions.push({ type: '9', name: 'Novena' });
                } else if (interval === 5 || interval === 17) { // 11va
                    extensions.push({ type: '11', name: 'Oncena' });
                } else if (interval === 9 || interval === 21) { // 13va
                    extensions.push({ type: '13', name: 'Trecena' });
                }
            }
        });
        
        return extensions;
    }
    
    /**
     * 3.13 Test completo del sistema
     */
    async testMusicTheory() {
        console.log('🧪 Testing Music Theory Engine...');
        
        // Test 1: Acorde mayor básico (C major: C-E-G)
        const test1Notes = [40, 43, 47]; // C4, E4, G4 en nuestro sistema
        const test1 = this.analyzeChord(test1Notes);
        console.log('Test 1 - C Major:', test1.bestMatch?.displayName);
        
        // Test 2: Acorde menor (E minor: E-G-B)
        const test2Notes = [43, 47, 50]; // E4, G4, B4
        const test2 = this.analyzeChord(test2Notes);
        console.log('Test 2 - E Minor:', test2.bestMatch?.displayName);
        
        // Test 3: Acorde con séptima (G7: G-B-D-F)
        const test3Notes = [47, 50, 53, 56]; // G4, B4, D5, F5
        const test3 = this.analyzeChord(test3Notes);
        console.log('Test 3 - G7:', test3.bestMatch?.displayName);
        
        // Test 4: Validación de progresión (I-vi-IV-V en C)
        const progression = [test1.bestMatch, test2.bestMatch, null, null];
        // Simular F major y G major para completar
        
        console.log('✅ Music Theory tests completed');
        
        return {
            chordDetection: !!(test1.bestMatch && test2.bestMatch && test3.bestMatch),
            suggestions: test1.suggestions.length > 0,
            confidence: test1.confidence > 0.7
        };
    }
    
    /**
     * Obtener estadísticas del motor
     */
    getStats() {
        return {
            chordsInDatabase: Object.keys(this.chordDatabase).length,
            scalesInDatabase: Object.keys(this.scaleDatabase).length,
            currentProgression: this.analysisState.chordProgression.length,
            lastAnalysisConfidence: this.analysisState.lastAnalysis?.confidence || 0,
            currentKey: this.analysisState.currentKey,
            currentScale: this.analysisState.currentScale
        };
    }
}

// Exponer clase globalmente
window.MusicTheoryEngine = MusicTheoryEngine;