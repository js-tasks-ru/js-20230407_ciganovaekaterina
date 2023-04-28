export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.element = this.render();
  }

  get rowTable() {

  }

  get headerTable() {
    return this.headerConfig.map((col) => {
      return `<div
                  class="sortable-table__cell"
                  data-id=${col.id}
                  data-sortable=${col.sortable}
                  data-order="asc"
          >
          <span>${col.title}</span>
          ${col.sortable ?
    `<span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>` :
    ""}
        </div>`;
    }).join('');
  }

  get template() {
    console.log('headerConfig', this.headerConfig);
    return `<div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerTable}
      </div>
    </div>`;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    return wrapper.firstElementChild;
  }
}

