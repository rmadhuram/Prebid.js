#!/bin/bash

set -eu
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRYRUN="n"
if [ "${1:-}" = "run" ] ; then
  DRYRUN=""
fi

SRCDIR=.
TARGET=demo-ht
rsync --out-format='<<CHANGED>>%i %n%L' -avzc${DRYRUN} --rsh "ssh -i ${HOME}/pem/C1X-website.pem" --exclude=node_modules ${DIR}/${SRCDIR}/ ubuntu@54.64.25.187:~/${TARGET}/
