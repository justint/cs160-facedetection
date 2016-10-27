var jobCount = 0;

// Display new job panel
$( "#add-job" ).click(function() {
  $("#new-job-panel").removeClass("hide");
  $("#new-job-panel").animate({
    "margin-top" : 0,
    "opacity": 1
  }, 500 );

});


// Debug job complete notification
$(document).keypress(
  function(event) {
    if (event.key == 'j') {
      $('.notification-area').append("<div class=\"alert alert-success alert-dismissable\" id=\"test-alert\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><strong>Job complete!</strong> Job 4 has completed with <strong>0</strong> errors.</div>");
      $('#test-alert').animate({"opacity": 1}, 500);
    }});

// Error message for bad filetype upload
function errorFiletype() {
  $('.notification-area').append("<div class=\"alert alert-warning alert-dismissable\" id=\"alert-improperfiletype\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><strong>Improper filetype!</strong> The file you selected for upload is not a video. Please upload a video file.</div>");
  $('#alert-improperfiletype').animate({"opacity": 1}, 500);
}

// New job submission function
$("#video-submit").submit(function(e) {
  e.preventDefault();

  var form = this;
  var video = form.elements["video-file"];

  var videoType = form.elements["video-file"].files[0].type;

  // Verify video mimetype, throw error if invalid
  if (!videoType.match(/video\/./))
  {
    errorFiletype();
    return;
  }

  // Hide no-job text
  if (jobCount == 0) $('.no-job-text').animate({"opacity": "0"}, 700).detach();

  jobCount++;

  var jobData = {
    filename: video.files[0].name,
    jobNum: jobCount,
    filesize: video.files[0].size,
    submitDateTime: new Date(),
    status: "waiting to start"
  }

  // Update form job number
  form.elements["job-number"].value = jobCount;

  // Produce awful html blocks for new job
  var preFilename = "<div class=\"job new-job panel panel-default\"><table class=\"job\"><tr><td class=\"job-thumbnail\"><img data-src=\"holder.js/200x200\" class=\"job img-thumbnail\" alt=\"100x100\" src=\"img/thumbnail.gif\" data-holder-rendered=\"true\"></td><td class=\"job-body\"><table class=\"job job-body\"><tr><td class=\"job-name\">";
  var preJobId = "</td><td class=\"job-num\">";
  var preFilesize = "</td></tr><tr><td>Filesize: ";
  var preSubmitDateTime = " bytes</td></tr><tr><td>Submit time: ";
  var preStatus ="</td></tr><tr><td>Status: ";
  var rest = "</td><td class=\"job-buttons\"><button id=\"start-job-button\">Start job</button></td></tr></table></td></tr></table></div>";

  // Concatenate this ugly disgusting new job
  var newJobHTML = preFilename + jobData.filename + preJobId + jobData.jobNum +
    preFilesize + jobData.filesize + preSubmitDateTime + jobData.submitDateTime +
    preStatus + jobData.status + rest;

  form.submit();

  // Add job to job-list
  $('.job-list').append( newJobHTML );
  $('.new-job').slideDown("fast");
  $('.new-job').animate({"opacity": "1", "marginTop": 0}, 500);

  // Hide add-job panel
  $("#new-job-panel").animate({
    "opacity": 0,
    "margin-top": "100px"
  }, 500 );

});

$(document).on('click', "#start-job-button", function() {
    var jobNum = $(".job-num")[0].textContent;

    $.ajax({
      url: "/start-job",
      method: "POST",
      data: { "job-number": jobNum }
    })
      .done(function(e) {
        alert("Job started: " + e);
    });
});
