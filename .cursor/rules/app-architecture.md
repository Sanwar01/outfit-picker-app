---
description: Architecture rules for React Native + Next.js monorepo applications
alwaysApply: true
---

# React Native + Next.js Architecture

Act as the senior software architect for this project.

Your job is not only to make features work. Protect the application's:

* architecture
* maintainability
* security
* consistency
* scalability
* developer experience

Follow these rules when creating or modifying code.

Do not introduce unnecessary complexity. Prefer simple, strong architectural boundaries over enterprise patterns.

---

# 1. Core Architecture

The default architecture is:

```text
React Native Mobile App
        ↓
      API
        ↓
Next.js Backend
        ↓
Service / Business Logic
        ↓
Repository / Data Access
        ↓
Database / External Services
```

The mobile app is a client.

It must not contain:

* private API keys
* privileged database logic
* server-side business rules
* payment secrets
* AI provider secrets
* administrative operations

Important business operations should run through the backend.

---

# 2. Repository Structure

Use a monorepo.

Preferred structure:

```text
repo/
├── mobile/
├── web/
├── packages/
│   ├── api-contracts/
│   ├── validation/
│   └── domain/
└── package.json
```

Or, if the project already uses `apps/`:

```text
repo/
├── apps/
│   ├── mobile/
│   └── web/
├── packages/
└── package.json
```

Do not restructure an existing working repository unless there is a meaningful architectural benefit.

The responsibilities are:

```text
mobile/
→ React Native application

web/
→ Next.js landing/marketing website
→ API/backend

packages/
→ framework-independent code shared between apps
```

---

# 3. Mobile Architecture: Feature First

Organise the React Native application primarily by feature.

Prefer:

```text
mobile/
    ├── app/
    ├── features/
    │   ├── auth/
    │   ├── profile/
    │   ├── wardrobe/
    │   └── ...
    ├── components/
    ├── services/
    ├── stores/
    ├── hooks/
    └── theme/
```

A feature can contain:

```text
features/
└── wardrobe/
    ├── screens/
    ├── components/
    ├── hooks/
    ├── api/
    ├── schemas/
    └── types.ts
```

Not every feature needs every folder.

Only create folders that contain meaningful code.

## Ownership rule

If code exists because of one feature, keep it inside that feature.

Only promote code to shared folders when multiple features genuinely reuse it.

Do not prematurely create global abstractions.

---

# 4. Keep Screens and Components Thin

React Native screens should mainly:

* compose UI
* connect hooks
* trigger actions
* handle navigation
* display loading/error states

They should not contain:

* raw API calls
* database logic
* complex business rules
* authentication internals
* large data transformations
* upload implementation details
* provider-specific SDK logic

Prefer:

```text
Screen
  ↓
Feature Hook
  ↓
Feature API
  ↓
Central API Client
```

Business logic belongs outside React components.

---

# 5. State Ownership

Do not use one state solution for everything.

Use this priority:

```text
Local React state
        ↓
React Hook Form
        ↓
TanStack Query
        ↓
Zustand
```

## TanStack Query

Use TanStack Query for server/API state such as:

* profile
* resources
* search results
* subscriptions
* recommendations
* AI results

Do not duplicate server data inside Zustand.

## Zustand

Use Zustand only for genuinely shared client state such as:

* onboarding progress
* multi-screen drafts
* temporary workflow state
* shared filters
* local app preferences

If state belongs to one component or screen, keep it local.

---

# 6. Central API Client

Do not scatter `fetch()` calls throughout the application.

Create one central API client responsible for:

* base URL
* authentication headers
* request configuration
* response parsing
* HTTP errors

Feature APIs should use the central client.

Example flow:

```text
WardrobeScreen
      ↓
useWardrobe()
      ↓
wardrobeApi.getAll()
      ↓
apiClient()
      ↓
GET /api/v1/wardrobe
```

UI components should not know how authentication headers or HTTP configuration work.

---

# 7. Version Mobile APIs

Mobile users may run older app versions after the backend has been deployed.

Therefore public mobile APIs should be versioned.

Default:

```text
/api/v1/*
```

Example:

```text
/api/v1/auth
/api/v1/profile
/api/v1/wardrobe
/api/v1/outfits
```

