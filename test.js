const express = require("express");
const https = require('https');
const myParser = require("body-parser");
//var fastcsv = require('fast-csv');
var app = express();
//const sqlite3 = require('sqlite3').verbose();
const uuid = require('uuid');
const session = require('express-session');
var cors = require('cors');
var fs = require('fs');
const fileUpload = require('express-fileupload');
// var multer = require('multer');
// var upload = multer();
//const formidable = require('formidable');
//const { format } = require("path");
var mysql = require('mysql');
require('dotenv').config();

function createTables() {
	// Code to create students' table
	db.query('CREATE TABLE Students(FirstName varchar(255), LastName varchar(255), RollNo varchar(255))', (err) => {
		if (err) console.log("Students table exists");
	});

  // Code to create Session table
	db.query('CREATE TABLE Sessions(SessionKey varchar(255), AccessToken varchar(255), RefreshToken varchar(255), LdapID varchar(255), AccType varchar(255), LoginTime varchar(255))', (err) => {
		if (err) console.log("Session table exists");
  });

  // Code to create Projects table
	db.query('CREATE TABLE Projects(pid varchar(255), name varchar(255), initiative_club varchar(255), poc varchar(255), poc_contact varchar(255), abstract varchar(255), funds_allocated FLOAT(20,5), funds_reimbursed float(20,5), documentation varchar(255), timeline varchar(255), comments varchar(255), approved boolean, completed boolean, archived boolean)', (err) => {
		if (err) console.log("Projects table exists");
  });
}


var db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "dev@1234",
  database: "testing",
  port: 3306,
});

// var db = mysql.createConnection({
// 	host: process.env.HOST,
// 	user: process.env.USER,
// 	password: process.env.PASSWORD,
// 	database: process.env.DATABASE
// });

db.connect(function(err) {
	if (err) throw err;
	createTables();
	console.log("Connected to MySQL database");
});


const STUDENT_URL = process.env.STUDENT_URL;
const VERIFIER_URL = process.env.VERIFIER_URL;
const redirect_uri = process.env.REDIRECT_URI;

const student_types = ['ug', 'dd', 'pg', 'rs'];

app.use(session({
	genid: (req) => {
		// console.log('Inside the session middleware');
		// console.log(req.sessionID);
		return uuid.v4(); // use UUIDs for session IDs
	},
	name: 'mysesCookie',
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true
}));

app.use(myParser.urlencoded({extended : true}));
app.use(myParser.json());
// app.use(upload.array());
var allowedOrigins = [STUDENT_URL, VERIFIER_URL];
var corsOptions = {
    //origin: 'http://localhost:4200',
    credentials: true
};

app.use(cors(corsOptions));

var cors2 = function(req, res, next) {
  // var whitelist = [
  //   STUDENT_URL,
  //   VERIFIER_URL,
  // ];
  // var origin = req.headers.origin;

  // if (whitelist.indexOf(origin) > -1) {
  //   res.setHeader('Access-Control-Allow-Origin', origin);
  // }
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
}
app.use(cors2);
app.use(fileUpload());

