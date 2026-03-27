/* ============================================================
   CHATBOT — Zakaria Chamekh Portfolio
   Vanilla JS · No external dependencies
   ============================================================ */

(function () {
  'use strict';

  /* ── Q & A Database ─────────────────────────────────────── */
  const QA_HOME = [
    {
      id: 'who',
      label: '👤  Who are you?',
      answer:
        "I'm <strong>Zakaria Chamekh</strong>, a passionate Full Stack web developer based in <span class='cb-highlight'>Casablanca</span>. I specialize in building modern, responsive web applications with a strong focus on performance and immersive UI/UX. 🚀",
    },
    {
      id: 'services',
      label: '🛠️  What services do you offer?',
      answer:
        'I offer a full range of digital services: <br>• <strong>Web Development</strong> — React, Laravel, WordPress<br>• <strong>API design</strong> & backend architecture<br>• <strong>UI/UX</strong> design & prototyping (Figma)<br>• <strong>3D / WebGL</strong> interactive experiences<br><br>Let\'s build something amazing together! 💡',
    },
    {
      id: 'tech',
      label: '⚡  What technologies do you use?',
      answer:
        '🧰 My tech stack includes:<br><br><strong>Front‑End:</strong> React · Three.js · GSAP · Tailwind<br><strong>Back‑End:</strong> Laravel · PHP · MySQL · Node.js<br><strong>Tools:</strong> Figma · Git · Postman · WordPress<br><br>Always learning, always growing! 📚',
    },
    {
      id: 'projects',
      label: '🎨  Show me your projects',
      answer:
        "Sure! Here are some highlights:<br><br>🎮 <strong>La Casa De Papel Game</strong> — interactive quiz game<br>🛒 <strong>05‑Electro</strong> — e‑commerce (React + Laravel)<br>🌐 <strong>Spark Vision</strong> — company site (WordPress)<br>☁️ <strong>05 Météo</strong> — weather app with live API<br>📚 <strong>Bibliotique</strong> — library management platform<br><br>Scroll up to the <strong>Projects</strong> section to see them live! ⬆️",
    },
    {
      id: 'contact',
      label: '📬  How can I contact you?',
      answer:
        "I'd love to hear from you! 😊<br><br>📧 <strong>Email:</strong> Use the contact form above<br>💼 <strong>LinkedIn:</strong> Connect with me professionally<br>🐙 <strong>GitHub:</strong> Check out my code<br><br>Don't hesitate — let's create something great together! ✨",
    },
  ];

  const QA_SERVICES = [
    {
      id: 's_web',
      label: '💻  Développement Web ?',
      answer: "C'est mon cœur de métier. Je crée des applications sur-mesure hyper modernes avec React côté front et Laravel côté Backend. L'architecture est ultra-rapide (SSR/CSR) et complètement sécurisée.",
    },
    {
      id: 's_3d',
      label: '🧊  Expériences 3D & WebGL ?',
      answer: "Grâce à Three.js et GSAP, je donne vie au design web. Les sites ne sont plus de simples pages 2D, ils deviennent de réelles expériences interactives virtuelles (comme mon portfolio).",
    },
    {
      id: 's_ecom',
      label: '🛒  Boutiques E-commerce ?',
      answer: "Je conçois des boutiques clés en main (WordPress/WooCommerce ou React/Laravel), faites pour générer des ventes. Incluant le paiement en ligne, le panel administrateur et la gestion des livraisons.",
    },
    {
      id: 's_seo',
      label: '🚀  Comment se passe le SEO ?',
      answer: "Mon code est optimisé pour les moteurs de recherche (Google). Structure sémantique, temps de chargement éclair, et balises dynamiques. Tout est prêt pour vous placer sur la 1ère page.",
    },
    {
      id: 's_contact',
      label: '📬  Comment démarrer un projet ?',
      answer: "C'est très simple ! 🚀 Utilisez le gigantesque lien email en fin de page ou écrivez-moi directement à zakariach05@gmail.com pour en discuter.",
    }
  ];

  const QA = window.location.pathname.includes('services.html') ? QA_SERVICES : QA_HOME;

  /* ── DOM refs ───────────────────────────────────────────── */
  const toggle   = document.getElementById('cb-toggle');
  const window_  = document.getElementById('cb-window');
  const closeBtn = document.getElementById('cb-close');
  const messages = document.getElementById('cb-messages');
  const pills    = document.getElementById('cb-pills');

  if (!toggle || !window_ || !closeBtn || !messages || !pills) return;

  /* ── State ──────────────────────────────────────────────── */
  let isOpen    = false;
  let isTyping  = false;
  let greeted   = false;

  /* ── Helpers ────────────────────────────────────────────── */
  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function createBubble(html, role, animate = true) {
    const wrap = document.createElement('div');
    wrap.className = `cb-msg cb-msg--${role}${animate ? ' cb-msg--in' : ''}`;

    if (role === 'bot') {
      const avatar = document.createElement('div');
      avatar.className = 'cb-avatar';
      avatar.innerHTML = '<img src="NV-IMG/heroP1.png" alt="Zak">';
      wrap.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'cb-bubble';
    bubble.innerHTML = html;
    wrap.appendChild(bubble);
    messages.appendChild(wrap);

    requestAnimationFrame(() => {
      scrollToBottom();
    });
    return wrap;
  }

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'cb-msg cb-msg--bot cb-msg--in';
    wrap.id = 'cb-typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'cb-avatar';
    avatar.innerHTML = '<img src="NV-IMG/heroP1.png" alt="Zak">';
    wrap.appendChild(avatar);

    const bubble = document.createElement('div');
    bubble.className = 'cb-bubble cb-typing';
    bubble.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(bubble);

    messages.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function removeTyping() {
    const el = document.getElementById('cb-typing-indicator');
    if (el) el.remove();
  }

  function sendAnswer(qa) {
    if (isTyping) return;
    isTyping = true;

    /* Disable pills during response */
    pills.classList.add('cb-pills--disabled');

    /* User message */
    createBubble(qa.label.replace(/^[\p{Emoji}\s]+/u, '').trim(), 'user');

    /* Typing animation */
    const delay = 900 + Math.random() * 600;
    showTyping();

    setTimeout(() => {
      removeTyping();
      createBubble(qa.answer, 'bot');
      isTyping = false;
      pills.classList.remove('cb-pills--disabled');
    }, delay);
  }

  function buildPills() {
    pills.innerHTML = '';
    QA.forEach(qa => {
      const btn = document.createElement('button');
      btn.className = 'cb-pill';
      btn.innerHTML = qa.label;
      btn.addEventListener('click', () => sendAnswer(qa));
      pills.appendChild(btn);
    });
  }

  function openChat() {
    isOpen = true;
    window_.classList.add('cb-window--open');
    toggle.classList.add('cb-toggle--active');
    toggle.setAttribute('aria-expanded', 'true');

    /* Welcome message — only once */
    if (!greeted) {
      greeted = true;
      setTimeout(() => {
        createBubble("Hi there! 👋 I'm <strong>Zak</strong>, your virtual assistant. Ask me anything about Zakaria!", 'bot', false);
        scrollToBottom();
      }, 300);
    }
  }

  function closeChat() {
    isOpen = false;
    window_.classList.remove('cb-window--open');
    toggle.classList.remove('cb-toggle--active');
    toggle.setAttribute('aria-expanded', 'false');
  }

  /* ── Events ─────────────────────────────────────────────── */
  toggle.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  /* Close on backdrop click */
  document.addEventListener('click', e => {
    if (isOpen && !window_.contains(e.target) && !toggle.contains(e.target)) {
      closeChat();
    }
  });

  /* Keyboard close */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

  /* ── Init ───────────────────────────────────────────────── */
  buildPills();

  /* Notification badge pulse after 3 s */
  setTimeout(() => {
    const badge = document.getElementById('cb-badge');
    if (badge && !isOpen) badge.classList.add('cb-badge--show');
  }, 3000);

})();
