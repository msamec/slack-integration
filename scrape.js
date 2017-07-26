var request = require('request').defaults({ jar: true });
var moment = require('moment');
moment.locale('hr');
var Slack = require('slack-node');
var _ = require('lodash');
const $ = require('cheerio');
require('dotenv').config();

request.post('http://crm.am2studio.com/login.php', {
    form: {
        log: process.env.USERNAME,
        pwd: process.env.PASSWORD
    }
}, function (error, response, body) {
    var yesterday = moment().add(-1, 'days');
    var today = moment();
    var users = [
        {
            name: "Mladen Djudjic",
            id: 46,
            hours: 0
        },
        {
            name: "Tomislav Bukal",
            id: 10,
            hours: 0
        },
        {
            name: "Pero Knezevic",
            id: 42,
            hours: 0
        }
    ];
    var promises = [];
    _.forEach(users, function(user, key) {
        promise = request.post('http://crm.am2studio.com/admin/admin-ajax.php', {
            form: {
                action: 'account_screen_change',
                target_page: 'user-reports',
                target_args: '?start_date='+yesterday.format('DD-MM-YYYY')+'&end_date='+today.format('DD-MM-YYYY')+'&user='+user.id+'&project=2773'
            }
        }, function(error, response, body) {
            var start = body.indexOf('$(".billable .num").html(') + 25;
            var hours = '';
            var char = '';
            while(char !== ')') {
                char = body[start++];
                if(char !== ')') {
                    hours += char;
                }
            }
            if(hours === '') {
                hours = 0;
            }
            users[key].hours = hours;
        });
        promises.push(promise);
    });
    Promise.all(promises).then(function(values) {
        var message = '*Radnih sati utroseno na ticketZone na dan '+yesterday.format('MMMM Do YYYY')+':*\n';
        _.forEach(users, function(user){
            message += user.name+': '+user.hours+'\n';
        });
        slack = new Slack();
        slack.setWebhook(process.env.WEBHOOK);
        slack.webhook({
            channel: '@marko.samec',
            username: 'MyLittleHelper',
            text: message
        }, function(err, response) {
        });
    });

});

