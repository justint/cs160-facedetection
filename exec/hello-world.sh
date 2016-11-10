echo "Job shell script called successfully\n"
if [ "$1" != "" ]; then
    echo "Job $1 has started"
else
    echo "Error: No job number given. Exiting..."
    exit 1
fi
