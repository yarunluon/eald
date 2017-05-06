/* ********************************
* Get Spreadsheets
*********************************/
export function getAdminSheetId() {
  return 'process.env.ADMIN_SPREADSHEET_ID';
}

export function getPublicSheetId() {
  return 'process.env.PUBLIC_SPREADSHEET_ID';
}

export function getSkipperSheetId() {
  return 'process.env.SKIPPER_SPREADSHEET_ID';
}

/**
* Get the specific sheet within the spreadsheet
* @param {Number} sheetId - The sheet id within the spreadsheet
* @param {String} spreadsheetId - The spreadsheet id that contains the desired sheet
* @returns {Sheet} - The desired sheet
**/
export function getSheet(sheetId, spreadsheetId) {
  // Cannot reference script by 'ActiveSheet', because of doPost()
  const sheets = SpreadsheetApp.openById(spreadsheetId).getSheets();
  return _.find(sheets, sheet => sheet.getSheetId() === sheetId);
}

function getFormResponsesSheet() {
  return getSheet(1179034234, getAdminSheetId());
}

function getParsedFormResonsesSheet() {
  return getSheet(1532955100, getAdminSheetId());
}

function getRolesSheet() {
  return getSheet(1925990317, getAdminSheetId());
}

function getNamesSheet() {
  return getSheet(8.75854503E8, getAdminSheetId());
}

function getPrepaidTransactionSheet() {
  return getSheet(9.73336414E8, getAdminSheetId());
}

function getPrepaidSheet() {
  return getSheet(8.4040037E7, getAdminSheetId());
}

function getGateCheckSheet() {
  return getSheet(2.063889254E9, getAdminSheetId());
}

function getLateDepartureSheet() {
  return getSheet(3.73855201E8, getAdminSheetId());
}

function getPublicEarlyArrivalSheet() {
  return getSheet(5.23892843E8, getPublicSheetId());
}

function getPublicLateDepartureSheet() {
  return getSheet(1.48670578E8, getPublicSheetId());
}

function getAuthorizedStaffSheet() {
  return getSheet(1.627289332E9, getPublicSheetId());
}

function getWristbandsByRoleSheet() {
  return getSheet(0.0, getPublicSheetId());
}

function getBulkStaffTransactionSheet() {
  return getSheet(1073259260, getAdminSheetId());
}

export function getGorelickSummaryRole() {
  return getSheet(1.69092133E8, getSkipperSheetId());
}

/* ********************************
* Helpers
*********************************/

/**
* Add roles and the total number of slots
* @param {Object} accum - Target object
* @param {Object} role - Used to add to target object
* @return {Object} - Resultant object
**/
export function reduceRoles(accum, role) {
  const nextAccum = Object.assign({}, accum);
  nextAccum.roles.push(role.role);
  // Used for late departure
  nextAccum.slots += role.slots;
  return nextAccum;
}

/**
* Sorts records on the first element: name
* @param {Array} a - Array of items
* @param {Array} b - Another array of items
* @param {Number} - -1 if a is first, 0 if a and b are equal, 1 if b is before a
**/
export function sortNames(a, b) {
  const name1 = a[0];
  const name2 = b[0];
  return name1.localeCompare(name2);
}

/**
* Takes a string of names and converts to an array of names. Handles comma and new line delimited
* @param {String} names - A comma- or newline-separated list of names
* @return {String[]} - An array of names that are Capital Cased
**/
export function splitNames(names) {
  const parseableNames = names || '';

  // Separate by delimiter
  let nameParts = parseableNames.split('\n');
  if (nameParts.length === 1) {
    // names might be comma-separated
    nameParts = parseableNames.split(',');
  }

  const prettyNames = nameParts.map(fullname =>
    // Separate by name parts
    String(fullname).trim().split(' ').map(name =>
      // Capitalize first letter
      name.slice(0, 1).toUpperCase() + name.slice(1),
    )
    // Recombine name parts
    .join(' '),
  );

  return _.compact(prettyNames);
}

/**
* Create an array of records for a specific role
* @param {string} role - Name of role
* @param {number} slots - How many records
* @param {string[]} names - Names of people to fill each role
* @param {string} type - Type of role. Early or Late
* @returns {array} Record with the following items
*    ```[ role name, role type, name of person]```
**/
function createRoleRecords(role, slots, names, type) {
  const records = _.times(slots, (number) => {
    const name = names.length > number ? names[number] : '';
    const record = [role, type, name];
    return record;
  });

  return records;
}

