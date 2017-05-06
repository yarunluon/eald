import _ from 'lodash';
import * as CreateLists from './create-lists';

beforeAll(() => {
  global._ = _;
  global.SpreadsheetApp = {
    openById: () => ({
      getSheets: () => ([
        { getSheetId: jest.fn().mockReturnValue('sheetId') },
      ]),
    }),
  };
});

describe('Spreadsheet management', () => {
  it('should get an admin sheet id', () => {
    expect(typeof CreateLists.getAdminSheetId()).toEqual('string');
  });

  it('should get a public sheet id', () => {
    expect(typeof CreateLists.getPublicSheetId()).toEqual('string');
  });

  it('should get a skipper sheet id', () => {
    expect(typeof CreateLists.getSkipperSheetId()).toEqual('string');
  });

  it('should get a sheet', () => {
    const sheetId = SpreadsheetApp.openById('spreadsheetId').getSheets()[0].getSheetId();
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

    const nextRoles = CreateLists.reduceRoles(roles, role);
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
    ]).toEqual(expect.arrayContaining(names));
  });
});
