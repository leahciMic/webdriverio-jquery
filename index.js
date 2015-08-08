var webdriverio = require('webdriverio');
var remote = webdriverio.remote.bind(webdriverio);

var createAPI = function(self, element) {
  return {
    text: function() {
      return self.elementIdText(element).then(function(e) {
        return e.value;
      });
    },
    attr: function() {
      return self.elementIdAttribute(element);
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
          return fn.call(client, elem.ELEMENT);
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
    }, false);
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