/**
* Removes spaces and lowercases names to remove opinions about how to write a name
* @param {string} - name of person
* @return {string} - Name of person in all lowercase with spaces removed
**/
function normalizeName(name) {
  return name.toLowerCase().replace(' ', '');
}

/**
* Returns a list of names that have both prepaid and are volunteering
* @param {string[]} prepaidNames - An array of names that have prepaid
* @param {string[]} roleNames - An array of names that have volunteered
* @returns {string[]} - An array of names that have both prepaid and are volunteering
**/
function bothNames(prepaidNames, roleNames) {
  const normalizedRoleNames = roleNames.map(normalizeName);
  const normalizedPrepaidNames = prepaidNames.map(normalizeName);

  const names = _.intersection(normalizedPrepaidNames, normalizedRoleNames);
  return names;
}

/* ********************************
* Getters
*********************************/

/**
*
* @returns {Object} An object keyed by name
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
**/
function getPrepaidTransactions() {
  const sheet = getPrepaidTransactionSheet();
  const DATA_START_ROW = 1;
  const range = sheet.getDataRange();
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();
  const tids = {};
  const prepaids = {};

  _.forEach(_.range(DATA_START_ROW, numRows + 1), (number) => {
    const formRecord = sheet.getSheetValues(number, 1, 1, numCols)[0];
    // var [timestamp, tid, name, early, late, email] = formRecord;
    const [name, email, tid, early, late, timestamp] = formRecord;
    const recordObj = {
      timestamp,
      tid,
      name,
      early,
      late,
      email,
    };
    tids[tid] = recordObj;
  });

  Object.keys(tids).forEach((tid) => {
    const prepaid = tids[tid];
    const existingRecord = prepaids[prepaid.name];

    if (!_.isEmpty(existingRecord)) {
      // Combining the different transactions by the same person
      prepaid.early += existingRecord.early;
      prepaid.late += existingRecord.late;
    }
    prepaids[prepaid.name] = prepaid;
  });

  return prepaids;
}

/**
* Converts the raw form responses into an object
* @returns {Object} The latest form response keyed by form id of the role
**/
function getFormResponses() {
  const formResponsesSheet = getFormResponsesSheet();
  const DATA_START_ROW = 2;
  const range = formResponsesSheet.getDataRange();
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();
  const roles = {};

  _.forEach(_.range(DATA_START_ROW, numRows + 1), (number) => {
    const formRecord = _.compact(formResponsesSheet.getSheetValues(number, 1, 1, numCols)[0]);
    const [, role] = formRecord;
    if (role) {
      roles[role] = formRecord;
    }
  });

  return roles;
}

function getRoleQuotas() {
  const sheet = getWristbandsByRoleSheet();
  const roleWristbandMap = {};
  const range = sheet.getDataRange();
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();
  const values = sheet.getSheetValues(3, 1, numRows, numCols);

  values.forEach((record) => {
    const [id] = record;
    roleWristbandMap[id] = record;
  });

  // Special role
  roleWristbandMap.fnf = ['fnf', 'FnF', 'FnF', 50, 50, '', ''];

  return roleWristbandMap;
}

/* ********************************
* Creators
*********************************/

