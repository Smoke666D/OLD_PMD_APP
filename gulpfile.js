'use strict';
/*----------------------------------------------------------------------------*/
import gulp       from 'gulp';
import cssMinify  from 'gulp-css-minify';
import concat     from 'gulp-concat';
import babel      from 'gulp-babel';
import uglify     from 'gulp-uglify';
import jsValidate from 'gulp-jsvalidate';
import jsonMinify from 'gulp-json-minify';
import htmlmin    from 'gulp-htmlmin';
import clean      from 'gulp-clean';
//import sass       from 'gulp-sass' )( require( 'sass' ) );
//import pug        from 'gulp-pug';
//import urlBuilder from 'gulp-url-builder';
/*----------------------------------------------------------------------------*/
const src     = '';
const modules = './node_modules/';
const dist    = 'dist/';
/*----------------------------------------------------------------------------*/
const jsSrc      = src  + 'js/**/*.js';
const jsDest     = dist + 'js/';
const cssSrc     = src  + 'css/**/*.css';
const cssDest    = dist + 'css/';
const jsonSrc    = src  + 'json/**/*.json'; 
const jsonDest   = dist + 'json/';
const imgSrc     = src  + 'img/**';
const imgDest    = dist + 'img/';
const htmlSrc    = src  + 'html/**/*.html';
const htmlDest   = dist + 'html/';
const indexSrc   = src  + 'index.html';
const indexDest  = dist + '';
/*----------------------------------------------------------------------------*/
const htmlminAtr = {
  collapseWhitespace: true,
  removeComments: true
};
/*----------------------------------------------------------------------------*/
gulp.task( 'clean', () => {
  gulp.src( dist, { read: false } )
    .pipe( clean( {force: true} ) ); 
});
gulp.task( 'styles', () => {
  return gulp.src( [
      cssSrc,
      ( modules + '@fortawesome/fontawesome-free/css/fontawesome.css' ),
      ( modules + '@fortawesome/fontawesome-free/css/brands.css' ),
      ( modules + '@fortawesome/fontawesome-free/css/solid.css' )
    ])
      .pipe( concat( 'style.min.css' ) )
      .pipe( cssMinify() )
      .pipe( gulp.dest( cssDest ) );
});
gulp.task( 'js', () => {
  return gulp.src( jsSrc )
    //.pipe( jsValidate() )
    //.pipe( babel({presets: ['@babel/env']}))
    .pipe( uglify() )
    .pipe( gulp.dest( jsDest ) )
});
gulp.task( 'json', () => {
  return gulp.src( jsonSrc )
    .pipe( jsonMinify() )
    .pipe( gulp.dest( jsonDest ) )
});
gulp.task( 'img', () => {
  return gulp.src( imgSrc )
    .pipe( gulp.dest( imgDest ) )
});
gulp.task( 'html', () => {
  return( gulp.src( htmlSrc ) )
    .pipe( htmlmin( htmlminAtr ) )
    .pipe( gulp.dest( htmlDest ) )
});
gulp.task( 'index', () => {
  return( gulp.src( indexSrc ) )
    .pipe( htmlmin( htmlminAtr ) )
    .pipe( gulp.dest( indexDest ) )
});
/*----------------------------------------------------------------------------*/
const tasks = [ 'styles', 'js', 'json', 'img', 'html', 'index' ];
/*----------------------------------------------------------------------------*/
gulp.task( 'default', gulp.parallel( tasks ) );
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/