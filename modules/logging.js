'use strict'

// this module loads absolutely first before anything.
// perform init
require('colors')

const winston = require('winston')
require('winston-daily-rotate-file')

const PREFIXES = {
  CONF: '✓'.green,
  FAIL: 'X'.red,
  WARN: '!'.yellow,
  NOTE: '*'.cyan
}

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

  const logPrefix = (prefix, level, msg) => {
    if (!msg && level) {
      msg = level
      level = 'info'
    }

    F.logger.log(level, ` ${PREFIXES[prefix]} ${msg}`)
  }

  F.logger.prefixNote = (level = '', msg) => { logPrefix('NOTE', level, msg) }
  F.logger.prefixConf = (level = '', msg) => { logPrefix('CONF', level, msg) }
  F.logger.prefixFail = (level = '', msg) => { logPrefix('FAIL', level, msg) }
  F.logger.prefixWarn = (level = '', msg) => { logPrefix('WARN', level, msg) }
}

exports.uninstall = () => {
  delete F.logger
  delete global.LOG
}
