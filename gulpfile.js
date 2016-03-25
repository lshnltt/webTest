var gulp = require('gulp-param')(require('gulp'), process.argv);
 
  gulp.task('dep', function(debug) {
    console.log(debug); // => true 
  });
 
  gulp.task('build', function(debug, tag) {
    console.log(debug); // => true 
    console.log(tag); // => 'v1.0.0' 
  });