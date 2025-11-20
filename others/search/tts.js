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
  langSelect: "rs-lang-select",
  voiceSelect: "rs-voice-select",
  rateSelect: "rs-rate-select",
  resizeHandle: "rs-resize-handle",
  langBadge: "rs-lang-badge" // Added back
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

// Calculate snap widths once elements are in the DOM
calculateSnapWidths();

toolbar.addEventListener("pointerdown", e => {
  // Don't stop propagation on selects so they can open
  if (e.target.tagName.toLowerCase() === "select") return;
  e.preventDefault();
  e.stopPropagation();
});

if (synth && typeof synth.addEventListener === "function") {
  synth.addEventListener("voiceschanged", () => {
    voicesCache = synth.getVoices();
    populateLangs();
    ensureVoiceForCurrentLang();
    populateVoices();
    calculateSnapWidths();
  });
}
voicesCache = synth?.getVoices?.() || [];
populateLangs();
ensureVoiceForCurrentLang();
populateVoices();
populateRates();
calculateSnapWidths();

document.addEventListener("pointerdown", e => {
  const t = e.target;
  const isToolbarClick = t.closest(`#${IDS.toolbar}`);
  if (isToolbarClick) return;

  if (isReading) {
    synth.cancel();
  }
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

byId(IDS.readBtn)?.addEventListener("click", () => {
  onReadClicked();
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
  [IDS.toolbar, IDS.layer, IDS.style].forEach(id => byId(id)?.remove());
  synth && synth.cancel();
};

/**
 * @returns {void}
 */
function injectStyles() {
  if (byId(IDS.style)) return;
  const s = document.createElement("style");
  s.id = IDS.style;
  s.textContent = /*CSS*/ `
    :root {
      --rs-surface: #ffffff;
      --rs-on-surface: #202124;
      --rs-on-surface-variant: #5f6368;
      --rs-outline: #dadce0;
      --rs-primary: #1a73e8;
      --rs-hover: #f1f3f4;
      --rs-shadow: rgba(0, 0, 0, 0.15);
      --rs-scrim: rgba(0, 0, 0, 0.4);

      /* Highlight Colors */
      --rs-word-bg-1: rgba(168, 203, 255, 0.7);
      --rs-word-bg-2: rgba(168, 203, 255, 0.5);
      --rs-word-outline: rgba(122, 168, 255, 0.8);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --rs-surface: #2d2e30;
        --rs-on-surface: #e8eaed;
        --rs-on-surface-variant: #bdc1c6;
        --rs-outline: #44474a;
        --rs-primary: #8ab4f8;
        --rs-hover: #3a3c3e;
        --rs-shadow: rgba(0, 0, 0, 0.3);
        --rs-scrim: rgba(0, 0, 0, 0.6);

        /* Dark Highlight Colors */
        --rs-word-bg-1: rgba(138, 180, 248, 0.45);
        --rs-word-bg-2: rgba(138, 180, 248, 0.25);
        --rs-word-outline: rgba(138, 180, 248, 0.85);
      }
    }

    /* Toolbar (Google Material Design) */
    #${IDS.toolbar} {
      position: absolute;
      z-index: ${Z};
      display: none; /* Hidden by default */
      flex-direction: row;
      align-items: center;
      gap: 4px; /* Tight gap like original */
      padding: 6px;
      background: var(--rs-surface);
      border: 1px solid var(--rs-outline);
      border-radius: 24px; /* Pill shape */
      box-shadow: 0 4px 8px -2px var(--rs-shadow), 0 0 1px 0 var(--rs-shadow);
      font: 13px/1.1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      backdrop-filter: saturate(120%) blur(6px);
      transition: opacity 0.15s ease, transform 0.15s ease, width 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.15s ease;
      overflow: hidden;
      white-space: nowrap;
      box-sizing: border-box;
    }

    /* Icon Button Shared Styles */
    .rs-icon-btn {
      position: relative;
      width: 36px;
      height: 36px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 50%;
      border: 1px solid transparent;
      background: transparent;
      color: var(--rs-on-surface-variant);
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease, transform 0.2s ease;
      box-sizing: border-box;
    }
    .rs-icon-btn:hover {
      background: var(--rs-hover);
    }
    .rs-icon-btn:active {
      background: color-mix(in srgb, var(--rs-hover) 80%, var(--rs-scrim));
    }
    .rs-icon-btn svg {
      width: 20px;
      height: 20px;
      pointer-events: none; /* Let clicks pass to select */
    }

    /* Overlay Selects */
    .rs-select-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      appearance: none;
      z-index: 5;
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
      z-index: 2;
    }

    /* Resize Handle */
    #${IDS.resizeHandle} {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      width: 16px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: ew-resize;
      z-index: 10;
      color: var(--rs-on-surface-variant);
      font-size: 16px;
      line-height: 1;
      opacity: 0;
      transition: all 0.2s ease;
      border-radius: 4px;
      user-select: none;
    }

    #${IDS.resizeHandle}::before {
      content: "⋮";
    }

    #${IDS.toolbar}:hover #${IDS.resizeHandle} {
      opacity: 0.6;
    }

    #${IDS.resizeHandle}:hover {
      opacity: 1 !important;
      background: var(--rs-hover);
    }

    #${IDS.toolbar}[data-resizing="true"] #${IDS.resizeHandle} {
      opacity: 1;
      background: color-mix(in srgb, var(--rs-hover) 80%, var(--rs-scrim));
    }

    /* Read/Stop Icon Toggle */
    #${IDS.readBtn} .rs-play-icon {
      display: inline-flex;
    }
    #${IDS.readBtn} .rs-stop-icon {
      display: none;
    }
    #${IDS.readBtn} .rs-spinner-icon {
      display: none;
    }

    #${IDS.toolbar}[data-reading="true"] #${IDS.readBtn} .rs-play-icon {
      display: none;
    }
    #${IDS.toolbar}[data-reading="true"] #${IDS.readBtn} .rs-stop-icon {
      display: inline-flex;
    }

    /* Added loading state */
    #${IDS.toolbar}[data-reading="loading"] #${IDS.readBtn} .rs-play-icon {
      display: none;
    }
    #${IDS.toolbar}[data-reading="loading"] #${IDS.readBtn} .rs-spinner-icon {
      display: inline-flex;
      animation: rsSpin 1s linear infinite;
    }

    .rs-reading ::selection {
      background: rgba(0, 0, 0, 0.045);
      color: inherit;
    }
    @media (prefers-color-scheme: dark) {
      .rs-reading ::selection {
        background: rgba(255, 255, 255, 0.15);
        color: inherit;
      }
    }

    @keyframes rsBounceIn {
      0% {
        transform: translateX(-10%) scaleX(0.1);
        opacity: 0.15;
      }
      55% {
        transform: translateX(2%) scaleX(1.05);
        opacity: 0.98;
      }
      75% {
        transform: translateX(-1%) scaleX(0.98);
      }
      100% {
        transform: translateX(0) scaleX(1);
        opacity: 1;
      }
    }

    @keyframes rsSpin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    #${IDS.layer} {
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: ${Z};
    }
    .rs-chunk {
      position: absolute;
      border-radius: 6px;
      background-image: linear-gradient(
        180deg,
        rgba(77, 184, 255, 0.3) 15%,
        transparent 40%,
        transparent 60%,
        rgba(77, 184, 255, 0.4) 85%
      );
      outline: 1px solid rgba(40, 150, 220, 0.9);
      box-shadow: 0 4px 10px var(--rs-shadow), inset 0 0 0 1px rgba(255, 255, 255, 0.06);
      transform-origin: left center;
    }
    .rs-chunk--animate {
      animation: rsBounceIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    option {
      font: 14px / 1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      /* Should be working after updating to https://codepen.io/zuhairtaha/pen/emZGzzE */
      padding: 8px 16px 8px 20px;
      color: var(--rs-on-surface);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }
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

  // Read Button
  const read = document.createElement("button");
  read.className = "rs-icon-btn";
  read.title = "Read";
  read.id = IDS.readBtn;
  read.innerHTML = svgPlay() + svgStop() + svgSpinner();

  // Language Button Wrapper (Icon + Badge + Hidden Select)
  const langWrap = document.createElement("div");
  langWrap.className = "rs-icon-btn";
  langWrap.title = "Language";
  langWrap.innerHTML = svgLang(); // Visual Icon

  const langBadge = document.createElement("span");
  langBadge.id = IDS.langBadge;
  langWrap.appendChild(langBadge); // Visual Badge

  const langSelect = document.createElement("select");
  langSelect.id = IDS.langSelect;
  langSelect.className = "rs-select-overlay";
  langWrap.appendChild(langSelect); // Functional Select

  // Voice Button Wrapper
  const voiceWrap = document.createElement("div");
  voiceWrap.className = "rs-icon-btn";
  voiceWrap.title = "Voice";
  voiceWrap.innerHTML = svgVoice();

  const voiceSelect = document.createElement("select");
  voiceSelect.id = IDS.voiceSelect;
  voiceSelect.className = "rs-select-overlay";
  voiceWrap.appendChild(voiceSelect);

  // Rate Button Wrapper
  const rateWrap = document.createElement("div");
  rateWrap.className = "rs-icon-btn";
  rateWrap.title = "Reading Speed";
  rateWrap.innerHTML = svgRate();

  const rateSelect = document.createElement("select");
  rateSelect.id = IDS.rateSelect;
  rateSelect.className = "rs-select-overlay";
  rateWrap.appendChild(rateSelect);

  const resizeHandle = document.createElement("div");
  resizeHandle.id = IDS.resizeHandle;

  el.append(read, langWrap, voiceWrap, rateWrap, resizeHandle);
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
  tb.style.width = "auto";

  // The elements are wrappers now, but still .rs-icon-btn
  // Widths should be consistent (36px)
  const btns = tb.querySelectorAll(".rs-icon-btn");
  if (btns.length < 4) {
    tb.style.display = originalDisplay;
    tb.style.visibility = "visible";
    return;
  }

  const gap = 4; // From CSS
  const padding = 6; // Single side padding from CSS
  const btnWidth = 36;

  // Snap Widths
  snapWidths = [
    // 1. Read
    padding * 2 + btnWidth,
    // 2. Read + Lang
    padding * 2 + btnWidth * 2 + gap,
    // 3. Read + Lang + Voice
    padding * 2 + btnWidth * 3 + gap * 2,
    // 4. Read + All
    padding * 2 + btnWidth * 4 + gap * 3
  ];

  minToolbarWidth = snapWidths[0];
  maxToolbarWidth = snapWidths[snapWidths.length - 1];

  // Restore original style
  tb.style.display = originalDisplay;
  tb.style.visibility = "visible";
  tb.style.width = "";
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
    toolbar.style.transition = "none";
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
    toolbar.style.transition = "";
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
    handle.releasePointerCapture(e.pointerId);

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

  const select = byId(IDS.langSelect);
  if (!select) return;

  select.innerHTML = "";

  if (pref.lang && !langs.includes(pref.lang)) {
    langs.unshift(pref.lang);
  }

  for (const code of langs) {
    if (!code) continue;
    const nativeName = langDisplayName(code);
    const option = new Option(nativeName, code);
    if (code.toLowerCase() === (pref.lang || "").toLowerCase()) {
      option.selected = true;
    }
    select.add(option);
  }

  updateLangBadge();

  select.onchange = () => {
    pref.lang = select.value;
    localStorage.setItem("RS_LANG", pref.lang);
    if (isReading) synth.cancel();
    ensureVoiceForCurrentLang();
    populateVoices();
    updateLangBadge();
    calculateSnapWidths();
  };
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
    const lang = code.split(/[-_]/)[0];
    if (!lang) return code;

    let dn;
    if (hasIntlDisplayNames()) {
      dn = new Intl.DisplayNames([lang], {
        type: "language"
      }).of(lang);
    } else {
      dn = fallbackLangName(lang);
    }
    dn = capitalize(dn);

    const regionMatch = code.match(/[-_]([a-zA-Z]{2,3}|\d{3})$/);
    const region = regionMatch ? regionMatch[1] : null;

    if (region && hasIntlDisplayNames()) {
      let dr;
      try {
        dr = new Intl.DisplayNames([navigator.language || "en"], {
          type: "region"
        }).of(region.toUpperCase());
        return `${dn} (${dr})`;
      } catch (regionError) {
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

  const select = byId(IDS.voiceSelect);
  if (!select) return;

  select.innerHTML = "";

  if (!filtered.length) {
    const option = new Option("No voices", "");
    option.disabled = true;
    select.add(option);
    pref.voiceURI = "";
    localStorage.setItem("RS_VOICE_URI", pref.voiceURI);
  } else {
    let currentVoiceInList = false;
    filtered.forEach(v => {
      const label = `${v.name}${v.default ? " (Default)" : ""}`;
      const option = new Option(label, v.voiceURI);
      if (v.voiceURI === pref.voiceURI) {
        option.selected = true;
        currentVoiceInList = true;
      }
      select.add(option);
    });

    if (!currentVoiceInList && select.options.length > 0) {
      select.selectedIndex = 0;
      const firstVoiceURI = select.value;
      pref.voiceURI = firstVoiceURI;
      localStorage.setItem("RS_VOICE_URI", pref.voiceURI);
      const map = getVoiceMap();
      if (pref.lang) map[pref.lang] = firstVoiceURI;
      setVoiceMap(map);
    }
  }

  select.onchange = () => {
    pref.voiceURI = select.value;
    localStorage.setItem("RS_VOICE_URI", pref.voiceURI);
    if (isReading) synth.cancel();
    const map = getVoiceMap();
    map[pref.lang] = select.value;
    setVoiceMap(map);
  };
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

  if (t.closest(`#${IDS.toolbar}`)) return;

  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) {
    hide(byId(IDS.toolbar));
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
  const select = byId(IDS.rateSelect);
  if (!select) return;

  select.innerHTML = "";

  for (const rate of rates) {
    const option = new Option(`${rate.toFixed(2)}x`, rate);
    if (rate === pref.rate) {
      option.selected = true;
    }
    select.add(option);
  }

  select.onchange = () => {
    pref.rate = parseFloat(select.value);
    localStorage.setItem("RS_RATE", pref.rate);
    if (isReading) {
      synth.cancel();
      onReadClicked();
    }
  };
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
function svgSpinner() {
  return `<svg class="rs-spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <path d="M12 2 A10 10 0 0 1 22 12 A10 10 0 0 1 12 22 A10 10 0 0 1 2 12"></path>
          </svg>`;
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
function svgRate() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`;
}
