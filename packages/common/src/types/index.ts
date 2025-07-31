// Export all type definitions from this directory
// Example: export type { User } from './userTypes';

// Common types that don't fit elsewhere
export type ErrorType = {
  message: string;
  code?: string;
};

export type Result<T> = {
  data?: T;
  error?: ErrorType;
};
