var jobCount = 0;

var strings = {
  uploading : "uploading...",
  ready_to_start : "ready to start"
}

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

  jobCount++;

  var jobData = {
    filename: video.files[0].name,
    jobNum: jobCount,
    filesize: video.files[0].size,
    submitDateTime: new Date(),
    status: "uploading..."
  }

  // Update form job number
  form.elements["job-number"].value = jobCount;

  // Send form data to server
  form.submit();

  addJobToJobList(jobData);

  serverListener(jobData);

  // Show job processing icon
  /*
  var jobProcessingIcon = '<div class="job-processing"><span class="job-processing job-processing-icon glyphicon glyphicon-repeat" aria-hidden="true"> </span></div>';
  $('.job-list').append($(jobProcessingIcon));
  jobProcessingIcon = $(jobProcessingIcon);
  $('.job-processing').animate({"opacity": "1"}, 500);
  */

});

function serverListener(jobData) {
    var timeout = 1000;

    console.log("Starting server listener");

    var ping = setInterval(function() {

      var iframeServerResponse = $('iframe')["0"].contentDocument.documentElement.innerText;
      if (iframeServerResponse.localeCompare("") != 0)
      {
        iframeServerResponse = JSON.parse(iframeServerResponse);
        if (iframeServerResponse.error)
        {
          switch(iframeServerResponse.error)
          {
            case "errorFiletype":
              console.log("Filetype error, displaying error message");
              // Hide job-processing icon
              $('.job-processing-icon').animate({"opacity": "0"}, 500).detach();
              errorFiletype();
              break;
            default:
              break;
          }
          clearInterval(ping);

          jobCount--;

          // Empty iframe to prep for future incoming server responses
          document.getElementById('dead_iframe').src = "about:blank";
          //document.getElementById('dead_iframe').contentWindow.location.reload();
        }
      }

      $.post("/add-job", jobData, 'json')
        .done(function() {
          console.log("Job " + jobData.jobNum + " file uploaded");
          clearInterval(ping);
          // Enable button, hide processing icon, update status text, dear god this is ugly
          $("td[class='job-num']:contains(" + jobData.jobNum + ")")[0].parentElement.parentElement.querySelector("button").disabled = false;
          $("td[class='job-num']:contains(" + jobData.jobNum + ")")[0].parentElement.parentElement.querySelector(".job-processing-icon").style.visibility = "hidden";
          $("td[class='job-num']:contains(" + jobData.jobNum + ")")[0].parentElement.parentElement.querySelector("#job-status").innerHTML = strings.ready_to_start;
      });
    }, timeout);
}

function addJobToJobList(jobData) {
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

              // Hide no-job text
              // jobCount check is 1 because jobNum is incremented before this
              // parent function. Essentially 1 == no jobs yet, 2 == one job, etc
              if (jobCount == 1) $('.no-job-text').animate({"opacity": "0"}, 700).detach();

              // Hide job-processing icon
              //$('.job-processing-icon').animate({"opacity": "0"}, 500).detach();
            }
        });
    });
  }));
}

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

/* Handler for loading jobs in the job list.
 *
 */
$(document).ready(function() {

});
