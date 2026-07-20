/* Homepage hero — loads assistant-ui generative demo from control-plane-web embed */
(function () {
  "use strict";

  var shell = document.getElementById("heroGenerativeEmbed");
  var frame = document.getElementById("heroGenerativeFrame");
  var fallback = document.getElementById("heroDemoFallback");
  if (!shell || !frame) return;

  function embedOrigin() {
    var host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3001";
    }
    if (host === "www.atlasynq.com" || host === "atlasynq.com") {
      return "https://app.atlasynq.com";
    }
    return "https://app.atlasynq.com";
  }

  function showFallback() {
    shell.classList.add("is-fallback");
    frame.remove();
    if (fallback) {
      fallback.hidden = false;
    }
    document.documentElement.dataset.heroDemo = "static";
    window.dispatchEvent(new CustomEvent("atlasynq-hero-fallback"));
  }

  var ready = false;
  var failTimer = window.setTimeout(function () {
    if (!ready) showFallback();
  }, 10000);

  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "atlasynq-hero-ready") {
      ready = true;
      window.clearTimeout(failTimer);
      shell.classList.add("is-ready");
    }
  });

  frame.addEventListener("error", function () {
    if (!ready) showFallback();
  });

  frame.src = embedOrigin() + "/embed/hero";
})();
