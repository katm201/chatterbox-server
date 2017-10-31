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
  
  var query = urlInfo.query;
  
  if (urlInfo.pathname === preferredRoute) {
    var method = request.method;
    var reqHeaders = request.headers;
    var type = 'text/plain';
    if (request.headers !== undefined && (request.headers['content-type'] !== undefined)) {
      type = request.headers['content-type']; 
    }
    headers['Content-Type'] = type;    
    
    if (method === 'POST') {
      var body = '';
      request.on('data', chunk => { body += chunk; });
      

      
      var date = new Date();
      var id = date.getTime();
    
      request.on('end', chunk => {
        let parsedBody;
        
        if (body[0] === '{') {
          parsedBody = JSON.parse(body);
        } else {
          let bodyFixedSpaces = '';
          body.split('').forEach(function(character) {
            if (character === '+') {
              bodyFixedSpaces += ' ';
            } else {
              bodyFixedSpaces += character;
            }
          });
          let bodyElements = bodyFixedSpaces.split('&');
          let elements = [];
          bodyElements.forEach(function(item) {
            elements = elements.concat(item.split('='));
          });
          parsedBody = {};
          for (var i = 1; i < elements.length; i++) {
            parsedBody[elements[i - 1]] = elements[i];
          }
        }
        
        var object = {};
        object.createdAt = date;
        object.objectId = id;
        object.username = parsedBody.username;
        object.text = parsedBody.message || parsedBody.text;
        object.message = parsedBody.message || parsedBody.text;

        object = JSON.stringify(object);

        fs.appendFile('storage.txt', object + '\n', function(err, data) {
          if (err) {
            return console.error(error);
          }
        });  
      });
      
      response.writeHead(201, headers);
      response.end('Message sent to server.');
    } else if (method === 'OPTIONS') {
      // send response
      response.writeHead(200, headers);
      response.end();
    } else if (method === 'GET') {
      // build the request
      var body = '';
      request.on('data', chunk => { body.concat(chunk); });
      
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
