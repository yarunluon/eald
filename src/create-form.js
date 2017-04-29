function getWristbandSubmissionForm() {
  const ID = process.env.FORM_ID;
  const form = FormApp.openById(ID);
  // Logger.log(form.getTitle());
  return form;
}

function getWristbandSpreadsheet() {
  // Public facing
  const ID = process.env.WRISTBAND_SHEET_ID;

  const spreadsheet = SpreadsheetApp.openById(ID);
  // Logger.log(spreadsheet.getName());
  return spreadsheet;
}

function getWristbandsByCommitteeSheet() {
  // var ID = 1.451333585E9;
  const id = 0.0;
  const spreadsheet = getWristbandSpreadsheet();
  const wristbandSheet = _.filter(spreadsheet.getSheets(), sheet => sheet.getSheetId() === id)[0];
  // Logger.log(sheet);
  return wristbandSheet;
}

function clearForm(form) {
  const items = form.getItems();
  items.forEach((item) => {
    try {
      form.deleteItem(item);
    } catch (error) {
      Logger.log('%s Item already deleted', item.getTitle());
    }
  });
  return form;
}

function getRecordValues(sheet, row, lastColumn) {
  const FIRST_COLUMN = 1;
  const NUM_ROWS = 1;
  return sheet.getRange(row, FIRST_COLUMN, NUM_ROWS, lastColumn).getValues()[0];
}

function getCoordinatorEmails(record, numColumns) {
//  var NUM_ROWS = 1;
//  var ROW = 1;
//  var ZERO_BASED_ROW = 0;
  const ZERO_BASED_COLUMN = 6;
//  var row = record.getValues()[ZERO_BASED_ROW];
  const emails = _.compact(record.slice(ZERO_BASED_COLUMN, numColumns));
  // Logger.log(emails);
  return emails;
}

function getSimplifiedForm(form, sheet) {
  const range = sheet.getDataRange();
  const numColumns = range.getNumColumns();
  const numRows = range.getNumRows();
  const DATA_FIRST_ROW = 3;

  form.setTitle('FnF XX - EA/LD volunteer signup');
  form.setShowLinkToRespondAgain(true);
  form.setShuffleQuestions(false);
  form.setPublishingSummary(false);
  form.setProgressBar(false);
  form.setAllowResponseEdits(false);

  form.addPageBreakItem().setTitle("Let's begin");

  form.addTextItem()
    .setTitle('Who are you?')
    .setHelpText("Not everyone has a Google account so we can't ask Big Brother to tell us who you are.")
    .setRequired(true);

  form.addTextItem()
    .setTitle('What is your email?')
    .setHelpText('A sparkle pony will send you a lovely confirmation email.')
    .setRequired(true);

  form.addPageBreakItem()
    .setTitle('Select which role');
  const committeeQuestion = form
    .addListItem()
    .setRequired(true);
  const committeePageNavigationMap = {};

  const lastPage = form.addPageBreakItem()
    .setTitle('Almost done. Hit the button below.');

  const maxRows = numRows + 1;
  _.forEach(_.range(DATA_FIRST_ROW, maxRows), (number) => {
    const recordValues = getRecordValues(sheet, number, numColumns);
    const [, committee, , earlySlots, lateSlots] = recordValues;
    const emails = getCoordinatorEmails(recordValues, numColumns);
    Logger.log('%s %s %s %s %s', number, committee, earlySlots, lateSlots, emails);
    const earlyPassStr = earlySlots === 1 ? 'pass' : 'passes';
    const latePassStr = lateSlots === 1 ? 'pass' : 'passes';

    const earlyHelptext = `This role has ${earlySlots} early ${earlyPassStr}`;

    const emailConfirmationText = `${emails.length === 1 ? 'An email' : 'Emails'} will be sent to: ${emails.join(', ')}`;

    const instructionsText = 'Example: Paul Oakenfold, Doc Martin, Carl Cox';
    const slotsHelpText = `This role has ${earlySlots} early ${earlyPassStr} and ${lateSlots} late ${latePassStr}`;

    const nextSectionText = 'You will submit this information in the next section.';
    const committeeHelpText = `${emailConfirmationText}\n\n${slotsHelpText}\n\n${nextSectionText}`;

    const committeePageBreak = form.addPageBreakItem()
      .setTitle(committee)
      .setHelpText(committeeHelpText);

    committeePageBreak.setGoToPage(lastPage);
    committeePageNavigationMap[committee] = committeePageBreak;

    if (earlySlots) {
      form.addPageBreakItem();
      form.addSectionHeaderItem().setTitle('Early arrivals').setHelpText(earlyHelptext);
      form.addParagraphTextItem().setTitle('Full names').setHelpText(instructionsText);
    }

    if (lateSlots) {
      if (earlySlots) {
        form.addPageBreakItem();
          // .setTitle(committee);
          // .setHelpText(committeeHelpText);
      }
      form.addSectionHeaderItem().setTitle('Late Departures').setHelpText('If you have volunteers, please have them pick up the wristbands from you. Otherwise, enter all names that can pick up wristbands.');
      form.addTextItem().setTitle('Full names').setHelpText('Any remaining passes will be given to the first person in the list.');
    }
  });

  const committeeChoices = _.map(
    committeePageNavigationMap,
    (pageBreakItem, committee) => committeeQuestion.createChoice(committee, pageBreakItem),
  );

  committeeQuestion
    .setTitle('Role')
    .setChoices(committeeChoices);

  form.moveItem(lastPage.getIndex(), form.getItems().length - 1);

  form.setConfirmationMessage(
    'Done. Thank you. A team of sparkle ponies are typing up the confirmation emails.\n\n' +
    'Made a mistake? Submit a new response.\n\n' +
    "Something didn't go as planned? Email yarunl@gmail.com",
  );

  return form;
}

export function regenerateForm() {
  const sheet = getWristbandsByCommitteeSheet();
  getSimplifiedForm(clearForm(getWristbandSubmissionForm()), sheet);
}
