var request = require('request').defaults({ jar: true });
var Slack = require('slack-node');
const $ = require('cheerio');
require('dotenv').config();

request.post('http://crm.am2studio.com/login.php', {
    form: {
        log: process.env.USERNAME,
        pwd: process.env.PASSWORD
    }
}, function (error, response, body) {
    request.post('http://crm.am2studio.com/admin/admin-ajax.php', {
        form: {
            action: 'account_screen_change',
            target_page: 'user-reports',
            target_args: '?start_date=01-07-2017&end_date=31-07-2017&user=10&project=2773'
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
        webhookUri = 'https://hooks.slack.com/services/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';
        slack = new Slack();
        slack.setWebhook(webhookUri);
        slack.webhook({
            channel: '@marko.samec',
            username: 'MyLittleHelper',
            text: 'test'
        }, function(err, response) {
            console.log(response);
        });
    });
});

