const config        = require('../config.json');
const jwt           = require('jsonwebtoken');
const createError   = require('http-errors');
const fs            = require('fs');
const path          = require('path');
const logger        = require('../logger/logger');
const db            = require('../utils/db');

let self = module.exports = {
        signup: async (request, response, next) => {
                const { user, password, email } = request.body;
                await db.connect().then(client => {

                        let collection = client.db(config.mongodb.db).collection(config.mongodb.collection);
                        collection.find({user, password, email}).toArray(async(error, doc) => {
                                if (error){
                                        logger.error(error);
                                        console.error(error);
                                        await client.close();
                                        return response.status(500).json({ok: false, error});
                                }
                                if(doc.length === 0) {
                                        collection.insertOne({user, password, email, main_dir: `_${user}`}, async(error, doc)=>{
                                                if(error) {
                                                        console.error(error);
                                                        logger.error(error);
                                                        await client.close();
                                                        return response.status(500).json({ok: false, data: [], fails: [error]});
                                                }
                                                await client.close();
                                                console.log(doc);
                                                const basePath = path.join(__dirname, '../assets');
                                                fs.mkdir(`${basePath}/_${user}`, { recursive: true, mode: 0o755 }, (error) => {
                                                    if(error){
                                                            console.error(error);
                                                            return;
                                                    }else{
                                                            fs.chmod(`${basePath}/_${user}`, 0o755, (error)=>{
                                                                    if(error){
                                                                            console.error(error);
                                                                            logger.error(error);
                                                                    }
                                                            });
                                                            return response.status(200).json({ok: true, data: doc, fails: []});
                                                    }
                                                });
                                        });
                                }else {
                                        return response.status(200).json({ok: false, msg: 'user already exists'});
                                }
                        });

                }).catch(e => console.error(e));
        },
        signin: async (request, response, next) => {
                const { user, password, email } = request.body;
                await db.connect().then(client => {
                        
                        let collection = client.db(config.mongodb.db).collection(config.mongodb.collection);
                        collection.find({"user": user, "password": password, "email": email}).toArray(async(error, doc)=>{
                            if(error){
                                    logger.error(error);
                                    console.error(error);
                                    await client.close();
                                    return response.status(400).json({ok: false, data: [], fails: [error]});
                            }
                            await client.close();
                            if(doc.length === 0){
                                    return response.status(200).json({ok: false, data: [], fails: [{msg: 'User not found.'}]});
                            }else{
                                    await self.generateToken(user, email).then(token => {
                                            console.log(token);
                                            return response.status(200).json({ok: true, token, fails: []});
                                    });
                            }
                        });

                }).catch(e => console.error(e));
        },
        generateUUID: () => {
                        let date = new Date().getTime();
                        let uuid = 'xxxxxxxx-yxxx-4xxxxxxx-xxxxx-xxxxxxxx'.replace(/[xy]/g, function(u){
                            let reg = (date + Math.random()*32)%32 | 0;
                            date = Math.floor(date/32);
                            return (u === 'x' ? reg: (reg&0x3|0x8)).toString(32);
                        });
                        return uuid;
        },
        generateToken: async(user, email) => {
                return new Promise((resolve, reject)=> {
                    jwt.sign({user, email}, config.jwt.api_key, { expiresIn: '1d' }, (error, token)=>{
                            if(error){
                                    console.error(error);
                                    logger.error(error);
                                    reject(error);
                            }
                            if(token){
                                    resolve(token);
                            }
                    });
                });
        },
        authenticate: (request, response, next) => {
                const ip = request.connection.remoteAddress || request.headers['x-forwarded-for'];
                if(!request.headers && !request.headers.authorization || !request.query && !request.query.authorization) {
                        console.log(`Forbidden access from host: ${ip}`); 
                        logger.error(`Forbidden access from host: ${ip}`); 
                        return next(createError(403));
                }
                if (request.headers.authorization || request.query.authorization) {
                        let bearer = request.headers.authorization || request.query.authorization;
                        const token = bearer.split(' ')[1];
                        jwt.verify(token, config.jwt.api_key, (error, decoded)=> {
                                if(error){
                                        console.error(error);
                                        logger.error(error);
                                        next(createError(403));
                                }
                                logger.info(`Authorized access from: ${ip}`);
                                return next();
                        });
                }
        }
};
