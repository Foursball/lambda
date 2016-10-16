var config = require('./config');
var firebase = require('./lib/firebase');

exports.handler = function(event, context, callback) {

    Promise.all([firebase.getFoosers(), firebase.getTeams(), firebase.getGames()]).then(function(data) {
        console.log(data);
        callback(null, "Backup complete");
    });
};
