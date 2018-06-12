var fs = require('fs');
var path = require('path');
var async = require('async')
var request = require('request');
var cheerio = require('cheerio');
var schedule = require('node-schedule');
const readline = require('readline');
var process = require('child_process');
request = request.defaults({jar: true})
var base_bj_url = 'http://bbs.cloud.icybee.cn';
var yingjisheng_url = 'http://s.yingjiesheng.com/search.php?word=%E5%89%8D%E7%AB%AF%E6%88%B7%E5%8F%A3&area=1056&jobterm=0&sort=date&start=';
var beiyou_url = 'http://bbs.cloud.icybee.cn/board/Job?p='
let res = [];

/* 过滤页面信息 */
function filterSlideList(html) {
    var slideListData = [];

    if (html) {
        // 沿用JQuery风格，定义$
        var $ = cheerio.load(html);
        // 根据id获取轮播图列表信息
        var slideList = $('.searchResult');
        // 轮播图数据
        /* 轮播图列表信息遍历 */
        slideList.find('li').each(function(item) {
            var art = $(this);
            // 找到a标签并获取href属性
            var href = art.find('.title a').attr('href');
            var title = art.find('.title a').text();
            var time = art.find('.date').text();
            // 向数组插入数据
            slideListData.push({
                title : title,
                href : href,
                time : time
            });
        });
        // 返回轮播图列表信息
    } else {
        console.log('无数据传入！');
    }
    return slideListData;

}

function filterBYSideList(html) {
    var slideListData = [];
    if (html) {
        var $ = cheerio.load(html);
        var sideList = $('.list.sec');
        sideList.find('li').each(function(item) {
            var art = $(this);
            // 找到a标签并获取href属性
            var titleDom = art.find('div:first-child a');
            var href = base_bj_url + titleDom.attr('href');
            var title = titleDom.text();
            var time = art.find('div:last-child').text();
            // 向数组插入数据
            var time_pattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
            if (title.indexOf('户口') >= 0 && title.indexOf('违约') < 0) {
                console.log(time);
                slideListData.push({
                    title : title,
                    href : href,
                    time : time.match(time_pattern) && time.match(time_pattern)[0] || ''
                });
            }
        });
    } else {
        console.log('bbs 数据为空');
    }
    return slideListData;
}
function writeFile(data, output) {
    fs.writeFileSync('./output/filelist.json', JSON.stringify(data), {encoding: 'utf-8'});
}

var queue = async.queue(function (options, callback) {
        console.log(options);
        request(options, function (error, response, body) {
            let message = '';
            if (response && response.statusCode > 300) {//防止网页超时或者跳转无法访问的情况
                message = `问题URL: ${response && response.statusCode + '\n' + url}`
            }
            if (!error) {
                //console.log(body);
                let sildeList = [];
                if (options.url.indexOf(base_bj_url) >=0) {
                    sildeList = filterBYSideList(body);
                } else {
                    sildeList = filterSlideList(body);
                }
                res = res.concat(sildeList);
                writeFile(res);
                message = '处理成功'
            } else {
                message = `错误: , ${response && response.statusCode + '\n' + url + error.message}`
            }
            callback(message)
        })

}, 1); // 并发 1

// var queue = async.queue(function (url, callback) {
//     fs.readFile(`./resource/${url}.html`, {encoding: 'utf-8'}, function (error, body) {
//         let message = '';
//         if (!error) {
//             let sildeList = filterSlideList(body);
//             res = res.concat(sildeList);
//             writeFile(res);
//             message = '处理成功'
//         } else {
//             message = `错误: , ${url + error.message}`
//         }
//         callback(message)
//     })
// }, 1); // 并发 5


function start() {
    const isExistFile = fs.existsSync('./output');
    if (isExistFile) {
        console.log('清除原有结果');
        process.exec('rm -rf ./output/*')
    } else {
        console.log('新建output文件夹');
        process.exec('mkdir output');
    }
    [beiyou_url, yingjisheng_url].map(function (url) {
        [0, 1, 2].map(num => {
            let byoptinons = {
                url: url + (num +1),
                timeout: 3000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
                }
            };
            let yjsoptions = {
                url: url + num * 10,
                timeout: 3000,
            }
            let options = yjsoptions;
            if (beiyou_url === url) {
                options = byoptinons;
            }
            queue.push(options, function (message) {
                console.log(message)
            });
        })
    })
}

function scheduleCronstyle(){
    schedule.scheduleJob('0 0 10 * * *', function(){
        console.log('scheduleCronstyle:' + new Date());
        start();
    });
}
//
// var body = fs.readFileSync(path.join(__dirname, 'projects/test.html'), {encoding: 'utf-8'});
// filterBYSideList(body)
//start();
module.exports = scheduleCronstyle



