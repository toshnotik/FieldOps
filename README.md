# FieldOps

FieldOps is a mobile-first React Native application for field service employees. It demonstrates a production-style Expo architecture with authentication, task management, map support, local app state, form validation, mock REST API calls, and tests.

## Stack

- React Native + Expo
- TypeScript
- Expo Router
- TanStack Query
- Zustand
- React Hook Form + Zod
- Mock REST API layer
- react-native-maps
- Expo Location
- Expo ImagePicker / Camera
- SecureStore
- Jest + React Native Testing Library

## Features

- Login with email/password validation
- Access token persistence and automatic sign-in
- Task list with search, filters, pull-to-refresh, loading/error/empty states, and pagination
- Task details with status changes, comments, photos, assignee, deadline, address, and coordinates
- Native map with task markers and a web fallback view
- Create task flow
- Profile screen with task statistics, theme toggle, and logout

## Getting Started

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm start
```

Run web:

```bash
npm run web
```

Run tests:

```bash
npm test -- --runInBand
```

Run TypeScript checks:

```bash
npm run typecheck
```

## Demo Login

```text
Email: tech@fieldops.local
Password: 123456
```

## Project Structure

```text
app/                 Expo Router routes
src/entities/        Domain models and entity UI
src/features/        Feature-level logic
src/providers/       App providers
src/screens/         Screen implementations
src/shared/          API, UI primitives, hooks, utils, shared types
src/store/           Zustand stores
```

## Notes

The backend is mocked in `src/shared/api/client.ts`, so the app can be run without external services. The map screen uses `react-native-maps` on native platforms and a web-specific fallback because native map rendering is not supported by Expo Web in the same way.
