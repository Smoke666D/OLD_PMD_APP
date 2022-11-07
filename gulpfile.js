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
import pug        from 'gulp-pug';
import urlBuilder from 'gulp-url-builder';
import gulpRun    from 'gulp-run';
import connect    from 'electron-connect';
//import sass       from 'gulp-sass' )( require( 'sass' ) );
/*----------------------------------------------------------------------------*/
let app = connect.server.create();
/*----------------------------------------------------------------------------*/
const src  = 'src/';
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
const pugSrc        = src  + 'pug/**/*.pug';
const pugDest       = dist + 'html';

const srcArray   = [jsSrc, cssSrc, jsonSrc, imgSrc, htmlSrc, indexHtmlSrc];
/*----------------------------------------------------------------------------*/
const htmlminAtr = {
  collapseWhitespace: true,
  removeComments: true
};
/*----------------------------------------------------------------------------*/
gulp.task( 'clean', () => {
  return gulp.src( dist, { read: false } )
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
gulp.task( 'pug', () => {
  return gulp.src( pugSrc )
    .pipe( pug().on( "error", console.log ) )
    .pipe( urlBuilder() )
    .pipe( gulp.dest( pugDest ) );
});
gulp.task( 'move', () => {
  return( gulp.src( pugDest + '/index.html' ) )
    .pipe( gulp.dest( dist ) )
});
gulp.task( 'del', () => {
  return gulp.src( pugDest, { read: false } )
    .pipe( clean( {force: true} ) )
})
gulp.task( 'indexJS', () => {
  return gulp.src( indexJsSrc )
    .pipe( uglify() )
    .pipe( gulp.dest( indexJsDest ) )
});
gulp.task( 'package', () => {
  return gulp.src( 'package.json' )
    .pipe( gulp.dest( dist ) );
});
gulp.task( 'deps', () => {
  return gulpRun( 'yarn install --production --modules-folder ' + dist + '/node_modules' ).exec()
});
gulp.task( 'reload', () => {
  app.restart();
  return;
});
/*----------------------------------------------------------------------------*/
const tasks = [ 'css', 'fonts', 'js', 'json', 'img', 'pug', 'move', 'del', 'indexJS', 'package' ];
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
gulp.task( 'process', gulp.series( tasks ) );
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/