var mysql = require('mysql');
const express = require("express");
var app = express();
const uuid = require('uuid');

var con = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

function createTables() {
	// Code to create students' table
	db.query('CREATE TABLE Students(FirstName varchar(255), LastName varchar(255), RollNo varchar(255))', (err) => {
		if (err) console.log("Students table exists");
	});

	// Code to create Session table
	db.query('CREATE TABLE Sessions(SessionKey varchar(255), AccessToken varchar(255), RefreshToken varchar(255), LdapID varchar(255), AccType varchar(255), LoginTime datetime)', (err) => {
		if (err) console.log("Session table exists");
	});

	// Code to create IBs (Institute Bodies) table
	db.query('CREATE TABLE IBs(Name varchar(255), LdapID varchar(255), ParentBody varchar(255), Department varchar(255))', (err) => {
		if (err) console.log("IBs table exists");
	});

	// Code to create Points table
	db.query('CREATE TABLE Points(PointID varchar(255), Text varchar(4095), Status int, Hidden bool, StudRoll varchar(255), StudName varchar(255), IBLdap varchar(255), IBName varchar(255), StudComment varchar(4095), Feedback varchar(4095), IndexNo int, DocType varchar(255), ParentPointID varchar(255), HasChild boolean, Tag varchar(255))', (err) => {
		if (err) console.log("Points table exists");
	});
}

con.connect(function(err) {
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
