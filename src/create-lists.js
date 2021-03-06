/* ********************************
* Get Spreadsheets
******************************** */
export function getAdminSpreadsheetId() {
  return 'process.env.ADMIN_SPREADSHEET_ID';
}

export function getPublicSpreadsheetId() {
  return 'process.env.PUBLIC_SPREADSHEET_ID';
}

export function getRawDataSpreadsheetId() {
  return 'process.env.RAW_DATA_SPREADSHEET_ID';
}

export function getGateCheckSpreadsheetId() {
  return 'process.env.GATE_SPREADSHEET_ID';
}

export function getRawFormResponseSheetId() {
  return process.env.RAW_FORM_RESPONSE_SHEET_ID;
}

export function getRawPrepaidTransactionsSheetId() {
  return process.env.RAW_PREPAID_TRANSACTIONS_SHEET_ID;
}

export function getRawRolesQuota() {
  return process.env.RAW_ROLES_QUOTA;
}

export function getPublicRolesQuotaSheetId() {
  return process.env.PUBLIC_ROLES_QUOTA_SHEET_ID;
}

/**
* Get the specific sheet within the spreadsheet
* @param {Number} sheetId - The sheet id within the spreadsheet
* @param {String} spreadsheetId - The spreadsheet id that contains the desired sheet
* @returns {Sheet} - The desired sheet
* */
export function getSheet(sheetId, spreadsheetId) {
  // Cannot reference script by 'ActiveSheet', because of doPost()
  const sheets = SpreadsheetApp.openById(spreadsheetId).getSheets();
  return _.find(sheets, sheet => sheet.getSheetId() === sheetId);
}

/* ********************************
* Source of Truth sheets
******************************** */

/**
* Get the form responses from the Google Spreadsheet as pure javascript array
* @returns {Array[]} Array of records.
* */
export function getRawFormResponsesData() {
  const DATA_START_ROW = 2;
  const DATA_START_COL = 1;

  const sheet = getSheet(getRawFormResponseSheetId(), getRawDataSpreadsheetId());
  const range = sheet.getDataRange();
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();
  return sheet.getSheetValues(DATA_START_ROW, DATA_START_COL, numRows, numCols);
}

/**
* Get the prepaid transactions from the Google Spreadsheet as pure javascript array
* @returns {Array[]} Array of records.
* */
function getRawPrepaidTransactionsData() {
  const DATA_START_ROW = 1;
  const DATA_START_COL = 1;

  const sheet = getSheet(getRawPrepaidTransactionsSheetId(), getRawDataSpreadsheetId());
  const range = sheet.getDataRange();
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();

  return sheet.getSheetValues(DATA_START_ROW, DATA_START_COL, numRows, numCols);
}

/**
* Get the writeband quotas from the Google Spreadsheet as pure javascript array
* @returns {Array[]} Array of records.
* */
function getRawRolesQuotaData() {
  const DATA_START_ROW = 3;
  const DATA_START_COL = 1;

  const sheet = getSheet(getRawRolesQuota(), getRawDataSpreadsheetId());
  const range = sheet.getDataRange();
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();
  return sheet.getSheetValues(DATA_START_ROW, DATA_START_COL, numRows, numCols);
}

function getAdminParsedFormResponsesSheet() {
  return getSheet(process.env.ADMIN_PARSED_FORM_RESPONSES_SHEET_ID, getAdminSpreadsheetId());
}

function getAdminAllPassesSheet() {
  return getSheet(process.env.ADMIN_ALL_PASSES_SHEET_ID, getAdminSpreadsheetId());
}

function getAdminStaffListSheet() {
  return getSheet(process.env.ADMIN_STAFF_LIST_SHEET_ID, getAdminSpreadsheetId());
}

function getAdminPrepaidSheet() {
  return getSheet(process.env.ADMIN_PREPAID_SHEET_ID, getAdminSpreadsheetId());
}

function getGateGatecheckSheet() {
  return getSheet(process.env.GATE_GATECHECK_SHEET_ID, getGateCheckSpreadsheetId());
}

function getAdminLateDepartureSheet() {
  return getSheet(process.env.ADMIN_LATE_DEPARTURES_SHEET_ID, getAdminSpreadsheetId());
}

function getPublicEarlyArrivalsSheet() {
  return getSheet(process.env.PUBLIC_EARLY_ARRIVALS_SHEET_ID, getPublicSpreadsheetId());
}

function getPublicLateDeparturesSheet() {
  return getSheet(process.env.PUBLIC_LATE_DEPARTURES_SHEET_ID, getPublicSpreadsheetId());
}

function getPublicAuthorizedStaffSheet() {
  return getSheet(process.env.PUBLIC_AUTHORIZED_STAFF_SHEET_ID, getPublicSpreadsheetId());
}

// function getBulkStaffTransactionSheet() {
//   return getSheet(process.env.BULK_STAFF_TRANSACTION_SHEET_ID, getAdminSpreadsheetId());
// }

export function getPublicRolesQuotaSheet() {
  return getSheet(process.env.PUBLIC_ROLES_QUOTA_SHEET_ID, getPublicSpreadsheetId());
}

/* ********************************
* Helpers
******************************** */

/**
* Add roles and the total number of slots
* @param {Object} roles - Current Tabulated roles
* @param {Object} role - Used to add to target object
* @return {Object} - New object of roles with current one merged
* */
export function addRole(roles, role) {
  const { roles: prevRoles = [], slots: prevSlots = 0 } = roles;
  const nextRoles = {
    roles: prevRoles.concat(role.role),
    slots: prevSlots + role.slots,
  };
  return nextRoles;
}

/**
* Sorts records on the first element: name
* @param {Array} a - Array of items
* @param {Array} b - Another array of items
* @param {Number} - -1 if a is first, 0 if a and b are equal, 1 if b is before a
* */
export function sortNames(a, b) {
  const name1 = a[0];
  const name2 = b[0];
  return name1.localeCompare(name2);
}

