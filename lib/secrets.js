'use strict';

const fs    = require('fs-extra'),
      path  = require('path');

const SECRET_FILE = path.join(__dirname, '..', '.secret'),
      SECRET_PATT = /@([a-z-]+)\ni ([a-z0-9]+)\ns ([a-z0-9]+)/ig;

var secrets = { };

const data = fs.readFileSync(SECRET_FILE);

let match;
while (match = SECRET_PATT.exec(data)) {
  secrets[match[1]] = { id: match[2], secret: match[3] };
}

console.log('Active providers: ' + Object.keys(secrets));

exports.fetch = name => { return secrets[name]; }
