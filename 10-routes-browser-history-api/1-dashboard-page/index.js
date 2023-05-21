import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  ordersUrl = 'api/dashboard/orders';
  salesUrl = 'api/dashboard/sales';
  customersUrl = 'api/dashboard/customers';
  bestsellersUrl = 'api/dashboard/bestsellers';

  getRange() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    return {from, to};
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const el of elements) {
      result[el.dataset.element] = el;
    }

    return result;
  }

  get template() {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }

  initComponents() {
    const {from, to} = this.getRange();
    const rangePicker = new RangePicker({
      from,
      to
    });
    const ordersChart = new ColumnChart({
      url: this.ordersUrl,
      range: {
        from,
        to
      },
      label: 'orders',
      link: '/sales'
    });
    const salesChart = new ColumnChart({
      url: this.salesUrl,
      range: {
        from,
        to
      },
      label: 'sales',
      formatHeading: data => `$${data}`
    });
    const customersChart = new ColumnChart({
      url: this.customersUrl,
      range: {
        from,
        to
      },
      label: 'customers',
    });
    const sortableTable = new SortableTable(header, {
      url: this.bestsellersUrl,
      sorted: {
        id: header.find(item => item.sortable).id,
        order: 'asc'
      }
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  renderComponents() {
    Object.entries(this.components).forEach(component => {
      const [key, value] = component;
      this.subElements[key].append(value.element);
    });
  }

  async updateComponents(from, to) {
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);

    const data = await this.loadBestsellers(from, to);
    this.components.sortableTable.update(data);
  }

  loadBestsellers(from, to) {
    const url = new URL(this.bestsellersUrl, BACKEND_URL);
    url.searchParams.set('_sort', 'title');
    url.searchParams.set('_order', 'asc');
    url.searchParams.set('_start', '1');
    url.searchParams.set('_end', '21');
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);

    return fetchJson(url);
  }


  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initListeners();

    return this.element;
  }

  initListeners() {
    const {rangePicker} = this.components;

    rangePicker.element.addEventListener('date-select', event => {
      const {from, to} = event.detail;
      this.updateComponents(from, to);
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
    Object.values(this.components).forEach(component => {
      component.destroy();
    });
    this.components = null;
  }
}
