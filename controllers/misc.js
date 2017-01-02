'use strict';

exports.install = () => {
  F.route('/special/error/{errno}', function (errno) { this.viewError(errno, '/') });
  F.route('/special/random', displayRandom);

  // a few easter-egg routes
  F.route('/special/ashley', function () { this.view707() });
  F.route('/special/brew', function () { this.view418() });
};

function displayRandom() {
  this.throw501('random not yet implemented');
}
