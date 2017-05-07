module.exports = {
  extends: 'airbnb',
  env: {
    jest: true,
  },
  globals: {
    _: false,
    FormApp: false,
    Logger: false,
    PropertiesService: false,
    SpreadsheetApp: false,
  },
  rules: {
    // GAS doesn't like how babel transpiles default exports
    'import/prefer-default-export': 'off',
  },
}
