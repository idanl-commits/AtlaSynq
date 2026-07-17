/* ============================================================
   site-demos.js — AtlaSynq Marketing Site Interactive Demos
   IIFE — runs on DOMContentLoaded. Guards all element lookups.
   ============================================================ */
(function () {
  'use strict';

  /* ─── UTILITIES ─────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /**
   * formatMarkdown — converts **bold** to <strong>.
   * Escapes HTML first to stay XSS-safe, then restores bold markers.
   */
  function formatMarkdown(text) {
    // 1. Escape HTML entities
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    // 2. Restore bold: **...** → <strong>...</strong>
    return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  /** Append a chat bubble to a feed element */
  function appendMsg(feed, text, role, citeTool) {
    if (!feed) return;
    const wrap = document.createElement('div');
    wrap.className = 'msg' + (role === 'user' ? ' user' : '');
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = formatMarkdown(text);
    if (citeTool) {
      const cite = document.createElement('span');
      cite.className = 'cite-tag';
      cite.textContent = citeTool;
      bubble.appendChild(cite);
    }
    wrap.appendChild(bubble);
    feed.appendChild(wrap);
    feed.scrollTop = feed.scrollHeight;
    return wrap;
  }

  /** Typing effect — writes text char-by-char into a span. Optional shouldContinue() aborts early. */
  async function typeText(el, text, speed, shouldContinue) {
    if (!el) return;
    el.textContent = '';
    const chars = [...text];
    for (const ch of chars) {
      if (shouldContinue && !shouldContinue()) return;
      el.textContent += ch;
      await sleep(speed || 38);
    }
  }

  /** Move fake mouse cursor to approximate position */
  function moveCursor(cursorEl, top, left) {
    if (!cursorEl) return;
    cursorEl.style.top  = top  + '%';
    cursorEl.style.left = left + '%';
  }

  /* ─── HERO SCENARIOS ────────────────────────────────────── */
  const HERO_SCENARIOS = [
    {
      id:        'sb-sales',
      agent:     'Sales Agent',
      question:  'Which deals are at risk of slipping this quarter?',
      answer:    '**3 deals are at risk** this quarter. Acme Corp ($120k) hasn\'t had activity in 14 days. Beta Industries closed-lost probability jumped to 62%. TechFlow Ltd needs a revised proposal by Friday or they re-evaluate in Q3.',
      tool:      'Salesforce CRM',
    },
    {
      id:        'sb-finance',
      agent:     'Finance Agent',
      question:  'What\'s our cash runway based on current burn?',
      answer:    '**18.4 months of runway** at current burn rate of $310k/mo. Cash position: $5.7M. Largest cost centre: Engineering at 44% of OpEx. If the Series A closes by Aug 15, runway extends to **31 months**.',
      tool:      'QuickBooks',
    },
    {
      id:        'sb-eng',
      agent:     'Engineering Agent',
      question:  'How many open P1 bugs are blocking the next release?',
      answer:    '**4 P1 bugs** are blocking v2.4.0. AUTH-881 (login timeout), API-1204 (rate limiter regression), UI-390 (blank dashboard on Safari 17), INFRA-77 (Redis failover lag). Estimated clear date: **July 14** based on current sprint velocity.',
      tool:      'Jira',
    },
    {
      id:        'sb-hr',
      agent:     'HR Agent',
      question:  'What\'s the current headcount plan for Q3 hiring?',
      answer:    '**Q3 headcount plan:** 7 open reqs — 2 Senior Engineers, 1 Product Designer, 1 Growth PM, 2 AEs, 1 Data Analyst. Current pipeline: 34 candidates in screen, 8 in final round. Projected offer dates: mid-July through August.',
      tool:      'Greenhouse ATS',
    },
    {
      id:        'sb-marketing',
      agent:     'Marketing Agent',
      question:  'How is our latest campaign performing vs target?',
      answer:    'The **"Governed AI" campaign** is at 78% of MQL target (312/400). Top channel: LinkedIn Ads (42% of leads). Email nurture sequence open rate: **34.2%** — 11pts above benchmark. Cost per MQL: $87, target was $95.',
      tool:      'HubSpot',
    },
    {
      id:        'sb-legal',
      agent:     'Legal Agent',
      question:  'Which vendor contracts expire in the next 60 days?',
      answer:    '**5 vendor contracts** expire within 60 days. AWS Enterprise (Aug 2 — $240k/yr), Okta SSO (Aug 9 — auto-renews unless cancelled), Stripe Platform (Aug 14), Datadog Pro (Aug 22), Notion Business (Sep 1). Renewal reminders sent to finance.',
      tool:      'DocuSign CLM',
    },
  ];

  /* ─── BUILDER SCENARIOS ─────────────────────────────────── */
  const BUILDER_SCENARIOS = [
    {
      roleId:    'role-finance',
      llmId:     'llm-gpt',
      agentName: 'Finance Agent',
      tabLabel:  'Finance',
      integrations: [
        { name: 'QuickBooks',  icon: '/images/quickbooks.png' },
        { name: 'Stripe',      icon: '/images/stripe.jpg'    },
        { name: 'Excel',       icon: '/images/excel.png'     },
        { name: 'Slack',       icon: '/images/slack.png'     },
        { name: 'Google Drive',icon: '/images/drive.png'     },
        { name: 'Notion',      icon: '/images/notion.png'    },
      ],
      convo: [
        { role: 'user',  text: 'Summarise last month\'s P&L' },
        { role: 'agent', text: '**Revenue:** $1.24M (+8% MoM). **Gross margin:** 72.3%. **Net burn:** $310k. Top cost: Engineering ($136k). I\'ve linked the full QuickBooks report.', tool: 'QuickBooks' },
      ],
      question: 'Summarise last month\'s P&L',
    },
    {
      roleId:    'role-sales',
      llmId:     'llm-claude',
      agentName: 'Sales Agent',
      tabLabel:  'Sales',
      integrations: [
        { name: 'Salesforce', icon: '/images/salesforce.png' },
        { name: 'HubSpot',   icon: '/images/hubspot.png'    },
        { name: 'Gong',      icon: '/images/gong.png'       },
        { name: 'Slack',     icon: '/images/slack.png'      },
        { name: 'Gmail',     icon: '/images/gmail.jpg'      },
        { name: 'LinkedIn',  icon: '/images/linkedin.png'   },
      ],
      convo: [
        { role: 'user',  text: 'Draft a follow-up for Acme Corp' },
        { role: 'agent', text: 'Based on the last call notes from **Gong**, I\'ve drafted a follow-up email highlighting the ROI calculator results. Sarah mentioned a June 30 budget freeze — I\'ve noted that in CRM and set a reminder for July 5.', tool: 'Gong' },
      ],
      question: 'Draft a follow-up for Acme Corp',
    },
    {
      roleId:    'role-eng',
      llmId:     'llm-gemini',
      agentName: 'Engineering Agent',
      tabLabel:  'Engineering',
      integrations: [
        { name: 'Jira',    icon: '/images/jira.png'    },
        { name: 'GitHub',  icon: '/images/github.jpg'  },
        { name: 'Slack',   icon: '/images/slack.png'   },
        { name: 'Linear',  icon: '/images/linear.png'  },
        { name: 'Notion',  icon: '/images/notion.png'  },
        { name: 'Teams',   icon: '/images/teams.png'   },
      ],
      convo: [
        { role: 'user',  text: 'What\'s blocking the v2.4 release?' },
        { role: 'agent', text: '**4 P1 issues** are blocking v2.4. AUTH-881 is assigned to @maya and is in review. The remaining 3 are in-progress. Sprint velocity suggests a **July 14 clearance** — I\'ve updated the release ticket in Jira.', tool: 'Jira' },
      ],
      question: 'What\'s blocking the v2.4 release?',
    },
  ];

  /* ─── HERO LOOP STATE ────────────────────────────────────── */
  let heroIndex    = 0;
  let heroPaused   = false;
  let heroTimeout  = null;
  let heroRunId    = 0; // cancels in-flight scenario when a newer one starts

  /**
   * Runs one hero chat scenario.
   * `instant` renders the full conversation with no delays — used for
   * the first paint so the demo never looks empty or broken.
   */
  async function runHeroScenario(scenario, instant) {
    const runId = ++heroRunId;
    const stillActive = () => runId === heroRunId;

    const feed        = $('heroFeed');
    const agentName   = $('heroAgentName');
    const heroZero    = $('heroZero');
    const heroChatUI  = $('heroChatUI');

    if (!feed) return;

    // Highlight active sidebar item
    HERO_SCENARIOS.forEach(s => {
      const el = $(s.id);
      if (el) el.classList.toggle('active', s.id === scenario.id);
    });

    // Show chat UI, hide zero state
    if (heroZero)   heroZero.style.display   = 'none';
    if (heroChatUI) heroChatUI.style.display = 'flex';
    if (agentName)  agentName.textContent    = scenario.agent;

    feed.innerHTML = '';

    if (instant) {
      appendMsg(feed, scenario.question, 'user');
      appendMsg(feed, scenario.answer, 'agent', scenario.tool);
      return;
    }

    // User question appears immediately — no fake typing theater
    appendMsg(feed, scenario.question, 'user');

    // Brief typing indicator, then the cited answer
    const typingEl = document.createElement('div');
    typingEl.className = 'msg';
    typingEl.innerHTML = '<div class="msg-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>';
    feed.appendChild(typingEl);
    feed.scrollTop = feed.scrollHeight;

    await sleep(900);
    if (!stillActive()) return;
    if (typingEl.parentNode) typingEl.remove();

    appendMsg(feed, scenario.answer, 'agent', scenario.tool);
    feed.scrollTop = feed.scrollHeight;
  }

  function scheduleNextHero(delay) {
    if (heroTimeout) clearTimeout(heroTimeout);
    heroTimeout = setTimeout(async () => {
      if (heroPaused) return;
      heroIndex = (heroIndex + 1) % HERO_SCENARIOS.length;
      await runHeroScenario(HERO_SCENARIOS[heroIndex]);
      if (!heroPaused) scheduleNextHero(6500);
    }, delay || 6500);
  }

  function runHeroLoop() {
    if (!$('heroApp')) return;

    // Wire sidebar click handlers
    HERO_SCENARIOS.forEach((scenario, i) => {
      const el = $(scenario.id);
      if (!el) return;
      el.addEventListener('click', async () => {
        heroPaused = true;
        if (heroTimeout) clearTimeout(heroTimeout);
        heroIndex = i;
        await runHeroScenario(scenario);
        // Resume auto-loop after user interaction
        heroPaused = false;
        scheduleNextHero(7000);
      });
    });

    // First paint: keep server-rendered demo if present; otherwise render instantly
    const feed = $('heroFeed');
    if (feed && feed.children.length > 0) {
      HERO_SCENARIOS.forEach((s, i) => {
        const el = $(s.id);
        if (el) el.classList.toggle('active', i === 0);
      });
      scheduleNextHero(6500);
    } else {
      runHeroScenario(HERO_SCENARIOS[0], true).then(() => {
        if (!heroPaused) scheduleNextHero(6500);
      });
    }
  }

  /* ─── BUILDER LOOP STATE ─────────────────────────────────── */
  let builderIndex   = 0;
  let builderPaused  = false;
  let builderTimeout = null;
  let builderRunId   = 0;

  async function runBuilderScenario(scenario) {
    const runId = ++builderRunId;
    const stillActive = () => runId === builderRunId;

    const cursor     = $('builderCursor');
    const detectText = $('detectText');
    const intGrid    = $('integrationsGrid');
    const govLoader  = $('govLoader');
    const govRole    = $('govRoleName');
    const chatResult = $('chatResult');
    const agentTitle = $('agentTitle');
    const cpFeed     = $('resChatFeed');
    const resTyper   = $('resTyper');
    const cpInput    = $('cpInputBox');
    const btnDeploy  = $('btn-deploy');

    // Mapping tab → step
    const tabStepMap = { tab1: 'step1', tab2: 'step2', tab3: 'step3', tab4: 'step4' };
    function activateTabAndStep(tabId) {
      ['tab1','tab2','tab3','tab4'].forEach(id => {
        const t = $(id);
        if (t) t.classList.toggle('active', id === tabId);
      });
      Object.entries(tabStepMap).forEach(([t, s]) => {
        const el = $(s);
        if (el) el.classList.toggle('active', t === tabId);
      });
    }

    // Deselect all cards
    ['llm-gpt','llm-claude','llm-gemini','llm-llama','llm-copilot','llm-perplexity',
     'role-finance','role-sales','role-eng','role-hr','role-marketing','role-legal']
      .forEach(id => { const el = $(id); if (el) el.classList.remove('selected'); });

    // ── Step 1: LLM select ──
    activateTabAndStep('tab1');
    moveCursor(cursor, 30, 25);
    await sleep(500);
    if (!stillActive()) return;
    const llmEl = $(scenario.llmId);
    if (llmEl) {
      moveCursor(cursor, parseFloat(llmEl.offsetTop) || 35, 30);
      await sleep(400);
      if (!stillActive()) return;
      llmEl.classList.add('selected');
    }
    await sleep(800);
    if (!stillActive()) return;

    // ── Step 2: Role select ──
    activateTabAndStep('tab2');
    moveCursor(cursor, 40, 45);
    await sleep(500);
    if (!stillActive()) return;
    const roleEl = $(scenario.roleId);
    if (roleEl) {
      roleEl.classList.add('selected');
      moveCursor(cursor, 45, 50);
    }
    await sleep(900);
    if (!stillActive()) return;

    // ── Step 3: Integrations ──
    activateTabAndStep('tab3');
    moveCursor(cursor, 50, 40);
    if (detectText) detectText.textContent = 'Detected tools for ' + scenario.tabLabel + ' team…';
    if (intGrid) {
      intGrid.innerHTML = '';
      for (const int of scenario.integrations) {
        if (!stillActive()) return;
        const card = document.createElement('div');
        card.className = 'int-card';
        card.innerHTML = `<img src="${int.icon}" alt="${int.name}" onerror="this.style.display='none'"><span>${int.name}</span><span class="int-check">&#10003;</span>`;
        intGrid.appendChild(card);
        await sleep(130);
      }
    }
    await sleep(900);
    if (!stillActive()) return;

    // ── Step 4: Deploy & preview ──
    activateTabAndStep('tab4');
    moveCursor(cursor, 60, 55);
    await sleep(500);
    if (!stillActive()) return;

    if (btnDeploy) {
      btnDeploy.classList.add('press');
      setTimeout(() => btnDeploy.classList.remove('press'), 320);
    }
    await sleep(300);
    if (!stillActive()) return;

    if (govLoader) govLoader.classList.add('active');
    if (govRole)   govRole.textContent = scenario.tabLabel;
    await sleep(1600);
    if (!stillActive()) return;
    if (govLoader) govLoader.classList.remove('active');

    if (chatResult) chatResult.style.display = 'flex';
    if (agentTitle) agentTitle.textContent   = scenario.agentName;
    if (cpFeed)     cpFeed.innerHTML         = '';
    moveCursor(cursor, 75, 60);

    if (cpInput && resTyper) {
      await typeText(resTyper, scenario.question, 40, stillActive);
      if (!stillActive()) return;
      await sleep(300);
      if (!stillActive()) return;
      resTyper.textContent = '';
    }

    if (cpFeed) {
      for (const turn of scenario.convo) {
        if (!stillActive()) return;
        if (turn.role === 'user') {
          appendMsg(cpFeed, turn.text, 'user');
          await sleep(700);
        } else {
          const typingEl = document.createElement('div');
          typingEl.className = 'msg';
          typingEl.innerHTML = '<div class="msg-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>';
          cpFeed.appendChild(typingEl);
          cpFeed.scrollTop = cpFeed.scrollHeight;
          await sleep(1200);
          if (!stillActive()) return;
          if (typingEl.parentNode) typingEl.remove();
          appendMsg(cpFeed, turn.text, 'agent', turn.tool || null);
          await sleep(300);
          cpFeed.scrollTop = cpFeed.scrollHeight;
        }
      }
    }
  }

  function scheduleNextBuilder(delay) {
    if (builderTimeout) clearTimeout(builderTimeout);
    builderTimeout = setTimeout(async () => {
      if (builderPaused) return;
      builderIndex = (builderIndex + 1) % BUILDER_SCENARIOS.length;
      await runBuilderScenario(BUILDER_SCENARIOS[builderIndex]);
      if (!builderPaused) scheduleNextBuilder(8000);
    }, delay || 8000);
  }

  function runBuilder() {
    if (!$('builderApp')) return;

    BUILDER_SCENARIOS.forEach((scenario, i) => {
      const el = $(scenario.roleId);
      if (!el) return;
      el.addEventListener('click', async () => {
        builderPaused = true;
        if (builderTimeout) clearTimeout(builderTimeout);
        builderIndex = i;
        await runBuilderScenario(scenario);
        builderPaused = false;
        scheduleNextBuilder(9000);
      });
    });

    runBuilderScenario(BUILDER_SCENARIOS[0]).then(() => {
      if (!builderPaused) scheduleNextBuilder(8000);
    });
  }

  /* ─── ROI CALCULATOR ─────────────────────────────────────── */
  function initROI() {
    // Dedicated ROI page has its own calculator (roiEmployeesInput).
    if ($('roiEmployeesInput')) return;

    const empEl      = $('roiEmployees');
    const hoursEl    = $('roiHours');
    const salaryEl   = $('roiSalary');
    const calcBtn    = $('roiCalcBtn');
    const savedEl    = $('roiHoursSaved');
    const dollarsEl  = $('roiDollars');
    const paybackEl  = $('roiPayback');

    // Need at least the output fields to bother wiring
    if (!savedEl && !dollarsEl && !paybackEl) return;

    function calcROI() {
      const employees = parseFloat(empEl  ? empEl.value  : 0) || 50;
      const hours     = parseFloat(hoursEl? hoursEl.value: 0) || 5;
      const salary    = parseFloat(salaryEl?salaryEl.value:0) || 80000;

      // 30% of manual research hours saved (conservative)
      const hourlyRate   = salary / 2080;
      const weeklyHours  = employees * hours;
      const hoursSaved   = Math.round(weeklyHours * 0.30 * 52);
      const dollarsSaved = Math.round(hoursSaved * hourlyRate);

      // Payback vs Team plan pricing ($49/user/month)
      const annualCost   = employees * 49 * 12;
      const paybackMths  = dollarsSaved > 0
        ? Math.max(1, Math.round((annualCost / dollarsSaved) * 12))
        : 0;

      if (savedEl)   savedEl.textContent   = hoursSaved.toLocaleString() + ' hrs/yr';
      if (dollarsEl) dollarsEl.textContent = '$' + dollarsSaved.toLocaleString();
      if (paybackEl) paybackEl.textContent = paybackMths <= 1 ? '< 1 month' : paybackMths + ' months';
    }

    // Live update on input change
    [empEl, hoursEl, salaryEl].forEach(el => {
      if (el) el.addEventListener('input', calcROI);
    });

    // Button click
    if (calcBtn) calcBtn.addEventListener('click', calcROI);

    // Initial calculation
    calcROI();
  }

  /* ─── LEAD FORM ──────────────────────────────────────────── */
  function initLeadForm() {
    const form = $('homeLeadForm');
    if (!form) return;

    const msgEl = form.querySelector('.lead-form-msg') ||
                  (() => {
                    const m = document.createElement('div');
                    m.className = 'lead-form-msg';
                    form.appendChild(m);
                    return m;
                  })();

    const apiBase = (() => {
      if (typeof window === 'undefined') return 'https://api.atlasynq.com';
      const h = window.location.hostname;
      if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:8000';
      return 'https://api.atlasynq.com';
    })();

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');

      msgEl.textContent = '';
      msgEl.className   = 'lead-form-msg';

      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(apiBase + '/api/cp/public/pricing-lead', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(data),
        });

        if (res.ok) {
          msgEl.textContent = 'Thanks — we\'ll be in touch shortly.';
          msgEl.classList.add('success');
          form.reset();
        } else {
          throw new Error('non-ok');
        }
      } catch {
        msgEl.textContent = 'Something went wrong — please email us at hello@atlasynq.com';
        msgEl.classList.add('error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  /* ─── HUB LINE ANIMATION ─────────────────────────────────── */
  function updateLines() {
    const hub = $('hub-center');
    const wrap = hub && hub.parentElement;
    if (!hub || !wrap) return;

    const wrapRect = wrap.getBoundingClientRect();
    const hubRect = hub.getBoundingClientRect();
    const hubX = hubRect.left - wrapRect.left + hubRect.width / 2;
    const hubY = hubRect.top - wrapRect.top + hubRect.height / 2;

    [
      { sat: 'sat-1', line: 'line-1' },
      { sat: 'sat-2', line: 'line-2' },
      { sat: 'sat-3', line: 'line-3' },
      { sat: 'sat-4', line: 'line-4' },
    ].forEach(conn => {
      const satEl = $(conn.sat);
      const lineEl = $(conn.line);
      if (!satEl || !lineEl) return;
      const satRect = satEl.getBoundingClientRect();
      const satX = satRect.left - wrapRect.left + satRect.width / 2;
      const satY = satRect.top - wrapRect.top + satRect.height / 2;
      const dx = satX - hubX;
      const dy = satY - hubY;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      lineEl.style.width = len + 'px';
      lineEl.style.left = hubX + 'px';
      lineEl.style.top = hubY + 'px';
      lineEl.style.transformOrigin = '0 50%';
      lineEl.style.transform = `rotate(${angle}deg)`;
      lineEl.style.height = lineEl.style.height || '2px';
      lineEl.style.background = lineEl.style.background || 'rgba(201,106,74,0.35)';
      lineEl.style.pointerEvents = 'none';
    });
  }

  /* ─── MOBILE MENU ────────────────────────────────────────── */
  function initMobileMenu() {
    const btn     = $('hamburgerBtn');
    const overlay = $('mobileMenu');
    const closeBtn= $('closeMobileMenu');

    if (!btn || !overlay) return;

    function open()  { overlay.classList.add('active');    document.body.style.overflow = 'hidden'; }
    function close() { overlay.classList.remove('active'); document.body.style.overflow = ''; }

    btn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    // Close on nav link click
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  /* ─── COOKIE CONSENT ─────────────────────────────────────── */
  function initCookies() {
    const banner    = $('cookieBanner');
    const acceptBtn = banner && banner.querySelector('.btn-cookie-accept');
    const declineBtn= banner && banner.querySelector('.btn-cookie-decline');
    const manageLink= $('cookieManageLink');
    const modal     = $('cookieModal');
    const closeModal= $('cookieModalClose');
    const saveBtn   = $('cookieSaveBtn');

    if (!banner) return;

    function hideBanner() {
      banner.style.setProperty('display', 'none', 'important');
    }

    function showBanner() {
      banner.classList.add('visible');
    }

    // Check stored preference
    try {
      if (!localStorage.getItem('atlasynq_cookie_consent')) {
        setTimeout(showBanner, 1800);
      }
    } catch {
      setTimeout(showBanner, 1800);
    }

    function acceptAll() {
      try { localStorage.setItem('atlasynq_cookie_consent', 'accepted'); } catch {}
      hideBanner();
      if (typeof gtag === 'function') {
        gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' });
      }
    }

    function declineAll() {
      try { localStorage.setItem('atlasynq_cookie_consent', 'declined'); } catch {}
      hideBanner();
    }

    if (acceptBtn)  acceptBtn.addEventListener('click', acceptAll);
    if (declineBtn) declineBtn.addEventListener('click', declineAll);

    if (manageLink && modal) {
      manageLink.addEventListener('click', e => {
        e.preventDefault();
        modal.classList.add('active');
      });
    }

    if (closeModal && modal) {
      closeModal.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    if (saveBtn && modal) {
      saveBtn.addEventListener('click', () => {
        const analytics = $('cookieAnalytics');
        const marketing = $('cookieMarketing');
        const prefs = {
          analytics: analytics ? analytics.checked : false,
          marketing: marketing ? marketing.checked : false,
        };
        try { localStorage.setItem('atlasynq_cookie_prefs', JSON.stringify(prefs)); } catch {}
        try { localStorage.setItem('atlasynq_cookie_consent', 'customised'); } catch {}
        modal.classList.remove('active');
        hideBanner();
        if (typeof gtag === 'function') {
          gtag('consent', 'update', {
            analytics_storage: prefs.analytics ? 'granted' : 'denied',
            ad_storage:        prefs.marketing ? 'granted' : 'denied',
          });
        }
      });
    }
  }

  /* ─── SCROLL FADE-UP OBSERVER ────────────────────────────── */
  function initFadeObs() {
    if (!window.IntersectionObserver) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-fade]').forEach(el => obs.observe(el));
  }

  /* ─── HUB LINES RESIZE HANDLER ───────────────────────────── */
  function initHubLines() {
    if (!document.querySelector('.hub-line')) return;
    updateLines();
    window.addEventListener('resize', updateLines);
  }

  /* ─── BUILDER CARD CLICK WIRING (step1 LLMs) ────────────── */
  function initBuilderCardClicks() {
    const llmIds = ['llm-gpt','llm-claude','llm-gemini','llm-llama','llm-copilot','llm-perplexity'];
    llmIds.forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('click', () => {
        llmIds.forEach(i => { const e2=$(i); if(e2) e2.classList.remove('selected'); });
        el.classList.add('selected');
      });
    });
  }

  /* ─── ACTIVE NAV LINK ────────────────────────────────────── */
  function initActiveNav() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-links a, .mobile-menu-panel a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const normHref = href.replace(/\/$/, '') || '/';
      if (normHref && normHref !== '/' && path.startsWith(normHref)) {
        a.classList.add('active');
      } else if (normHref === '/' && path === '/') {
        a.classList.add('active');
      }
    });
  }

  /* ─── SMOOTH SCROLL FOR ANCHOR LINKS ────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ─── INIT ───────────────────────────────────────────────── */
  function init() {
    initMobileMenu();
    initCookies();
    initROI();
    initLeadForm();
    initFadeObs();
    initHubLines();
    initBuilderCardClicks();
    initActiveNav();
    initSmoothScroll();

    // Stagger demo starts slightly so they don't fight for CPU on load
    setTimeout(runHeroLoop,   600);
    setTimeout(runBuilder,   1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
