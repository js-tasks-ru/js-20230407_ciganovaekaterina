import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;

  constructor({
    url,
    range = {
      from: new Date(),
      to: new Date()
    },
    label,
    link,
    formatHeading = data => data
  }) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.data = [];

    this.render();
    this.fetchData();
  }

  fetchData() {
    const url = `${BACKEND_URL}/${this.url}?from=${this.range.from}&to=${this.range.to}`;
    fetchJson(url).then(data => {
      this.updateTemplate(Object.values(data));
    });
  }

  get subElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const el of elements) {
      result[el.dataset.element] = el;
    }

    return result;
  }

  getColumnsChart() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map((item) => {
      const percent = (item / maxValue * 100).toFixed(0) + '%';
      const value = String(Math.floor(item * scale));

      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }).join('');
  }

  get template() {
    return `<div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.link ? '<a href=${this.link} class="column-chart__link">View all</a>' : ''}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
          ${this.getColumnsChart()}
        </div>
      </div>
    </div>`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
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

  updateTemplate(data = []) {
    this.element.classList.toggle("column-chart_loading", data.length === 0);
    this.data = data;
    this.subElements.header.innerHTML = this.formatHeading(data.reduce((sum, val) => sum + val), 0);
    this.subElements.body.innerHTML = this.getColumnsChart();
  }

  update(from, to) {
    this.range.from = from;
    this.range.to = to;
    this.fetchData();
  }
}
