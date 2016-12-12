import subprocess
import sys

path_to_vid = sys.argv[1]


def find_res(path_to_vid):
    cmd_res = ["ffprobe", "-v", "error", "-of", "flat=s=_",
               "-select_streams", "v:0", "-show_entries", "stream=height,width", path_to_vid]

    out_res = subprocess.check_output(cmd_res)
    split1 = out_res.split("\r\n")
    extracted = []
    for str in split1:
        split2 = str.split("=")
        if len(split2) > 1:
            extracted.append(split2[1])
    # with open("metadata.txt", "w") as text_file:
    #    for res in extracted:
    #        text_file.write(res + "\n")
    numbers = map(int, extracted)
    return numbers


def find_num_frames(path_to_vid):
    cmd_num = ["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries",
               "stream=nb_read_frames", "-of", "default=nokey=1:noprint_wrappers=1", path_to_vid]

    out_num = subprocess.check_output(cmd_num)
    return int(out_num)


def find_fps(path_to_vid):
    cmd_fps = ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
               "stream=r_frame_rate", "-of", "default=noprint_wrappers=1:nokey=1", path_to_vid]

    out_fps = subprocess.check_output(cmd_fps)
    split1 = out_fps.split("/")
    return float(split1[0])

if __name__ == '__main__':
    find_res()
    find_num_frames()
    find_fps()
