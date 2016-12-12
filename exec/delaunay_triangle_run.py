#!/usr/local/bin/python

# Import the os module, for the os.walk function
import os, string, sys, shutil

"""
ASSUME: ALL POINTS ARE MADE
before execution make sure the directory is currently the un-meshed frames directory

delaunay_triangle_run.py <my exec program entire path> <path of un-meshed frames> <path of all the points>

delaunay_triangle_run.py argv1 argv2 argv3

example:
delaunay_triangle_run.py /Users/shelleywu/Desktop/edited_draw_delaunay_triangles /Users/shelleywu/Desktop/InFramesLib /Users/shelleywu/Desktop/PtsLib

"""

for dirName, subdirList, fileList in os.walk(sys.argv[3]):
    for subdirName in subdirList:
        temppath = sys.argv[2] + "/" + subdirName
        #print(subdirName)
        imagepath = subdirName
        subdirPath = sys.argv[3] + "/" + subdirName
        #move all face-mesh frames to this path
        if os.path.isdir(temppath):
            for tempDirName, tempSubdirList, tempFileList in os.walk(temppath):
                #walk input frames
                for tempFname in tempFileList:
                    tempfilename = tempFname.partition('.')[0] + "_det_0.pts"
                    #print(tempFname.partition('.')[0])
                    imagename = tempFname.partition('.')[0]
                    os.chdir(temppath)
                    #print(temppath)
                    for subDirName, subSubdirList, subFileList in os.walk(subdirPath): #walk pts file
                        for ptsfilename in subFileList:
                            if tempfilename in ptsfilename:
                                dud = "_det_0.pts"
                                if not tempfilename is dud:
                                    #print(tempfilename)
                                    #cmd = <path of program> <image> <path of pts file>
                                    cmd = sys.argv[1] + " " + imagename + ".png " + sys.argv[3] + "/" + imagepath + "/" + tempfilename
                                    #print(cmd)
                                    os.system(cmd)



