[![Build Status](https://travis-ci.org/yarunluon/eald.svg?branch=master)](https://travis-ci.org/yarunluon/eald)

# Early Arrival / Late Departure
JavaScript that writes JavaScript to run in the Google App Scripts environment.

The generated scripts manage the early arrival and late departure of guests in the form of Google Spreadsheets.

## Usage
1. `nvm install` to set the correct node version. Requires [nvm](https://github.com/creationix/nvm) to be installed.
1. `npm install` will install all the dependencies.
1. Copy/rename `.env.example` to `.env` and fill in the environmental variables.
1. `npm run build` will generate the Google App Scripts in the `dist/` folder.
1. `npm run reinstall` will remove `dist/` and `node_modules/` and reinstall all dependencies.

## Background
Every year my volunteer group organizes an annual campout of 700 participants. My specific role is to track the people who can arrive early and stay late.

## Project Goals
1. Make it easy for participants to verify online if they can arrive early or stay late.
1. Provide a list of names for Gate staff to enforce.
1. Provide easy to summarize data for head organizers to analyze.
1. Provide a form to enter names

## Technical Goals
1. Dynamically regenerate the list when a source of truth gets updated.
1. Dynamically regenerate the form when roles are added or deleted.
1. Organize the codebase for easy collaboration or handoff
    1. Testing for easy refactoring
    1. Linting for code quality
    1. Environment config files for consistent behavior across machines
    1. Continuous integration for code quality
    1. Well-documented code for easy comprehension
1. Use the latest JavaScript
1. Use functional programming
1. Have this project be a sandbox for new technologies
1. Have some level of security
    1. Do not include sensitive information in the source code
    1. Only allow head organizers access to sensitive information

## Inputs - Sources of truth
1. Number of people per role allowed on-site
1. Names of coordinators for each role
1. Names of volunteers for each role
1. Names of people who pay to stay on-site longer

## Outputs
1. An Early Arrival spreadsheet for campers to verify if they can come early.
1. A Late Departure spreadsheet for campers to verify if they can stay late.
1. A list of roles and which staff are fulfilling them.
1. A list of names and which role they are fulfilling.
1. A list for Gate Check staff to give out early arrival wristbands.
1. A list for Late Departure staff to give out late departure wristbands.
1. A form to enter the names of people authorized to arrive early or stay late.

## TODOs
1. Write code to send emails with initial EA/LD slots.
1. Split the files to make testing easier. Separate by pure and impure functions.
1. Develop API to receive changes in role information.
