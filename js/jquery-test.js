var jobCount = 0;

// Add job process
$( "#add-job" ).click(function() {
  // check if detached already
  if (jobCount == 0) $('.no-job-text').animate({"opacity": "0"}, 700).detach();
  $('.job-list').append( genJob() );
  $('.new-job').slideDown("fast");
  $('.new-job').animate({"opacity": "1", "marginTop": 0}, 500);
});

// Debug job complete notification
$(document).keypress(
  function(event) {
    if (event.key == 'j') {
      $('.notification-area').append("<div class=\"alert alert-success alert-dismissable\" id=\"test-alert\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><strong>Job complete!</strong> Job 4 has completed with <strong>0</strong> errors.</div>");
      $('#test-alert').animate({"opacity": 1}, 500);
    }});

// Generates new job data + HTML
function genJob() {
  jobCount++;

  // This is the part where you grab video data (filename, frame count, etc)
  // ...
  // Random names/frame counts are given for debug
  var jobData = {
    filename: "video-" + (Math.random() * 10).toFixed(0),
    jobNum: jobCount,
    frameCount: (Math.random() * 10000).toFixed(0),
    frameRate: Math.round(Math.random()) == 1 ? 24 : 30,
    submitDateTime: new Date()
  }

  var returnString;
  $.ajax({
    url: "http://localhost:3000/",
    data: jobData,
    async: false,
    method: "POST"
    }).done(function() {
      // Boilerplate HTML code for job list element
      var preFilename = "<div class=\"job new-job panel panel-default\"><table class=\"job\"><tr><td><img data-src=\"holder.js/200x200\" class=\"job img-thumbnail\" alt=\"100x100\" src=\"img/thumbnail.gif\" data-holder-rendered=\"true\"></td><td class=\"job-body\"><table class=\"job job-body\"><tr><td class=\"job-name\">";
      var preJobId = "</td><td class=\"job-num\">";
      var preFrameCount = "</td></tr><tr><td>Frames: ";
      var preFrameRate = "</td></tr><tr><td>Framerate: ";
      var preSubmitDateTime =" frames/second</td></tr><tr><td class=\"job-submitdatetime\">";
      var rest = "</td><td class=\"job-buttons\"><button>Start job</button></td></tr></table></td></tr></table></div>";

      returnString = preFilename + jobData.filename + preJobId + jobData.jobNum +
        preFrameCount + jobData.frameCount + preFrameRate + jobData.frameRate +
        preSubmitDateTime + jobData.submitDateTime + rest;
    }).fail(function() {
      alert("fail");
      // Return malformed job element on bad server response
      returnString = "<p>bad server response</p>";
  });
  return returnString;
}

/*
$("#video-submit").submit(function(e) {
  e.preventDefault();

  var video = document.getElementById("video-file");

  var jobData = {
    video: document.getElementById("video-file"),
    cvSelection: document.getElementById("cv-implementation").value
  }

  $.ajax({
    url: "http://localhost:3000/",
    data: video,
    method: "POST",
  }).done(alert("It works!")).fail(alert("It failed :("));
});
*/
