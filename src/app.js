require('dotenv-safe').config({
    path: process.env.DOTENV_PATH ? process.env.DOTENV_PATH : '.env'
});

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require ('cors');
const compression = require('compression');
const logger = require('morgan');
const path = require('path');
const createError = require('http-errors');
var debug = require('debug')('pronto-stack:server');

const app = express();

app.use(helmet());
app.use(bodyParser.json({ limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false })); // I saw this as true in https://www.robinwieruch.de/node-express-server-rest-api/
app.use(cookieParser());
app.use(compression());

app.use(logger('dev'));

//fuck, was working, removed after getting "Access-Control-Allow-Origin header contains multiple values '*, *', but only one is allowed"
app.use(cors());
app.options('*', cors());

/*
//create a cors middleware
app.use(function(req, res, next) {
//set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
*/

var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.JWKS_URI
    }),
    audience: process.env.AUDIENCE,
    issuer: process.env.ISSUER,
    algorithms: ['RS256']
});

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

const publicRoutes = require ('./routes/public');
const privateRoutes = require ('./routes/private');

app.use('/rest/public', publicRoutes);
app.use('/rest/private', jwtCheck, privateRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    //res.render('error');

    res.json( {statusCode: err.status, message: err.message})
});

const server = app.listen(parseInt(process.env.REST_SERVER_PORT), () => {
    console.log("Server running on port 3000");
});


server.on('error', onError);
server.on('listening', onListening);


//var server = require('http').Server(app);
//var io = require('socket.io')(server);
//var wcSocket = require('./objects/wc-socket').socketServer(io);


//module.exports = {app: app, server: server};


function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof parseInt(process.env.REST_SERVER_PORT) === 'string'
        ? 'Pipe ' + parseInt(process.env.REST_SERVER_PORT)
        : 'Port ' + parseInt(process.env.REST_SERVER_PORT);

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}