/**
 * GALAXY PIANO - STAR SYSTEM
 * Sistema de estrellas musicales con colores y posiciones
 * Sprint 2 - Sistema de Estrellas
 */

class StarSystem {
    constructor(galaxyRenderer) {
        this.galaxyRenderer = galaxyRenderer;
        this.scene = galaxyRenderer?.scene;
        this.starGroup = galaxyRenderer?.starGroup;
        
        // Configuración de estrellas
        this.config = {
            baseSize: 3.0,
            maxSize: 8.0,
            glowIntensity: 1.5,
            fadeTime: 2.0,
            maxStars: 100,
            spiralFactor: 0.3,
            heightFactor: 2.0,
            radiusBase: 80,
            radiusVariation: 40
        };
        
        // Mapeo de colores por registro
        this.registerColors = {
            'graves-extremos':   { color: 0x4a90e2, name: 'Azul' },        // 1-15
            'graves':            { color: 0x87ceeb, name: 'Azul-Blanco' },  // 16-30
            'medios-graves':     { color: 0xffffff, name: 'Blanco' },       // 31-45
            'medios-agudos':     { color: 0xfffacd, name: 'Blanco-Amarillo' }, // 46-60
            'agudos':            { color: 0xffd700, name: 'Amarillo' },     // 61-75
            'muy-agudos':        { color: 0xff6347, name: 'Naranja' },      // 76-85
            'extremos-agudos':   { color: 0xff0000, name: 'Rojo' }          // 86-88
        };
        
        // Estado del sistema
        this.state = {
            activeStars: new Map(), // noteNumber -> starObject
            starHistory: [],
            totalStarsCreated: 0,
            lastCreationTime: 0
        };
        
        // Referencias para cleanup
        this.animationCallbacks = [];
        
        console.log('⭐ StarSystem constructor - Sistema de estrellas musicales');
    }
    
    /**
     * Crear estrellas para notas musicales
     */
    createStars(notes, duration = 2.0, intensity = 1.0, timeOffset = 0) {
        if (!this.validateInput(notes)) return [];
        
        const noteArray = Array.isArray(notes) ? notes : [notes];
        const createdStars = [];
        
        console.log('🌟 Creando estrellas para notas:', noteArray);
        
        for (const noteNumber of noteArray) {
            try {
                const star = this.createSingleStar(noteNumber, duration, intensity, timeOffset);
                if (star) {
                    createdStars.push(star);
                    this.state.activeStars.set(noteNumber, star);
                    this.state.totalStarsCreated++;
                }
            } catch (error) {
                console.error(`❌ Error creando estrella para nota ${noteNumber}:`, error);
            }
        }
        
        this.state.lastCreationTime = performance.now();
        
        // Limpiar estrellas antiguas si hay demasiadas
        this.cleanupOldStars();
        
        return createdStars;
    }
    
