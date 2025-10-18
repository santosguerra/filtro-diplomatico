// options.js
document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const apiKeyInput = document.getElementById('apiKey');
  const toggleApiKeyBtn = document.getElementById('toggleApiKey');
  const whitelistInput = document.getElementById('whitelistInput');
  const btnAddWhitelist = document.getElementById('btnAddWhitelist');
  const whitelistItems = document.getElementById('whitelistItems');
  const customPromptSoft = document.getElementById('customPromptSoft');
  const customPromptModerate = document.getElementById('customPromptModerate');
  const customPromptUltra = document.getElementById('customPromptUltra');
  const btnSave = document.getElementById('btnSave');
  const successMessage = document.getElementById('successMessage');
  const templateBtns = document.querySelectorAll('.template-btn');
  
  let settings = {
    apiKey: '',
    whitelist: [],
    customPrompts: {
      soft: '',
      moderate: '',
      ultra: ''
    }
  };
  
  // Templates de prompts
  const promptTemplates = {
    professional: {
      soft: 'Reformula este mensaje manteniendo un tono profesional y cortés, adecuado para comunicación empresarial.',
      moderate: 'Transforma este mensaje en una comunicación profesional, neutral y respetuosa. Elimina cualquier tono personal o emocional.',
      ultra: 'Convierte este mensaje en una comunicación corporativa extremadamente formal y diplomática, usando lenguaje ejecutivo.'
    },
    friendly: {
      soft: 'Ajusta este mensaje para que suene amigable y considerado, manteniendo la calidez sin ser conflictivo.',
      moderate: 'Reformula este mensaje con un tono amigable pero respetuoso, evitando cualquier posible fricción.',
      ultra: 'Transforma este mensaje para que sea extremadamente amigable y positivo, evitando completamente cualquier negatividad.'
    },
    formal: {
      soft: 'Reformula este mensaje con un tono más formal y educado.',
      moderate: 'Convierte este mensaje en una comunicación formal y distante, usando lenguaje ceremonioso.',
      ultra: 'Transforma este mensaje en una comunicación extremadamente formal, protocolar y ceremoniosa.'
    },
    empathetic: {
      soft: 'Ajusta este mensaje para mostrar más comprensión y empatía hacia el receptor.',
      moderate: 'Reformula este mensaje expresando comprensión profunda y validando los sentimientos del otro.',
      ultra: 'Transforma este mensaje para mostrar máxima empatía, comprensión y apoyo emocional completo.'
    }
  };
  
  // Cargar configuración guardada
  function loadSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        settings = { ...settings, ...result.settings };
        
        // Aplicar valores a los campos
        apiKeyInput.value = settings.apiKey || '';
        customPromptSoft.value = settings.customPrompts?.soft || '';
        customPromptModerate.value = settings.customPrompts?.moderate || '';
        customPromptUltra.value = settings.customPrompts?.ultra || '';
        
        // Cargar lista blanca
        renderWhitelist();
      }
    });
  }
  
  // Renderizar lista blanca
  function renderWhitelist() {
    whitelistItems.innerHTML = '';
    
    if (settings.whitelist && settings.whitelist.length > 0) {
      settings.whitelist.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'whitelist-item';
        itemDiv.innerHTML = `
          <span>${item}</span>
          <button class="btn-remove" data-index="${index}">Eliminar</button>
        `;
        whitelistItems.appendChild(itemDiv);
      });
      
      // Agregar event listeners a botones de eliminar
      document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          removeFromWhitelist(index);
        });
      });
    } else {
      whitelistItems.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No hay contactos en la lista blanca</p>';
    }
  }
  
  // Agregar a lista blanca
  function addToWhitelist() {
    const value = whitelistInput.value.trim();
    if (value && !settings.whitelist.includes(value)) {
      settings.whitelist.push(value);
      whitelistInput.value = '';
      renderWhitelist();
    }
  }
  
  // Eliminar de lista blanca
  function removeFromWhitelist(index) {
    settings.whitelist.splice(index, 1);
    renderWhitelist();
  }
  
  // Toggle visibilidad API Key
  toggleApiKeyBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleApiKeyBtn.textContent = 'Ocultar';
    } else {
      apiKeyInput.type = 'password';
      toggleApiKeyBtn.textContent = 'Mostrar';
    }
  });
  
  // Agregar a lista blanca
  btnAddWhitelist.addEventListener('click', addToWhitelist);
  whitelistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addToWhitelist();
    }
  });
  
  // Templates de prompts
  templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const template = btn.dataset.template;
      if (promptTemplates[template]) {
        customPromptSoft.value = promptTemplates[template].soft;
        customPromptModerate.value = promptTemplates[template].moderate;
        customPromptUltra.value = promptTemplates[template].ultra;
        
        // Feedback visual
        btn.style.background = '#e8f5e9';
        btn.style.borderColor = '#4caf50';
        setTimeout(() => {
          btn.style.background = '';
          btn.style.borderColor = '';
        }, 1000);
      }
    });
  });
  
  // Guardar configuración
  btnSave.addEventListener('click', async () => {
    // Validar API Key
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      alert('Por favor, ingresa tu API Key de OpenAI');
      apiKeyInput.focus();
      return;
    }
    
    // Preparar configuración
    settings.apiKey = apiKey;
    settings.customPrompts = {
      soft: customPromptSoft.value.trim(),
      moderate: customPromptModerate.value.trim(),
      ultra: customPromptUltra.value.trim()
    };
    
    // Guardar en storage
    chrome.storage.sync.set({ settings }, () => {
      // Mostrar mensaje de éxito
      successMessage.classList.add('show');
      window.scrollTo(0, 0);
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        successMessage.classList.remove('show');
      }, 3000);
      
      // Animar botón de guardar
      btnSave.textContent = '✅ Guardado';
      btnSave.style.background = '#28a745';
      
      setTimeout(() => {
        btnSave.textContent = '💾 Guardar Configuración';
        btnSave.style.background = '';
      }, 2000);
    });
  });
  
  // Inicializar
  loadSettings();
  
  // Auto-guardar lista blanca cuando cambie
  const autoSaveWhitelist = () => {
    chrome.storage.sync.set({ 
      settings: { ...settings }
    });
  };
  
  // Observar cambios en la lista blanca
  const originalPush = settings.whitelist.push;
  const originalSplice = settings.whitelist.splice;
  
  settings.whitelist.push = function(...args) {
    const result = originalPush.apply(this, args);
    autoSaveWhitelist();
    return result;
  };
  
  settings.whitelist.splice = function(...args) {
    const result = originalSplice.apply(this, args);
    autoSaveWhitelist();
    return result;
  };
});
