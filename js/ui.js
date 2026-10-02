// js/ui.js
// Shared UI utilities, toasts, bottom navigation, modals, and rest timer

/**
 * Displays a sleek modern toast notification
 * @param {string} message - Notification text
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} duration - Milliseconds
 */
export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slide-up`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-content">${message}</div>
    <button class="toast-close" aria-label="إغلاق">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Renders the top header and bottom navigation bar on pages
 * @param {string} activePage - 'dashboard' | 'workout' | 'schedule' | 'nutrition' | 'progress' | 'coach' | 'settings'
 * @param {Object} [userProfile]
 */
export function renderNavigation(activePage, userProfile = null) {
  // 1. Render Top Header if header element exists or placeholder
  const headerContainer = document.getElementById('app-header');
  if (headerContainer) {
    const userInitial = userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : '👤';
    headerContainer.innerHTML = `
      <div class="header-inner">
        <a href="dashboard.html" class="logo-link">
          <div class="logo-icon">⚡</div>
          <div class="logo-text">
            <span class="logo-title">وحش الجيم</span>
            <span class="logo-sub">Gym Assistant</span>
          </div>
        </a>
        <div class="header-actions">
          <a href="coach.html" class="coach-badge ${activePage === 'coach' ? 'active' : ''}" title="اسأل الكابتن الذكي">
            <span class="sparkle">✨</span>
            <span class="coach-label">كابتن AI</span>
          </a>
          <a href="settings.html" class="user-avatar-btn" title="الإعدادات">
            <div class="user-avatar">${userInitial}</div>
          </a>
        </div>
      </div>
    `;
  }

  // 2. Render Bottom Nav Bar if bottom-nav container exists
  const navContainer = document.getElementById('bottom-nav');
  if (navContainer) {
    const navItems = [
      {
        id: 'dashboard',
        label: 'الرئيسية',
        url: 'dashboard.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
      },
      {
        id: 'workout',
        label: 'التمرين',
        url: 'workout.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4M6 12h12"></path></svg>`
      },
      {
        id: 'schedule',
        label: 'الجدول',
        url: 'schedule.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>`
      },
      {
        id: 'nutrition',
        label: 'التغذية',
        url: 'nutrition.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
      },
      {
        id: 'progress',
        label: 'التقدم',
        url: 'progress.html',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`
      }
    ];

    navContainer.innerHTML = `
      <div class="bottom-nav-inner">
        ${navItems.map(item => `
          <a href="${item.url}" class="nav-tab ${activePage === item.id ? 'active' : ''}">
            <div class="nav-icon">${item.icon}</div>
            <span class="nav-label">${item.label}</span>
          </a>
        `).join('')}
      </div>
    `;
  }
}

/**
 * Rest Timer Manager
 */
class RestTimer {
  constructor() {
    this.totalSeconds = 90;
    this.remainingSeconds = 90;
    this.intervalId = null;
    this.isRunning = false;
    this.audioContext = null;
  }

  createWidget() {
    let widget = document.getElementById('rest-timer-widget');
    if (widget) return widget;

    widget = document.createElement('div');
    widget.id = 'rest-timer-widget';
    widget.className = 'rest-timer-widget hidden';
    widget.innerHTML = `
      <div class="timer-card">
        <div class="timer-header">
          <div class="timer-title">
            <span class="timer-pulse"></span>
            <span>وقت الراحة بين المجموعات</span>
          </div>
          <button id="timer-close-btn" class="timer-icon-btn" title="إغلاق">&times;</button>
        </div>
        <div class="timer-body">
          <div class="timer-digits" id="timer-digits">01:30</div>
          <div class="timer-progress-bar">
            <div class="timer-progress-fill" id="timer-progress-fill" style="width: 100%"></div>
          </div>
          <div class="timer-controls">
            <button id="timer-minus-btn" class="btn-timer-ctrl">-15ث</button>
            <button id="timer-toggle-btn" class="btn-timer-primary">إيقاف مؤقت</button>
            <button id="timer-plus-btn" class="btn-timer-ctrl">+30ث</button>
          </div>
          <div class="timer-presets">
            <button class="btn-timer-preset" data-sec="60">60 ثانية</button>
            <button class="btn-timer-preset active" data-sec="90">90 ثانية</button>
            <button class="btn-timer-preset" data-sec="120">دقيقتين</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(widget);

    // Event listeners
    document.getElementById('timer-close-btn').onclick = () => this.hide();
    document.getElementById('timer-toggle-btn').onclick = () => this.toggle();
    document.getElementById('timer-minus-btn').onclick = () => this.adjust(-15);
    document.getElementById('timer-plus-btn').onclick = () => this.adjust(30);

    widget.querySelectorAll('.btn-timer-preset').forEach(btn => {
      btn.onclick = () => {
        widget.querySelectorAll('.btn-timer-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sec = parseInt(btn.dataset.sec, 10);
        this.start(sec);
      };
    });

    return widget;
  }

  start(seconds = 90) {
    this.totalSeconds = seconds;
    this.remainingSeconds = seconds;
    this.isRunning = true;
    
    const widget = this.createWidget();
    widget.classList.remove('hidden');
    
    if (this.intervalId) clearInterval(this.intervalId);

    this.updateDisplay();
    
    this.intervalId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.updateDisplay();
      } else {
        this.finish();
      }
    }, 1000);
  }

  toggle() {
    const btn = document.getElementById('timer-toggle-btn');
    if (this.isRunning) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      if (btn) btn.textContent = 'استئناف';
    } else {
      this.isRunning = true;
      if (btn) btn.textContent = 'إيقاف مؤقت';
      this.intervalId = setInterval(() => {
        if (this.remainingSeconds > 0) {
          this.remainingSeconds--;
          this.updateDisplay();
        } else {
          this.finish();
        }
      }, 1000);
    }
  }

  adjust(delta) {
    this.remainingSeconds = Math.max(5, this.remainingSeconds + delta);
    this.totalSeconds = Math.max(this.totalSeconds, this.remainingSeconds);
    this.updateDisplay();
  }

  updateDisplay() {
    const digits = document.getElementById('timer-digits');
    const fill = document.getElementById('timer-progress-fill');
    
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    if (digits) digits.textContent = formatted;
    
    if (fill && this.totalSeconds > 0) {
      const pct = (this.remainingSeconds / this.totalSeconds) * 100;
      fill.style.width = `${pct}%`;
    }
  }

  finish() {
    clearInterval(this.intervalId);
    this.isRunning = false;
    this.playBeep();
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    showToast('انتهى وقت الراحة! يلا على المجموعة اللي بعدها 💪', 'success', 5000);
    setTimeout(() => this.hide(), 2500);
  }

  playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  hide() {
    clearInterval(this.intervalId);
    this.isRunning = false;
    const widget = document.getElementById('rest-timer-widget');
    if (widget) widget.classList.add('hidden');
  }
}

export const restTimer = new RestTimer();

/**
 * Format Date to friendly Arabic (e.g., السبت 2 أكتوبر)
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDateArabic(dateInput) {
  const d = new Date(dateInput);
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('ar-EG', options);
}
