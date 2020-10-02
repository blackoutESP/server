const config            = require('../config');
const logger            = require('../logger/logger');
const mongodb           = require('mongodb');
const MongoClient       = mongodb.MongoClient;
const ObjectId          = mongodb.ObjectId;
const MongoError        = mongodb.MongoError;

module.exports = {
        connect: () => {
                return new Promise((resolve, reject) => {
                        MongoClient.connect(`${config.mongodb.url}${config.mongodb.db}`,{ useUnifiedTopology: true }, (error, client) => {
                                if(error){
                                        console.error(new MongoError(error));
                                        logger.error(new MongoError(error));
                                        reject(new MongoError(error));
                                }
                                resolve(client);
                        });
                });
        }
};
