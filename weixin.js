/**
  

  先看以下代码：
  lib/config.js - appID和appSecret配置
  lib/token.js  - 获得有效token
  lib/user.js   - 获得用户信息
  lib/reply.js  - 回复微信的模板
  lib/ws.js     - 简单的websocket
*/

var PORT = require('./lib/config').wxPort;
var fs=require('fs');
var http = require('http');
var qs = require('qs');
var TOKEN = 'hulikui';
var request = require('request');
var getToken = require('./lib/token').getToken;
var appID = require('./lib/config').appID;
var appSecret = require('./lib/config').appSecret;
var replyImg = require('./lib/reply').replyImg; 
var wss = require('./lib/ws.js').wss;
var getUserInfo=require('./lib/user').getUserInfo;
var getImage=require('./lib/user').getImage;
var replyText=require('./lib/reply').replyText;
function checkSignature(params, token){
  //1. 将token、timestamp、nonce三个参数进行字典序排序
  //2. 将三个参数字符串拼接成一个字符串进行sha1加密
  //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
  //4,	数字签名验证，根据填写的token合成签名与微信服务器进行get验证，签名正确则通过服务器验证
  var key = [token, params.timestamp, params.nonce].sort().join('');
  var sha1 = require('crypto').createHash('sha1');
  sha1.update(key);
  
  return  sha1.digest('hex') == params.signature;
}

var server = http.createServer(function (request, response) {

  //解析URL中的query部分，用qs模块(npm install qs)将query解析成json
  var query = require('url').parse(request.url).query;
  var params = qs.parse(query);

  if(!checkSignature(params, TOKEN)){
    //如果签名不对，结束请求并返回
    response.end('signature fail');
    return;
  }

  if(request.method == "GET"){
    //如果请求是GET，返回echostr用于通过服务器有效校验
    response.end(params.echostr);
  }else{
    //否则是微信给开发者服务器的POST请求
    var postdata = "";

    request.addListener("data",function(postchunk){
        postdata += postchunk;
    });

    //获取到了POST数据
    request.addListener("end",function(){
      var parseString = require('xml2js').parseString;
      parseString(postdata, function (err, result) {
        if(!err){
		console.log(result);
        if(result.xml.MsgType[0] === 'text'){
            getUserInfo(result.xml.FromUserName[0])
            .then(function(userInfo){
              //获得用户信息，合并到消息中
              result.user = userInfo;
              //将消息通过websocket广播
              wss.broadcast(result);
              var res = replyText(result, '文字消息推送成功！');
             	console.log(res);
		 response.end(res);
            })}
       else if(result.xml.MsgType[0] === 'image'){
            getUserInfo(result.xml.FromUserName[0])
            .then(function(userInfo){
              //获得用户信息，合并到消息中
              result.user = userInfo;
              //将消息通过websocket广播
              wss.broadcast(result);
              var res = replyImg(result);
		console.log(res);
              response.end(res);
            })
	getImage(result.xml.MediaId[0]);
          }
        }
      });
    });
  }
});

server.listen(PORT);

console.log("Weixin server runing at port: " + PORT + ".");
