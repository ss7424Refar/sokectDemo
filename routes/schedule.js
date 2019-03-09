var schedule = require('node-schedule');
var socketClient = require('./client.js');
function scheduleCronstyle(){
    schedule.scheduleJob('0-59 * * * * *', function () {
        console.log('scheduleCronstyle:' + new Date());
        socketClient();
    });
}

scheduleCronstyle();