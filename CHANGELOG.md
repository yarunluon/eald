# Changelog

## 2019
1. Renamed `env` variables to be more clear
1. Prefixed `env` sheet variables with the spreadsheet they belong in
1. Added Changelog file
1. Renamed `.env.example` to `example.env` to take advantage of syntax highlighting
1. Updated `.nvmrc` to use always use latest LTS node
1. Updated npm dependencies
    1. Dependency wraggling. This comment fixed the babel issue. https://github.com/babel/babel/issues/6186#issuecomment-366556833
1. Removed Skipper sheet id and spreadsheet id because its no longer used
1. Fixed all security vulnerabilities by upgrading all npm packages