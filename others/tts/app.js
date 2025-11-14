// source: https://portal.supernova.io/571617/613724/653244/projects/23464/explore/1bb92444-2e4f-4f90-8e0c-5bd232e562bc?messageThreadId=17d33622-fdf5-45d4-8822-8ee51e406268
(() => {
  /** @typedef {{ lang: string, voiceURI: string }} RSPrefs */
  /** @typedef {{ start: number, length: number }} Slice */

  const Z = 2147483647;
  const synth = window.speechSynthesis;

  const IDS = {
    style: "__rs_styles",
    layer: "rs-highlight-layer",
    toolbar: "rs-toolbar",
    readBtn: "rs-read-btn",
    langBtn: "rs-lang-btn",
    voiceBtn: "rs-voice-btn",
    langMenu: "rs-lang-menu",
    voiceMenu: "rs-voice-menu",
    langSelect: "rs-lang-select",
    voiceSelect: "rs-voice-select"
  };

  /** @type {RSPrefs} */
  const pref = {
    lang:
      localStorage.getItem("RS_LANG") ||
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      "en-US",
    voiceURI: localStorage.getItem("RS_VOICE_URI") || ""
  };

  const VOICE_MAP_KEY = "RS_VOICE_BY_LANG";

  /** @type {Range|null} */
  let baseRange = null;
  /** @type {string} */
  let lastText = "";
  /** @type {Slice|null} */
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

  injectStyles();
  const toolbar = ensureToolbar();
  const layer = ensureLayer();

  // Keep selection intact and avoid document-level hide on toolbar interactions
  toolbar.addEventListener("pointerdown", e => {
    e.preventDefault();
    e.stopPropagation();
  });

  populateLangs();
  ensureVoiceForCurrentLang();
  populateVoices();

  // Use pointer events to handle mouse/touch/pen uniformly
  document.addEventListener("pointerdown", e => {
    const t = /** @type {HTMLElement} */ (e.target);
    if (t.closest(`#${IDS.toolbar}, #${IDS.langMenu}, #${IDS.voiceMenu}`)) return;
    if (!isReading) {
      allowToolbar = false;
      hide(toolbar);
      closeMenus();
    }
  });
  document.addEventListener("pointerup", () => {
    allowToolbar = true;
    onSelectionUpdate();
  });

  document.addEventListener("mouseup", onSelectionUpdate);
  document.addEventListener("keyup", onSelectionUpdate);
  document.addEventListener("selectionchange", onSelectionUpdate);
  document.addEventListener("scroll", repaintHighlight, true);
  document.addEventListener("click", onDocClick, true);

  // Buttons: prevent selection collapse and bubbling that could hide toolbar
  [IDS.readBtn, IDS.langBtn, IDS.voiceBtn].forEach(id => {
    const el = byId(id);
    if (!el) return;
    el.addEventListener("pointerdown", e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  byId(IDS.readBtn)?.addEventListener("click", () => {
    closeMenus();
    onReadClicked();
  });

  byId(IDS.langBtn)?.addEventListener("click", e => {
    const btn = /** @type {HTMLElement} */ (e.currentTarget);
    toggleMenuNear(IDS.langMenu, btn.getBoundingClientRect());
    hideMenu(IDS.voiceMenu);
  });
  byId(IDS.voiceBtn)?.addEventListener("click", e => {
    const btn = /** @type {HTMLElement} */ (e.currentTarget);
    toggleMenuNear(IDS.voiceMenu, btn.getBoundingClientRect());
    hideMenu(IDS.langMenu);
  });

  if (synth && typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", () => {
      voicesCache = synth.getVoices();
      ensureVoiceForCurrentLang();
      populateVoices();
    });
  }

  window.removeReadSelectedTools = function removeReadSelectedTools() {
    document.removeEventListener("mouseup", onSelectionUpdate);
    document.removeEventListener("keyup", onSelectionUpdate);
    document.removeEventListener("selectionchange", onSelectionUpdate);
    document.removeEventListener("scroll", repaintHighlight, true);
    document.removeEventListener("click", onDocClick, true);
    document.body.classList.remove("rs-reading");
    [IDS.toolbar, IDS.layer, IDS.style, IDS.langMenu, IDS.voiceMenu].forEach(id => byId(id)?.remove());
    synth && synth.cancel();
  };

  /**
   * Inject styles: Material-like toolbar, transparent selection during reading,
   * blue-ish word chip, and updated bounce animation.
   * @returns {void}
   */
  function injectStyles() {
    if (byId(IDS.style)) return;
    const s = document.createElement("style");
    s.id = IDS.style;
    s.textContent = `
      :root {
        --rs-surface: #1e1f24;
        --rs-on-surface: #e9e9ef;
        --rs-outline: rgba(233,233,239,.12);
        --rs-menu-surface: #23252b;
        --rs-primary: #8ab4f8;
        --rs-shadow: rgba(0,0,0,.45);

        /* Word chip now blue-ish */
        --rs-word-bg-1: rgba(138, 180, 248, .45);
        --rs-word-bg-2: rgba(138, 180, 248, .25);
        --rs-word-outline: rgba(138, 180, 248, .85);
      }

      .rs-elev-3 {
        box-shadow:
          0 1px 2px rgba(0,0,0,.20),
          0 2px 6px rgba(0,0,0,.18),
          0 8px 20px rgba(0,0,0,.16);
      }

      /* Toolbar */
      #${IDS.toolbar} {
        position: absolute;
        z-index: ${Z};
        display: none;
        padding: 8px;
        gap: 8px;
        background: var(--rs-surface);
        color: var(--rs-on-surface);
        border: 1px solid var(--rs-outline);
        border-radius: 12px;
        font: 13px/1.1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        backdrop-filter: saturate(120%) blur(6px);
      }

      .rs-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        min-height: 36px;
        border-radius: 10px;
        border: 1px solid var(--rs-outline);
        background: linear-gradient(180deg, #2a2c33, #24262d);
        color: var(--rs-on-surface);
        cursor: pointer;
        user-select: none;
        transition: background .15s ease, transform .05s ease, box-shadow .15s ease;
      }
      .rs-btn:hover {
        background: linear-gradient(180deg, #32343c, #2a2c33);
        box-shadow: 0 1px 2px rgba(0,0,0,.25);
      }
      .rs-btn:active { transform: translateY(1px); }
      .rs-btn svg { color: var(--rs-primary); }

      .rs-icon-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        border: 1px solid var(--rs-outline);
        background: linear-gradient(180deg, #2a2c33, #24262d);
        color: var(--rs-on-surface);
        cursor: pointer;
        transition: background .15s ease, box-shadow .15s ease, transform .05s ease;
      }
      .rs-icon-btn:hover {
        background: linear-gradient(180deg, #32343c, #2a2c33);
        box-shadow: 0 1px 2px rgba(0,0,0,.25);
      }
      .rs-icon-btn:active { transform: translateY(1px); }
      .rs-divider { width:1px; background: var(--rs-outline); margin: 0 4px; }

      /* Menus */
      #${IDS.langMenu}, #${IDS.voiceMenu} {
        position: absolute;
        z-index: ${Z};
        display: none;
        min-width: 280px;
        max-height: 320px;
        overflow: auto;
        margin-top: 6px;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid var(--rs-outline);
        background: var(--rs-menu-surface);
        color: var(--rs-on-surface);
      }
      .rs-menu header {
        font-weight: 600;
        margin: 2px 0 10px;
        font-size: 12px;
        opacity: .95;
        letter-spacing: .2px;
      }
      .rs-menu select {
        width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid var(--rs-outline);
        background: #202229;
        color: var(--rs-on-surface);
        font-size: 13px;
        outline: none;
      }
      .rs-menu select:focus {
        border-color: var(--rs-primary);
        box-shadow: 0 0 0 2px rgba(138,180,248,.25);
      }

      /* Selection while reading: transparent */
      .rs-reading ::selection {
        background: transparent;
        color: inherit;
      }

      /* Combined bounce: starts a bit larger, dips smaller, settles at 1 */
      @keyframes rsBounceIn {
        0%   { transform: translateX(-6%) scale(1.12, 1.08); opacity: .15; }
        30%  { transform: translateX(2%)  scale(0.94, 0.96); opacity: .98; }
        55%  { transform: translateX(0)   scale(1.06, 1.02); }
        100% { transform: translateX(0)   scale(1, 1); opacity: 1; }
      }

      #${IDS.layer} { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: ${Z}; }
      .rs-chunk {
        position: absolute;
        border-radius: 6px;
        background: linear-gradient(180deg, var(--rs-word-bg-1), var(--rs-word-bg-2));
        outline: 1px solid var(--rs-word-outline);
        box-shadow: 0 6px 14px var(--rs-shadow), inset 0 0 0 1px rgba(255,255,255,.06);
        transform-origin: left center;
      }
      .rs-chunk--animate { animation: rsBounceIn .22s cubic-bezier(.34,1.56,.64,1); }
      /* Removed underline: .rs-chunk::after deleted as requested */
    `;
    document.head.appendChild(s);
  }

  /**
   * Ensure toolbar exists.
   * @returns {HTMLDivElement}
   */
  function ensureToolbar() {
    let el = byId(IDS.toolbar);
    if (el) return /** @type {HTMLDivElement} */ (el);
    el = document.createElement("div");
    el.id = IDS.toolbar;
    el.className = "rs-elev-3";

    const read = button("Read", svgPlay(), "rs-btn");
    read.id = IDS.readBtn;

    const langBtn = iconButton(svgLang(), "Language");
    langBtn.id = IDS.langBtn;

    const voiceBtn = iconButton(svgVoice(), "Voice");
    voiceBtn.id = IDS.voiceBtn;

    const divider = document.createElement("div");
    divider.className = "rs-divider";

    el.append(read, divider, langBtn, voiceBtn);
    document.body.appendChild(el);

    const langMenu = buildMenu("Select language", IDS.langMenu, IDS.langSelect);
    const voiceMenu = buildMenu("Select voice", IDS.voiceMenu, IDS.voiceSelect);
    document.body.append(langMenu, voiceMenu);

    return /** @type {HTMLDivElement} */ (el);
  }

  /**
   * Ensure highlight layer exists.
   * @returns {HTMLDivElement}
   */
  function ensureLayer() {
    let el = byId(IDS.layer);
    if (el) return /** @type {HTMLDivElement} */ (el);
    el = document.createElement("div");
    el.id = IDS.layer;
    document.body.appendChild(el);
    return /** @type {HTMLDivElement} */ (el);
  }

  /**
   * Create a text button.
   * @param {string} label
   * @param {string} iconSvg
   * @param {string} cls
   * @returns {HTMLButtonElement}
   */
  function button(label, iconSvg, cls) {
    const b = document.createElement("button");
    b.className = cls;
    b.innerHTML = `${iconSvg}<span>${label}</span>`;
    return b;
  }

  /**
   * Create an icon button.
   * @param {string} iconSvg
   * @param {string} title
   * @returns {HTMLButtonElement}
   */
  function iconButton(iconSvg, title) {
    const b = document.createElement("button");
    b.className = "rs-icon-btn";
    b.title = title;
    b.innerHTML = iconSvg;
    return b;
  }

  /**
   * Build a simple menu container with header and select.
   * @param {string} title
   * @param {string} menuId
   * @param {string} selectId
   * @returns {HTMLDivElement}
   */
  function buildMenu(title, menuId, selectId) {
    const wrap = document.createElement("div");
    wrap.id = menuId;
    wrap.className = "rs-menu rs-elev-3";

    const header = document.createElement("header");
    header.textContent = title;

    const select = document.createElement("select");
    select.id = selectId;

    wrap.append(header, select);
    return wrap;
  }

  /**
   * Get element by id.
   * @param {string} id
   * @returns {HTMLElement|null}
   */
  function byId(id) {
    return document.getElementById(id);
  }

  /**
   * Hide an element (display:none).
   * @param {HTMLElement|null} el
   * @returns {void}
   */
  function hide(el) {
    if (el) el.style.display = "none";
  }

  /**
   * Toggle a menu near a rect.
   * @param {string} menuId
   * @param {DOMRect} rect
   * @returns {void}
   */
  function toggleMenuNear(menuId, rect) {
    const el = byId(menuId);
    if (!el) return;
    if (el.style.display === "block") {
      el.style.display = "none";
    } else {
      el.style.left = `${window.scrollX + rect.left}px`;
      el.style.top = `${window.scrollY + rect.bottom + 6}px`;
      el.style.display = "block";
    }
  }

  /**
   * Hide menu by id.
   * @param {string} menuId
   * @returns {void}
   */
  function hideMenu(menuId) {
    const el = byId(menuId);
    if (el) el.style.display = "none";
  }

  /**
   * Close both menus.
   * @returns {void}
   */
  function closeMenus() {
    hideMenu(IDS.langMenu);
    hideMenu(IDS.voiceMenu);
  }

  /**
   * Populate language select with human-readable names.
   * @returns {void}
   */
  function populateLangs() {
    const langs = unique([
      pref.lang,
      ...(navigator.languages || []),
      navigator.language || "en-US",
      "en-US",
      "en-GB",
      "es-ES",
      "fr-FR",
      "de-DE",
      "it-IT",
      "pt-BR",
      "hi-IN",
      "ja-JP",
      "ko-KR",
      "zh-CN"
    ]);

    const sel = /** @type {HTMLSelectElement} */ (byId(IDS.langSelect));
    if (!sel) return;
    sel.replaceChildren();
    for (const code of langs) {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = langDisplayName(code);
      if (code.toLowerCase() === (pref.lang || "").toLowerCase()) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.onchange = () => {
      pref.lang = sel.value;
      localStorage.setItem("RS_LANG", pref.lang);
      ensureVoiceForCurrentLang();
      populateVoices();
    };
  }

  /**
   * Ensure pref.voiceURI is set to last-used for this language, or default.
   * @returns {void}
   */
  function ensureVoiceForCurrentLang() {
    const map = getVoiceMap();
    const saved = map[pref.lang];
    voicesCache = synth?.getVoices?.() || voicesCache || [];
    const filtered = voicesCache.filter(v => v.lang && v.lang.toLowerCase().startsWith(pref.lang.toLowerCase()));
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
   * Convert language code to display name (with region).
   * @param {string} code
   * @returns {string}
   */
  function langDisplayName(code) {
    try {
      const [lang, region] = code.split(/[-_]/);
      const dn = hasIntlDisplayNames()
        ? new Intl.DisplayNames([pref.lang || navigator.language || "en"], { type: "language" }).of(lang)
        : fallbackLangName(lang);
      const dr =
        region && hasIntlDisplayNames()
          ? new Intl.DisplayNames([pref.lang || navigator.language || "en"], { type: "region" }).of(
              region.toUpperCase()
            )
          : region;
      return dr ? `${capitalize(dn)} (${dr})` : capitalize(dn);
    } catch {
      return code;
    }
  }

  /**
   * Whether Intl.DisplayNames is available.
   * @returns {boolean}
   */
  function hasIntlDisplayNames() {
    return typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function";
  }

  /**
   * Basic fallback language names.
   * @param {string} lang
   * @returns {string}
   */
  function fallbackLangName(lang) {
    const map = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      hi: "Hindi",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese"
    };
    return map[lang?.toLowerCase()] || lang || "Unknown";
  }

  /**
   * Capitalize a string (first char).
   * @param {string} s
   * @returns {string}
   */
  function capitalize(s) {
    return (s || "").slice(0, 1).toUpperCase() + (s || "").slice(1);
  }

  /**
   * Populate voices select, respecting current language and saved choice.
   * @returns {void}
   */
  function populateVoices() {
    voicesCache = synth?.getVoices?.() || voicesCache || [];
    const filtered = voicesCache
      .filter(v => !pref.lang || (v.lang && v.lang.toLowerCase().startsWith(pref.lang.toLowerCase())))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const sel = /** @type {HTMLSelectElement} */ (byId(IDS.voiceSelect));
    if (!sel) return;
    sel.replaceChildren();

    if (!filtered.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No voices yet — try again";
      sel.appendChild(opt);
    } else {
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "(Browser default)";
      sel.appendChild(empty);
      for (const v of filtered) {
        const opt = document.createElement("option");
        opt.value = v.voiceURI;
        opt.textContent = `${v.name} — ${v.lang}${v.default ? " (default)" : ""}`;
        if (v.voiceURI === pref.voiceURI) opt.selected = true;
        sel.appendChild(opt);
      }
    }

    sel.onchange = () => {
      const uri = sel.value || "";
      pref.voiceURI = uri;
      localStorage.setItem("RS_VOICE_URI", pref.voiceURI);
      const map = getVoiceMap();
      if (uri) map[pref.lang] = uri;
      setVoiceMap(map);
    };
  }

  /**
   * Get persisted voice map.
   * @returns {Record<string,string>}
   */
  function getVoiceMap() {
    try {
      return JSON.parse(localStorage.getItem(VOICE_MAP_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  /**
   * Persist voice map.
   * @param {Record<string,string>} obj
   * @returns {void}
   */
  function setVoiceMap(obj) {
    try {
      localStorage.setItem(VOICE_MAP_KEY, JSON.stringify(obj));
    } catch {}
  }

  /**
   * Update toolbar position/visibility based on selection.
   * Only runs when not reading and allowed.
   * @returns {void}
   */
  function onSelectionUpdate() {
    if (isReading || !allowToolbar) return;
    const info = getSelectionInfo();
    const tb = byId(IDS.toolbar);
    if (!tb) return;
    if (!info) {
      hide(tb);
      return;
    }
    tb.style.display = "inline-flex";
    requestAnimationFrame(() => {
      tb.style.left = `${window.scrollX + info.rect.right - tb.offsetWidth}px`;
      tb.style.top = `${window.scrollY + info.rect.bottom + 6}px`;
    });
  }

  /**
   * Document click handler to hide on outside click without selection.
   * @param {MouseEvent} e
   * @returns {void}
   */
  function onDocClick(e) {
    const t = /** @type {HTMLElement} */ (e.target);
    if (t.closest(`#${IDS.toolbar}, #${IDS.langMenu}, #${IDS.voiceMenu}`)) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      hide(byId(IDS.toolbar));
      closeMenus();
    }
  }

  /**
   * Get selection text/rect/range.
   * @returns {{ text: string, rect: DOMRect, range: Range } | null}
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
        const el = /** @type {HTMLElement & {selectionStart?:number}} */ (document.activeElement);
        if (el && "selectionStart" in el) rect = el.getBoundingClientRect();
      }
      return { text, rect, range: range.cloneRange() };
    } catch {
      return null;
    }
  }

  /**
   * Collect text nodes intersecting a range with offsets.
   * @param {Range} range
   * @returns {{node: Text, start:number, end:number, len:number}[]}
   */
  function textNodesInRange(range) {
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
    /** @type {Text|null} */
    let n;
    while ((n = /** @type {Text} */ (tw.nextNode()))) {
      const start = n === range.startContainer ? range.startOffset : 0;
      const end = n === range.endContainer ? range.endOffset : n.nodeValue.length;
      if (end > start) nodes.push({ node: n, start, end, len: end - start });
    }
    return nodes;
  }

  /**
   * Build a flat text and mapping from the base range.
   * @param {Range} base
   * @returns {{ map: {node:Text,start:number,end:number,len:number,accStart:number}[], total:number, text:string }}
   */
  function buildSliceMap(base) {
    const parts = textNodesInRange(base);
    const map = [];
    let acc = 0;
    for (const p of parts) {
      map.push({ node: p.node, start: p.start, end: p.end, len: p.len, accStart: acc });
      acc += p.len;
    }
    const total = acc;
    const text = map.map(m => m.node.nodeValue.slice(m.start, m.end)).join("");
    return { map, total, text };
  }

  /**
   * Create a sub-range from a base range by character slice.
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
   * Redraw current highlight on scroll.
   * @returns {void}
   */
  function repaintHighlight() {
    if (!baseRange || !lastSlice) return;
    const sub = makeSubRangeFromSlice(baseRange, lastSlice.start, lastSlice.length);
    if (sub) drawRange(sub, false);
  }

  /**
   * Draw the highlight rectangles for a range.
   * @param {Range} r
   * @param {boolean} animate
   * @returns {void}
   */
  function drawRange(r, animate) {
    const host = byId(IDS.layer);
    if (!host) return;
    host.replaceChildren();
    const rects = Array.from(r.getClientRects ? r.getClientRects() : []);
    rects.forEach((rc, i) => {
      const d = document.createElement("div");
      d.className = "rs-chunk" + (animate ? " rs-chunk--animate" : "");
      Object.assign(d.style, {
        left: `${window.scrollX + rc.left}px`,
        top: `${window.scrollY + rc.top}px`,
        width: `${rc.width}px`,
        height: `${rc.height}px`,
        animationDelay: animate ? `${i * 0.02}s` : "0s"
      });
      host.appendChild(d);
    });
  }

  /**
   * Return token bounds (start/length) at index.
   * @param {string} text
   * @param {number} index
   * @returns {{start:number,length:number}}
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
   * Start reading the selected text and animate the word chip.
   * @returns {void}
   */
  function onReadClicked() {
    const info = getSelectionInfo();
    if (!info) return;
    if (!synth) {
      alert("Speech Synthesis not supported in this browser.");
      return;
    }

    closeMenus();
    hide(toolbar);
    allowToolbar = false; // prevent showing until pointerup or reading end shows it

    synth.cancel();
    byId(IDS.layer)?.replaceChildren();
    document.body.classList.add("rs-reading");
    isReading = true;
    baseRange = info.range;

    const built = buildSliceMap(baseRange);
    lastText = built.text;
    lastAnimatedTokenStart = -1;

    utter = new SpeechSynthesisUtterance(built.text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    if (pref.lang) utter.lang = pref.lang;

    const chosenVoice =
      (synth.getVoices?.() || []).find(v => v.voiceURI === pref.voiceURI) ||
      (synth.getVoices?.() || []).find(
        v => v.lang && pref.lang && v.lang.toLowerCase().startsWith(pref.lang.toLowerCase())
      );
    if (chosenVoice) utter.voice = chosenVoice;

    utter.onend = utter.onerror = () => {
      lastSlice = null;
      byId(IDS.layer)?.replaceChildren();
      document.body.classList.remove("rs-reading");
      isReading = false;
      // Show toolbar after reading done
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

    voicesCache = synth.getVoices?.() || voicesCache;
    synth.speak(utter);
  }

  /**
   * Unique values by case-insensitive string key.
   * @template T
   * @param {T[]} list
   * @returns {T[]}
   */
  function unique(list) {
    const seen = new Set();
    return list.filter(v => {
      const k = String(v || "").toLowerCase();
      if (seen.has(k) || !k) return false;
      seen.add(k);
      return true;
    });
  }

  /**
   * Play icon.
   * @returns {string}
   */
  function svgPlay() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7-11-7z"/></svg>`;
  }
  /**
   * Language icon.
   * @returns {string}
   */
  function svgLang() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 4h8a1 1 0 0 1 0 2H9.62a9.9 9.9 0 0 1-1.38 3.02A14.9 14.9 0 0 0 12 13.5a1 1 0 1 1-1.73 1A16.8 16.8 0 0 1 8 12.35 16.8 16.8 0 0 1 6.2 15H8a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h1.6A14.9 14.9 0 0 0 7.2 11a7.9 7.9 0 0 0 1.1-3H3a1 1 0 1 1 0-2Zm12.5 4h1.38L21 19h-2.1l-.7-2h-4.4l-.7 2H11l5.5-11Zm1.06 3.6L15.9 15h2.8l-.66-3.4Z"/></svg>`;
  }
  /**
   * Voice icon.
   * @returns {string}
   */
  function svgVoice() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Zm-7 9a1 1 0 1 1 2 0 5 5 0 0 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H10a1 1 0 1 1 0-2h3v-2.07A7 7 0 0 1 5 12Z"/></svg>`;
  }
})();
