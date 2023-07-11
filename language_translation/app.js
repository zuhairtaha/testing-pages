const UnsupportedByGoogle = {
  // https://translate.ling.helsinki.fi/ui/sami
  se: `Buresboahtin giellajorgalansiidui. Mii leat oamastan veahkehit priváhtaolbmuid ja fitnodagaid kommuniseret suokkardit giellafámuid beaktilit ja viiddidit geahččanguovlluideaset. Giella lea dehálaš áddejumi gaskaoapmi eará kultuvrrain ja geahččanguovlluin, ja leat čeavlát sáhttit ovddidit dán áddejumi. Ain eanet globaliseren máilmmis giellamuvrraid rasttildeaddji kommunikašuvdna lea deháleabbo go goassige ovdal. Leago dat fitnodat mii háliida viiddidit ođđa márkaniidda dahje`
};

const GoogleTranslateLanguage = {
  Afrikaans: "af",
  Albanian: "sq",
  Amharic: "am",
  Arabic: "ar",
  Armenian: "hy",
  Azerbaijani: "az",
  Basque: "eu",
  Belarusian: "be",
  Bengali: "bn",
  Bosnian: "bs",
  Bulgarian: "bg",
  Catalan: "ca",
  Cebuano: "ceb",
  ChineseSimplified: "zh-CN",
  ChineseTraditional: "zh-TW",
  Corsican: "co",
  Croatian: "hr",
  Czech: "cs",
  Danish: "da",
  Dutch: "nl",
  English: "en",
  Esperanto: "eo",
  Estonian: "et",
  Finnish: "fi",
  French: "fr",
  Frisian: "fy",
  Galician: "gl",
  Georgian: "ka",
  German: "de",
  Greek: "el",
  Gujarati: "gu",
  HaitianCreole: "ht",
  Hausa: "ha",
  Hawaiian: "haw",
  Hebrew: "he",
  Hindi: "hi",
  Hmong: "hmn",
  Hungarian: "hu",
  Icelandic: "is",
  Igbo: "ig",
  Indonesian: "id",
  Irish: "ga",
  Italian: "it",
  Japanese: "ja",
  Javanese: "jw",
  Kannada: "kn",
  Kazakh: "kk",
  Khmer: "km",
  Korean: "ko",
  Kurdish: "ku",
  Russian: "ru",
  Spanish: "es",
  Portuguese: "pt",
  Norwegian: "no",
  Welsh: "cy",
  Polish: "pl",
  Romanian: "ro",
  Swedish: "sv",
  Faroese: "fo",
  Chinese: "zh",
  Sami: "se",
  Turkish: "tr",
  Ukrainian: "uk",
  Tamil: "ta",
  Thai: "th",
  Farsi: "fa"
  // ...
};

