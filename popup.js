// popup.js - Script separado para el popup
document.addEventListener('DOMContentLoaded', () => {
  const toggleEnabled = document.getElementById('toggleEnabled');
  const apiWarning = document.getElementById('apiWarning');
  const btnOptions = document.getElementById('btnOptions');
  const btnWhitelist = document.getElementById('btnWhitelist');
  const levelBtns = document.querySelectorAll('.level-btn');
  
  // Cargar configuración actual
  chrome.storage.sync.get(['settings', 'stats'], (result) => {
    const settings = result.settings || {};
    const stats = result.stats || { filtered: 0, accepted: 0, rejected: 0 };
    
    // Estado de la extensión
    toggleEnabled.checked = settings.enabled !== false;
    
    // Mostrar advertencia si no hay API key
    if (!settings.apiKey) {
      apiWarning.classList.add('show');
    }
    
    // Nivel de diplomacia
    const currentLevel = settings.diplomacyLevel || 'moderate';
    levelBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === currentLevel);
    });
    
    // Estadísticas
    document.getElementById('statFiltered').textContent = stats.filtered || 0;
    document.getElementById('statAccepted').textContent = stats.accepted || 0;
    document.getElementById('statRejected').textContent = stats.rejected || 0;
  });
  
  // Toggle activado/desactivado
  toggleEnabled.addEventListener('change', () => {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || {};
      settings.enabled = toggleEnabled.checked;
      chrome.storage.sync.set({ settings });
    });
  });
  
  // Cambiar nivel de diplomacia
  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const level = btn.dataset.level;
      
      // Actualizar UI
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Guardar configuración
      chrome.storage.sync.get(['settings'], (result) => {
        const settings = result.settings || {};
        settings.diplomacyLevel = level;
        chrome.storage.sync.set({ settings });
      });
    });
  });
  
  // Botón de opciones - CORREGIDO
  btnOptions.addEventListener('click', () => {
    console.log('Abriendo opciones...');
    chrome.runtime.openOptionsPage();
  });
  
  // Botón de lista blanca - CORREGIDO
  btnWhitelist.addEventListener('click', () => {
    console.log('Abriendo lista blanca (opciones)...');
    chrome.runtime.openOptionsPage();
  });
});

