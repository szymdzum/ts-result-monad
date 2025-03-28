# Result Monad for TypeScript

[![CI](https://github.com/szymdzum/ts-result-monad/actions/workflows/ci.yml/badge.svg)](https://github.com/szymdzum/ts-result-monad/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/ts-result-monad.svg)](https://www.npmjs.com/package/ts-result-monad)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-TypeDoc-blue.svg)](https://szymdzum.github.io/ts-result-monad/)

Zero-dependency TypeScript implementation of the Result monad pattern for elegant error handling without exceptions.

📖 **[Full API documentation is available here](https://szymdzum.github.io/ts-result-monad/)** - by TypeDoc

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Documentation](https://szymdzum.github.io/ts-result-monad/)
- [API Reference](./API.md)
- [For Newcomers: Examples](#for-newcomers-simple-examples)
  - [The Problem: Traditional Error Handling](#the-problem-traditional-error-handling)
  - [The Solution: Using Result](#the-solution-using-result)
  - [Chaining Operations: The Simple Way](#chaining-operations-the-simple-way)
- [Advanced TypeScript: Complex Generic Examples](#advanced-typescript-complex-generic-examples)
  - [Generic Repository Pattern](#generic-repository-pattern)
  - [Higher-Order Function with Result](#higher-order-function-with-result)
  - [Generic Data Pipeline with Results](#generic-data-pipeline-with-results)
- [Detailed Examples](#detailed-examples)
  - [Basic Usage](#basic-usage)
  - [Error Handling Patterns](#error-handling-patterns)
  - [Functional Composition](#functional-composition)
  - [Asynchronous Patterns](#asynchronous-patterns)
  - [Retry Utilities](#retry-utilities)
  - [Cancellation Handling](#cancellation-handling)
- [Examples](#examples)
  - [Basic Usage](#basic-usage-1)
  - [Functional Composition](#functional-composition-1)
  - [Error Handling & Recovery](#error-handling--recovery)
  - [Asynchronous Operations](#asynchronous-operations)
  - [Combining Results](#combining-results)
  - [Domain-Specific Error Types](#domain-specific-error-types)
- [Why Use Result?](#why-use-result)
- [License](#license)
- [Bundle Size](#bundle-size)
- [Tree-shaking](#tree-shaking)
- [Performance Considerations](#performance-considerations)
- [Compatibility](#compatibility)
- [Getting Started](#getting-started)

## Features

- 🛡️ **Type-safe error handling** - No more try/catch blocks or forgotten error cases
- 🔄 **Chainable operations** - Compose operations that might fail with elegant method chaining
- 🧩 **Comprehensive utilities** - Tools for working with async code, predicates, retries, and more
- 🔍 **Detailed error types** - Structured error hierarchy for different failure scenarios
- 🚫 **Zero dependencies** - Lightweight and simple to integrate into any project

## Installation

```bash
npm install ts-result-monad
# or
yarn add ts-result-monad
# or
pnpm add ts-result-monad
```

## API Reference

For a complete reference of the Result class, utility functions, and error types, see the [API documentation](./API.md).

## Detailed Examples

We've created several example files to demonstrate different patterns and use cases for the Result monad. These examples include comprehensive code with detailed comments to help you understand how to apply these patterns in your own projects.

### [Basic Usage](./examples/basic-usage.ts)
* Simple success/failure creation
* Exception handling with `fromThrowable`
* Chaining operations with `map` and `flatMap`
* Side effects with `tap` and `tapError`
* Default values with `getOrElse` and `getOrCall`
* Promise integration

### [Error Handling Patterns](./examples/error-handling.ts)
* Domain-specific error types for different scenarios
* Detailed validation with appropriate error types
* Business rule validations
* Error chain propagation
* Centralized error handling based on error type
* Error context enrichment

### [Functional Composition](./examples/functional-composition.ts)
* Data transformation pipelines
* Multi-step validation with early returns
* Advanced function composition with shared context
* Combining multiple Results
* Parsing and validation examples

### [Asynchronous Patterns](./examples/async-patterns.ts)
* Converting Promises to Results
* Chaining async Results
* Parallel execution with Results
* Converting callback-based APIs to Result-based
* Retry patterns with exponential backoff
* Timeout handling

### [Retry Utilities](./examples/retry.ts)
* Retrying API calls with transient errors
* Database connection retries
* Custom retry settings with file operations
* Chaining operations after retries

You can run any example directly with:

```bash
# Using ts-node
npx ts-node examples/basic-usage.ts

# Or with your TypeScript setup
npm run build && node dist/examples/basic-usage.js
```

## Examples

### Basic Usage

#### Importing

```typescript
import { Result } from 'ts-result-monad';
```

#### Creating Success and Failure Results

```typescript
// Creating a success result
const successResult = Result.ok<number, Error>(42);
console.log('Success result:', successResult.isSuccess); // true

// Creating a failure result
const failureResult = Result.fail<string, Error>(new Error('Something went wrong'));
console.log('Failure result:', failureResult.isFailure); // true

// Safely accessing values
if (successResult.isSuccess) {
  console.log('The value is:', successResult.value);
}

// Safely accessing errors
if (failureResult.isFailure) {
  console.log('The error is:', failureResult.error.message);
}
```

#### Handling Operations That Might Throw

```typescript
function divideNumbers(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// Using Result to handle operations that might throw
const divideResult1 = Result.fromThrowable(() => divideNumbers(10, 2));
const divideResult2 = Result.fromThrowable(() => divideNumbers(10, 0));

// Pattern matching to handle both success and failure cases elegantly
const resultMessage1 = divideResult1.match(
  value => `Result: ${value}`,
  error => `Error: ${error.message}`
);

const resultMessage2 = divideResult2.match(
  value => `Result: ${value}`,
  error => `Error: ${error.message}`
);

console.log(resultMessage1); // "Result: 5"
console.log(resultMessage2); // "Error: Division by zero"
```

### Functional Composition

#### Chaining Operations with map and flatMap

```typescript
// Parse a JSON string into an object
function parseJSON(json: string): Result<any, Error> {
  return Result.fromThrowable(() => JSON.parse(json));
}

// Extract a specific field from the parsed object
function extractField(obj: any, field: string): Result<string, Error> {
  if (obj && field in obj) {
    return Result.ok(obj[field]);
  }
  return Result.fail(new Error(`Field '${field}' not found`));
}

// Process valid field data
function processField(field: string): Result<string, Error> {
  if (field.length > 3) {
    return Result.ok(field.toUpperCase());
  }
  return Result.fail(new Error('Field too short'));
}

// Chain all operations together in a clean, readable way
const validProcess = parseJSON('{"name": "John", "age": 30}')
  .flatMap(obj => extractField(obj, 'name'))
  .flatMap(name => processField(name));

console.log('Processed value:', validProcess.value); // "JOHN"

// Error handling is built-in - no need for try/catch
const invalidJSON = parseJSON('{invalid json}')
  .flatMap(obj => extractField(obj, 'name'))
  .flatMap(name => processField(name));

console.log('Is invalid JSON a success?', invalidJSON.isSuccess); // false
```

#### Working with Side Effects Using tap

```typescript
const result = Result.ok<number, Error>(42)
  .tap(value => {
    console.log('Side effect on success:', value);
    // Do something with the value without affecting the result chain
    // Perfect for logging, analytics, etc.
  })
  .tapError(error => {
    console.error('Side effect on error:', error.message);
    // Handle the error without affecting the result chain
    // Great for error reporting, logging, etc.
  });

// The original result is returned unchanged
console.log('Result value after side effects:', result.value); // 42
```

### Error Handling & Recovery

#### Providing Fallback Values

```typescript
const failedResult = Result.fail<number, Error>(new Error('Operation failed'));

// Get a default value if the operation failed
const valueWithDefault = failedResult.getOrElse(0);
console.log('Value with default:', valueWithDefault); // 0

// Compute a value based on the error
const computedValue = failedResult.getOrCall(error => {
  console.log('Handling error:', error.message);
  return -1;
});
console.log('Computed fallback value:', computedValue); // -1
```

#### Recovering from Errors

```typescript
const failedOperation = Result.fail<string, Error>(new Error('Network error'));

// Try to recover from the error by providing an alternative result
const recoveredResult = failedOperation.recover(error => {
  console.log('Attempting recovery from:', error.message);
  return Result.ok('Fallback value from cache');
});

console.log('Recovered successfully:', recoveredResult.isSuccess); // true
console.log('Recovered value:', recoveredResult.value); // "Fallback value from cache"
```

### Asynchronous Operations

#### Working with Promises

```typescript
// Convert a Promise to a Result
async function fetchData() {
  const promiseResult = await Result.fromPromise(
    fetch('https://api.example.com/data')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
      })
  );

  // Handle the Result from the Promise
  return promiseResult.match(
    data => ({ success: true, data }),
    error => ({ success: false, error: error.message })
  );
}

// Convert a Result to a Promise
const successResult = Result.ok<string, Error>('Hello, world!');
try {
  const value = await successResult.toPromise();
  console.log('Promise resolved with:', value); // "Hello, world!"
} catch (error) {
  console.error('Promise rejected with:', error);
}
```

#### Using Async Transformations

```typescript
// Using asyncMap to transform a value with an async function
async function processDataAsync() {
  const result = Result.ok<number, Error>(42);

  // Asynchronously transform the value
  const asyncResult = await result.asyncMap(async (num) => {
    // Simulate an API call or other async operation
    const response = await fetch(`https://api.example.com/multiply?value=${num}`);
    const data = await response.json();
    return data.result; // Assume this is 84 (42 * 2)
  });

  // If the async operation succeeds
  if (asyncResult.isSuccess) {
    console.log('Processed data:', asyncResult.value); // 84
  }
}

// Using asyncFlatMap for chaining async operations that return Results
async function validateAndProcessAsync(userId: string) {
  const userResult = Result.ok<string, Error>(userId);

  // Chain multiple async operations
  const finalResult = await userResult
    .asyncFlatMap(async (id) => {
      // Fetch user data
      const userData = await fetchUserData(id);
      return userData.isSuccess
        ? userData
        : Result.fail<UserData, Error>(new Error('User fetch failed'));
    })
    .asyncFlatMap(async (user) => {
      // Process user permissions
      const permissions = await checkPermissions(user);
      return permissions;
    });

  return finalResult;
}
```

#### Using orElse for Fallback Results

```typescript
// Try primary data source, fall back to backup if it fails
async function getData(): Promise<Result<string, Error>> {
  const primaryResult = await fetchFromPrimary();

  // If primary fails, try backup instead
  return primaryResult.orElse(await fetchFromBackup());
}

// Can also be used with synchronous operations
function getCachedOrCompute(key: string): Result<string, Error> {
  const cachedResult = getCachedValue(key);

  // If no cached value, compute it
  return cachedResult.orElse(computeValue(key));
}
```

#### JSON Serialization for Logging and Storage

```typescript
function processAndLog(input: string) {
  const result = processInput(input);

  // Convert to JSON-friendly object for logging
  const logObject = result.toJSON();
  logger.info('Processing result', logObject);

  // The logObject will look like:
  // Success case: { success: true, value: "processed data" }
  // Failure case: { success: false, error: { name: "ValidationError", message: "Invalid input" } }

  return result;
}
```

#### Retrying Operations

```typescript
import { Result, retry, tryCatchAsync } from 'ts-result-monad';

// Fetch data with potential network issues
async function fetchDataFromAPI(url: string): Promise<Result<any, Error>> {
  return await tryCatchAsync(async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  });
}

// Retry with exponential backoff (5 retries, starting with 1s delay)
const apiResult = await retry(
  () => fetchDataFromAPI('https://api.example.com/data'),
  5,    // number of retries
  1000  // initial delay in ms (doubles after each attempt)
);

if (apiResult.isSuccess) {
  console.log('API call succeeded after retries:', apiResult.value);
} else {
  console.error('API call failed after all retries:', apiResult.error.message);
}
```

### Combining Results

#### Working with Multiple Operations

```typescript
import { Result, combineResults } from 'ts-result-monad';

// Multiple independent operations
const results = [
  Result.ok<number, Error>(1),
  Result.ok<number, Error>(2),
  Result.ok<number, Error>(3)
];

const combined = combineResults(results);
console.log('All succeeded?', combined.isSuccess); // true
console.log('Combined values:', combined.value); // [1, 2, 3]

// If any operation fails, the combined result fails
const mixedResults = [
  Result.ok<number, Error>(1),
  Result.fail<number, Error>(new Error('Second operation failed')),
  Result.ok<number, Error>(3)
];

const mixedCombined = combineResults(mixedResults);
console.log('Mixed succeeded?', mixedCombined.isSuccess); // false
console.log('Error message:', mixedCombined.error.message); // "Second operation failed"
```

### Validation API

The library provides a fluent validation API for building type-safe validation rules in a chainable manner. The validation system integrates with the Result monad to provide a consistent error handling approach.

#### Basic Validation

```typescript
import { validate } from 'ts-result-monad';

interface User {
  name: string;
  email: string;
  age: number;
}

const user = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
};

const result = validate(user)
  .property('name', name => name.notEmpty().maxLength(100))
  .property('email', email => email.notEmpty().email())
  .property('age', age => age.isNumber().min(18))
  .validate();

if (result.isSuccess) {
  console.log('User is valid:', result.value);
} else {
  console.log('Validation failed:', result.error.message);
}
```

#### Nested Object Validation

```typescript
const userWithProfile = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  profile: {
    bio: 'Software developer',
    website: 'https://example.com'
  }
};

const result = validate(userWithProfile)
  .property('name', name => name.notEmpty())
  .property('email', email => email.email())
  .nested('profile', profile =>
    profile
      .property('bio', bio => bio.notEmpty())
      .property('website', website => website.matches(/^https?:\/\//))
  )
  .validate();
```

#### Array Validation

```typescript
const team = {
  name: 'Development Team',
  members: [
    { name: 'Alice', role: 'Developer' },
    { name: 'Bob', role: 'Designer' }
  ]
};

const result = validate(team)
  .property('name', name => name.notEmpty())
  .array('members', member =>
    member
      .property('name', name => name.notEmpty())
      .property('role', role => role.notEmpty())
  )
  .validate();
```

#### Custom Validation Rules

```typescript
validate(payment)
  .property('amount', amount =>
    amount.isNumber().custom(amt => amt > 0, 'Amount must be positive')
  )
  .property('currency', currency =>
    currency.oneOf(['USD', 'EUR', 'GBP'])
  )
  .custom(
    p => p.paymentMethod !== 'credit_card' || p.cardNumber !== undefined,
    'Card number is required for credit card payments'
  )
  .validate();
```

#### Framework Integrations

The validation API includes built-in integrations with popular frameworks:

##### Express.js Integration

```typescript
import express from 'express';
import { validationIntegrations } from 'ts-result-monad';

const app = express();
app.use(express.json());

// Create a validation middleware
const validateUser = validationIntegrations.validateBody(body =>
  body
    .property('name', name => name.notEmpty())
    .property('email', email => email.notEmpty().email())
    .property('age', age => age.isNumber().min(18))
);

// Use the middleware in your route
app.post('/users', validateUser, (req, res) => {
  // If validation passes, the request reaches this handler
  // Create user logic here
  res.json({ success: true, message: 'User created' });
});
```

##### React Hook Form Integration

```tsx
import { useForm } from 'react-hook-form';
import { validationIntegrations } from 'ts-result-monad';

// Define the validation schema
const validationResolver = validationIntegrations.createHookFormResolver(form =>
  form
    .property('name', name => name.notEmpty())
    .property('email', email => email.email())
    .property('password', password =>
      password.notEmpty().minLength(8)
    )
);

// Use with React Hook Form
function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: validationResolver
  });

  const onSubmit = (data) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}

      <input type="email" {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit">Sign Up</button>
    </form>
  );
}
```

##### Third-Party Validation Library Integrations

The API also includes adapters for popular validation libraries:

```typescript
import { z } from 'zod';
import { validationIntegrations } from 'ts-result-monad';

// Create a Zod schema
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18)
});

// Convert to Result
const validateUser = validationIntegrations.fromZod(userSchema);

// Validate data
const result = validateUser(userData);

// Similarly for Yup
import * as yup from 'yup';
const yupSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required()
});

const validateWithYup = validationIntegrations.fromYup(yupSchema);
```

### Why Use Result?

// ... existing code ...