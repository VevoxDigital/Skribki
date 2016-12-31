![Skribki](/public/img/brand.png)

**A free and open-source wiki, based on git. No databases, no hassle.**

[![Travis](https://img.shields.io/travis/VevoxDigital/Skribki/master.svg?style=flat-square&label=stable)](https://travis-ci.org/VevoxDigital/Skribki)
[![Travis](https://img.shields.io/travis/VevoxDigital/Skribki/dev.svg?style=flat-square&label=latest)](https://travis-ci.org/VevoxDigital/Skribki)
[![Code Climate](https://img.shields.io/codeclimate/github/VevoxDigital/Skribki.svg?style=flat-square)](https://codeclimate.com/github/VevoxDigital/Skribki)
[![Code Climate](https://img.shields.io/codeclimate/issues/github/VevoxDigital/Skribki.svg?style=flat-square)](https://codeclimate.com/github/VevoxDigital/Skribki/issues)
[![GitHub release](https://img.shields.io/github/release/VevoxDigital/Skribki.svg?style=flat-square)](https://github.com/VevoxDigital/Skribki/releases)

# A Powerful New Wiki
Skribki is unique as wiki software in that it is *super* simple to set up and requires **no additional software** besides NodeJS and git. That's really it: no silly databases and no hassle with web server or daemon configuration.

[Customization](#Customization) •
[Installation](#Installation)

## Database-less Data
Skribki runs completely without a database, which may sound a little strange at first. All of the pages and files associated with Skribki are all stored on disk and controlled by a git repository: changes are logged and stored soley by git.

For authentication and users, Skribki utilizes OAuth providers to store user account data elsewhere. All of Skribki's authentication is all external, meaning you can either integrate with your pre-existing system or use any number of OAuth providers.

## Flexibility and Simplicity
What sets Skribki apart from other software is its extreme flexibility without over-complicating its functionality. Themes, custom parsers, new authentication strategies, and more are all readily available, but Skribki is ready to go out of the gate if you just want to get things rolling.

# Customization

## Parsers
Skribki comes default with a simple Markdown parser (using [marked](https://www.npmjs.com/package/marked)) and a simple HTML escaper. You can easily add your own parsers to give your wiki some edge over the others. If you're interested, give [this page](http://wiki.vevox.io/docs/skribki/parsers) a look.

## Themes
Everybody loves themes, and changing the theme is dirt simple. Drop in your theme and tell Skribki which one to use; simple as that.

Want to make your own theme? Check [this](http://wiki.vevox.io/docs/skribki/themes) out.

## Authentication
When it comes to authentication, Skribki is a little different. There is no database underneath, so Skribki relies on external providers for authentication, using [Passport](http://passportjs.org).

You can either create your own Passport strategy or use one of the many pre-existing ones to log in with. As long as it produces a username and email, it'll work!

# Installation
Skribki is *super* simple to install and requires little extra work to get it running.

```
// Clone the repo and install dependencies
$ git clone https://github.com/VevoxDigital/Skribki
$ npm install

// Start Skribki
$ npm start

```

Optionally append `--branch=dev` to the clone command to use the latest bleeding-edge build.

Skirbki requires NodeJS `v6.0` (`v6.9.1 lts` preferred) or later. If you need help upgrading, check out [this nifty thing](https://www.npmjs.com/package/n).

### Compass/Ruby Errors
In some cases, errors may arise related to Compass and/or Ruby. This is because `lib-sass` (through `node-sass`) doesn't *always* recognize the gem. Simply install it manually.

```
// Install the Ruby devkit from our package manager.
// In this case, we're using Debian apt.
$ sudo apt-get install ruby-dev

// Install the Compass gem
$ sudo gem install compass
```
