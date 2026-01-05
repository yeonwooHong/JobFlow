import path from 'path';
import log4js from 'log4js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

log4js.configure({
  appenders: {
    // setting for log outputs
    console: { type: 'console' },
    
    // setting for file outputs
    file: { 
      type: 'dateFile', 
      filename: path.join(__dirname, '../logs/worker.log'), // worker/logs
      pattern: 'yyyy-MM-dd', // daily rotation
      keepFileExt: true,      // keep file extension (.log)
      daysToKeep: 30,         // keep logs for 30 days
      compress: true,         // compress old log files 
      alwaysIncludePattern: true // include date pattern in filename
    }
  },
  categories: {
      default: {
          appenders: ['console', 'file'],
          level: 'debug' // will change to info for production
    }
  }
});

// Set up a tag for each environment (worker, web)
const logger = log4js.getLogger('WORKER');

export default logger;