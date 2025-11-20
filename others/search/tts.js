/** @type {number} */
const Z = 2147483647;

/** @type {SpeechSynthesis} */
const synth = window.speechSynthesis;

/** @type {Object.<string, string>} */
const IDS = {
  style: "__rs_styles",
  layer: "rs-highlight-layer",
  toolbar: "rs-toolbar",
  readBtn: "rs-read-btn",
  langBtn: "rs-lang-btn",
  voiceBtn: "rs-voice-btn",
  rateBtn: "rs-rate-btn",
  resizeHandle: "rs-resize-handle",
  langBadge: "rs-lang-badge",
  langMenu: "rs-lang-menu",
  voiceMenu: "rs-voice-menu",
  rateMenu: "rs-rate-menu"
};

/** @type {{lang: string, voiceURI: string, rate: number}} */
const pref = {
  lang:
    localStorage.getItem("RS_LANG") || (navigator.languages && navigator.languages[0]) || navigator.language || "en-US",
  voiceURI: localStorage.getItem("RS_VOICE_URI") || "",
  rate: parseFloat(localStorage.getItem("RS_RATE") || "1.0")
};

/** @type {string} */
const WIDTH_KEY = "RS_TOOLBAR_WIDTH";

/** @type {string} */
const VOICE_MAP_KEY = "RS_VOICE_BY_LANG";

/** @type {Range|null} */
let baseRange = null;

/** @type {string} */
let lastText = "";

/** @type {{start: number, length: number}|null} */
let lastSlice = null;

/** @type {SpeechSynthesisUtterance|null} */
let utter = null;

/** @type {SpeechSynthesisVoice[]} */
let voicesCache = [];

/** @type {number} */
let lastAnimatedTokenStart = -1;

/** @type {boolean} */
let isReading = false;

/** @type {boolean} */
let allowToolbar = true;

/** @type {boolean} */
let isResizing = false;

/** @type {number[]} */
let snapWidths = [];

/** @type {number} */
let minToolbarWidth = 0;

/** @type {number} */
let maxToolbarWidth = 0;

injectStyles();

/** @type {HTMLElement} */
const toolbar = ensureToolbar();

/** @type {HTMLElement} */
const layer = ensureLayer();

/** @type {HTMLElement} */
const langMenu = ensureMenu(IDS.langMenu);

/** @type {HTMLElement} */
const voiceMenu = ensureMenu(IDS.voiceMenu);

/** @type {HTMLElement} */
const rateMenu = ensureMenu(IDS.rateMenu);

// Calculate snap widths once buttons are in the DOM
calculateSnapWidths();

toolbar.addEventListener("pointerdown", e => {
  e.preventDefault();
  e.stopPropagation();
});
langMenu.addEventListener("pointerdown", e => e.stopPropagation());
voiceMenu.addEventListener("pointerdown", e => e.stopPropagation());
rateMenu.addEventListener("pointerdown", e => e.stopPropagation());

if (synth && typeof synth.addEventListener === "function") {
  synth.addEventListener("voiceschanged", () => {
    voicesCache = synth.getVoices();
    populateLangs();
    ensureVoiceForCurrentLang();
    populateVoices();
  });
}
voicesCache = synth?.getVoices?.() || [];
populateLangs();
ensureVoiceForCurrentLang();
populateVoices();
populateRates();

document.addEventListener("pointerdown", e => {
  const t = e.target;
  const isToolbarClick = t.closest(`#${IDS.toolbar}`);
  const isMenuClick = t.closest(`.${IDS.langMenu}`) || t.closest(`.${IDS.voiceMenu}`) || t.closest(`.${IDS.rateMenu}`);
  if (isToolbarClick || isMenuClick) return;
  if (isReading) {
    synth.cancel();
  }
  hide(langMenu);
  hide(voiceMenu);
  hide(rateMenu);
  if (!isReading) {
    allowToolbar = false;
  }
});
document.addEventListener("pointerup", () => {
  if (!isReading && !isResizing) {
    allowToolbar = true;
  }
  if (!isResizing) {
    onSelectionUpdate();
  }
});
document.addEventListener("mouseup", onSelectionUpdate);
document.addEventListener("keyup", onSelectionUpdate);
document.addEventListener("selectionchange", onSelectionUpdate);
document.addEventListener("scroll", repaintHighlight, true);
document.addEventListener("click", onDocClick, true);

// Init Resize Handle
initResize();

[IDS.readBtn, IDS.langBtn, IDS.voiceBtn, IDS.rateBtn].forEach(id => {
  const el = byId(id);
  if (!el) return;
  el.addEventListener("pointerdown", e => {
    e.preventDefault();
    e.stopPropagation();
  });
});
byId(IDS.readBtn)?.addEventListener("click", () => {
  onReadClicked();
});

byId(IDS.langBtn)?.addEventListener("click", e => {
  e.stopPropagation();
  hide(voiceMenu);
  hide(rateMenu);
  // Re-populate to ensure current selection is correct before toggling
  populateLangs();
  toggleMenu(langMenu, byId(IDS.langBtn));
});
byId(IDS.voiceBtn)?.addEventListener("click", e => {
  e.stopPropagation();
  hide(langMenu);
  hide(rateMenu);
  // Re-populate to ensure current selection is correct before toggling
  populateVoices();
  toggleMenu(voiceMenu, byId(IDS.voiceBtn));
});
byId(IDS.rateBtn)?.addEventListener("click", e => {
  e.stopPropagation();
  hide(langMenu);
  hide(voiceMenu);
  // Re-populate to ensure current selection is correct before toggling
  populateRates();
  toggleMenu(rateMenu, byId(IDS.rateBtn));
});