/**
* Takes a string of names and converts to an array of names. Handles comma and new line delimited
* @param {String} names - A comma- or newline-separated list of names
* @return {String[]} - An array of names that are Capital Cased
* */
export function splitNames(names) {
  const parseableNames = names || '';

  // Separate by delimiter
  let nameParts = parseableNames.split('\n');
  if (nameParts.length === 1) {
    // names might be comma-separated
    nameParts = parseableNames.split(',');
  }

  // Separate by name parts, capitlize, and recombine
  const prettyNames = nameParts.map(fullname => String(fullname)
    .trim()
    .split(' ')
    // Capitalize the first letter
    .map(name => name.slice(0, 1).toUpperCase() + name.slice(1))

    // Recombine name parts
    .join(' '));
  return _.compact(prettyNames);
}

/**
* Create an array of records for a specific role
* @param {String} role - Name of role
* @param {Number} slots - How many records
* @param {String[]} names - Names of people to fill each role
* @param {String} type - Type of role. Early or Late
* @returns {Array[]} Record array with the following items
*    ```[ role name, role type, name of person]```
* */
export function createRoleRecords(role, slots, names, type) {
  const records = _.times(slots, (number) => {
    const name = names.length > number ? names[number] : '';
    const record = [role, type, name];
    return record;
  });

  return records;
}

/**
* Removes spaces and lowercases names to remove opinions about how to write a name
* @param {String} - name of person
* @return {String} - Name of person in all lowercase with spaces removed
* */
export function normalizeName(name) {
  return name.toLowerCase().replace(' ', '');
}

/**
* Returns a list of names that have both prepaid and are volunteering
* @param {String[]} prepaidNames - An array of names that have prepaid
* @param {String[]} roleNames - An array of names that have volunteered
* @returns {String[]} - An array of normalized names that are both prepaid and are volunteering
* */
export function bothNames(prepaidNames, roleNames) {
  const normalizedRoleNames = roleNames.map(normalizeName);
  const normalizedPrepaidNames = prepaidNames.map(normalizeName);

  const names = _.intersection(normalizedPrepaidNames, normalizedRoleNames);
  return names;
}

/* ********************************
* Getters
******************************** */

/**
* Reorganizes the prepaid records by person's name
* @param {Array[]} rawData - Array of raw data records
* @returns {Object} An object keyed by a person's name
* ```
* [name]: {
*   timestamp: number
*   tid: string
*   name: string
*   early: number
*   late: number
*   email: string
* }
* ```
* */
export function getPrepaidTransactions(rawData) {
  const uniquePrepaids = rawData.reduce((prepaids, record) => {
    const [name, email, tid, early, late, timestamp, status, note] = record;
    const recordObj = {
      timestamp,
      tid,
      name,
      early,
      late,
      email,
      status,
      note,
    };
    return Object.assign({}, prepaids, { [tid]: recordObj });
  }, {});

  const allPrepaids = _.reduce(uniquePrepaids, (prepaids, prepaid) => {
    const { [prepaid.name]: { early = 0, late = 0 } = {} } = prepaids;
    const nextPrepaid = {
      [prepaid.name]: {
        ...prepaid,
        early: early + prepaid.early,
        late: late + prepaid.late,
      },
    };

    return Object.assign({}, prepaids, nextPrepaid);
  }, {});

  return allPrepaids;
}

/**
* Converts the raw form responses into an object
* @param {Array[]} rawData - Array of form response records
* @returns {Object} The latest form response keyed by form id of the role
* ```
* {
*   [role form id]: [role record],
* }
* ```
* */
export function getFormResponses(rawData) {
  const allRoles = rawData.reduce((roles, record) => {
    const [, roleFormId] = record;
    return roleFormId ? Object.assign({}, roles, { [roleFormId]: record }) : roles;
  }, {});

  return allRoles;
}

/**
* Gets the wristband quotas for each role
* @param {Array[]} rawData - Array of role quota records
* @returns {Object} The wristband quotas keyed on role id
* ```
* {
*   [role id]: [role record],
* }
* ```
* */
export function getRoleQuotas(rawData) {
  const allWristbands = rawData.reduce((wristbands, record) => {
    const [roleId] = record;
    return Object.assign({}, wristbands, { [roleId]: record });
  }, {});

  // Special role
  allWristbands.fnf = ['fnf', 'FnF', 30, 30, 30, '', ''];

  return allWristbands;
}

/* ********************************
* Creators
******************************** */

/**
* Create a role object
* @params {Array} roleRecord - A record of all the information for a role
* @params {Array} formRecord - A record of the names of the role from the form
* @returns {Object} Role object
* */
export function createRole(roleRecord, formRecord) {
  const [timestamp, , rawEarlyNames, rawLateNames, rawLdLiteNames, reporter = '', reporterEmail = ''] = formRecord;
  const [id, name, earlySlots, ldLiteSlots, lateSlots, skipper, ...allEmails] = roleRecord;

  const allEarlyNames = splitNames(rawEarlyNames) || [];
  const earlyNames = earlySlots > 0 ? allEarlyNames.slice(0, earlySlots).sort() : [];
  const extraEarlyNames = earlySlots > 0 ? allEarlyNames.slice(earlySlots) : [];

  const allLateNames = splitNames(rawLateNames) || [];
  const lateNames = lateSlots > 0 ? allLateNames.slice(0, lateSlots).sort() : [];
  const extraLateNames = lateSlots > 0 ? allLateNames.slice(lateSlots) : [];

  const allLdLiteNames = splitNames(rawLdLiteNames) || [];
  const ldLiteNames = ldLiteSlots > 0 ? allLdLiteNames.slice(0, ldLiteSlots).sort() : [];
  const extraLdLiteNames = ldLiteSlots > 0 ? allLdLiteNames.slice(ldLiteSlots) : [];

  const emails = _.compact(allEmails);

  const role = {
    early: {
      extra: extraEarlyNames,
      names: earlyNames,
      slots: earlySlots,
    },
    emails,
    id,
    late: {
      extra: extraLateNames,
      names: lateNames,
      slots: lateSlots,
    },
    ldLite: {
      extra: extraLdLiteNames,
      names: ldLiteNames,
      slots: ldLiteSlots,
    },
    name,
    reporter,
    reporterEmail,
    skipper,
    timestamp,
  };

  return role;
}

