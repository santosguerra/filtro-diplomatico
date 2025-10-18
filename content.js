// content.js - Se inyecta en WhatsApp Web
console.log('Filtro Diplomático activado en WhatsApp Web');

let isProcessing = false;
let originalMessage = '';
let suggestionModal = null;
let settings = {
  enabled: true,
  apiKey: '',
  diplomacyLevel: 'moderate',
  whitelist: []
};

// Cargar configuración
chrome.storage.sync.get(['settings'], (result) => {
  if (result.settings) {
    settings = { ...settings, ...result.settings };
  }
});

// Escuchar cambios en la configuración
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.settings) {
    settings = { ...settings, ...changes.settings.newValue };
  }
});

// Función para obtener el campo de mensaje actual
function getMessageInput() {
  // WhatsApp usa un div contenteditable para el input de mensaje
  const selectors = [
    'div[contenteditable="true"][data-tab="10"]',
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"].copyable-text'
  ];
  
  for (let selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element;
    }
  }
  return null;
}

// Función para obtener el botón de enviar
function getSendButton() {
  const selectors = [
    'button[aria-label="Enviar"]',
    'button[data-testid="send"]',
    'span[data-icon="send"]',
    'button span[data-testid="send"]'
  ];
  
  for (let selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.closest('button') || element;
    }
  }
  return null;
}