//////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
// A login request is made
app.get("/api/login", function(req, response) {


let values = [req.sessionID,'1','1','1','student','22222'];
let val = ['abc','def','1'];

db.query('DELETE FROM Students where RollNo = (?)', ['1']);
db.query('INSERT INTO Students VALUES(?,?,?)', val);
db.query('INSERT INTO Sessions VALUES(?,?,?,?,?,?)', values);
console.log("made it here!!!");
response.redirect(STUDENT_URL);

// 	if (req.query.code == undefined) {
// 		response.redirect(STUDENT_URL);
// 		return;
// 	}

// 	var AUTH_CODE = req.query.code;

// 	var request_query = 'code='+AUTH_CODE+'&redirect_uri='+redirect_uri+'&grant_type=authorization_code';

// 	// Create an API call to get access and refresh tokens
// 	const options = {
// 		hostname: 'gymkhana.iitb.ac.in',
// 		path: '/profiles/oauth/token/',  
// 		method: 'POST',
// 		headers: {

// 			'Authorization': process.env.SSO_AUTH,
// 			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
// 		}
// 	};

// 	const request = https.request(options, (res) => {
// 		let data = '';

// 		res.on('data', (chunk) => {
// 			data += chunk;
// 		});

// 		res.on('end', () => {
// 			let responseResult = JSON.parse(data);
// 			console.log(responseResult);

// 			if (responseResult.access_token != undefined) {

// 				// Create an API call to fetch student data
// 				const options2 = {
// 					hostname: 'gymkhana.iitb.ac.in',
// 					path: '/profiles/user/api/user/?fields=first_name,last_name,type,roll_number',  
// 					method: 'GET',
// 					headers: {
// 						'Authorization': 'Bearer ' + responseResult.access_token,
// 					}
// 				};

// 				const getRequest = https.request(options2, (res) => {
// 					let data = '';

// 					res.on('data', (chunk) => {
// 						data += chunk;
// 					});

// 					res.on('end', () => {
// 						let getResult = JSON.parse(data);
// 						console.log(getResult);
// 						let accType = "";

// 						if (getResult.id != undefined) {

// 							if (student_types.includes(getResult.type)) {		// The login request is made by a student
// 								accType += "student"

// 								db.query("SELECT * FROM Students WHERE RollNo = (?)", [getResult.roll_number], (err, row) => {
									
// 									// Delete any previously active session (very rare)
// 									db.query("DELETE FROM Sessions WHERE SessionKey=(?)", [req.sessionID]);

// 									// If student data doesn't exist in our db, then insert it
// 									if (row.length == 0) {

// 										let vals = [getResult.first_name, getResult.last_name, getResult.roll_number];
// 										db.query("INSERT INTO Students VALUES (?, ?, ?)", vals, (err, row) => {
// 											// Create a new entry
// 											db.query("SELECT * FROM IBs WHERE LdapID = (?)",[vals[2]],(err,row)=>{
// 												if(row.length > 0 || IC_LIST.includes(vals[2]))
// 													accType += " verifier";

// 												let values = [req.sessionID, responseResult.access_token, responseResult.refresh_token, getResult.roll_number, accType, new Date().toISOString().slice(0, 19).replace('T', ' ')];
// 												db.query("INSERT INTO Sessions VALUES (?, ?, ?, ?, ?, ?)", values);
// 												response.redirect(STUDENT_URL);
// 												console.log("[LOGIN] Student Login Success ",getResult.roll_number);
// 												console.log("[LOGIN] SessionID ",req.sessionID);
// 											})
// 										});
// 									}
// 									else {
// 										// Create a new entry
// 										let vals = [getResult.first_name, getResult.last_name, getResult.roll_number];
// 										db.query("SELECT * FROM IBs WHERE LdapID = (?)",[vals[2]],(err,row)=>{
// 											if(row.length > 0 || IC_LIST.includes(vals[2]))
// 												accType += " verifier";

// 											let values = [req.sessionID, responseResult.access_token, responseResult.refresh_token, getResult.roll_number, accType, new Date().toISOString().slice(0, 19).replace('T', ' ')];
// 											db.query("INSERT INTO Sessions VALUES (?, ?, ?, ?, ?, ?)", values);
// 											response.redirect(STUDENT_URL);
// 											console.log("[LOGIN] Student Login Success ",getResult.roll_number);
// 											console.log("[LOGIN] SessionID ",req.sessionID);
// 										})
// 									}
// 								});
// 							}
// 							else {						// The login request is made by an IB

// 								var uname = getResult.username;
// 								if (uname == undefined) uname = getResult.roll_number;
// 								if (uname == undefined) {
// 									response.redirect(VERIFIER_URL);
// 									return;
// 								}

// 								db.query("SELECT * FROM IBs WHERE LdapID = (?)", [uname], (err, row) => {
									
// 									// Delete any previously active session (very rare)
// 									db.query("DELETE FROM Sessions WHERE SessionKey=(?)", [req.sessionID]);

// 									// If IB data doesn't exist in our db, then insert it
// 									if (row.length == 0) {

// 										let vals = [getResult.first_name + ' ' + getResult.last_name, uname,getResult.first_name + ' ' + getResult.last_name,'Main'];
// 										db.query("INSERT INTO IBs VALUES (?, ?, ?, ?)", vals, (err, row) => {
// 											// Create a new entry
// 											let values = [req.sessionID, responseResult.access_token, responseResult.refresh_token, uname, 'verifier', new Date().toISOString().slice(0, 19).replace('T', ' ')];
// 											db.query("INSERT INTO Sessions VALUES (?, ?, ?, ?, ?, ?)", values);
// 											console.log("[LOGIN] IB Login Success",uname);
// 											response.redirect(VERIFIER_URL);
// 										});
// 									}
// 									else {
// 										// Create a new entry
// 										let values = [req.sessionID, responseResult.access_token, responseResult.refresh_token, uname, 'verifier', new Date().toISOString().slice(0, 19).replace('T', ' ')];
// 										db.query("INSERT INTO Sessions VALUES (?, ?, ?, ?, ?, ?)", values);
// 										console.log("[LOGIN] IB Login Success",uname);
// 										response.redirect(VERIFIER_URL);
// 									}
// 								});
// 							}
// 						}
// 						else {
// 							response.redirect(STUDENT_URL);
// 						}
// 					});

// 				}).on("error", (err) => {
// 					console.log("Error: ", err.message);
// 				});

// 				getRequest.end();

// 			}
// 			else {
// 				response.redirect(STUDENT_URL);
// 			}
// 		});

// 	}).on("error", (err) => {
// 		console.log("Error: ", err.message);
// 	});

// 	request.write(request_query);
// 	request.end();
	
// 	// res.sendFile(__dirname + "/frontend.html");
// });
});

