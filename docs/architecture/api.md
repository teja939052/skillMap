# API Architecture

## Module Boundaries

The API follows a modular monolith pattern with clear boundaries:

```
src/
├── config/         # Environment, DB, Redis configuration
├── middleware/     # Auth, RBAC, validation, error handling
├── models/         # MongoDB collection access layers
├── routes/         # HTTP route definitions
├── services/       # Business logic
├── types/          # TypeScript type definitions
└── utils/          # JWT, password, pagination, response helpers
```

## Request Lifecycle

1. Request enters → CORS/Helmet/Rate Limit
2. Route handler → Zod validation
3. Auth middleware → JWT verification
4. RBAC middleware → Permission check
5. Service layer → Business logic
6. Model layer → Database operations
7. Response envelope → Consistent JSON

## Data Flow

```
Client → Express → Middleware → Route → Service → Model → MongoDB
                                      ↓
                                 Response → Client
```

## Error Handling

All errors flow through the global error handler:
- AppError (operational) → structured response with status code
- ZodError (validation) → 400 with field details
- JWT errors → 401 unauthorized
- Unhandled → 500 with generic message (no stack leak)
