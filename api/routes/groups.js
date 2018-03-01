var express = require('express');
var router = express.Router();
var ldap = require('ldapjs');
var wrapResult = require('./utils').wrapResult;
var resError = require('./utils').resError;


/*
 * /groups GET
 * 
 * Returns all ldap groups.
 */
router.get('/', function(req, res) {
    const client = ldap.createClient({
        url: process.env.npm_package_config_ldap_url
    });
    client.bind(
        process.env.npm_package_config_ldap_bindDN,
        process.env.npm_package_config_ldap_bindCredentials,
        err => {
            if (err) {
                client.unbind();
		return resError(res, err);
            }
            
            const groups = [];
            const ops = {
		scope: 'sub',
		filter: process.env.npm_package_config_ldap_groupsSearchFilter,
		attributes: ['cn', 'displayName']
	    }
	    client.search(
                process.env.npm_package_config_ldap_groupsSearchBase,
		ops,
                (err, resp) => {
                    if (err) {
                       client.unbind();
                       return resErro(res, err);
                    }

                    resp.on('searchEntry', group => groups.push(group.object));
                    resp.on('end', result => {
			client.unbind();
			wrapResult(res, groups.sort((a, b) => {
			    aName = a.displayName.toUpperCase();
			    bName = b.displayName.toUpperCase();
			    if (aName < bName) return -1;
			    if (aName > bName) return 1;
			    return 0;
			}));
                    });
                }
            );
        }
    );
});

/*
 * /groups/:dn GET
 * 
 * Returns member users of group identified by its common name.
 */
router.get('/:cn', function(req, res) {
    const client = ldap.createClient({
        url: process.env.npm_package_config_ldap_url
    });
    client.bind(
        process.env.npm_package_config_ldap_bindDN,
        process.env.npm_package_config_ldap_bindCredentials,
        err => {
            if (err) {
                client.unbind();
		return resError(res, err);
            }
            
            const ops = {
		scope: 'sub',
		filter: '(cn='+req.params.cn+')',
		attributes: [ 'memberUid' ],
		sizeLimit: 1
	    }
            var group = null;
	    client.search(
                process.env.npm_package_config_ldap_groupsSearchBase,
		ops,
                (err, resp) => {
                    if (err) {
                       client.unbind();
                       return resErro(res, err);
                    }

                    resp.on('searchEntry', entry => group = entry.object);
                    resp.on('end', result => {
                        client.unbind();
			sendUsers(res, group);
                    });
                }
            );
        }
    );
});

function sendUsers(res, group) {
    // Build search filter...
    if (group) {
	var filter = '';
	group.memberUid.forEach(member => {
	    mf = '(uid='+member+')';
	    filter = '(|'+filter+mf+')';
	});

        const client = ldap.createClient({
            url: process.env.npm_package_config_ldap_url
        });
        client.bind(
            process.env.npm_package_config_ldap_bindDN,
            process.env.npm_package_config_ldap_bindCredentials,
            err => {
                if (err) {
                    client.unbind();
		    return resError(res, err);
                }
            
                const ops = {
		    scope: 'sub',
		    filter: filter,
                    attributes: [ 'uid', 'displayName' ]
	        }
                var users = [];
	        client.search(
                    process.env.npm_package_config_ldap_usersSearchBase,
		    ops,
                    (err, resp) => {
                        if (err) {
                            client.unbind();
                            return resErro(res, err);
                        }

                        resp.on('searchEntry', entry => users.push(entry.object));
                        resp.on('end', result => {
                            client.unbind();
			    wrapResult(res, users.sort(sortByDisplayName));
                        });
                    }
                );
            }
        );
    }
    else {
        resError(res, 'Group not found.');
    }
}

function sortByDisplayName(a, b) {
    aName = a.displayName.toUpperCase();
    bName = b.displayName.toUpperCase();
    if (aName < bName) return -1;
    if (aName > bName) return 1;
    return 0;
}

module.exports = router;
