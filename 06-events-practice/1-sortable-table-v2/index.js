export default class SortableTable {
  static activeSortedCell;

  constructor(headersConfig = [], {
    data = [],
    sorted = {}
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = true;
    this.element = this.render();

    this.initListeners();
    this.sort(this.sorted.id, this.sorted.order);
  }

  get subElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const el of elements) {
      result[el.dataset.element] = el;
    }

    return result;
  }

  get sortedCells() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-sortable="true"]');
    for (const el of elements) {
      result[el.dataset.id] = el;
    }

    return result;
  }

  get headerTable() {
    return this.headersConfig.map((cell) => {
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
    return this.headersConfig.map((cell) => {
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
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient(field, order) {
    SortableTable.activeSortedCell = this.sortedCells[field];
    Object.values(this.sortedCells).forEach(cell => {
      if (SortableTable.activeSortedCell && SortableTable.activeSortedCell !== cell) {
        cell.removeAttribute('data-order');
      }
    });
    SortableTable.activeSortedCell.dataset.order = order;

    const direction = order === 'desc' ? -1 : 1;
    const sortType = this.headersConfig.find((item) => item.id === field).sortType || 'string';

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

  sortOnServer() {

  }

  initListeners() {
    Object.values(this.sortedCells).forEach(cell => {
      cell.addEventListener('click', () => {
        const id = cell.dataset.id;
        const order = cell.dataset.order || 'asc';

        this.sort(id, (order === 'asc') ? 'desc' : 'asc');
      });
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    SortableTable.activeSortedCell = null;
  }
}
