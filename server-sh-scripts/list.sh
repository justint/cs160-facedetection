#!/bin/sh

psql faceservice $USER << EOF
SELECT * FROM jobs;
SELECT * FROM users;
EOF
exit 0;
