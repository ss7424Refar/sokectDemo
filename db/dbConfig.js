var mysql = require('mysql');

/** 配置mysql的参数 */
var pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'bootloader'
});

/** 数据库链接 */
function query(sql, callback){
    pool.getConnection(function(err, connection){
        connection.query(sql, function(err, rows){
            callback(err, rows);
            //释放链接
            connection.release();
        });
    });
}

function excute(sql, arr, callback) {
    pool.getConnection(function(err, connection){
        connection.query(sql, arr, function(err, rows){
            callback(err, rows);
            //释放链接
            connection.release();
        });
    });
}
exports.query = query;
exports.excute = excute;