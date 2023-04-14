/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let arrSorted = [...arr].sort((a,b) => a.localeCompare(b, 'all', {caseFirst: 'upper'}));
  if (param === 'desc') {
    arrSorted.reverse();
  }
  return arrSorted;
}
