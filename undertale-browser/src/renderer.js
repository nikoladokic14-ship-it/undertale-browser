// --- Window controls ---
document.getElementById('win-min').addEventListener('click', () => window.winControls.minimize());
document.getElementById('win-max').addEventListener('click', () => window.winControls.maximize());
document.getElementById('win-close').addEventListener('click', () => window.winControls.close());

// --- Theme (SOUL trait) picker ---
const THEMES = {
  determination: { color: '#FF0000', line: '* You feel your resolve strengthening.' },
  patience:      { color: '#00E5FF', line: '* You wait. The page loads when it loads.' },
  integrity:     { color: '#3E6BFF', line: '* You browse with a clear conscience.' },
  perseverance:  { color: '#9B30FF', line: '* Even a slow connection will not stop you.' },
  kindness:      { color: '#39FF6A', line: '* You leave a kind comment. Maybe.' },
  bravery:       { color: '#FF8A00', line: '* You open that email from an unknown sender.' },
  justice:       { color: '#FFEA00', line: '* You close every tab with a paywall.' },
};

const root = document.documentElement;
const flavorBar = document.getElementById('flavor-bar');

function setTheme(name) {
  const t = THEMES[name] || THEMES.determination;
  root.style.setProperty('--accent', t.color);
  flavorBar.textContent = t.line;
  localStorage.setItem('det-theme', name);
}

document.querySelectorAll('.soul-dot').forEach((dot) => {
  dot.addEventListener('click', () => setTheme(dot.dataset.theme));
});

setTheme(localStorage.getItem('det-theme') || 'determination');

// --- Tab / webview management ---
const tabsEl = document.getElementById('tabs');
const viewHost = document.getElementById('view-host');
const addressInput = document.getElementById('address-input');
const btnBack = document.getElementById('btn-back');
const btnForward = document.getElementById('btn-forward');
const btnReload = document.getElementById('btn-reload');
const btnGo = document.getElementById('btn-go');

const HOME_URL = 'https://www.google.com';

let tabs = [];      // { id, title, url, webview, tabEl }
let activeId = null;
let counter = 0;

function normalizeUrl(input) {
  const value = input.trim();
  if (!value) return HOME_URL;
  const looksLikeUrl = /^https?:\/\//i.test(value) || (/\./.test(value) && !/\s/.test(value));
  if (looksLikeUrl) {
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}

function createTab(url = HOME_URL) {
  const id = `tab-${++counter}`;

  const tabEl = document.createElement('div');
  tabEl.className = 'tab';
  tabEl.dataset.id = id;
  tabEl.innerHTML = `<span class="tab-title">New file</span><button class="tab-close" aria-label="Close tab">X</button>`;
  tabEl.addEventListener('click', (e) => {
    if (e.target.closest('.tab-close')) return;
    setActiveTab(id);
  });
  tabEl.querySelector('.tab-close').addEventListener('click', () => closeTab(id));
  tabsEl.appendChild(tabEl);

  const webview = document.createElement('webview');
  webview.setAttribute('src', url);
  webview.setAttribute('allowpopups', '');
  viewHost.appendChild(webview);

  webview.addEventListener('page-title-updated', (e) => {
    tabEl.querySelector('.tab-title').textContent = e.title || url;
  });
  webview.addEventListener('did-navigate', (e) => {
    tab.url = e.url;
    if (activeId === id) addressInput.value = e.url;
    updateNavButtons();
  });
  webview.addEventListener('did-navigate-in-page', (e) => {
    if (activeId === id) addressInput.value = e.url;
    updateNavButtons();
  });

  const tab = { id, title: 'New file', url, webview, tabEl };
  tabs.push(tab);
  setActiveTab(id);
  return tab;
}

function setActiveTab(id) {
  activeId = id;
  tabs.forEach((t) => {
    const isActive = t.id === id;
    t.tabEl.classList.toggle('active', isActive);
    t.webview.classList.toggle('active-view', isActive);
    if (isActive) addressInput.value = t.url;
  });
  updateNavButtons();
}

function closeTab(id) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const [tab] = tabs.splice(idx, 1);
  tab.tabEl.remove();
  tab.webview.remove();

  if (activeId === id) {
    const next = tabs[idx] || tabs[idx - 1];
    if (next) setActiveTab(next.id);
    else createTab();
  }
}

function currentWebview() {
  const tab = tabs.find((t) => t.id === activeId);
  return tab ? tab.webview : null;
}

function updateNavButtons() {
  const wv = currentWebview();
  if (!wv) return;
  try {
    btnBack.disabled = !wv.canGoBack();
    btnForward.disabled = !wv.canGoForward();
  } catch {
    // webview not ready yet
  }
}

document.getElementById('new-tab-btn').addEventListener('click', () => createTab());

btnBack.addEventListener('click', () => currentWebview()?.goBack());
btnForward.addEventListener('click', () => currentWebview()?.goForward());
btnReload.addEventListener('click', () => currentWebview()?.reload());

function navigate() {
  const url = normalizeUrl(addressInput.value);
  const wv = currentWebview();
  if (wv) wv.loadURL(url);
}

btnGo.addEventListener('click', navigate);
addressInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') navigate();
});

// Kick things off with one tab
createTab();
