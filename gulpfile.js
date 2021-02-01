'use strict';

// Load plugins
const autoprefixer = require('autoprefixer');
const browsersync = require('browser-sync').create();
const cssnano = require('cssnano');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './',
    },
    port: 3000,
  });
  done();
}

// Compile scss
function styles() {
  return gulp
    .src('scss/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer('last 2 version')]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('css/'))
    .pipe(browsersync.stream());
}

function minStyles() {
  return gulp
    .src(['node_modules/bootstrap/dist/css/bootstrap.min.css', 'css/style.css'], {
      since: gulp.lastRun(minStyles),
    })
    .pipe(plumber())
    .pipe(concat('style.min.css'))
    .pipe(postcss([cssnano()]))
    .pipe(gulp.dest('css/'));
}

// Optimize Images
function minImages() {
  return gulp
    .src('img/**/*')
    .pipe(plumber())
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true,
            },
          ],
        }),
      ]),
    )
    .pipe(gulp.dest('img/'));
}

// minify scripts
function scripts() {
  return gulp
    .src(['js/**/*.js'])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest('js/'))
    .pipe(browsersync.stream());
}

function minScripts() {
  return gulp
    .src(['js/app.js'])
    .pipe(plumber())
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js/'));
}

// Watch files
function watchFiles() {
  gulp.watch('scss/**/*.scss', styles);
  // gulp.watch('js/**/*.js', scripts);
  // gulp.watch('img/**/*', minImages);
  gulp.watch('*.html').on('change', browsersync.reload);
}

// define complex tasks
const style = gulp.series(styles, minStyles);
const js = gulp.series(scripts, minScripts);
const build = gulp.series(
  gulp.parallel(gulp.series(styles, minStyles), gulp.series(scripts, minScripts), minImages),
);
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.style = style;
exports.js = js;
exports.minImages = minImages;
exports.build = build;
exports.watch = watch;
