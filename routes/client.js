var net = require('net');
var db = require('../db/dbConfig.js');

function socketClient() {
    var port = 8080;
    var host = '127.0.0.1';
    var client = new net.Socket();
    //创建socket客户端
    client.setEncoding('binary');
    //连接到服务端
    client.connect(port, host, function () {
        //向端口写入数据到达服务端
        client.write('getTask');

    });
    client.on('data', function (data) {

        //得到服务端返回来的数据
        console.log('from server =>' + data);

        if ('noTask' == data || 'inUse' == data) {
            // client.end();
            client.write('getTask');
        }
        else if (0 == data.indexOf("job")) {

            // 更新test_pc_session(使用中)
            let sql = 'update ats_test_pc_session set flag = 1 where lan_ip = ?';
            db.excute(sql, [host], function(err, result){
                if(err){
                    console.log('[db flag error]-' + err);
                } else {
                    console.log('[db pc_session updated flag = 1]');
                }

            });

            // 执行脚本
            var data = data.split('='); var steps = data[1]; steps = JSON.parse(steps);

            if ('JumpStart' == steps.Tool_Type){

                console.log('running => JumpStart');

                console.log('done');

                // 根据taskId和steps更新 result
                // 。。。

                // 更新test_pc_session(未使用)
                let sql = 'update ats_test_pc_session set flag = 0 where lan_ip = ?';
                db.excute(sql, [host], function(err, result){
                    if(err){
                        console.log('[db flag error]-' + err);
                    } else {
                        console.log('[db pc_session updated flag = 0]');
                    }

                });

                client.write('getTask');

            }
        }

    });
    client.on('error', function (error) {
        //错误出现之后关闭连接
        console.log('error:' + error);
        client.end();
    });
    client.on('close', function () {
        //正常关闭连接
        console.log('Connection closed');
    });
    client.on('end', function () {
        //正常关闭连接
        console.log('Connection end');
    });
}

// module.exports=socketClient;
socketClient();