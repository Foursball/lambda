var request = require('request');
var Promise = require('bluebird');
var config = require('../config');

module.exports = {
  getDB: getDB
};

function getDB() {
  return new Promise(function(resolve) {
    request(config.firebase + '/.json', function(error, response, body) {
      resolve(JSON.parse(body));
    });
  });
}
