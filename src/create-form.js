/**
* Gets the form to submit ea/ld names
* @returns {Form} Google Form
* */
function getForm() {
  return FormApp.openById('process.env.FORM_ID');
}

/**
* Gets the admin facing spreadsheet
* @returns {Spreadsheet} Google Spreadsheet
* */
function getAdminSheet() {
  return SpreadsheetApp.openById('process.env.ADMIN_SPREADSHEET_ID');
}

/**
* Gets the sheet containing the wristbands by role
* @returns {Sheet} Google sheet summarizing the wristbands by role
* */
function getWristbandsByRole() {
  const id = +'process.env.ADMIN_ROLES_QUOTA_SHEET_ID';
  const spreadsheet = getAdminSheet();
  return _.filter(spreadsheet.getSheets(), sheet => sheet.getSheetId() === id)[0];
}

/**
* Removes all items in the form
* @param {Form} - Google Form
* @returns {Form} - The same form, but with all items removed
* */
function clearForm(form) {
  form.getItems().forEach((item) => {
    try {
      form.deleteItem(item);
    } catch (error) {
      Logger.log('%s Item already deleted', item.getTitle());
    }
  });

  return form;
}

/**
* Gets a record from the sheet
* @param {Sheet} Google Sheet
* @param {Number} The row index within the sheet to return
* @param {Number} The last column to return in the row
* @returns {Array} The record from the sheet
* */
function getRecordValues(sheet, row, lastColumn) {
  const FIRST_COLUMN = 1;
  const NUM_ROWS = 1;
  return sheet.getRange(row, FIRST_COLUMN, NUM_ROWS, lastColumn).getValues()[0];
}

/**
* (Re-)Create a stateless form
* @param {Form} form         - Google Form
* @param {Spreedsheet} sheet - Spreadsheet about wristbands
* @returns {Form} The same form with the form items added
* */
function createStatelessForm(form, sheet) {
  const range = sheet.getDataRange();
  const numColumns = range.getNumColumns();
  const numRows = range.getNumRows();
  const DATA_FIRST_ROW = 3;

  form.setTitle('FnF XXII - EA/LD volunteer signup');
  form.setShowLinkToRespondAgain(true);
  form.setShuffleQuestions(false);
  form.setPublishingSummary(false);
  form.setProgressBar(false);
  form.setAllowResponseEdits(false);

  const selectRoleListItem = form
    .addListItem()
    .setRequired(true);

  const allRoles = _.times((numRows + 1) - DATA_FIRST_ROW, (num) => {
    const index = num + DATA_FIRST_ROW;
    const [, roleId] = getRecordValues(sheet, index, numColumns);
    return roleId;
  }).concat('FnF').sort();

  const roleChoices = _.map(allRoles, role => selectRoleListItem.createChoice(role));

  selectRoleListItem
    .setTitle('Role')
    .setChoices(roleChoices);

  form.addParagraphTextItem()
    .setTitle('Early arrival names')
    .setHelpText('Separate all names with a comma.');

  form.addParagraphTextItem()
    .setTitle('Late departure names')
    .setHelpText('Separate all names with a comma. Repeat the name if they are picking up more than one.');

  form.addPageBreakItem()
    .setTitle('Almost done. Hit the button below.');

  form.setConfirmationMessage('Done.\n\n' +
    'Made a mistake? Submit a new response.\n\n' +
    "Something didn't go as planned? Email ealdfnf@gmail.com");

  return form;
}

/**
* Entry function to create the form
* */
export function createForm() {
  const wristbandSheet = getWristbandsByRole();
  const clearedForm = clearForm(getForm());
  createStatelessForm(clearedForm, wristbandSheet);
}
