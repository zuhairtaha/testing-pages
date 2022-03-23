class OuterElement extends HTMLElement {
  constructor() {
    super();
    /**
     * @protected
     * @type {!ShadowRoot}
     */
    this._root = this.attachShadow({ mode: 'open' });
  }

  getStyle() {
    const style = `
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
    `;
    return style;
  }

  connectedCallback() {
    this._render();
  }

  /** @protected */
  _render() {
    this._root.innerHTML = `
  ${this.getStyle()}
  <span>${this.tagName.toLocaleLowerCase()}</span>
  <slot></slot>
  `;
  }
}

customElements.define('outer-element', OuterElement);

class InnerElement extends OuterElement {}
customElements.define('inner-element', InnerElement);

class depperElement extends OuterElement {
  connectedCallback() {
    this._render();
    this._addListeners();
  }

  _addListeners() {
    const button = this._root.querySelector('button');
    const div = this._root.querySelector('#dd');
    if (!button || !div) {
      return;
    }

    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = './inner-element.html';
      [...div.children].forEach(el => el.remove());
      div.appendChild(iframe);
    });
  }

  _render() {
    this._root.innerHTML = `
  ${this.getStyle()}
  <span>${this.tagName.toLocaleLowerCase()}</span>
  <button>Add iframe</button>
  <div id="dd"></div>
  <slot></slot>
  `;
  }
}
customElements.define('deeper-element', depperElement);
