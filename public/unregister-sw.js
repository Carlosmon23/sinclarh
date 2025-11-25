// Script para desregistrar service workers antigos
(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      registrations.forEach(function(registration) {
        registration.unregister().then(function(success) {
          if (success) {
            console.log('Service Worker desregistrado com sucesso');
            // Recarrega a página após desregistrar
            window.location.reload();
          }
        });
      });
    }).catch(function(err) {
      console.error('Erro ao desregistrar Service Worker:', err);
    });

    // Remove o cache do service worker
    if ('caches' in window) {
      caches.keys().then(function(names) {
        names.forEach(function(name) {
          caches.delete(name);
          console.log('Cache removido:', name);
        });
      });
    }
  }
})();





