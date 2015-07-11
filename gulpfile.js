var gulp = require('gulp');

// Includes
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rimraf = require('rimraf');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');

var publicDir = 'public/';
var jsDir = publicDir + 'javascripts/*.js';
var cssDir = publicDir + 'stylesheets/*.css';
var distDir = publicDir + 'dist/'

gulp.task('lint', function(){
    return gulp.src(jsDir)
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function(){
    return gulp.src(jsDir)
            .pipe(concat('all.js'))
            .pipe(gulp.dest(distDir))
            .pipe(rename('all.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest(distDir))
});

gulp.task('minify-css', function(){
    return gulp.src(cssDir)
            .pipe(minifyCss({compatibility: 'ie8'}))
            .pipe(gulp.dest(distDir));
});

gulp.task('watch', function(){
    gulp.watch(jsDir, ['lint', 'scripts', 'minify-css']);
});


gulp.task('build', ['lint', 'scripts', 'minify-css'])

gulp.task('default', ['build', 'watch']);

gulp.task('clean', function(cb){
    rimraf(distDir, cb);
});