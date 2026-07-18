/* Homepage only — workspace mock tabs. No scroll hijacking. */
(function () {
  'use strict';
  var mock = document.getElementById('workspaceMock');
  if (!mock) return;

  var panels = {
    overview: mock.querySelector('.ws-dashboard'),
    assistant: mock.querySelector('.ws-chat-panel')
  };

  mock.querySelectorAll('.ws-nav-item[data-view]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var view = btn.getAttribute('data-view');
      mock.querySelectorAll('.ws-nav-item[data-view]').forEach(function (b) {
        b.classList.toggle('on', b === btn);
      });
      if (panels.overview) panels.overview.classList.toggle('on', view === 'overview');
      if (panels.assistant) panels.assistant.classList.toggle('on', view === 'assistant');
    });
  });
})();