/**
 * @returns {void}
 */
window.removeReadSelectedTools = function removeReadSelectedTools() {
  document.removeEventListener("mouseup", onSelectionUpdate);
  document.removeEventListener("keyup", onSelectionUpdate);
  document.removeEventListener("selectionchange", onSelectionUpdate);
  document.removeEventListener("scroll", repaintHighlight, true);
  document.removeEventListener("click", onDocClick, true);
  document.body.classList.remove("rs-reading");
  [IDS.toolbar, IDS.layer, IDS.style, IDS.langMenu, IDS.voiceMenu, IDS.rateMenu].forEach(id => byId(id)?.remove());
  synth && synth.cancel();
};

/**
 * @returns {void}
 */
function injectStyles() {
  if (byId(IDS.style)) return;
  const s = document.createElement("style");
  s.id = IDS.style;
  s.textContent = `
                      :root {
                        --rs-surface: #ffffff;
                        --rs-on-surface: #202124;
                        --rs-on-surface-variant: #5f6368;
                        --rs-outline: #dadce0;
                        --rs-primary: #1a73e8;
                        --rs-hover: #f1f3f4;
                        --rs-shadow: rgba(0,0,0,.15);
                        --rs-scrim: rgba(0,0,0,.4);

                        /* Highlight Colors */
                        --rs-word-bg-1: rgba(168, 203, 255, 0.7);
                        --rs-word-bg-2: rgba(168, 203, 255, 0.5);
                        --rs-word-outline: rgba(122, 168, 255, 0.8);
                      }
                      @media (prefers-color-scheme: dark) {
                        :root {
                          --rs-surface: #2d2e30; /* Darker surface */
                          --rs-on-surface: #e8eaed;
                          --rs-on-surface-variant: #bdc1c6;
                          --rs-outline: #44474a;
                          --rs-primary: #8ab4f8;
                          --rs-hover: #3a3c3e;
                          --rs-shadow: rgba(0,0,0,.3);
                          --rs-scrim: rgba(0,0,0,.6);

                          /* Dark Highlight Colors */
                          --rs-word-bg-1: rgba(138, 180, 248, .45);
                          --rs-word-bg-2: rgba(138, 180, 248, .25);
                          --rs-word-outline: rgba(138, 180, 248, .85);
                        }
                      }

                      /* Toolbar (Google Material Design) */
                      #${IDS.toolbar} {
                        position: absolute;
                        z-index: ${Z};
                        display: none; /* Hidden by default */
                        flex-direction: row;
                        align-items: center;
                        gap: 4px; /* Tighter gap */
                        padding: 6px;
                        background: var(--rs-surface);
                        border: 1px solid var(--rs-outline);
                        border-radius: 24px; /* Pill shape */
                        box-shadow: 0 4px 8px -2px var(--rs-shadow), 0 0 1px 0 var(--rs-shadow);
                        font: 13px/1.1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                        backdrop-filter: saturate(120%) blur(6px);
                        /* MODIFIED: Added border-color to transition */
                        transition: opacity .15s ease, transform .15s ease, width .2s cubic-bezier(0.4, 0, 0.2, 1), border-color .15s ease;
                        overflow: hidden; /* Needed for width animation */
                        white-space: nowrap; /* Prevent wrapping during animation */
                        box-sizing: border-box; /* Ensure padding is included in width */
                      }

                      /* MODIFIED: Resize Handle */
                      #${IDS.resizeHandle} {
                        position: absolute;
                        top: 50%;
                        right: 0;
                        transform: translateY(-50%);
                        width: 16px; /* This is the hover/drag target area */
                        height: 30px; /* Make it a bit shorter than toolbar */
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: ew-resize;
                        z-index: 10;
                        color: var(--rs-on-surface-variant);
                        font-size: 16px;
                        line-height: 1;
                        opacity: 0; /* Hidden by default */
                        transition: all 0.2s ease;
                        border-radius: 4px;
                        user-select: none;
                      }
                      
                      /* Add the grip content */
                      #${IDS.resizeHandle}::before {
                        content: '⋮';
                      }

                      /* Show handle on toolbar hover */
                      #${IDS.toolbar}:hover #${IDS.resizeHandle} {
                        opacity: 0.6;
                      }
                      
                      #${IDS.resizeHandle}:hover {
                         opacity: 1 !important; /* Use important to override parent hover */
                         background: var(--rs-hover);
                      }

                      /* UPDATED: Remove border change, add handle background change */
                      /*
                      #${IDS.toolbar}[data-resizing="true"] {
                        border-right-color: var(--rs-primary); 
                      }
                      */

                      #${IDS.toolbar}[data-resizing="true"] #${IDS.resizeHandle} {
                        opacity: 1;
                        /* Darker 'active' state, consistent with button active state */
                        background: color-mix(in srgb, var(--rs-hover) 80%, var(--rs-scrim));
                      }


                      /* Icon Button */
                      .rs-icon-btn {
                        position: relative; /* For badge */
                        width: 36px; height: 36px;
                        padding: 0;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0; /* Prevent buttons from shrinking */
                        border-radius: 50%; /* Circular */
                        border: 1px solid transparent;
                        background: transparent;
                        color: var(--rs-on-surface-variant);
                        cursor: pointer;
                        user-select: none;
                        transition: background-color .15s ease, transform .2s ease;
                        box-sizing: border-box;
                      }
                      .rs-icon-btn:hover {
                        background: var(--rs-hover);
                      }
                      .rs-icon-btn:active {
                        background: color-mix(in srgb, var(--rs-hover) 80%, var(--rs-scrim));
                      }
                      .rs-icon-btn svg {
                        width: 20px; height: 20px;
                      }
                      /* Read button is primary */
                      #${IDS.readBtn} {
                        color: var(--rs-primary);
                      }

                      /* Language Badge */
                      #${IDS.langBadge} {
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        min-width: 14px;
                        height: 14px;
                        padding: 0 3px;
                        display: none; /* Hidden by default */
                        background: var(--rs-primary);
                        color: var(--rs-surface);
                        border-radius: 7px;
                        font-size: 9px;
                        font-weight: 600;
                        line-height: 14px;
                        text-align: center;
                        box-sizing: border-box;
                        user-select: none;
                        pointer-events: none;
                      }
                      
                      /* Read/Stop Icon Toggle */
                      #${IDS.readBtn} .rs-play-icon { display: inline-flex; }
                      #${IDS.readBtn} .rs-stop-icon { display: none; }
                      #${IDS.readBtn} .rs-spinner-icon { display: none; } 

                      #${IDS.toolbar}[data-reading="true"] #${IDS.readBtn} .rs-play-icon { display: none; }
                      #${IDS.toolbar}[data-reading="true"] #${IDS.readBtn} .rs-stop-icon { display: inline-flex; }

                      /* Added loading state */
                      #${IDS.toolbar}[data-reading="loading"] #${IDS.readBtn} .rs-play-icon { display: none; }
                      #${IDS.toolbar}[data-reading="loading"] #${IDS.readBtn} .rs-spinner-icon { 
                        display: inline-flex; 
                        animation: rsSpin 1s linear infinite;
                      }
                      
                      /* Custom Menu */
                      .${IDS.langMenu}, .${IDS.voiceMenu}, .${IDS.rateMenu} { /* Modified */
                        position: absolute;
                        z-index: ${Z + 1};
                        display: none; /* Hidden by default */
                        background: var(--rs-surface);
                        border: 1px solid var(--rs-outline);
                        border-radius: 8px;
                        box-shadow: 0 5px 15px -3px var(--rs-shadow), 0 0 1px 0 var(--rs-shadow);
                        padding: 8px 0;
                        min-width: 200px;
                        max-height: 250px;
                        overflow-x: hidden;
                        overflow-y: auto;
                        outline: none; /* For focus */
                      }
                      
                      /* Menu Item */
                      .rs-menu-item {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        font: 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                        padding: 8px 16px 8px 20px;
                        color: var(--rs-on-surface);
                        cursor: pointer;
                        user-select: none;
                        white-space: nowrap;
                      }
                      .rs-menu-item:hover, .rs-menu-item:focus {
                        background: var(--rs-hover);
                        outline: none;
                      }
                      .rs-menu-item .rs-check-icon {
                        width: 18px; height: 18px;
                        visibility: hidden; /* Hide by default */
                        color: var(--rs-primary);
                      }
                      .rs-menu-item[data-selected="true"] {
                        color: var(--rs-primary);
                        font-weight: 500;
                      }
                      .rs-menu-item[data-selected="true"] .rs-check-icon {
                        visibility: visible;
                      }

                      /* Use a light grey selection instead of transparent */
                      .rs-reading ::selection { 
                        background: rgba(0, 0, 0, 0.045); /* Light grey selection */
                        color: inherit; 
                      }
                      @media (prefers-color-scheme: dark) {
                        .rs-reading ::selection { 
                          background: rgba(255, 255, 255, 0.15); /* Light grey selection (dark) */
                          color: inherit; 
                        }
                      }
                      
                      /* Previous bounce effect (unchanged) */
                      @keyframes rsBounceIn {
                        0%   { transform: translateX(-10%) scaleX(.1); opacity: .15; }
                        55%  { transform: translateX(2%)   scaleX(1.05); opacity: .98; }
                        75%  { transform: translateX(-1%) scaleX(.98); }
                        100% { transform: translateX(0)   scaleX(1); opacity: 1; }
                      }
                      
                      /* Added spinner animation */
                      @keyframes rsSpin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                      }

                      #${
                        IDS.layer
                      } { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: ${Z}; }
                      .rs-chunk {
                        position: absolute;
                        border-radius: 6px; /* Slightly larger radius */
                        background-image: linear-gradient(180deg, rgba(77, 184, 255, 0.3) 15%, transparent 40%, transparent 60%, rgba(77, 184, 255, 0.4) 85%);
outline: 1px solid rgba(40, 150, 220, 0.9);
                        box-shadow: 0 4px 10px var(--rs-shadow), inset 0 0 0 1px rgba(255,255,255,.06);
                        transform-origin: left center;
                      }
                      .rs-chunk--animate { animation: rsBounceIn .22s cubic-bezier(.34,1.56,.64,1); }
                    `;
  document.head.appendChild(s);
}

