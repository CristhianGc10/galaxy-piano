/**
 * GALAXY PIANO - GALAXY RENDERER
 * Visualización 3D completa con Three.js
 * Sprint 2 - Galaxia Base CORREGIDO
 */

class GalaxyRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.container = canvasElement.parentElement;
        
        // Configuración 3D
        this.config = {
            fov: 75,
            near: 0.1,
            far: 2000,
            cameraDistance: 200,
            galaxyRadius: 150,
            autoRotate: true,
            rotationSpeed: 0.001,
            starSize: 2.0,
            backgroundStars: 800
        };
        
        // Objetos Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Grupos de objetos
        this.starGroup = null;
        this.backgroundStarGroup = null;
        this.galaxyGroup = null;
        
        // Estado
        this.state = {
            isInitialized: false,
            isAnimating: false,
            currentTime: 0,
            cameraAutoRotate: true,
            mouseInteracting: false
        };
        
        // Referencias para cleanup
        this.animationId = null;
        this.resizeListener = null;
        
        console.log('🌌 GalaxyRenderer constructor - Preparando Three.js');
    }
    
    /**
     * Inicializar renderer 3D completo
     */
    async init() {
        try {
            console.log('🚀 Inicializando Galaxy Renderer...');
            
            // 1. Verificar Three.js
            this.checkThreeJS();
            
            // 2. Configurar escena 3D
            this.setupScene();
            
            // 3. Configurar cámara
            this.setupCamera();
            
            // 4. Configurar renderer
            this.setupRenderer();
            
            // 5. Configurar luces
            this.setupLights();
            
            // 6. Crear fondo galáctico
            this.createBackground();
            
            // 7. Configurar controles
            this.setupControls();
            
            // 8. Configurar eventos
            this.setupEvents();
            
            // 9. Iniciar loop de animación
            this.startAnimation();
            
            this.state.isInitialized = true;
            console.log('✅ Galaxy Renderer inicializado correctamente');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error inicializando Galaxy Renderer:', error);
            throw new Error(`Fallo de inicialización 3D: ${error.message}`);
        }
    }
    
    /**
     * Verificar disponibilidad de Three.js
     */
    checkThreeJS() {
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js no está cargado. Verificar CDN.');
        }
        
        // Verificar características necesarias
        const requiredClasses = ['Scene', 'PerspectiveCamera', 'WebGLRenderer', 'SphereGeometry', 'MeshBasicMaterial'];
        
        for (const className of requiredClasses) {
            if (!THREE[className]) {
                throw new Error(`Three.js incompleto: ${className} no disponible`);
            }
        }
        
        console.log('✅ Three.js verificado:', THREE.REVISION);
    }
    
    /**
     * Configurar escena 3D
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f); // Space black
        
        // Fog para efecto de profundidad
        this.scene.fog = new THREE.Fog(0x0a0a0f, 100, 1000);
        
        // Grupos principales
        this.galaxyGroup = new THREE.Group();
        this.starGroup = new THREE.Group();
        this.backgroundStarGroup = new THREE.Group();
        
        this.scene.add(this.galaxyGroup);
        this.galaxyGroup.add(this.starGroup);
        this.scene.add(this.backgroundStarGroup);
        
        console.log('🌌 Escena 3D configurada');
    }
    
    /**
     * Configurar cámara perspectiva
     */
    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(
            this.config.fov,
            aspect,
            this.config.near,
            this.config.far
        );
        
        // Posición inicial de la cámara
        this.camera.position.set(0, 50, this.config.cameraDistance);
        this.camera.lookAt(0, 0, 0);
        
        console.log('📷 Cámara configurada:', {
            fov: this.config.fov,
            aspect: aspect.toFixed(2),
            position: this.camera.position
        });
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
        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Configuraciones avanzadas
        this.renderer.shadowMap.enabled = false; // Por rendimiento
        
        console.log('🖥️ Renderer WebGL configurado');
    }
    
    /**
     * Configurar sistema de luces
     */
    setupLights() {
        // Luz ambiental suave
        const ambientLight = new THREE.AmbientLight(0x404080, 0.3);
        this.scene.add(ambientLight);
        
        // Luz direccional principal (simula estrella lejana)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        this.scene.add(directionalLight);
        
        // Luz puntual central (núcleo galáctico)
        const pointLight = new THREE.PointLight(0x00ff88, 0.5, 300);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
        
        console.log('💡 Sistema de luces configurado');
    }
    
    /**
     * Crear fondo galáctico con estrellas
     */
    createBackground() {
        // Crear geometría para estrellas de fondo
        const starGeometry = new THREE.BufferGeometry();
        const starCount = this.config.backgroundStars;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Posición aleatoria en esfera
            const radius = 800 + Math.random() * 400;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Color aleatorio de estrella
            const starColors = [
                [1, 1, 1],      // Blanco
                [0.8, 0.8, 1],  // Azul claro
                [1, 1, 0.8],    // Amarillo claro
                [1, 0.8, 0.6]   // Naranja claro
            ];
            const colorChoice = starColors[Math.floor(Math.random() * starColors.length)];
            
            colors[i3] = colorChoice[0];
            colors[i3 + 1] = colorChoice[1];
            colors[i3 + 2] = colorChoice[2];
            
            // Tamaño aleatorio
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Material para estrellas de fondo
        const starMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        const backgroundStars = new THREE.Points(starGeometry, starMaterial);
        this.backgroundStarGroup.add(backgroundStars);
        
        console.log('⭐ Fondo galáctico creado:', starCount, 'estrellas');
    }
    
    /**
     * Configurar controles de cámara (básicos)
     */
    setupControls() {
        // Controles básicos con mouse
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.state.mouseInteracting = true;
            this.state.cameraAutoRotate = false;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            this.galaxyGroup.rotation.y += deltaX * 0.005;
            this.galaxyGroup.rotation.x += deltaY * 0.005;
            
            // Limitar rotación X
            this.galaxyGroup.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.galaxyGroup.rotation.x));
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
            setTimeout(() => {
                this.state.mouseInteracting = false;
                this.state.cameraAutoRotate = this.config.autoRotate;
            }, 2000);
        });
        
        // Zoom con rueda del mouse
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoom = e.deltaY * 0.01;
            this.camera.position.multiplyScalar(1 + zoom * 0.1);
            
            // Limitar zoom
            const distance = this.camera.position.length();
            if (distance < 50) this.camera.position.normalize().multiplyScalar(50);
            if (distance > 500) this.camera.position.normalize().multiplyScalar(500);
        });
        
        console.log('🎮 Controles de cámara configurados');
    }
    
    /**
     * Configurar eventos de ventana
     */
    setupEvents() {
        this.resizeListener = () => this.handleResize();
        window.addEventListener('resize', this.resizeListener);
        
        console.log('📡 Eventos configurados');
    }
    
    /**
     * Manejar redimensionamiento
     */
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        console.log('📐 Renderer redimensionado:', width, 'x', height);
    }
    
    /**
     * Iniciar loop de animación
     */
    startAnimation() {
        if (this.state.isAnimating) return;
        
        this.state.isAnimating = true;
        this.animate();
        
        console.log('🎬 Loop de animación iniciado');
    }
    
    /**
     * Loop principal de animación
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.state.currentTime += 0.016; // ~60fps
        
        // Auto-rotación de la galaxia
        if (this.state.cameraAutoRotate && this.config.autoRotate && !this.state.mouseInteracting) {
            this.galaxyGroup.rotation.y += this.config.rotationSpeed;
        }
        
        // Animación de estrellas de fondo (twinkle)
        if (this.backgroundStarGroup.children.length > 0) {
            const backgroundStars = this.backgroundStarGroup.children[0];
            if (backgroundStars.material) {
                backgroundStars.material.opacity = 0.6 + Math.sin(this.state.currentTime * 2) * 0.2;
            }
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Detener animación
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.state.isAnimating = false;
        console.log('⏸️ Animación detenida');
    }
    
    /**
     * Obtener información del renderer
     */
    getInfo() {
        if (!this.renderer) return null;
        
        return {
            isInitialized: this.state.isInitialized,
            isAnimating: this.state.isAnimating,
            triangles: this.renderer.info.render.triangles,
            calls: this.renderer.info.render.calls,
            points: this.renderer.info.render.points,
            memory: {
                geometries: this.renderer.info.memory.geometries,
                textures: this.renderer.info.memory.textures
            },
            backgroundStars: this.config.backgroundStars,
            cameraDistance: this.camera?.position.length().toFixed(1),
            autoRotate: this.state.cameraAutoRotate
        };
    }
    
    /**
     * Toggle auto-rotación
     */
    toggleAutoRotate() {
        this.config.autoRotate = !this.config.autoRotate;
        this.state.cameraAutoRotate = this.config.autoRotate;
        
        console.log('🔄 Auto-rotación:', this.config.autoRotate ? 'ON' : 'OFF');
        return this.config.autoRotate;
    }
    
    /**
     * Resetear cámara a posición inicial
     */
    resetCamera() {
        this.camera.position.set(0, 50, this.config.cameraDistance);
        this.camera.lookAt(0, 0, 0);
        this.galaxyGroup.rotation.set(0, 0, 0);
        
        console.log('📷 Cámara reseteada');
    }
    
    /**
     * Limpiar y destruir renderer
     */
    destroy() {
        console.log('🛑 Destruyendo Galaxy Renderer...');
        
        // Detener animación
        this.stopAnimation();
        
        // Remover event listeners
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
        }
        
        // Limpiar geometrías y materiales
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        // Limpiar renderer
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
        
        // Limpiar referencias
        this.scene = null;
        this.camera = null;
        this.starGroup = null;
        this.backgroundStarGroup = null;
        this.galaxyGroup = null;
        
        this.state.isInitialized = false;
        
        console.log('✅ Galaxy Renderer destruido');
    }
}

// Exponer clase globalmente
window.GalaxyRenderer = GalaxyRenderer;
console.log('✅ GalaxyRenderer exportado correctamente');