/**
* Create a role object
* @params {Array} roleRecord - A record of all the information for a role
* @params {Array} formRecord - A record of the names of the role from the form
* @returns {Object} Role object
**/
function createRole(roleRecord, formRecord) {
  const [timestamp] = formRecord;
  const [id, formId, name, earlySlots, lateSlots, skipper] = roleRecord;
  const earlyIndex = 2;
  const lateIndex = 3;
  const EMAIL_START_INDEX = 6;

  const earlyNamesPool = splitNames(formRecord[earlyIndex]) || [];
  const earlyNames = earlySlots ? earlyNamesPool.slice(0, earlySlots).sort() : [];
  const extraEarlyNames = earlySlots ? earlyNamesPool.slice(earlySlots) : [];

  const lateNamesPool = splitNames(formRecord[lateIndex]) || [];
  const lateNames = lateSlots ? lateNamesPool.slice(0, lateSlots).sort() : [];

  const extraLateNames = lateSlots ? lateNamesPool.slice(lateSlots) : [];
  const emails = _.compact(roleRecord.slice(EMAIL_START_INDEX));

  const role = {
    early: {
      slots: earlySlots,
      names: earlyNames,
      extra: extraEarlyNames,
    },
    late: {
      names: lateNames,
      slots: lateSlots,
      extraNames: extraLateNames,
    },
    emails,
    formId,
    id,
    name,
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
**/
function createNames(roles, omittedRoles = []) {
  const names = {};
  Object.keys(_.omit(roles, omittedRoles)).sort().forEach((roleId) => {
    // Add role to each name
    const role = roles[roleId];
    const earlyNames = role.early.names;
    earlyNames.forEach((name) => {
      names[name] = names[name] || { early: [], late: [] };
      const earlyRoles = names[name].early;
      earlyRoles.push({ role: role.name, slots: 1 });
      names[name].early = _.uniqBy(earlyRoles, 'role');
    });

    const lateNames = role.late.names;
    lateNames.forEach((name) => {
      names[name] = names[name] || { early: [], late: [] };
      const lateRoles = names[name].late;
      const existingRole = _.find(lateRoles, lateRole => lateRole.role === role.name);
      if (existingRole) {
        existingRole.slots += 1;
      } else {
        lateRoles.push({ role: role.name, slots: 1 });
      }
      names[name].late = _.uniqBy(lateRoles, 'role');
    });
  });

  return names;
}

function createRoles(formResponses, roleQuotas) {
  const roles = {};

  // Cycle through each committee
  _.compact(Object.keys(roleQuotas)).sort().forEach((roleId) => {
    const roleRecord = roleQuotas[roleId];
    const [id, formId] = roleRecord;
    const formRecord = formResponses[formId] || [];

    if (!roleRecord) {
      Logger.log('Missing role record: %s', formId);
    }

    roles[id] = createRole(roleRecord, formRecord);
  });

  return roles;
}

export function createBulkStaffTransactions(payloads, test) {
  const properties = PropertiesService.getScriptProperties();
  const sheet = getBulkStaffTransactionSheet();
  const date = new Date().getTime();

  const records = _.map(payloads, (payload) => {
    const record = [
      date,
      payload.tid,
      payload.method,
      payload.role,
      payload.type,
    ].concat(payload.names);

    return record;
  });

  if (!test) {
    Logger.log(records);
    records.forEach((record) => {
      sheet.appendRow(record);
    });
    properties.setProperty('LAST_BULK_STAFF_TRANSACTION_CHANGE', new Date().getTime());
  }

  return payloads;
}

export function createPrepaidTransaction(transaction) {
  const properties = PropertiesService.getScriptProperties();
  const sheet = getPrepaidTransactionSheet();
  const date = new Date().getTime();

  const record = [
    date,
    transaction.tid,
    transaction.name,
    Number(transaction.early),
    Number(transaction.late),
    transaction.email,
  ];

  if (!transaction.test) {
    sheet.appendRow(record);
    properties.setProperty('LAST_PREPAID_TRANSACTION_CHANGE', new Date().getTime());
  }

  return _.assign({}, transaction, { date });
}

/* ********************************
* FnF
*********************************/

function getFnFNames() {
  return [];
}

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
*********************************/

function getNamesRecords(allNames, type) {
  const records = [];

  const names = _.omitBy(allNames, attrs => _.isEmpty(attrs[type]));

  Object.keys(names).forEach((name) => {
    const roles = _.reduce(allNames[name][type], reduceRoles, { roles: [], slots: 0 });
    const record = [name, _.upperFirst(type), type === 'early' ? 1 : roles.slots].concat(roles.roles.sort());
    records.push(record);
  });

  return records;
}

/**
* Convert the raw form responses in an organized format
* @param {Object} responses - The latest form response per role keyed on role
* @param {Object} roleQuotas - The quotas allowed per role keyed on role
**/
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
      role.late.slots ? role.late.names.concat(role.late.extraNames).join(', ') : '',
      //[role.late.email].concat(role.late.extraEmails).join(','),
    ];
  });

  return records;
}