/**
 * @returns {HTMLElement}
 */
function ensureToolbar() {
  let el = byId(IDS.toolbar);
  if (el) return el;
  el = document.createElement("div");
  el.id = IDS.toolbar;
  const read = iconButton(svgPlay() + svgStop() + svgSpinner(), "Read", "rs-icon-btn");
  read.id = IDS.readBtn;

  const langBtn = iconButton(svgLang(), "Language", "rs-icon-btn");
  langBtn.id = IDS.langBtn;

  const langBadge = document.createElement("span");
  langBadge.id = IDS.langBadge;
  langBtn.appendChild(langBadge);

  const voiceBtn = iconButton(svgVoice(), "Voice", "rs-icon-btn");
  voiceBtn.id = IDS.voiceBtn;
  const rateBtn = iconButton(svgRate(), "Reading Speed", "rs-icon-btn");
  rateBtn.id = IDS.rateBtn;
  // REMOVED: divider element

  // Append elements (without the divider)
  const resizeHandle = document.createElement("div");
  resizeHandle.id = IDS.resizeHandle;

  el.append(read, langBtn, voiceBtn, rateBtn, resizeHandle);
  document.body.appendChild(el);
  return el;
}

/**
 * @param {string} id
 * @returns {HTMLElement}
 */
function ensureMenu(id) {
  let el = byId(id);
  if (el) return el;
  el = document.createElement("div");
  el.id = id;
  el.className = id;
  document.body.appendChild(el);
  return el;
}

