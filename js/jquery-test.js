/**
 * Stores local copy of user's job queue count.
 *
 *  TODO: load this number (along with queue) at page load
 */
var jobCount = 0;

/* Stores strings used in job statuses. */
var strings = {
  uploading : "uploading...",
  ready_to_start : "ready to start",
  processing : "processing...",
  done : "job complete"
}

/* Handler for new job button below job list, displays new job panel. */
$( "#add-job" ).click(function() {
  $("#new-job-panel").removeClass("hide");
  $("#new-job-panel").animate({
    "margin-top" : 0,
    "opacity": 1
  }, 500 );
});

/**
 * Pseudo-enums for different types of alerts generated using genJobAlert().
 *
 * Passed into genJobAlert(alertType) from jobExecListener().
 */
var Alerts = {
  DANGER : 0,
  SUCCESS : 1,
  INFO : 2,
  WARNING : 3
}

/**
 * Produces job-related alerts and injects them into the page.
 *
 *  alertType: one of the pseudo-enums from the Alerts var
 *  jobData: array of data about the job
 */
function genJobAlert(alertType, jobData) {
  switch(alertType)
  {
    case Alerts.SUCCESS:
    {
      // Inject templated html, fill data using loadTemplate script, display
      $('.notification-area').append($("<div class=\"alert-success-job-" + jobData.jobNum + "\"/>").load( "/templates/notification_success.html", function() {
        $.getScript('/js/jquery.loadTemplate.min.js', function()
        {
            $(".alert-success-job-" + jobData.jobNum).loadTemplate($("#template"),
            {
                jobNum: jobCount
              }, { success: function() { // Executed after template is filled
                $(".alert-success-job-" + jobData.jobNum).animate({"opacity": 1}, 500);
              }
            }
          )
        });
      }));
      break;
    }
    case Alerts.WARNING:
    {
      // TODO
      break;
    }
    case Alerts.DANGER:
    {
      // TODO
      break;
    }
    case Alerts.INFO:
    {
      // TODO
      break;
    }
  }

}

/**
 * Alert displayer for bad uploaded filetypes.
 *
 * Is called for both client-side and server-side responses.
 */
function errorFiletype() {
  $('.notification-area').append("<div class=\"alert alert-warning alert-dismissable\" id=\"alert-improperfiletype\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><strong>Improper filetype!</strong> The file you selected for upload is not a video. Please upload a video file.</div>");
  $('#alert-improperfiletype').animate({"opacity": 1}, 500);
}

/**
 * Handler for pressing the Queue job button.
 *
 * Performs the following steps:
 *  1. Halts the default form operation (prevents premature submission).
 *  2. Grabs the video + video filetype.
 *  3. Verifies submitted file is indeed a video
 *  4. Increments client-side job count
 *  5. Creates jobData array
 *  6. Grabs video metadata, sends metadata + file to server
 *  7. Adds job to UI job list
 */
$("#video-submit").submit(function(e) {
  // Prevent default form operation
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
    status: "uploading...",
    pingType: 0
  }

  // Update form job number
  form.elements["job-number"].value = jobCount;

  // Send form data to server
  form.submit();

  addJobToJobList(jobData);

  // Start listener for file upload status
  uploadListener(jobData);
});

/**
 * A listener to check the status of a job file upload by pinging the server.
 *
 * Has a timeout variable to control length between each ping to the server for
 * information.
 *
 * In each ping, it first checks the dead_iframe on current page for error
 * information passed from the server, and handles accordingly. If no error,
 * moves along to the POST call. If call is successful, cancels ping and
 * updates job's visual status elements (status text, button, etc).
 *
 * jobData: array of data about the job
 */
function uploadListener(jobData) {
    var timeout = 1000;

    console.log("Starting uploadListener...");

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
              var jobProcessingIcon = $("td[class='job-num']:contains(" + jobData.jobNum + ")")[0].parentElement.parentElement.querySelector(".job-processing-icon");
              jobProcessingIcon = $(jobProcessingIcon);
              jobProcessingIcon.animate({"opacity": "0"}, 500);
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

      console.log("Pinging server about upload status on job " + jobData.jobNum);
      $.post("/job-status", jobData, 'json')
        .done(function() {
          console.log("Job " + jobData.jobNum + " file uploaded, stopping uploadListener");
          clearInterval(ping);
          // Enable button, hide processing icon, update status text, dear god this is ugly
          $("td[class='job-num']:contains(" + jobData.jobNum + ")")[0].parentElement.parentElement.querySelector("button").disabled = false;

          var jobProcessingIcon = $("td[class='job-num']:contains(" + jobData.jobNum + ")")[0].parentElement.parentElement.querySelector(".job-processing-icon");
          jobProcessingIcon = $(jobProcessingIcon);
          jobProcessingIcon.animate({"opacity": "0"}, 500);

          $("td[class='job-num']:contains(" + jobData.jobNum + ")")[0].parentElement.parentElement.querySelector("#job-status").innerHTML = strings.ready_to_start;
      });
    }, timeout);
}

/**
 * Adds given job to the client-side job list.
 *
 * Targets the job-list, appends a loaded templated html file in a new div, uses
 * the jquery-template script to target that new div and fill in the loaded
 * template, and then animates the job entrance + hides add-job panel and no-job
 * text.
 *
 *  jobData: array of data about the job
 */
function addJobToJobList(jobData) {
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
        $("td[class='job-num']:contains(" + jobNum + ")")[0].parentElement.parentElement.querySelector("button").disabled = true;
        var jobProcessingIcon = $("td[class='job-num']:contains(" + jobNum + ")")[0].parentElement.parentElement.querySelector(".job-processing-icon");
        jobProcessingIcon = $(jobProcessingIcon);
        jobProcessingIcon.animate({"opacity": "1"}, 500);
        $("td[class='job-num']:contains(" + jobNum + ")")[0].parentElement.parentElement.querySelector("#job-status").innerHTML = strings.processing;
        jobExecListener(jobNum);
    });
});

function jobExecListener(jobNum) {
   var timeout = 5000;

   console.log("Starting jobExecListener...");
   var ping = setInterval(function() {
     $.ajax({
       url: "/job-status",
       method: "POST",
       data: {
         "jobNum" : jobNum,
         "pingType" : 1
        }
     })
      .done(function(e) {
        if (e) // Job is done
        {
          console.log("Job " + jobNum + " done, stopping jobExecListener");
          clearInterval(ping);
          var jobProcessingIcon = $("td[class='job-num']:contains(" + jobNum + ")")[0].parentElement.parentElement.querySelector(".job-processing-icon");
          jobProcessingIcon = $(jobProcessingIcon);
          jobProcessingIcon.animate({"opacity": "0"}, 500);
          $("td[class='job-num']:contains(" + jobNum + ")")[0].parentElement.parentElement.querySelector("#job-status").innerHTML = strings.done;

          // Todo: return actual set of job complete data (errors, etc)
          genJobAlert(Alerts.SUCCESS, { "jobNum" : jobNum });
          // Turn start job button into download button
        }
    });
  }, timeout);
}

/* Handler for loading jobs in the job list.
 * 
 */
$(document).ready(function() {

});
