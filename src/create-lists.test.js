import _ from 'lodash';
import * as CreateLists from './create-lists';
import * as GasMocks from './gas-mocks';

import formJson from './fixtures/form-responses.json';
import prepaidJson from './fixtures/prepaid-transactions.json';
import wristbandJson from './fixtures/wristband-quotas.json';

beforeAll(() => {
  Object.assign(global, GasMocks, { _ });
});

describe('Spreadsheet management', () => {
  it('should get an admin sheet id', () => {
    expect(typeof CreateLists.getAdminSpreadsheetId()).toEqual('string');
  });

  it('should get a public sheet id', () => {
    expect(typeof CreateLists.getPublicSpreadsheetId()).toEqual('string');
  });

  it('should get a skipper sheet id', () => {
    expect(typeof CreateLists.getSkipperSpreadsheetId()).toEqual('string');
  });

  it('should get a sheet', () => {
    const sheetId = GasMocks.SpreadsheetApp.openById('spreadsheetId').getSheets()[0].getSheetId();
    const sheet = CreateLists.getSheet(sheetId, 'spreadsheetId');
    expect(sheet.getSheetId()).toEqual(sheetId);
  });
});

describe('Helper functions', () => {
  it('should sort two strings', () => {
    expect(CreateLists.sortNames('a', 'b')).toBe(-1);
    expect(CreateLists.sortNames('a', 'a')).toBe(0);
    expect(CreateLists.sortNames('b', 'a')).toBe(1);
  });

  it('should combine roles', () => {
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

  it('should parse names into an array', () => {
    const nameString = 'Sansa Stark,John Snow,   Tyrion lannister  , ned Stark, ,  ';
    const names = CreateLists.splitNames(nameString);
    expect([
      'Sansa Stark',
      'John Snow',
      'Tyrion Lannister',
      'Ned Stark',
    ]).toEqual(names);
  });

  it('should create records for the roles', () => {
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

  it('should normalize a name', () => {
    const { normalizeName } = CreateLists;
    expect(normalizeName('Jon Snow')).toEqual('jonsnow');
  });

  it('should find names in both lists', () => {
    const prepaidNames = ['Jon Snow', 'The mountain'];
    const roleNames = ['jon Snow', 'The Hound'];

    const bothNames = CreateLists.bothNames(prepaidNames, roleNames);
    expect([
      'jonsnow',
    ]).toEqual(bothNames);
  });
});

describe('Spreadsheet Getters', () => {
  it('should get the prepaid transactions', () => {
    const prepaids = CreateLists.getPrepaidTransactions(prepaidJson);

    const prepaid = prepaids['Doran Mortell'];
    expect(prepaid).toHaveProperty('timestamp');
    expect(prepaid).toHaveProperty('tid');
    expect(prepaid).toHaveProperty('name');
    expect(prepaid).toHaveProperty('early');
    expect(prepaid).toHaveProperty('late');
    expect(prepaid).toHaveProperty('email');
  });

  it('should get the form responses', () => {
    const formResponses = CreateLists.getFormResponses(formJson);
    expect(formResponses['EA/LD']).toEqual(formJson[1]);
  });

  it('should get the wristabnd quotas', () => {
    const wristbands = CreateLists.getRoleQuotas(wristbandJson);
    expect(wristbands.eald).toEqual(wristbandJson[2]);
  });
});
