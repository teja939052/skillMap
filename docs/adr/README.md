# Skill Map — Architecture Decision Records

## ADR-001: Modular Monolith over Microservices

**Status**: Accepted

**Context**: The platform needs to support 100,000 users while remaining operable by a single product team.

**Decision**: Build a modular monolith API with clear module boundaries, independently scalable workers, and Redis for async processing.

**Consequences**:
- Simpler deployment and debugging
- No distributed transaction complexity
- Can extract services later when justified

---

## ADR-002: MongoDB as Primary Datastore

**Status**: Accepted (Required by SIH26044)

**Context**: The domain model has flexible, nested structures (competency hierarchies, evidence, role blueprints) that fit document modeling.

**Decision**: Use MongoDB Atlas with the official Node.js driver (not Mongoose) for direct query control.

**Consequences**:
- Flexible schema evolution
- Powerful aggregation pipeline
- Need to manage indexes carefully

---

## ADR-003: JWT Access + Rotating Refresh Tokens

**Status**: Accepted

**Context**: Stateless API authentication with secure session management.

**Decision**: Short-lived access tokens (15min) + rotating refresh tokens (7d) with server-side revocation records.

**Consequences**:
- Stateless API (horizontally scalable)
- Refresh token rotation prevents replay attacks
- Need Redis for token blacklist/revocation

---

## ADR-004: Zod for All Validation

**Status**: Accepted

**Context**: Need runtime validation that shares types between frontend and backend.

**Decision**: Define all schemas in packages/contracts using Zod, use them on both client and server.

**Consequences**:
- Single source of truth for validation
- TypeScript type inference from schemas
- Shared between API and web

---

## ADR-005: TanStack Query for Server State

**Status**: Accepted

**Context**: Complex authenticated SaaS workflows with caching, retries, and optimistic updates needed.

**Decision**: Use TanStack Query (React Query) for all server data fetching.

**Consequences**:
- Automatic caching and refetching
- Optimistic updates support
- Stale-while-revalidate patterns

---

## ADR-006: BullMQ for Async Processing

**Status**: Accepted

**Context**: Resume parsing, email notifications, analytics aggregation, and other slow/bursty work must not block the request path.

**Decision**: Use BullMQ with Redis for all async job processing.

**Consequences**:
- Reliable job processing with retries
- Independent worker scaling
- Observable job status
