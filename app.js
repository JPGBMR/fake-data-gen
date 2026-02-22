'use strict';

/* ─── Static Data ────────────────────────────────────────── */
const DATA = {
  firstNames: ['James','John','Robert','Michael','William','David','Richard','Joseph',
    'Thomas','Charles','Mary','Patricia','Jennifer','Linda','Barbara','Elizabeth',
    'Susan','Jessica','Sarah','Karen','Emma','Olivia','Noah','Liam','Ava','Sophia',
    'Isabella','Mia','Charlotte','Amelia','Oliver','Elijah','Lucas','Mason','Logan',
    'Ethan','Aiden','Jackson','Sofia','Camila','Luna','Diego','Mateo','Miguel',
    'Santiago','Valentina','Chloe','Harper','Evelyn','Abigail'],

  lastNames: ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
    'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas',
    'Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris',
    'Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Hall','Allen',
    'King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams',
    'Nelson','Baker','Rivera','Mitchell','Carter','Roberts','Phillips'],

  domains: ['gmail.com','yahoo.com','hotmail.com','outlook.com','protonmail.com',
    'icloud.com','me.com','fastmail.com','zoho.com','mail.com','hey.com'],

  adjectives: ['cool','fast','brave','dark','wild','calm','lucky','happy','sharp','bright'],
  animals:    ['panda','tiger','wolf','eagle','fox','bear','shark','lion','hawk','otter'],

  streetNames: ['Oak','Maple','Main','Park','Cedar','Elm','Pine','Walnut','Birch',
    'Cherry','Sunset','Highland','Lake','River','Hill','Valley','Forest','Garden',
    'Spring','Washington','Lincoln','Jefferson','Madison','Monroe'],

  streetTypes: ['St','Ave','Blvd','Rd','Dr','Ln','Ct','Way','Pl','Terrace'],

  cities: ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia',
    'San Antonio','San Diego','Dallas','San Jose','Austin','Jacksonville',
    'Fort Worth','Columbus','Charlotte','Indianapolis','San Francisco','Seattle',
    'Denver','Nashville','Portland','Las Vegas','Memphis','Louisville','Baltimore'],

  states: ['NY','CA','IL','TX','AZ','PA','FL','OH','NC','IN','WA','CO','TN',
    'OR','NV','KY','MD','WI','GA','MN','MO','NM','VA','MI','NJ'],

  companyWords: ['Tech','Global','Digital','Smart','Cloud','Data','Net','Cyber',
    'Micro','Alpha','Beta','Delta','Omega','Apex','Core','Peak','Blue','Silver',
    'Prime','First','Iron','Stone','Bright','Quantum','Nexus','Vertex','Pulse'],

  companySuffix: ['Inc','LLC','Corp','Ltd','Group','Solutions','Technologies',
    'Systems','Services','Industries','Enterprises','Partners','Ventures','Dynamics'],

  loremWords: ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit',
    'sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna',
    'aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco',
    'laboris','nisi','aliquip','ex','ea','commodo','consequat'],
};

/* ─── Crypto helpers ─────────────────────────────────────── */
const rand    = arr => arr[crypto.getRandomValues(new Uint32Array(1))[0] % arr.length];
const randInt = (min, max) => min + (crypto.getRandomValues(new Uint32Array(1))[0] % (max - min + 1));

// UUID v4 — crypto.randomUUID() with belt-and-suspenders fallback (Colombo addendum)
const uuid = () => typeof crypto.randomUUID === 'function'
  ? crypto.randomUUID()
  : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

