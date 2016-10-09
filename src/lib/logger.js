'use strict';

const winston = require('winston'),
      fs      = require('fs-extra'),
      path    = require('path'),
      Q       = require('q');

const dir = path.join(ROOTDIR, 'logs');

exports = module.exports = Q.Promise((resolve, reject) => {
  fs.ensureDir(dir, err => {
    if (err) return reject(err);

    global.LOG = new winston.Logger({
      transports: [
        new winston.transports.Console({
          colorize: true,
          humanReadableUnhandledException: true
        }),
        new (require('winston-daily-rotate-file'))({
          name: 'info',
          timestamp: true,
          filename: path.join(dir, 'info'),
          json: false,
          zippedArchive: true,
          datePattern: '.yyyy.MM.dd.log'
        }),
        new (require('winston-daily-rotate-file'))({
          name: 'errors',
          level: 'warning',
          timestamp: true,
          filename: path.join(dir, 'errors'),
          json: false,
          zippedArchive: true,
          datePattern: '.yyyy.MM.dd.log'
        })
      ]
    });
    LOG.info('logger created');
    resolve();
  });
});
