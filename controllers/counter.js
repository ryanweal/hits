'use strict';

const validator = require('validator');
let client = null;

exports.createTable = (init_client) => {
  client = init_client;
  return new Promise((resolve, reject) => {
    client.execute(`CREATE TABLE IF NOT EXISTS counter (
        url text PRIMARY KEY,
        popularity counter
    );`, {
      prepare: true
    }, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      }
      console.log('info Counter table initialized');
      resolve(client);
    });
  });
};
