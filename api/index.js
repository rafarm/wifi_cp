var express = require('express');
var https = require('https');
var fs = require('fs');
var app = express();
var mongodb = require('./mongo_connection');
var authenticate = require('./authenticate')(app, mongodb);
var startRunloop = require('./runloop').start;

var server = null;
var runloop = null;

// Connecting to database...
mongodb.connect
    .then(function () {
	console.log('Connected to database.');

	// Set template engine...
	app.set('views', 'web');
	app.set('view engine', 'ejs');
	
	// Catch unauthorized api calls...
	app.use('/api', (req, res, next) => {
	    if ( !req.isAuthenticated || !req.isAuthenticated() ) {
	    	return res.status(401).end();
	    }
	    next();
	});
    
	// Loading API routes...
        var schedules = require('./routes/schedules');
        app.use('/api/schedules', schedules);
        var groupings = require('./routes/groupings');
        app.use('/api/groupings', groupings);
        var groups = require('./routes/groups');
        app.use('/api/groups', groups);

	// Login...
	app.post('/login', authenticate);
	app.get('/login', (req, res) => {
	    if ( req.isAuthenticated && req.isAuthenticated() ) {
                return res.redirect('/');
            }
	    res.render('login/index', { error: req.flash('error')[0] });
	});

	// Logout...
	app.use('/logout', (req, res) => {
	    req.logout();
	    res.redirect('/login');
	});

	app.use(express.static('web'));
	
	// Client app..
	// Catch unauthorized web access...
	app.use('*', (req, res, next) => {
	    if ( !req.isAuthenticated || !req.isAuthenticated() ) {
		if ( req.session ) {
		    req.session.returnTo = req.originalUrl || req.url;
		}
		
		return res.redirect('/login');
	    }
            res.render('index', { user: req.user });
        });

	// Set SSL certs...
	//var ssl_options = {
	//    key: fs.readFileSync(process.env.npm_package_config_key),
	//    cert: fs.readFileSync(process.env.npm_package_config_cert)
	//};

	// Starting server...
	server = app.listen(process.env.npm_package_config_port, function () {
	//server = https.createServer(ssl_options, app).listen(process.env.npm_package_config_port, function () {
            runloop = startRunloop();
    	    console.log('Wifi panel started.');
    	    console.log('Listening on port '+process.env.npm_package_config_port+'.');
	});	
    })
    .catch(function (err) {
        // Close server on database connection error.
	console.error('Error connecting to database.');
        console.error(err);
    });

/*
 * Helper function to close database connection and finalize
 * server execution.
 */
function closeDBConnectionAndExit() {
    console.info('Stopping server...');
    server.close();
    clearInterval(runloop);
    console.info('Closing database connection...');
    mongodb.client.close();
    process.exit();
}

// Close database connections on termination
process.on('SIGINT', () => {
    closeDBConnectionAndExit();
});

process.on('SIGTERM', () => {
    closeDBConnectionAndExit();
});

