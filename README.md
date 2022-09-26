# Module Starter

A skeleton module to be used as a starter to build a module.

## Setup and build

* Install packages: `npm install`
* Running and testing locally: `npm run start`
    * Connect on port `8080` using your local network ip address
* Publish module for distribution: `npm run publish`

## How this all works

`src` - contains the html / javascript / media assets used to create the module.

`package.json` - defines all the external dependencies used to for building and running the module. As well as the commands (ie: `start` and `publish` above) that can be run through npm.

`webpack.config.js` - webpack is a plugin that takes the content of the `src` folder and reduces all the html and javascript into a single file (in the `dist` folder) so that the content will load faster. The config file defines how this conversion occurs.

`webpack.dev.js` - used to run the local server for testing the module. Creates a proxy to load content needed to run the module from https://module.oooh.io/

`o3hmanifest.json` - this defines how your module integrate with the Oooh platform, see: https://docs.oooh.io/docs/o3hmanifest-configuration for details
