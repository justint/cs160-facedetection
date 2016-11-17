var jobCount = 0;

// Handler for new job button below job list -- displays new job panel
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

/* Handler for submitting/queueing a new job.
 *
 * Performs the following steps:
 * 1. Halts the default form operation (prevents premature submission).
 * 2. Grabs the video + video filetype.
 * 3. Verifies submitted file is indeed a video
 * 4. Hides "No jobs queued..." message, increments job count
 * 5. Grabs video metadata, sends metadata + file to server
 * 6. Adds job to UI job list
 */
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

  // Send form data to server
  form.submit();

  /* The following block of code performs these important functions:
   * 1. Loads the jquery-template plugin
   * 2. Spits out a filled template in a newly appended job div (see line above)
   * 3. Displays/animates the job being added to the job list
   */
  $('.job-list').append($("<div class=\"job-" + jobData.jobNum + "\"/>").load( "/templates/job.html", function() {
    $.getScript('/js/jquery.loadTemplate.min.js', function()
    {
        $(".job-" + jobData.jobNum).loadTemplate($("#template"),
        {
            jobName: jobData.filename,
            jobNum: jobCount,
            filesize: formatBytes(jobData.filesize, 2),
            submit_time: jobData.submitDateTime,
            status: jobData.status,
            thumbnail: "/img/thumbnail.gif"
          }, { success: function() {
            // Executed after template is filled -- animates job entrance
            $('.new-job').slideDown("fast");
            $('.new-job').animate({"opacity": "1", "marginTop": 0}, 500);

              // Hide add-job panel
              $("#new-job-panel").animate({
                "opacity": 0,
                "margin-top": "100px"
              }, 500 );
            }
        });
    });
  }));
});

// Used in job filesize formatting
function formatBytes(bytes, decimals) {
   if(bytes == 0) return '0 bytes';
   var k = 1000; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/* Handler for the Start Job button in a given Job.
 * Will send an AJAX POST request to the server to begin pipeline execution.
 */
$(document).on('click', ".start-job-button", function(e) {
    var jobNum = e.currentTarget.id;

    $.ajax({
      url: "/start-job",
      method: "POST",
      data: { "job-number": jobNum }
    })
      .done(function(e) {
        alert("Job started: " + e);
    });
});
