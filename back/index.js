const config            = require('./config');
const express           = require('express');
const http              = require('http');
const createError       = require('http-errors');
const cors              = require('cors');
const fileUpload        = require('express-fileupload');
const app               = express();

const indexRouter       = require('./routes/index');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors({
    origin: ['http://192.168.1.42:4200', 'http://127.0.0.1:8000', 'http://192.168.43.202:4200']
}));
app.use(fileUpload());

app.use('/api', indexRouter);

app.use((request, response, next)=>{
    next(createError(404));
});

http.createServer(app).listen(config.http.port, config.http.ip, ()=>{
    console.log(`server listening on ${config.http.ip}:${config.http.port}`);
});
