'use strict';
/*----------------------------------------------------------------------------*/
import gulp       from 'gulp';
import run        from 'gulp-run';
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
import electron from 'gulp-run-electron';
import gulpRun  from 'gulp-run';
import connect  from 'electron-connect';
/*----------------------------------------------------------------------------*/
let app = connect.server.create();
/*----------------------------------------------------------------------------*/
const src  = '';
const dist = 'dist/';
/*----------------------------------------------------------------------------*/
const jsSrc         = src  + 'js/**/*.js';
const jsDest        = dist + 'js/';
const cssSrc        = src  + 'css/**/*.css';
const cssDest       = dist + 'css/';
const fontDest      = dist + 'webfonts/'
const jsonSrc       = src  + 'json/**/*.json'; 
const jsonDest      = dist + 'json/';
const imgSrc        = src  + 'img/**';
const imgDest       = dist + 'img/';
const htmlSrc       = src  + 'html/**/*.html';
const htmlDest      = dist + 'html/';
const indexHtmlSrc  = src  + 'index.html';
const indexHtmlDest = dist + '';
const indexJsSrc    = src  + 'index.js';
const indexJsDest   = dist + '';

const srcArray   = [jsSrc, cssSrc, jsonSrc, imgSrc, htmlSrc, indexHtmlSrc];
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
gulp.task( 'css', () => {
  return gulp.src( [
    cssSrc,
    './node_modules/@fortawesome/fontawesome-free/css/fontawesome.css',
    './node_modules/@fortawesome/fontawesome-free/css/brands.css',
    './node_modules/@fortawesome/fontawesome-free/css/solid.css'
  ])
    .pipe( concat( 'style.min.css' ) )
    .pipe( cssMinify() )
    .pipe( gulp.dest( cssDest ) )
});
gulp.task( 'fonts', () => {
  return gulp.src([
    './node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.ttf',
    './node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf',
    './node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.woff2',
    './node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2'
  ])
    .pipe( gulp.dest( fontDest ) )
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
gulp.task( 'indexHTML', () => {
  return( gulp.src( indexHtmlSrc ) )
    .pipe( htmlmin( htmlminAtr ) )
    .pipe( gulp.dest( indexHtmlDest ) )
});
gulp.task( 'indexJS', () => {
  return( gulp.src( indexJsSrc ) )
    .pipe( uglify() )
    .pipe( gulp.dest( indexJsDest ) )
});
gulp.task( 'reload', () => {
  app.restart();
  return;
});
/*----------------------------------------------------------------------------*/
const tasks = [ 'css', 'fonts', 'js', 'json', 'img', 'html', 'indexHTML', 'indexJS' ];
/*----------------------------------------------------------------------------*/
gulp.task( 'process', gulp.parallel( tasks ) );
gulp.task( 'start', () => {
  app.start();
});
gulp.task( 'watch', () => {
  gulp.watch( srcArray, gulp.parallel( ['watch', 'reload'] ) ); 
});
/*----------------------------------------------------------------------------*/
//gulp.task( 'default', gulp.parallel( ['watch', 'start'] ) );
gulp.task( 'default', gulp.parallel( tasks ) );
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/