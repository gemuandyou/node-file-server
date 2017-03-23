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

module.exports = [{
    // 处理表单上传
    route: "/api/uploadForm/", // complete-route
    handle: function (req, res, next) {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            if (files && fields.filePath && files.file) {
                var filePath = file.writeFileFromForm(fields.filePath, files.file);
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.write(filePath);
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
            var filePath = file.writeFile(decodeURI(params['filePath']), decodeURI(params['fileName']), buffer);
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.write(filePath);
            res.end();
        });
    }
}, {
    // 资源列表预览
    route: "/assetsStruct", // fuzzy-route e.g. => /assets/../..
    handle: function (req, res, next) {
        var path = 'src/assets' + req.url;
        var stats = fs.statSync(path);
        if (stats.isDirectory()) {
            var files = getChildrenFile(path);
            if (files) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.write(JSON.stringify(files).toString())
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
        var path = req.url;
        var fileName = path.substring(path.lastIndexOf('/') + 1);
        var filePath = 'src/assets' + path;
        var stats = fs.statSync(filePath);
        if (stats.isFile()) {
            res.setHeader("Content-type", "application/octet-stream");
            res.setHeader("Content-Disposition", "attachment;filename="+encodeURI(fileName));
            var filestream = fs.createReadStream(filePath);
            filestream.on('data', function(chunk) {
                res.write(chunk);
            });
            filestream.on('end', function() {
                res.end();
            });
        } else {
            res.end();
        }
    }
}];