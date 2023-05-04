class Tooltip {
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  onPointerOver = (event) => {
    const elem = event.target.closest('[data-tooltip]');
    if (elem) {
      this.render(elem.dataset.tooltip);
      document.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerOut = () => {
    this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  onPointerMove = (event) => {
    const {clientX, clientY} = event;
    const offset = 10;
    this.element.style.left = clientX + offset + 'px';
    this.element.style.top = clientY + offset + 'px';
  }

  render(tooltip) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${tooltip}</div>`;
    this.element = wrapper.firstElementChild;

    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
    document.removeEventListener('pointermove', this.onPointerMove);
  }
}

export default Tooltip;
