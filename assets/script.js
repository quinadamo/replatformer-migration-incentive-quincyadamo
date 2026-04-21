/**
 * Replatformer Migration Incentive - E2E Prototype
 * Shared interactions + flow state helpers
 */

const FLOW_STEPS = [
  { href: 'index.html', label: 'Entry' },
  { href: 'landing.html', label: 'Landing' },
  { href: 'cloning.html', label: 'Cloning' },
  { href: 'preview.html', label: 'Preview' },
  { href: 'auth.html', label: 'Sign up' },
  { href: 'admin.html', label: 'Admin' },
  { href: 'live.html', label: 'Live' },
];

const ENTRY_PAGES = new Set(['email.html', 'social.html', 'sem.html']);

function currentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path;
}

function renderProtoChrome() {
  const body = document.body;
  if (body.dataset.noProto === 'true') return;
  body.classList.add('has-proto-chrome');

  const page = currentPage();
  const entryLabels = { 'email.html': 'Email', 'social.html': 'FB Ad', 'sem.html': 'Google' };
  const isEntry = ENTRY_PAGES.has(page);
  const currentLabel = isEntry ? `Entry: ${entryLabels[page]}` : (FLOW_STEPS.find(s => s.href === page)?.label || 'Prototype');
  const flowPosition = isEntry ? 1 : Math.max(0, FLOW_STEPS.findIndex(s => s.href === page));

  let stepsHtml = '';
  FLOW_STEPS.forEach((step, i) => {
    const isCurrent = step.href === page || (isEntry && i === 1);
    const isDone = i < flowPosition;
    const cls = isCurrent ? 'proto-topbar__step--active' : (isDone ? 'proto-topbar__step--done' : '');
    stepsHtml += `<span class="proto-topbar__step ${cls}">${i + 1}. ${step.label}</span>`;
  });

  const bar = document.createElement('div');
  bar.className = 'proto-topbar';
  bar.innerHTML = `
    <div class="proto-topbar__label">
      <span class="proto-topbar__dot"></span>
      Prototype: Replatformer Migration Incentive E2E · <strong style="opacity:1;margin-left:4px">${currentLabel}</strong>
    </div>
    <div class="proto-topbar__nav">${stepsHtml}</div>
    <div class="proto-topbar__actions">
      <a href="index.html" class="proto-topbar__btn">Restart</a>
    </div>
  `;
  body.insertBefore(bar, body.firstChild);
}

/**
 * Cloning page: step through simulated scraping + theme build stages.
 */
function initCloningFlow() {
  const steps = document.querySelectorAll('[data-cloning-step]');
  if (!steps.length) return;

  const total = steps.length;
  let i = 0;

  function advance() {
    if (i > 0) {
      steps[i - 1].classList.remove('cloning__step--active');
      steps[i - 1].classList.add('cloning__step--done');
      steps[i - 1].querySelector('.cloning__step-icon').innerHTML = '✓';
    }
    if (i < total) {
      steps[i].classList.remove('cloning__step--pending');
      steps[i].classList.add('cloning__step--active');
      i += 1;
      const thisStepDuration = parseInt(steps[i - 1]?.dataset.duration || '1800', 10);
      setTimeout(advance, thisStepDuration);
    } else {
      document.body.dataset.cloningComplete = 'true';
      document.dispatchEvent(new CustomEvent('cloning:complete'));
    }
  }

  setTimeout(advance, 700);
}

/**
 * SQ state machine: one question at a time, smooth transitions.
 * Data is read from window.SQ_QUESTIONS if present.
 */
