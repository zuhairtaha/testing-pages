const App = new (class {
  /** @private */
  _contentElement = /** @type {!HTMLElement} */ (document.getElementById("content"));

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
    this._updateContent();

    window.addEventListener("popstate", () => {
      this._updateContent();
    });
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
