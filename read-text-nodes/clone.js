class Cloner {
  /**
   * @param {HTMLElement} el
   */
  static cloneElement(el) {
    const outline = document.createElement('div');
    document.body.appendChild(outline);
    // this.updateStyles(el, outline);
    this.updatePosition(el, outline);

   // outline.appendChild(el.cloneNode(true));

    return outline;
  }

  /**
   * @param {HTMLElement} el
   * @param {HTMLElement} outline
   */
  static updatePosition(el, outline) {
    let { left, top, width, height } = el.getBoundingClientRect();
    const outlineRect = outline.getBoundingClientRect();

    left -= document.documentElement.offsetLeft;
    top -= document.documentElement.offsetTop;

    const viewport = {
      width: Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      ),
      height: Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      )
    };

    left = Math.floor(
      Math.min(Math.max(left, 0), viewport.width - outlineRect.width)
    );
    top = Math.floor(
      Math.min(Math.max(top, 0), viewport.height - outlineRect.height)
    );

    const scrollSize = this.getDocumentScroll();

    left += scrollSize.left;
    top += scrollSize.top;

    outline.style.left = left + 'px';
    outline.style.top = top + 'px';
    outline.style.width = width + 'px';
    outline.style.height = height + 'px';
    outline.style.position = 'absolute';
  }

  static getDocumentScroll() {
    return {
      left: document.documentElement.scrollLeft || document.body.scrollLeft,
      top: document.documentElement.scrollTop || document.body.scrollTop
    };
  }

  /**
   * @param {HTMLElement} el
   * @param {HTMLElement} cloned
   */
  static updateStyles(el, cloned) {
    const clonedStyles = getComputedStyle(cloned);
    const elStyles = getComputedStyle(el);

    const ignoreStyles = [
      '-webkit-text-fill-color',
      'background-color',
      'margin',
      'color',
      'background-image'
    ];

    /** @type {!Object<!string,!string>} */
    const styles = {};
    if (elStyles) {
      for (const prop of elStyles) {
        if (clonedStyles[prop] !== elStyles[prop]) {
          if (ignoreStyles.includes(prop)) {
            continue;
          }
          styles[prop] = elStyles.getPropertyValue(prop);
        }
      }
    }
    console.log(styles);
    for (const prop in styles) {
      cloned.style[prop] = styles[prop];
    }
    cloned.style.margin = '0';
  }
}

document.addEventListener('clicks', evt => {
  let el = evt.target;
  if (el instanceof Node) {
    el = el.parentElement;
  }
  if (el instanceof HTMLElement) {
    console.log(Cloner.cloneElement(el));
  }
});
