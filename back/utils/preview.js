const fs                = require('fs');
const path              = require('path');
const { getUserDir }    = require('./files');

module.exports = {

    preview: (request, response, next) => {
        const userDir = getUserDir(request, response, next);
        const url = decodeURI(request.url.replace('/preview/', '').replace(/%20/g, ' '));
        const filename = url.split('?')[0];
        const absPath = path.join(`${__dirname}/./../assets/${userDir}/${filename}`);
        fs.readFile(absPath, (error, data) => {
            if (error) {
                console.error(error);
                return next();
            }
            response.send(data);
        });
    }
};