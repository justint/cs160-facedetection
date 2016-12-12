var configAuth = require('../config/auth');
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || configAuth.database.url;


var Job = function Job(num, jobData) {
    var self = this;

    var step = 0;

    this.num = num;
    this.complete = false;
    //console.log("new job jobData: " + jobData);
    this.jobData = jobData;

    var fullPath = "/Users/justintennant/Desktop/cs160-testdrive/";


    self.execute = function execute(num, jobData) {
        const execFile = require('child_process').execFile;
        console.log("starting job " + num);

        switch(step) {

            case 0:
                updateDatabaseStep(step, jobData);
                console.log("Executing step 0, frame splitting...");
                const child = execFile("python", ["/Users/justintennant/Desktop/cs160-testdrive/exec/frame_split.py", fullPath + jobData[1].path], (error, stdout, stderr) => {

                  console.log(stdout);

                  if (error) {
                    // No job number given
                    if(error['code'] === 1) {
                      // Handle improper/errorneous job number
                    }
                  }
                  else {
                    jobData.framePath = stdout.slice(stdout.length - 11, stdout.length).trim();
                    console.log("framePath: " + jobData.framePath);

                    stepCallback(self, num, jobData);
                  }

                });
                //asyncExecute("ffmpegSplit", stepOneCallback);
                break;
            case 1:
              updateDatabaseStep(step, jobData);
              console.log("Executing step 1, point generation...");
              var openfaceexec = "/Users/justintennant/Desktop/openface/OpenFace/build/bin/FaceLandmarkImg";
              var framesplit = "/Users/justintennant/Desktop/cs160-testdrive/exec/frame_split";
              var pointsrun = "/Users/justintennant/Desktop/cs160-testdrive/exec/points_run";
              const child2 = execFile("python", ["/Users/justintennant/Desktop/cs160-testdrive/exec/points_run.py", openfaceexec, framesplit, pointsrun], (error, stdout, stderr) => {

                console.log(stdout);

                if (error) {
                  // No job number given
                  if(error['code'] === 1) {
                    // Handle improper/errorneous job number
                  }
                }
                else {
                  stepCallback(self, num, jobData);
                }

              });
                //asyncExecute("OpenFace", stepTwoCallback);
              break;

            case 2:
              updateDatabaseStep(step, jobData);
              console.log("Executing step 2, drawing triangles + pupils...");
              var drawexec = "/Users/justintennant/Desktop/cs160-testdrive/exec/draw_delaunay_triangles_pupil_tracking";
              var frames = "/Users/justintennant/Desktop/cs160-testdrive/exec/frame_split";
              var points = "/Users/justintennant/Desktop/cs160-testdrive/exec/points_run";
              const child3 = execFile("python", ["/Users/justintennant/Desktop/cs160-testdrive/exec/delaunay_triangle_run.py", drawexec, frames, points], (error, stdout, stderr) => {

                console.log(stdout);

                if (error) {
                  // No job number given
                  if(error['code'] === 1) {
                    // Handle improper/errorneous job number
                  }
                }
                else {
                  stepCallback(self, num, jobData);
                }

              });
                //asyncExecute("OpenFace", stepTwoCallback);
              break;
            case 3:
              updateDatabaseStep(step, jobData);
              console.log("Executing step 3, stitching video...");
              var vidPath = "/Users/justintennant/Desktop/cs160-testdrive/" + jobData[1].path;
              var input_folder = "/Users/justintennant/Desktop/cs160-testdrive/exec/frame_split" + jobData.framePath;
              var output_folder = "/Users/justintennant/Desktop/cs160-testdrive/exec/output";
              var vid_id = jobData[1].filename;
              console.log("step 3 command: python frame_stitch.py " + vidPath + " " + input_folder + " " + output_folder + " " + vid_id);
              const child4 = execFile("python", ["/Users/justintennant/Desktop/cs160-testdrive/exec/frame_stitch.py", vidPath, input_folder, output_folder, vid_id], (error, stdout, stderr) => {

                console.log(stdout);

                if (error) {
                  // No job number given
                  if(error['code'] === 1) {
                    // Handle improper/errorneous job number
                  }
                }
                else {
                  stepCallback(self, num, jobData);
                }

              });
                //asyncExecute("OpenFace", stepTwoCallback);
              break;
            default:
                console.log("Job " + num + " is done!");
                this.complete = true;
                //console.log(this.complete);

                // Delete unneeded folders/files
        }
    }

    function stepCallback(self, num, jobData) {
        step++;
        self.execute(num, jobData);
    }

    function updateDatabaseStep(step, jobData) {
      // Get a Postgres client from the connection pool
      pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
        }
        // SQL Query > Update Data
        client.query('UPDATE jobs SET status=($3) WHERE ownerid=($1) AND jobnumber=($2)',
        [jobData[0].ownerid, jobData[1].jobNum, ++step]);
      });
    }
};

// REQUIRED for server to see this file, do not delete
module.exports = Job;
