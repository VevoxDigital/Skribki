'use strict';

const nconf = require('nconf');

const configFile = require('path').join(__dirname, '..', 'config.json');

function initConfig() {
  if (!nconf.$navbar) nconf.argv().env().file({ file: configFile });
}

F.middleware('navbar', (req, res, next, options, controller) => {

  if (controller) {
    initConfig();
    controller.repository.$navbar = nconf.get('navbar') || { };
  }

  next();

});

F.middleware('sidebar', (req, res, next, options, controller) => {

  if (controller) {
    initConfig();
    controller.repository.$sidebar = nconf.get('sidebar') || { };
  }

  next();

});
