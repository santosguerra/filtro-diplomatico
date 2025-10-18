# 🤖 Filtro Diplomático - Extensión para Chrome/Edge

## Descripción
Extensión que intercepta tus mensajes en WhatsApp Web y sugiere versiones más diplomáticas usando la API de OpenAI. Perfecta para esos grupos donde necesitas medir cada palabra.

## 📋 Requisitos
- Chrome o Edge (versión 88+)
- Cuenta de OpenAI con API Key activa
- WhatsApp Web

## 🚀 Instalación

### Paso 1: Preparar los archivos

1. Crea una carpeta llamada `filtro-diplomatico` en tu computadora
2. Dentro de esa carpeta, crea la siguiente estructura:

```
filtro-diplomatico/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── options.html
├── options.js
├── styles.css
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

3. Copia el código de cada archivo desde los artifacts anteriores

### Paso 2: Crear iconos temporales

Mientras no tengas iconos personalizados, puedes crear imágenes simples de 16x16, 48x48 y 128x128 píxeles con cualquier editor de imágenes (puedes usar un emoji 🤖 sobre fondo morado).

### Paso 3: Cargar la extensión en el navegador

#### En Chrome:
1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el "Modo de desarrollador" (esquina superior derecha)
3. Click en "Cargar extensión sin empaquetar"
4. Selecciona la carpeta `filtro-diplomatico`

#### En Edge:
1. Abre Edge y ve a `edge://extensions/`
2. Activa el "Modo de desarrollador" (panel izquierdo)
3. Click en "Cargar sin empaquetar"
4. Selecciona la carpeta `filtro-diplomatico`

## ⚙️ Configuración inicial

### 1. Obtener API Key de OpenAI
1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta o inicia sesión
3. Ve a API Keys → Create new secret key
4. Copia la key (empieza con `sk-`)

### 2. Configurar la extensión
1. Click en el icono de la extensión en la barra del navegador
2. Click en "Opciones" o ve directamente desde el administrador de extensiones
3. Pega tu API Key de OpenAI
4. Guarda la configuración

## 📱 Uso en WhatsApp Web

1. Abre [web.whatsapp.com](https://web.whatsapp.com)
2. La extensión se activa automáticamente
3. Escribe un mensaje normalmente
4. Al presionar Enter o click en enviar:
   - Se abre un modal con tu mensaje original
   - La IA genera una versión diplomática
   - Puedes elegir: "Enviar Original", "Usar Sugerencia" o "Cancelar"

## 🎛️ Características

### Niveles de diplomacia:
- **Suave**: Ajustes mínimos, mantiene tu estilo
- **Moderado**: Profesional y neutro (recomendado)
- **Ultra**: Extremadamente cortés y ceremonioso

### Lista blanca:
Agrega contactos o grupos donde NO quieres que se active el filtro:
1. Ve a Opciones
2. En "Lista Blanca" escribe el nombre exacto del contacto/grupo
3. Click en "Agregar"

### Personalización de prompts:
Puedes modificar cómo la IA reformula tus mensajes:
1. En Opciones, ve a "Prompts Personalizados"
2. Usa los templates predefinidos o escribe los tuyos
3. Guarda los cambios

## 🔧 Solución de problemas

### El modal no aparece:
- Recarga WhatsApp Web (F5)
- Verifica que la extensión esté activada
- Revisa la consola del navegador (F12) por errores

### Error "API Key no configurada":
- Ve a Opciones y verifica tu API Key
- Asegúrate de que tu cuenta de OpenAI tenga créditos

### El botón de enviar se comporta extraño:
- WhatsApp Web actualiza su estructura frecuentemente
- Reporta el problema con la versión de WhatsApp que ves

## 💰 Costos

La extensión usa el modelo `gpt-4o-mini` de OpenAI:
- Costo aproximado: $0.15 por cada 1000 mensajes procesados
- OpenAI ofrece créditos gratuitos al registrarte

## 🔒 Privacidad

- Tu API Key se almacena localmente en el navegador
- Los mensajes se envían directamente a OpenAI
- No se almacenan mensajes en ningún servidor intermedio
- La extensión solo funciona en los sitios que configures

## 📝 Notas de desarrollo

### Para depuración:
- Los logs aparecen en la consola del navegador (F12)
- En `chrome://extensions/` puedes ver errores del background script

### Para modificar:
1. Edita los archivos en tu carpeta local
2. En `chrome://extensions/` click en el botón de recargar (↻)
3. Recarga WhatsApp Web para ver los cambios

## 🚨 Limitaciones conocidas

- Solo funciona en WhatsApp Web (no en la app de escritorio)
- Requiere conexión a internet para procesar mensajes
- WhatsApp puede cambiar su estructura y romper temporalmente la extensión
- No funciona con mensajes de voz o archivos

## 🤝 Contribuciones

Si quieres mejorar la extensión:
- Agrega soporte para más plataformas (Telegram Web, Facebook, etc.)
- Mejora la detección del campo de mensaje
- Añade más opciones de personalización
- Crea mejores iconos

## 📄 Licencia

Uso libre para propósitos personales. 
Creado por Santos R. Guerra F.

---

**Tip profesional**: Úsalo en nivel "Moderado" para la mayoría de situaciones. El nivel "Ultra" puede sonar demasiado falso en conversaciones casuales. 😉