/**
* Reorganizes the roles object by name
* @param {Object} roles - All the information about roles keyed by role id
* @param {String[]} omittedRoles - A list of role ids to omit
* @returns {Object} Names object
* */
export function createNames(roles, omittedRoles = []) {
  const names = {};
  Object.keys(_.omit(roles, omittedRoles)).sort().forEach((roleId) => {
    // Add role to each name
    const role = roles[roleId];
    const getEmptyPasses = () => ({ early: [], late: [], ldLite: [] });

    // Go through every early arrival
    const earlyNames = role.early.names;
    earlyNames.forEach((name) => {
      names[name] = names[name] || getEmptyPasses();
      const earlyRoles = names[name].early;
      earlyRoles.push({ role: role.name, slots: 1 });
      names[name].early = _.uniqBy(earlyRoles, 'role');
    });

    // Go through every late departure
    const lateNames = role.late.names;
    lateNames.forEach((name) => {
      names[name] = names[name] || getEmptyPasses();
      const lateRoles = names[name].late;
      const existingRole = _.find(lateRoles, lateRole => lateRole.role === role.name);
      if (existingRole) {
        existingRole.slots += 1;
      } else {
        lateRoles.push({ role: role.name, slots: 1 });
      }
      names[name].late = _.uniqBy(lateRoles, 'role');
    });

    // Go through every ld lite
    const ldLiteNames = role.ldLite.names;
    ldLiteNames.forEach((name) => {
      names[name] = names[name] || getEmptyPasses();
      const ldLiteRoles = names[name].ldLite;
      const existingRole = _.find(ldLiteRoles, ldLiteRole => ldLiteRole.role === role.name);
      if (existingRole) {
        existingRole.slots += 1;
      } else {
        ldLiteRoles.push({ role: role.name, slots: 1 });
      }
      names[name].ldLite = _.uniqBy(ldLiteRoles, 'role');
    });
  });

  return names;
}

/**
* Creates the roles object. Contains all the information. Names and role quotas
* @param {Object} formResponses - Object of form responses keyed on role's form id
* @param {Object} roleQuotas -Object of role quotas keyed on role's role id
* @returns {Object} Complete roles object.
*/
export function createRoles(formResponses, roleQuotas) {
  const roles = {};

  // Cycle through each committee
  _.compact(Object.keys(roleQuotas)).sort().forEach((roleId) => {
    const roleRecord = roleQuotas[roleId];
    const [, formId] = roleRecord;
    const formRecord = formResponses[formId] || [];

    if (!roleRecord) {
      Logger.log('Missing role record: %s', formId);
    }

    roles[roleId] = createRole(roleRecord, formRecord);
  });

  return roles;
}

/**
* Takes an object of payload records and converts them to bulk staff transactions
* @todo Verify if this function is needed. If not, remove.
* @param {Object[]} payloads - An array of payload objects
* @param {Boolean} test - True if the record should be written to the sheet. False otherwise.
* @returns {Object[]} An array of bulk staff transaction objects
*/
// export function createBulkStaffTransactions(payloads, test) {
//   const properties = PropertiesService.getScriptProperties();
//   const sheet = getBulkStaffTransactionSheet();
//   const date = new Date().getTime();

//   const records = _.map(payloads, (payload) => {
//     const record = [
//       date,
//       payload.tid,
//       payload.method,
//       payload.role,
//       payload.type,
//     ].concat(payload.names);

//     return record;
//   });

//   if (!test) {
//     Logger.log(records);
//     records.forEach((record) => {
//       sheet.appendRow(record);
//     });
//     properties.setProperty('LAST_BULK_STAFF_TRANSACTION_CHANGE', new Date().getTime());
//   }

//   return payloads;
// }

/**
* Takes a transaction object and adds it to the spreadsheet
* @todo Verify if this function is needed. Remove otherwise.
* @param {Object} transaction - Prepaid transaction
* @return {Object} A new transaction object with a date attribute
*/
// export function createPrepaidTransaction(transaction) {
//   const properties = PropertiesService.getScriptProperties();
//   const sheet = getRawPrepaidTransactionsData();
//   const date = new Date().getTime();

//   const record = [
//     date,
//     transaction.tid,
//     transaction.name,
//     Number(transaction.early),
//     Number(transaction.late),
//     transaction.email,
//   ];

//   if (!transaction.test) {
//     sheet.appendRow(record);
//     properties.setProperty('LAST_PREPAID_TRANSACTION_CHANGE', new Date().getTime());
//   }

//   return _.assign({}, transaction, { date });
// }

/* ********************************
* FnF
******************************** */

/**
* List of FnF names
* @returns {Array} Array of FnF names
* */
function getFnFNames() {
  return [];
}

/**
* Create a special Names object of fnf names
* @returns {Object} Names object with fnf names
* */
function getFnFNameObj() {
  const names = getFnFNames();
  const earlySlots = names.length;
  const lateSlots = names.length;


  const fnfQuota = ['fnf', 'FnF', 'FnF', earlySlots, lateSlots, 'Yarun', 'yarunl@gmail.com'];
  const fnfFormResponse = [Date(), 'Yarun', 'yarunl@gmail.com', 'FnF', names.join(', '), names.join(', '), 'yarunl@gmail.com'];
  const fnfRole = createRole(fnfQuota, fnfFormResponse);

  const fnfObject = {};
  fnfObject[fnfRole.id] = fnfRole;
  return createNames(fnfObject);
}

