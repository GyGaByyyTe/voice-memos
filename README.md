# My Voice Memos

A web application that enables users to create memos using voice or keyboard input.

## Features

- List of all memos with options to add new, view/edit, and delete existing ones
- Voice recording using the SpeechRecognition API
- Persistent storage using IndexedDB
- Responsive design for desktop and mobile devices

## Project Structure

This project is organized as a pnpm workspace with the following packages:

- `packages/web`: The main web application built with React and TypeScript
- `packages/common`: Shared code, models, services, and utilities

The project is structured to allow for future expansion, such as adding a browser extension with the same functionality.

## Technologies Used

- React 19
- TypeScript
- SpeechRecognition API
- IndexedDB
- pnpm workspace

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (v7 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

### Development

To start the development server:

```bash
pnpm start
```

This will run the web application on [http://localhost:3000](http://localhost:3000).

### Building

To build all packages:

```bash
pnpm build
```

### Testing

To run tests for all packages:

```bash
pnpm test
```

#### Testing Setup

The project uses Jest and React Testing Library for testing:

- **Common Package**: Uses Jest with ts-jest for TypeScript support
  - Tests are located in `src/__tests__` directory
  - Tests utility functions and other non-React code

- **Web Package**: Uses Create React App's built-in Jest configuration with React Testing Library
  - Tests are co-located with components
  - Uses a custom render function from `src/test-utils.tsx` that provides:
    - Access to testing utilities
    - Mock implementations for browser APIs like SpeechRecognition

#### Writing Tests

Example of testing a React component:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByTestId('button');

    // Check content
    expect(button).toHaveTextContent('Click me');

    // Check default classes
    expect(button).toHaveClass('button-primary');

    // Test interactions
    fireEvent.click(button);
  });
});
```

Example of testing a utility function:

```ts
import { truncateText } from '../../utils';

describe('truncateText', () => {
  it('should return the original text if it is shorter than maxLength', () => {
    const text = 'Hello, world!';
    const maxLength = 20;
    expect(truncateText(text, maxLength)).toBe(text);
  });
});
```

## Project Design

The application is designed with modularity and reusability in mind:

- **Common Package**: Contains shared code that can be used across different implementations (web app, browser extension, etc.)
  - Models: Data structures and interfaces
  - Services: Abstract interfaces for data storage and other services
  - Hooks: Custom React hooks, including speech recognition
  - Utils: Utility functions

- **Web Package**: The main web application
  - Components: UI components
  - Pages: Application pages
  - Services: Concrete implementations of services defined in the common package

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **Continuous Integration**: Automatically runs linting and tests on every push and pull request to the main branch.
- **Continuous Deployment**: Automatically builds and deploys the application to GitHub Pages when changes are pushed to the main branch.

The CI/CD pipeline ensures code quality and provides an always up-to-date deployed version of the application.

### Workflows

- `ci.yml`: Runs linting and tests
- `deploy.yml`: Builds and deploys the application to GitHub Pages

### Deployment Configuration

The application is configured for deployment to GitHub Pages with the following settings:

- **Homepage**: The `homepage` field in `packages/web/package.json` is set to `https://gygabyyyte.github.io/voice_memos/` to ensure correct asset path resolution.
- **Build Output**: The build output from `packages/web/build` is deployed to GitHub Pages.

#### Important Notes for Deployment

- The `homepage` field in `package.json` is crucial for Create React App applications deployed to GitHub Pages. Without it, static assets (JS, CSS, images) will have incorrect paths and result in 404 errors.
- If the repository name changes, the `homepage` field must be updated accordingly.
- For local development, the `homepage` field doesn't affect the development server, which always serves from the root path.

## Browser Support

This application is designed to work in Google Chrome on Windows and Mac.
