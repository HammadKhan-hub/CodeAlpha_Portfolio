const exprEl = document.getElementById('expr');
const resultEl = document.getElementById('result');

let expression = '';

function updateScreen() {
  exprEl.textContent = expression || '0';
  const preview = safeEvaluate(expression);
  resultEl.textContent = preview !== null ? preview : '—';
}

function insertValue(val) {
  const last = expression.slice(-1);
  if (/^[+\-×÷*/]$/.test(last) && /^[+\-×÷*/]$/.test(val)) {
    // replace operator if two in a row
    expression = expression.slice(0, -1) + val;
  } else {
    expression += val;
  }
  updateScreen();
}

function safeEvaluate(expr) {
  if (!expr) return '0';
  const normalized = expr.replace(/×/g, '*').replace(/÷/g, '/');
  if (!/^[0-9+\-*/().\s]+$/.test(normalized)) return null;
  try {
    const cleaned = normalized.replace(/[*\/+\-\.]+$/, '');
    const value = Function('"use strict"; return (' + cleaned + ')')();
    if (typeof value === 'number' && isFinite(value)) {
      return Number.isInteger(value) ? String(value) : parseFloat(value.toFixed(8)).toString();
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

function evaluateFinal() {
  const preview = safeEvaluate(expression);
  if (preview !== null) {
    expression = preview;
    updateScreen();
  } else {
    resultEl.textContent = 'Error';
  }
}

document.querySelectorAll('button.key[data-value]').forEach(btn => {
  btn.addEventListener('click', () => insertValue(btn.dataset.value));
});

document.getElementById('clear').addEventListener('click', () => {
  expression = '';
  updateScreen();
});

document.getElementById('del').addEventListener('click', () => {
  expression = expression.slice(0, -1);
  updateScreen();
});

document.getElementById('paren').addEventListener('click', () => {
  const opens = (expression.match(/\(/g) || []).length;
  const closes = (expression.match(/\)/g) || []).length;
  expression += opens <= closes ? '(' : ')';
  updateScreen();
});

document.getElementById('equals').addEventListener('click', evaluateFinal);

// Keyboard support
window.addEventListener('keydown', ev => {
  if (ev.ctrlKey || ev.metaKey) return;
  const k = ev.key;
  if (/[0-9]/.test(k)) { insertValue(k); ev.preventDefault(); }
  if (k === '.') { insertValue('.'); ev.preventDefault(); }
  if (k === '+' || k === '-' || k === '*' || k === '/') {
    insertValue(k === '*' ? '×' : (k === '/' ? '÷' : k));
    ev.preventDefault();
  }
  if (k === 'Enter' || k === '=') { evaluateFinal(); ev.preventDefault(); }
  if (k === 'Backspace') { expression = expression.slice(0, -1); updateScreen(); ev.preventDefault(); }
  if (k === 'Escape') { expression = ''; updateScreen(); ev.preventDefault(); }
  if (k === '(' || k === ')') { insertValue(k); ev.preventDefault(); }
});

updateScreen();
