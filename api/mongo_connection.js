var MongoClient = require('mongodb').MongoClient;

// Connect to database
exports.connect = MongoClient.connect(process.env.npm_package_config_db_url)
    .then(function(client) {
        exports.client = client;
	exports.db = client.db(process.env.npm_package_config_db_name);
    });
