var Slack = require('slack-node');
require('dotenv').config();

slack = new Slack();
slack.setWebhook(process.env.WEBHOOK);
slack.webhook({
    username: 'MyLittleHelper',
    text: '<!channel> Podsjetnik da do kraja dana upisete sve sate u crm te sve izmjene od danasnjeg dana "pushnete" na github'
}, function(err, response) {
});
