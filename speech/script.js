const inputForm = /** @type {!HTMLFormElement} */ (
  document.querySelector('form')
);
const textarea = /** @type {!HTMLTextAreaElement} */ (
  document.querySelector('.txt')
);
const voiceSelect = /** @type {!HTMLSelectElement} */ (
  document.querySelector('select[name=voice]')
);
const languagesSelect = /** @type {!HTMLSelectElement} */ (
  document.querySelector('select[name=languages]')
);

const rate = /** @type {!HTMLInputElement} */ (
  document.querySelector('input#rate')
);
const rateValue = /** @type {!HTMLElement} */ (
  document.querySelector('.rate-value')
);

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
  } else if (aName == bName) {
    return 0;
  } else {
    return +1;
  }
}

function populateVoiceList() {
  voices = window.speechSynthesis
    .getVoices()
    .sort((a, b) => sortAlphabetically(a.name, b.name));
  const selectedIndex =
    voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = '';

  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement('option');
    option.textContent = `${voices[i].name} (${voices[i].lang})`;

    if (voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
  showVoicesWithSelectedLang();

  const languages = new Set(
    voices.map(voice => voice.lang.slice(0, 2)).sort(sortAlphabetically)
  );
  for (const lang of languages) {
    const option = new Option(lang, lang);
    languagesSelect.add(option);
  }
}

populateVoiceList();

window.requestAnimationFrame(() => {
  const voice = window.localStorage.getItem('voice');
  if (voice) {
    voiceSelect.value = voice;
  }
  const text = window.localStorage.getItem('text');
  if (text) {
    textarea.value = text;
  }
  const lang = window.localStorage.getItem('lang');
  if (lang) {
    languagesSelect.value = lang;
    showVoicesWithSelectedLang();
  }
});

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => populateVoiceList();
}

function speak() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    // console.error('speechSynthesis.speaking');
    // return;
  }

  if (textarea.value !== '') {
    const utterThis = new SpeechSynthesisUtterance(textarea.value);

    utterThis.onend = function (event) {
      console.log('SpeechSynthesisUtterance.onend', event);
      textarea.setSelectionRange(0, 0);
    };

    utterThis.onerror = function (event) {
      console.error('SpeechSynthesisUtterance.onerror', event);
    };

    utterThis.onstart = function (event) {
      console.log('SpeechSynthesisUtterance.onstart', event);
    };

    utterThis.onboundary = function (event) {
      console.log('SpeechSynthesisUtterance.onboundary', event);

      const start = event.charIndex;
      const end = event.charIndex + event.charLength;
      textarea.focus();
      textarea.setSelectionRange(start, end);
    };

    utterThis.onmark = function (event) {
      console.log('SpeechSynthesisUtterance.onmark', event);
    };

    utterThis.onpause = function (event) {
      console.log('SpeechSynthesisUtterance.onpause', event);
    };

    utterThis.onresume = function (event) {
      console.log('SpeechSynthesisUtterance.onresume', event);
    };

    const selectedOption =
      voiceSelect.selectedOptions[0].getAttribute('data-name');

    for (let i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
        break;
      }
    }
    utterThis.rate = parseInt(rate.value);
    window.speechSynthesis.speak(utterThis);
  }
}

const playButton = /** @type {!HTMLButtonElement} */ (
  document.getElementById('play')
);

const pauseButton = /** @type {!HTMLButtonElement} */ (
  document.getElementById('pause')
);

pauseButton.onclick = () => {
  window.speechSynthesis.pause();
};

const resumeButton = /** @type {!HTMLButtonElement} */ (
  document.getElementById('resume')
);

resumeButton.onclick = () => {
  window.speechSynthesis.resume();
};

const cancelButton = /** @type {!HTMLButtonElement} */ (
  document.getElementById('cancel')
);

cancelButton.onclick = () => {
  window.speechSynthesis.cancel();
};

playButton.onclick = () => {
  speak();
};

rate.onchange = function () {
  rateValue.textContent = rate.value;
};

voiceSelect.onchange = function () {
  window.localStorage.setItem('voice', voiceSelect.value);
};

function showVoicesWithSelectedLang() {
  for (const option of voiceSelect.options) {
    if (option.getAttribute('data-lang')?.startsWith(languagesSelect.value)) {
      option.hidden = false;
    } else {
      option.hidden = true;
    }
  }

  if (languagesSelect.value === 'ar' || languagesSelect.value === 'fa') {
    textarea.dir = 'rtl';
  } else {
    textarea.dir = 'ltr';
  }
}

languagesSelect.onchange = function () {
  window.localStorage.setItem('lang', languagesSelect.value);
  showVoicesWithSelectedLang();
};

textarea.oninput = function () {
  window.localStorage.setItem('text', textarea.value);
};
