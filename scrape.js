var request = require('request-promise-native');
var diff2html = require('diff2html').Diff2Html;
var moment = require('moment');
moment.locale('hr');
var gitPromise = require('simple-git/promise');
var Slack = require('slack-node');
var _ = require('lodash');
const $ = require('cheerio');
require('dotenv').config();
var fs = require('fs');
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;
//const { exec } = require('child_process');

var remote  = 'https://'+process.env.GIT_USER+':'+process.env.GIT_PASSWORD+'@'+process.env.GIT_REPO;
gitPromise()
    .silent(true)
    .clone(remote, __dirname + '/tz')
    .then(function(){
        scrape();
    })
    .catch(function(err) {
        require('simple-git')(__dirname + '/tz')
            .pull(function(err, update) {
                scrape();
            });
    });

function scrape() {
    request.post('http://crm.am2studio.com/login.php', {
        form: {
            log: process.env.USERNAME,
            pwd: process.env.PASSWORD
        }
    }, function (error, response, body) {
        var yesterday = moment().add(-1, 'days');
        var users = [
            {
                name: "Mladen Djudjic",
                id: 46,
                hours: 0
            }
            ,
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
        _.forEach(users, function (user, key) {
            promise = request.post('http://crm.am2studio.com/admin/admin-ajax.php', {
                form: {
                    action: 'account_screen_change',
                    target_page: 'user-reports',
                    target_args: '?start_date=' + yesterday.format('DD-MM-YYYY') + '&end_date=' + yesterday.format('DD-MM-YYYY') + '&user=' + user.id + '&project=2773'
                },
                headers: {
                    'Cookie': response.headers['set-cookie']
                }
            }, function (error, response, body) {
                var start = body.indexOf('$(".billable .num").html(') + 25;
                var hours = '';
                var char = '';
                while (char !== ')') {
                    char = body[start++];
                    if (char !== ')') {
                        hours += char;
                    }
                }
                if (hours === '') {
                    hours = 0;
                }
                users[key].hours = hours;
            }).catch(function(){

            });
            promises.push(promise);

            require('child_process').exec('git --git-dir '+__dirname+'/tz/.git log --author="'+user.name+'" -p --after="'+yesterday.format('YYYY-MM-DD')+'T00:00:00" --before="'+yesterday.format('YYYY-MM-DD')+'T23:59:59" --all --pretty=oneline', function(err, stdout, stderr) {
                var dir = __dirname + '/patches/'+user.id;
                var html = diff2html.getPrettyHtml(stdout, {outputFormat: 'side-by-side'});
                writeFile(dir +'/'+yesterday.format('DD-MM-YYYY')+'.html', html, function() {});
            });
        });
        Promise.all(promises).then(function (values) {
            var message = '*Radnih sati utroseno na ticketZone na dan ' + yesterday.format('MMMM Do YYYY') + ':*\n';
            _.forEach(users, function (user) {
                var url = process.env.HOST_URL+'/diff.php?user_id='+user.id+'&date='+yesterday.format('DD-MM-YYYY');
                message += '<'+url+'|'+user.name + '>: ' + user.hours + '\n';
            });
            slack = new Slack();
            slack.setWebhook(process.env.WEBHOOK);
            slack.webhook({
                username: 'MyLittleHelper',
                text: message
            }, function (err, response) {
            });
        });

    }).catch(function(err) {

    });
}

function writeFile(path, contents, cb)
{
    mkdirp(getDirName(path), function (err) {
        if(err) return cb(err);

        fs.writeFile(path, contents, cb);
    });
}