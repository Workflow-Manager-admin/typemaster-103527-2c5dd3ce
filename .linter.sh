#!/bin/bash
cd /home/kavia/workspace/code-generation/typemaster-103527-2c5dd3ce/typemaster
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

