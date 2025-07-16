/**
 * GALAXY PIANO - SPECTRUM 3D ANALYSIS
 * Análisis espectral FFT en tiempo real con visualización 3D
 * Sprint 4 - Día 24-25: Espectro 3D Avanzado
 */

class Spectrum3DRenderer {
    constructor(canvasElement, audioEngine) {
        this.canvas = canvasElement;
        this.audioEngine = audioEngine;
        
        // Configuración del espectro 3D
        this.config = {
            fftSize: 2048,
            smoothingTimeConstant: 0.8,
            frequencyBins: 512,
            maxFrequency: 20000,
            minFrequency: 20,
            barCount: 64,
            barWidth: 2.0,
            barSpacing: 0.5,
            maxHeight: 100,
            colorMode: 'spectrum', // 'spectrum', 'intensity', 'musical'
            rotationSpeed: 0.01,
            cameraDistance: 200,
            logarithmicScale: true,
            showGrid: true,
            showLabels: true
        };
        
        // Objetos Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Grupos de objetos
        this.spectrumGroup = null;
        this.gridGroup = null;
        this.labelGroup = null;
        
        // Audio analysis
        this.analyser = null;
        this.dataArray = null;
        this.frequencyData = null;
        this.audioContext = null;
        
        // Barras del espectro
        this.bars = [];
        this.barMeshes = [];
        this.barMaterials = [];
        
        // Estado del renderer
        this.state = {
            isInitialized: false,
            isAnimating: false,
            autoRotate: true,
            currentTime: 0,
            peakValues: [],
            averageAmplitude: 0,
            dominantFrequency: 0,
            mouseInteracting: false
        };
        
        // Cache para optimización
        this.cache = {
            geometries: new Map(),
            materials: new Map(),
            textures: new Map()
        };
        
        console.log('📊 Spectrum3DRenderer constructor inicializado');
    }
    
    /**
     * 4.7 Inicializar renderer 3D del espectro
     */
    async init() {
        try {
            console.log('🚀 Inicializando Spectrum3D Renderer...');
            
            // Verificar Three.js
            this.checkThreeJS();
            
            // Configurar escena 3D
            this.setupScene();
            
            // Configurar cámara
            this.setupCamera();
            
            // Configurar renderer
            this.setupRenderer();
            
            // Configurar análisis de audio
            await this.setupAudioAnalysis();
            
            // Crear barras del espectro
            this.createSpectrumBars();
            
            // Configurar grid de referencia
            this.setupGrid();
            
            // Configurar controles
            this.setupControls();
            
            // Iniciar animación
            this.startAnimation();
            
            this.state.isInitialized = true;
            console.log('✅ Spectrum3D Renderer inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando Spectrum3D:', error);
            throw error;
        }
    }
    
