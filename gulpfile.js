require('dotenv').config();
const babel = require('gulp-babel');
const babelObjectAssign = require('babel-plugin-transform-object-assign');
const gulp = require('gulp');
const replace = require('gulp-replace');

gulp.task('default', () => {
  gulp.src('src/**')
    // Exported functions confuse GAS. Convert to normal functions
    .pipe(replace('export ', ''))

    // Expand dotenv variables to their actual values
    .pipe(replace('process.env.ADMIN_SHEET_ID', process.env.ADMIN_SHEET_ID))
    .pipe(replace('process.env.FORM_ID', process.env.FORM_ID))
    .pipe(replace('process.env.PUBLIC_SHEET_ID', process.env.PUBLIC_SHEET_ID))
    .pipe(replace('process.env.SKIPPER_SHEET_ID', process.env.SKIPPER_SHEET_ID))
    .pipe(babel({
      presets: ['env'],
      plugins: [babelObjectAssign],
    }))
    .pipe(gulp.dest('dist'));
  gulp.src('vendor/**')
    .pipe(gulp.dest('dist'));
});
