'use strict';

const nconf = require('nconf'),
      configFile = require('path').join(__dirname, '..', 'config.json');

nconf.argv().env().file({ file: configFile });

// make a config helper for custom config
F.helpers.config = key => { return nconf.get(key); };

// add the navbar to the repository
F.middleware('navbar', (req, res, next, options, controller) => {
  controller.repository.$navbar = nconf.get('navbar') || { };
  next();
});

// add the sidebar to the repository
F.middleware('sidebar', (req, res, next, options, controller) => {
  controller.repository.$sidebar = nconf.get('sidebar') || { };
  next();
});