    /**
     * Verificar Three.js
     */
    checkThreeJS() {
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js no está disponible');
        }
        console.log('✅ Three.js verificado');
    }
    
    /**
     * Configurar escena 3D
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        
        // Fog para profundidad
        this.scene.fog = new THREE.Fog(0x0a0a0f, 50, 300);
        
        // Grupos principales
        this.spectrumGroup = new THREE.Group();
        this.gridGroup = new THREE.Group();
        this.labelGroup = new THREE.Group();
        
        this.scene.add(this.spectrumGroup);
        this.scene.add(this.gridGroup);
        this.scene.add(this.labelGroup);
        
        // Luces
        this.setupLights();
        
        console.log('🌌 Escena 3D configurada');
    }
    
    /**
     * Configurar sistema de luces
     */
    setupLights() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
        this.scene.add(ambientLight);
        
        // Luz direccional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = false; // Por rendimiento
        this.scene.add(directionalLight);
        
        // Luz puntual para destacar barras altas
        const pointLight = new THREE.PointLight(0x00ff88, 0.6, 200);
        pointLight.position.set(0, 50, 0);
        this.scene.add(pointLight);
        
        console.log('💡 Sistema de luces configurado');
    }
    
    /**
     * Configurar cámara
     */
    setupCamera() {
        const aspect = this.canvas.width / this.canvas.height;
        
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 50, this.config.cameraDistance);
        this.camera.lookAt(0, 0, 0);
        
        console.log('📷 Cámara configurada');
    }
    
    /**
     * Configurar WebGL renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = false; // Por rendimiento
        
        console.log('🖥️ Renderer WebGL configurado');
    }
    
    /**
     * 4.8 Configurar análisis FFT en tiempo real
     */
    async setupAudioAnalysis() {
        if (!this.audioEngine || !this.audioEngine.state.context) {
            console.warn('⚠️ AudioEngine no disponible para análisis FFT');
            return;
        }
        
        try {
            this.audioContext = this.audioEngine.state.context;
            
            // Crear analizador FFT
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.config.fftSize;
            this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
            this.analyser.minDecibels = -90;
            this.analyser.maxDecibels = -10;
            
            // Conectar al master gain
            if (this.audioEngine.state.masterGain) {
                this.audioEngine.state.masterGain.connect(this.analyser);
            }
            
            // Buffers para datos
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.frequencyData = new Float32Array(this.analyser.frequencyBinCount);
            
            // Inicializar peak values
            this.state.peakValues = new Array(this.config.barCount).fill(0);
            
            console.log('🔊 Análisis FFT configurado:', {
                fftSize: this.config.fftSize,
                frequencyBinCount: this.analyser.frequencyBinCount,
                sampleRate: this.audioContext.sampleRate
            });
            
        } catch (error) {
            console.warn('⚠️ Error configurando análisis FFT:', error);
        }
    }
    
    /**
     * 4.9 Crear barras 3D del espectro
     */
    createSpectrumBars() {
        // Limpiar barras existentes
        this.clearBars();
        
        // Geometría base para barras
        const barGeometry = new THREE.BoxGeometry(
            this.config.barWidth,
            1, // La altura se escalará dinámicamente
            this.config.barWidth
        );
        
        // Posición central
        const totalWidth = this.config.barCount * (this.config.barWidth + this.config.barSpacing);
        const startX = -totalWidth / 2;
        
        for (let i = 0; i < this.config.barCount; i++) {
            // Posición de la barra
            const x = startX + i * (this.config.barWidth + this.config.barSpacing);
            
            // Material con color espectral
            const color = this.getSpectrumColor(i / this.config.barCount);
            const material = new THREE.MeshPhongMaterial({
                color: color,
                emissive: new THREE.Color(color).multiplyScalar(0.1),
                transparent: true,
                opacity: 0.9
            });
            
            // Crear mesh de barra
            const barMesh = new THREE.Mesh(barGeometry, material);
            barMesh.position.set(x, 0, 0);
            barMesh.scale.y = 0.1; // Altura inicial mínima
            
            // Añadir a la escena
            this.spectrumGroup.add(barMesh);
            
            // Guardar referencias
            this.barMeshes.push(barMesh);
            this.barMaterials.push(material);
            
            // Datos de la barra
            this.bars.push({
                index: i,
                mesh: barMesh,
                material: material,
                frequency: this.getFrequencyForBar(i),
                amplitude: 0,
                peakAmplitude: 0,
                smoothedAmplitude: 0
            });
        }
        
        console.log(`📊 ${this.config.barCount} barras del espectro creadas`);
    }
    
    /**
     * Obtener color espectral para barra
     */
    getSpectrumColor(normalizedPosition) {
        switch (this.config.colorMode) {
            case 'spectrum':
                // Espectro del arco iris
                const hue = (1 - normalizedPosition) * 240; // 240 = azul, 0 = rojo
                return new THREE.Color().setHSL(hue / 360, 1.0, 0.6);
                
            case 'intensity':
                // Gradiente de intensidad
                return new THREE.Color().lerpColors(
                    new THREE.Color(0x000080), // Azul oscuro
                    new THREE.Color(0xff0000), // Rojo
                    normalizedPosition
                );
                
            case 'musical':
                // Colores musicales por registro
                if (normalizedPosition < 0.2) return new THREE.Color(0x4a90e2); // Graves
                if (normalizedPosition < 0.4) return new THREE.Color(0x87ceeb); // Graves-medios
                if (normalizedPosition < 0.6) return new THREE.Color(0xffffff); // Medios
                if (normalizedPosition < 0.8) return new THREE.Color(0xffd700); // Agudos
                return new THREE.Color(0xff6347); // Muy agudos
                
            default:
                return new THREE.Color(0x00ff88);
        }
    }
    
    /**
     * Obtener frecuencia correspondiente a una barra
     */
    getFrequencyForBar(barIndex) {
        const normalizedIndex = barIndex / this.config.barCount;
        
        if (this.config.logarithmicScale) {
            // Escala logarítmica (más natural para audio)
            const logMin = Math.log(this.config.minFrequency);
            const logMax = Math.log(this.config.maxFrequency);
            return Math.exp(logMin + normalizedIndex * (logMax - logMin));
        } else {
            // Escala lineal
            return this.config.minFrequency + 
                   normalizedIndex * (this.config.maxFrequency - this.config.minFrequency);
        }
    }
    
    /**
     * Configurar grid de referencia
     */
    setupGrid() {
        if (!this.config.showGrid) return;
        
        // Grid base
        const gridHelper = new THREE.GridHelper(200, 20, 0x1a1a2e, 0x1a1a2e);
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        this.gridGroup.add(gridHelper);
        
        // Ejes de coordenadas
        const axesHelper = new THREE.AxesHelper(50);
        this.gridGroup.add(axesHelper);
        
        console.log('📐 Grid de referencia configurado');
    }
    
    /**
     * Configurar controles de cámara
     */
    setupControls() {
        // Controles básicos con mouse
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.state.mouseInteracting = true;
            this.state.autoRotate = false;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            this.spectrumGroup.rotation.y += deltaX * 0.01;
            this.spectrumGroup.rotation.x += deltaY * 0.01;
            
            // Limitar rotación X
            this.spectrumGroup.rotation.x = Math.max(
                -Math.PI/2, 
                Math.min(Math.PI/2, this.spectrumGroup.rotation.x)
            );
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
            setTimeout(() => {
                this.state.mouseInteracting = false;
                this.state.autoRotate = true;
            }, 2000);
        });
        
        // Zoom con rueda
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoom = e.deltaY * 0.01;
            this.camera.position.multiplyScalar(1 + zoom * 0.1);
            
            // Limitar zoom
            const distance = this.camera.position.length();
            if (distance < 50) this.camera.position.normalize().multiplyScalar(50);
            if (distance > 500) this.camera.position.normalize().multiplyScalar(500);
        });
        
        console.log('🎮 Controles configurados');
    }
    
    /**
     * 4.10 Iniciar loop de animación
     */
    startAnimation() {
        if (this.state.isAnimating) return;
        
        this.state.isAnimating = true;
        this.animate();
        
        console.log('🎬 Animación de espectro iniciada');
    }
    
    /**
     * Loop principal de animación
     */
    animate() {
        if (!this.state.isAnimating) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.state.currentTime += 0.016; // ~60fps
        
        // Auto-rotación
        if (this.state.autoRotate && !this.state.mouseInteracting) {
            this.spectrumGroup.rotation.y += this.config.rotationSpeed;
        }
        
        // Actualizar análisis de audio
        this.updateAudioAnalysis();
        
        // Actualizar barras del espectro
        this.updateSpectrumBars();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * 4.11 Actualizar análisis de audio en tiempo real
     */
    updateAudioAnalysis() {
        if (!this.analyser || !this.dataArray) return;
        
        // Obtener datos de frecuencia
        this.analyser.getByteFrequencyData(this.dataArray);
        this.analyser.getFloatFrequencyData(this.frequencyData);
        
        // Calcular estadísticas globales
        let totalAmplitude = 0;
        let maxAmplitude = 0;
        let dominantFreqIndex = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            const amplitude = this.dataArray[i] / 255;
            totalAmplitude += amplitude;
            
            if (amplitude > maxAmplitude) {
                maxAmplitude = amplitude;
                dominantFreqIndex = i;
            }
        }
        
        // Actualizar estado global
        this.state.averageAmplitude = totalAmplitude / this.dataArray.length;
        this.state.dominantFrequency = (dominantFreqIndex / this.dataArray.length) * 
                                      (this.audioContext.sampleRate / 2);
        
        // Mapear datos FFT a barras del espectro
        this.mapFFTToBars();
    }
    
    /**
     * Mapear datos FFT a barras del espectro
     */
    mapFFTToBars() {
        const nyquistFreq = this.audioContext.sampleRate / 2;
        const frequencyResolution = nyquistFreq / this.dataArray.length;
        
        for (let i = 0; i < this.bars.length; i++) {
            const bar = this.bars[i];
            const targetFreq = bar.frequency;
            
            // Encontrar bin FFT más cercano
            const binIndex = Math.round(targetFreq / frequencyResolution);
            const clampedIndex = Math.max(0, Math.min(this.dataArray.length - 1, binIndex));
            
            // Obtener amplitud normalizada
            const rawAmplitude = this.dataArray[clampedIndex] / 255;
            
            // Aplicar suavizado temporal
            const smoothingFactor = 0.8;
            bar.smoothedAmplitude = bar.smoothedAmplitude * smoothingFactor + 
                                   rawAmplitude * (1 - smoothingFactor);
            
            // Actualizar peak hold
            if (rawAmplitude > bar.peakAmplitude) {
                bar.peakAmplitude = rawAmplitude;
            } else {
                bar.peakAmplitude *= 0.99; // Decay lento
            }
            
            bar.amplitude = bar.smoothedAmplitude;
        }
    }
    
    /**
     * 4.12 Actualizar barras del espectro 3D
     */
    updateSpectrumBars() {
        for (let i = 0; i < this.bars.length; i++) {
            const bar = this.bars[i];
            const mesh = bar.mesh;
            const material = bar.material;
            
            // Calcular altura de barra
            const targetHeight = Math.max(0.1, bar.amplitude * this.config.maxHeight);
            
            // Suavizar cambios de escala
            const currentHeight = mesh.scale.y;
            const newHeight = currentHeight * 0.8 + targetHeight * 0.2;
            
            // Aplicar escala
            mesh.scale.y = newHeight;
            mesh.position.y = newHeight / 2; // Centrar en base
            
            // Actualizar color según intensidad
            if (this.config.colorMode === 'intensity') {
                const intensity = Math.min(1.0, bar.amplitude * 2);
                const color = new THREE.Color().lerpColors(
                    new THREE.Color(0x000080), // Azul base
                    new THREE.Color(0xff0000), // Rojo intenso
                    intensity
                );
                material.color.copy(color);
                material.emissive.copy(color).multiplyScalar(intensity * 0.2);
            }
            
            // Efecto de transparencia según amplitud
            material.opacity = 0.6 + (bar.amplitude * 0.4);
        }
    }
    
    /**
     * Limpiar barras existentes
     */
    clearBars() {
        this.barMeshes.forEach(mesh => {
            this.spectrumGroup.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        
        this.bars = [];
        this.barMeshes = [];
        this.barMaterials = [];
    }
    
    /**
     * Cambiar modo de color
     */
    setColorMode(mode) {
        if (!['spectrum', 'intensity', 'musical'].includes(mode)) {
            console.warn('⚠️ Modo de color inválido:', mode);
            return;
        }
        
        this.config.colorMode = mode;
        
        // Actualizar colores de barras
        for (let i = 0; i < this.bars.length; i++) {
            const normalizedPos = i / this.bars.length;
            const newColor = this.getSpectrumColor(normalizedPos);
            this.bars[i].material.color.copy(newColor);
        }
        
        console.log('🎨 Modo de color cambiado a:', mode);
    }
    
    /**
     * Toggle auto-rotación
     */
    toggleAutoRotate() {
        this.state.autoRotate = !this.state.autoRotate;
        console.log('🔄 Auto-rotación:', this.state.autoRotate ? 'ON' : 'OFF');
        return this.state.autoRotate;
    }
    
    /**
     * Configurar número de barras
     */
    setBarCount(count) {
        const newCount = Math.max(16, Math.min(128, count));
        if (newCount !== this.config.barCount) {
            this.config.barCount = newCount;
            this.createSpectrumBars();
            console.log('📊 Número de barras actualizado:', newCount);
        }
    }
    
    /**
     * Detener animación
     */
    stopAnimation() {
        this.state.isAnimating = false;
        console.log('⏸️ Animación de espectro detenida');
    }
    
    /**
     * Test de funcionalidad
     */
    async testSpectrum3D() {
        console.log('🧪 Testing Spectrum3D Renderer...');
        
        const results = {
            initialization: this.state.isInitialized,
            animation: this.state.isAnimating,
            audioAnalysis: !!this.analyser,
            bars: this.bars.length > 0,
            rendering: !!this.renderer
        };
        
        // Test cambio de modo de color
        setTimeout(() => {
            this.setColorMode('intensity');
        }, 2000);
        
        setTimeout(() => {
            this.setColorMode('musical');
        }, 4000);
        
        setTimeout(() => {
            this.setColorMode('spectrum');
        }, 6000);
        
        console.log('📊 Spectrum3D Test Results:', results);
        return results;
    }
    
    /**
     * Obtener estadísticas
     */
    getStats() {
        return {
            isInitialized: this.state.isInitialized,
            isAnimating: this.state.isAnimating,
            barCount: this.bars.length,
            averageAmplitude: this.state.averageAmplitude.toFixed(3),
            dominantFrequency: Math.round(this.state.dominantFrequency),
            colorMode: this.config.colorMode,
            autoRotate: this.state.autoRotate,
            fftSize: this.config.fftSize,
            audioAnalysisEnabled: !!this.analyser
        };
    }
    
    /**
     * Redimensionar canvas
     */
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        console.log('📐 Spectrum3D redimensionado:', width, 'x', height);
    }
    
    /**
     * Destruir renderer
     */
    destroy() {
        console.log('🛑 Destruyendo Spectrum3D Renderer...');
        
        this.stopAnimation();
        this.clearBars();
        
        // Limpiar Three.js
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Limpiar referencias
        this.analyser = null;
        this.dataArray = null;
        this.audioContext = null;
        
        console.log('✅ Spectrum3D Renderer destruido');
    }
}

// Exponer clase globalmente
window.Spectrum3DRenderer = Spectrum3DRenderer;