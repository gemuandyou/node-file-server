# node-file-server
nodejs编写的文件服务器（File server written by nodejs.）
### 安装需要的模块
```shell
npm install
```
### 启动项目
```shell
gulp server
```
### 使用方式
* 首页有简易文件列表
* 资源预览(assets preview)
  ```
  http://gemuandyou:3000/assets/xxx/xx.jpg
  ```
* 资源上传(assets upload)
  ```
  http://gemuandyou:3000/api/upload/
  ```
* 资源下载(assets download)
  ```
  http://gemuandyou:3000/download/assets/xxx/xx.jpg
  ```
