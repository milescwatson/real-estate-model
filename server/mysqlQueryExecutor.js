/*jshint node:true */
/*global require */
'use strict';

var mysql = require('mysql2'),
    logEntries = [],
    loggingEnabled = false,
    dbconfig = require('./dbconfig'),
    pool = mysql.createPool({
        host: dbconfig.host,
        user: dbconfig.user,
        password: dbconfig.password,
        database: dbconfig.database
    }),
    executeQuery = function (query, callback) {
            pool.getConnection(function (error, connection) {
                if (error) {
                    console.error('server.getConnection - error:%s', error);
                    callback(error);
                    return;
                }
                if (!connection.tzConfigured) {
                    connection.tzConfigured = true;
                }
                connection.query(query.sql, query.values, function (error, results) {
                    if (!error) {
                        callback(null, results);
                    } else {
                        console.log("executeQuery error: ", error);
                        callback(error);
                    }
                    connection.release();
                });
            });
        };

// Executes a stored procedure and returns an array of result sets.
exports.executeCallableStatement = function (storedProcedure, callback) {
    executeQuery(storedProcedure, function (error, results) {
        callback(error, results);
    });
};

exports.query = function(query, callback) {
  executeQuery(query, callback);
}
