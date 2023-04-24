/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const arr = path.split('.');
  return function(obj) {
    if (!Object.keys(obj).length) {
      console.error('Пустой объект');
      return;
    }

    return arr.reduce((obj, key) => {
      if (!obj || !obj.hasOwnProperty(key)) {
        console.error(`Свойство ${key} не найдено`);
        return;
      }
      return obj[key];
    }, obj);
  };
}