function initSqStateMachine() {
  const stage = document.getElementById('sq-stage');
  if (!stage || !window.SQ_QUESTIONS) return;

  const questions = window.SQ_QUESTIONS;
  const state = { index: 0, answers: {} };

  const slideHost = stage.querySelector('[data-sq-slide]');
  const dotsHost = stage.querySelector('[data-sq-dots]');
  const countLabel = stage.querySelector('[data-sq-count]');
  const prevBtn = stage.querySelector('[data-sq-prev]');
  const nextBtn = stage.querySelector('[data-sq-skip]');
  const ctaBtn = document.getElementById('cloning-continue');

  function renderDots() {
    if (!dotsHost) return;
    dotsHost.innerHTML = questions.map((q, i) => {
      const cls = i < state.index ? 'sq-stage__dot--done' : (i === state.index ? 'sq-stage__dot--active' : '');
      return `<span class="sq-stage__dot ${cls}"></span>`;
    }).join('');
  }

  function renderCount() {
    if (!countLabel) return;
    if (state.index >= questions.length) {
      countLabel.innerHTML = `<strong>All set</strong>`;
    } else {
      countLabel.innerHTML = `Question <strong>${state.index + 1}</strong> of <strong>${questions.length}</strong>`;
    }
  }

  function renderNav() {
    if (prevBtn) prevBtn.classList.toggle('is-disabled', state.index === 0 || state.index >= questions.length);
    if (nextBtn) nextBtn.textContent = state.index >= questions.length - 1 ? 'Skip to launch' : 'Skip';
  }

  function renderSlide() {
    const existing = slideHost.querySelector('.sq-slide, .sq-done');
    if (existing) existing.classList.add('is-exiting');

    setTimeout(() => {
      slideHost.innerHTML = state.index >= questions.length ? renderDone() : renderQuestion(questions[state.index]);
      bindSlide();
    }, existing ? 220 : 0);
  }

  function renderQuestion(q) {
    const selected = state.answers[q.id];
    const optsHtml = q.options.map(opt => {
      const isSelected = selected === opt.key ? 'is-selected' : '';
      return `
        <button class="sq-slide__option ${isSelected}" data-key="${opt.key}">
          <span class="sq-slide__option-emoji">${opt.emoji}</span>
          <span class="sq-slide__option-text">
            <span class="sq-slide__option-label">${opt.label}</span>
            ${opt.sub ? `<span class="sq-slide__option-sub">${opt.sub}</span>` : ''}
          </span>
          <span class="sq-slide__option-check">✓</span>
        </button>
      `;
    }).join('');

    return `
      <div class="sq-slide">
        <span class="sq-slide__lead">
          <span class="sq-slide__lead-emoji">${q.emoji}</span>
          ${q.lead}
        </span>
        <h2 class="sq-slide__question">${q.question}</h2>
        <div class="sq-slide__options">${optsHtml}</div>
      </div>
    `;
  }

  function renderDone() {
    const summary = questions.map(q => {
      const ans = state.answers[q.id];
      const opt = q.options.find(o => o.key === ans);
      return `
        <div class="sq-done__summary-item">
          <span class="sq-done__summary-label">${q.lead}</span>
          <span class="sq-done__summary-value">${opt ? opt.label : 'Skipped'}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="sq-done">
        <div class="sq-done__emoji">🎯</div>
        <h2 class="sq-done__title">You're all set, Chris.</h2>
        <p class="sq-done__sub">We'll pre-configure your Shopify admin so you're ready to launch the moment your store is built.</p>
        <div class="sq-done__summary">${summary}</div>
        <p style="font-size: 13px; color: var(--ink-tertiary); margin-top: 8px;">Sidekick will pick up from here once you're in admin.</p>
      </div>
    `;
  }

  function bindSlide() {
    slideHost.querySelectorAll('.sq-slide__option').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = questions[state.index];
        const key = btn.dataset.key;
        state.answers[q.id] = key;

        slideHost.querySelectorAll('.sq-slide__option').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');

        setTimeout(() => {
          state.index = Math.min(state.index + 1, questions.length);
          renderDots();
          renderCount();
          renderNav();
          renderSlide();
          updateCta();
        }, 500);
      });
    });
  }

  function updateCta() {
    if (!ctaBtn) return;
    const cloningDone = document.body.dataset.cloningComplete === 'true';
    const allAnswered = state.index >= questions.length;
    if (cloningDone) {
      ctaBtn.removeAttribute('disabled');
      ctaBtn.style.opacity = '1';
      ctaBtn.textContent = allAnswered ? 'See your store →' : 'See your store →';
    }
  }

  prevBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (prevBtn.classList.contains('is-disabled')) return;
    state.index = Math.max(0, state.index - 1);
    renderDots();
    renderCount();
    renderNav();
    renderSlide();
  });

  nextBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (state.index >= questions.length - 1) {
      state.index = questions.length;
    } else {
      state.index += 1;
    }
    renderDots();
    renderCount();
    renderNav();
    renderSlide();
    updateCta();
  });

  document.addEventListener('cloning:complete', updateCta);

  renderDots();
  renderCount();
  renderNav();
  renderSlide();
}

/**
 * Landing form: enter submits to cloning.
 */
function initLandingForm() {
  const form = document.getElementById('landing-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    window.location.href = 'cloning.html';
  });
}

/**
 * Confetti for live page. Lightweight, no deps.
 */
function fireConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#008060', '#00a676', '#80e6b8', '#1a4d2e', '#c5422a', '#d4a04d', '#ffffff'];
  const particles = [];
  const count = 180;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -22 - 4,
      w: 8 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.3,
      gravity: 0.38 + Math.random() * 0.2,
      drag: 0.99,
      life: 1,
    });
  }

  let running = true;

  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = 0;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive += 1;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y > canvas.height + 40) p.life = 0;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (alive === 0) {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    requestAnimationFrame(tick);
  }

  tick();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProtoChrome();
  initCloningFlow();
  initSqStateMachine();
  initLandingForm();

  if (document.body.dataset.page === 'live') {
    setTimeout(fireConfetti, 250);
    setTimeout(fireConfetti, 1400);
  }
});
