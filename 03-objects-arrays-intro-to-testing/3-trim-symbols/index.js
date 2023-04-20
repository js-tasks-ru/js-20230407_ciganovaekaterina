/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let resultStr = '';
  let counter = 0;

  if (size === 0) {return resultStr;}

  if (typeof size !== 'number') {return string;}

  for (let symbol of string) {
    if (resultStr.at(-1) === symbol) {
      if (counter < size) {
        counter++;
        resultStr += symbol;
      }
    } else {
      counter = 1;
      resultStr += symbol;
    }
  }
  return resultStr;
}