// Función para obtener el nombre del chat actual
function getCurrentChatName() {
  const headerSelectors = [
    'header span[title]',
    'div[role="main"] header span[dir="auto"]',
    'header div[role="button"] span[title]'
  ];
  
  for (let selector of headerSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  return 'Chat desconocido';
}

// Crear modal de sugerencia
function createSuggestionModal() {
  if (suggestionModal) {
    suggestionModal.remove();
  }
  
  suggestionModal = document.createElement('div');
  suggestionModal.className = 'diplomatic-filter-modal';
  suggestionModal.innerHTML = `
    <div class="df-modal-content">
      <div class="df-modal-header">
        <h3>🤖 Sugerencia Diplomática</h3>
        <button class="df-close" title="Cerrar">×</button>
      </div>
      <div class="df-modal-body">
        <div class="df-original">
          <label>Tu mensaje original:</label>
          <p class="df-message-text"></p>
        </div>
        <div class="df-suggested">
          <label>Versión diplomática:</label>
          <p class="df-message-text df-loading">Procesando...</p>
        </div>
      </div>
      <div class="df-modal-footer">
        <button class="df-btn df-btn-original">Enviar Original</button>
        <button class="df-btn df-btn-suggested" disabled>Usar Sugerencia</button>
        <button class="df-btn df-btn-cancel">Cancelar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(suggestionModal);
  
  // Event listeners
  suggestionModal.querySelector('.df-close').addEventListener('click', closeModal);
  suggestionModal.querySelector('.df-btn-cancel').addEventListener('click', closeModal);
  suggestionModal.querySelector('.df-btn-original').addEventListener('click', sendOriginal);
  suggestionModal.querySelector('.df-btn-suggested').addEventListener('click', sendSuggested);
  
  return suggestionModal;
}

// Cerrar modal
function closeModal() {
  if (suggestionModal) {
    suggestionModal.remove();
    suggestionModal = null;
  }
  isProcessing = false;
  originalMessage = '';
}

// Enviar mensaje original
function sendOriginal() {
  if (originalMessage) {
    sendMessage(originalMessage);
  }
  closeModal();
}

// Enviar mensaje sugerido
function sendSuggested() {
  const suggestedText = suggestionModal.querySelector('.df-suggested .df-message-text').textContent;
  if (suggestedText && suggestedText !== 'Procesando...' && suggestedText !== 'Error al procesar') {
    sendMessage(suggestedText);
  }
  closeModal();
}

// Función para enviar el mensaje
function sendMessage(text) {
  const input = getMessageInput();
  const sendBtn = getSendButton();
  
  if (input && sendBtn) {
    // Establecer el texto
    input.innerHTML = text;
    input.textContent = text;
    
    // Disparar eventos para que WhatsApp reconozca el cambio
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);
    
    // Pequeño delay y luego click en enviar
    setTimeout(() => {
      sendBtn.click();
    }, 100);
  }
}

// Interceptar el envío
function interceptSend(event) {
  if (!settings.enabled || isProcessing) return;
  
  const input = getMessageInput();
  if (!input || !input.textContent.trim()) return;
  
  const currentChat = getCurrentChatName();
  
  // Verificar si el chat está en la lista blanca
  if (settings.whitelist && settings.whitelist.includes(currentChat)) {
    console.log('Chat en lista blanca, no se procesa');
    return;
  }
  
  originalMessage = input.textContent.trim();
  
  // Verificar si el mensaje necesita ser procesado (tiene más de 10 caracteres)
  if (originalMessage.length < 10) return;
  
  // Prevenir el envío
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  
  isProcessing = true;
  
  // Crear y mostrar modal
  const modal = createSuggestionModal();
  modal.querySelector('.df-original .df-message-text').textContent = originalMessage;
  
  // Limpiar el input
  input.innerHTML = '';
  input.textContent = '';
  
  // Solicitar sugerencia a OpenAI
  requestSuggestion(originalMessage);
}

// Solicitar sugerencia a través del background script
async function requestSuggestion(message) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getSuggestion',
      message: message,
      diplomacyLevel: settings.diplomacyLevel
    });
    
    if (response.success && response.suggestion) {
      displaySuggestion(response.suggestion);
    } else {
      displayError(response.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error al solicitar sugerencia:', error);
    displayError('Error de conexión');
  }
}

// Mostrar sugerencia en el modal
function displaySuggestion(suggestion) {
  if (!suggestionModal) return;
  
  const suggestedElement = suggestionModal.querySelector('.df-suggested .df-message-text');
  suggestedElement.classList.remove('df-loading');
  suggestedElement.textContent = suggestion;
  
  const suggestBtn = suggestionModal.querySelector('.df-btn-suggested');
  suggestBtn.disabled = false;
  
  // Si la sugerencia es igual al original, notificar
  if (suggestion.trim() === originalMessage.trim()) {
    suggestedElement.innerHTML += '<br><small style="color: green;">✓ Tu mensaje ya es diplomático</small>';
  }
}

// Mostrar error en el modal
function displayError(error) {
  if (!suggestionModal) return;
  
  const suggestedElement = suggestionModal.querySelector('.df-suggested .df-message-text');
  suggestedElement.classList.remove('df-loading');
  suggestedElement.textContent = 'Error al procesar';
  suggestedElement.innerHTML += `<br><small style="color: red;">${error}</small>`;
}

// Configurar interceptores
function setupInterceptors() {
  // Interceptar tecla Enter
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      const input = getMessageInput();
      if (input && document.activeElement === input) {
        interceptSend(event);
      }
    }
  }, true);
  
  // Interceptar click en botón enviar
  document.addEventListener('click', (event) => {
    const sendBtn = getSendButton();
    if (sendBtn && (event.target === sendBtn || sendBtn.contains(event.target))) {
      interceptSend(event);
    }
  }, true);
}

// Observador para detectar cuando WhatsApp está listo
const observer = new MutationObserver((mutations) => {
  const sendBtn = getSendButton();
  if (sendBtn && !document.querySelector('.df-interceptors-ready')) {
    console.log('WhatsApp Web listo, configurando interceptores');
    setupInterceptors();
    
    // Marcar que ya se configuraron
    const marker = document.createElement('div');
    marker.className = 'df-interceptors-ready';
    marker.style.display = 'none';
    document.body.appendChild(marker);
  }
});

// Iniciar observador
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Configurar interceptores si WhatsApp ya está cargado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(setupInterceptors, 1000);
}
