# 🌌 Galaxy Piano - Musical Universe

**Versión 1.3.0 - Sprint 3 Complete**  
*Compositor Musical Inteligente con Gestión de Proyectos*

---

## 🚀 ¿Qué es Galaxy Piano?

Galaxy Piano es una aplicación web innovadora que transforma la música en una experiencia visual cósmica. Cada nota musical se convierte en una estrella en una galaxia 3D interactiva, permitiendo a los usuarios crear, componer y analizar música de una manera completamente nueva.

### ✨ Características Principales

- 🎹 **Piano Virtual**: 88 teclas completas con síntesis en tiempo real
- 🌌 **Visualización Galáctica**: Estrellas 3D que representan notas musicales
- 🎼 **Compositor Inteligente**: Secuenciador avanzado con análisis musical
- 🎵 **Teoría Musical AI**: Detección automática de acordes y sugerencias
- 💾 **Gestión de Proyectos**: Sistema completo de guardado y organización
- 📊 **Análisis Musical**: Visualización de ondas y espectro (Sprint 4)

---

## 🛠️ Sprints de Desarrollo

### ✅ Sprint 1: Fundación (COMPLETADO)
- [x] Motor de audio con Web Audio API
- [x] Sistema de 88 notas (A0 - C8)
- [x] Síntesis básica con osciladores
- [x] Control de volumen y decay
- [x] Arquitectura modular

### ✅ Sprint 2: Galaxia Base (COMPLETADO)
- [x] Renderer 3D con Three.js
- [x] Sistema de estrellas musicales
- [x] Colores por registro tonal
- [x] Animaciones y efectos visuales
- [x] Interactividad con mouse

### ✅ Sprint 3: Compositor (COMPLETADO)
- [x] Secuenciador musical avanzado
- [x] Parser de entrada musical inteligente
- [x] Motor de teoría musical con IA
- [x] Detección automática de acordes
- [x] Sistema de gestión de proyectos
- [x] Auto-guardado y backups

### 🔄 Sprint 4: Análisis y Exportación (EN DESARROLLO)
- [ ] Visualización de ondas 2D
- [ ] Análisis espectral 3D
- [ ] Exportación MIDI/MP3
- [ ] Sistema de archivos avanzado

---

## 🎮 Guía de Uso

### 🎹 Modo Live
El modo básico para tocar piano y crear estrellas inmediatamente.

**Formatos de entrada:**
- **Nota simple**: `40` (C4)
- **Múltiples notas**: `40,43,47` (acorde C Major)
- **Con nombres**: `C4,E4,G4`

**Controles:**
- **Volumen**: Slider de 0-100%
- **Play/Stop**: Reproducir/detener notas
- **Visualización**: Galaxy 3D interactiva

### 🎼 Modo Compositor
Modo avanzado para crear secuencias musicales complejas.

**Formato avanzado de entrada:**
```
C4+E4+G4@2.0v0.8, Am@1.0, F+A+C@1.5v0.9
```

**Sintaxis:**
- `+`: Acordes (notas simultáneas)
- `@2.0`: Duración en beats
- `v0.8`: Velocidad/intensidad (0.1-1.0)
- `,`: Separar secuencias

**Características:**
- **Grid Secuenciador**: 4 tracks × 16 steps
- **Análisis en Tiempo Real**: Detección de acordes automática
- **Sugerencias Musicales**: IA para progresiones armónicas
- **Control de Tempo**: 60-200 BPM

### 💾 Gestión de Proyectos

**Funciones principales:**
- **Crear**: Nuevos proyectos con metadata
- **Guardar**: Auto-guardado cada 30 segundos
- **Cargar**: Cambio rápido entre proyectos
- **Eliminar**: Con backup automático
- **Exportar**: Formato JSON completo

**Metadatos incluidos:**
- Nombre y descripción
- Configuración de audio y visuales
- Secuencias musicales completas
- Progresiones de acordes
- Configuración de tempo y tonalidad

---

## 🎨 Sistema de Colores Musicales

Las estrellas cambian de color según el registro tonal:

- 🔵 **Azul**: Graves extremos (notas 1-15)
- 🔷 **Azul-Blanco**: Graves (notas 16-30)
- ⚪ **Blanco**: Medios-Graves (notas 31-45)
- 🔸 **Blanco-Amarillo**: Medios-Agudos (notas 46-60)
- 🟡 **Amarillo**: Agudos (notas 61-75)
- 🟠 **Naranja**: Muy Agudos (notas 76-85)
- 🔴 **Rojo**: Extremos Agudos (notas 86-88)

---

## 🧠 Sistema de Teoría Musical

### Detección de Acordes
El motor de IA puede identificar:

**Tríadas:**
- Mayor, Menor, Disminuido, Aumentado
- Suspendidas (sus2, sus4)

**Séptimas:**
- Dominante (7), Mayor (maj7), Menor (m7)

**Extensiones:**
- Añadidas (add9, add11)
- Complejas (9, 11, 13)

### Sugerencias Inteligentes
- **Círculo de Quintas**: Progresiones naturales
- **Función Tonal**: Tónica, Dominante, Subdominante
- **Contexto Musical**: Basado en tonalidad actual

---

## 📁 Estructura del Proyecto

