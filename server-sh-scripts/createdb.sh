#!/bin/sh
createdb faceservice;

psql faceservice $USER << EOF

CREATE TABLE jobs(
	ownerid TEXT,
	cvimplementation VARCHAR(64),
	fieldname VARCHAR(64),
	jobnumber integer,
	originalname VARCHAR(64),
	encoding VARCHAR(64),
	mimetype VARCHAR(64),
	destination VARCHAR(64),
	filename VARCHAR(64),
	path VARCHAR(64),
	size integer,
	status integer

);


CREATE TABLE users(
	ownerid integer,
	name VARCHAR(64),
	email VARCHAR(64),
	password VARCHAR(64),
	facebookid VARCHAR(64),
	facebooktoken VARCHAR(64)

);

CREATE SEQUENCE ownerid START 1;

EOF
exit 0;
