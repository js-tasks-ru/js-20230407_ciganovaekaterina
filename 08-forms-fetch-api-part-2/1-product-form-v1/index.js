import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  categories = [];
  urlCategories = new URL('api/rest/categories', BACKEND_URL);
  sortedCategories = {
    _sort: 'weight',
    _refs: 'subcategory'
  }

  product = {};
  urlProduct = new URL('api/rest/products', BACKEND_URL);

  constructor (productId) {
    this.productId = productId;
  }

  async fetchProduct() {
    this.urlProduct.searchParams.set('id', this.productId);
    const data = await fetchJson(this.urlProduct);
    return data[0];
  }

  async fetchCategories() {
    for (const [key, value] of Object.entries(this.sortedCategories)) {
      this.urlCategories.searchParams.set(key, value);
    }
    return await fetchJson(this.urlCategories);
  }

  getSubcategories(categories) {
    return categories.map((item) => {
      return item.subcategories.map((subcategory) => {
        return {
          title: `${item.title} &gt; ${subcategory.title}`,
          value: subcategory.id
        };
      });
    }).flat();
  }

  get subcategoryTemplate() {
    const subcategories = this.getSubcategories(this.categories);
    const options = subcategories.map((subcategory) => {
      return `<option
                value=${subcategory.value}
                ${this.product.subcategory && this.product.subcategory === subcategory.value ? 'selected' : ''}
              >${subcategory.title}</option>`;
    }).join('');

    return `<select class="form-control" name="subcategory">${options}</select>`;
  }

  get imageListTemplate() {
    if (!this.product.images || this.product.images.length === 0) {return;}

    return `<div data-element="imageListContainer">
          <ul class="sortable-list">
            ${this.product.images.map((image) => {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
              <input type="hidden" name="url" value=${image.url}>
              <input type="hidden" name="source" value=${image.source}>
              <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src=${image.url}>
                <span>${image.source}</span>
              </span>
              <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button>
            </li>`;
  }).join('')}
          </ul>
        </div>`;
  }

  get template() {
    return `
  <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input
            required=""
            type="text"
            name="title"
            class="form-control"
            placeholder="Название товара"
            value='${this.product.title ? this.product.title : ''}'
          >
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea
          required=""
          class="form-control"
          name="description"
          data-element="productDescription"
          placeholder="Описание товара">${this.product.description ? this.product.description : ''}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        ${this.imageListTemplate}
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        ${this.subcategoryTemplate}
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input
            required=""
            type="number"
            name="price"
            class="form-control"
            placeholder="100"
            value=${this.product.price ? this.product.price : ''}
          >
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input
            required=""
            type="number"
            name="discount"
            class="form-control"
            placeholder="0"
            value=${this.product.discount ? this.product.discount : ''}
          >
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input
          required=""
          type="number"
          class="form-control"
          name="quantity"
          placeholder="1"
          value=${this.product.quantity ? this.product.quantity : ''}
        >
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1" ${this.product.status && this.product.status === 1 ? 'selected' : ''}>Активен</option>
          <option value="0" ${this.product.status && this.product.status === 0 ? 'selected' : ''}>Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>`;
  }

  async render () {
    this.categories = await this.fetchCategories();
    if (this.productId) {
      this.product = await this.fetchProduct();
    }
    console.log('product', this.product);

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
}
