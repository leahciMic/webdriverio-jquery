var $ = require('../index.js');
var path = require('path');
var bluebird = require('bluebird');

var options = {
  desiredCapabilities: {
    browserName: 'firefox'
  }
};

describe('webdriverio-jquery', function() {
  var client;

  beforeEach(function() {
    client = $(options)
      .url('file://' + path.normalize(__dirname + '/fixture.html'));
  });

  afterEach(function(done) {
    client.end().then(done);
  });

  it('first should work', function(done) {
    var d = client.find('li').first().text();
    d.then(function(text) {
      expect(text).toEqual('List items');
      done();
    });
  });

  describe('find > find', function() {
    it('should work', function(done) {
      client.find('ul').find('li').find('a').href().then(function(hrefs) {
        expect(hrefs).toEqual([
          'http://foo.bar/',
          'http://bar.foo/'
        ]);
        done();
      });
    });
  });

  describe('attr', function() {
    it('should work with multiple elements', function(done) {
      client.find('li a').href().then(function(hrefs) {
        expect(hrefs).toEqual([
          'http://foo.bar/',
          'http://bar.foo/'
        ]);
        done();
      });
    });
  });

  describe('text', function() {
    it('should be able to get multiple text', function(done) {
      client.find('li').text().then(function(text) {
        expect(text).toEqual(['List items', 'Inputs']);
        done();
      });
    });

    it('should be able to get text', function(done) {
      client.find('h1').text().then(function(text) {
        expect(text).toEqual('Test document');
        done();
      });
    });
  });

  describe('attr', function() {
    it('should be able to get multiple attribute', function(done) {
      client.find('li').attr('foo').then(function(attr) {
        expect(attr).toEqual(['bar', 'foobar']);
        done();
      });
    });

    it('should be able to get multiple attribute', function(done) {
      client.find('input').attr('type').then(function(attr) {
        expect(attr).toEqual('text');
        done();
      });
    });
  });

  describe('each', function() {
    it('should be able to iterate over elements', function(done) {
      var texts = [];
      client.find('li').each(function(element) {
        return element.text().then(function(text) {
          texts.push(text);
        });
      }).then(function(value) {
        expect(value).toBe(undefined);
        expect(texts.sort()).toEqual(['Inputs', 'List items']);
        done();
      });
    });
  });

  describe('map', function() {
    it('should be able to map over elements', function(done) {
      var texts = [];
      client.find('li').map(function(element) {
        return element.text();
      }).then(function(value) {
        expect(value).toEqual(['List items', 'Inputs']);
        done();
      });
    });

    it('should be able to map over elements', function(done) {
      var texts = [];
      client.find('li').map(function(element) {
        return {
          text: element.text(),
          fooAttr: element.attr('foo')
        };
      }).then(function(value) {
        expect(value).toEqual([
          {text: 'List items', fooAttr: 'bar'},
          {text: 'Inputs', fooAttr: 'foobar'}
        ]);
        done();
      });
    });
  });

});
