/* Lightweight growth UX — no framework. Lenis optional via CDN. */
(function () {
  'use strict';

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.g-reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Sticky nav demo CTA pulse (Glean-style) */
  var header = document.querySelector('.site-header');
  var demoBtn = document.querySelector('.nav-demo-cta');
  if (header && demoBtn) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 48);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Workspace mock tab switching */
  var mock = document.getElementById('workspaceMock');
  if (mock) {
    var panels = {
      overview: mock.querySelector('.ws-dashboard'),
      assistant: mock.querySelector('.ws-chat-panel')
    };
    mock.querySelectorAll('.ws-nav-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.getAttribute('data-view');
        mock.querySelectorAll('.ws-nav-item').forEach(function (b) {
          b.classList.toggle('on', b === btn);
        });
        if (panels.overview) panels.overview.classList.toggle('on', view === 'overview');
        if (panels.assistant) panels.assistant.classList.toggle('on', view === 'assistant');
      });
    });
  }

  /* Lenis smooth scroll — loaded from CDN on homepage only */
  if (window.Lenis) {
    var lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
})();
