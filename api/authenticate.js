var session = require('./session');
var passport = require('passport');
var LdapStrategy= require('passport-ldapauth').Strategy;
var flash = require('connect-flash');
var bodyParser = require('body-parser');

const db_users_collection = 'users';

var ldapOps = {
    server: {
        url: process.env.npm_package_config_ldap_url,
        bindDN: process.env.npm_package_config_ldap_bindDN,
        bindCredentials: process.env.npm_package_config_ldap_bindCredentials,
        searchBase: process.env.npm_package_config_ldap_authSearchBase,
        searchFilter: process.env.npm_package_config_ldap_authSearchFilter
    },
    handleErrorsAsFailures: false
};

module.exports = (app, mongodb) => {
    app.use(flash());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session);

    passport.use(new LdapStrategy(ldapOps));
    app.use(passport.initialize());
    app.use(passport.session());

    // Session management...
    passport.serializeUser((user, done) => {
	done(null, user.uid);
    });
    passport.deserializeUser((id, done) => {
	mongodb.db.collection(db_users_collection)
	    .find({uid:id})
	    .limit(1)
	    .next((err, user) => {
		if (err) return done(err);
                if (user != undefined) {
                    user['isAdmin'] = user.uid == process.env.npm_package_config_admin_uid;
                }

		return done(null, user);
	    });
    });

    return (req, res, next) => {
        passport.authenticate('ldapauth', (err, user, info) => {
            if (err) {
                return next(err)
            };
            if (!user) {
                req.flash('error', info.message);
                return res.redirect('/login');
            }
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }

                //Save user into database.
                const db_user = {
                    uid: user.uid,
                    dn: user.dn,
                    displayName: user.displayName,
                    uidNumber: user.uidNumber,
                    gidNumber: user.gidNumber
                }
                mongodb.db.collection(db_users_collection).updateOne(
                    { uid: user.uid },
                    { $set: db_user },
                    { upsert: true },
                    (err, result) => {
                        if (err) {
                            return next(err);
                        }
                        if (req.session && req.session.returnTo) {
                            return res.redirect(req.session.returnTo);
                        }
                        return res.redirect('/');
                    }
                );
            });
        })(req, res, next);
    };
};
