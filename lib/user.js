/**
  这个模块用来获得用户基本信息

  使用方法：

  getUserInfo('oZx2jt4po46nfNT7mnBwgu8mGs3M').then(function(data){
    console.log(data);
  });

  http://mp.weixin.qq.com/wiki/1/8a5ce6257f1d3b2afb20f83e72b72ce9.html
 */

var appID = require('./config').appID;
var appSecret = require('./config').appSecret;
var fs=require('fs');
var getToken = require('./token').getToken;

var request = require('request');
//关注公众号的用户向公众号发送信息时，微信服务器会把用户唯一标识openID和发送的内容，用post请求的方式发送给开发者服务器
function getUserInfo(openID){
  return getToken(appID, appSecret).then(function(res){
    var token = res.access_token;

    return new Promise(function(resolve, reject){
      request('https://api.weixin.qq.com/cgi-bin/user/info?access_token='+token+'&openid='+openID+'&lang=zh_CN', function(err, res, data){
          resolve(JSON.parse(data));
        });
    });
  }).catch(function(err){
    console.log(err);
  });  
}
//用于获取临时素材，原理同上
function getImage(mediaID){

  return getToken(appID, appSecret).then(function(res){
    var token = res.access_token;
     var filename='/root/Code/myNote/public/images/'+mediaID+'.png';
    return new Promise(function(resolve, reject){
      request('https://api.weixin.qq.com/cgi-bin/media/get?access_token='+token+'&media_id='+mediaID+'').pipe(fs.createWriteStream(filename));
    });
  }).catch(function(err){
    console.log(err);
  });  
}
module.exports = {
  getUserInfo: getUserInfo,
getImage:getImage
};
