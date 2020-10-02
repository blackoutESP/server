const config        = require('../config.json');
const fs            = require('fs');
const path          = require('path');
const jwt           = require('jsonwebtoken');
const createError   = require('http-errors');
const mime          = require('mime-types');
const logger        = require('../logger/logger');

let sizes = [];
let self = module.exports = {
    ls: (request, response, next) => {
        const basePath = path.join(__dirname, `../assets/${self.getUserDir(request, response, next)}/`);
        let absPath;
        let filesArr = [];
        if (!request.params.path) {
                absPath = basePath;
        } else {
                absPath = basePath;
                const url = decodeURI(request.url.replace('/files', ''));
                absPath = path.join(absPath, url);
        }
        fs.readdir(absPath, (error, files) => {
                if (error) {
                        console.error(error);
                        logger.error(error);
                        return response.status(200).json({ok: false, error});
                }
                files.forEach(file => {
                        fs.stat(path.join(absPath, file), async(error, stats) => {
                                if (error) {
                                        console.error(error);
                                        logger.error(error);
                                }
                                let type = mime.lookup(path.join(absPath, file));
                                if (!type && fs.statSync(path.join(absPath, file)).isDirectory() === false ) type = 'unknown';
                                let f = {
                                        name: file,
                                        stats,
                                        type
                                };
                                if (type) {
                                        f.size = stats['size'];
                                } else {
                                        f.size = stats['size'];
                                }
                                filesArr.push(f);
                                if (filesArr.length === files.length) { // we found all files in directory
                                        filesArr.sort((x, y) => {
                                                if (x.name < y.name) {
                                                        return -1;
                                                }
                                                if (x.name > y.name) {
                                                        return 1;
                                                }
                                                return 0;
                                        });
                                        if (absPath !== basePath) {
                                                return response.status(200).json({ok: true, data: filesArr, dir: absPath});
                                        } else {
                                                return response.status(200).json({ok: true, data: filesArr});
                                        }
                                }
                        });
                });
        });
    },
    fileDetails: (request, response, next) => {
        let totalSize = 0;
        let url = decodeURI(request.url.replace("/file", "").replace(/%20/g, " "));
        const absPath = path.join(
          __dirname,
          `./../assets/${self.getUserDir(request, response, next)}${url}`
        );
        fs.stat(absPath, async (error, stats) => {
          if (error) {
            console.error(error);
            logger.error(error);
            return response.status(500).json({ ok: false, error });
          }
          const length = url.split("/").length;
          const filename = url.split("/")[length - 1];
          let type = mime.lookup(absPath);
          if (
            !type &&
            fs.statSync(path.join(absPath)).isDirectory() === false
          ) {
            type = "unknown";
          }
          if (fs.statSync(absPath).isDirectory()) {
              
          } else {
            const f = {
              name: filename,
              stats,
              type,
              size: stats["size"],
            };
            return response.json({ ok: true, data: f });
          }
        });
    },
    du: async(absPath) => {
        return new Promise(async(resolve, reject) => {
                await self.readSizeRecursive(absPath, (error, total) => {
                        sizes.push(new Promise((resolve, reject) => {
                                if (error) {
                                        reject(error);
                                } else {
                                        resolve(total);
                                }
                        }));    
                });
                Promise.all(sizes).then(sizes => resolve(sizes));
        })
    },
    readSizeRecursive: async(absPath, cb) => {
        let total = 0;
        if (typeof cb !== 'function') return;
        fs.lstat(absPath, (error, stats) => {
                if (!error && stats.isDirectory()){
                        total = stats.size;
                        fs.readdir(absPath, (error, files) => {
                                if (error) {
                                        return cb(error);
                                }
                                files.forEach(async (file) => {
                                        await self.readSizeRecursive(path.join(absPath, file), (error, total) => {
                                                if (error) {
                                                        console.error(error);
                                                }
                                                if (fs.existsSync(path.join(absPath, file))){
                                                        total += fs.statSync(path.join(absPath, file)).size;
                                                        cb(error, total);
                                                }
                                        });
                                });
                        });
                } else {
                        cb(error, 0);
                }
        });
    },
    mkdir: (request, response, next) => {
        const basePath = path.join(__dirname, `./../assets/${self.getUserDir(request, response, next)}/`);
        const dirname = decodeURI(request.body.path);
        const absPath = path.join(basePath, dirname);
        if(!fs.existsSync(absPath)){
                fs.mkdir(absPath, { recursive: true, mode: 0o777 }, (error, path) => {
                        if(error){
                                console.error(error);
                                logger.error(error);
                                return response.status(200).json({ok: false, error});
                        }
                        console.log(`created folder ${path}`);
                        logger.info(`created folder ${path}`);
                        return response.status(200).json({ok: true, path});
                });
        }
    },
    deleteFolderRecursive: (path) => {
        if( fs.existsSync(path) ) {
                fs.readdirSync(path).forEach(file => {
                        let curPath = path + "/" + file;
                        if(fs.lstatSync(curPath).isDirectory()){
                                self.deleteFolderRecursive(curPath);
                        }else{ 
                                fs.unlinkSync(curPath);
                        }
                });
                fs.rmdir(path, (error) => {
                        if(error) {
                                console.error(error);
                                logger.error(error);
                                return false;
                        }
                        return true;
                });
        }
    },
    rm: (request, response, next) => {
        if(!request.params.path){
                response.json({ok: false});
        }else{
                let url = decodeURI(request.url.replace("/files", "").replace(/%20/g, " "));
                const absPath = path.join(__dirname, `./../assets/${self.getUserDir(request, response, next)}${url}`);
                if(absPath === path.join(__dirname, '../assets') || absPath === path.join(__dirname, '../assets/')){ 
                        return response.json({ok: false});
                }
                if(fs.lstatSync(absPath).isDirectory()){
                        self.deleteFolderRecursive(absPath);
                        return response.status(200).json({ok: true});
                }else{
                        fs.unlink(absPath, (error) => {
                                if(error){
                                        console.error(error);
                                        logger.error(error);
                                        return response.status(500).json({ok: false, data: [], fails: error});
                                }
                                return response.status(200).json({ok: true});
                        });
                }
        }
    },
    upload: (request, response, next) => {
        const basePath = path.join(__dirname, `./../assets/${self.getUserDir(request, response, next)}`);
        let filePath = decodeURI(request.url.replace("/upload", "").replace(/%20/g, " "));
        Object.values(request.files).forEach(file => {
                file.mv(path.join(basePath, `${filePath}/${file.name}`), (error) => {
                        if(error){
                                console.error(error);
                                logger.error(error);
                                return response.json({ok: false, error});
                        }
                        return response.json({ok: true});
                });
        });
    },
    download: (request, response, next) => {
        let url = decodeURI(request.url.replace("/download", "").replace(/%20/g, " "));
        const absPath = path.join(__dirname, `./../assets/${self.getUserDir(request, response, next)}${url}`);
        if(absPath === path.join(__dirname, '../assets') || absPath === path.join(__dirname, '../assets/')){ 
                return response.json({ok: false});
        }
        const length = absPath.split('/').length;
        const filename = absPath.split('/')[length-1];
        console.log(filename);
        if(fs.lstatSync(absPath).isDirectory()){
                return response.end();
        }else{
                fs.readFile(absPath, (error, data)=>{
                        if(error){
                                console.error(error);
                                logger.error(error);
                                return response.status(500).json({ok: false, data: [], fails: error});
                        }
                        fs.stat(absPath, (error, stats)=>{
                                if(error){
                                        console.error(error);
                                        logger.error(error);
                                }
                                let file = {
                                        name: filename,
                                        stats,
                                        size: (stats['size']/1024)/1024,
                                        data
                                };
                                return response.status(200).json({ok: true, data: file, fails: []});
                        });
                });
        }
    },
    getUserDir: (request, response, next) => {
        let userDir;
        let bearer = request.headers.authorization || request.query.authorization;
        const token = bearer.split(' ')[1];
        jwt.verify(token, config.jwt.api_key, (error, decoded) => {
                if(error){
                        console.error(error);
                        logger.error(error);
                        return next(createError(403));
                }
                userDir = `_${decoded.user}`;
        });
        return userDir;
    }
};
