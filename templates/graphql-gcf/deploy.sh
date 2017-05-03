TIMEFORMAT=%R
time {
	f="{{project-function}}"
	bucket="{{project-bucket}}"
	trigger="{{project-tigger}}"
	gf="{{gcf-name}}"

	if [[ $1 == "dev" ]]; then
		# In dev mode, make sure that the functions local server is running, and then deploy the function
		if ! [[ $(ps -ax | grep functions-emulator | wc -l) -eq 2 ]]; then 
			echo "Starting the Google Cloud functions server"
			functions start
		fi

		echo -e "\033[1;36mLOCALLY Deploying\033[0m function \033[32m'$f'\033[0m using trigger option \033[32m'$trigger'\033[0m"
		functions deploy $f $trigger
	else
		# In non-dev mode, publish the function to GCP
		echo -e "\033[1;36mDeploying into Google Cloud Function '$gf'\033[0m function named \033[32m'$f'\033[0m using bucket \033[32m'$bucket'\033[0m and tigger option \033[32m'$trigger'\033[0m"
		gcloud beta functions deploy $gf --stage-bucket $bucket $trigger --entry-point $f
	fi

	printf "\033[36mDeployment execution time (seconds): "
}
# Reset color styling
printf "\033[0m" 