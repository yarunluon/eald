module.exports = {
  extends: 'airbnb',
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
