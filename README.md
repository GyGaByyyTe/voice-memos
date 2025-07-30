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

## Browser Support

This application is designed to work in Google Chrome on Windows and Mac.
