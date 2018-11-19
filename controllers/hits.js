'use strict';

const validator = require('validator');
let client = null;

exports.createTable = (init_client) => {
  client = init_client;
  return new Promise((resolve, reject) => {
    client.execute(`CREATE TABLE IF NOT EXISTS hits (
        url text,
        hit timestamp,
        ip text,
        PRIMARY KEY (url, hit)
    ) WITH CLUSTERING ORDER BY (hit ASC);`, [], {
      prepare: true
    }, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      }
      console.log('info Hits table initialized');
      resolve(client);
    });
  });
};

exports.hit = async (req, res) => {

  // hit
  const hit = Date.now();

  // ip
  if (!req.ip) {
    res.status(403).send('An error occurred');
    console.log('info IP not present');
    return;
  }
  if (!validator.isIP(req.ip)) {
    res.status(403).send('IP address was not considered valid.');
    console.log('info IP not valid');
    return;
  }
  // converted to safe value, hashed, and salted
  const ip = req.ip;

  // url
  if (!req.body.url) {
    res.status(403).send('An error occurred');
    console.log('info URL not present');
    return;
  }
  if (!validator.isURL(req.body.url)) {
    res.status(403).send('URL was not considered valid.');
    console.log('info URL not valid');
    return;
  }
  const url = req.body.url;

  // submit values to server
  client.execute(`INSERT INTO hits (hit, ip, url) VALUES (?, ?, ?) IF NOT EXISTS USING TTL 2629800`, [hit, ip, url], {
      prepare: true
    })
    .then(result => {
      res.status(200).json({
        status: 'Success'
      });
    });
};
