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
        const basePath = path.join(__dirname, `../assets/${self.getUserDir(request, next)}/`);
        let absPath;
        if (!request.url) {
                absPath = basePath;
        } else {
                absPath = decodeURI(path.join(basePath, request.url.replace('/files', '').replace(/%20/g, ' ')));
                // const url = decodeURI(request.url.replace('/files', '').replace('/%20%/g', ' '));
                fs.readdir(absPath, { encoding: 'utf-8', withFileTypes: true }, (error, files) => {
                        if (error) {
                                console.error(error);
                                logger.error(error);
                                return response.status(200).json({ok: false, error});
                        }
                        let filesArray = [];
                        files.forEach(file => {
                                const stats = fs.statSync(path.join(absPath, file.name));
                                let type = mime.lookup(path.join(absPath, file.name)) === false && fs.statSync(path.join(absPath, file.name)).isDirectory() ? 'directory' : mime.lookup(path.join(absPath, file.name));
                                if (type === false && !fs.statSync(path.join(absPath, file.name)).isDirectory()) {
                                        type = 'unknown';
                                }
                                filesArray.push({name: file.name, stats, type});
                                
                        });
                        if (filesArray.length === files.length) {
                                return response.status(200).json({ok: true, data: filesArray});
                        }
                });
        }
    },
    fileDetails: (request, response, next) => {
        const basePath = path.join(__dirname, `../assets/${self.getUserDir(request, next)}/`);
        const length = request.url.replace('/file', '').replace(/%20/g, ' ').split('/').length;
        const filename = request.url.replace('/file', '').replace(/%20/g, ' ').split('/')[length - 1];
        const absPath = decodeURI(path.join(basePath, request.url.replace('/file', '').replace(/%20/g, ' ')));
        if (fs.existsSync(absPath)) {
                fs.stat(absPath, async(error, stats) => {
                        if (error) {
                                console.error(error);
                                logger.error(error);
                                return response.status(200).json({ok: false, error});
                        }
                        const type = mime.lookup(absPath) === false && fs.statSync(absPath).isDirectory() ? 'directory' : mime.lookup(absPath);
                        if (type === 'directory'){
                                await self.du(absPath).then((sizes) => {
                                        let total = 0;
                                        sizes.forEach(size => total += size);
                                        const file = {name: filename, stats, type, size: total};
                                        response.status(200).json({ok: true, data: file});
                                });
                                sizes.length = 0;
                                return;
                        }else {
                                const file = {name: filename, stats, type, size: stats['size']};
                                return response.status(200).json({ok: true, data: file});
                        }
                        
                });
        } else {
                return response.status(200).json({ok: false});
        }
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
        });
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
                        return cb(error, 0);
                }
        });
    },
    mkdir: (request, response, next) => {
        const basePath = path.join(__dirname, `../assets/${self.getUserDir(request, next)}/`);
        let url = decodeURI(request.url.replace('/files', '').replace('/%20/g', ' '));
        fs.mkdir(path.join(basePath, url), {recursive: true}, (error, path) => {
                if (error) {
                        console.error(error);
                        logger.error(error);
                }
                if(url.startsWith('/')) {
                        url = url.split('').splice(1, url.length).join('').toString();
                }
                return response.status(200).json({ok: true, path: url});
        });
    },
    deleteFolderRecursive: (path) => {
        if(fs.existsSync(path)) {
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
                const absPath = path.join(__dirname, `./../assets/${self.getUserDir(request, next)}${url}`);
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
        const basePath = path.join(__dirname, `./../assets/${self.getUserDir(request, next)}`);
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
        const absPath = path.join(__dirname, `./../assets/${self.getUserDir(request, next)}${url}`);
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
    getUserDir: (request, next) => {
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
    },
    makeQuerablePromise: (promise) => {
        // Don't modify any promise that has been already modified.
        if (promise.isResolved) return promise;
    
        // Set initial state
        var isPending = true;
        var isRejected = false;
        var isFulfilled = false;
    
        // Observe the promise, saving the fulfillment in a closure scope.
        var result = promise.then(
            function(v) {
                isFulfilled = true;
                isPending = false;
                return v; 
            }, 
            function(e) {
                isRejected = true;
                isPending = false;
                throw e; 
            }
        );
    
        result.isFulfilled = function() { return isFulfilled; };
        result.isPending = function() { return isPending; };
        result.isRejected = function() { return isRejected; };
        return result;
    }
};
