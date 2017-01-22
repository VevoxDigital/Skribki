'use strict';

// this is a module so it loads first

const winston = require('winston');
require('winston-daily-rotate-file');

exports.id = 'logging';

exports.install = () => {
  F.logger = new winston.Logger({
    transports: [

      // console output will be the most verbose
      new winston.transports.Console({
        colorize: true,
        level: DEBUG ? 'debug' : 'verbose'
      }),

      // info files will rotate daily
      new winston.transports.DailyRotateFile({
        name: 'info-file',
        filename: F.path.logs('log'),
        datePattern: 'info-yy-MM-dd.',
        level: 'info',
        json: false
      }),

      // error files rotate once a month
      new winston.transports.DailyRotateFile({
        name: 'error-file',
        filename: F.path.logs('log'),
        datePattern: 'err-yy-MM.',
        level: 'warning',
        json: false
      })

    ]
  });

  global.LOG = F.logger;
}

exports.uninstall = () => {
  delete F.logger;
  delete global.LOG;
}
