var config = require('./lib/config');
var request = require('request');
var getToken = require('./lib/token').getToken;
var appID = require('./lib/config').appID,
    appSecret = require('./lib/config').appSecret;

const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=`

const json = {
    "touser":"OPENID",
    "template_id":"ynvj1rFesKCoASp7bATm98SdVXzn4YTKBsT1e7yjWNk",
    "url":"",
    "miniprogram":{

    },
    "data": {
        "front": {
            "value":"前端就业搜索",
            "color":"#173177"
        },
        "keywords":{
            "value":"前端，北京",
            "color":"#173177"
        },
        "from": {
            "value":"应届生求职网",
            "color":"#173177"
        },
        "data": {
            "value": new Date().toLocaleString(),
            "color":"#173177"
        },
        "end":{
            "value":"点击查询详情！",
            "color":"#173177"
        }
    }
}

var options = {
    uri: '',
    method: 'POST',
    json: {}
};



function fetchTemplate(openid, callback) {
    let times = 0;
    getToken(appID, appSecret).then(function(token){
        const {access_token} = token;
        if (access_token && times === 0) {
            times ++;
            options.uri = `${url}${access_token}`;
            options.json = Object.assign(json, {
                touser:  openid,
                url: 'http://114.67.143.10:9206/list'
            });
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback && callback(body)
                    console.log(body)
                } else {
                    console.log(error)
                }
            });
        }

    });
}

module.exports = fetchTemplate