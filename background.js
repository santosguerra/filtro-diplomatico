// background.js - Service Worker
console.log('Background service worker iniciado');

// Configuración de prompts según nivel de diplomacia
const DIPLOMACY_PROMPTS = {
  soft: `Reformula el siguiente mensaje manteniendo la idea pero con un tono más amable y considerado. 
         Si el mensaje ya es respetuoso, devuélvelo sin cambios significativos.`,
  
  moderate: `Reformula el siguiente mensaje para que sea profesional, respetuoso y diplomático. 
             Elimina cualquier sarcasmo, juicio directo o palabras confrontativas. 
             Mantén la idea principal pero con un tono neutro y constructivo.
             Si el mensaje ya es diplomático, devuélvelo sin cambios.`,
  
  ultra: `Reformula el siguiente mensaje para que sea extremadamente cortés, indirecto y diplomático. 
          Usa un lenguaje muy suave, evita cualquier posible confrontación, añade expresiones de cortesía.
          Transforma críticas en sugerencias constructivas y opiniones en posibilidades.
          El tono debe ser casi ceremonioso en su cortesía.`
};

// Escuchar mensajes del content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSuggestion') {
    handleSuggestionRequest(request.message, request.diplomacyLevel)
      .then(suggestion => {
        sendResponse({ success: true, suggestion });
      })
      .catch(error => {
        console.error('Error en background:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indica que la respuesta será asíncrona
  }
});

// Manejar solicitud de sugerencia
async function handleSuggestionRequest(message, diplomacyLevel = 'moderate') {
  try {
    // Obtener API key de storage
    const result = await chrome.storage.sync.get(['settings']);
    const apiKey = result.settings?.apiKey;
    
    if (!apiKey) {
      throw new Error('API Key no configurada. Ve a opciones de la extensión.');
    }
    
    // Preparar el prompt
    const systemPrompt = DIPLOMACY_PROMPTS[diplomacyLevel] || DIPLOMACY_PROMPTS.moderate;
    
    // Llamar a OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Mensaje a reformular: "${message}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error en la API de OpenAI');
    }
    
    const data = await response.json();
    const suggestion = data.choices[0].message.content.trim();
    
    // Limpiar la sugerencia (quitar comillas si las agregó)
    const cleanSuggestion = suggestion.replace(/^["']|["']$/g, '');
    
    return cleanSuggestion;
  } catch (error) {
    console.error('Error al obtener sugerencia:', error);
    throw error;
  }
}

// Manejar instalación de la extensión
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Configuración inicial
    chrome.storage.sync.set({
      settings: {
        enabled: true,
        apiKey: '',
        diplomacyLevel: 'moderate',
        whitelist: []
      }
    });
    
    // Abrir página de opciones para configurar API key
    chrome.runtime.openOptionsPage();
  }
});
