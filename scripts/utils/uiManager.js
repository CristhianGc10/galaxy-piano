/**
 * GALAXY PIANO - UI MANAGER COMPLETO
 * Sistema avanzado de gestión de interfaz y experiencia de usuario
 * Sprint 5 - v1.0 Release Final
 */

class UIManager {
    constructor() {
        this.notifications = [];
        this.loadingStates = new Map();
        this.performanceData = {
            fps: 60,
            memory: 0,
            loadTime: 0,
            audioLatency: 0
        };
        
        this.config = {
            toastDuration: 4000,
            loadingMinDuration: 500,
            performanceInterval: 1000,
            errorRetryLimit: 3,
            maxNotifications: 5
        };
        
        // Handlers para event listeners
        this.keydownHandler = this.handleKeydown.bind(this);
        this.errorHandler = this.handleGlobalError.bind(this);
        this.rejectionHandler = this.handleUnhandledRejection.bind(this);
        
        // ID de sesión único
        this.sessionId = null;
        
        console.log('🎨 UIManager constructor inicializado');
        this.init();
    }
    
    /**
     * Inicializar sistema de UI
     */
    init() {
        this.createToastContainer();
        this.createLoadingScreen();
        this.createErrorBoundary();
        this.createPerformanceMonitor();
        this.createStatusIndicators();
        this.setupGlobalErrorHandling();
        this.setupKeyboardShortcuts();
        
        console.log('✅ UIManager inicializado correctamente');
    }
    
    /**
     * ========================================
     * SISTEMA DE NOTIFICACIONES TOAST
     * ========================================
     */
    
    createToastContainer() {
        if (document.getElementById('toast-container')) return;
        
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toast-container';
        container.innerHTML = ''; // Asegurar que esté vacío
        document.body.appendChild(container);
        
        // Añadir estilos si no existen
        this.addToastStyles();
    }
    
