var webdriverio = require('webdriverio');
var remote = webdriverio.remote.bind(webdriverio);
var isObject = require('lodash.isobject');
var bluebird = require('bluebird');

var blank = function(v) {
  return v !== '';
};

var createAPI = function(self, element) {
  return {
    text: function() {
      return self.elementIdText(element).then(function(e) {
        if (e.value.filter) {
          return e.value.filter(blank);
        }
        return e.value;
      });
    },
    attr: function(attrName) {
      return self.elementIdAttribute(element, attrName).then(function(e) {
        if (e.value.filter) {
          return e.value.filter(blank);
        }
        return e.value;
      });
    },
    find: function() {
      return self.elementIdElements(element);
    }
  };
};

var oneOrMany = function(client, fn, extractValue) {
  if (typeof extractValue === 'undefined') {
    extractValue = true;
  }

  return client.lastPromise.then(function(wElem) {
    if (wElem.value instanceof Array) {
      return client.unify(
        wElem.value.map(function(elem) {
          var value = fn.call(client, elem.ELEMENT);
          if (!value.then && isObject(value)) {
            return bluebird.props(value);
          }
          return value;
        }),
        {
          extractValue: extractValue
        }
      );
    } else {
      return fn(wElem.value.ELEMENT);
    }
  });
};

module.exports = function(config) {
  var client = webdriverio.remote(config)
    .init();

  client.addCommand('text', function() {
    return oneOrMany(this, function(element) {
      return this.elementIdText(element);
    }).then(function(v) {
      if (v.filter) {
        return v.filter(blank);
      }
      return v;
    });
  });

  client.addCommand('attr', function(customVar) {
    return oneOrMany(this, function(element) {
      return this.elementIdAttribute(element, customVar);
    });
  });

  client.addCommand('find', function(customVar) {
    return this.elements(customVar);
  });

  client.addCommand('map', function(iteratorFn) {
    var self = this;
    return oneOrMany(this, function(element) {
      return iteratorFn(createAPI(self, element));
    }, false).then(function(values) {
      if (values.filter) {
        return values.filter(blank);
      }
      return values;
    });
  }, false, true);

  client.addCommand('each', function(iteratorFn) {
    var self = this;
    return oneOrMany(this, function(element) {
      return iteratorFn(createAPI(self, element));
    }, false).then(function() {
      return;
    });
  }, false, true);

  return client;
};
