import winston from 'winston';
import path from 'path';
import { config } from '../../config';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const developmentFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  })
);

const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: config.isProduction ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console(),
    ...(config.isProduction
      ? [
          new winston.transports.File({
            filename: path.join(config.logging.dir, 'error.log'),
            level: 'error',
          }),
          new winston.transports.File({
            filename: path.join(config.logging.dir, 'combined.log'),
          }),
        ]
      : []),
  ],
});
