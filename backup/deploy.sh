#!/bin/sh

cd backup/
npm install

printf '{
  "firebase": "%s",
  "bucket": "%s",
  "slackUrl": "%s"
}' "$FIREBASE" "$BUCKET" "$SLACK_URL" > config.json

zip -q -r backup.zip .
aws lambda update-function-code --function-name $BACKUP_ARN --zip-file fileb://backup.zip
