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
    'import/prefer-default-export': 'off',
  },
}
