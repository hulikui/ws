var fs = require('fs');
var path = require('path');
var async = require('async')
var request = require('request');
var cheerio = require('cheerio');
var schedule = require('node-schedule');
const readline = require('readline');
var process = require('child_process');

let res = [];

/* 过滤页面信息 */
function filterSlideList(html) {
    if (html) {
        // 沿用JQuery风格，定义$
        var $ = cheerio.load(html);
        // 根据id获取轮播图列表信息
        var slideList = $('.searchResult');
        // 轮播图数据
        var slideListData = [];
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
        return slideListData;
    } else {
        console.log('无数据传入！');
    }
}

function writeFile(data, output) {
    fs.writeFileSync('./output/filelist.json', JSON.stringify(data), {encoding: 'utf-8'});
}

var queue = async.queue(function (url, callback) {
    request({url: url, timeout: 3000}, function (error, response, body) {
        let message = '';
        if (response && response.statusCode > 300) {//防止网页超时或者跳转无法访问的情况
            message = `问题URL: ${response && response.statusCode + '\n' + url}`
        }
        if (!error) {
            let sildeList = filterSlideList(body);
            res = res.concat(sildeList);
            writeFile(res);
            message = '处理成功'
        } else {
            message = `错误: , ${response && response.statusCode + '\n' + url + error.message}`
        }
        callback(message)
    })
}, 1); // 并发 5

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
    let url = `http://s.yingjiesheng.com/search.php?word=%E5%89%8D%E7%AB%AF%E6%88%B7%E5%8F%A3&area=1056&jobterm=0&sort=date&start=`;
    [0, 1, 2].map(num => {
        queue.push(url + num * 10, function (message) {
            console.log(message)
        });
    })

}

function scheduleCronstyle(){
    schedule.scheduleJob('0 0 10 * * *', function(){
        console.log('scheduleCronstyle:' + new Date());
        start();
    });
}

module.exports = scheduleCronstyle