/**
* Modifies the original roles object with FnF names
* @param {Object} namesOriginal - Complete roles object
* @returns {Object} new names object with the fnf names
* */
function mergeNames(namesOriginal) {
  const names = _.merge({}, namesOriginal);
  const fnfNames = getFnFNameObj();
  _.forEach(fnfNames, (value, name) => {
    if (names[name]) {
      if (!names[name].early.length) {
        names[name].early = names[name].early.concat(fnfNames[name].early);
      }

      if (!names[name].late.length) {
        names[name].late = names[name].late.concat(fnfNames[name].late);
      }
    } else {
      names[name] = fnfNames[name];
    }
  });
  return names;
}

/* ********************************
* Converters
******************************** */

function getPassLabel(passType) {
  const passLabels = {
    early: 'EA-Crew',
    late: 'Late',
    prepaid: 'Green',
    authorized: 'Purple',
  };

  return passLabels[passType] || 'Unknown';
}

function getNamesRecords(allNames, type) {
  const records = [];

  const names = _.omitBy(allNames, attrs => _.isEmpty(attrs[type]));

  Object.keys(names).forEach((name) => {
    const roles = _.reduce(allNames[name][type], addRole, { roles: [], slots: 0 });
    const record = [name, getPassLabel(type), type === 'early' ? 1 : roles.slots].concat(roles.roles.sort());
    records.push(record);
  });

  return records;
}

/**
* Convert the raw form responses in an organized format
* @param {Object} responses - The latest form response per role keyed on role
* @param {Object} roleQuotas - The quotas allowed per role keyed on role
* */
function convertToParsedFormResponses(responses, roleQuotas) {
  const FORM_ID_INDEX = 1;
  const records = Object.keys(responses).sort().map((formId) => {
    const foundRole = _.find(roleQuotas, roleQuota => roleQuota[FORM_ID_INDEX] === formId);
    const role = createRole(foundRole, responses[formId]);

    return [
      // role.reporter,
      // role.reporterEmail,
      role.name,
      role.early.slots ? role.early.names.concat(role.early.extra).join(', ') : '',
      role.late.slots ? role.late.names.concat(role.late.extra).join(', ') : '',
      // [role.late.email].concat(role.late.extraEmails).join(','),
    ];
  });

  return records;
}

/**
* Convert the raw form responses in an organized format
* @param {Object} responses - The latest form response per role keyed on role
* @param {Object} roleQuotas - The quotas allowed per role keyed on role
* */
function convertToPublicRolesQuotaRecords(roleQuotas) {
  const records = Object.keys(_.omit(roleQuotas, ['fnf'])).sort().map((role) => {
    const [, roleName, earlySlots, ldLiteSlots, lateSlots] = roleQuotas[role];
    return [roleName, earlySlots, ldLiteSlots, lateSlots];
  });

  return records;
}

/**
* Reorganizes the prepaids and roles by the specified type
* @param {Object} prepaids -All the information about all the prepaid transactions
* @param {Object} roles - ALl the information about roles: early, late, names, etc
* @param {String} type - Either 'early' or 'late' or 'ldLite'
* @returns {Array} - A list of all the prepaids and roles by a type (early or late)
* */
function convertToEaldRecords(prepaids, roles, type) {
  const records = [];
  const ealdPrepaids = _.filter(prepaids, prepaid => prepaid[type] > 0);
  const allEaldRoles = _.pickBy(mergeNames(roles), attrs => !_.isEmpty(attrs[type]));

  const normalizedBothNames = bothNames(
    ealdPrepaids.map(prepaid => prepaid.name),
    Object.keys(allEaldRoles),
  );

  const [ealdPrepaidsRoles, ealdPrepaidsOnly] = _.partition(
    ealdPrepaids,
    prepaid => _.includes(normalizedBothNames, normalizeName(prepaid.name)),
  );

  const ealdRolesPrepaids = _.pickBy(
    allEaldRoles,
    (role, name) => _.includes(normalizedBothNames, normalizeName(name)),
  );

  const ealdRolesOnly = _.omitBy(
    allEaldRoles,
    (role, name) => _.includes(normalizedBothNames, normalizeName(name)),
  );

  // Add people who have both a prepaid and a role
  Object.keys(ealdRolesPrepaids).forEach((name) => {
    const prepaid = _.find(
      ealdPrepaidsRoles,
      ealdPrepaidsRole => normalizeName(name) === normalizeName(ealdPrepaidsRole.name),
    );

    const rolesAccum = _.reduce(allEaldRoles[name][type], addRole, { roles: [], slots: 0 });
    const totalSlots = (type === 'early' ? 1 : rolesAccum.slots) + prepaid[type];
    const totalRoles = rolesAccum.roles.concat(['Prepaid']).sort();
    const record = [name, totalSlots].concat(totalRoles);
    records.push(record);
  });

  // Add prepaid records
  ealdPrepaidsOnly.forEach((prepaid) => {
    if (prepaid.name) {
      const record = [prepaid.name, prepaid[type], 'Prepaid'];
      records.push(record);
    }
  });

  // Add role records
  Object.keys(ealdRolesOnly).forEach((name) => {
    const ealdRoles = allEaldRoles[name][type];
    const rolesAccum = _.reduce(ealdRoles, addRole, { roles: [], slots: 0 });

    const record = [name, type === 'early' ? 1 : rolesAccum.slots].concat(rolesAccum.roles.sort());
    records.push(record);
  });

  const sortedRecords = records.sort(sortNames);

  return sortedRecords;
}

