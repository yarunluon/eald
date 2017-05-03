import * as CreateLists from './create-lists';

it('should get an admin sheet id', () => {
  expect(CreateLists.getAdminSheetId()).toBeTruthy();
});

it('should get a public sheet id', () => {
  expect(CreateLists.getPublicSheetId()).toBeTruthy();
});

it('should sort two strings', () => {
  expect(CreateLists.sortNames('a', 'b')).toBe(-1);
  expect(CreateLists.sortNames('a', 'a')).toBe(0);
  expect(CreateLists.sortNames('b', 'a')).toBe(1);
});
