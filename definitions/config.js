'use strict'

const pkg = require('../package.json')

F.config.name = 'Skribki'
F.config.version = pkg.version
F.config.author = pkg.author

F.config['default-theme'] = 'vevox-blue'

F.logger.info(`configuration: ${F.config.name} v${F.config.version}`)

F.logger.prefixNote(`name: ${F.config['wiki.name']}`)
F.logger.prefixNote(`theme: ${F.config['wiki.theme'] || F.config['default-theme']}`)
F.logger.prefixNote(`language: ${F.config['wiki.lang']}`)

F.logger.prefixNote(`page cacheing: ${!!F.config['cache.pages.enabled']}`)
F.logger.prefixNote(`index cacheing: ${!!F.config['cache.pages.enabled']}`)
