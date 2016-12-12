import subprocess
import sys
import extract_metadata

path_to_vid = sys.argv[1]
input_folder = sys.argv[2]
output_folder = sys.argv[3]
vid_id = sys.argv[4]
fps = extract_metadata.find_fps(path_to_vid)


def stitch_stills(folder_in=input_folder, folder_out=output_folder, name=vid_id):
    cmd_patch = ["ffmpeg", "-r", str(fps), "-start_number", "1", "-f", "image2", "-i",
                 folder_in + "/OUTPUT-out%d.png", "-pix_fmt", "yuv420p",
                 "-vcodec", "libx264", folder_out + "/" + name + ".mp4"]
    subprocess.call(cmd_patch)

if __name__ == '__main__':
    stitch_stills()
