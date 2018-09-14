/**
 * Created by Gemu on 2017/3/22.
 */;
const formidable = require("formidable");
const fs = require('fs');
const file = require('./file');

var getChildrenFile = function(path) {
    if (fs.existsSync(path)) {
        var childrens = [];
        childrens = fs.readdirSync(path);
        return childrens;
    }
};

var whiteListDomain = ['127.0.0.1', 'http://localhost:3008', 'http://localhost:3000']; // 白名单
var concurrentNum = 10; // 最大下载并发数

module.exports = [{ // 相当于拦截器，所有请求都会走这里
    route: "",
    handle: function(req, res, next) {
        //console.log(req.headers["origin"]);
        // 域名验证，允许跨域访问白名单
        if (!req.headers["origin"] || whiteListDomain.indexOf(req.headers["origin"]) !== -1) {
            next();
        } else {
            res.end();
            return;
        }
    }
},{
    // 处理表单上传
    route: "/api/uploadForm", // complete-route
    handle: function (req, res, next) {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            if (files && files.file) { // fields.filePath &&
                var filePath = file.writeFileFromForm(fields.filePath, files.file);
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.write(filePath, 'utf-8');
            }
            res.end();
        });
    }
}, {
    // 处理普通参数上传
    route: "/api/upload/", // complete-route
    handle: function (req, res, next) {
        var body = [];
        req.on('data', function(chunk){
            body.push(chunk);
        });
        req.on('end', function(){
            body = Buffer.concat(body).toString();
            var parts = body.split('&');
            var params = {};
            for (var i in parts) {
                var param = parts[i];
                var kv = param.split('=');
                params[kv[0]] = kv[1];
            }
            var buffer = new Buffer(params['fileBuffer'], 'hex');

            var filePath = file.writeFile(decodeURIComponent(params['filePath']), decodeURIComponent(params['fileName']), buffer);
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.write(filePath, 'utf-8');
            res.end();
        });
    }
}, {
    // 处理普通参数上传
    route: "/api/uploadbase64/", // complete-route
    handle: function (req, res, next) {
        var body = [];
        req.on('data', function(chunk){
            body.push(chunk);
        });
        req.on('end', function(){
            body = Buffer.concat(body).toString();
            var parts = body.split('&');
            var params = {};
            for (var i in parts) {
                var param = parts[i];
                var kv = param.split('=');
                params[kv[0]] = kv[1];
            }
            var filePath = file.writeBase64(decodeURIComponent(params['filePath']), decodeURIComponent(params['fileName']), decodeURIComponent(params['fileBuffer']));
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.write(filePath, 'utf-8');
            res.end();
        });
    }
}, {
    // 资源列表预览
    route: "/assetsStruct", // fuzzy-route e.g. => /assets/../..
    handle: function (req, res, next) {
        var path = 'src/assets' + req.url;
        var stats = fs.statSync(decodeURIComponent(path));
        if (stats.isDirectory()) {
            var files = getChildrenFile(decodeURIComponent(path));
            if (files) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                var fileArr = [];
                for (var index in files) {
                    var file = files[index];
                    var stats1 = fs.statSync(decodeURIComponent(path) + '/' + file);
                    var fileObj = {file: file};
                    fileObj.isFile = stats1.isFile();
                    fileArr.push(fileObj);
                }
                res.write(JSON.stringify(fileArr).toString());
            } else {
                res.write(JSON.stringify("[]").toString());
            }
        }
        if (stats.isFile()) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.write(JSON.stringify({file: '/assets' + req.url}).toString());
        }
        res.end();
    }
}, {
    // 资源访问
    route: "/assets", // fuzzy-route e.g. => /assets/../..
    handle: function (req, res, next) {
        next(); // 返回资源
        // res.end(); // 中断资源请求，不反回资源
    }
}, {
    // 资源下载
    route: "/download/assets", // fuzzy-route e.g. => /assets/../..
    handle: function (req, res, next) {
        if (concurrentNum <= 0) {
            res.setHeader("Content-type", "application/json");
            res.write("{'isBlocked':true}"); // 资源阻塞，下载失败
            res.end();
            return;
        }
        concurrentNum--;
        var path = req.url;
        var fileName = path.substring(path.lastIndexOf('/') + 1);
        var filePath = 'src/assets' + path;
        var stats = fs.statSync(decodeURIComponent(filePath));
        if (stats.isFile()) {
            res.setHeader("Content-type", "application/octet-stream");
            res.setHeader("Content-Disposition", "attachment;filename="+encodeURI(fileName));
            var filestream = fs.createReadStream(decodeURIComponent(filePath));
            filestream.on('data', function(chunk) {
                res.write(chunk);
            });
            filestream.on('end', function() {
                concurrentNum++;
                res.end();
            });
        } else {
            res.end();
        }
    }
}];
