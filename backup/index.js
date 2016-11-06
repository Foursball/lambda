var config = require('./config');
var firebase = require('./lib/firebase');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var dateFormat = require('dateformat');
var SlackWebhook = require('slack-webhook');

exports.handler = function(event, context, callback) {

    firebase.getDB().then(function(db) {
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
            try {
                if (err) {
                    throw err.message;
                }
                sendSlackMessage('Firebase backup complete. Backup is located <' + result.Location + '|here>.', function() {
                    callback(null, "Backup complete to " + result.Location);
                });
            } catch (e) {
                sendSlackMessage('An error occured during the S3 backup: ' + e, function() {
                    callback(e);
                });
            }
        });
    });
};

function sendSlackMessage(message, callback) {
    if (config.slackUrl) {
        var slack = new SlackWebhook(config.slackUrl, {
            defaults: {
                username: 'Firebase Backup'
            }
        });
        slack.send(message).then(callback);
    } else {
        callback();
    }
}
