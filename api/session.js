var session = require('express-session');
var MongoStore = require('connect-mongodb-session')(session);

const db_sessions_collection = 'sessions';

module.exports = session({
	secret: 'theworstsecretever',
	cookie: {
	    maxAge: parseInt(process.env.npm_package_config_cookie_max_age)
	},
	store: new MongoStore({
	    uri: process.env.npm_package_config_db_url,
	    collection: db_sessions_collection
	}),
	resave: false,
	saveUninitialized: false
    });
