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

var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'content-type': 'application/json'
};

var sendResponse = function(response, data, statusCode) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

var actions = {
  'GET': function(request, response) {
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
      
      sendResponse(response, object);
    });
  },
  'POST': function(request, response) {
    var body = '';
    request.on('data', chunk => { body += chunk; });
    
    var date = new Date();
    var id = date.getTime();
  
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
    
    sendResponse(response, 'message sent to server', 201);
  },
  'OPTIONS': function(request, response) {
    sendResponse(response, null);
  }
};

var requestHandler = function(request, response) {
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/
  
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var urlInfo = url.parse(request.url);
  
  var query = urlInfo.query;
  
  // checks that the client is accessing the correct path
  if (urlInfo.pathname !== '/classes/messages') {  
    sendResponse(response, 'Not Found', 404);
  }
  
  // runs our correct function, depending on the request method
  var action = actions[request.method];
  if (action) {
    action(request, response);
  } else {
    sendResponse(response, 'Not Found', 404);
  }


};

module.exports.requestHandler = requestHandler;
