# db2-rest-node-sample
DB2 for z/OS REST API Sample with node.js
This sample application uses the services that we created in the db2-rest-sample - i.e.
* GetDepartments
* GetEmployeesByDepartment
We're using the express node framework to make life a little easier.

Elements in this package are:
* servTLS.js - this is the node server
* package.json - this is the npm package config
* \node_modules - this is the npm provisioned packages (inc express)
* \public - this contains the static elements (staff.html, staff.css, jquery.min.js - v3.1.0)

Before running this, you will need to:
1. Create the services in your DB2 for z/OS. Instructions are in the db2-rest-sample
2. Create your own supporting certificates in RACF - see the db2geek blog on REST and node.js
3. Update the servTLS.js to change:
   a) host to the IP address/name for your DB2 for z/OS service
   b) port to the SECPORT (AT-TLS encrypted DB2 DDF port) of your DB2 for z/OS service
   c) certificate file names (zpdtca.pem, zpdt_webclient.keys.pem, zpdt_webclient.cert.pem)