/* ─── Luhn-valid credit card ─────────────────────────────── */
function generateLuhn() {
  const digits = [4, ...Array.from({ length: 14 }, () => randInt(0, 9))];

  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if ((digits.length - i) % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const check = (10 - (sum % 10)) % 10;
  digits.push(check);

  const formatted = digits.join('').match(/.{4}/g).join(' ');
  return `${formatted} (VISA test)`;
}

/* ─── Generators ─────────────────────────────────────────── */
const generators = {
  'Full Name':   () => `${rand(DATA.firstNames)} ${rand(DATA.lastNames)}`,
  'First Name':  () => rand(DATA.firstNames),
  'Last Name':   () => rand(DATA.lastNames),
  'Email':       () => {
    const name = `${rand(DATA.firstNames).toLowerCase()}.${rand(DATA.lastNames).toLowerCase()}`;
    return `${name}@${rand(DATA.domains)}`;
  },
  'Phone (US)':  () => {
    const area = randInt(200, 999);
    const pre  = randInt(200, 999);
    const line = String(randInt(1000, 9999));
    return `(${area}) ${pre}-${line}`;
  },
  'Username':    () => `${rand(DATA.adjectives)}_${rand(DATA.animals)}_${randInt(10, 99)}`,
  'Address':     () => {
    const num = randInt(1, 9999);
    const zip = String(randInt(10000, 99999));
    return `${num} ${rand(DATA.streetNames)} ${rand(DATA.streetTypes)}, ${rand(DATA.cities)}, ${rand(DATA.states)} ${zip}`;
  },
  'Company':     () => `${rand(DATA.companyWords)} ${rand(DATA.companySuffix)}`,
  'UUID':        () => uuid(),
  'Credit Card': () => generateLuhn(),
  // BUG-1 fix: replaced Math.random() with crypto version (C-009 Colombo blueprint)
  'Date':        () => {
    const START_YEAR  = 2000;
    const totalDays   = Math.floor((Date.now() - new Date(START_YEAR, 0, 1)) / 86400000);
    const offsetDays  = crypto.getRandomValues(new Uint32Array(1))[0] % totalDays;
    const d           = new Date(START_YEAR, 0, 1 + offsetDays);
    return d.toISOString().split('T')[0];
  },
  'Lorem':       () => {
    const count = randInt(8, 20);
    return Array.from({ length: count }, () => rand(DATA.loremWords)).join(' ') + '.';
  },
  'Hex Color':   () => '#' + [...crypto.getRandomValues(new Uint8Array(3))]
                         .map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase(),
  'IP Address':  () => Array.from({ length: 4 }, () => randInt(0, 255)).join('.'),
  'Number':      () => String(randInt(1, 99999)),  // range is V1 fixed — [DEBT]
};

/* ─── Type manifest (order + icons) ─────────────────────────*/
const TYPES = [
  { key: 'Full Name',   icon: '👤' },
  { key: 'First Name',  icon: '🔤' },
  { key: 'Last Name',   icon: '🔤' },
  { key: 'Email',       icon: '📧' },
  { key: 'Phone (US)',  icon: '📞' },
  { key: 'Username',    icon: '🆔' },
  { key: 'Address',     icon: '📍' },
  { key: 'Company',     icon: '🏢' },
  { key: 'UUID',        icon: '🔑' },
  { key: 'Credit Card', icon: '💳' },
  { key: 'Date',        icon: '📅' },
  { key: 'Lorem',       icon: '📝' },
  { key: 'Hex Color',   icon: '🎨' },
  { key: 'IP Address',  icon: '🌐' },
  { key: 'Number',      icon: '🔢' },
];

/* ─── State ──────────────────────────────────────────────── */
const state = {
  type:      'Full Name',
  types:     [],          // multi-mode selected types (max 4)
  multiMode: false,
  quantity:  10,
  format:    'list',
  results:   [],          // string[] or string[][] in multi mode
};

/* ─── Format output ──────────────────────────────────────── */
function activeType() {
  return (state.multiMode && state.types.length > 0) ? state.types[0] : state.type;
}

function formatOutput() {
  const { results, format, multiMode, types } = state;

  // Multi-column CSV
  if (multiMode && types.length > 1) {
    const header = types.join(',');
    const rows   = results.map(row => row.join(','));
    return [header, ...rows].join('\n');
  }

  // Single-type output
  if (format === 'list') return results.join('\n');
  if (format === 'json') return JSON.stringify(results, null, 2);
  if (format === 'csv')  return [activeType(), ...results].join('\n');
  return results.join('\n');
}

/* ─── HTML escape ────────────────────────────────────────── */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ─── Render ─────────────────────────────────────────────── */
function renderChips() {
  const selector = document.getElementById('type-selector');
  selector.innerHTML = TYPES.map(({ key, icon }) => {
    const isActive = state.multiMode ? state.types.includes(key) : state.type === key;
    return `<button class="chip${isActive ? ' active' : ''}" data-type="${escHtml(key)}"
      role="option" aria-selected="${isActive}" type="button">${icon} ${key}</button>`;
  }).join('');
}

function renderFormatTabs() {
  const forcedCSV = state.multiMode && state.types.length > 1;
  document.querySelectorAll('.fmt-tab').forEach(tab => {
    const fmt = tab.dataset.fmt;
    tab.classList.toggle('active', fmt === state.format);
    tab.disabled = forcedCSV && fmt !== 'csv';
  });
}

function renderOutput() {
  if (state.results.length === 0) {
    document.getElementById('output').textContent = '';
    return;
  }
  const text  = formatOutput();
  const lines = text.split('\n');
  document.getElementById('output').innerHTML =
    lines.map(line => `<span>${escHtml(line)}</span>`).join('\n');
}

function render() {
  renderChips();
  renderFormatTabs();
  renderOutput();
  document.getElementById('multi-btn').classList.toggle('active', state.multiMode);
}

/* ─── Generate ───────────────────────────────────────────── */
function generate() {
  if (state.multiMode && state.types.length > 1) {
    state.results = Array.from({ length: state.quantity }, () =>
      state.types.map(t => generators[t]())
    );
  } else {
    const t = activeType();
    state.results = Array.from({ length: state.quantity }, () => generators[t]());
  }
  renderOutput();
}

/* ─── Download ───────────────────────────────────────────── */
function download() {
  const isMultiCSV = state.multiMode && state.types.length > 1;
  const extMap     = { list: 'txt', json: 'json', csv: 'csv' };
  const ext        = isMultiCSV ? 'csv' : extMap[state.format];
  const filename   = isMultiCSV
    ? 'fake-multicolumn.csv'
    : `fake-${activeType().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`;

  const content = formatOutput();
  const blob    = new Blob([content], { type: 'text/plain' });
  const a       = document.createElement('a');
  a.href        = URL.createObjectURL(blob);
  a.download    = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ─── Init ───────────────────────────────────────────────── */
function init() {
  // Chip click — type selection
  document.getElementById('type-selector').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const key = chip.dataset.type;

    if (state.multiMode) {
      if (state.types.includes(key)) {
        state.types = state.types.filter(t => t !== key);
      } else {
        if (state.types.length >= 4) {
          const warn = document.getElementById('multi-warning');
          warn.hidden = false;
          setTimeout(() => { warn.hidden = true; }, 2000);
          return;
        }
        state.types.push(key);
      }
      // Force CSV when multiple types selected
      if (state.types.length > 1) state.format = 'csv';
    } else {
      state.type = key;
    }

    render();
  });

  // Multi toggle button
  document.getElementById('multi-btn').addEventListener('click', () => {
    state.multiMode = !state.multiMode;
    if (state.multiMode) {
      state.types = [state.type]; // seed with current single type
    } else {
      if (state.types.length > 0) state.type = state.types[0];
      state.types = [];
    }
    render();
  });

  // Format tabs
  document.querySelectorAll('.fmt-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.disabled) return;
      state.format = tab.dataset.fmt;
      renderFormatTabs();
      renderOutput();
    });
  });

  // Quantity slider
  const qtySlider  = document.getElementById('qty-slider');
  const qtyDisplay = document.getElementById('qty-display');
  qtySlider.addEventListener('input', () => {
    state.quantity    = parseInt(qtySlider.value, 10);
    qtyDisplay.value  = state.quantity;
  });

  // Generate button
  document.getElementById('generate-btn').addEventListener('click', generate);

  // Copy all
  document.getElementById('copy-btn').addEventListener('click', function () {
    const text = formatOutput();
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
    this.textContent = '✓ Copied';
    setTimeout(() => { this.textContent = 'Copy All'; }, 1500);
  });

  // Download
  document.getElementById('download-btn').addEventListener('click', download);

  // Individual row copy (tap/click any span in output)
  document.getElementById('output').addEventListener('click', e => {
    if (e.target.tagName !== 'SPAN') return;
    navigator.clipboard.writeText(e.target.textContent.trim()).catch(() => {});
    e.target.classList.add('flash');
    setTimeout(() => e.target.classList.remove('flash'), 300);
  });

  render();
  generate(); // show initial 10 Full Names on load
}

init();
