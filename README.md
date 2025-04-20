# 🎬 CinemaMap Explorer

## Descripción

CinemaMap Explorer es una aplicación web interactiva que permite a los usuarios descubrir dónde se han filmado sus películas favoritas y aprender sobre estos lugares. Utilizando una interfaz intuitiva, la aplicación permite buscar películas, visualizar sus localizaciones en un mapa interactivo y obtener información detallada tanto de la película como de los lugares de rodaje.

## 🌟 Características principales

- **Búsqueda de películas**: Encuentra rápidamente información sobre tus películas favoritas.
- **Mapa interactivo**: Visualiza las localizaciones de rodaje en un mapa dinámico.
- **Vistas alternativas**: Cambia entre vista estándar y satélite.
- **Información detallada**: Consulta datos sobre las películas y sus localizaciones.
- **Localizaciones favoritas**: Guarda y gestiona tus lugares de rodaje preferidos.
- **Integración con Wikipedia**: Obtén descripciones e imágenes de las localizaciones.

## 🛠️ Tecnologías utilizadas

- **Frontend**: React 19 con TypeScript
- **Estilos**: CSS
- **Gestión de estado**: React Hooks (useState, useEffect)
- **Mapas**: React-Leaflet 5.0.0 y Leaflet 1.9.4
- **Peticiones HTTP**: Axios 1.8.4
- **Iconos**: React-Icons 5.5.0
- **Entorno de desarrollo**: Vite 6.2.0

## 📚 APIs externas

- **OMDb API**: Para obtener información de las películas
- **Nominatim API (OpenStreetMap)**: Para obtener coordenadas geográficas
- **Wikipedia API**: Para obtener descripciones e imágenes de las localizaciones

## 🚀 Instalación y ejecución

### Requisitos previos

- Node.js (versión compatible con React 19)
- npm
- Conexión a internet para acceder a las APIs externas

### Pasos de instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/hammad2003/cinemamap-explorer
   cd cinemamap-explorer
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:5173](http://localhost:5173) en tu navegador

## 🎮 Guía de uso

### Búsqueda de películas
1. Escribe el nombre de una película en la barra de búsqueda
2. Presiona Enter o haz clic en el botón de búsqueda
3. Explora la información de la película y sus localizaciones en el mapa

### Exploración de localizaciones
1. Haz clic en una localización de la lista o directamente en el mapa
2. Visualiza información detallada sobre la localización seleccionada
3. El mapa se centrará automáticamente en la localización elegida

### Gestión de favoritos
1. Visualiza los detalles de una localización
2. Haz clic en "Add to favorites" para guardarla
3. Accede a tus localizaciones favoritas desde la sección correspondiente

### Cambio de vista del mapa
- Utiliza el botón "Switch to Satellite/Standard" para alternar entre vistas

## 📋 Documentación técnica

Para una comprensión profunda de la arquitectura y funcionamiento de CinemaMap Explorer, consulta la documentación técnica completa disponible en este repositorio. `CinemaMap-Explorer.pdf` Esta documentación incluye:

- Descripción general: Visión general de la aplicación y sus objetivos principales.
- Especificaciones técnicas: Detalles sobre las tecnologías utilizadas (React 19, TypeScript, React-Leaflet, etc.) y APIs externas (OMDb, Nominatim, Wikipedia).
- Estructura de datos: Explicación detallada de las interfaces principales (`Movie`, `LocationData`, `ApiResponse`) y su implementación.
- Explicación del código: Análisis del funcionamiento de los componentes clave:
  - Hook personalizado `useApi` para gestionar llamadas a APIs
  - Servicios de API para películas y localidades
  - Componente principal `App.tsx`
  - Componente de mapa interactivo `MapComponent.tsx`
- Ejemplos de uso: Guías paso a paso sobre cómo utilizar la aplicación, incluyendo búsqueda de películas, exploración de localizaciones y gestión de favoritos.
- Pruebas y casos de uso: Escenarios probados para garantizar el correcto funcionamiento de la aplicación.
- Posibles mejoras: Sugerencias para futuras extensiones y mejoras funcionales.

Esta documentación está orientada principalmente a desarrolladores que deseen entender o contribuir al código base del proyecto, proporcionando una visión completa y detallada de todos los aspectos técnicos del sistema.

## 🧪 Casos de prueba

| Prueba | Entrada | Resultado esperado |
|--------|---------|-------------------|
| Búsqueda exacta | "The Dark Knight" | Información de la película y localizaciones (Chicago, Hong Kong, London) |
| Gestión de errores | Título inexistente | Mensaje de error mostrado en la interfaz |
| Persistencia de favoritos | Añadir localizaciones y recargar | Las localizaciones favoritas se mantienen |
| Cambio de vista | Clic en "Switch to Satellite" | El mapa cambia a vista satélite |

## 🔮 Posibles mejoras futuras

- Filtrado avanzado de localizaciones por género, país o director
- Ordenación de resultados por proximidad o popularidad
- Visualización cronológica de localizaciones cinematográficas
- Soporte multilingüe
- Perfiles de usuario
- Compartición de contenido en redes sociales
- Integración con servicios como YouTube o Google Street View

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para cualquier mejora o corrección.

## 📞 Contacto

Para cualquier consulta, puedes contactar a través de:
- GitHub: [hammad2003](https://github.com/hammad2003)