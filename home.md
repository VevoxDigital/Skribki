$title "Wiki Home"
$desc "Welcome to the Skribki Wiki!"
$categories ["default", "fixme"]

# Welcome to Skrbki!
Congratulations on setting up Skribki on your server! Skribki is a free and open-source software, open to community contribution and suggestions.

## Making Changes
Want to create a new page? Simply visit the url and create it when prompted. Easy as that! All of the necessary groups are created for you! An existing page has been edited by clicking the pencil icon as well!

Something doesn't work the way you want it to? Change it! Skribki is written entirely in JavaScript and is open to edits. You can even commit directly to the wiki repository if you wish.

### Skribki on GitHub
Check us out on GitHub! Found an issue or want to make a change for everyone to see? Check [this out](https://github.com/VevoxDigital/Skribki)!

### Adding Login Options
Skribki uses [PassportJS](http://passportjs.org) for handling logins. Have a look at existing login examples in `/auth` then create your own! Any passport stragety will work, so add as many as you like!

## Adding Editors
You can make your wiki white-listed or black-listed as you choose. Simply add the emails in question to `config.json` and choose whether to use a white- or black-list. Alternatively, users added as admin can add other users from the admin dashboard.

## Organizing Pages
Organizing pages on your wiki is simple and easy. There's two different ways to group your pages:

### Categories
A page can have many categories (and categories can even have categories!) that will appear at the bottom of the page; these categories can be used to group pages of similar content. Categories can be used to denote unfinished or broken pages, types of entries, or whatever else you can come up with.

### Directories
A page may be placed in a directory, which changes the route used to access it. You can use this to categorize pages further using directories without comprimising your categories. Want to create a directory dedicated to lore? To technical docs? How about one just for your favorite people? Go for it!

# Want More?
There's lots more to do.

## Make it Yours!
Skribki can be fully customized with specialized themes, parsers, or widgets. Simply place the desired customization in the corresponding directory and it will become available. Check the admin dashboard or manually edit `config.json` to select the desired look and feel.

## Check us Out
Vevox Digital is commited to creating free and open-source software for everyone to use and enjoy. Check out some of our other projects on [GitHub](https://github.com/VevoxDigital) or visit the [workshop](http://workshop.vevox.io/) for lots of neat stuff!
