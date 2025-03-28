import { Result } from '../src/result.js';
import { retry, tryCatchAsync } from '../src/utils.js';

/**
 * This file demonstrates practical examples of using the retry utility function
 * to handle transient failures in various scenarios.
 */

// Example 1: Retrying an API call that might experience temporary network issues
async function fetchDataFromAPI(_url: string): Promise<Result<any, Error>> {
  return await tryCatchAsync(async () => {
    // Simulate a flaky API that sometimes fails
    const random = Math.random();

    if (random < 0.7) {
      // 70% chance of failure to demonstrate retry functionality
      throw new Error('Network request failed');
    }

    // Simulate successful API response
    return {
      success: true,
      data: { id: 123, name: 'Example Data' },
    };
  });
}

// Example 2: Retrying a database connection
async function connectToDatabase(): Promise<Result<{ connection: string }, Error>> {
  return await tryCatchAsync(async () => {
    // Simulate unstable database connection
    const connectionSuccess = Math.random() > 0.6;

    if (!connectionSuccess) {
      throw new Error('Database connection failed');
    }

    return { connection: 'db-connection-string' };
  });
}

// Example 3: File processing with custom retry settings
async function processLargeFile(filePath: string): Promise<Result<string, Error>> {
  // Create a function that returns a Promise<Result>
  const processFile = async (): Promise<Result<string, Error>> => {
    return tryCatchAsync(async () => {
      // Simulate occasional processing errors
      if (Math.random() < 0.5) {
        throw new Error('File processing error: resource temporarily unavailable');
      }

      // Simulate successful processing
      return `Processed ${filePath} successfully`;
    });
  };

  // Use custom retry settings: 5 retries with a starting delay of 1000ms
  return await retry(processFile, 5, 1000);
}

// Main function to demonstrate all examples
async function main() {
  const apiResult = await retry(() => fetchDataFromAPI('https://api.example.com/data'));

  if (apiResult.isSuccess) {
  } else {
    console.error('API call failed after all retries:', apiResult.error.message);
  }
  const dbResult = await retry(() => connectToDatabase(), 4);

  if (dbResult.isSuccess) {
  } else {
    console.error('Could not connect to database after retries:', dbResult.error.message);
  }
  const fileResult = await processLargeFile('example-large-file.txt');

  if (fileResult.isSuccess) {
  } else {
    console.error('File processing failed:', fileResult.error.message);
  }
  const chainedResult = await retry(() => fetchDataFromAPI('https://api.example.com/user')).then(
    result => {
      if (result.isFailure) {
        return result;
      }

      // Transform successful result
      return Result.ok({
        processed: true,
        originalData: result.value,
        timestamp: new Date().toISOString(),
      });
    }
  );

  if (chainedResult.isSuccess) {
  } else {
    console.error('Chained operation failed:', chainedResult.error.message);
  }
}

// Run the examples
main().catch(err => {
  console.error('Unhandled error in examples:', err);
});

/**
 * Key points about the retry function:
 *
 * 1. It takes a function that returns Promise<Result<T, Error>>
 * 2. It attempts the function multiple times (default: 3)
 * 3. It uses exponential backoff for delays between retries
 * 4. It returns the successful Result or the last error after all retries
 *
 * Best practices:
 * - Only use retry for transient failures (network issues, race conditions)
 * - Don't retry permanent failures (invalid credentials, permission errors)
 * - Consider using appropriate timeout settings inside the retried function
 * - Use custom retry counts and delays based on the specific operation
 */
