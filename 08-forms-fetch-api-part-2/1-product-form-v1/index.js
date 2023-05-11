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

  defaultData = {
    title: '',
    description: '',
    images: [],
    subcategory: '',
    price: 0,
    quantity: 0,
    discount: 0
  }

  subElements = {};

  constructor (productId) {
    this.productId = productId;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const el of elements) {
      result[el.dataset.element] = el;
    }

    return result;
  }

  fetchProduct() {
    this.urlProduct.searchParams.set('id', this.productId);
    return fetchJson(this.urlProduct);
  }

  fetchCategories() {
    for (const [key, value] of Object.entries(this.sortedCategories)) {
      this.urlCategories.searchParams.set(key, value);
    }
    return fetchJson(this.urlCategories);
  }

  get subcategoryTemplate() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<select id="subcategory" class="form-control" name="subcategory"></select>';
    const select = wrapper.firstElementChild;
    for (const category of this.categories) {
      for (const item of category.subcategories) {
        select.append(new Option(`${category.title} > ${item.title}`, item.id, this.product.subcategory && this.product.subcategory === item.id));
      }
    }

    return select.outerHTML;
  }

  get imageListTemplate() {
    if (!this.product.images || this.product.images.length === 0) {return '';}
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
            id="title"
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
          id="description"
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
            id="price"
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
            id="discount"
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
          id="quantity"
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
        <select id="status" class="form-control" name="status">
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
    const categoryPromise = this.fetchCategories();
    const productPromise = this.productId ?
      this.fetchProduct() :
      new Promise(resolve => resolve(this.defaultData));
    const [product, category] = await Promise.all([productPromise, categoryPromise]);

    this.product = this.productId ? product[0] : product;
    this.categories = category;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.onSubmit();

    return this.element;
  }

  onSubmit() {
    this.subElements.productForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.save();
    });
  }

  save() {
    const customEvent = this.productId ?
      new CustomEvent('product-updated', {detail: this.productId}) :
      new CustomEvent('product-saved');
    this.element.dispatchEvent(customEvent);
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
