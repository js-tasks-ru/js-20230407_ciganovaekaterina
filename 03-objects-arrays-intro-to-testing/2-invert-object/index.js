/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj) {return;}

  const invertObj = {};
  for (let [key, value] of Object.entries(obj)) {
    invertObj[value] = key;
  }
  return invertObj;
}
