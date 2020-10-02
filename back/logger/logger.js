const bunyan            = require('bunyan');
const fs                = require('fs');
const path              = require('path');

let accessLog           = fs.createWriteStream(path.join(__dirname, '../logs/access.log'));
let errorLog            = fs.createWriteStream(path.join(__dirname, '../logs/error.log'));

let logger              = bunyan.createLogger({
        name: 'File Server Logger',
        streams: [
                {
                        level: 'info',
                        stream: accessLog
                },
                {
                        level: 'error',
                        stream: errorLog
                }
        ]
});

module.exports = logger;
