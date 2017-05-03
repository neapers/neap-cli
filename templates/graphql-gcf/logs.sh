if [[ -z $1 ]]; then
	functions logs read 
else
	functions logs read --limit=$1
fi