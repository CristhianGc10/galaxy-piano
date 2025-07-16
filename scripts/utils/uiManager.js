/**
 * GALAXY PIANO - UI MANAGER
 * Sistema avanzado de gestión de interfaz y experiencia de usuario
 * Sprint 5 - Pulimiento Final
 */

class UIManager {
    constructor() {
        this.notifications = [];
        this.loadingStates = new Map();
        this.performanceMonitor = null;
        this.errorBoundary = null;
        
        this.config = {
            toastDuration: 4000,
            loadingMinDuration: 500,
            performanceInterval: 1000,
            errorRetryLimit: 3
        };
        
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
        
        console.log('🎨 UIManager inicializado');
    }
    
    /**
     * Sistema de notificaciones toast
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info', duration = null) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.removeToast(toast);
        
        toast.innerHTML = `
            <div style="padding-right: 20px;">
                ${this.getNotificationIcon(type)} ${message}
            </div>
        `;
        toast.appendChild(closeBtn);
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        // Animación de entrada
        setTimeout(() => toast.classList.add('show'), 10);
        
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
        if (this.notifications.length > 5) {
            this.removeToast(this.notifications[0].element);
        }
    }
    
    /**
     * Remover toast
     */
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
    
    /**
     * Iconos para notificaciones
     */
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
     * Pantalla de carga mejorada
     */
    createLoadingScreen() {
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
        
        document.body.appendChild(loadingScreen);
    }
    
    /**
     * Actualizar progreso de carga
     */
    updateLoadingProgress(percentage, text) {
        const fill = document.getElementById('loading-progress-fill');
        const textEl = document.getElementById('loading-text');
        
        if (fill) {
            fill.style.width = percentage + '%';
        }
        
        if (textEl && text) {
            textEl.textContent = text;
        }
    }
    
