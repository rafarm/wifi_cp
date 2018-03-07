var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var mongodb = require('../mongo_connection');
var schedulesCollection = mongodb.db.collection('schedules');
var bodyParser = require('body-parser');
var wrapResult = require('./utils').wrapResult;
var resError = require('./utils').resError;
var performAggregation = require('./utils').performAggregation;

/*
 * /schedules GET
 * 
 * Returns all schedules left joined with groupings for current user.
 */
router.get('/', function(req, res) {
    var pipe = [
        {
            $match: {
                owner_id: req.user.uid
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
                _id: 1,
                owner_id: 1,
                grouping_id: 1,
                grouping_name: '$grouping.name',
                start: 1,
                end: 1
            }
        },
        {
            $sort: {
                start: 1
            }
        }
    ];

    return performAggregation(res, schedulesCollection, pipe);
});

/*
 * /schedules/:id DELETE
 * 
 * Deletes schedule identified by 'id'.
 */
router.delete('/:id', function(req, res) {
    const s_id = new ObjectID(req.params.id);
    const o_id = req.user.uid;
    schedulesCollection.deleteOne({'_id': s_id, 'owner_id': o_id})
        .then(function(resp) {
            wrapResult(res, resp);
        })
        .catch(function(err) {
	    resError(res, err);
        });
});

/*
 * /schedules PUT
 * 
 * Upserts the recived schedule.
 */
router.put('/', bodyParser.json(), function(req, res) {
    const schedule = req.body;

    schedule._id = schedule._id === '' ? new ObjectID() : new ObjectID(schedule._id);
    schedule.grouping_id = new ObjectID(schedule.grouping_id);
    schedule.start = new Date(schedule.start);
    schedule.end = new Date(schedule.end);
    if (schedule.owner_id === '') schedule.owner_id = req.user.uid;
    
    schedulesCollection.updateOne(
        { '_id': schedule._id },
        { $set: schedule },
        { upsert: true })
        .then(function(resp) {
            wrapResult(res, resp);
        })
        .catch(function(err) {
            resError(res, err);
        });
});

module.exports = router;