Breaking API changes should normally introduce a new version instead of silently breaking older clients.

Do not create a new API version for backwards-compatible changes.

---

# 8. Backend Architecture

Next.js route handlers must remain thin.

Preferred flow:

```text
Route Handler
      ↓
Authentication
      ↓
Validation
      ↓
Service
      ↓
Repository
      ↓
Database
```

Example server structure:

```text
web/src/server/
├── services/
├── repositories/
├── auth/
├── database/
├── integrations/
└── errors/
```

## Route handlers

Route handlers should mainly handle:

* HTTP input
* authentication
* validation
* calling the appropriate service
* formatting the HTTP response

Do not put significant business logic directly inside:

```text
app/api/**/route.ts
```

---

# 9. Service Layer

Services own application behaviour and business rules.

Examples:

```text
user.service.ts
wardrobe.service.ts
outfit.service.ts
subscription.service.ts
```

Services may:

* enforce limits
* perform permission checks
* coordinate multiple repositories
* start AI operations
* check subscription entitlements
* orchestrate workflows

Keep services independent of HTTP where practical.

---

# 10. Repository / Data Access

Use repositories when a domain has meaningful persistence logic.

Repositories should contain:

* database queries
* inserts
* updates
* deletes
* database-specific filtering

Do not scatter database calls across:

* route handlers
* React components
* unrelated services

Do not create repository abstractions for trivial cases purely to follow a pattern.

Use them where they make the code clearer.

---

# 11. Shared Contracts and Validation

Use the monorepo to share API-facing contracts.

Prefer:

```text
packages/
├── api-contracts/
├── validation/
└── domain/
```

Share:

* DTOs
* enums
* Zod schemas
* public API types
* safe domain logic

Do not share:

* server database models
* private server implementation details
* framework-specific code

Prefer deriving TypeScript types from Zod schemas where practical.

Example:

```ts
export const createItemSchema = z.object({
  name: z.string().min(1),
});

export type CreateItemInput =
  z.infer<typeof createItemSchema>;
```

Client validation improves UX.

Server validation is mandatory for security.

Never trust client validation alone.

---

# 12. Authentication and Authorisation

Treat the mobile app as untrusted.

The mobile app may send:

```http
Authorization: Bearer <token>
```

The backend must validate the token.

Derive the user identity from the authenticated token.

Never trust a client-provided value such as:

```json
{
  "userId": "123"
}
```

for authorisation.

Protected operations must check server-side whether the authenticated user is allowed to perform the action.

---

# 13. Secrets

Anything bundled into a mobile app should be considered public.

Never place secrets such as:

```text
OPENAI_API_KEY
STRIPE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_PASSWORD
WEBHOOK_SECRET
```

inside the React Native application.

Private integrations belong on the backend.

---

# 14. Database Access

For important business functionality prefer:

```text
Mobile
  ↓
API
  ↓
Service
  ↓
Database
```

When using Supabase, direct mobile access is acceptable only for carefully selected simple operations where:

* Row Level Security is correct
* no privileged credentials are needed
* no sensitive business rule is exposed

Operations such as these should normally go through the backend:

* AI functionality
* subscriptions
* payments
* usage limits
* moderation
* admin actions
* entitlement checks
* privileged writes

---

# 15. File and Image Uploads

Do not unnecessarily proxy large files through the Next.js server.

Prefer:

```text
Mobile
   ↓
Request upload permission / signed URL
   ↓
Backend
   ↓
Mobile
   ↓
Object Storage
   ↓
Backend saves metadata
```

Where appropriate, resize or compress images before upload.

Validate server-side where relevant:

* MIME type
* file size
* file type
* ownership
* upload destination

Never trust the filename or metadata supplied by the client.

---

# 16. AI Features

AI provider calls must run server-side.

Preferred architecture:

```text
Mobile
   ↓
API
   ↓
AI Service
   ↓
AI Provider
```

Do not call private AI APIs directly from React Native.

AI provider-specific logic should be isolated behind an integration or service.

Structured AI responses should be runtime validated before being trusted or persisted.

For long-running AI tasks, support explicit states such as:

```text
pending
processing
completed
failed
```

Do not introduce background queues until the application actually requires them.

