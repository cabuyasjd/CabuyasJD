# Inventario Cabuyas JD - Versión Web (HTML/CSS/JavaScript)

Esta es una versión web del sistema de inventario original hecho en Tkinter, convertido a HTML, CSS y JavaScript.

## Características

✅ **Interfaz idéntica** a la versión Tkinter
✅ **Gestión de usuarios** con persistencia en localStorage
✅ **Inventario completo** con agregar, retirar, listar y buscar productos
✅ **Validación de datos** igual a la original
✅ **Paleta de colores** exacta (azul, amarillo, verde, rojo)
✅ **Responsive** - funciona en desktop, tablet y mobile
✅ **Manual de usuario** integrado
✅ **Almacenamiento local** sin necesidad de servidor

## Archivos

- `index.html` - Estructura HTML con todos los modales y pantallas
- `styles.css` - Estilos CSS con la paleta de colores y responsive design
- `script.js` - Lógica JavaScript que replica la funcionalidad Tkinter
- `README.md` - Este archivo

## Cómo usar

1. **Abre el archivo `index.html` en tu navegador web**
   - No necesita servidor, funciona localmente
   - Compatible con Chrome, Firefox, Safari, Edge

2. **Pantalla de Login**
   - Ingresa Nombres, Apellidos, Cédula y Fecha de nacimiento
   - Puedes buscar usuarios previos por cédula
   - Los datos se validan igual que en la versión original

3. **Menú Principal**
   - **Agregar producto**: Selecciona o crea nuevos productos
   - **Retirar producto**: Reduce el stock de productos
   - **Listar inventario**: Visualiza todos los productos
   - **Buscar / Bajo stock**: Busca productos o ve los que están bajo umbral

## Diferencias respecto a la versión Tkinter

### Persistencia de datos
- **Tkinter**: Guarda en archivos `users.json` en disco
- **Web**: Guarda en `localStorage` del navegador
- Los datos persisten entre sesiones del mismo navegador

### Almacenamiento de logo
- **Tkinter**: Busca `logo cabuyas.png` en la carpeta del programa
- **Web**: Busca `logo.png` en la carpeta del servidor web
- Si no existe, simplemente no muestra el logo

### Validación de fechas
- Igual a la original: DD/MM/AAAA format
- Valida edad entre 0 y 120 años

## Funcionalidades incluidas

### 1. Sistema de Login
- Validación de campos obligatorios
- Validación de cédula (7-12 dígitos numéricos)
- Validación de fecha de nacimiento
- Búsqueda de usuarios previos por cédula
- Errores mostrados en modal detallado

### 2. Gestión de Inventario
- **Agregar**: Aumenta cantidad de productos existentes o crea nuevos
- **Retirar**: Disminuye cantidad (valida stock suficiente)
- **Listar**: Visualiza todos los productos con sus cantidades
- **Buscar**: Busca por nombre o muestra productos bajo umbral

### 3. Manuals y Ayuda
- Manual de ingreso en pantalla de login
- Manual de usuario en menú principal
- Ayuda contextual en cada operación

### 4. Interfaz de Usuario
- Paleta de colores idéntica
- Botones con iconos emoji
- Tablas claras para visualizar datos
- Modales para cada operación
- Mensajes de éxito/error

## Estructura de datos (localStorage)

### Usuarios (`cabuyas_users`)
```json
{
  "12345678": {
    "nombres": "Juan",
    "apellidos": "Pérez",
    "cedula": "12345678",
    "fnac": "15/06/1990",
    "last_login": "2026-02-08T..."
  }
}
```

### Inventario (`cabuyas_inventario`)
```json
{
  "Producto 1": 10,
  "Producto 2": 5,
  "Producto 3": 0
}
```

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- localStorage habilitado (normalmente está por defecto)

## Notas técnicas

### Validación de fechas
La validación verifica:
- Formato DD/MM/AAAA
- Fecha válida (ej: no 31 de febrero)
- Edad entre 0 y 120 años

### Almacenamiento
Usa `localStorage` que es específico por dominio/protocolo:
- `http://localhost` diferente de `https://localhost`
- Cada navegador tiene su propio almacenamiento
- Los datos persisten hasta que se limpie el cache

### Responsive
- Desktop (900px+): Grid de 2 columnas para botones
- Tablet (768px-899px): Layout adaptado
- Mobile (<768px): Single column, botones full-width

## Deployment

Para desplegar en un servidor web:
1. Copia los 3 archivos (index.html, styles.css, script.js) a tu servidor
2. Opcionalmente, copia logo.png si lo tienes
3. Accede mediante HTTP o HTTPS

Los datos se guardarán en localStorage del navegador del usuario.

## Compatibilidad

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers

## Licencia

Este código replica la estructura y funcionalidad del original en Tkinter para uso educativo.
