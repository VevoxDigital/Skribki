'use strict';

const winston = require('winston'),
      path    = require('path');
require('winston-daily-rotate-file');

exports.id = 'logging';

exports.install = () => {

  F.log = new winston.Logger({
    level: 'debug',
    transports: [
      new winston.transports.Console({
        colorize: true
      }),
      new winston.transports.DailyRotateFile({
        name: 'info-file',
        filename: path.join(__dirname, '..', 'logs', 'log'),
        datePattern: 'info-yy-MM-dd.',
        prepend: true,
        level: 'info',
        json: false
      }),
      new winston.transports.DailyRotateFile({
        name: 'err-file',
        filename: path.join(__dirname, '..', 'logs', 'log'),
        datePattern: 'err-yy-MM-dd.log',
        prepend: true,
        level: 'warn',
        json: false
      })
    ]
  });

  global.LOG = F.log;

};
