var config = require('./config');
var firebase = require('./lib/firebase');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var dateFormat = require('dateformat');
var SlackWebhook = require('slack-webhook');

exports.handler = function(event, context, callback) {

    firebase.getDB().then(function(db) {
        try {
            var zip = new require('node-zip')();
            Object.keys(db).forEach(function(key) {
                zip.file(key + '.json', JSON.stringify(db[key]));
            });
            var stream = zip.generate({
                base64: false,
                compression: 'DEFLATE'
            });
            var params = {
                Bucket: config.bucket,
                Key: dateFormat(new Date(), 'yyyy/mm/dd/HH-MM-ss') + '-foosball-backup.zip',
                Body: new Buffer(stream, 'binary')
            };
            s3.upload(params, function(err, result) {
                if (err) {
                    throw err;
                }
                if (config.slackUrl) {
                  var slack = new SlackWebhook(config.slackUrl, {
                    defaults: {
                      username: 'Firebase Backup'
                    }
                  });
                  slack.send('Firebase backup complete. Backup is located <' + result.Location + '|here>.').then(function() {
                    callback(null, "Backup complete to " + result.Location);
                  });
                } else {
                  callback(null, "Backup complete to " + result.Location);
                }
            });
        } catch (e) {
            console.log(e);
        }
    });
};
