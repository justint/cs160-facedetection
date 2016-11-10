# CV Web Interface

## Installing

Install the required modules:

`$ npm install`

## Running

Initialize the server:

`$ node Server.js`

> Live at Port 3000

Ta-da! Now navigate your browser to `127.0.0.1:3000`.

### Example use case:
- Open new job panel by pressing the + button.
- Select video file, OpenCV/OpenFace implementation, press "Queue Job".
- Video file will be uploaded to `/uploads`, job info will be sent to server. Job will be added to job list.
- Press "Start Job" to begin job. Page will send `start-job` POST request with job number to server.
- Server will call `execute()` on Job instance, `execute()` iterates through pipeline steps and executes shell code/applications for each respective step.

Also, press `j` in the browser to see a sample "completed job" notification.

## To do

### Must do:

- Handle job creation:
  - [ ] Implement file sanitation on server-side
  - [ ] Store job info into Postgres

- Handle job initialization:
  - [ ] Call script which continues pipeline:
      - FFMPEG for frame splitting
      - Process frames via OpenFace
      - Draw OpenCV implementation
      - Recombine frames with FFMPEG
      - [ ] Handle errors, exceptions for each
  - [ ] Serve finished video back to web interface
  - [ ] Remove temp files

- [ ] Assemble Passport.js/OpenID authentication implementation with this web interface

### Should do (code cleanup):

- [ ] Rewrite Job queueing jQuery actions to load templated HTML instead of injecting HTML block snippets (use .parent to find proper job num)
- [ ] Re-write Job.js to be a class

### Want to do:

- [ ] Implement progress bar in web interface for each pipeline step
- [ ] Support FBX file output from tracked face animation
  - Support files: [rigged face](http://www.turbosquid.com/FullPreview/Index.cfm/ID/341150)


# OpenFace notes

`$ bin/FaceLandmarkVid -device 0`

Webcam drops tons of frames, then kinda works, then crashes (see openface_crash.txt) - Justin