    addToastStyles() {
        if (document.getElementById('toast-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            }
            
            .toast {
                padding: 12px 16px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                backdrop-filter: blur(10px);
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
                max-width: 350px;
                position: relative;
                overflow: hidden;
                pointer-events: auto;
            }
            
            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .toast.success {
                background: linear-gradient(45deg, rgba(76, 175, 80, 0.9), rgba(139, 195, 74, 0.9));
                border: 1px solid #4caf50;
            }
            
            .toast.error {
                background: linear-gradient(45deg, rgba(244, 67, 54, 0.9), rgba(255, 87, 34, 0.9));
                border: 1px solid #f44336;
            }
            
            .toast.info {
                background: linear-gradient(45deg, rgba(33, 150, 243, 0.9), rgba(3, 169, 244, 0.9));
                border: 1px solid #2196f3;
            }
            
            .toast.warning {
                background: linear-gradient(45deg, rgba(255, 152, 0, 0.9), rgba(255, 193, 7, 0.9));
                border: 1px solid #ff9800;
            }
            
            .toast-close {
                position: absolute;
                top: 5px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .toast-close:hover {
                opacity: 1;
            }
            
            @media (max-width: 768px) {
                .toast-container {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                }
                .toast {
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    showNotification(message, type = 'info', duration = null) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.removeToast(toast);
        closeBtn.setAttribute('aria-label', 'Cerrar notificación');
        
        const messageDiv = document.createElement('div');
        messageDiv.style.paddingRight = '25px';
        messageDiv.innerHTML = `${this.getNotificationIcon(type)} ${message}`;
        
        toast.appendChild(messageDiv);
        toast.appendChild(closeBtn);
        
        const container = document.getElementById('toast-container');
        if (!container) {
            this.createToastContainer();
            return this.showNotification(message, type, duration);
        }
        
        container.appendChild(toast);
        
        // Animación de entrada
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Auto-remove
        const timeoutDuration = duration || this.config.toastDuration;
        setTimeout(() => this.removeToast(toast), timeoutDuration);
        
        this.notifications.push({
            element: toast,
            message,
            type,
            timestamp: Date.now()
        });
        
        // Límite de notificaciones
        if (this.notifications.length > this.config.maxNotifications) {
            this.removeToast(this.notifications[0].element);
        }
        
        return toast;
    }
    
    removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.notifications = this.notifications.filter(n => n.element !== toast);
        }, 400);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    /**
     * ========================================
     * SISTEMA DE CARGA
     * ========================================
     */
    
    createLoadingScreen() {
        if (document.getElementById('app-loading')) return;
        
        const loadingScreen = document.createElement('div');
        loadingScreen.className = 'app-loading';
        loadingScreen.id = 'app-loading';
        loadingScreen.innerHTML = `
            <div class="loading-logo">🌌 Galaxy Piano</div>
            <div class="loading-progress">
                <div class="loading-progress-fill" id="loading-progress-fill"></div>
            </div>
            <div class="loading-text" id="loading-text">Iniciando universe musical...</div>
        `;
        
        // Remover loading fallback si existe
        const fallbackLoading = document.getElementById('fallback-loading');
        if (fallbackLoading) {
            fallbackLoading.remove();
        }
        
        document.body.appendChild(loadingScreen);
        this.addLoadingStyles();
    }
    
    addLoadingStyles() {
        if (document.getElementById('loading-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            .app-loading {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                transition: opacity 0.8s ease-out, visibility 0.8s ease-out;
            }
            
            .app-loading.hidden {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
            }
            
            .loading-logo {
                font-size: 3rem;
                margin-bottom: 2rem;
                background: linear-gradient(45deg, #00ff88, #ff0080, #ff8800);
                background-size: 200% 200%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradientShift 3s ease-in-out infinite;
                text-align: center;
            }
            
            @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            
            .loading-progress {
                width: 300px;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
                overflow: hidden;
                margin-bottom: 1rem;
            }
            
            .loading-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #00ff88, #ff8800);
                border-radius: 2px;
                width: 0%;
                transition: width 0.5s ease;
            }
            
            .loading-text {
                color: #888;
                font-family: monospace;
                font-size: 0.9rem;
                text-align: center;
            }
            
            @media (max-width: 768px) {
                .loading-logo {
                    font-size: 2rem;
                }
                .loading-progress {
                    width: 250px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    updateLoadingProgress(percentage, text) {
        const fill = document.getElementById('loading-progress-fill');
        const textEl = document.getElementById('loading-text');
        
        if (fill) {
            fill.style.width = Math.min(100, Math.max(0, percentage)) + '%';
        }
        
        if (textEl && text) {
            textEl.textContent = text;
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('app-loading');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 800);
        }
        
        // Mostrar app
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'block';
        }
    }
    
    /**
     * ========================================
     * ESTADOS DE CARGA DE ELEMENTOS
     * ========================================
     */
    
    setLoadingState(key, isLoading, minDuration = null) {
        const duration = minDuration || this.config.loadingMinDuration;
        
        if (isLoading) {
            this.loadingStates.set(key, {
                startTime: Date.now(),
                minDuration: duration
            });
            this.updateLoadingUI(key, true);
        } else {
            const loadingState = this.loadingStates.get(key);
            if (loadingState) {
                const elapsed = Date.now() - loadingState.startTime;
                const remaining = Math.max(0, loadingState.minDuration - elapsed);
                
                setTimeout(() => {
                    this.loadingStates.delete(key);
                    this.updateLoadingUI(key, false);
                }, remaining);
            } else {
                this.updateLoadingUI(key, false);
            }
        }
    }
    
    updateLoadingUI(key, isLoading) {
        const element = document.querySelector(`[data-loading="${key}"]`);
        if (element) {
            element.classList.toggle('loading-state', isLoading);
            
            if (isLoading) {
                element.disabled = true;
                element.style.position = 'relative';
                if (!element.querySelector('.loading-spinner')) {
                    const spinner = document.createElement('div');
                    spinner.className = 'loading-spinner';
                    spinner.innerHTML = '⟳';
                    spinner.style.cssText = `
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        animation: spin 1s linear infinite;
                        color: #00ff88;
                    `;
                    element.appendChild(spinner);
                }
            } else {
                element.disabled = false;
                const spinner = element.querySelector('.loading-spinner');
                if (spinner) {
                    spinner.remove();
                }
            }
        }
        
        // Añadir CSS de spinner si no existe
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                @keyframes spin {
                    from { transform: translateY(-50%) rotate(0deg); }
                    to { transform: translateY(-50%) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * ========================================
     * MANEJO DE ERRORES
     * ========================================
     */
    
    createErrorBoundary() {
        // Los handlers se configuran en setupGlobalErrorHandling
    }
    
    setupGlobalErrorHandling() {
        window.addEventListener('error', this.errorHandler);
        window.addEventListener('unhandledrejection', this.rejectionHandler);
    }
    
    handleGlobalError(event) {
        const error = event.error || event;
        console.error('🚨 Error global capturado:', error);
        
        const errorInfo = {
            message: error.message || error.toString(),
            filename: event.filename || '',
            lineno: event.lineno || 0,
            stack: error.stack || '',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.storeErrorForDebugging(errorInfo);
        this.showErrorNotification(error);
    }
    
    handleUnhandledRejection(event) {
        console.error('🚨 Promise rejection:', event.reason);
        this.handleGlobalError({ error: event.reason });
    }
    
    showErrorNotification(error) {
        const message = error.message || error.toString() || 'Error desconocido';
        this.showNotification(`Error: ${message}`, 'error', 6000);
    }
    
    storeErrorForDebugging(errorInfo) {
        try {
            const errors = JSON.parse(localStorage.getItem('galaxy-piano-errors') || '[]');
            errors.push(errorInfo);
            
            if (errors.length > 10) {
                errors.splice(0, errors.length - 10);
            }
            
            localStorage.setItem('galaxy-piano-errors', JSON.stringify(errors));
        } catch (e) {
            console.warn('No se pudo almacenar error:', e);
        }
    }
    
    /**
     * ========================================
     * MONITOR DE RENDIMIENTO
     * ========================================
     */
    
    createPerformanceMonitor() {
        if (this.isDevelopmentMode()) {
            this.createPerformanceIndicator();
            this.startPerformanceMonitoring();
        }
    }
    
    createPerformanceIndicator() {
        if (document.getElementById('performance-indicator')) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'performance-indicator';
        indicator.id = 'performance-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            padding: 5px 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff88;
            font-family: monospace;
            font-size: 11px;
            border-radius: 4px;
            z-index: 9998;
            display: none;
        `;
        document.body.appendChild(indicator);
    }
    
    startPerformanceMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const updatePerformance = () => {
            const now = performance.now();
            frameCount++;
            
            if (now - lastTime >= 1000) {
                this.performanceData.fps = Math.round((frameCount * 1000) / (now - lastTime));
                frameCount = 0;
                lastTime = now;
                
                if (performance.memory) {
                    this.performanceData.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                }
                
                this.updatePerformanceDisplay();
            }
            
            if (this.isDevelopmentMode()) {
                requestAnimationFrame(updatePerformance);
            }
        };
        
        updatePerformance();
    }
    
    updatePerformanceDisplay() {
        const indicator = document.getElementById('performance-indicator');
        if (indicator) {
            indicator.innerHTML = `
                FPS: ${this.performanceData.fps} | 
                RAM: ${this.performanceData.memory}MB | 
                Audio: ${this.performanceData.audioLatency}ms
            `;
            indicator.style.display = 'block';
        }
    }
    
    /**
     * ========================================
     * INDICADORES DE ESTADO
     * ========================================
     */
    
    createStatusIndicators() {
        if (document.getElementById('app-status')) return;
        
        const statusContainer = document.createElement('div');
        statusContainer.className = 'app-status';
        statusContainer.id = 'app-status';
        statusContainer.innerHTML = `
            <div class="status-indicator" id="status-audio" title="Audio Engine"></div>
            <div class="status-indicator" id="status-galaxy" title="Galaxy Renderer"></div>
            <div class="status-indicator" id="status-composer" title="Compositor"></div>
            <div class="status-indicator" id="status-analysis" title="Análisis"></div>
        `;
        
        statusContainer.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            display: flex;
            gap: 5px;
            z-index: 9998;
        `;
        
        this.addStatusStyles();
        document.body.appendChild(statusContainer);
    }
    
    addStatusStyles() {
        if (document.getElementById('status-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'status-styles';
        style.textContent = `
            .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #666;
                transition: background-color 0.3s ease;
            }
            
            .status-indicator.active {
                background: #00ff88;
                box-shadow: 0 0 10px #00ff88;
            }
            
            .status-indicator.error {
                background: #f44336;
                box-shadow: 0 0 10px #f44336;
            }
            
            .status-indicator.warning {
                background: #ff9800;
                box-shadow: 0 0 10px #ff9800;
            }
        `;
        document.head.appendChild(style);
    }
    
    updateModuleStatus(module, status) {
        const indicator = document.getElementById(`status-${module}`);
        if (indicator) {
            indicator.className = `status-indicator ${status}`;
        }
    }
    
    /**
     * ========================================
     * ATAJOS DE TECLADO
     * ========================================
     */
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', this.keydownHandler);
    }
    
    handleKeydown(e) {
        // Ctrl/Cmd + teclas
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.triggerSave();
                    break;
                case 'n':
                    e.preventDefault();
                    this.triggerNewProject();
                    break;
                case 'e':
                    e.preventDefault();
                    this.triggerExport();
                    break;
                case '1':
                    e.preventDefault();
                    this.switchMode('live');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchMode('composer');
                    break;
                case '3':
                    e.preventDefault();
                    this.switchMode('analysis');
                    break;
            }
        }
        
        // Tecla Escape
        if (e.key === 'Escape') {
            this.closeAllOverlays();
        }
        
        // Barra espaciadora para play/pause
        if (e.key === ' ' && !this.isInputFocused()) {
            e.preventDefault();
            this.triggerPlayPause();
        }
    }
    
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }
    
    closeAllOverlays() {
        const overlays = document.querySelectorAll('.overlay.active, .modal:not(.hidden)');
        overlays.forEach(overlay => {
            if (overlay.classList.contains('modal')) {
                overlay.classList.add('hidden');
            } else {
                overlay.classList.remove('active');
            }
        });
    }
    
    /**
     * ========================================
     * CALLBACKS PARA ATAJOS
     * ========================================
     */
    
    triggerSave() {
        if (window.galaxyPiano && window.galaxyPiano.projectManager) {
            window.galaxyPiano.saveCurrentProject();
            this.showNotification('Proyecto guardado', 'success', 2000);
        }
    }
    
    triggerNewProject() {
        if (window.galaxyPiano && window.galaxyPiano.projectManager) {
            window.galaxyPiano.createNewProject();
            this.showNotification('Nuevo proyecto creado', 'success', 2000);
        }
    }
    
    triggerExport() {
        if (window.galaxyPiano && window.galaxyPiano.currentMode === 'analysis') {
            window.galaxyPiano.exportToJSON();
        }
    }
    
    switchMode(mode) {
        if (window.galaxyPiano) {
            window.galaxyPiano.switchMode(mode);
        }
    }
    
    triggerPlayPause() {
        if (window.galaxyPiano) {
            const currentMode = window.galaxyPiano.currentMode;
            if (currentMode === 'live') {
                window.galaxyPiano.playNotes();
            } else if (currentMode === 'composer') {
                if (window.galaxyPiano.state.isPlaying) {
                    window.galaxyPiano.stopComposerSequence();
                } else {
                    window.galaxyPiano.playComposerSequence();
                }
            }
        }
    }
    
    /**
     * ========================================
     * ANIMACIONES Y TRANSICIONES
     * ========================================
     */
    
    animateElement(element, animation, duration = 600) {
        return new Promise((resolve) => {
            element.style.animationDuration = duration + 'ms';
            element.classList.add(animation);
            
            setTimeout(() => {
                element.classList.remove(animation);
                resolve();
            }, duration);
        });
    }
    
    async animateModeTransition(fromMode, toMode) {
        const fromSection = document.getElementById(`${fromMode}-mode`);
        const toSection = document.getElementById(`${toMode}-mode`);
        
        if (fromSection) {
            fromSection.style.opacity = '0';
            setTimeout(() => fromSection.classList.remove('active'), 150);
        }
        
        if (toSection) {
            toSection.classList.add('active');
            toSection.style.opacity = '0';
            setTimeout(() => toSection.style.opacity = '1', 50);
        }
    }
    
    /**
     * ========================================
     * MÉTRICAS Y ANALYTICS
     * ========================================
     */
    
    trackUserAction(action, data = {}) {
        const event = {
            action,
            data,
            timestamp: Date.now(),
            mode: window.galaxyPiano?.currentMode || 'unknown',
            sessionId: this.getSessionId()
        };
        
        if (this.isDevelopmentMode()) {
            console.log('📊 User Action:', event);
        }
        
        this.storeMetric(event);
    }
    
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }
    
    storeMetric(event) {
        try {
            const metrics = JSON.parse(localStorage.getItem('galaxy-piano-metrics') || '[]');
            metrics.push(event);
            
            if (metrics.length > 100) {
                metrics.splice(0, metrics.length - 100);
            }
            
            localStorage.setItem('galaxy-piano-metrics', JSON.stringify(metrics));
        } catch (e) {
            console.warn('No se pudo almacenar métrica:', e);
        }
    }
    
    /**
     * ========================================
     * UTILIDADES
     * ========================================
     */
    
    isDevelopmentMode() {
        return window.location.hostname === 'localhost' || 
               window.location.search.includes('debug') ||
               window.location.hash.includes('dev') ||
               window.location.search.includes('test');
    }
    
    /**
     * ========================================
     * DESTRUCTOR
     * ========================================
     */
    
    destroy() {
        // Remover event listeners
        document.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('error', this.errorHandler);
        window.removeEventListener('unhandledrejection', this.rejectionHandler);
        
        // Limpiar notificaciones
        this.notifications.forEach(notification => {
            this.removeToast(notification.element);
        });
        
        // Limpiar elementos creados
        const elementsToRemove = [
            'toast-container',
            'app-loading',
            'performance-indicator',
            'app-status'
        ];
        
        elementsToRemove.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
        });
        
        console.log('🧹 UIManager destruido');
    }
}

// Exponer globalmente
window.UIManager = UIManager;