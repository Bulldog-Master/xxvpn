// Production-safe logging utility
export const logger = {
  info: (message: string, ...args: any[]) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  error: (message: string, error?: any) => {
    // Always log errors but sanitize in production
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error);
    } else {
      // In production, log only essential error info without sensitive data
      console.error(`[ERROR] ${message}`);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
};