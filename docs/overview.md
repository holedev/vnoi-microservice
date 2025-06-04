# Project Overview

This document expands on the short README and describes the main components used in this project.

## Environment

- **Node.js version**: recommended `18.18.2`.
- **Database**: MongoDB 7.0.

## Technology Stack

### Client
- React 18.2.0 with Vite 4.4.5 for building the frontend.
- MUI 5.14.4 provides the UI component library.

### Server
- Microservice architecture implemented with Express.
- gRPC used for service-to-service communication.
- RabbitMQ handles message queueing between services.

### Tools
- Cypress for end-to-end testing.
- Codacy for code quality.

## Microservices

The `server/SERVICE.json` file defines a number of microservices used by the backend:

- **Gateway Service** – entry point for API requests (port 9000).
- **Common Service** – shared functionality (port 9001, gRPC port 50001).
- **User Service** – user management (port 9002, gRPC port 50002).
- **Exercise Service** – exercise features (port 9003, gRPC port 50003).
- **Media Service** – media handling (port 9004, gRPC port 50004).
- **Learning Service** – learning modules (port 9005, gRPC port 50005).
- **Statistics Service** – collects statistics (port 9006, gRPC port 50006).
- **Logging Service** – centralized logging (port 9007).

These services communicate through HTTP gateways, gRPC calls, and RabbitMQ exchanges.

## Documentation

Additional documentation is available at [Gitbook](https://vnoi-doc.dorara.id.vn/).
