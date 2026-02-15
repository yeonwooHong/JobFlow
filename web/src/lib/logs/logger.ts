import 'server-only';
import log4js from 'log4js';

const isServer = typeof window === 'undefined';

log4js.configure({
  appenders: {
    // Setting for log outputs
    console: { type: 'console' },

    // Only set file appender when in server environment
    ...(isServer && {
      file: { 
        type: 'dateFile',
        filename: 'logs/web-server.log',
        pattern: 'yyyy-MM-dd', // daily rotation
        keepFileExt: true,      // keep file extension (.log)
        daysToKeep: 30,         // keep logs for 30 days
        compress: true,         // compress old log files 
        alwaysIncludePattern: true // include date pattern in filename
      }
    })
  },
  categories: {
    default: { 
      appenders: isServer ? ['console', 'file'] : ['console'], 
      level: 'debug' // Will change to info for production
    }
  }
});

// Set up a tag for each environment (worker, web)
export const logger = log4js.getLogger('WEB');