/**
 * @returns {HTMLElement}
 */
function ensureLayer() {
  let el = byId(IDS.layer);
  if (el) return el;
  el = document.createElement("div");
  el.id = IDS.layer;
  document.body.appendChild(el);
  return el;
}

/**
 * @param {string} iconSvg
 * @param {string} title
 * @param {string} cls
 * @returns {HTMLButtonElement}
 */
function iconButton(iconSvg, title, cls) {
  const b = document.createElement("button");
  b.className = cls;
  b.title = title;
  b.innerHTML = iconSvg;
  return b;
}

/**
 * @param {HTMLElement} menu
 * @param {HTMLElement} button
 * @returns {void}
 */
function toggleMenu(menu, button) {
  if (!menu || !button) return;
  if (menu.style.display === "block") {
    hide(menu);
  } else {
    const btnRect = button.getBoundingClientRect();
    menu.style.display = "block";

    // Set focus and scroll selected item into view
    menu.focus();
    const selected = menu.querySelector('.rs-menu-item[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }

    menu.style.left = `${window.scrollX + btnRect.left}px`;
    menu.style.top = `${window.scrollY + btnRect.bottom + 8}px`;
  }
}

/**
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function byId(id) {
  return document.getElementById(id);
}

/**
 * @param {HTMLElement} el
 * @returns {void}
 */
function hide(el) {
  if (el) el.style.display = "none";
}

/**
 * @returns {void}
 */
function calculateSnapWidths() {
  const tb = byId(IDS.toolbar);
  if (!tb) return;

  // Temporarily show toolbar to measure
  const originalDisplay = tb.style.display;
  tb.style.visibility = "hidden";
  tb.style.display = "inline-flex";
  tb.style.width = "auto"; // Let it size naturally

  const readBtn = byId(IDS.readBtn);
  const langBtn = byId(IDS.langBtn);
  const voiceBtn = byId(IDS.voiceBtn);
  const rateBtn = byId(IDS.rateBtn);

  if (!readBtn || !langBtn || !voiceBtn || !rateBtn) {
    tb.style.display = originalDisplay;
    tb.style.visibility = "visible";
    return;
  }

  const gap = 4; // From CSS
  const padding = 6; // Single side padding from CSS

  const readWidth = readBtn.offsetWidth;
  const langWidth = langBtn.offsetWidth;
  const voiceWidth = voiceBtn.offsetWidth;
  const rateWidth = rateBtn.offsetWidth;

  // Snap Widths based on the visible buttons (Formula: 2*padding + sum(button_widths) + sum(gaps))
  snapWidths = [
    // 1. Read (1 button, 0 gaps)
    padding * 2 + readWidth, // 6 + 36 + 6 = 48px
    // 2. Read + Lang (2 buttons, 1 gap)
    padding * 2 + readWidth + gap + langWidth, // 48 + 4 + 36 = 88px
    // 3. Read + Lang + Voice (3 buttons, 2 gaps)
    padding * 2 + readWidth + gap * 2 + langWidth + voiceWidth, // 88 + 4 + 36 = 128px
    // 4. Read + All (4 buttons, 3 gaps)
    padding * 2 + readWidth + gap * 3 + langWidth + voiceWidth + rateWidth // 128 + 4 + 36 = 168px
  ];

  minToolbarWidth = snapWidths[0];
  maxToolbarWidth = snapWidths[snapWidths.length - 1];

  // Restore original style
  tb.style.display = originalDisplay;
  tb.style.visibility = "visible";
  tb.style.width = ""; // Clear inline width
}

/**
 * @returns {void}
 */
function initResize() {
  const handle = byId(IDS.resizeHandle);
  const toolbar = byId(IDS.toolbar);
  if (!handle || !toolbar) return;

  let startX = 0;
  let startWidth = 0;

  /**
   * @param {PointerEvent} e
   * @returns {void}
   */
  const onPointerDown = e => {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    startX = e.clientX;
    startWidth = toolbar.offsetWidth;
    toolbar.dataset.resizing = "true";
    toolbar.style.transition = "none"; // Disable animation while dragging
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    handle.setPointerCapture(e.pointerId);
  };

  /**
   * @param {PointerEvent} e
   * @returns {void}
   */
  const onPointerMove = e => {
    if (!isResizing) return;
    const dx = e.clientX - startX;
    let newWidth = startWidth + dx;
    // Clamp width, allowing small overdrag buffer
    newWidth = Math.max(minToolbarWidth - 5, Math.min(newWidth, maxToolbarWidth + 5));
    toolbar.style.width = `${newWidth}px`;
  };

  /**
   * @param {PointerEvent} e
   * @returns {void}
   */
  const onPointerUp = e => {
    if (!isResizing) return;
    isResizing = false;
    toolbar.dataset.resizing = "false";
    toolbar.style.transition = ""; // Re-enable animation
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
    handle.releasePointerCapture(e.pointerId);

    // Find the closest snap width
    let targetSnap = snapWidths[0];
    let minDiff = Infinity;

    snapWidths.forEach(snapWidth => {
      const diff = Math.abs(toolbar.offsetWidth - snapWidth);
      if (diff < minDiff) {
        minDiff = diff;
        targetSnap = snapWidth;
      }
    });

    toolbar.style.width = `${targetSnap}px`;
    localStorage.setItem(WIDTH_KEY, targetSnap);

    // Allow selection again
    setTimeout(() => {
      allowToolbar = true;
    }, 10);
  };

  handle.addEventListener("pointerdown", onPointerDown);
}

/**
 * @returns {void}
 */
function populateLangs() {
  const langSet = new Set();
  (voicesCache || []).forEach(v => langSet.add(v.lang));
  const langs = Array.from(langSet).sort((a, b) =>
    langDisplayName(String(a)).localeCompare(langDisplayName(String(b)))
  );
  const menu = byId(IDS.langMenu);
  if (!menu) return;
  menu.replaceChildren();

  menu.tabIndex = -1; // Make it focusable
  menu.addEventListener("keydown", e => {
    if (e.key.length === 1 && e.key.match(/[a-z0-9]/i)) {
      e.preventDefault();
      e.stopPropagation();
      const key = e.key.toLowerCase();
      const items = Array.from(menu.querySelectorAll(".rs-menu-item"));
      const currentIdx = items.findIndex(item => item === document.activeElement);
      // Start search from next item
      const searchPool = [...items.slice(currentIdx + 1), ...items.slice(0, currentIdx + 1)];

      const found = searchPool.find(item => (item.textContent || "").trim().toLowerCase().startsWith(key));

      if (found) {
        found.focus();
        found.scrollIntoView({ block: "nearest" });
      }
    }
  });

  const checkIcon = svgCheck();
  if (pref.lang && !langs.includes(pref.lang)) {
    langs.unshift(pref.lang);
  }
  for (const code of langs) {
    if (!code) continue;
    const item = document.createElement("div");
    item.className = "rs-menu-item";
    item.dataset.value = code;
    item.tabIndex = 0; // Make item focusable

    const nativeName = langDisplayName(code);
    item.innerHTML = `<span class="rs-check-icon">${checkIcon}</span><span>${nativeName}</span>`;

    // Fix 3: Ensure initial selection is correct
    if (code.toLowerCase() === (pref.lang || "").toLowerCase()) {
      item.dataset.selected = "true";
    }

    const onItemClick = () => {
      pref.lang = code;
      localStorage.setItem("RS_LANG", pref.lang);
      if (isReading) synth.cancel();

      // Fix 3: Update DOM selection
      menu.querySelectorAll(".rs-menu-item").forEach(el => (el.dataset.selected = "false"));
      item.dataset.selected = "true";

      ensureVoiceForCurrentLang();
      populateVoices();
      updateLangBadge();
      hide(menu);
    };

    item.addEventListener("click", onItemClick);
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onItemClick();
      }
    });
    menu.appendChild(item);
  }
  updateLangBadge();
}

