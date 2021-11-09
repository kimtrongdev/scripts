const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path')

const logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.splat(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [new (transports.DailyRotateFile)({
        filename: path.join(__dirname, 'logs','application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
    })]
});
module.exports=logger;