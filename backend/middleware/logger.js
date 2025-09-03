const fs = require('fs');
const path = require('path');

/**
 * Logging middleware for HTTP requests and responses
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const accessLogPath = path.join(logsDir, 'access.log');
const errorLogPath = path.join(logsDir, 'error.log');

// Helper function to write to log files
const writeLog = (filePath, data) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${JSON.stringify(data)}\n`;
  
  fs.appendFile(filePath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  const requestLog = {
    type: 'REQUEST',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    headers: {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? 'Bearer ***' : undefined,
      'content-length': req.get('Content-Length')
    },
    body: req.method !== 'GET' ? req.body : undefined
  };

  // Write request log
  writeLog(accessLogPath, requestLog);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    // Log response details
    const responseLog = {
      type: 'RESPONSE',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };

    // Write response log
    writeLog(accessLogPath, responseLog);

    // Call original res.end
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const errorLog = {
    type: 'ERROR',
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    statusCode: err.statusCode || 500
  };

  // Write error log
  writeLog(errorLogPath, errorLog);
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog);
  }

  next(err);
};

// Performance monitoring middleware
const performanceLogger = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
    
    const performanceLog = {
      type: 'PERFORMANCE',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };

    // Log slow requests (over 1 second)
    if (duration > 1000) {
      performanceLog.warning = 'SLOW_REQUEST';
      writeLog(errorLogPath, performanceLog);
    } else {
      writeLog(accessLogPath, performanceLog);
    }
  });

  next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log potentially suspicious activities
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /javascript:/i, // JavaScript injection
  ];

  const url = req.originalUrl;
  const body = JSON.stringify(req.body);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      const securityLog = {
        type: 'SECURITY_WARNING',
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        pattern: pattern.toString(),
        body: req.body
      };

      writeLog(errorLogPath, securityLog);
      console.warn('Security warning logged:', securityLog);
      break;
    }
  }

  next();
};

// Log rotation (basic implementation)
const rotateLogs = () => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  [accessLogPath, errorLogPath].forEach(logPath => {
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      if (stats.size > maxSize) {
        const backupPath = `${logPath}.${new Date().toISOString().split('T')[0]}`;
        fs.renameSync(logPath, backupPath);
        console.log(`Log rotated: ${logPath} -> ${backupPath}`);
      }
    }
  });
};

// Rotate logs daily
setInterval(rotateLogs, 24 * 60 * 60 * 1000);

module.exports = {
  requestLogger,
  errorLogger,
  performanceLogger,
  securityLogger,
  rotateLogs
};
