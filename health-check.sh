#!/bin/bash
set -eo pipefail

if health="$(curl -k "http://localhost:3000/health")"; then
	health="$(echo "$health" | sed -r 's/^[[:space:]]+|[[:space:]]+$//g')" # trim whitespace (otherwise we'll have "green ")
	if [ "$health" = 'green' ] || [ "$health" = "yellow" ]; then
		exit 0
	fi
	echo >&2 "unexpected health status: $health"
fi

exit 1
