// CustomLogger.ts
const originalConsoleError = console.error;

console.error = (message: any, ...optionalParams: any[]) => {
  if (typeof message === "string" && message.includes("This error is located at:")) {
    // Here you can process or display specific errors as needed
    // For example, log it to a service or format it differently
    originalConsoleError(message, ...optionalParams); // Keep original behavior for specific logs
  } else {
    // Suppress or modify other types of errors
    // Uncomment the following line to suppress unimportant errors entirely
    // return;

    // Optionally, log everything else normally
    originalConsoleError(message, ...optionalParams);
  }
};
