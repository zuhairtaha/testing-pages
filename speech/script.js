const inputForm = /** @type {!HTMLFormElement} */ (document.querySelector('form'));
const textarea = /** @type {!HTMLTextAreaElement} */ (document.querySelector('.txt'));
const voiceSelect = /** @type {!HTMLSelectElement} */ (document.querySelector('select[name=voice]'));
const languagesSelect = /** @type {!HTMLSelectElement} */ (document.querySelector('select[name=languages]'));

const rate = /** @type {!HTMLInputElement} */ (document.querySelector('input#rate'));
const rateValue = /** @type {!HTMLElement} */ (document.querySelector('.rate-value'));

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
  }
  return +1;
}

function populateVoiceList() {
  voices = window.speechSynthesis.getVoices().sort((a, b) => sortAlphabetically(a.name, b.name));
  const selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = '';

  for (const voice of voices) {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;

    if (voice.default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voice.lang);
    option.setAttribute('data-name', voice.name);
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
  }

  if (textarea.value !== '') {
    const utterance = new SpeechSynthesisUtterance(textarea.value);

    utterance.onend = function (event) {
      console.log('SpeechSynthesisUtterance.onend', event);
      textarea.setSelectionRange(0, 0);
    };

    utterance.addEventListener('error', function (event) {
      console.error('SpeechSynthesisUtterance.onerror', event);
    });

    utterance.onstart = function (event) {
      console.log('SpeechSynthesisUtterance.onstart', event);
    };

    utterance.onboundary = function (event) {
      console.log('SpeechSynthesisUtterance.onboundary', event);

      const start = event.charIndex;
      const end = event.charIndex + event.charLength;
      textarea.focus();
      textarea.setSelectionRange(start, end);
    };

    utterance.onmark = function (event) {
      console.log('SpeechSynthesisUtterance.onmark', event);
    };

    utterance.addEventListener('pause', function (event) {
      console.log('SpeechSynthesisUtterance.onpause', event);
    });

    utterance.onresume = function (event) {
      console.log('SpeechSynthesisUtterance.onresume', event);
    };

    const selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');

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

const playButton = /** @type {!HTMLButtonElement} */ (document.getElementById('play'));

const pauseButton = /** @type {!HTMLButtonElement} */ (document.getElementById('pause'));

pauseButton.addEventListener('click', () => {
  window.speechSynthesis.pause();
});

const resumeButton = /** @type {!HTMLButtonElement} */ (document.getElementById('resume'));

resumeButton.addEventListener('click', () => {
  window.speechSynthesis.resume();
});

const cancelButton = /** @type {!HTMLButtonElement} */ (document.getElementById('cancel'));

cancelButton.addEventListener('click', () => {
  window.speechSynthesis.cancel();
});

playButton.addEventListener('click', () => {
  speak();
});

rate.addEventListener('change', function () {
  rateValue.textContent = rate.value;
});

voiceSelect.addEventListener('change', function () {
  window.localStorage.setItem('voice', voiceSelect.value);
});

function showVoicesWithSelectedLang() {
  for (const option of voiceSelect.options) {
    option.hidden = !option.getAttribute('data-lang')?.startsWith(languagesSelect.value);
  }

  textarea.dir = languagesSelect.value === 'ar' || languagesSelect.value === 'fa' ? 'rtl' : 'ltr';
}

languagesSelect.addEventListener('change', function () {
  window.localStorage.setItem('lang', languagesSelect.value);
  showVoicesWithSelectedLang();
});

textarea.addEventListener('input', function () {
  window.localStorage.setItem('text', textarea.value);
});
