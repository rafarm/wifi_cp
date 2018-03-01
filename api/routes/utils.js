var wrapResult = function(res, data) {
    var wrappedData = {};
    wrappedData['data'] = data;
        
    return res.json(wrappedData);
}

var resError = function(res, err) {
    res.status(500);
    return res.json(err);
}

exports.wrapResult = wrapResult;
exports.resError = resError;

exports.performAggregation = function(res, collection, pipe, justOneResult = false, ops = {}) {
    collection.aggregate(pipe, ops, (err, cursor) => {
        if (err != null) {
            return resError(res, err);
        }

        cursor.toArray((err, result) => {
            if (err != null) {
                return resError(res, err);
            }

	    if (justOneResult) {
		result = result.length > 0 ? result[0] : result;
	    }
            return wrapResult(res, result);
        });
    });
}