/**
 * @returns {void}
 */
function updateLangBadge() {
  const badge = byId(IDS.langBadge);
  if (!badge) return;
  const code = (pref.lang || "").split(/[-_]/)[0].toUpperCase();
  if (code) {
    badge.textContent = code;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}

/**
 * @returns {void}
 */
function ensureVoiceForCurrentLang() {
  const map = getVoiceMap();
  const saved = map[pref.lang];
  const filtered = (voicesCache || []).filter(v => v.lang && v.lang.toLowerCase().startsWith(pref.lang.toLowerCase()));
  const langDefault = filtered.find(v => v.default) || filtered[0] || null;
  const nextVoiceURI = saved || (langDefault ? langDefault.voiceURI : "");
  pref.voiceURI = nextVoiceURI || "";
  localStorage.setItem("RS_VOICE_URI", pref.voiceURI);
  if (nextVoiceURI) {
    map[pref.lang] = nextVoiceURI;
    setVoiceMap(map);
  }
}

/**
 * @param {string} code
 * @returns {string}
 */
function langDisplayName(code) {
  try {
    // Get the primary language code (e.g., "en" from "en-US")
    const lang = code.split(/[-_]/)[0];
    if (!lang) return code;

    let dn;
    if (hasIntlDisplayNames()) {
      // Get the language name IN ITS OWN LANGUAGE
      dn = new Intl.DisplayNames([lang], {
        type: "language"
      }).of(lang);
    } else {
      dn = fallbackLangName(lang);
    }

    // Capitalize
    dn = capitalize(dn);

    // Try to get region name (e.g., "US" from "en-US")
    const regionMatch = code.match(/[-_]([a-zA-Z]{2,3}|\d{3})$/);
    const region = regionMatch ? regionMatch[1] : null;

    if (region && hasIntlDisplayNames()) {
      let dr;
      try {
        // Get region name in the current browser language
        dr = new Intl.DisplayNames([navigator.language || "en"], {
          type: "region"
        }).of(region.toUpperCase());
        return `${dn} (${dr})`;
      } catch (regionError) {
        // Fallback if region code is invalid (e.g., 'es-419')
        return `${dn} (${region.toUpperCase()})`;
      }
    }
    return dn;
  } catch (e) {
    return code;
  }
}

/**
 * @returns {boolean}
 */
function hasIntlDisplayNames() {
  return typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function";
}

/**
 * @param {string} lang
 * @returns {string}
 */
function fallbackLangName(lang) {
  const map = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
    pt: "Português",
    hi: "हिन्दी",
    ja: "日本語",
    ko: "한국어",
    zh: "中文",
    ar: "العربية",
    da: "Dansk"
  };
  return map[lang?.toLowerCase()] || lang || "Unknown";
}

/**
 * @param {string} s
 * @returns {string}
 */
function capitalize(s) {
  return (s || "").slice(0, 1).toUpperCase() + (s || "").slice(1);
}

/**
 * @returns {void}
 */
