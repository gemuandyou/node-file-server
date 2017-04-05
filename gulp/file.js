/**
 * Created by Gemu on 2017/3/22.
 */
const fs = require('fs');
const path = require('path');

/**
 * node创建指定文件夹结构。递归创建文件夹
 * reference
 * @param dirpath
 * @param dirname
 */
var mkdirs = function (dirpath, dirname){
    if(typeof dirname === "undefined"){
        if(fs.existsSync(dirpath)){
            return;
        }else{
            mkdirs(dirpath,path.dirname(dirpath));
        }
    }else{
        if(dirname !== path.dirname(dirpath)){
            mkdirs(dirpath);
            return;
        }
        if(fs.existsSync(dirname)){
            fs.mkdirSync(dirpath)
        }else{
            mkdirs(dirname,path.dirname(dirname));
            fs.mkdirSync(dirpath);
        }
    }
};

module.exports = {
    writeFileFromForm: function(filePath, file) {
        if (filePath) {
            filePath = 'src/assets/' + filePath;
            if (filePath.lastIndexOf('/') != filePath.length - 1) {
                filePath += '/';
            }
            mkdirs(filePath);
        } else {
            filePath = 'src/assets/';
        }
        fs.writeFile(decodeURI(filePath + file.name), fs.readFileSync(file.path));
        filePath = filePath.substring(3);
        return filePath + file.name;
    },
    writeFile: function(filePath, fileName, fileBuffer) {
        if (filePath) {
            filePath = 'src/assets/' + filePath;
            if (filePath.lastIndexOf('/') != filePath.length - 1) {
                filePath += '/';
            }
            mkdirs(filePath);
        } else {
            filePath = 'src/assets/';
        }
        if (fs.existsSync(decodeURI(filePath + fileName))) {
            fs.appendFileSync(decodeURI(filePath + fileName), fileBuffer);
        } else {
            fs.writeFileSync(decodeURI(filePath + fileName), fileBuffer);
        }
        filePath = filePath.substring(3);
        return filePath + fileName;
    }
};