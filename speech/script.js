const inputForm = /** @type {!HTMLFormElement} */ (document.querySelector("form"));
const textarea = /** @type {!HTMLTextAreaElement} */ (document.querySelector(".txt"));
const voiceSelect = /** @type {!HTMLSelectElement} */ (document.querySelector("select[name=voice]"));
const languagesSelect = /** @type {!HTMLSelectElement} */ (document.querySelector("select[name=languages]"));

const rate = /** @type {!HTMLInputElement} */ (document.querySelector("input#rate"));
const rateValue = /** @type {!HTMLElement} */ (document.querySelector(".rate-value"));

const statusSpan = /** @type {!HTMLSpanElement} */ (document.querySelector(".status"));

const repeatCheckbox = /** @type {HTMLInputElement} */ (document.getElementById("repeat"));

const playButton = /** @type {!HTMLButtonElement} */ (document.getElementById("play"));
const pauseButton = /** @type {!HTMLButtonElement} */ (document.getElementById("pause"));
const resumeButton = /** @type {!HTMLButtonElement} */ (document.getElementById("resume"));
const cancelButton = /** @type {!HTMLButtonElement} */ (document.getElementById("cancel"));

let repeat = false;
let stopping = false;

let voices = [];

/**
 * @param { string } a
 * @param { string } b
 */
function sortAlphabetically(a, b) {
  const aName = a.toUpperCase();
  const bName = b.toUpperCase();

  if (aName < bName) {
    return -1;
  } else if (aName === bName) {
    return 0;
  }
  return +1;
}

function populateVoiceList() {
  voices = window.speechSynthesis.getVoices().sort((a, b) => sortAlphabetically(a.name, b.name));
  const selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = "";

  for (const voice of voices) {
    const option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;

    if (voice.default) {
      option.textContent += " -- DEFAULT";
    }

    option.setAttribute("data-lang", voice.lang);
    option.setAttribute("data-name", voice.name);
    voiceSelect.append(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
  showVoicesWithSelectedLang();

  const languages = new Set(voices.map(voice => voice.lang.slice(0, 2)).sort(sortAlphabetically));
  for (const lang of languages) {
    const option = new Option(lang, lang);
    languagesSelect.add(option);
  }
}

populateVoiceList();

window.requestAnimationFrame(() => {
  const voice = window.localStorage.getItem("voice");
  if (voice) {
    voiceSelect.value = voice;
  }
  const text = window.localStorage.getItem("text");
  if (text) {
    textarea.value = text;
  }
  const lang = window.localStorage.getItem("lang");
  if (lang) {
    languagesSelect.value = lang;
    showVoicesWithSelectedLang();
  }
});

speechSynthesis.addEventListener("voiceschanged", () => {
  populateVoiceList();
});

function stop() {
  window.speechSynthesis.cancel();
}

function readText() {
  if (window.speechSynthesis.speaking) {
    stop();
  }

  if (textarea.value !== "") {
    const utterance = new SpeechSynthesisUtterance(textarea.value);

    utterance.addEventListener("end", evt => {
      console.log("SpeechSynthesisUtterance.onend", evt);
      statusSpan.textContent = "End";
      textarea.setSelectionRange(0, 0);
      if (repeat && !stopping) {
        readText();
      }
    });

    utterance.addEventListener("error", evt => {
      console.error("SpeechSynthesisUtterance.onerror", evt);
      statusSpan.textContent = "Error";
    });

    utterance.addEventListener("start", evt => {
      console.log("SpeechSynthesisUtterance.onstart", evt);
      statusSpan.textContent = "Start";
    });

    utterance.addEventListener("boundary", evt => {
      console.log("SpeechSynthesisUtterance.onboundary", evt);
      statusSpan.textContent = "Boundary";

      const start = evt.charIndex;
      const end = evt.charIndex + evt.charLength;
      textarea.focus();
      textarea.setSelectionRange(start, end);
    });

    utterance.addEventListener("mark", evt => {
      console.log("SpeechSynthesisUtterance.onmark", evt);
      statusSpan.textContent = "Mark";
    });

    utterance.addEventListener("pause", evt => {
      console.log("SpeechSynthesisUtterance.onpause", evt);
      statusSpan.textContent = "Pause";
    });

    utterance.addEventListener("resume", evt => {
      console.log("SpeechSynthesisUtterance.onresume", evt);
      statusSpan.textContent = "Resume";
    });

    const selectedOption = voiceSelect.selectedOptions[0].getAttribute("data-name");

    for (const voice of voices) {
      if (voice.name === selectedOption) {
        utterance.voice = voice;
        break;
      }
    }
    utterance.rate = Number.parseInt(rate.value);
    window.speechSynthesis.speak(utterance);
  }
}

pauseButton.addEventListener("click", () => {
  stopping = false;
  statusSpan.textContent = "Pausing...";
  window.speechSynthesis.pause();
});

resumeButton.addEventListener("click", () => {
  stopping = false;
  statusSpan.textContent = "Resuming...";
  window.speechSynthesis.resume();
});

cancelButton.addEventListener("click", () => {
  stopping = true;
  statusSpan.textContent = "Stopping...";
  stop();
});

playButton.addEventListener("click", () => {
  stopping = false;
  statusSpan.textContent = "Starting...";
  readText();
});

rate.addEventListener("change", () => {
  rateValue.textContent = rate.value;
});

voiceSelect.addEventListener("change", () => {
  window.localStorage.setItem("voice", voiceSelect.value);
});

function showVoicesWithSelectedLang() {
  for (const option of voiceSelect.options) {
    option.hidden = !option.getAttribute("data-lang")?.startsWith(languagesSelect.value);
  }

  textarea.dir = languagesSelect.value === "ar" || languagesSelect.value === "fa" ? "rtl" : "ltr";
}

languagesSelect.addEventListener("change", () => {
  window.localStorage.setItem("lang", languagesSelect.value);
  showVoicesWithSelectedLang();
});

textarea.addEventListener("input", () => {
  window.localStorage.setItem("text", textarea.value);
});

textarea.addEventListener("mousedown", () => {
  stop();
});

textarea.addEventListener("keydown", evt => {
  stop();
});

textarea.addEventListener("mousedown", evt => {
  cancelButton.click();
});

repeatCheckbox.addEventListener("change", () => {
  repeat = repeatCheckbox.checked;
});
