require('dotenv').config();
const babel = require('gulp-babel');
const babelObjectAssign = require('babel-plugin-transform-object-assign');
const babelSpreadOperator = require('babel-plugin-transform-object-rest-spread');
const gulp = require('gulp');
const replace = require('gulp-replace');

gulp.task('default', done => {
  gulp.src(['src/*.js', '!src/*.test.js', '!src/*-mocks.js'])
    // Exported functions confuse GAS. Convert to normal functions
    .pipe(replace('export ', ''))

    // Expand dotenv variables to their actual values
    .pipe(replace('process.env.ADMIN_SPREADSHEET_ID', process.env.ADMIN_SPREADSHEET_ID))
    .pipe(replace('process.env.FORM_ID', process.env.FORM_ID))
    .pipe(replace('process.env.GATE_SPREADSHEET_ID', process.env.GATE_SPREADSHEET_ID))
    .pipe(replace('process.env.PUBLIC_SPREADSHEET_ID', process.env.PUBLIC_SPREADSHEET_ID))
    .pipe(replace('process.env.RAW_DATA_SPREADSHEET_ID', process.env.RAW_DATA_SPREADSHEET_ID))
    .pipe(replace('process.env.SKIPPER_SPREADSHEET_ID', process.env.SKIPPER_SPREADSHEET_ID))

    // Sheet ids
    .pipe(replace('process.env.RAW_FORM_RESPONSE_SHEET_ID', process.env.RAW_FORM_RESPONSE_SHEET_ID))
    .pipe(replace('process.env.RAW_PREPAID_TRANSACTIONS_SHEET_ID', process.env.RAW_PREPAID_TRANSACTIONS_SHEET_ID))
    .pipe(replace('process.env.PUBLIC_ROLES_QUOTA_SHEET_ID', process.env.PUBLIC_ROLES_QUOTA_SHEET_ID))
    .pipe(replace('process.env.RAW_ROLES_QUOTA', process.env.RAW_ROLES_QUOTA))
    .pipe(replace('process.env.ADMIN_PARSED_FORM_RESPONSES_SHEET_ID', process.env.ADMIN_PARSED_FORM_RESPONSES_SHEET_ID))
    .pipe(replace('process.env.ADMIN_ALL_PASSES_SHEET_ID', process.env.ADMIN_ALL_PASSES_SHEET_ID))
    .pipe(replace('process.env.ADMIN_STAFF_LIST_SHEET_ID', process.env.ADMIN_STAFF_LIST_SHEET_ID))
    .pipe(replace('process.env.ADMIN_PREPAID_SHEET_ID', process.env.ADMIN_PREPAID_SHEET_ID))
    .pipe(replace('process.env.GATE_GATECHECK_SHEET_ID', process.env.GATE_GATECHECK_SHEET_ID))
    .pipe(replace('process.env.ADMIN_LATE_DEPARTURES_SHEET_ID', process.env.ADMIN_LATE_DEPARTURES_SHEET_ID))
    .pipe(replace('process.env.PUBLIC_EARLY_ARRIVALS_SHEET_ID', process.env.PUBLIC_EARLY_ARRIVALS_SHEET_ID))
    .pipe(replace('process.env.PUBLIC_LATE_DEPARTURES_SHEET_ID', process.env.PUBLIC_LATE_DEPARTURES_SHEET_ID))
    .pipe(replace('process.env.PUBLIC_AUTHORIZED_STAFF_SHEET_ID', process.env.PUBLIC_AUTHORIZED_STAFF_SHEET_ID))
    .pipe(replace('process.env.BULK_STAFF_TRANSACTION_SHEET_ID', process.env.BULK_STAFF_TRANSACTION_SHEET_ID))
    .pipe(replace('process.env.SKIPPER_SHEET_ID', process.env.SKIPPER_SHEET_ID))

    // Transpile
    .pipe(babel({
      plugins: [babelObjectAssign, babelSpreadOperator],
      presets: ['env'],
    }))
    .pipe(gulp.dest('dist'));

  gulp.src('vendor/**')
    .pipe(gulp.dest('dist'));

  done();
});

/*
// Need to build the test files to test environment variables (maybe a bad idea?)
gulp.task('test-build', () => {
  gulp.src(['src/*.js', '!src/*.test.js', '!src/*-mocks.js', '!src/vendor/**'])
    // Expand dotenv variables to their actual values
    .pipe(replace('process.env.ADMIN_SPREADSHEET_ID', process.env.ADMIN_SPREADSHEET_ID))
    .pipe(replace('process.env.FORM_ID', process.env.FORM_ID))
    .pipe(replace('process.env.PUBLIC_SPREADSHEET_ID', process.env.PUBLIC_SPREADSHEET_ID))
    .pipe(replace('process.env.RAW_DATA_SPREADSHEET_ID', process.env.RAW_DATA_SPREADSHEET_ID))
    .pipe(replace('process.env.SKIPPER_SPREADSHEET_ID', process.env.SKIPPER_SPREADSHEET_ID))

    // Sheet ids
    .pipe(replace('process.env.RAW_FORM_RESPONSE_SHEET_ID', process.env.RAW_FORM_RESPONSE_SHEET_ID))
    .pipe(replace('process.env.RAW_PREPAID_TRANSACTIONS_SHEET_ID', process.env.RAW_PREPAID_TRANSACTIONS_SHEET_ID))
    .pipe(replace('process.env.PUBLIC_ROLES_QUOTA_SHEET_ID', process.env.PUBLIC_ROLES_QUOTA_SHEET_ID))
    .pipe(replace('process.env.RAW_ROLES_QUOTA', process.env.RAW_ROLES_QUOTA))
    .pipe(replace('process.env.ADMIN_PARSED_FORM_RESPONSES_SHEET_ID', process.env.ADMIN_PARSED_FORM_RESPONSES_SHEET_ID))
    .pipe(replace('process.env.ADMIN_ALL_PASSES_SHEET_ID', process.env.ADMIN_ALL_PASSES_SHEET_ID))
    .pipe(replace('process.env.ADMIN_STAFF_LIST_SHEET_ID', process.env.ADMIN_STAFF_LIST_SHEET_ID))
    .pipe(replace('process.env.ADMIN_PREPAID_SHEET_ID', process.env.ADMIN_PREPAID_SHEET_ID))
    .pipe(replace('process.env.GATE_GATECHECK_SHEET_ID', process.env.GATE_GATECHECK_SHEET_ID))
    .pipe(replace('process.env.ADMIN_LATE_DEPARTURES_SHEET_ID', process.env.ADMIN_LATE_DEPARTURES_SHEET_ID))
    .pipe(replace('process.env.PUBLIC_EARLY_ARRIVALS_SHEET_ID', process.env.PUBLIC_EARLY_ARRIVALS_SHEET_ID))
    .pipe(replace('process.env.PUBLIC_LATE_DEPARTURES_SHEET_ID', process.env.PUBLIC_LATE_DEPARTURES_SHEET_ID))
    .pipe(replace('process.env.PUBLIC_AUTHORIZED_STAFF_SHEET_ID', process.env.PUBLIC_AUTHORIZED_STAFF_SHEET_ID))
    .pipe(replace('process.env.BULK_STAFF_TRANSACTION_SHEET_ID', process.env.BULK_STAFF_TRANSACTION_SHEET_ID))
    .pipe(replace('process.env.SKIPPER_SHEET_ID', process.env.SKIPPER_SHEET_ID))

    .pipe(gulp.dest('dist-test'));
});
*/

