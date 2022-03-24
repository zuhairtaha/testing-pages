class SimpleElement extends HTMLElement {
  constructor() {
    super();

    this.root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.root.innerHTML = `
        <style>
          :host {
            display: block;
            background-color: rgba(0, 0, 255, 0.05 );
            margin: 10px;
            padding: 10px;
          }
          iframe {
          width: 800px;
          height: 400px;
        }
        </style>
        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eveniet, assumenda?</p>
        <div id="container"></div>
        <button>Append iframe</button>
  `;

    const button = this.root.querySelector('button');
    const container = this.root.querySelector('#container');
    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'iframe.html';
      container.appendChild(iframe);
    });
  }
}
customElements.define('simple-element', SimpleElement);
