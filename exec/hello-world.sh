echo "Job shell script called successfully\n"
if [ "$1" != "" ]; then
    echo "Job $1 step 0 started"
else
    echo "Error: No job number given. Exiting..."
    exit 1
fi
