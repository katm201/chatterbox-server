var url = require('url');
var fs = require('fs');

/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var requestHandler = function(request, response) {
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/
  
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var urlInfo = url.parse(request.url);

  var headers = defaultCorsHeaders;

  var preferredRoute = '/classes/messages';
  
  if (urlInfo.pathname === preferredRoute) {
    var method = request.method;
    var statusCode;    
    
    if (method === 'GET') {
      statusCode = 200;
    } else if (method === 'POST') {
      statusCode = 201;
    }
    
    var reqHeaders = request.headers;
    var object = {};
    object.results = [];
    request.on('data', chunk => { object.results.push(chunk); });
    
    var type = 'text/plain';
    if (request.headers !== undefined && (request.headers['content-type'] !== undefined)) {
      type = request.headers['content-type']; 
    }
    headers['Content-Type'] = type;
    
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(object));
  } else {
    var statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end('404 not found');
  }
};

module.exports.requestHandler = requestHandler;

// ls methods to keep in mind
  // mkdir()
  // readdir()
  // readFile()
  // writeFile()
