export const SpreadsheetApp = {
  openById: jest.fn().mockReturnValue({
    getSheets: jest.fn().mockReturnValue([
      { getSheetId: jest.fn().mockReturnValue('sheetId') },
    ]),
  }),
};

export const Sheet = jest.fn(sheetJson => ({
  getDataRange: () => ({
    getNumRows: jest.fn().mockReturnValue(sheetJson.length),
    getNumColumns: jest.fn().mockReturnValue(sheetJson[0].length),
  }),
  getSheetValues: jest.fn((startRow, startCol, numRows, numCol) => {
    const rows = sheetJson.slice(startRow - 1, startRow + numRows);
    const records = rows.map(row => row.slice(startCol - 1, startCol + numCol));
    return records;
  }),
}));