    /**
     * Ocultar pantalla de carga
     */
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
    }
    
    /**
     * Error boundary para manejo de errores
     */
    createErrorBoundary() {
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, event.filename, event.lineno);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason, 'Promise rejection');
        });
    }
    
    /**
     * Manejar errores globales
     */
    handleGlobalError(error, filename = '', lineno = 0) {
        console.error('🚨 Error global capturado:', error);
        
        // Log estructurado del error
        const errorInfo = {
            message: error.message || error,
            filename,
            lineno,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Almacenar error para debugging
        this.storeErrorForDebugging(errorInfo);
        
        // Mostrar error amigable al usuario
        this.showErrorDialog(error);
    }
    
    /**
     * Mostrar diálogo de error
     */
    showErrorDialog(error) {
        const errorDialog = document.createElement('div');
        errorDialog.className = 'overlay active';
        errorDialog.innerHTML = `
            <div class="overlay-content error-boundary">
                <h2>⚠️ Oops! Algo salió mal</h2>
                <p>Galaxy Piano encontró un error inesperado. No te preocupes, puedes intentar de nuevo.</p>
                <div style="margin: 20px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; font-family: monospace; font-size: 0.8rem; color: #ccc;">
                    ${error.message || error}
                </div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="window.location.reload()">🔄 Recargar App</button>
                    <button onclick="this.parentElement.parentElement.remove()">❌ Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDialog);
    }
    
    /**
     * Almacenar error para debugging
     */
    storeErrorForDebugging(errorInfo) {
        try {
            const errors = JSON.parse(localStorage.getItem('galaxy-piano-errors') || '[]');
            errors.push(errorInfo);
            
            // Mantener solo los últimos 10 errores
            if (errors.length > 10) {
                errors.splice(0, errors.length - 10);
            }
            
            localStorage.setItem('galaxy-piano-errors', JSON.stringify(errors));
        } catch (e) {
            console.warn('No se pudo almacenar error:', e);
        }
    }
    
    /**
     * Monitor de rendimiento
     */
    createPerformanceMonitor() {
        this.performanceData = {
            fps: 60,
            memory: 0,
            loadTime: 0,
            audioLatency: 0
        };
        
        // Solo mostrar en modo desarrollo
        if (this.isDevelopmentMode()) {
            this.createPerformanceIndicator();
            this.startPerformanceMonitoring();
        }
    }
    
    /**
     * Crear indicador de rendimiento
     */
    createPerformanceIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'performance-indicator';
        indicator.id = 'performance-indicator';
        document.body.appendChild(indicator);
    }
    
    /**
     * Iniciar monitoreo de rendimiento
     */
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
                
                // Memoria (si está disponible)
                if (performance.memory) {
                    this.performanceData.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                }
                
                this.updatePerformanceDisplay();
            }
            
            requestAnimationFrame(updatePerformance);
        };
        
        updatePerformance();
    }
    
    /**
     * Actualizar display de rendimiento
     */
    updatePerformanceDisplay() {
        const indicator = document.getElementById('performance-indicator');
        if (indicator) {
            indicator.innerHTML = `
                FPS: ${this.performanceData.fps} | 
                RAM: ${this.performanceData.memory}MB | 
                Audio: ${this.performanceData.audioLatency}ms
            `;
            indicator.classList.add('show');
        }
    }
    
    /**
     * Crear indicadores de estado
     */
    createStatusIndicators() {
        const statusContainer = document.createElement('div');
        statusContainer.className = 'app-status';
        statusContainer.innerHTML = `
            <div class="status-indicator" id="status-audio" title="Audio Engine"></div>
            <div class="status-indicator" id="status-galaxy" title="Galaxy Renderer"></div>
            <div class="status-indicator" id="status-composer" title="Compositor"></div>
            <div class="status-indicator" id="status-analysis" title="Análisis"></div>
        `;
        
        document.body.appendChild(statusContainer);
    }
    
    /**
     * Actualizar estado de módulo
     */
    updateModuleStatus(module, status) {
        const indicator = document.getElementById(`status-${module}`);
        if (indicator) {
            indicator.className = `status-indicator ${status}`;
        }
    }
    
    /**
     * Configurar atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
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
        });
    }
    
    /**
     * Verificar si hay input con foco
     */
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }
    
    /**
     * Cerrar todos los overlays
     */
    closeAllOverlays() {
        const overlays = document.querySelectorAll('.overlay.active');
        overlays.forEach(overlay => {
            overlay.classList.remove('active');
        });
    }
    
    /**
     * Estados de carga con debounce
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
            }
        }
    }
    
    /**
     * Actualizar UI de loading
     */
    updateLoadingUI(key, isLoading) {
        const element = document.querySelector(`[data-loading="${key}"]`);
        if (element) {
            element.classList.toggle('loading-state', isLoading);
        }
    }
    
    /**
     * Animaciones fluidas
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
    
    /**
     * Transición entre modos
     */
    async animateModeTransition(fromMode, toMode) {
        const fromSection = document.getElementById(`${fromMode}-mode`);
        const toSection = document.getElementById(`${toMode}-mode`);
        
        if (fromSection) {
            await this.animateElement(fromSection, 'slide-out-left', 300);
            fromSection.classList.remove('active');
        }
        
        if (toSection) {
            toSection.classList.add('active');
            await this.animateElement(toSection, 'slide-in-right', 300);
        }
    }
    
    /**
     * Verificar modo desarrollo
     */
    isDevelopmentMode() {
        return window.location.hostname === 'localhost' || 
               window.location.search.includes('debug') ||
               window.location.hash.includes('dev');
    }
    
    /**
     * Funciones de callback para atajos de teclado
     */
    triggerSave() {
        if (window.galaxyPiano && window.galaxyPiano.projectManager) {
            window.galaxyPiano.saveCurrentProject();
        }
    }
    
    triggerNewProject() {
        if (window.galaxyPiano && window.galaxyPiano.projectManager) {
            window.galaxyPiano.createNewProject();
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
     * Métricas de uso
     */
    trackUserAction(action, data = {}) {
        const event = {
            action,
            data,
            timestamp: Date.now(),
            mode: window.galaxyPiano?.currentMode || 'unknown',
            sessionId: this.getSessionId()
        };
        
        // Solo log en desarrollo
        if (this.isDevelopmentMode()) {
            console.log('📊 User Action:', event);
        }
        
        // Almacenar métricas localmente
        this.storeMetric(event);
    }
    
    /**
     * Obtener ID de sesión
     */
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }
    
    /**
     * Almacenar métrica
     */
    storeMetric(event) {
        try {
            const metrics = JSON.parse(localStorage.getItem('galaxy-piano-metrics') || '[]');
            metrics.push(event);
            
            // Mantener solo las últimas 100 métricas
            if (metrics.length > 100) {
                metrics.splice(0, metrics.length - 100);
            }
            
            localStorage.setItem('galaxy-piano-metrics', JSON.stringify(metrics));
        } catch (e) {
            console.warn('No se pudo almacenar métrica:', e);
        }
    }
    
    /**
     * Limpiar recursos
     */
    destroy() {
        // Remover event listeners globales
        document.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('error', this.errorHandler);
        window.removeEventListener('unhandledrejection', this.rejectionHandler);
        
        // Limpiar notificaciones
        this.notifications.forEach(notification => {
            this.removeToast(notification.element);
        });
        
        console.log('🧹 UIManager destruido');
    }
}

// Exponer globalmente
window.UIManager = UIManager;