var net = require('net');
var db = require('../db/dbConfig.js');
//模块引入
var listenPort = 8080;//监听端口
var server = net.createServer(function(socket){
    // 创建socket服务端
    var ip = socket.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }
    console.log('connect: ' + ip + ':' + socket.remotePort);
    socket.setEncoding('binary');
    //接收到数据
    socket.on('data',function(data){

        if ('getTask' == data) {

            // 检查flag
            let sql = 'select flag from ats_test_pc_session where lan_ip = ? limit 1';

            db.excute(sql, [ip], function(err, result){
                if(err){
                    console.log('[db flag error]-' + err);
                } else {
                    console.log('[server get flag]-' + result[0].flag);
                    // flag = 0 未使用
                    if (0 == result[0].flag) {
                        // 查找steps, 如果为空，则返回noTask,否则返回steps
                        let sql = 'select A.*, B.* from ' +
                            '(select * from ats_task_basic where machine_id = ? and shelf_switch = ? and lan_ip = ? and status = ? order by task_start_time) A \n' +
                            'left join ats_task_tool_steps B ' +
                            'on A.task_id = B.task_id where B.status is null order by B.steps limit 1; ';
                        var machine_id = '1607123';
                        var shelf_switch = '1_10';
                        var lan_ip = '127.0.0.1';
                        var status = 'ongoing';
                        db.excute(sql, [machine_id, shelf_switch, lan_ip, status], function(err, res){
                            if(err){
                                console.log('[db steps error]-' + err);
                            } else {
                                if (null !== res) {
                                    console.log('[server get steps]-' + res);

                                    for (var i = 0; i < res.length; i++) {
                                        console.log('sendTask=> id:' + res[i].task_id + '== steps:' + res[i].element_json);

                                        socket.write('job=' + res[i].element_json);
                                    }
                                } else {
                                    socket.write('noTask');
                                }

                            }

                        });


                    // flag = 1 使用中
                    } else {
                        socket.write('inUse');
                    }

                }
            })

        } else {
            console.log('client send: hello2');
        }

    });

    // socket.write('start server on port ' + listenPort);

    //数据错误事件
    socket.on('error',function(exception){
        console.log('socket error:' + exception);
        socket.end();
    });

    //客户端关闭事件
    socket.on('close',function(data){
        console.log('client closed!');
        // socket.remoteAddress + ' ' + socket.remotePort);
    });

    //服务器监听事件
    server.on('listening',function(){
        console.log("server listening:" + server.address().port);
    });

    //服务器错误事件
    server.on("error",function(exception){
        console.log("server error:" + exception);
    });
}).listen(listenPort);