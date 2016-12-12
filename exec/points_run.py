#!/usr/local/bin/python

import os, string, sys

"""
points_run.py <executable FaceLandMarkImg> <path of all frames> -o <path of empty folder where to put all the points>

example: points_run.py argv1 argv2 argv3
another example:
points_run.py /Users/shelleywu/OpenFace/build/bin/FaceLandmarkImg /Users/shelleywu/Desktop/InFramesLib /Users/shelleywu/Desktop/PtsLib
"""

print "List of Arguments: ", sys.argv[1], sys.argv[2], sys.argv[3]

for dirName, subdirList, fileList in os.walk(sys.argv[2]):
    for subdirName in subdirList:
        newpath = sys.argv[3] + '/' + subdirName
        print "newpath: ", newpath
        if not os.path.isdir(newpath):
            os.makedirs(newpath)
            cmd = sys.argv[1] + " -fdir " + dirName + "/" + subdirName + " -ofdir " + newpath
            print "command: ", cmd
            os.system(cmd)
