/* ==========================================================
   Password Generator — Site Script
   - Mobile nav toggle
   - Password generation (cryptographically secure via window.crypto)
   - Copy to clipboard with toast
   - Strength meter
   ========================================================== */

(function () {
  // Mobile nav toggle
  const navToggle = document.querySelector('[data-testid="nav-toggle"]');
  const navLinks = document.querySelector('[data-testid="nav-links"]');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
})();

// ---------- Password Generator ----------
(function () {
  const output = document.querySelector('[data-testid="password-output"]');
  if (!output) return; // Only runs on home page

  const lengthSlider = document.querySelector('[data-testid="length-slider"]');
  const lengthValue = document.querySelector('[data-testid="length-value"]');
  const optUpper = document.querySelector('[data-testid="opt-uppercase"]');
  const optLower = document.querySelector('[data-testid="opt-lowercase"]');
  const optNumber = document.querySelector('[data-testid="opt-numbers"]');
  const optSymbol = document.querySelector('[data-testid="opt-symbols"]');
  const generateBtn = document.querySelector('[data-testid="generate-btn"]');
  const copyBtn = document.querySelector('[data-testid="copy-btn"]');
  const strengthBar = document.querySelector('[data-testid="strength-bar"]');
  const strengthLabel = document.querySelector('[data-testid="strength-label"]');
  const toast = document.querySelector('[data-testid="toast"]');

  const CHARSETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
    symbol: '!@#$%^&*()-_=+[]{};:,.<>?/|~'
  };

  function getSecureIndex(max) {
    // Cryptographically secure random integer in [0, max)
    if (window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function showToast(message, success) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('success', !!success);
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function updateStrength(pwd) {
    if (!strengthBar || !strengthLabel) return;
    const len = pwd.length;
    let variety = 0;
    if (/[a-z]/.test(pwd)) variety++;
    if (/[A-Z]/.test(pwd)) variety++;
    if (/[0-9]/.test(pwd)) variety++;
    if (/[^A-Za-z0-9]/.test(pwd)) variety++;

    // score 0-100
    let score = Math.min(100, len * 4 + variety * 10);
    let label = 'Weak', color = '#ef4444';
    if (score >= 80) { label = 'Very Strong'; color = '#10b981'; }
    else if (score >= 60) { label = 'Strong'; color = '#22c55e'; }
    else if (score >= 40) { label = 'Medium'; color = '#f59e0b'; }

    strengthBar.style.width = score + '%';
    strengthBar.style.background = color;
    strengthLabel.querySelector('[data-testid="strength-text"]').textContent = label;
  }

  function generate() {
    const length = parseInt(lengthSlider.value, 10);
    const pools = [];
    const required = [];
    if (optUpper.checked) { pools.push(CHARSETS.upper); required.push(CHARSETS.upper); }
    if (optLower.checked) { pools.push(CHARSETS.lower); required.push(CHARSETS.lower); }
    if (optNumber.checked) { pools.push(CHARSETS.number); required.push(CHARSETS.number); }
    if (optSymbol.checked) { pools.push(CHARSETS.symbol); required.push(CHARSETS.symbol); }

    if (pools.length === 0) {
      showToast('Select at least one option');
      output.textContent = '—';
      updateStrength('');
      return;
    }

    const allChars = pools.join('');
    const chars = [];

    // Guarantee at least one from each selected set
    required.forEach(set => {
      chars.push(set[getSecureIndex(set.length)]);
    });

    while (chars.length < length) {
      chars.push(allChars[getSecureIndex(allChars.length)]);
    }

    // Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = getSecureIndex(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    const password = chars.slice(0, length).join('');
    output.textContent = password;
    updateStrength(password);
  }

  async function copyPassword() {
    const text = output.textContent;
    if (!text || text === '—') {
      showToast('Generate a password first');
      return;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast('Password copied to clipboard', true);
    } catch (e) {
      showToast('Copy failed — please copy manually');
    }
  }

  // Wire up events
  if (lengthSlider && lengthValue) {
    lengthSlider.addEventListener('input', () => {
      lengthValue.textContent = lengthSlider.value;
    });
    lengthValue.textContent = lengthSlider.value;
  }

  if (generateBtn) generateBtn.addEventListener('click', generate);
  if (copyBtn) copyBtn.addEventListener('click', copyPassword);

  // Auto-generate on load for immediate wow moment
  generate();
})();

// ---------- Contact form (mailto) ----------
(function () {
  const form = document.querySelector('[data-testid="contact-form"]');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const subject = form.querySelector('[name="subject"]').value.trim() || 'Website inquiry';
    const message = form.querySelector('[name="message"]').value.trim();

    const body =
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n\n' +
      message;

    const mailto =
      'mailto:Aadithakur6114@gmail.com' +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    window.location.href = mailto;
  });
})();

// Year in footer
document.querySelectorAll('[data-testid="current-year"]').forEach(el => {
  el.textContent = new Date().getFullYear();
});
