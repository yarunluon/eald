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
1. Split the files to make testing easier. Separate by pure and impure functions.

## Background
Every year I help organize an annual campout of 700 participants. My specific role is to track the
people who can arrive early and stay late.

### Inputs
1. Head organizers give me the number of people per role allowed on-site
1. Coordinators who supply the names for each role
1. Names of volunteers from the volunteer sign-up board
1. People who pay to stay on-site longer

### Outputs
1. An Early Arrival spreadsheet for staff to verify they can come early
1. A Late Departure spreadsheet for staff to verify they can stay late
1. A list of roles and which staff are fulfilling them
1. A list of names and which roles they are fulfilling
1. A list for Gate Check staff to give out early arrival wristbands
1. A list for Late Departure staff to give out late departure wristbands
