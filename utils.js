const notContainsObject = (obj, list) => {
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === obj) {
        return false;
      }
    }
    return true;
}

module.exports = notContainsObject

