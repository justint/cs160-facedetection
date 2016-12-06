#!/bin/sh

psql faceservice $USER << EOF
SELECT * FROM jobs WHERE ownerid = 1;
EOF
exit 0;