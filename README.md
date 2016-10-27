# CV Web Interface

## Installing

Install the required modules:

`$ npm install`

## Running

Initialize the server:

`$ npm start`

>\> cs160-testdrive@0.2.1 start /Users/justintennant/Desktop/cs160-testdrive

>\> node Server.js

> Live at Port 3000

Ta-da! Now navigate your browser to `127.0.0.1:3000`.

### Example use case:
- Open new job panel by pressing the + button.
- Select video file, OpenCV/OpenFace implementation, press "Queue Job".
- Video file will be uploaded to `/uploads`, job info will be sent to server. Job will be added to job list.
- Press "Start Job" to begin job. Page will send `start-job` POST request with job number to server.

Also, press `j` in the browser to see a sample "completed job" notification.

## To do

### Must do:

- Handle job creation:
  - [ ] Implement file sanitation on server-side
  - [ ] Store job info into Postgres

- Handle job initialization:
  - [ ] Call FFMPEG / script which utilizes FFMPEG for frame splitting
  - [ ] Process frames via OpenFace
  - [ ] Recombine frames with FFMPEG
  - [ ] Serve finished video back to web interface
  - [ ] Remove temp files

- [ ] Assemble Passport.js/OpenID authentication implementation with this web interface

### Should do:

- [ ] Rewrite New Job jQuery actions to load templated HTML instead of injecting HTML block snippets
