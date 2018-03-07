var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var mongodb = require('../mongo_connection');
var groupingsCollection = mongodb.db.collection('groupings');
var bodyParser = require('body-parser');
var wrapResult = require('./utils').wrapResult;
var resError = require('./utils').resError;

/*
 * /groupings GET
 * 
 * Returns all groupings.
 */
router.get('/', function(req, res) {
    let projection = null;
    if (req.query.excludeMembers != undefined && req.query.excludeMembers.toUpperCase == 'YES') {
        projection = {
            _id: 1,
            owner_id: 1,
            name: 1,
            description: 1
        };
    }
    
    groupingsCollection.find({owner_id: req.user.uid}, projection).sort([['name', 1]]).toArray()
        .then(function(groups) {
            wrapResult(res, groups);
        })
        .catch(function(err) {
	    resError(res, err);
        });
});

/*
 * /groupings/:id DELETE
 * 
 * Deletes grouping identified by 'id'.
 */
router.delete('/:id', function(req, res) {
    const g_id = new ObjectID(req.params.id);
    const o_id = req.user.uid;
    groupingsCollection.deleteOne({'_id': g_id, 'owner_id': o_id})
        .then(function(resp) {
            wrapResult(res, resp);
        })
        .catch(function(err) {
	    resError(res, err);
        });
});

/*
 * /groupings PUT
 * 
 * Upserts the recived grouping.
 */
router.put('/', bodyParser.json(), function(req, res) {
    const grouping = req.body;
    grouping._id = grouping._id === '' ? new ObjectID() : new ObjectID(grouping._id);
    if (grouping.owner_id === '') grouping.owner_id = req.user.uid;
    groupingsCollection.updateOne(
        { '_id': grouping._id },
        { $set: grouping },
        { upsert: true })
        .then(function(resp) {
            wrapResult(res, resp);
        })
        .catch(function(err) {
            resError(res, err);
        });
});

module.exports = router;
