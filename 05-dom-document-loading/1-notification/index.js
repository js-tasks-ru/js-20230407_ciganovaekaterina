export default class NotificationMessage {
  //duration = 1000;

  constructor(massage, {duration = 1000, type = "success"} = {}){
    this.message = massage;
    this.duration = duration;
    this.type = type;

    this.element = this.render();
  }

  getTemplate(){
    return `<div class="notification ${this.type}" style="--value:${this.duration/1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">${this.message}</div>
      </div>
    </div>`;
  }

  render(){
    const notification = document.createElement('div');
    notification.innerHTML = this.getTemplate();
    return notification.firstElementChild;
  }

  destroy(){
    this.element.remove();
  }

  show(element){
    this.remove();
    (element || document.body).append(this.element);
    setTimeout(() => this.destroy(), this.duration);
  }

  remove(){
    const element = document.querySelector('.notification');
    if (element) {
      element.parentNode.removeChild(element);
    }
  }
}
