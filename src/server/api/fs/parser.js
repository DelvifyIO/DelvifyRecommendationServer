class Parser {
  constructor(object) {
    this.object = object;
    this.product = {};
    this.parseObject(object);
  }
  parseObject(object) {
    Object.keys(object).forEach((key) => {
      if (!object[key] || typeof object[key] !== 'object') {
        this.product[key] = object[key];
      } else {
        if (Array.isArray(object[key]) && object[key].length > 0) {
          this.parseObject({[`${key}_0`]: object[key][0]});
        } else if (object[key]) {
          Object.keys(object[key]).forEach((objKey) => {
            this.parseObject({ [`${key}_${objKey}`]: object[key][objKey] });
          })
        }
      }
    });
  }
};


module.exports = (object) => { return new Parser(object); };
