'use strict';

require('colors');

// Create a middleware that will debug output all of the incoming requeusts.
F.middleware('request-debug', (req, res, next, options, controller) => {
  res.on('finish', () => {
    let color = 'white';
    if (res.statusCode >= 500) color = 'red';
    else if (res.statusCode >= 400) color = 'yellow';
    else if (res.statusCode >= 300) color = 'cyan';
    else if (res.statusCode >= 200) color = 'green';
    LOG.log(F.locked(req.url) ? 'silly' : 'verbose',
      `${req.connection.remoteAddress} ${req.method.bold} ${req.url} ${res.statusCode.toString()[color]}`);
  });
  next();
});
F.use('request-debug');
