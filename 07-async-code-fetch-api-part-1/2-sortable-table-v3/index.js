import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  static activeSortedCell;

  step = 20;
  start = 0;
  end = this.start + this.step;

  subElements = {};

  constructor(headersConfig, {
    data = [],
    sorted = {},
    url,
    isSortLocally = false,
  } = {}) {
    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();

    this.initListeners();
  }

  async fetchData(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    return await fetchJson(this.url);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
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
      if (cell.template) {
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
    return `<div class="sortable-table sortable-table_loading">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerTable}
      </div>
      <div data-element="body" class="sortable-table__body">
        ${this.bodyTable}
      </div>
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    </div>`;
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.update();
  }

  async update() {
    this.element.classList.add('sortable-table_loading');

    const {id, order} = this.sorted;
    const data = await this.fetchData(id, order, this.start, this.end);

    if (data) {
      this.element.classList.remove('sortable-table_loading');
    }

    this.data = data;
    this.subElements.body.innerHTML = this.bodyTable;
  }

  sort(id, order = 'asc') {
    SortableTable.activeSortedCell = this.sortedCells[id];
    Object.values(this.sortedCells).forEach(cell => {
      if (SortableTable.activeSortedCell && SortableTable.activeSortedCell !== cell) {
        cell.removeAttribute('data-order');
      }
    });
    SortableTable.activeSortedCell.dataset.order = order;

    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }

    this.subElements.body.innerHTML = this.bodyTable;
  }

  sortOnClient(id, order) {
    const direction = order === 'desc' ? -1 : 1;
    const sortType = this.headersConfig.find((item) => item.id === id).sortType || 'string';

    function sortFunction(a, b) {
      if (sortType === 'number') {
        return a - b;
      } else {
        return a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'});
      }
    }

    this.data.sort((a, b) => direction * sortFunction(a[id], b[id]));
  }

  async sortOnServer(id, order) {
    this.start = 0;
    this.end = this.start + this.step;
    this.data = await this.fetchData(id, order, this.start, this.end);
  }

  onScroll = async () => {
    const {id, order} = this.sorted;
    const {bottom} = this.element.getBoundingClientRect();

    if (!this.loading && bottom < document.documentElement.clientHeight) {
      this.start = this.end + 1;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.fetchData(id, order, this.start, this.end);

      this.data = [...this.data, ...data];

      this.loading = false;

      this.subElements.body.innerHTML = this.bodyTable;
    }
  }

  initListeners() {
    this.subElements.header.addEventListener('pointerdown', (event) => {
      const cell = event.target.closest('[data-sortable="true"]');
      if (cell) {
        const {id, order} = cell.dataset;
        this.sort(id, (order === 'asc') ? 'desc' : 'asc');
      }
    });

    document.addEventListener('scroll', this.onScroll);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    SortableTable.activeSortedCell = null;
  }
}
