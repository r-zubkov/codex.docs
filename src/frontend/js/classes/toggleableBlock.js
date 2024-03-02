/**
 * @class CodeStyles
 * @classdesc Provides styling for code blocks
 */
export default class ToggleableBlock {
  idAttrName = 'data-id'
  statusAttrName = 'data-status'
  itemsAttrName = 'data-items'
  fkAttrName = 'data-fk'

  /**
   * @param {string} selector - CSS selector for toggle blocks
   */
  constructor({ selector }) {
    this.toggleBlockSelector = selector;

    this.selectorClass = this.toggleBlockSelector.replace('.', '');
    this.selectorItemClass = `${this.selectorClass}__item`;
    this.selectorOpenClass = `${this.selectorClass}--open`

    this.init();
  }

  init() {
    const toggleBlocks = document.querySelectorAll(this.toggleBlockSelector);

    if (!toggleBlocks.length) return;

    Array.from(toggleBlocks).forEach(block => this.initToggleBlock(block));
  }

  initToggleBlock(block) {
    const id = block.getAttribute(this.idAttrName);
    const status = block.getAttribute(this.statusAttrName);
    const items = block.getAttribute(this.itemsAttrName);

    if (!items) return;

    this.bindToggleAction(block)
    this.wrapChildItems(block.parentNode, id, items)

    this.updateToggleState(block, status)
  }

  bindToggleAction(block) {
    const icon = block.querySelector('svg');

    icon.style.cursor = "pointer";

    icon.addEventListener('click', (event) => {
      this.resolveToggleAction(event.currentTarget.parentNode);
    });
  }

  wrapChildItems(currentWrapper, id, items) {
    let currentEdtorWrapper = currentWrapper

    for (let i = 0; i < items; i++) {
      currentEdtorWrapper = currentEdtorWrapper.nextElementSibling
      currentEdtorWrapper.classList.add(this.selectorItemClass);
      currentEdtorWrapper.setAttribute(this.fkAttrName, id);
    }
  }

  resolveToggleAction(block) {
    let status = block.getAttribute(this.statusAttrName);

    if (status === 'open') {
      status = 'closed'
    } else {
      status = 'open'
    }

    this.updateToggleState(block, status)
  }

  updateToggleState(block, status) {
    const id = block.getAttribute(this.idAttrName);

    this.updateBlockState(block, status)
    this.hideAndShowBlocks(id, status)
  }

  updateBlockState(block, status) {
    if (status === 'open') {
      block.classList.add(this.selectorOpenClass);
    } else {
      block.classList.remove(this.selectorOpenClass);
    }

    block.setAttribute(this.statusAttrName, status)
  }

  hideAndShowBlocks(fk, status) {
    const children = document.querySelectorAll(`div[${this.fkAttrName}=${fk}]`);

    if (!children.length) return;

    Array.from(children).forEach(child => child.hidden = status === 'closed');
  }
}