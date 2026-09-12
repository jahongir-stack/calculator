const display = document.getElementById('display');
const historyEl = document.getElementById('history');

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;

function updateDisplay() {
  display.textContent = formatNumber(current);
}

function updateHistory(text) {
  historyEl.textContent = text;
}

function formatNumber(numStr) {
  if (numStr === 'Error') return numStr;
  const [intPart, decPart] = numStr.split('.');
  const formattedInt = Number(intPart).toLocaleString('en-US');
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

function inputNumber(num) {
  if (justEvaluated) {
    current = num === '.' ? '0.' : num;
    justEvaluated = false;
    updateHistory('');
    updateDisplay();
    return;
  }
  if (num === '.') {
    if (current.includes('.')) return;
    current += '.';
  } else if (current === '0') {
    current = num;
  } else {
    if (current.replace('-', '').replace('.', '').length >= 15) return;
    current += num;
  }
  updateDisplay();
}

function opSymbol(action) {
  return { add: '+', subtract: '−', multiply: '×', divide: '÷' }[action];
}

function chooseOperator(action) {
  if (operator !== null && !justEvaluated) {
    compute();
  }
  previous = current;
  operator = action;
  justEvaluated = false;
  current = '0';
  updateHistory(`${formatNumber(previous)} ${opSymbol(action)}`);
}

function compute() {
  if (operator === null || previous === null) return;
  const a = parseFloat(previous);
  const b = parseFloat(current);
  let result;

  switch (operator) {
    case 'add': result = a + b; break;
    case 'subtract': result = a - b; break;
    case 'multiply': result = a * b; break;
    case 'divide':
      if (b === 0) {
        current = 'Error';
        previous = null;
        operator = null;
        justEvaluated = true;
        updateHistory('');
        updateDisplay();
        return;
      }
      result = a / b;
      break;
    default: return;
  }

  result = Math.round((result + Number.EPSILON) * 1e10) / 1e10;

  updateHistory(`${formatNumber(previous)} ${opSymbol(operator)} ${formatNumber(current)} =`);
  current = String(result);
  previous = null;
  operator = null;
  justEvaluated = true;
  updateDisplay();
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  justEvaluated = false;
  updateHistory('');
  updateDisplay();
}

function negate() {
  if (current === '0' || current === 'Error') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  updateDisplay();
}

function percent() {
  if (current === 'Error') return;
  current = String(parseFloat(current) / 100);
  updateDisplay();
}

document.querySelectorAll('.key[data-num]').forEach(btn => {
  btn.addEventListener('click', () => inputNumber(btn.dataset.num));
});

document.querySelectorAll('.key[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (action === 'clear') clearAll();
    else if (action === 'negate') negate();
    else if (action === 'percent') percent();
    else if (action === 'equals') compute();
    else chooseOperator(action);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') inputNumber(e.key);
  else if (e.key === '.') inputNumber('.');
  else if (e.key === '+') chooseOperator('add');
  else if (e.key === '-') chooseOperator('subtract');
  else if (e.key === '*') chooseOperator('multiply');
  else if (e.key === '/') { e.preventDefault(); chooseOperator('divide'); }
  else if (e.key === 'Enter' || e.key === '=') compute();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '%') percent();
  else if (e.key === 'Backspace') {
    current = current.length > 1 ? current.slice(0, -1) : '0';
    updateDisplay();
  }
});