```
galaxy-piano/
├── index.html                 # Interfaz principal
├── styles/
│   ├── main.css              # Estilos base
│   ├── galaxy.css            # Estilos 3D
│   ├── components.css        # Componentes UI
│   └── composer.css          # Modo compositor (Sprint 3)
├── scripts/
│   ├── main.js               # Aplicación principal
│   ├── audio/
│   │   ├── audioEngine.js    # Motor de audio
│   │   └── noteMapping.js    # Mapeo de notas
│   ├── visual/
│   │   ├── galaxyRenderer.js # Renderer 3D
│   │   └── starSystem.js     # Sistema de estrellas
│   ├── composer/             # Sprint 3 - NUEVO
│   │   ├── sequencer.js      # Secuenciador musical
│   │   ├── musicTheory.js    # Motor de teoría musical
│   │   └── projectManager.js # Gestión de proyectos
│   └── utils/
│       └── helpers.js        # Utilidades
└── README.md                 # Esta documentación
```

---

## 🔧 Configuración y Desarrollo

### Requisitos
- Navegador moderno con soporte para:
  - Web Audio API
  - WebGL/Three.js
  - ES6+ JavaScript
  - LocalStorage

### Instalación
1. Clonar repositorio
2. Servir archivos con servidor HTTP local
3. Abrir `index.html` en navegador

### Modo de Desarrollo
Para activar tests automáticos:
```
http://localhost:8000/?test=true
```

### Tests de Integración
El sistema incluye tests automáticos para:
- Motor de audio
- Secuenciador musical
- Teoría musical
- Gestión de proyectos
- Visualización 3D

---

## 🎵 Ejemplos de Uso

### Ejemplo 1: Acorde Básico
```
Entrada: C4+E4+G4
Resultado: Acorde C Major
Estrellas: 3 estrellas blancas en formación triangular
```

### Ejemplo 2: Progresión Compleja
```
Entrada: C4+E4+G4@2.0v0.8, Am@1.0, F+A+C@1.5, G+B+D@1.0
Resultado: Progresión I-vi-IV-V en C Major
Análisis: Progresión clásica con sugerencias de continuación
```

### Ejemplo 3: Secuencia Rítmica
```
Entrada: C4@0.5, C4@0.5, G4@1.0, F4@0.5, E4@1.5
Resultado: Melodía rítmica con variación temporal
Visualización: Estrellas aparecen y desaparecen con timing musical
```

---

## 🚀 Características Avanzadas

### Parser Musical Inteligente
- **Flexibilidad**: Múltiples formatos de entrada
- **Validación**: Verificación en tiempo real
- **Corrección**: Sugerencias automáticas
- **Contexto**: Análisis basado en tonalidad

### Motor de IA Musical
- **Reconocimiento**: Acordes complejos y extensiones
- **Contexto**: Análisis de progresiones
- **Sugerencias**: Continuaciones armónicas inteligentes
- **Aprendizaje**: Mejora con el uso

### Sistema de Proyectos
- **Persistencia**: LocalStorage con compresión
- **Backup**: Sistema automático de respaldo
- **Versioning**: Control de versiones básico
- **Exportación**: Formato JSON estándar

---

## 🎯 Roadmap Futuro

### Sprint 4: Análisis Avanzado
- **Ondas 2D**: Visualización de forma de onda
- **Espectro 3D**: FFT en tiempo real
- **Exportación**: MIDI, MP3, WAV
- **Análisis**: Detección de tempo y tonalidad

### Sprint 5: Colaboración
- **Multijugador**: Sesiones colaborativas
- **Chat Musical**: Comunicación integrada
- **Compartir**: Proyectos públicos
- **Comunidad**: Galería de creaciones

### Sprint 6: IA Avanzada
- **Composición**: IA generativa
- **Acompañamiento**: Generación automática
- **Masterización**: Procesamiento inteligente
- **Recomendaciones**: Sugerencias personalizadas

---

## 🤝 Contribuir

### Reportar Bugs
1. Usar los tests integrados (`?test=true`)
2. Incluir logs de consola
3. Especificar navegador y versión
4. Describir pasos para reproducir

### Solicitar Características
1. Describir caso de uso
2. Explicar beneficio musical
3. Proponer implementación
4. Considerar compatibilidad

### Desarrollo
1. Fork del repositorio
2. Crear rama para feature
3. Seguir convenciones de código
4. Incluir tests cuando sea posible
5. Documentar cambios

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo LICENSE para detalles.

---

## 🙏 Créditos

### Tecnologías Utilizadas
- **Three.js**: Visualización 3D
- **Web Audio API**: Síntesis de audio
- **Tone.js**: Utilidades musicales (opcional)
- **CSS Grid/Flexbox**: Layout responsivo

### Inspiración Musical
- Teoría musical clásica occidental
- Sistemas de temperamento igual
- Círculo de quintas
- Progresiones armónicas estándar

---

## 📞 Contacto

Para preguntas, sugerencias o colaboraciones:

- **GitHub Issues**: Para bugs y features
- **Documentación**: Ver ejemplos en código
- **Tests**: Usar modo de desarrollo

---

**🌌 Galaxy Piano - Donde la música se encuentra con el cosmos 🎵**

*Versión 1.3.0 - Sprint 3 Complete*  
*Próxima actualización: Sprint 4 - Análisis y Exportación*