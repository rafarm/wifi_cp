var mongodb = require('./mongo_connection')
var ldap = require('ldapjs');

// Start runloop processing
exports.start = function() {
    var schedulesCollection = mongodb.db.collection('schedules');
    return setInterval(() => {
        processAuthorizations(schedulesCollection);
    }, process.env.npm_package_config_runloop_interval);
}

function processAuthorizations(collection) {
    var current = new Date();
    //console.log(current);
    var pipe = [
        {
            $match: {
               start: { $lt: current },
               end: { $gt: current }
            }
        },
        {
            $lookup: {
                from: 'groupings',
                localField: 'grouping_id',
                foreignField: '_id',
                as: 'grouping'
            }
        },
        {
            $unwind: '$grouping'
        },
        {
          $project: {
              members: '$grouping.members'
          }
        },
        {
            $unwind: '$members'
        },
        {
            $group: {
                _id: '1',
                members: {
                    $addToSet: '$members.uid'
                }
            }
        }
    ];
    
    collection.aggregate(pipe, (err, cursor) => {
        if (err != null) {
            console.log('Error aggregating schedules: ' + err);
            return;
        }

        cursor.toArray((err, result) => {
            if (err != null) {
                console.log('Error aggregating schedules: ' + err);
                return;
            }

            result = result.length > 0 ? result[0] : result;
            const members = result.members != undefined ? result.members : [];
            updateLDAP(members);
        });
    });
}

function updateLDAP(members) {
    const ldapClient = ldap.createClient({
        url: process.env.npm_package_config_ldap_url
    });

    ldapClient.bind(process.env.npm_package_config_ldap_bindDN,
                    process.env.npm_package_config_ldap_bindCredentials,
                    err => {
        if (err != null) {
            console.log('Error binding to LDAP server: ' + err);
            return;
        }

        const dn = process.env.npm_package_config_ldap_authGroup;
        const attr =  process.env.npm_package_config_ldap_authGroup_attribute;
        var mod = {};
        mod[attr] = members;
        var change = new ldap.Change({
            operation: 'replace',
            modification: mod
        });

        ldapClient.modify(dn, change, err => {
            if (err != null) {
                console.log('Error updating auth group: ' + err);
            }

            ldapClient.unbind(err => {
                if (err != null) {
                    console.log('Error unbinding from LDAP server: ' + err);
                }

            });
        });
    });
}
