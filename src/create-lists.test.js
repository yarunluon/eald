import _ from 'lodash';
// import * as CreateLists from '../dist-test/create-lists';
import * as CreateLists from './create-lists';
import * as GasMocks from './gas-mocks';

import formJson from './fixtures/form-responses.json';
import prepaidJson from './fixtures/prepaid-transactions.json';
import quotasJson from './fixtures/wristband-quotas.json';
import { ROLES } from './fixtures/roles';

beforeAll(() => {
  Object.assign(global, GasMocks, { _ });
});

describe('Spreadsheet management', () => {
  it('gets an admin sheet id', () => {
    expect(typeof CreateLists.getAdminSpreadsheetId()).toEqual('string');
  });

  it('gets a public sheet id', () => {
    expect(typeof CreateLists.getPublicSpreadsheetId()).toEqual('string');
  });

  it('gets a skipper sheet id', () => {
    expect(typeof CreateLists.getSkipperSpreadsheetId()).toEqual('string');
  });

  // Disable test because need to figure out how to substitute variables for testing
  xit('gets a Form Response Sheet id', () => {
    expect(typeof CreateLists.getFormResponseSheetId()).toEqual('number');
  });

  // Disable test because need to figure out how to substitute variables for testing
  xit('gets a sheet', () => {
    const sheetId = GasMocks.SpreadsheetApp.openById('spreadsheetId').getSheets()[0].getSheetId();
    const sheet = CreateLists.getSheet(sheetId, 'spreadsheetId');
    expect(sheet.getSheetId()).toEqual(sheetId);
  });
});

describe('Helper functions', () => {
  it('sorts two strings', () => {
    expect(CreateLists.sortNames('a', 'b')).toBe(-1);
    expect(CreateLists.sortNames('a', 'a')).toBe(0);
    expect(CreateLists.sortNames('b', 'a')).toBe(1);
  });

  it('combines roles', () => {
    const roles = {
      roles: [],
      slots: 0,
    };

    const role = {
      role: 'test role',
      slots: 2,
    };

    const nextRoles = CreateLists.addRole(roles, role);
    expect(nextRoles.roles.includes(role.role)).toBeTruthy();
    expect(nextRoles.slots).toEqual(2);
  });

  it('parses names into an array', () => {
    const nameString = 'Sansa Stark,John Snow,   Tyrion lannister  , ned Stark, ,  ';
    const names = CreateLists.splitNames(nameString);
    expect([
      'Sansa Stark',
      'John Snow',
      'Tyrion Lannister',
      'Ned Stark',
    ]).toEqual(names);
  });

  it('creates records for the roles', () => {
    const role = 'EA/LD';
    const slots = 3;
    const names = ['Ned Stark', 'The Hound'];
    const type = 'Early Arrival';

    const records = CreateLists.createRoleRecords(role, slots, names, type);
    expect([
      ['EA/LD', 'Early Arrival', 'Ned Stark'],
      ['EA/LD', 'Early Arrival', 'The Hound'],
      ['EA/LD', 'Early Arrival', ''],
    ]).toEqual(records);
  });

  it('normalizes a name', () => {
    const { normalizeName } = CreateLists;
    expect(normalizeName('Jon Snow')).toEqual('jonsnow');
  });

  it('finds names in both lists', () => {
    const prepaidNames = ['Jon Snow', 'The mountain'];
    const roleNames = ['jon Snow', 'The Hound'];

    const bothNames = CreateLists.bothNames(prepaidNames, roleNames);
    expect([
      'jonsnow',
    ]).toEqual(bothNames);
  });
});

describe('Spreadsheet Getters', () => {
  it('gets the prepaid transactions', () => {
    const prepaids = CreateLists.getPrepaidTransactions(prepaidJson);

    const prepaid = prepaids['Doran Mortell'];
    expect(prepaid).toHaveProperty('timestamp');
    expect(prepaid).toHaveProperty('tid');
    expect(prepaid).toHaveProperty('name');
    expect(prepaid).toHaveProperty('early');
    expect(prepaid).toHaveProperty('late');
    expect(prepaid).toHaveProperty('email');
  });

  it('gets the form responses', () => {
    const formResponses = CreateLists.getFormResponses(formJson);
    expect(formResponses['EA/LD']).toEqual(formJson[1]);
  });

  it('gets the wristabnd quotas', () => {
    const quotas = CreateLists.getRoleQuotas(quotasJson);
    expect(quotas.eald).toEqual(quotasJson[2]);
    expect(quotas).toHaveProperty('fnf');
  });
});

describe('Creators', () => {
  it('creates a role object', () => {
    const formRecord = _.last(formJson);
    const roleRecord = _.find(quotasJson, (quota) => {
      const [, quotaId] = quota;
      const [, formId] = formRecord;
      return formId === quotaId;
    });
    const [id, name, earlySlots, ldLiteSlots, lateSlots, skipper] = roleRecord;
    const [timestamp,,,,, reporter = '', reporterEmail = ''] = formRecord;

    const role = CreateLists.createRole(roleRecord, formRecord);
    expect(role).toHaveProperty('early');
    expect(role.early.slots).toBe(earlySlots);
    expect(role).toHaveProperty('early.names');
    expect(role).toHaveProperty('early.extra');
    expect(role).toHaveProperty('late');
    expect(role).toHaveProperty('late.names');
    expect(role.late.slots).toBe(lateSlots);
    expect(role).toHaveProperty('late.extra');
    expect(role.ldLite.slots).toBe(ldLiteSlots);
    expect(role).toHaveProperty('ldLite.names');
    expect(role).toHaveProperty('ldLite.extra');
    expect(role).toHaveProperty('emails');
    expect(role.id).toEqual(id);
    expect(role.name).toEqual(name);
    expect(role.reporter).toEqual(reporter);
    expect(role.reporterEmail).toEqual(reporterEmail);
    expect(role.skipper).toEqual(skipper);
    expect(role.timestamp).toEqual(timestamp);
  });

  it('creates a name object', () => {
    const roles = ROLES;
    const names = CreateLists.createNames(roles);

    expect(names.Nella.early.length).toBe(2);
    expect(names['Norbert Vance'].late.length).toBe(2);
  });
});
