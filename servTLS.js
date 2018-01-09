// server bits:
const express = require('express');
const app = express();
const path = require('path');
// requestor bits:
var https = require('https');
var url = require('url');
var fs = require('fs');

// Config bits for DB2 for z/OS regular DDF port connection and debug
var host = 's0w1.zpdt.local';
var port = 5041;
var debug = false;

// set the default static data service relative directory (i.e. where to get referenced stuff from)
app.use(express.static('public'));
// what to do if we're asked for root URL - default page
app.get('/', (req,res) => res.sendFile(path.join(__dirname,'/public/staff.html')));
// what to do if we're asked for GetDepartments - make a request to DB2 for z/OS REST service
app.post('/GetDepartments', function (req,res) {
	// create request headers
	var headers = {
		  'Content-Type' : 'application/json',
		  'Accept'       : 'application/json'
		};
	// create request options
	var options = {
		  host: host,
		  port: port,
		  path: '/services/GILLJSRV/GetDepartments',
		  method: 'POST',
		  headers: headers,
		  ca:      fs.readFileSync('zpdtca.pem'),
		  key:     fs.readFileSync('zpdt_webclient.keys.pem'),
		  cert:    fs.readFileSync('zpdt_webclient.cert.pem')
		};
    var responseString = '';
	// create request
	var restreq = https.request(options, function(restres) {
	   restres.setEncoding('utf-8');
	   // when we get data back from the request...
	   restres.on('data',function(data) {
		  responseString += data;
	   });
	   // when the request response has finished
	   restres.on('end',function() {
		  if (debug) {
			  console.log('Response from GetDepartments:');
			  console.log(responseString);
		  }
		  res.send(responseString);
	   });
	});
	// initiate the request
	restreq.end();
});
// what to do if we're asked for GetEmployeesByDepartment:
// - make sure we've been passed mgr and dept values
// - make a request to DB2 for z/OS REST service
app.post('/GetEmployeesByDepartment', function (req,res) {
	// parms supplied in data body, so...
	var data = "";
	req.on('data',function(chunk) {
		data += chunk.toString();
	});
	req.on('end',function() {
		// got the parms, now interpret them by turning it all into an interpretable url:
		var q = url.parse(req.url + '?' + data, true).query;
		if (debug) {
			console.log('GetEmployeesByDepartment using dept = \''+q.dept+'\' & mgr  = \''+q.mgr+'\'');
		}
		if (q.dept == undefined) {
			res.status(500).send('Missing dept parameter');
		} else if (q.mgr == undefined) {
			res.status(500).send('Missing mgr parameter');
		} else {
			// create request data:
			var parms = {
			  'mgr':  q.mgr,
			  'dept': q.dept
			};
			var postData = JSON.stringify(parms);
			// create request headers
			var headers = {
				  'Content-Type' : 'application/json',
				  'Content-Length': postData.length,
				  'Accept'       : 'application/json'
				};
			// create request options
			var options = {
				  host: host,
				  port: port,
				  path: '/services/GILLJSRV/GetEmployeesByDepartment',
				  method: 'POST',
				  headers: headers,
				  ca:      fs.readFileSync('zpdtca.pem'),
				  key:     fs.readFileSync('zpdt_webclient.keys.pem'),
				  cert:    fs.readFileSync('zpdt_webclient.cert.pem')
				};
			var responseString = '';
			// create request
			var restreq = https.request(options, function(restres) {
			   restres.setEncoding('utf-8');
			   // when we get data back from the request...
			   restres.on('data',function(data) {
				  responseString += data;
			   });
			   // when the request response has finished
			   restres.on('end',function() {
				  if (debug) {
					  console.log('Response from GetEmployeesByDepartment:');
					  console.log(responseString);
				  }
				  res.send(responseString);
			   });
			});
			// send the request data
			restreq.write(postData);
			// initiate the request
			restreq.end();
		}
	});
});
// start listening for requests on port 8080
app.listen(8080, () => console.log('servTLS.js listening on port 8080'));