/**
* Reorganizes the prepaids and roles by the specified type
* @param {Object} prepaids -All the information about all the prepaid transactions
* @param {Object} roles - ALl the information about roles: early, late, names, etc
* @param {String} type - Either 'early' or 'late'
* @returns {Array} - A list of all the prepaids and roles by a type (early or late)
**/
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

    const rolesAccum = _.reduce(allEaldRoles[name][type], reduceRoles, { roles: [], slots: 0 });
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
    const rolesAccum = _.reduce(ealdRoles, reduceRoles, { roles: [], slots: 0 });

    const record = [name, type === 'early' ? 1 : rolesAccum.slots].concat(rolesAccum.roles.sort());
    records.push(record);
  });

  const sortedRecords = records.sort(sortNames);

  return sortedRecords;
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
    nextMemo.early.names =
      nextMemo.early.names.concat(_.times(value.early, _.constant(value.name)));
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
**/
function convertToRolesRecords(roles) {
  let roleRecords = [];
  const roleIds = Object.keys(_.omit(roles, ['fnf'])).sort();

  roleIds.forEach((roleId) => {
    const role = roles[roleId];
    roleRecords = roleRecords.concat(createRoleRecords(role.name, role.early.slots, role.early.names, 'Early'));
    roleRecords = roleRecords.concat(createRoleRecords(role.name, role.late.slots, role.late.names, 'Late'));
  });
  return roleRecords;
}

/* ********************************
* Writers
*********************************/

function writeParsedFormResponsesSheet(responses, roleQuotas) {
  const sheet = getParsedFormResonsesSheet().clearContents();
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

function writeGateCheckSheet(prepaidTransactions, names) {
  const NAME = 0;
  const EALD_NUM = 1;
  const EALD_TYPE = 2;
  const sheet = getGateCheckSheet().clearContents();
  const earlyArrivalRecords = convertToEaldRecords(prepaidTransactions, names, 'early');
  const headerRecord = [
    ['', 'Name', 'Num', 'Type', '', 'Last updated:', Date()],
  ];
  const dataRecords = earlyArrivalRecords.map((record) => {
    const roles = record.slice(EALD_TYPE).map(role => (role === 'Prepaid' ? role : 'Authorized'));
    return ['❑', record[NAME], record[EALD_NUM]].concat(roles);
  });
  const records = headerRecord.concat(dataRecords);

  records.forEach((record) => {
    sheet.appendRow(record);
  });
}

function writeLateDeparturePickupSheet(prepaidTransactions, names) {
  const sheet = getLateDepartureSheet().clearContents();
  const lateDepartureRecords = convertToEaldRecords(prepaidTransactions, names, 'late');
  const headerRecord = [
    ['', 'Name', 'Num', 'Roles ⇒', '', 'Last updated:', Date()],
  ];
  const dataRecords = lateDepartureRecords.map(record => ['❑', record[0], record[1]].concat(record.slice(2)));
  const records = headerRecord.concat(dataRecords);
  records.forEach((record) => {
    sheet.appendRow(record);
  });
}


function writePrepaidSheet(prepaids) {
  const sheet = getPrepaidSheet().clearContents();
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
  const sheet = getAuthorizedStaffSheet().clearContents();
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
  const sheet = getRolesSheet().clearContents();
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
  const sheet = getPublicEarlyArrivalSheet().clearContents();
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
  const sheet = getPublicLateDepartureSheet().clearContents();
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
  const sheet = getNamesSheet().clearContents();
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
*********************************/

export function processFormResponses() {
  const roleQuotas = getRoleQuotas();
  const formResponses = getFormResponses();
  const roles = createRoles(formResponses, roleQuotas);
  const allNames = createNames(roles);
  const prepaidTransactions = getPrepaidTransactions();


  writeParsedFormResponsesSheet(formResponses, roleQuotas);
  writeAuthorizedStaffSheet(roles);
  writeEarlyArrivalSheet(prepaidTransactions, allNames);
  writeLateDepartureSheet(prepaidTransactions, allNames);
  writeStaffSheet(createNames(roles, ['fnf']));
  writeGateCheckSheet(prepaidTransactions, allNames);
  writeLateDeparturePickupSheet(prepaidTransactions, allNames);
  writeRolesSheet(prepaidTransactions, roles);
}

export function processPrepaidResponses() {
  const roleQuotas = getRoleQuotas();
  const formResponses = getFormResponses();
  const roles = createRoles(formResponses, roleQuotas);
  const allNames = createNames(roles);
  const prepaidTransactions = getPrepaidTransactions();

  writePrepaidSheet(prepaidTransactions);
  writeGateCheckSheet(prepaidTransactions, allNames);
  writeLateDeparturePickupSheet(prepaidTransactions, allNames);
  writeEarlyArrivalSheet(prepaidTransactions, allNames);
  writeLateDepartureSheet(prepaidTransactions, allNames);
  writeRolesSheet(prepaidTransactions, roles);
}