app.get("/api/logout", (req, res) => {

	db.query("DELETE FROM Sessions WHERE SessionKey=(?)", [req.sessionID], () => {
		res.json({message: "Successfully Logged Out"});
		console.log("[LOGOUT] Logout Success ",req.sessionID);
	});
});


app.get("/api/get-student-data", function(req, res) {

	let sesid = req.sessionID;
	db.query("SELECT * FROM Sessions WHERE SessionKey=(?)", [sesid], (err, r) => {

		if (r.length == 0) {
			res.json({loggedin : false, details: {}});
		}
		else {
			if (r[0].AccType.includes('student')) {
				db.query("SELECT * FROM Students WHERE RollNo = (?)", [r[0].LdapID], (err, row) => {

					if (row.length == 0) {
						res.json("Student is not registered");
						return;
					}

					db.query("SELECT * FROM Points WHERE StudRoll = (?)", [row[0].RollNo], (err, rows) => {
						db.query("SELECT * FROM IBs", (err, cols) => {
							res.json({loggedin : true, details : {FirstName : row[0].FirstName, LastName : row[0].LastName, RollNo : row[0].RollNo, Points : rows, IBs : cols, SesID: sesid}});
						});
					});
				});
			}
			else {
				res.json("Unauthorized usage")
			}
		}
	});
});

app.get("api/tech/projects",function(req, res) {

	let sesid = req.sessionID;
	db.query("SELECT * FROM Sessions WHERE SessionKey=(?)", [sesid], (err, r) => {

		if (r.length == 0) {
			res.json({loggedin: false, details: {}});
		}
		else {
				db.query("SELECT * FROM Projects", (err, row) => {

					if (row.length == 0) {
						res.json({loggedin: true, error: "No Projects"});
						console.log(`[ERROR] No Projects to show.`);
						return;
					}

					data = {loggedin: true, roll: roll, projects: []};
					for (r of rows) {
						data.projects[data.projects.length] = {pid: r.pid,name: r.name, initiative_club: r.initiative_club, poc: r.poc, poc_contact: r.poc_contact, abstract: r.abstract, funds_allocated: r.funds_allocated, funds_reimbursed: r.funds_reimbursed, documentation: r.documentation, timeline: r.timeline, comments: r.comments, approved: r.approved, completed: r.completed, archived: r.archived};
					}
					res.json(data);
				});
			
		}
	});
});

app.get("api/tech/doc",function(req, res){

	let sesid = req.sessionID;
	var pid = req.query.pid;
	
	db.query("SELECT * FROM Sessions WHERE SessionKey=(?)", [sesid], (err, r) => {
		if (r.length == 0)
			response.json({message: "Unauthorized access"});
		else if(!pid) 
			response.json({message: "Invalid request"});		
		else {
			db.query("SELECT * FROM Projects WHERE pid=(?)", [pid], (err, row) => {
				if (row.length == 0 || !row[0].documentation) 
					response.json({message: "No document found"});

				row = row[0];
				var filepath = './docs/' + pid + 'doc';
				fs.readFile(filepath, (err, data) => {
					if (err) {
						response.json({message: "Error in reading file"});
						console.log(`[ERROR] Document with ${pid} not readable.`);
					}
					else {
						console.log(`Document with PID: ${pid} requested.`);
						response.setHeader('Content-type', row.documentation);
						response.setHeader('X-Robots-Tag','noindex, nofollow')
						response.write(data);
						return response.end();
					}
				});
			});
		}
	});
});


app.listen(8080);