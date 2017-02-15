'use strict'

const pkg = require('../package.json')

F.config.name = 'Skribki'
F.config.version = pkg.version
F.config.author = pkg.author

F.config['default-theme'] = 'vevox-blue'

F.logger.info(`configuration: ${F.config.name} v${F.config.version}`)

F.logger.info(` ${'-'.yellow} name: ${F.config['wiki.name']}`)
F.logger.info(` ${'-'.yellow} theme: ${F.config['wiki.theme'] || F.config['default-theme']}`)
F.logger.info(` ${'-'.yellow} language: ${F.config['wiki.lang']}`)

F.logger.info(` ${'-'.yellow} page cacheing: ${!!F.config['cache.pages.enabled']}`)
F.logger.info(` ${'-'.yellow} index cacheing: ${!!F.config['cache.pages.enabled']}`)
