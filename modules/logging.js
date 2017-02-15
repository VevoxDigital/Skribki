'use strict'

// this module loads absolutely first before anything.
// perform init
require('colors')

const winston = require('winston')
require('winston-daily-rotate-file')

exports.id = 'logging'

exports.install = () => {
  F.logger = new winston.Logger({
    transports: [

      // console output will be the most verbose
      new winston.transports.Console({
        colorize: true,
        level: F.isDebug ? 'debug' : 'verbose'
      }),

      // info files will rotate daily
      new winston.transports.DailyRotateFile({
        name: 'info-file',
        filename: F.path.logs('info-'),
        datePattern: 'yy-MM-dd.log',
        level: 'info',
        json: false
      }),

      // error files rotate once a month
      new winston.transports.DailyRotateFile({
        name: 'error-file',
        filename: F.path.logs('errors'),
        datePattern: '-yy-MM.log',
        level: 'warn',
        json: false
      })

    ]
  })
}

exports.uninstall = () => {
  delete F.logger
  delete global.LOG
}