/**
* Generates records that combine both Late Departure and LD-Lite
* @param {Object} prepaidTransactions -All the information about all the prepaid transactions
* @param {Object} names - ALl the information about roles: early, late, names, etc
* @returns {Array} - A list of all the records for Late Departure)
* */
function convertToLateDepartureRecords(prepaidTransactions, names) {
  const nameIndex = 0;
  const emptyRecord = ['', 0, ''];

  const ldRecords = convertToEaldRecords(prepaidTransactions, names, 'late');
  const ldLiteRecords = convertToEaldRecords(prepaidTransactions, names, 'ldLite');

  // Build a union of names from both lists
  const allNames = _.map(
    _.unionWith(ldRecords, ldLiteRecords, (a, b) => a[nameIndex] === b[nameIndex]),
    record => record[nameIndex],
  );

  // Build a record that merges both the ldLite and late records
  const allRecords = allNames.sort().reduce((records, name) => {
    const findNamePredicate = record => record[nameIndex] === name;
    const [, ldSlots, ...ldRoles] = _.find(ldRecords, findNamePredicate) || emptyRecord;
    const [, ldLiteSlots, ...ldLiteRoles] = _.find(ldLiteRecords, findNamePredicate) || emptyRecord;

    // Combine all the ldLite and ld roles. Remove duplicates and empty roles. Then sort.
    const allRoles = _.compact(_.union(ldRoles, ldLiteRoles)).sort();

    records.push([name, ldLiteSlots, ldSlots, ...allRoles]);
    return records;
  }, []);


  return allRecords;
}

function convertToNamesRecords(names) {
  let records = [];
  records = records.concat(getNamesRecords(names, 'early'));
  records = records.concat(getNamesRecords(names, 'late'));
  records.sort(sortNames);
  return records;
}

function convertPrepaidToRecords(prepaids) {
  const records = [];
  Object.keys(prepaids).sort().forEach((name) => {
    const prepaid = prepaids[name];
    const record = [prepaid.name, prepaid.early, prepaid.late, prepaid.email];
    records.push(record);
  });

  return records;
}

export function reduceRoleCount(accum, value) {
  return accum + value.early;
}

function convertPrepaidToRoles(prepaids) {
  const summary = _.reduce(prepaids, (memo, value) => {
    // Summarize all the roles
    // Note to self: Use this instead of a for loop

    const nextMemo = Object.assign({}, memo);
    nextMemo.early.slots += value.early;
    nextMemo.late.slots += value.late;
    nextMemo.early.names = nextMemo.early.names.concat(
      _.times(value.early, _.constant(value.name)),
    );
    nextMemo.late.names = nextMemo.late.names.concat(_.times(value.late, _.constant(value.name)));

    return nextMemo;
  }, { early: { slots: 0, names: [] }, late: { slots: 0, names: [] } });

  const prepaidQuota = ['prepaid', 'Prepaid', 'Prepaid', summary.early.slots, summary.late.slots, 'Yarun', 'yarunl@gmail.com'];
  const prepaidFormResponse = [Date(), 'Yarun', 'yarunl@gmail.com', 'Prepaid', summary.early.names.join(', '), summary.late.names.join(', '), 'yarunl@gmail.com'];

  const prepaidRole = createRole(prepaidQuota, prepaidFormResponse);
  const prepaidRoleObj = {};
  prepaidRoleObj[prepaidRole.id] = prepaidRole;
  return prepaidRoleObj;
}

/**
* Convert the entire collection of roles to record format
* @param {Object} - All role information: Early arrival, late departure, who is what role
* @returns {Array} - Array format of the object to be printed to a sheet
* */
function convertToRolesRecords(roles) {
  let roleRecords = [];
  const roleIds = Object.keys(_.omit(roles, ['fnf'])).sort();

  roleIds.forEach((roleId) => {
    const role = roles[roleId];
    roleRecords = roleRecords.concat(createRoleRecords(role.name, role.early.slots, role.early.names, getPassLabel('early')));
    roleRecords = roleRecords.concat(createRoleRecords(role.name, role.late.slots, role.late.names, getPassLabel('late')));
  });
  return roleRecords;
}

/* ********************************
* Writers
******************************** */

function writeParsedFormResponsesSheet(responses, roleQuotas) {
  const sheet = getAdminParsedFormResponsesSheet().clearContents();
  const parsedFormRecords = convertToParsedFormResponses(responses, roleQuotas);
  const headerRecord = [
    ['Role', 'Early names', 'Late names', '', 'Last updated:', Date()],
  ];
  const records = headerRecord.concat(parsedFormRecords);

  // Add the records to the sheet
  records.forEach((record) => {
    sheet.appendRow(record);
  });
}

function writePublicRolesQuotaSheet(roleQuotas) {
  const sheet = getPublicRolesQuotaSheet().clearContents();
  const parsedPublicRoleQuotaRecords = convertToPublicRolesQuotaRecords(roleQuotas);
  const headerRecord = [
    ['Role', getPassLabel('early'), 'LD-Lite', 'Late', '', 'Last updated:', Date()],
  ];
  const records = headerRecord.concat(parsedPublicRoleQuotaRecords);

  // Add the records to the sheet
  records.forEach((record) => {
    sheet.appendRow(record);
  });
}

function writeGateCheckSheet(prepaidTransactions, names) {
  const NAME = 0;
  const EALD_NUM = 1;
  const EALD_TYPE = 2;
  const sheet = getGateGatecheckSheet().clearContents();
  const earlyArrivalRecords = convertToEaldRecords(prepaidTransactions, names, 'early');
  const headerRecord = [
    ['Name', 'Num', 'Type', '', 'Last updated:', Date()],
  ];
  const dataRecords = earlyArrivalRecords.map((record) => {
    const roles = record
      .slice(EALD_TYPE)
      .map(role => (
        role === 'Prepaid'
          ? getPassLabel(role.toLowerCase())
          : getPassLabel('authorized')
      ));
    // Array.fill does not work in GAS and there is no babel polyfill for it
    const checkboxes = _.times(record[EALD_NUM], () => '❑');
    const uniqueRoles = _.uniq(roles);
    return [record[NAME], record[EALD_NUM]].concat(uniqueRoles.join(', ')).concat(checkboxes);
  });
  const records = headerRecord.concat(dataRecords);

  records.forEach((record) => {
    sheet.appendRow(record);
  });
}

