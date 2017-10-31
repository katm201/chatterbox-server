var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
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
  
  var query = urlInfo.query;
  
  if (urlInfo.pathname === '/classes/messages') {

    var type = 'text/plain';
    if (request.headers !== undefined && (request.headers['content-type'] !== undefined)) {
      type = request.headers['content-type']; 
    }
    headers['Content-Type'] = type;    
    
    if (request.method === 'POST') {
      // build the post request body
      var body = '';
      request.on('data', chunk => { body += chunk; });
      
      var date = new Date();
      var id = date.getTime();
    
      // add post request to the storage file
      request.on('end', chunk => {
        body[0] === '{' ? body = JSON.parse(body) : body = querystring.parse(body);
        
        body.createdAt = date;
        body.objectId = id;
        body.text = body.message || body.text;
        body.message = body.message || body.text;

        fs.appendFile('storage.txt', JSON.stringify(body) + '\n', function(err, data) {
          if (err) {
            return console.error(error);
          }
        });  
      });
      // send response
      response.writeHead(201, headers);
      response.end('Message sent to server.');
    } else if (request.method === 'OPTIONS') {
      // send response
      response.writeHead(200, headers);
      response.end();
    } else if (request.method === 'GET') {
      // read the storage file
      fs.readFile('storage.txt', 'utf8', function(err, data) {
        if (err) {
          return console.error(err);
        }
        
        var object = {};
        var stringArray = data.split('\n');
        stringArray = stringArray.filter(function(item) { 
          if (item !== '') {
            return true;
          }
        });
        object.results = stringArray.map(function(message) {
          return JSON.parse(message);
        });
        
        // send response
        response.writeHead(200, headers);
        response.end(JSON.stringify(object));
      });
    } 
  } else {
    let statusCode = 404;
    response.writeHead(404, headers);
    response.end('404 not found');
  }
};

module.exports.requestHandler = requestHandler;
