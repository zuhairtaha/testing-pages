class OuterElement extends HTMLElement {
  constructor() {
    super();
    /** @type {!ShadowRoot} */
    this._root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    this._root.innerHTML = `
  <style>
    :host {
      display: block;
      background: rgba(255, 0, 0, 0.1);
      font-size: 24px;
      border: solid 1px rgba(0, 0, 0, 0.5);
      width: 50%;
      padding: 20px;
    }
  </style>
  <span>${this.tagName.toLocaleLowerCase()}</span>
  <slot></slot>
  `;
  }
}

customElements.define('outer-element', IframeContainer);

class InnerElement extends IframeContainer {}
customElements.define('inner-element', InnerElement);

class depperElement extends IframeContainer {}
customElements.define('deeper-element', depperElement);