function writeGateCheckCrewGuestSheet(prepaidTransactions, names) {
  const COL_NAME = 0;
  const COL_EALD_NUM = 1;
  const COL_EALD_TYPE = 2;
  const sheet = getGateGatecheckSheet().clearContents();
  const earlyArrivalRecords = convertToEaldRecords(prepaidTransactions, names, 'early');
  const headerRecord = [
    ['Name', 'FnF', 'EA-Crew', 'EA-Guest =>', '', 'Last updated:', Date()],
  ];
  const dataRecords = earlyArrivalRecords.map((record) => {
    Logger.log(record);
    const roles = record
      .slice(COL_EALD_TYPE)
      .map(role => (
        role === 'Prepaid'
          ? getPassLabel(role.toLowerCase())
          : getPassLabel('authorized')
      ));
    // Array.fill does not work in GAS and there is no babel polyfill for it

    const wristbandsCount = roles.reduce(
      (accum, role) => {
        const newAccum = { ...accum };
        newAccum[role] = (newAccum[role] || 0) + 1;
        return newAccum;
      },
      {},
    );

    const authorizedPass = wristbandsCount[getPassLabel('authorized')]
      ? getPassLabel('authorized')
      : '';

    const guestPasses = _.times(
      record[COL_EALD_NUM] - (authorizedPass ? 1 : 0),
      () => getPassLabel('prepaid'),
    );

    return [
      record[COL_NAME],
      'Ticket',
      authorizedPass,
    ].concat(guestPasses);
  });

  const records = headerRecord.concat(dataRecords);

  records.forEach((record) => {
    sheet.appendRow(record);
  });
}

function writeLateDeparturePickupSheet(prepaidTransactions, names) {
  const sheet = getAdminLateDepartureSheet().clearContents();
  const lateDepartureRecords = convertToLateDepartureRecords(prepaidTransactions, names);
  const headerRecord = [
    ['', 'Name', 'LD-Lite', 'LD', 'Roles ⇒', '', 'Last updated:', Date()],
  ];
  const dataRecords = lateDepartureRecords.map(record => ['❑', record[0], record[1]].concat(record.slice(2)));
  const records = headerRecord.concat(dataRecords);
  records.forEach((record) => {
    sheet.appendRow(record);
  });
}


function writePrepaidSheet(prepaids) {
  const sheet = getAdminPrepaidSheet().clearContents();
  const headerRecord = [
    ['Name', 'Early', 'Late', 'Email', '', 'Last updated:', Date()],
  ];
  const dataRecords = convertPrepaidToRecords(prepaids);
  const records = headerRecord.concat(dataRecords);
  records.forEach((record) => {
    sheet.appendRow(record);
  });
}

function writeAuthorizedStaffSheet(committees) {
  const sheet = getPublicAuthorizedStaffSheet().clearContents();
  const dataRecords = convertToRolesRecords(committees);

  const headerRecord = [
    ['Role', 'Type', 'Name', '', 'Last updated:', Date()],
  ];

  const records = headerRecord.concat(dataRecords);

  records.forEach((record) => {
    sheet.appendRow(record);
  });

  return sheet;
}

function writeRolesSheet(prepaids, roles) {
  const sheet = getAdminAllPassesSheet().clearContents();
  const prepaidRoles = convertPrepaidToRoles(prepaids);
  const rolesRecords = convertToRolesRecords(roles);
  const prepaidRecords = convertToRolesRecords(prepaidRoles);

  const headerRecord = [
    ['Role', 'Type', 'Name', '', 'Last updated:', Date()],
  ];

  const records = headerRecord.concat(rolesRecords, prepaidRecords);

  records.forEach((record) => {
    sheet.appendRow(record);
  });

  return sheet;
}

function writeEarlyArrivalSheet(prepaidTransactions, names) {
  const sheet = getPublicEarlyArrivalsSheet().clearContents();
  const earlyArrivalRecords = convertToEaldRecords(prepaidTransactions, names, 'early');
  const publicHeaderRecords = [
    ['Early arrival', '', 'Last updated:', Date()],
  ];
  const publicDataRecords = earlyArrivalRecords.map(record => [record[0]]);

  const publicEarlyArrivalRecords = publicHeaderRecords.concat(publicDataRecords);

  publicEarlyArrivalRecords.forEach((record) => {
    sheet.appendRow(record);
  });
}

function writeLateDepartureSheet(prepaidTransactions, names) {
  const sheet = getPublicLateDeparturesSheet().clearContents();
  const lateDepartureRecords = convertToEaldRecords(prepaidTransactions, names, 'late');
  const headerRecords = [
    ['Late departure', '', 'Last updated:', Date()],
  ];
  const dataRecords = lateDepartureRecords.map(record => [record[0]]);

  const records = headerRecords.concat(dataRecords);

  records.forEach((record) => {
    sheet.appendRow(record);
  });
}


function writeStaffSheet(names) {
  const sheet = getAdminStaffListSheet().clearContents();
  const dataRecords = convertToNamesRecords(names);
  const headerRecord = [
    ['Name', 'Type', 'Num', 'Roles ⇒', '', 'Last updated:', Date()],
  ];
  const records = headerRecord.concat(dataRecords);

  records.forEach((record) => {
    sheet.appendRow(record);
  });

  return sheet;
}

/* ********************************
* Processors
******************************** */

export function processFormResponses() {
  const roleQuotas = getRoleQuotas(getRawRolesQuotaData());
  const formResponses = getFormResponses(getRawFormResponsesData());
  const roles = createRoles(formResponses, roleQuotas);
  const allNames = createNames(roles);
  const prepaidTransactions = getPrepaidTransactions(getRawPrepaidTransactionsData());

  writePublicRolesQuotaSheet(roleQuotas);
  writeParsedFormResponsesSheet(formResponses, roleQuotas);
  writeAuthorizedStaffSheet(roles);
  writeEarlyArrivalSheet(prepaidTransactions, allNames);
  writeLateDepartureSheet(prepaidTransactions, allNames);
  writeStaffSheet(createNames(roles, ['fnf']));
  writeGateCheckSheet(prepaidTransactions, allNames);
  writeGateCheckCrewGuestSheet(prepaidTransactions, allNames);
  writeLateDeparturePickupSheet(prepaidTransactions, allNames);
  writeRolesSheet(prepaidTransactions, roles);
}

