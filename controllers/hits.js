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
  Promise.all([
      client.execute(`INSERT INTO hits (hit, ip, url) VALUES (?, ?, ?) IF NOT EXISTS USING TTL 2629800`, [hit, ip, url], {
        prepare: true
      }),
      client.execute(`UPDATE counter SET popularity = popularity + 1 where url = ?`, [url], {
        prepare: true
      }),
      client.execute(`select * from counter where url = ?`, [url], {
        prepare: true
      })
      .then(result => {
        return {count: result.rows[0]}
      }),
      client.execute(`select count(*) from hits where url = ?`, [url], {
        prepare: true
      })
      .then(result => {
        return {recent: result.rows[0]}
      })
    ])
    .then((values) => {
      const value =  values.filter(item => item !== undefined && item.count);
      const recent =  values.filter(item => item !== undefined && item.recent);
      const result = {
        status: 'Success',
        url: value[0].count.url,
        count: value[0].count.popularity,
        recent: recent[0].recent.count
      }
      console.log('result', result);
      res.status(200).json(result);
    });
};
