var Job = function Job() {
    var self = this;

    var step = 0;

    var num;

    function Job(num) {
      this.num = num;
    }


    self.execute = function execute(num) {
        const execFile = require('child_process').execFile;

        switch(step) {

            case 0:
                //console.log("num: " + num);
                console.log("Executing step 0...");
                const child = execFile("exec/hello-world.sh", [num], (error, stdout, stderr) => {

                  console.log(stdout);

                  if (error) {
                    // No job number given
                    if(error['code'] === 1) {
                      // Handle improper/errorneous job number
                    }
                  }
                  else {
                    stepCallback(self, num);
                  }

                });
                //asyncExecute("ffmpegSplit", stepOneCallback);
                break;
            case 1:
              console.log("Executing step 1...");
                //asyncExecute("OpenFace", stepTwoCallback);
              stepCallback(self, num);
              break;
            default:
                console.log("Job " + num + " is done!");
        }
    }

    function stepCallback(self, num) {
        step++;
        self.execute(num);
    }
};

// REQUIRED for server to see this file, do not delete
module.exports = Job;
