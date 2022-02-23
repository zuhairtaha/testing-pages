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

  _render() {
    this._root.innerHTML = `
  <style>
    :host {
      display: block;
      border: solid 1px red;
    }

    h1 {
      color: red
    }

    slot[name='user-name'] {
      color: black
    }
  </style>

  <h1>
    <span>Hello</span>
    <slot name='user-name'></slot>
    <children></children>
    <!-- Children will goes in unnamed slot -->
    <slot></slot>
  </h1>
`;
  }

  _addListeners() {
    const h1 = this._root.querySelector('h1');
    h1.addEventListener('click', this._handleH1Click);
  }

  _handleH1Click(evt) {
    console.log(evt.currentTarget);
  }
}

customElements.define('my-element', MyElement);
