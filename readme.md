![Skribki](/public/img/brand.png)

**A free and open-source wiki, based on git. No databases, no hassle.**

[![Travis](https://img.shields.io/travis/VevoxDigital/Skribki/master.svg?style=flat-square&label=stable)](https://travis-ci.org/VevoxDigital/Skribki)
[![Travis](https://img.shields.io/travis/VevoxDigital/Skribki/dev.svg?style=flat-square&label=latest)](https://travis-ci.org/VevoxDigital/Skribki)
[![Code Climate](https://img.shields.io/codeclimate/github/VevoxDigital/Skribki.svg?style=flat-square)](https://codeclimate.com/github/VevoxDigital/Skribki)
[![Code Climate](https://img.shields.io/codeclimate/issues/github/VevoxDigital/Skribki.svg?style=flat-square)](https://codeclimate.com/github/VevoxDigital/Skribki/issues)
[![GitHub release](https://img.shields.io/github/release/VevoxDigital/Skribki.svg?style=flat-square)](https://github.com/VevoxDigital/Skribki/releases)

# A Powerful New Wiki
Skribki is unique as wiki software in that it is *super* simple to set up and requires **no additional software** besides NodeJS and git. That's really it: no silly databases and no hassle with web server or daemon configuration.

## Quick Install
Skribki is simple to install and requires little extra work to get it running.

```
// Clone the repo and install dependencies
$ git clone https://github.com/VevoxDigital/Skribki
$ npm install

// Start Skribki
$ npm start
```

Optionally append `--branch=dev` to the clone command to use the latest bleeding-edge build.

Skirbki requires NodeJS `v6.0` (`v6.9.1 lts` preferred) or later. If you need help upgrading, check out [this nifty thing](https://www.npmjs.com/package/n).

[In-depth installation documentation can be found here.](http://wiki.vevox.io/projects/skribki/install)

## Database-less Data
Skribki runs completely without a database, which may sound a little strange at first. All of the pages and files associated with Skribki are all stored on disk and controlled by a git repository: changes are logged and stored soley by git.

For authentication and users, Skribki utilizes OAuth providers to store user account data elsewhere. All of Skribki's authentication is all external, meaning you can either integrate with your pre-existing system or use any number of OAuth providers.

## Flexibility and Simplicity
What sets Skribki apart from other software is its extreme flexibility without over-complicating its functionality. Themes, custom parsers, new authentication strategies, and more are all readily available, but Skribki is ready to go out of the gate if you just want to get things rolling.

----

Made for you by [@CynicalBusiness](/CynicalBusiness) at Vevox Digital

*To My Warrior, Half the World Away*
