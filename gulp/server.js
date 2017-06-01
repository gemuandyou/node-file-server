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
        ui: {
            port: 3002 // 设置Browser-sync UI界面的端口号
        },
        server: {
            baseDir: 'src',
            routes: {
                "/node_modules": "node_modules"
            },
            middleware: uri
        },
        cors: false // 是否允许跨域
    });
});
