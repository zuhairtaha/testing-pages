class MyElement extends HTMLElement {
  constructor() {
    super();
    // this.shadowRoot is not accessable out of constructor is `mode: 'closed'`
    // That's why we assign it to a private property `this._root`
    /** @type {!ShadowRoot} */
    this._root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    this._addListeners();
  }

  get blank() {
    return this.hasAttribute('blank');
  }

  get css() {
    return `<style>
    :host {
      display: block;
      outline: 1px solid red;
      margin-top: 10px;
    }

    h1 {
      color: red
    }

    slot[name='user-name'] {
      color: black
    }
  </style>`;
  }

  get html() {
    return `<h1>
    <span>Hello</span>
    <slot name='user-name'></slot>
    <children></children>
    <!-- Children will goes in unnamed slot -->
    <slot></slot>
  </h1>`;
  }

  _render() {
    this._root.innerHTML = `${this.css}${
      this.blank ? `<slot></slot>` : this.html
    }`;
  }

  _addListeners() {
    const h1 = this._root.querySelector('h1');
    h1?.addEventListener('click', this._handleH1Click);
  }

  _handleH1Click(evt) {
    console.log(evt.currentTarget);
  }
}

customElements.define('my-element', MyElement);