function populateVoices() {
  const filtered = (voicesCache || [])
    .filter(v => !pref.lang || (v.lang && v.lang.toLowerCase().startsWith(pref.lang.toLowerCase())))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  const menu = byId(IDS.voiceMenu);
  if (!menu) return;
  menu.replaceChildren();
  menu.tabIndex = -1; // Make focusable

  const checkIcon = svgCheck();
  if (!filtered.length) {
    const item = document.createElement("div");
    item.className = "rs-menu-item";
    item.style.fontStyle = "italic";
    item.style.color = "var(--rs-on-surface-variant)";
    item.textContent = "No voices for this language";
    menu.appendChild(item);
    pref.voiceURI = "";
    localStorage.setItem("RS_VOICE_URI", pref.voiceURI);
  } else {
    let currentVoiceInList = false;
    filtered.forEach(v => {
      const item = document.createElement("div");
      item.className = "rs-menu-item";
      item.dataset.value = v.voiceURI;
      item.tabIndex = 0; // Make item focusable
      item.innerHTML = `<span class="rs-check-icon">${checkIcon}</span><span>${v.name} (${v.lang})${
        v.default ? " - Default" : ""
      }</span>`;

      // Fix 3: Ensure initial selection is correct
      if (v.voiceURI === pref.voiceURI) {
        item.dataset.selected = "true";
        currentVoiceInList = true;
      }

      const onItemClick = () => {
        pref.voiceURI = v.voiceURI;
        localStorage.setItem("RS_VOICE_URI", pref.voiceURI);
        if (isReading) synth.cancel();
        const map = getVoiceMap();
        map[pref.lang] = v.voiceURI;
        setVoiceMap(map);

        // Fix 3: Update DOM selection
        menu.querySelectorAll(".rs-menu-item").forEach(el => (el.dataset.selected = "false"));
        item.dataset.selected = "true";

        hide(menu);
      };

      item.addEventListener("click", onItemClick);
      item.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onItemClick();
        }
      });
      menu.appendChild(item);
    });
    if (!currentVoiceInList && menu.children.length > 0) {
      const firstItem = menu.children[0];
      if (firstItem && firstItem.classList.contains("rs-menu-item")) {
        firstItem.dataset.selected = "true";
        const firstVoiceURI = firstItem.dataset.value || "";
        pref.voiceURI = firstVoiceURI;
        localStorage.setItem("RS_VOICE_URI", pref.voiceURI);
        const map = getVoiceMap();
        if (pref.lang) map[pref.lang] = firstVoiceURI;
        setVoiceMap(map);
      }
    }
  }
}

/**
 * @returns {Object.<string, string>}
 */
function getVoiceMap() {
  try {
    return JSON.parse(localStorage.getItem(VOICE_MAP_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

/**
 * @param {Object.<string, string>} obj
 * @returns {void}
 */
function setVoiceMap(obj) {
  try {
    localStorage.setItem(VOICE_MAP_KEY, JSON.stringify(obj));
  } catch {}
}

/**
 * @returns {void}
 */
function onSelectionUpdate() {
  if (isReading || !allowToolbar || isResizing) return;
  hide(langMenu);
  hide(voiceMenu);
  hide(rateMenu);
  const info = getSelectionInfo();
  const tb = byId(IDS.toolbar);
  if (!tb) return;
  if (!info) {
    hide(tb);
    return;
  }
  tb.style.display = "inline-flex";

  if (snapWidths.length === 0) calculateSnapWidths();
  const savedWidth = localStorage.getItem(WIDTH_KEY);
  tb.style.width = savedWidth ? `${savedWidth}px` : `${minToolbarWidth}px`;

  requestAnimationFrame(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;

    // Get all selection rects
    const range = sel.getRangeAt(0);
    const rects = Array.from(range.getClientRects()).filter(r => r.width > 0 && r.height > 0);
    if (rects.length === 0) return;

    const tbWidth = tb.offsetWidth;
    const tbHeight = tb.offsetHeight;
    const margin = 10;
    const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    /**
     * @param {{left: number, top: number, width: number, height: number}} rect
     * @returns {boolean}
     */
    const inViewport = rect => {
      return (
        rect.left >= 0 &&
        rect.top >= 0 &&
        rect.top + rect.height <= viewportHeight &&
        rect.left + rect.width <= viewportWidth
      );
    };

    /**
     * @param {{left: number, top: number, width: number, height: number}} rect
     * @returns {boolean}
     */
    const overlapsRects = rect => {
      return rects.some(
        r =>
          r.left <= rect.left + rect.width &&
          rect.left <= r.left + r.width &&
          r.top <= rect.top + rect.height &&
          rect.top <= r.top + r.height
      );
    };

    // Try to position toolbar above first rect
    const firstRect = rects[0];
    let toolbarRect = {
      left: Math.max(margin, firstRect.left + firstRect.width / 2 - tbWidth / 2),
      top: Math.max(margin, firstRect.top - tbHeight - margin),
      width: tbWidth,
      height: tbHeight
    };

    // Ensure toolbar doesn't overflow right edge
    toolbarRect.left = Math.min(toolbarRect.left, viewportWidth - tbWidth - margin);

    // If toolbar fits above and doesn't overlap, use that position
    if (inViewport(toolbarRect) && !overlapsRects(toolbarRect)) {
      tb.style.left = `${window.scrollX + toolbarRect.left}px`;
      tb.style.top = `${window.scrollY + toolbarRect.top}px`;
      return;
    }

    // Otherwise, try below the last rect
    const lastRect = rects[rects.length - 1];
    toolbarRect = {
      left: Math.max(margin, lastRect.left + lastRect.width / 2 - tbWidth / 2),
      top: lastRect.top + lastRect.height + margin,
      width: tbWidth,
      height: tbHeight
    };

    // Ensure toolbar doesn't overflow right edge
    toolbarRect.left = Math.min(toolbarRect.left, viewportWidth - tbWidth - margin);

    // If toolbar fits below and is in viewport, use that position
    if (inViewport(toolbarRect)) {
      tb.style.left = `${window.scrollX + toolbarRect.left}px`;
      tb.style.top = `${window.scrollY + toolbarRect.top}px`;
      return;
    }

    // Fallback: try to position to the left of selection
    for (const r of rects) {
      toolbarRect = {
        left: Math.max(margin, r.left - tbWidth - margin),
        top: Math.max(margin, r.top),
        width: tbWidth,
        height: tbHeight
      };

      if (inViewport(toolbarRect) && !overlapsRects(toolbarRect)) {
        tb.style.left = `${window.scrollX + toolbarRect.left}px`;
        tb.style.top = `${window.scrollY + toolbarRect.top}px`;
        return;
      }
    }

    // Final fallback: top-left of viewport with some margin
    tb.style.left = `${window.scrollX + margin}px`;
    tb.style.top = `${window.scrollY + margin}px`;
  });
}

/**
 * @param {MouseEvent} e
 * @returns {void}
 */
function onDocClick(e) {
  if (isReading || isResizing) return;
  const t = e.target;
  if (!(t instanceof Element)) return;

  if (
    t.closest(`#${IDS.toolbar}`) ||
    t.closest(`.${IDS.langMenu}`) ||
    t.closest(`.${IDS.voiceMenu}`) ||
    t.closest(`.${IDS.rateMenu}`)
  )
    return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) {
    hide(byId(IDS.toolbar));
    hide(langMenu);
    hide(voiceMenu);
    hide(rateMenu);
  }
}

/**
 * @returns {{text: string, rect: DOMRect, range: Range}|null}
 */
function getSelectionInfo() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return null;
  const text = String(sel).trim();
  if (!text) return null;
  try {
    const range = sel.getRangeAt(0);
    let rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      const el = document.activeElement;
      if (el && "selectionStart" in el) rect = el.getBoundingClientRect();
    }
    return { text, rect: rect, range: range.cloneRange() };
  } catch {
    return null;
  }
}

