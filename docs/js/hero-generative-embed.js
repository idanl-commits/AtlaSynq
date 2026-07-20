/* Homepage hero — generative embed on local dev; static demo on production */
(function () {
  "use strict";

  var shell = document.getElementById("heroGenerativeEmbed");
  var frame = document.getElementById("heroGenerativeFrame");
  var fallback = document.getElementById("heroDemoFallback");
  if (!fallback) return;

  var host = window.location.hostname;
  var isLocal = host === "localhost" || host === "127.0.0.1";

  function showStaticDemo() {
    document.documentElement.dataset.heroDemo = "static";
    if (shell) {
      shell.hidden = true;
      shell.classList.add("is-fallback");
    }
    if (frame) frame.remove();
    fallback.hidden = false;
    window.dispatchEvent(new CustomEvent("atlasynq-hero-fallback"));
  }

  function showEmbed() {
    if (!shell || !frame) {
      showStaticDemo();
      return;
    }
    fallback.hidden = true;
    shell.hidden = false;

    var ready = false;
    var failTimer = window.setTimeout(function () {
      if (!ready) showStaticDemo();
    }, 3500);

    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "atlasynq-hero-ready") {
        ready = true;
        window.clearTimeout(failTimer);
        shell.classList.add("is-ready");
      }
    });

    frame.addEventListener("error", function () {
      if (!ready) showStaticDemo();
    });

    frame.src = "http://localhost:3001/embed/hero";
  }

  if (isLocal) {
    showEmbed();
  } else {
    showStaticDemo();
  }
})();
