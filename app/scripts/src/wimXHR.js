(function() {
	var wimXHR = {
		version: '0.2.1'
	}
	// variable to hold the database name that the client
	// will be querying from
	var _DATABASE = null;

	// domain where API is located
	var _URLbase = 'http://localhost:1337/';

	var _XHR = null;

	// AJAX get request convenience method
	// simple redirects to the post method
	wimXHR.get = function(url, callback) {
		return wimXHR.post(url, {database: _DATABASE}, callback);
	}

	// AJAX post request
	// callback is optional
	// url should not contain a domain name, just a route
	// data shoud be contained within a json
	wimXHR.post = function(url, data, callback) {
		if (url.match(/^\//)) {
			url = url.slice(1);
		}
		data.database = _DATABASE;

		_XHR = _getXHR(_URLbase+url);

		_XHR.post(JSON.stringify(data), function(error, data) {
			if (typeof callback !== undefined)
				callback(error, data);
		});
		return _XHR;
	}

	wimXHR.abort = function() {
		_XHR.abort();
	}

	function _getXHR(url) {
		return d3.xhr(url).response(function(request) {
                    return JSON.parse(request.responseText);
                })
	}
	// retrieves client database name from file 'session.conf'
	d3.json('./session.conf', function(error, config) {
        if (error) {
          console.log('Could not load config file', error);
          return;
        }
        _DATABASE = config.database;
        _URLbase = _URLbase || config.urlbase;
    })

	this.wimXHR = wimXHR;
}) ()