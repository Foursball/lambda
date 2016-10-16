var config = require('./config');
var firebase = require('./lib/firebase');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var dateFormat = require('dateformat');

exports.handler = function(event, context, callback) {

    Promise.all([firebase.getFoosers(), firebase.getTeams(), firebase.getGames()]).then(function(data) {
        try {
            var zip = new require('node-zip')();
            zip.file('foosballers.json', JSON.stringify(data[0]));
            zip.file('games.json', JSON.stringify(data[1]));
            zip.file('teams.json', JSON.stringify(data[2]));
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
                callback(null, "Backup complete to " + result.Location);
            });
        } catch (e) {
            console.log(e);
        }
    });
};