export function processPrepaidResponses() {
  const roleQuotas = getRoleQuotas(getRawRolesQuotaData());
  const formResponses = getFormResponses(getRawFormResponsesData());
  const roles = createRoles(formResponses, roleQuotas);
  const allNames = createNames(roles);
  const prepaidTransactions = getPrepaidTransactions(getRawPrepaidTransactionsData());

  writePrepaidSheet(prepaidTransactions);
  writeGateCheckSheet(prepaidTransactions, allNames);
  writeGateCheckCrewGuestSheet(prepaidTransactions, allNames);
  writeLateDeparturePickupSheet(prepaidTransactions, allNames);
  writeEarlyArrivalSheet(prepaidTransactions, allNames);
  writeLateDepartureSheet(prepaidTransactions, allNames);
  writeRolesSheet(prepaidTransactions, roles);
}

/* ********************************
* Emails
******************************** */

const templates = {
  greeting: 'Hello,',
  autogenerated: '<i>This email was autogenerated.</i>',
  ealdConfirm: '<b>{{ reporter }}</b> made EA/LD changes to <b>{{ committee }}</b>.',
  onRecord: 'What is on record:',
  recordHeader:
    '<thead style="border-bottom: 3px solid black;"><tr>'
    + '<td style="font-weight: bold; border-bottom: 1px solid black; padding: 5px 10px;">Role</td>'
    + '<td style="font-weight: bold; border-bottom: 1px solid black; padding: 5px 10px;">Type</td>'
    + '<td style="font-weight: bold; border-bottom: 1px solid black; padding: 5px 10px;">Name</td>'
    + '<td style="font-weight: bold; border-bottom: 1px solid black; padding: 5px 10px;">Passes</td>'
    + '</tr></thead>',
  record:
    '<tr>'
    + '<td style="border-bottom: 1px solid black; padding: 5px 10px;">{{ committee }}</td>'
    + '<td style="border-bottom: 1px solid black; padding: 5px 10px;">{{ type }}</td>'
    + '<td style="border-bottom: 1px solid black; padding: 5px 10px;">{{ name }}</td>'
    + '<td style="border-bottom: 1px solid black; padding: 5px 10px;">{{ passes }}</td>'
    + '</tr>',
  quotas: '{{ committee }} has {{ early }} early arrival and {{ late }} late departure passes.',
  questions:
    'Mistake? <a href="https://docs.google.com/forms/d/1Wl1icD6-a3LNgvQaPWKYwHhqKWv9t8S1AFnvmJZ32-c/viewform">Resubmit the names</a>. '
    + 'If you have any questions, please respond to this email.',
  closing: 'See you on the dance floor,',
  links:
    '<hr />More information: '
    + '<a href="https://docs.google.com/document/d/1z-_O8VQFaxyQZYgV3_C0mhxM8omxBhzqWqGwbBuDeL0/edit?usp=sharing">EA/LD Policy</a>, '
    + '<a href="https://docs.google.com/spreadsheets/d/1UMrXHPZbL82wlQlTNDuOtrRJ4sDwKZDiihT2egNJnFw/#gid=0">EA/LD by role</a>, '
    + '<a href="https://docs.google.com/spreadsheets/d/1UMrXHPZbL82wlQlTNDuOtrRJ4sDwKZDiihT2egNJnFw/#gid=1627289332">Authorized staff list</a>, '
    + '<a href="https://docs.google.com/spreadsheets/d/1UMrXHPZbL82wlQlTNDuOtrRJ4sDwKZDiihT2egNJnFw/#gid=523892843">Early arrival list</a>, '
    + '<a href="https://docs.google.com/spreadsheets/d/1UMrXHPZbL82wlQlTNDuOtrRJ4sDwKZDiihT2egNJnFw/#gid=148670578">Late departure list</a>',
  ldconfirm: '<b>{{ reporter }}</b> has put you, <b>{{ name }}</b>, in charge of picking up the <b>{{ numPasses }}x {{ role }}</b> late departure wristbands.',
  ldpickup: 'Late departure wristbands are picked up on Sunday at the Main Lodge from 12p to 4p.',
  ldpasses: 'You have {{ numPasses }} Late Departure passes waiting for you.',
  tooManyNames: '<span style="color: #B37100; font-weight: bold;">Warning</span>: <b>{{ names }}</b> did not get an EA/LD pass because too many names were entered.',
};

function getQuotaHtmlBody(quota) {
  const [, name, earlySlots, ldLiteSlots, lateSlots, skipper] = quota;

  const NEWLINE = '<p />';
  const preamble = templates.greeting + NEWLINE;

  const nPasses = slots => ((parseInt(slots, 10) || 0) === 1 ? 'pass' : 'passes');
  const eaPasses = nPasses(earlySlots);
  const ldPasses = nPasses(lateSlots);
  const ldLitePasses = nPasses(ldLiteSlots);

  const ldLiteCopy = (parseInt(ldLiteSlots, 10) || 0)
    ? `Oh wait, there's more. You also have <b>${ldLiteSlots} LD-Lite ${ldLitePasses}</b>! `
    : '';

  const coordArticle = /[aeiou]/.test((name || '')[0].toLowerCase()) ? 'an' : 'a';
  const body = `You have <b>${earlySlots} EA-crew ${eaPasses} </b> and <b>${lateSlots} Late Departure ${ldPasses}</b>. ${ldLiteCopy}
    There is no need to purchase these passes. They are given to you as part of being ${coordArticle} ${name} Coordinator. `
    + '<p />'
    + 'Please send me the names I should be giving these passes to. '
    + 'For LD passes, you can take all the LD passes as a coordinator and hand them out yourself. Highly recommended and a good power trip, because the volunteers who show up for their shift get a pass. In either case, let me know what you want to do. '
    + '<p />'
    + 'As a Coordinator, you do not automatically get an EA/LD pass. If you want to come Early Arrival or Late Departure, you need to use one of your comped passes. '
    + `If you need more comped passes, please contact your skipper, ${skipper}, and CC me. `
    + 'For any other questions, respond back to this email.'
    + '<p />'
    + 'Happy planning!'
    + '<br />'
    + 'yarun'
    + '<p />'
    // `${templates.links}` +
    // '<p />' +
    + '<i>This email was autogenerated, but a human will respond.</i>';

  return preamble + body;
}

