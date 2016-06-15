# 微信墙案例
-Node.js+websocket
-微信公众平台测试号
###config.js
-必要的公众号配置
###token.js
-根据公众号的appid和appsecret对微信服务器发起request请求，获取token的JSON文件，因为token文件请求次数的限制，所以最好是缓存一下，这里的new promise().then()是为了保证获取数据的顺序的一致性和正确性，异步转同步的流程控制。
###user.js
-考虑到安全性的问题，微信不会一次请求就会获取到用户信息，需要拿token.js获取的access_token再次向微信服务器请求用户数据，那么这里同样用到new promise().then()，openID是用户的唯一标识，用户关注公众号后向公众号发送信息，可以获取到该字段
##ws.js
-监听微信服务器发来的消息，监听是否有用户客户端连接，有消息并转发
##reply.js
-负责回复用户的模板xml,微信API有说明
##weixin.js
-负责代码执行逻辑，主要是响应微信服务器签名验证，获取用户发来的信息并处理和广播
