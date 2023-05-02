export default class NotificationMessage {
  static activeNotification;

  constructor(massage, {duration = 1000, type = "success"} = {}) {
    this.message = massage;
    this.duration = duration;
    this.type = type;

    this.element = this.render();
  }

  getTemplate() {
    return `<div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">${this.message}</div>
      </div>
    </div>`;
  }

  render() {
    const notification = document.createElement('div');
    notification.innerHTML = this.getTemplate();
    return notification.firstElementChild;
  }

  show(element = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    (element).append(this.element);
    setTimeout(() => this.remove(), this.duration);

    NotificationMessage.activeNotification = this;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeNotification = null;
  }
}