function getQuotaEmailParams(quota) {
  const [, name, , , , , ...allEmails] = quota;

  const subject = `[EA/LD] Your comped EA/LD passes for ${name}`;
  const toEmails = _.compact(allEmails);
  const htmlBody = getQuotaHtmlBody(quota);
  // eslint-disable-next-line no-unused-vars
  const uniqueToEmails = _.union([], toEmails).join(',');

  return {
    // to: uniqueToEmails,
    to: 'yarunl@gmail.com',
    name: 'EA/LD Passes',
    subject,
    htmlBody,
  };
}

/**
* Send an email with how many passes you have for Early Arrival and Late Departure
* @params {Object[]} record - A form record
*   ```
*   const [timestamp,, rawEarlyNames, rawLateNames, reporter = '', reporterEmail = ''] = formRecord;
*   ```
* */
export function sendQuotaEmail() {
  const roleQuotas = getRoleQuotas(getRawRolesQuotaData());

  const blocklist = [
    // Default blocklist
    'fnf',
    '',

    // Already requested

    // No need to email
    'altars',
    'artandartfunding',
    'artgrantartists',
    'availablehands',
    'cabinsandlodging',
    'cafebruxia',
    'carcamping',
    'chilllounge',
    'cleanup',
    'communications',
    'dancefloorchilloutplatform',
    'musiccommittee',
    'skippers',
    'djsigns',
    'eald',
    'externalkitchen',
    'food-coordinators',
    'food-mealleads',
    'gate',
    'hydration',
    'information',
    'karmapatrol',
    'lighting',
    'lostandfound',
    'mainsound',
    'medical',
    'mildew',
    'mist',
    'mold',
    'morninglibations',
    'musiccommittee',
    'parking',
  ];

  const safelist = [
    'djbooth',
    'pooldecorations',
    'poolsidesound',
    'power',
    'recording',
    'schpank',
    'shade',
    'shuttles',
    'signs',
    'sitecoordinators',
    'transportation',
  ];

  const pickedRoleQuotas = _.pickBy(_.pick(roleQuotas, safelist), ((roleQuota) => {
    const [, , , , , , ...allEmails] = roleQuota;
    return _.compact(allEmails).length > 0;
  }));


  _.forEach(_.omit(pickedRoleQuotas, blocklist), (quota) => {
    const emailParams = getQuotaEmailParams(quota);
    Logger.log(emailParams);
    // Always leave this commented as a safety. Uncomment in production.
    // MailApp.sendEmail(emailParams);
  });
}

function getPrepaidHtmlBody(prepaid) {
  const { name, early, late } = prepaid;

  const firstName = name.split(' ')[0] || '';

  const preamble = `Greetings ${firstName}, <p />`;

  const eaPasses = (parseInt(early, 10) || 0) === 1 ? 'pass' : 'passes';
  const ldPasses = (parseInt(late, 10) || 0) === 1 ? 'pass' : 'passes';

  const body = `I'm the Early Arrival / Late Depature (EA/LD) coordinator. I'm confirming you bought <b>${early} Early Arrival ${eaPasses} </b> and <b>${late} Late Departure ${ldPasses}</b>.
    <p />
    ${early ? 'EA passes are picked up at the Gate. If you bought multiple passes for other people, have them mention your name at the Gate. ' : ''}
    ${late ? 'LD passes are picked up by the pool on Sunday between 12pm to 4pm.' : ''}
    <p />
    Please remember to feed yourself during Early Arrival or Late Departure. Any meals that are served are meant for essential staff who are setting up the party or tearing it down.
    <p />
    Happy dancing!
    <br />
    yarun
    <p />
    <i>This email was autogenerated, but a human will respond.</i>`;

  return preamble + body;
}
/*
* [name]: {
*   timestamp: number,
*   tid: string,
*   name: string,
*   early: number,
*   late: number,
*   email: string,
*   status: string
* }
*/
function getPrepaidEmailParams(prepaid) {
  const { email } = prepaid;

  const subject = '[EA/LD] Your prepaid EA/LD passes';
  // const toEmails = _.compact(allEmails);
  const htmlBody = getPrepaidHtmlBody(prepaid);
  // eslint-disable-next-line no-unused-vars
  const uniqueToEmails = _.union([], [email]).join(',');

  return {
    // to: uniqueToEmails,
    to: 'yarunl@gmail.com',
    name: 'EA/LD Passes',
    subject,
    htmlBody,
  };
}

export function sendPrepaidEmail() {
  const prepaids = getPrepaidTransactions(getRawPrepaidTransactionsData());

  const blacklist = [''];
  const safePrepaids = _.omit(prepaids, blacklist);
  const uncontactedPrepaids = _.filter(
    safePrepaids,
    safePrepaid => safePrepaid.status !== 'emailed',
  );

  _.forEach(uncontactedPrepaids, (prepaid) => {
    const emailParams = getPrepaidEmailParams(prepaid);
    Logger.log(emailParams);
    // Disabled on purpose to prevent accidental sending
    // MailApp.sendEmail(emailParams);
  });
}
