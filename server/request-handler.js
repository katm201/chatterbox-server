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

var messageCount = 0;

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
    var reqHeaders = request.headers;
    var type = 'text/plain';
    if (request.headers !== undefined && (request.headers['content-type'] !== undefined)) {
      type = request.headers['content-type']; 
    }
    headers['Content-Type'] = type;    
    
    var statusCode;
    
    if (method === 'POST') {
      statusCode = 201;
      messageCount++;
      
      var object = {};
      var body = '';
      request.on('data', chunk => { body += chunk; });
      
      object.createdAt = new Date();
      object.objectId = messageCount;
    
      request.on('end', chunk => {
        object.message = JSON.parse(body);
        object = JSON.stringify(object);
        fs.appendFile('storage.txt', object + '~', function(err, data) {
          if (err) {
            return console.error(error);
          }
        });  
      });
      
      response.writeHead(statusCode, headers);
      response.end('Message sent to server.');
    } else if (method === 'GET') {
      statusCode = 200;
      
      // build the request
      var body = '';
      request.on('data', chunk => { body.concat(chunk); });
      
      // read the storage file
      fs.readFile('storage.txt', function(err, data) {
        if (err) {
          return console.error(error);
        }
        
        // formatting object to respond with
        var object = {};
        object.results = [];
        
        // send response
        response.writeHead(statusCode, headers);
        response.end(JSON.stringify(object));
      });
    } 
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
