export default class ColumnChart {
  constructor({data = [], label, value, link, formatHeading = value => value} = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;
    this.chartHeight = 50;

    this.render();
  }


  getColumnsChart() {
    const maxValue = Math.max(...this.data);
    const scale = 50 / maxValue;

    return this.data.map((item) => {
      const percent = (item / maxValue * 100).toFixed(0) + '%';
      const value = String(Math.floor(item * scale));

      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }).join('');
  }

  getTemplate() {
    return `<div class="column-chart ${this.data.length === 0 ? 'column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight}">
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
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }

  update(data = []) {
    this.data = data;
    this.element.classList.toggle('column-chart_loading', data.length === 0);
    this.element.querySelector('.column-chart__chart').innerHTML = this.getColumnsChart();
  }
}
