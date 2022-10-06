const synth = window.speechSynthesis;

const inputForm = /** @type {!HTMLFormElement} */ (
  document.querySelector('form')
);
const inputTxt = /** @type {!HTMLInputElement} */ (
  document.querySelector('.txt')
);
const voiceSelect = /** @type {!HTMLSelectElement} */ (
  document.querySelector('select[name=voice]')
);
const languagesSelect = /** @type {!HTMLSelectElement} */ (
  document.querySelector('select[name=languages]')
);
const pitch = /** @type {!HTMLInputElement} */ (
  document.querySelector('input#pitch')
);
const pitchValue = /** @type {!HTMLElement} */ (
  document.querySelector('.pitch-value')
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
  voices = synth.getVoices().sort((a, b) => sortAlphabetically(a.name, b.name));
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
    inputTxt.value = text;
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
  if (synth.speaking) {
    synth.cancel();
    // console.error('speechSynthesis.speaking');
    // return;
  }

  if (inputTxt.value !== '') {
    const utterThis = new SpeechSynthesisUtterance(inputTxt.value);

    utterThis.onend = function (event) {
      console.log('SpeechSynthesisUtterance.onend');
    };

    utterThis.onerror = function (event) {
      console.error('SpeechSynthesisUtterance.onerror');
    };

    const selectedOption =
      voiceSelect.selectedOptions[0].getAttribute('data-name');

    for (let i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
        break;
      }
    }
    utterThis.pitch = parseInt(pitch.value);
    utterThis.rate = parseInt(rate.value);
    synth.speak(utterThis);
  }
}

inputForm.onsubmit = function (event) {
  event.preventDefault();

  speak();

  inputTxt.blur();
};

pitch.onchange = function () {
  pitchValue.textContent = pitch.value;
};

rate.onchange = function () {
  rateValue.textContent = rate.value;
};

voiceSelect.onchange = function () {
  window.localStorage.setItem('voice', voiceSelect.value);
  speak();
};

function showVoicesWithSelectedLang() {
  for (const option of voiceSelect.options) {
    if (option.getAttribute('data-lang')?.startsWith(languagesSelect.value)) {
      option.hidden = false;
    } else {
      option.hidden = true;
    }
  }
}

languagesSelect.onchange = function () {
  window.localStorage.setItem('lang', languagesSelect.value);
  showVoicesWithSelectedLang();
};

inputTxt.oninput = function () {
  window.localStorage.setItem('text', inputTxt.value);
};
