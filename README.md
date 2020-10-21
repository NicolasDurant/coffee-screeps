# Coffee Screeps

Repo for the game screeps, that uses CoffeeScript. Uses Grunt for compile automation and pushes.

It will convert `.coffee` to `.js` files and allows to manage scripts in folders.

## Installation

Run the command `$ npm install` on project root in your terminal.

Generate a `.screeps.json` like the example and enter your credentials for the automatic push to work.

### .screeps.json

```json
{
  "email": "<YOUR EMAIL HERE>",
  "local": "C:\\Users\\YOUR_USER_NAME\\AppData\\Local\\Screeps\\scripts\\screeps.com\\coffee",
  "password": "<YOUR PASSWORD HERE>",
  "branch": "default",
  "ptr": false
}
```

## Grunt

`$ grunt` will call all scripts and push the generated code into your local folder (path defined in `.screeps.json`). This will be used most of the times so it's the default.

`$ grunt update` will do the same, but puts the code onto your screeps account with given credentials and branch also defined in `.screeps.json`.

### Seperate compilation & push

If you want to generate the JS files and manually change them you can use compile, make changes and git push. This has also be used if you want to use `$ grunt pretty` or `$ grunt test`.
`$ grunt compile-only` will clean the folders `/dist`, `/lib` and compiles the `.coffee` scripts to JS afterwards and puts them into `/lib`.
Useful for local debugging and testing purposes.

`$ grunt push-only` will now transport `/lib` into `/dist` and removes folders from your JS in lib and prefixes them with '\_' e.g. `roles/harvester.js` -> `roles_harvester.js`. Screeps can't handle folders. It then tags the code with a new version and pushes to your screeps account with the given information in `.screeps.json`.

## Folders

In this case the "copy" plugin is going to be used to move code from the lib directory to dist. The plugin as an option to rename files, so a function to convert directory delimiters (slashes) to underscores is used to flatten the file structure. Once run the results will look like this. ! You have to use the requires in this format !

| Before                     | After                       |                         Require |
| :------------------------- | --------------------------- | ------------------------------: |
| lib/main.js                | dist/main.js                |                require('main'); |
| lib/lib/creeptalk.js       | dist/lib_creeptalk.js       |       require('lib_creeptalk'); |
| lib/lib/creeptalk/emoji.js | dist/lib_creeptalk_emoji.js | require('lib_creeptalk_emoji'); |
| lib/prototypes/creeps.js   | dist/prototypes_creeps.js   |   require('prototypes_creeps'); |
| lib/prototypes/spawns.js   | dist/prototypes_spawns.js   |   require('prototypes_spawns'); |

## Versioning

In your source code create an empty file named version.js. Grunt is going to use this file to add the global variable SCRIPT_VERSION with the timestamp as its value. Then populate a variable with the current date and create a new file_append task. Now by adding require('version') the variable SCRIPT_VERSION will be available. Comparing this to a version string saved in memory allows players to see when new scripts are updated.

```js
require('version');
if (!Memory.SCRIPT_VERSION || Memory.SCRIPT_VERSION != SCRIPT_VERSION) {
  Memory.SCRIPT_VERSION = SCRIPT_VERSION;
  console.log('New code uplodated');
}
```