    /**
     * Crear una estrella individual
     */
    createSingleStar(noteNumber, duration, intensity, timeOffset) {
        // Obtener información de la nota
        const noteInfo = this.getNoteInfo(noteNumber);
        const position = this.calculateStarPosition(noteNumber, timeOffset);
        const starSize = this.calculateStarSize(duration, intensity);
        const starColor = this.getStarColor(noteNumber);
        
        // Crear geometría de estrella
        const geometry = new THREE.SphereGeometry(starSize, 16, 16);
        
        // Crear material con glow
        const material = new THREE.MeshBasicMaterial({
            color: starColor.color,
            transparent: true,
            opacity: 0.9,
            emissive: starColor.color,
            emissiveIntensity: 0.3
        });
        
        // Crear mesh de estrella
        const starMesh = new THREE.Mesh(geometry, material);
        starMesh.position.copy(position);
        
        // Crear efecto de glow (anillo exterior)
        const glowGeometry = new THREE.SphereGeometry(starSize * 1.5, 12, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: starColor.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.copy(position);
        
        // Crear grupo de estrella completa
        const starGroup = new THREE.Group();
        starGroup.add(starMesh);
        starGroup.add(glowMesh);
        
        // Añadir a la escena
        this.starGroup.add(starGroup);
        
        // Crear objeto de estrella con metadatos
        const star = {
            id: this.generateStarId(),
            noteNumber: noteNumber,
            noteInfo: noteInfo,
            position: position.clone(),
            size: starSize,
            color: starColor,
            duration: duration,
            intensity: intensity,
            createdAt: performance.now(),
            
            // Objetos Three.js
            group: starGroup,
            mesh: starMesh,
            glowMesh: glowMesh,
            material: material,
            glowMaterial: glowMaterial,
            
            // Estado de animación
            isActive: true,
            fadeProgress: 0,
            
            // Funciones
            update: (deltaTime) => this.updateStar(star, deltaTime),
            destroy: () => this.destroyStar(star)
        };
        
        // Animación de aparición
        this.animateStarAppearance(star);
        
        // Programar desvanecimiento
        this.scheduleStarFade(star, duration);
        
        console.log(`⭐ Estrella creada: Nota ${noteNumber} (${noteInfo.name}) - ${starColor.name}`);
        
        return star;
    }
    
    /**
     * Calcular posición 3D de estrella según nota
     */
    calculateStarPosition(noteNumber, timeOffset = 0) {
        // Mapear nota (1-88) a coordenadas galácticas
        const normalizedNote = (noteNumber - 1) / 87; // 0-1
        
        // Ángulo basado en la nota (distribución espiral)
        const baseAngle = normalizedNote * Math.PI * 4; // 2 vueltas completas
        const spiralOffset = normalizedNote * this.config.spiralFactor;
        const angle = baseAngle + spiralOffset + timeOffset;
        
        // Radio basado en registro (graves más cerca del centro)
        const radiusFromCenter = this.config.radiusBase + (normalizedNote * this.config.radiusVariation);
        
        // Altura basada en registro tonal
        const height = (normalizedNote - 0.5) * this.config.heightFactor * 20;
        
        // Coordenadas finales
        const x = Math.cos(angle) * radiusFromCenter;
        const z = Math.sin(angle) * radiusFromCenter;
        const y = height;
        
        return new THREE.Vector3(x, y, z);
    }
    
    /**
     * Calcular tamaño de estrella según duración e intensidad
     */
    calculateStarSize(duration, intensity) {
        const durationFactor = Math.min(duration / 4.0, 1.5); // Max 1.5x por duración
        const intensityFactor = Math.min(intensity, 1.2); // Max 1.2x por intensidad
        
        return this.config.baseSize * durationFactor * intensityFactor;
    }
    
    /**
     * Obtener color de estrella según registro tonal
     */
    getStarColor(noteNumber) {
        let registerKey;
        
        if (noteNumber >= 1 && noteNumber <= 15) {
            registerKey = 'graves-extremos';
        } else if (noteNumber >= 16 && noteNumber <= 30) {
            registerKey = 'graves';
        } else if (noteNumber >= 31 && noteNumber <= 45) {
            registerKey = 'medios-graves';
        } else if (noteNumber >= 46 && noteNumber <= 60) {
            registerKey = 'medios-agudos';
        } else if (noteNumber >= 61 && noteNumber <= 75) {
            registerKey = 'agudos';
        } else if (noteNumber >= 76 && noteNumber <= 85) {
            registerKey = 'muy-agudos';
        } else if (noteNumber >= 86 && noteNumber <= 88) {
            registerKey = 'extremos-agudos';
        } else {
            registerKey = 'medios-graves'; // Default
        }
        
        return {
            ...this.registerColors[registerKey],
            register: registerKey
        };
    }
    
    /**
     * Obtener información completa de nota
     */
    getNoteInfo(noteNumber) {
        if (window.NoteMapping) {
            return window.NoteMapping.getNoteInfo(noteNumber);
        }
        
        // Fallback básico
        return {
            number: noteNumber,
            name: `Note${noteNumber}`,
            frequency: 440 * Math.pow(2, (noteNumber - 49) / 12)
        };
    }
    
    /**
     * Animar aparición de estrella
     */
    animateStarAppearance(star) {
        const startScale = 0.1;
        const targetScale = 1.0;
        const duration = 0.3; // 300ms
        
        star.group.scale.setScalar(startScale);
        star.material.opacity = 0;
        star.glowMaterial.opacity = 0;
        
        const startTime = performance.now();
        
        const animate = () => {
            const elapsed = (performance.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing suave
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            // Escala
            const currentScale = startScale + (targetScale - startScale) * easedProgress;
            star.group.scale.setScalar(currentScale);
            
            // Opacidad
            star.material.opacity = 0.9 * easedProgress;
            star.glowMaterial.opacity = 0.3 * easedProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Programar desvanecimiento de estrella
     */
    scheduleStarFade(star, delay) {
        setTimeout(() => {
            if (star.isActive) {
                this.fadeOutStar(star);
            }
        }, delay * 1000);
    }
    
    /**
     * Desvanecer estrella
     */
    fadeOutStar(star) {
        const duration = this.config.fadeTime;
        const startTime = performance.now();
        const startOpacity = star.material.opacity;
        const startGlowOpacity = star.glowMaterial.opacity;
        
        const animate = () => {
            const elapsed = (performance.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            
            // Fade out
            star.material.opacity = startOpacity * (1 - progress);
            star.glowMaterial.opacity = startGlowOpacity * (1 - progress);
            
            // También reducir escala
            const scale = 1 - (progress * 0.3);
            star.group.scale.setScalar(scale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                star.destroy();
            }
        };
        
        animate();
    }
    
    /**
     * Actualizar estrella (llamado en loop de animación)
     */
    updateStar(star, deltaTime) {
        if (!star.isActive) return;
        
        // Rotación suave
        star.group.rotation.y += deltaTime * 0.5;
        
        // Pulsación según intensidad
        const pulse = 1 + Math.sin(performance.now() * 0.003) * 0.1;
        star.material.emissiveIntensity = 0.3 * pulse * star.intensity;
    }
    
    /**
     * Destruir estrella individual
     */
    destroyStar(star) {
        if (!star.isActive) return;
        
        star.isActive = false;
        
        // Remover de escena
        if (star.group && star.group.parent) {
            star.group.parent.remove(star.group);
        }
        
        // Limpiar geometrías y materiales
        if (star.mesh?.geometry) star.mesh.geometry.dispose();
        if (star.glowMesh?.geometry) star.glowMesh.geometry.dispose();
        if (star.material) star.material.dispose();
        if (star.glowMaterial) star.glowMaterial.dispose();
        
        // Remover de activas
        this.state.activeStars.delete(star.noteNumber);
        
        console.log(`🗑️ Estrella destruida: Nota ${star.noteNumber}`);
    }
    
    /**
     * Limpiar estrellas antiguas para mantener rendimiento
     */
    cleanupOldStars() {
        if (this.state.activeStars.size <= this.config.maxStars) return;
        
        // Ordenar por tiempo de creación
        const sortedStars = Array.from(this.state.activeStars.values())
            .sort((a, b) => a.createdAt - b.createdAt);
        
        // Remover las más antiguas
        const toRemove = sortedStars.slice(0, sortedStars.length - this.config.maxStars);
        
        toRemove.forEach(star => {
            this.fadeOutStar(star);
        });
        
        console.log(`🧹 Limpieza: ${toRemove.length} estrellas antiguas eliminadas`);
    }
    
    /**
     * Detener nota específica (remover estrella)
     */
    stopNote(noteNumber) {
        const star = this.state.activeStars.get(noteNumber);
        if (star) {
            this.fadeOutStar(star);
            console.log(`⏹️ Nota ${noteNumber} detenida - estrella desvaneciendo`);
        }
    }
    
    /**
     * Detener todas las estrellas
     */
    stopAll() {
        console.log('⏹️ Deteniendo todas las estrellas activas');
        
        const activeStars = Array.from(this.state.activeStars.values());
        activeStars.forEach(star => {
            this.fadeOutStar(star);
        });
    }
    
    /**
     * Validar entrada
     */
    validateInput(notes) {
        if (!this.starGroup) {
            console.error('❌ StarSystem no está inicializado correctamente');
            return false;
        }
        
        if (!notes) {
            console.error('❌ Notas no proporcionadas');
            return false;
        }
        
        return true;
    }
    
    /**
     * Generar ID único para estrella
     */
    generateStarId() {
        return `star-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Obtener estadísticas del sistema
     */
    getStats() {
        const memoryUsage = {
            activeStars: this.state.activeStars.size,
            totalCreated: this.state.totalStarsCreated,
            maxStars: this.config.maxStars
        };
        
        const colorDistribution = {};
        Array.from(this.state.activeStars.values()).forEach(star => {
            const register = star.color.register;
            colorDistribution[register] = (colorDistribution[register] || 0) + 1;
        });
        
        return {
            memory: memoryUsage,
            colors: colorDistribution,
            lastCreation: this.state.lastCreationTime,
            performance: {
                triangles: this.state.activeStars.size * 32 * 2, // Aproximado
                drawCalls: this.state.activeStars.size * 2
            }
        };
    }
    
    /**
     * Test de estrella en posición específica
     */
    testStar(noteNumber = 40, duration = 3.0) {
        console.log(`🧪 Test de estrella - Nota ${noteNumber}...`);
        
        try {
            const star = this.createStars([noteNumber], duration, 1.0);
            console.log(`✅ Test de estrella exitoso:`, star);
            return star;
        } catch (error) {
            console.error(`❌ Test de estrella falló:`, error);
            return null;
        }
    }
    
    /**
     * Mostrar todas las estrellas activas con información
     */
    debugStars() {
        console.log('⭐ StarSystem - Debug Info');
        console.log('===========================');
        
        const stats = this.getStats();
        console.table(stats);
        
        console.log('\n🌟 Estrellas activas:');
        Array.from(this.state.activeStars.values()).forEach(star => {
            console.log(`  Nota ${star.noteNumber}: ${star.noteInfo.name} - ${star.color.name} - Size: ${star.size.toFixed(1)}`);
        });
        
        console.log('\n🎨 Distribución de colores:');
        console.table(stats.colors);
    }
    
    /**
     * Destruir sistema completo
     */
    destroy() {
        console.log('🛑 Destruyendo StarSystem...');
        
        // Detener todas las estrellas
        this.stopAll();
        
        // Limpiar referencias
        this.galaxyRenderer = null;
        this.scene = null;
        this.starGroup = null;
        this.state.activeStars.clear();
        
        console.log('✅ StarSystem destruido');
    }
}

// Exponer clase globalmente
window.StarSystem = StarSystem;