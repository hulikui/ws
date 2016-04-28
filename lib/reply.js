function replyText(msg, replyText){
console.log('文本消息');
  //将要返回的消息通过一个简单的tmpl模板（npm install tmpl）返回微信
  var tmpl = require('tmpl');
  var replyTmpl = '<xml>' +
    '<ToUserName><![CDATA[{toUser}]]></ToUserName>' +
    '<FromUserName><![CDATA[{fromUser}]]></FromUserName>' +
    '<CreateTime><![CDATA[{time}]]></CreateTime>' +
    '<MsgType><![CDATA[{type}]]></MsgType>' +
    '<Content><![CDATA[{content}]]></Content>' +
    '</xml>';

  return tmpl(replyTmpl, {
    toUser: msg.xml.FromUserName[0],
    fromUser: msg.xml.ToUserName[0],
    type: 'text',
    time: Date.now(),
    content: replyText
  });
}

function replyImg(msg){
console.log("图片消息处理");
  //将要返回的消息通过一个简单的tmpl模板（npm install tmpl）返回微信
  var tmpl = require('tmpl');
var replyTmpl='<xml>'+
'<ToUserName><![CDATA[{toUser}]]></ToUserName>'+
'<FromUserName><![CDATA[{fromUser}]]></FromUserName>'+
'<CreateTime><![CDATA[{time}]]></CreateTime>'+
'<MsgType><![CDATA[{news}]]></MsgType>'+
'<ArticleCount>1</ArticleCount>'+
'<Articles>'+
'<item>'+
'<Title><![CDATA[{title}]]></Title>'+
'<Description><![CDATA[{description}]]></Description>'+
'<PicUrl><![CDATA[{picurl}]]></PicUrl>'+
'<Url><![CDATA[{url}]]></Url>'+
'</item>'+
'</Articles>'+
'</xml>';

  return tmpl(replyTmpl, {
    toUser: msg.xml.FromUserName[0],
    fromUser: msg.xml.ToUserName[0],
news:'news',
    title: 'Ace+Notes开发',
    description: 'Mongodb+Express+AngularJs+NodeJs全栈开发',
    picurl: 'http://img.hb.aicdn.com/a286c9112cfaa1b77370beff406b7d16457bf8bf211595-6PJpPh_fw658',
url:"http://121.42.52.230:3000/",    
time: Date.now()
  });
}

module.exports = {
  replyText: replyText,
  replyImg: replyImg
};
