![Skribki](/public/img/brand.png)

**A free and open-source wiki, based on git. No databases, no hassle.**

[![Travis](https://img.shields.io/travis/VevoxDigital/Skribki/master.svg?style=flat-square&label=stable)](https://travis-ci.org/VevoxDigital/Skribki)
[![Travis](https://img.shields.io/travis/VevoxDigital/Skribki/dev.svg?style=flat-square&label=latest)](https://travis-ci.org/VevoxDigital/Skribki)
[![Code Climate](https://img.shields.io/codeclimate/github/VevoxDigital/Skribki.svg?style=flat-square)](https://codeclimate.com/github/VevoxDigital/Skribki)
[![Code Climate](https://img.shields.io/codeclimate/issues/github/VevoxDigital/Skribki.svg?style=flat-square)](https://codeclimate.com/github/VevoxDigital/Skribki/issues)
[![Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com)
[![GitHub release](https://img.shields.io/github/release/VevoxDigital/Skribki.svg?style=flat-square)](https://github.com/VevoxDigital/Skribki/releases)

# A Powerful New Wiki
Skribki stands apart from most wiki software in its simplicity and functionality. The app itself can be run entirely without any external databases and easily integrates into your existing authentication system or any OAuth provider.

## Quick Install
Skribki can be quickly installed by simply cloneing the repository and installing its dependencies. You will need `npm` and NodeJS 6 or later for this.

```
$ git clone https://github.com/VevoxDigital/Skribki --branch=master && npm install
$ npm start
```

For a more in-depth guide, [check this out.](http://wiki.vevox.io/projects/skribki/install)

## Something Different
Skribki runs completely without a database, which may sound a little strange at first. Skribki stores all of its pages using `git`, meaning your wiki can be accessed as if it were a git respository if you so desire.

For authentication, Skribki utilizes OAuth providers to store user account data elsewhere. You can either integrate with your pre-existing system and/or use any number of OAuth providers available.

## Flexibility and Simplicity
What sets Skribki apart from other software is its extreme flexibility without over-complicating its functionality. Themes, custom parsers, new authentication strategies, and more can all be added, but Skribki is ready to go without.

Included in this repository is the [Vevox Blue](http://workshop.vevox.io/p/vevox-blue) theme, a GitHub authentication option, and a simple markdown parser. Read up [here](http://wiki.vevox.io/projects/skribki/customization) if you want to add more.

----

Made for all by [@CynicalBusiness](https://github.com/CynicalBusiness) with [Vevox Digital](http://vevox.io)

[GPL v3.0](/LICENSE). Copyright &copy; [Matthew Struble](https://github.com/CynicalBusiness).

*To My Warrior, Half the World Away*
