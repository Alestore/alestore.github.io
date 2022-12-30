(function (ext) {
  // Restituisce il nome del sistema operativo utilizzato dall'utente
  function sistemaOperativo() {
    return window.navigator.platform;
  }

  // Registra i nuovi blocchi di codice con Scratch
  ext._shutdown = function () {};
  ext._getStatus = function () {
    return {status: 2, msg: 'Pronto'};
  };
  ext.sistema_operativo = sistemaOperativo;
  var descriptor = {
    blocks: [
      ['r', 'sistema operativo', 'sistema_operativo']
    ],
  };
  ScratchExtensions.register('Sistema operativo', descriptor, ext);
})({});
