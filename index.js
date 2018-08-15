const express = require('express')
const app = new express()
const fs = require('fs')
/**
 * superagent 是用来发起请求的，是一个轻量的,渐进式的ajax api,可读性好,学习曲线低,
 * 内部依赖nodejs原生的请求api,适用于nodejs环境下.，也可以使用http发起请求
 */
const superagent = require('superagent')
/**
 * superagent-charset防止爬取下来的数据乱码，更改字符格式
 */
const charset = require('superagent-charset')
charset(superagent)
/**
 * cheerio为服务器特别定制的，快速、灵活、实施的jQuery核心实现.。 安装完依赖就可以引入了
 */
const cheerio = require('cheerio')
const baseUrl = 'https://www.qqtn.com/' //也可以用其他地址

app.get('/index',function(req,res,next){
    // 设置请求头，解决跨域问题
    res.header("Access-Control-Allow-Origin","*")
    res.header("Access-Control-Allow-Methods","PUT, GET, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept");
    res.header("Content-Type","application/json;charset=utf-8");
    if(req.method == "OPTIONS"){
        //让options请求快速返回
        res.sendStatus(200)
    }else{
        // next()
    }
    let items = [];
    let { type = 'weixin', page = 1} = req.query;
    const url = `${baseUrl}tx/${type}tx_${page}.html`
    superagent.get(url).charset('gb2312').end((err,data) => {
        if(err){
            console.log('Error:' + err)
            res.json({code:400,msg:err})
            return
        }
        let htmlStr = data.text
        const $ = cheerio.load(htmlStr)
        $('div.g-main-bg ul.g-gxlist-imgbox li a').each((index,element) => {
            const $element = $(element);
            const $subElement = $element.find('img');
            const thumbImgSrc = $subElement.attr('src');
            items.push({
                title:$element.attr('title'),
                href:$element.attr('href'),
                thumbSrc:thumbImgSrc
            }) 
        })
        // 写入到本地文件
        fs.writeFile('avatarData.txt',JSON.stringify(items),'utf-8',(err) => {
            if(err){
                console.error('Error:'+err)
                return
            }
            console.log('file write sussessfully')
        })
        res.json({code:200,msg:'success',data:items});
    })
})
let server = app.listen(8081,function(){
    const host = server.address().address || 'localhost'
    const port = server.address().port
    console.log('应用实例，访问地址为 http://%s:%s',host,port)
})