[![Build Status](https://travis-ci.org/yarunluon/eald.svg?branch=master)](https://travis-ci.org/yarunluon/eald)

# Early Arrival / Late Departure
Generates scripts to run in Google App Scripts.

The generated scripts manage the early arrival and late departure of guests.

## Usage
1. `nvm install` to set the correct node version. Requires [nvm](https://github.com/creationix/nvm) to be installed.
1. `npm install` will install all the dependencies
1. Copy/rename `.env.example` to `.env` and fill in the environmental variables
1. `npm run build` will generate the Google App Scripts in the `dist/` folder
1. `npm run reinstall` will remove `dist/` and `node_modules/` and reinstall all dependencies

## TODOs
1. Add testing
1. Write code to send emails with initial EA/LD slots
1. Convert from Webpack to either Gulp or Make
