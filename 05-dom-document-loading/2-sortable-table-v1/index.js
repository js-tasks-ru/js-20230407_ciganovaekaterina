export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.element = this.render();
  }

  get subElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const el of elements) {
      result[el.dataset.element] = el;
    }

    return result;
  }

  get headerTable() {
    return this.headerConfig.map((cell) => {
      return `<div
                  class="sortable-table__cell"
                  data-id=${cell.id}
                  data-sortable=${cell.sortable}
          >
          <span>${cell.title}</span>
          ${cell.sortable ?
    `<span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>` :
    ""}
        </div>`;
    }).join('');
  }

  getCells(item) {
    return this.headerConfig.map((cell) => {
      if (cell.id === 'images') {
        return cell.template(item[cell.id]);
      }
      return `<div class="sortable-table__cell">${item[cell.id]}</div>`;
    }).join('');
  }

  get bodyTable() {
    return this.data.map((item) => {
      return `<a href="/products/${item.id}" class="sortable-table__row">
          ${this.getCells(item)}
        </a>`;
    }).join('');
  }

  get template() {
    return `<div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerTable}
      </div>
      <div data-element="body" class="sortable-table__body">
        ${this.bodyTable}
      </div>
    </div>`;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    return wrapper.firstElementChild;
  }

  sort(field, order = 'asc') {
    const direction = order === 'desc' ? -1 : 1;
    const sortType = this.headerConfig.find((item) => item.id === field).sortType || 'string';

    function sortFunction(a, b) {
      if (sortType === 'number') {
        return a - b;
      } else {
        return a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'});
      }
    }

    this.data.sort((a, b) => direction * sortFunction(a[field], b[field]));
    this.subElements.body.innerHTML = this.bodyTable;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

