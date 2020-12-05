var mysql = require('mysql');
const express = require("express");
const session = require('express-session');
const fileUpload = require('express-fileupload');
var cors = require('cors');
const uuid = require('uuid');
require('dotenv').config();


var app = express();

var db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "dev@1234",
  port: 3306,
});

function createTables() {
	// Creating a table to store the student's data
	db.query('CREATE TABLE Students(FirstName varchar(255), LastName varchar(255), RollNo varchar(255))', (err) => {
		if (err) console.log("Students table exists");
	});

	// Creating a table to store the value of the session
	db.query('CREATE TABLE Sessions(SessionKey varchar(255), AccessToken varchar(255), RefreshToken varchar(255), LdapID varchar(255), AccType varchar(255), LoginTime datetime)', (err) => {
		if (err) console.log("Session table exists");
	});

	// 
	db.query('CREATE TABLE IBs(Name varchar(255), LdapID varchar(255), ParentBody varchar(255), Department varchar(255))', (err) => {
		if (err) console.log("IBs table exists");
	});

	// Creating a Project table
	db.query('CREATE TABLE Project(ProjectID varchar(255), Text varchar(4095), Status int, Hidden bool, StudRoll varchar(255), StudName varchar(255), IBLdap varchar(255), IBName varchar(255), StudComment varchar(4095), Feedback varchar(4095), IndexNo int, DocType varchar(255), ParentPointID varchar(255), HasChild boolean, Tag varchar(255))', (err) => {
		if (err) console.log("Points table exists");
	});
}

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  // con.query("CREATE DATABASE testing", function (err, result) {
  //   if (err) throw err;
  //   console.log("Database created");
  // });
  
});

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


app.use(cors({
    origin: '*',
    credentials: true
  }));
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