const App = new (class {
  /** @private */
  _contentElement = /** @type {!HTMLElement} */ (document.getElementById("content"));

  /** @private */
  _languageElement = /** @type {!HTMLSelectElement} */ (document.getElementById("languageSelector"));

  /** @private */
  _langs = [
    { name: "Arabic", locale: "ar-EG" },
    { name: "Welsh", locale: "cy-WA" },
    { name: "Danish", locale: "da-DK" },
    { name: "German", locale: "de-DE" },
    { name: "English (Australian)", locale: "en-AU" },
    { name: "English (British)", locale: "en-GB" },
    { name: "English (US)", locale: "en-US" },
    { name: "English (Wales)", locale: "en-WA" },
    { name: "Spanish", locale: "es-ES" },
    { name: "French", locale: "fr-FR" },
    { name: "French (Canadian)", locale: "fr-CA" },
    { name: "Icelandic", locale: "is-IS" },
    { name: "Italian", locale: "it-IT" },
    { name: "Norwegian (Bokmål)", locale: "nb-NO" },
    { name: "Dutch", locale: "nl-NL" },
    { name: "Norwegian (Nynorsk)", locale: "nn-NO" },
    { name: "Polish", locale: "pl-PL" },
    { name: "Romanian", locale: "ro-RO" },
    { name: "Swedish", locale: "sv-SE" },
    { name: "English (India)", locale: "en-IN" },
    { name: "English (Scotland)", locale: "en-X0" },
    { name: "Finnish", locale: "fi-FI" },
    { name: "Finnish (Sweden)", locale: "fi-SE" },
    { name: "Faroese", locale: "fo-FO" },
    { name: "Greek", locale: "el-GR" },
    { name: "Hindi", locale: "hi-IN" },
    { name: "Dutch (Belgium)", locale: "nl-BE" },
    { name: "Japanese", locale: "ja-JP" },
    { name: "Chinese (Mandarin)", locale: "zh-CH" },
    { name: "Korean", locale: "ko-KR" },
    { name: "Portuguese (Brazil)", locale: "pt-BR" },
    { name: "Portuguese", locale: "pt-PT" },
    { name: "Russian", locale: "ru-RU" },
    { name: "Sami (Northern)", locale: "se-X0" },
    { name: "Sami (Lule)", locale: "se-X1" },
    { name: "Catalan", locale: "ca-ES" },
    { name: "Spanish (Mexico)", locale: "es-MX" },
    { name: "Spanish (USA)", locale: "es-US" },
    { name: "Czech", locale: "cs-CZ" },
    { name: "Turkish", locale: "tr-TR" },
    { name: "Ukrainian", locale: "uk-UA" },
    { name: "Tamil", locale: "ta-LK" },
    { name: "Chinese (Cantonese)", locale: "zh-HK" },
    { name: "Thai", locale: "th-TH" },
    { name: "Croatian", locale: "hr-HR" },
    { name: "Farsi", locale: "fa-IR" }
  ];

  /** @private */
  _text = `
Welcome to our language translation page. We are devoted to helping individuals and businesses communicate
effectively, break language barriers, and expand their horizons. Language is an essential tool for understanding
different cultures and perspectives, and we are proud to contribute to this understanding. In an increasingly
globalized world, communication across language barriers is more crucial than ever before. Whether it is a
business looking to expand into new markets or an individual wanting to learn about a different culture,
understanding the language is the first step towards success. With the advent of the internet, global
communication has become faster and easier. However, language differences still pose a significant challenge.
Automatic translation tools have made impressive strides in recent years, thanks to advances in artificial
intelligence and machine learning, but they are still not perfect. That's where we come in. Our team of skilled
linguists, along with state-of-the-art technology, provide accurate and reliable translation services in several
languages. From Arabic to Welsh, Danish to German, and Spanish to French, we have got you covered. We understand
the nuances and intricacies of these languages, ensuring that the essence of the original message is not lost in
translation. We are more than just a translation service. We strive to foster understanding, respect, and
cooperation among people from different linguistic backgrounds. We believe that through our work, we can
contribute to a more inclusive and tolerant world. Our commitment to quality and our passion for languages sets us
apart. We continuously update our knowledge and improve our services to provide the best possible translations to
our clients. Customer satisfaction is our top priority, and we work tirelessly to ensure that our translations
meet the highest standards. Over the years, we have had the privilege of working with various clients, each with
unique needs and requirements. We have provided translations for businesses, government agencies, non-profit
organizations, and individuals. Each project has been a learning experience, and each success has been a testament
to our dedication and expertise. We invite you to explore our website and learn more about our services. If you
have any questions or need a translation, please don't hesitate to contact us. We are here to help you navigate
the world of languages and ensure that your message is heard loud and clear, no matter the language. Thank you for
visiting our language translation page. We look forward to providing you with the best translation services and
helping you break down language barriers. Together, we can make the world a smaller place, one translation at a
time.
`;

  constructor() {
    this._initLanguageSelector();

    this._updateContent();

    window.addEventListener("popstate", () => {
      this._updateContent();
    });

    this._languageElement.addEventListener("change", evt => {
      const newLocale = /** @type {!HTMLSelectElement} */ (evt.target).value;
      window.history.pushState({}, "", `?language=${newLocale}`);

      this._updateContent();
    });
  }

  /** @private */
  _initLanguageSelector() {
    const language = this._getLanguage();

    for (const lang of this._langs) {
      const option = new Option(lang.name, lang.locale);
      this._languageElement.append(option);

      if (lang.locale === language) {
        option.selected = true;
      }
    }
  }

  /**
   * @private
   * @returns {string}
   */
  _getLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const language = urlParams.get("language");
    if (!language) {
      throw new Error("No language specified");
    }
    return language;
  }

  /**
   * @private
   * @param {string} targetLanguage - The language locale to translate to.
   * @returns {Promise<string>}
   */
  async _translate(targetLanguage) {
    targetLanguage = targetLanguage.slice(0, 2);

    if (["nb", "nn"].includes(targetLanguage)) {
      targetLanguage = "no";
    }

    if (UnsupportedByGoogle[targetLanguage]) {
      return Array.from({ length: 5 }).fill(UnsupportedByGoogle[targetLanguage]).join(" ");
    }

    if (!Object.values(GoogleTranslateLanguage).includes(targetLanguage)) {
      throw new Error(`Invalid target language: ${targetLanguage}`);
    }

    const encodedText = window.encodeURIComponent(this._text);
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodedText}`
    );
    const dataJson = await response.json();
    return dataJson[0].map(x => x[0]).join("");
  }

  /** @private */
  _updateContent() {
    const language = this._getLanguage();
    if (language === "en") {
      this._contentElement.textContent = this._text;
      return;
    }

    this._translate(language).then(translation => {
      this._contentElement.textContent = translation;
    });
  }
})();