---

# 17. Error Handling

Use consistent machine-readable API errors.

Prefer:

```json
{
  "error": {
    "code": "RESOURCE_LIMIT_REACHED",
    "message": "You have reached your limit.",
    "details": {}
  }
}
```

The mobile app should react to stable error codes rather than parsing human-readable messages.

Examples:

```text
AUTH_REQUIRED
FORBIDDEN
VALIDATION_ERROR
RESOURCE_NOT_FOUND
SUBSCRIPTION_REQUIRED
RATE_LIMIT_EXCEEDED
```

---

# 18. Shared UI

Do not force React Native and Next.js to share UI merely because they are in the same monorepo.

Prefer sharing:

* types
* schemas
* API contracts
* enums
* constants
* domain functions
* framework-independent utilities

Usually keep separate:

* navigation
* screens
* mobile components
* marketing components
* layouts
* styling

Reuse should reduce complexity, not create it.

---

# 19. Security Rules

For every significant feature consider:

```text
What input can the client manipulate?

Does this action require authentication?

Does it require authorisation?

Could one user access another user's data?

Are we exposing a private credential?

Can this endpoint be abused?

Do uploads require validation?

Should this endpoint be rate limited?

Can subscription/payment state be spoofed?

Are we trusting unvalidated external or AI data?
```

Treat all client input as untrusted.

---

# 20. Avoid Architecture Drift

Actively avoid:

```text
raw fetch calls scattered across UI

business logic inside React components

database queries directly inside route handlers

large screens containing multiple responsibilities

duplicate API types

duplicate validation schemas

server state stored inside Zustand

private credentials inside mobile code

provider SDKs scattered throughout features

inconsistent error formats

breaking unversioned mobile APIs

unnecessary abstractions
```

When modifying affected code, improve these problems incrementally.

Do not perform unrelated large-scale refactors unless requested.

---

# 21. Cursor Workflow

Before implementing a significant feature:

1. Inspect the existing relevant code.
2. Understand existing conventions and similar features.
3. Identify which feature/domain owns the new code.
4. Determine client state vs server state.
5. Determine required API endpoints.
6. Determine validation and authorisation requirements.
7. Determine where business logic belongs.
8. Reuse existing components and abstractions where appropriate.
9. Avoid introducing a competing architectural pattern.
10. Implement the smallest coherent solution.

Do not start generating files before understanding the existing implementation.

Do not blindly preserve an existing bad pattern.

If existing code conflicts with these rules, improve the affected area incrementally.

---

# 22. Preferred Feature Flow

For a typical server-backed mobile feature, prefer:

```text
Screen
  ↓
Feature Hook
  ↓
TanStack Query
  ↓
Feature API
  ↓
Central API Client
  ↓
/api/v1/*
  ↓
Route Handler
  ↓
Authentication
  ↓
Validation
  ↓
Service
  ↓
Repository
  ↓
Database
```

Not every feature needs every layer.

Do not create empty abstractions just to match this diagram.

---

# 23. Architectural Decision Rule

When multiple approaches are valid, choose based on this priority:

```text
Security
   ↓
Correctness
   ↓
Simplicity
   ↓
Maintainability
   ↓
Existing project conventions
   ↓
Scalability
```

Do not design infrastructure for hypothetical scale before the product requires it.

Prefer code that another engineer can understand quickly.

---

# 24. Project-Specific Context

Keep project-specific decisions in a separate Cursor rule:

```text
.cursor/rules/project-context.mdc
```

This architecture file should remain reusable between applications.

The project-specific rule should define things such as:

```text
Project name
Product description
Primary users
Core features

Mobile runtime
Routing
Styling

Database
Authentication
Storage

AI provider
Payment provider
Subscription provider

Analytics
Monitoring

Environment configuration
```

Do not put application-specific product requirements into this reusable architecture rule.

---

# Final Principle

Build the application so that adding the next feature is easier than adding the previous one.

When uncertain, favour:

```text
feature-first mobile organisation

thin screens

clear state ownership

central API access

shared contracts

server-side business logic

thin API routes

strong validation

secure authentication

simple abstractions

incremental architecture
```

Architecture should create clear boundaries without slowing development.