/**
 * @param {Range} range
 * @returns {Array<{node: Node, start: number, end: number, len: number}>}
 */
function textNodesInRange(range) {
  if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
    return [
      {
        node: range.commonAncestorContainer,
        start: range.startOffset,
        end: range.endOffset,
        len: range.endOffset - range.startOffset
      }
    ];
  }

  const nodes = [];
  const tw = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, {
    acceptNode: n => {
      const nr = document.createRange();
      try {
        nr.selectNodeContents(n);
      } catch {
        return NodeFilter.FILTER_REJECT;
      }
      const cmpStart = nr.compareBoundaryPoints(Range.END_TO_START, range) <= 0;
      const cmpEnd = nr.compareBoundaryPoints(Range.START_TO_END, range) >= 0;
      return cmpStart && cmpEnd ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  let n;
  while ((n = tw.nextNode())) {
    const start = n === range.startContainer ? range.startOffset : 0;
    const end = n === range.endContainer ? range.endOffset : n.nodeValue.length;
    if (end > start) nodes.push({ node: n, start, end, len: end - start });
  }
  return nodes;
}

/**
 * @param {Range} base
 * @returns {{map: Array<{node: Node, start: number, end: number, len: number, accStart: number}>, total: number, text: string}}
 */
function buildSliceMap(base) {
  const parts = textNodesInRange(base);
  const map = [];
  let acc = 0;
  for (const p of parts) {
    map.push({
      node: p.node,
      start: p.start,
      end: p.end,
      len: p.len,
      accStart: acc
    });
    acc += p.len;
  }
  const total = acc;
  const text = map.map(m => m.node.nodeValue.slice(m.start, m.end)).join("");
  return { map, total, text };
}

/**
 * @param {Range} base
 * @param {number} sliceStart
 * @param {number} sliceLen
 * @returns {Range|null}
 */
function makeSubRangeFromSlice(base, sliceStart, sliceLen) {
  const { map, total } = buildSliceMap(base);
  const clampedStart = Math.max(0, Math.min(sliceStart, total));
  const clampedEnd = Math.max(clampedStart, Math.min(sliceStart + sliceLen, total));
  const sub = document.createRange();
  let i = 0,
    pos = clampedStart;
  while (i < map.length && map[i].accStart + map[i].len <= pos) i++;
  if (i >= map.length) return null;
  const mStart = map[i];
  const startOffsetInNode = mStart.start + (pos - mStart.accStart);
  sub.setStart(mStart.node, startOffsetInNode);
  let j = i,
    posEnd = clampedEnd;
  while (j < map.length && map[j].accStart + map[j].len < posEnd) j++;
  const mEnd = map[j] || map[map.length - 1];
  const endOffsetInNode = mEnd.start + (posEnd - mEnd.accStart);
  sub.setEnd(mEnd.node, endOffsetInNode);
  return sub;
}

/**
 * @returns {void}
 */
function repaintHighlight() {
  if (!baseRange || !lastSlice) return;
  const sub = makeSubRangeFromSlice(baseRange, lastSlice.start, lastSlice.length);
  if (sub) drawRange(sub, false);
}

/**
 * @param {Range} r
 * @param {boolean} animate
 * @returns {void}
 */
function drawRange(r, animate) {
  const host = byId(IDS.layer);
  if (!host) return;
  host.replaceChildren();
  const PAD = 4;
  const rects = Array.from(r.getClientRects ? r.getClientRects() : []);
  rects.forEach((rc, i) => {
    const d = document.createElement("div");
    d.className = "rs-chunk" + (animate ? " rs-chunk--animate" : "");
    Object.assign(d.style, {
      left: `${window.scrollX + rc.left - PAD}px`,
      top: `${window.scrollY + rc.top - PAD}px`,
      width: `${rc.width + PAD * 2}px`,
      height: `${rc.height + PAD * 2}px`,
      animationDelay: animate ? `${i * 0.02}s` : "0s"
    });
    host.appendChild(d);
  });
}

/**
 * @param {string} text
 * @param {number} index
 * @returns {{start: number, length: number}}
 */
function getTokenAt(text, index) {
  if (!text) return { start: 0, length: 0 };
  let s = index,
    e = index;
  while (s > 0 && /\S/.test(text[s - 1])) s--;
  while (e < text.length && /\S/.test(text[e])) e++;
  return { start: s, length: Math.max(0, e - s) };
}

/**
 * @returns {void}
 */
function onReadClicked() {
  if (isReading || toolbar.dataset.reading === "loading") {
    synth.cancel();
    return;
  }
  const info = getSelectionInfo();
  if (!info) return;
  if (!synth) return;

  console.log("reading", info);

  hide(langMenu);
  hide(voiceMenu);
  hide(rateMenu);
  allowToolbar = false;
  synth.cancel();
  byId(IDS.layer)?.replaceChildren();
  document.body.classList.add("rs-reading");

  toolbar.dataset.reading = "loading";

  baseRange = info.range;
  const built = buildSliceMap(baseRange);
  lastText = built.text;
  lastAnimatedTokenStart = -1;
  utter = new SpeechSynthesisUtterance(built.text);
  utter.rate = pref.rate;
  utter.pitch = 1;
  utter.volume = 1;
  if (pref.lang) utter.lang = pref.lang;
  const chosenVoice =
    (voicesCache || []).find(v => v.voiceURI === pref.voiceURI) ||
    (voicesCache || []).find(v => v.lang && pref.lang && v.lang.toLowerCase().startsWith(pref.lang.toLowerCase()));
  if (chosenVoice) utter.voice = chosenVoice;

  utter.onstart = () => {
    isReading = true;
    toolbar.dataset.reading = "true";
  };

  utter.onend = utter.onerror = error => {
    console.log("Speech synthesis ended with error:", error);
    lastSlice = null;
    byId(IDS.layer)?.replaceChildren();
    document.body.classList.remove("rs-reading");
    isReading = false;
    toolbar.dataset.reading = "false";
    allowToolbar = true;
    onSelectionUpdate();
  };

  utter.onboundary = e => {
    const idx = typeof e.charIndex === "number" ? e.charIndex : null;
    if (idx == null) return;
    const tok = getTokenAt(lastText, idx);
    const isNewToken = tok.start !== lastAnimatedTokenStart;
    if (!/\S/.test(lastText[idx] || "")) return;
    let len = e.charLength;
    if (!len || len <= 0) len = tok.length || 1;
    lastAnimatedTokenStart = tok.start;
    lastSlice = { start: tok.start, length: len };
    const sub = makeSubRangeFromSlice(baseRange, tok.start, len);
    if (sub) drawRange(sub, isNewToken);
  };

  synth.speak(utter);
}

/**
 * @returns {void}
 */
function populateRates() {
  const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const menu = byId(IDS.rateMenu);
  if (!menu) return;
  menu.replaceChildren();
  menu.tabIndex = -1;

  const checkIcon = svgCheck();
  for (const rate of rates) {
    const item = document.createElement("div");
    item.className = "rs-menu-item";
    item.dataset.value = rate;
    item.tabIndex = 0;

    item.innerHTML = `<span class="rs-check-icon">${checkIcon}</span><span>${rate.toFixed(2)}x</span>`;

    // Fix 3: Ensure initial selection is correct
    if (rate === pref.rate) {
      item.dataset.selected = "true";
    }

    const onItemClick = () => {
      pref.rate = rate;
      localStorage.setItem("RS_RATE", pref.rate);
      if (isReading) {
        synth.cancel();
        onReadClicked();
      }

      // Fix 3: Update DOM selection
      menu.querySelectorAll(".rs-menu-item").forEach(el => (el.dataset.selected = "false"));
      item.dataset.selected = "true";

      hide(menu);
    };

    item.addEventListener("click", onItemClick);
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onItemClick();
      }
    });
    menu.appendChild(item);
  }
}

/**
 * @returns {string}
 */
function svgRate() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`;
}

/**
 * @returns {string}
 */
function svgPlay() {
  return `<svg class="rs-play-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7-11-7z"/></svg>`;
}

/**
 * @returns {string}
 */
function svgStop() {
  return `<svg class="rs-stop-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6h12v12H6z"/></svg>`;
}

/**
 * @returns {string}
 */
function svgLang() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17c-.7 2.36-1.95 4.5-3.71 6.53l-.03.03-2.54 2.51L1 18.07l2.12 2.12 6.4-6.4 2.54-2.51 6.4 6.4L23 18.07l-3.72-3.72-2.54 2.51zM10 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`;
}

/**
 * @returns {string}
 */
function svgVoice() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2s-1.2-.54-1.2-1.2V4.9zm6.5 6.1c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>`;
}

/**
 * @returns {string}
 */
function svgCheck() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
}

/**
 * @returns {string}
 */
function svgSpinner() {
  return `<svg class="rs-spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <path d="M12 2 A10 10 0 0 1 22 12 A10 10 0 0 1 12 22 A10 10 0 0 1 2 12"></path>
          </svg>`;
}
