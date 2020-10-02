const fs                = require('fs');
const path              = require('path');
const mime              = require('mime-types');
const { getUserDir }    = require('./files');

module.exports = {

    preview: (request, response, next) => {
        const userDir = getUserDir(request, response, next);
        const url = decodeURI(request.url.replace('/streaming/', '').replace(/%20/g, ' '));
        const filename = url.split('?')[0];
        const absPath = path.join(`${__dirname}/./../assets/${userDir}/${filename}`);
        const size = fs.statSync(absPath).size;
        const mimeType = mime.lookup(absPath);
        const range = request.headers.range;
        if (range) {
            const bytes = range.replace(/bytes=/, '').split('-');
            const start = parseInt(bytes[0], 10);
            const end = bytes[1] ? parseInt(bytes[1], 10): size - 1;
            const chunkSize = (end - start) + 1;
            const headers = {
                'Accept-Ranges': 'bytes',
                'Content-Range': `bytes ${start}-${end}/${size}`,
                'Content-Type': mimeType,
                'Content-Length': chunkSize
            };
            const stream = fs.createReadStream(absPath, { start, end });
            response.writeHead(206, headers);
            stream.pipe(response);
        } else {
            const headers = {
                'Content-Type': mimeType,
                'Content-Length': size
            };
            response.writeHead(206, headers);
            const stream = fs.createReadStream(absPath);
            stream.pipe(response);
        }
    }
};