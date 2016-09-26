let gulp = require('gulp');
let browserSync = require('browser-sync').create();

let del = require('del');
let plugins = require('gulp-load-plugins')();

let config = {
  devSrc: {
    rocky: 'dev-src/rocky/**/*.js'
  }
};

gulp.task('default', ['build']);

gulp.task('clean', ()=> {
  return del('src/rocky');
});

gulp.task('babelify', ['clean'], ()=> {
  return gulp.src(config.devSrc.rocky)
    .pipe(plugins.babel())
    .pipe(plugins.concat('index.js'))
    .pipe(gulp.dest('src/rocky'));
});

gulp.task('babelify:watch', ['babelify'], function (done) {
  browserSync.reload();
  done();
});

gulp.task('build', ['babelify'], plugins.shell.task('pebble build', {
  verbose: true
}));

gulp.task('install', ['build'], plugins.shell.task('pebble install --emulator chalk', {
  verbose: true
}));




// use default task to launch Browsersync and watch JS files
gulp.task('pemulate', ['babelify'], function () {
  
  // Serve files from the root of this project
  browserSync.init({
    server: {
      files: [config.devSrc.rocky],
      baseDir: './',
      index: 'pemulator.html',
      browser: 'firefox'
    }
  });
  
  // add browserSync.reload to the tasks array to make
  // all browsers reload after tasks are complete.
  gulp.watch(config.devSrc.rocky, ['babelify:watch']);
});