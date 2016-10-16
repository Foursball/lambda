var config = require('./config');
var firebase = require('./lib/firebase');
var fs = require('fs');

exports.handler = function(event, context, callback) {

    Promise.all([firebase.getFoosers(), firebase.getTeams(), firebase.getGames()]).then(function(data) {
        var zip = new require('node-zip')();
        zip.file('foosballers.json', JSON.stringify(data[0]));
        zip.file('games.json', JSON.stringify(data[1]));
        zip.file('teams.json', JSON.stringify(data[2]));
        var file = fs.writeFileSync('data.zip', zip.generate({
            base64: false,
            compression: 'DEFLATE'
        }), 'binary');
        callback(null, "Backup complete");
    });
};
