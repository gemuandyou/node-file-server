/**
 * Created by Gemu on 2017/3/22.
 */
var gulp = require('gulp');
var browserSync = require('browser-sync');
var uri = require('./uri');
gulp.task('server', function () {
    browserSync.init({
        browser: 'chrome',
        port: '3008',
        server: {
            baseDir: 'src',
            routes: {
                "/node_modules": "node_modules"
            },
            middleware: uri
        }
    });
});