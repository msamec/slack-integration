var Slack = require('slack-node');
require('dotenv').config();
var cron = require('node-cron');

cron.schedule('0 15 * * 1-5', function() {
    doit();
});

function doit() {
    slack = new Slack();
    slack.setWebhook(process.env.WEBHOOK);
    slack.webhook({
        username: 'MyLittleHelper',
        text: '<!channel> Podsjetnik da do kraja dana upisete sve sate u crm te sve izmjene od danasnjeg dana "pushnete" na github. Obavezno azurirajte taskove u Asani koji su na vama.'
    }, function (err, response) {
    });
}
