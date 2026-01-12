# @choiceform/shared-auth

A shared authentication library based on Better Auth + Legend State.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    createAuth() / initAuth()                │
│                          (core.ts)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  Store   │  │ Service  │  │   API    │  │   Hooks     │  │
│  │  Layer   │  │  Layer   │  │  Layer   │  │   Layer     │  │
│  │          │  │          │  │          │  │             │  │
│  │authStore │  │authServ. │  │apiClient │  │useAuthSync  │  │
│  │storeAct. │  │callback  │  │authApi   │  │useProtected │  │
│  │computed  │  │companion │  │orgApi    │  │useEmailVer. │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Four-Layer Architecture

| Layer | Responsibility | Files |
|-------|----------------|-------|
| **Store Layer** | Reactive state management | `store/state.ts`, `store/actions.ts`, `store/computed.ts`, `store/utils.ts` |
| **Service Layer** | Business logic | `services/auth-service.ts`, `services/callback-service.ts`, `services/companion-team.ts` |
| **API Layer** | HTTP requests | `api/client.ts`, `api/auth-api.ts`, `api/organization-api.ts`, `api/team-api.ts` |
| **Hooks Layer** | React-specific | `hooks/use-auth-sync.ts`, `hooks/use-protected-route.ts`, `hooks/use-email-verification.ts` |

## Installation

```bash
pnpm add @choiceform/shared-auth
```

### Peer Dependencies

```json
{
  "@legendapp/state": "v3.0.0-beta.30",
  "better-auth": "^1.4.4",
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0"
}
```

## Quick Start

### Option 1: initAuth (Recommended)

Quick initialization with default configuration, automatically includes `magicLinkClient` and `organizationClient` plugins:

```typescript
import { initAuth } from "@choiceform/shared-auth"

const auth = initAuth({
  baseURL: "https://api.example.com",
  // Optional configuration
  tokenStorageKey: "auth-token",        // localStorage key, defaults to "auth-token"
  skipTokenCleanupOnError: false,       // Set to true for development
})

export { auth }
```

### Option 2: createAuth (Custom Configuration)

Use when you need custom Better Auth plugins:

```typescript
import { createAuth } from "@choiceform/shared-auth"
import { magicLinkClient, organizationClient } from "better-auth/client/plugins"

const auth = createAuth({
  baseURL: "https://api.example.com",
  plugins: [
    magicLinkClient(),
    organizationClient({ teams: { enabled: true } }),
    // Other plugins...
  ],
  tokenStorageKey: "auth-token",
})

export { auth }
```

## AuthInstance API

The instance returned by `createAuth()` / `initAuth()` includes:

```typescript
const auth = initAuth({ baseURL: "..." })

// API Layer
auth.apiClient          // HTTP client
auth.authApi            // Auth API
auth.organizationApi    // Organization API
auth.teamApi            // Team API

// Store Layer
auth.authStore          // Legend State Observable
auth.authComputed       // Computed properties
auth.tokenStorage       // Token storage
auth.storeActions       // State actions

// Service Layer
auth.authService        // Auth business logic

// Active State Management
auth.setActiveOrganization(request)
auth.setActiveTeam(request)
auth.setActiveOrganizationAndTeam(orgId, teamId)

// Shortcut Methods
auth.getCurrentUser()   // Get current user
auth.getCurrentUserId() // Get current user ID
auth.isAuthenticated()  // Check if authenticated
auth.isLoading()        // Check if loading
auth.isLoaded()         // Check if loaded
auth.getAuthToken()     // Get token
auth.getAuthHeaders()   // Get auth headers
auth.waitForAuth()      // Wait for auth to complete
auth.userManager        // User manager

// Better Auth Client (Advanced)
auth.authClient         // Raw Better Auth client
```

## Hooks (Recommended)

### useAuthSync

Sync authentication state, replaces manual Better Auth session sync:

```typescript
import { useAuthSync } from "@choiceform/shared-auth"

function App() {
  useAuthSync(auth, {
    skipCompanionTeamPaths: ['/auth/callback', '/auth/delete-success'],
    onAuthChange: (isAuthenticated) => {
      if (isAuthenticated) {
        syncTheme()
        syncLanguage()
      }
    }
  })

  return <YourApp />
}
```

### useProtectedRoute

Route protection, checks authentication status and email verification:

```typescript
import { useProtectedRoute } from "@choiceform/shared-auth"

function ProtectedRoute({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const { status, shouldRender, redirectPath } = useProtectedRoute(auth, {
    pathname: location.pathname,
    publicRoutePrefixes: ['/resources', '/public'],
    requireEmailVerified: true,
    lang: 'us'
  })

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath, { replace: true })
    }
  }, [redirectPath])

  if (!shouldRender) {
    return <Loading />
  }

  return <>{children}</>
}
```

### useEmailVerification

Email verification flow:

```typescript
import { useEmailVerification } from "@choiceform/shared-auth"

function VerifyEmailPage({ email, lang }) {
  const navigate = useNavigate()

  const {
    isLoading,
    isAlreadyVerified,
    isCountingDown,
    countdown,
    resendVerification,
    changeEmail
  } = useEmailVerification(auth, {
    email,
    lang,
    onRedirect: (path) => navigate(path),
    onSendSuccess: (email) => toast.success(`Verification email sent to ${email}`),
    onSendError: () => toast.error('Failed to send'),
    onAlreadyVerified: () => navigate('/community')
  })

  return (
    <div>
      {isAlreadyVerified ? (
        <p>Email verified, redirecting...</p>
      ) : (
        <>
          <button onClick={resendVerification} disabled={isLoading || isCountingDown}>
            {isCountingDown ? `Retry in ${countdown}s` : 'Resend'}
          </button>
          <button onClick={changeEmail}>Use different email</button>
        </>
      )}
    </div>
  )
}
```

### useAuthInit

Initialize authentication state:

```typescript
import { useAuthInit, initializeAuth } from "@choiceform/shared-auth"

// Hook approach
function App() {
  useAuthInit(auth)
  return <YourApp />
}

// Or manual call
await initializeAuth(auth)
```

## Service Layer

### authService

Auth business logic wrapper:

```typescript
// OAuth sign in
await auth.authService.signInWithOAuth("github", callbackURL, newUserCallbackURL, errorCallbackURL)

// Magic Link sign in
await auth.authService.signInWithMagicLink(email, callbackURL, name, newUserCallbackURL)

// Email/password sign in
const result = await auth.authService.signInWithEmail(email, password)

// Email/password sign up
const result = await auth.authService.signUpWithEmail(email, password, name, callbackURL)

// Sign out
await auth.authService.signOut("/sign-in")

// Delete account
await auth.authService.deleteUser(callbackURL, password)

// Fetch session with token
await auth.authService.fetchAndSetSession(token)
```

### callbackService

Handle various auth callbacks (OAuth, email verification, user deletion, etc.):

```typescript
import { createCallbackService } from "@choiceform/shared-auth"

const callbackService = createCallbackService(auth, {
  lang: 'us',
  defaultRedirect: '/',
  signInPath: '/sign-in',
  linkExpiredPath: '/auth/link-expired',
  deleteSuccessPath: '/auth/delete-success',
})

// Handle OAuth callback
const result = await callbackService.handleOAuthCallback(token, isNewUser)

// Handle email verification callback
const result = await callbackService.handleEmailVerificationCallback(token)

// Handle delete user callback
const result = await callbackService.handleDeleteUserCallback(token, userEmail)

// Unified handler
const result = await callbackService.handleCallback(type, token, { isNewUser, userEmail, invitationId })
```

### companionTeam

Companion team setup:

```typescript
import { setupCompanionTeam } from "@choiceform/shared-auth"

await setupCompanionTeam(auth, options)
```

## Store Layer

### authStore (Legend State Observable)

Reactive state, can be used in React components:

```typescript
import { use$ } from "@legendapp/state/react"

function MyComponent() {
  const user = use$(auth.authStore.user)
  const isAuthenticated = use$(auth.authStore.isAuthenticated)
  const loading = use$(auth.authStore.loading)
  const error = use$(auth.authStore.error)
  const isLoaded = use$(auth.authStore.isLoaded)

  // Computed state
  const isReady = use$(auth.authComputed.isReady)
  const activeOrganizationId = use$(auth.authComputed.activeOrganizationId)
}
```

### storeActions

State management actions:

```typescript
// Read
auth.storeActions.getUser()
auth.storeActions.getUserId()
auth.storeActions.isAuthenticated()
auth.storeActions.isLoading()
auth.storeActions.isLoaded()

// Update
auth.storeActions.setUser(user)
auth.storeActions.updateUser({ name: "New Name" })
auth.storeActions.setLoading(true)
auth.storeActions.setError("Error message")
auth.storeActions.clearAuth()
auth.storeActions.handleUnauthorized()

// Active state
auth.storeActions.setActiveOrganizationId(orgId)
auth.storeActions.setActiveTeamId(teamId)
```

### Store Utilities

Standalone utility functions for non-component scenarios:

```typescript
import {
  getCurrentUser,
  getCurrentUserId,
  isAuthenticated,
  isLoading,
  isLoaded,
  waitForAuth,
  getAuthToken,
  getAuthTokenSync,
  getAuthHeaders,
  getAuthHeadersSync,
  handle401Response,
  createUserManager,
} from "@choiceform/shared-auth"

// Wait for auth to complete
await waitForAuth(auth.authStore)

// Get auth headers (sync)
const headers = getAuthHeadersSync(auth.tokenStorage)

// Handle 401 response
handle401Response(response, auth.storeActions)
```

## Utilities

```typescript
import {
  // Environment
  getEnvVar,
  getAuthBaseUrl,

  // Validation
  isValidEmail,

  // Error parsing
  parseAuthError,
  isTokenExpiredError,
  AUTH_ERROR_CODES,

  // URL utilities
  getNameFromEmail,
  buildAuthUrl,
  buildAuthPath,
  clearAuthParams,

  // User mapping
  extractSessionUser,
} from "@choiceform/shared-auth"

// Validate email
if (isValidEmail(email)) {
  // ...
}

// Parse error
const { code, message, isKnownError } = parseAuthError(error)

// Check if token expired
if (isTokenExpiredError(error)) {
  // Re-authenticate
}

// Build URL
const url = buildAuthPath('/verify-email', { lang: 'us', email })
```

## API Layer

Low-level API access:

```typescript
import {
  createApiClient,
  createAuthApi,
  createOrganizationApi,
  createTeamApi,
  parseErrorResponse,
} from "@choiceform/shared-auth"

// Use APIs directly
const response = await auth.authApi.getSession()
const orgs = await auth.organizationApi.listOrganizations()
const teams = await auth.teamApi.listTeams()
```

## Directory Structure

```
src/
├── api/                    # API Layer
│   ├── client.ts           # HTTP client
│   ├── auth-api.ts         # Auth API
│   ├── organization-api.ts # Organization API
│   ├── team-api.ts         # Team API
│   └── index.ts
├── services/               # Service Layer
│   ├── auth-service.ts     # Auth business logic
│   ├── callback-service.ts # Callback handling
│   ├── companion-team.ts   # Companion team setup
│   └── index.ts
├── store/                  # Store Layer
│   ├── state.ts            # State definition
│   ├── actions.ts          # State actions
│   ├── computed.ts         # Computed properties
│   ├── utils.ts            # Utility functions
│   └── index.ts
├── hooks/                  # React Hooks
│   ├── use-auth-init.ts    # Auth initialization
│   ├── use-auth-sync.ts    # State sync
│   ├── use-protected-route.ts
│   ├── use-email-verification.ts
│   └── index.ts
├── utils/                  # Utilities
│   ├── auth-utils.ts       # Auth utilities
│   ├── user-mapper.ts      # User mapping
│   ├── date.ts             # Date utilities
│   ├── env.ts              # Environment variables
│   └── index.ts
├── types/                  # Type definitions
│   ├── auth.ts
│   ├── callback.ts
│   ├── organization.ts
│   ├── team.ts
│   ├── user.ts
│   └── index.ts
├── lib/                    # Better Auth client
│   └── auth-client.ts
├── core.ts                 # Core entry (createAuth)
├── init.ts                 # Quick init (initAuth)
├── config.ts               # Default config
└── index.ts                # Export entry
```

## Type Exports

```typescript
import type {
  // Core
  AuthInstance,
  AuthState,
  AuthConfig,
  SessionUser,
  SessionUserMetadata,
  Session,

  // Services
  AuthService,
  AuthServiceConfig,
  CallbackService,
  CallbackType,
  CallbackResult,
  CallbackConfig,

  // Hooks
  UseAuthSyncConfig,
  UseAuthSyncResult,
  UseProtectedRouteConfig,
  UseProtectedRouteResult,
  ProtectionStatus,
  UseEmailVerificationConfig,
  UseEmailVerificationResult,

  // Organization
  Organization,
  OrganizationMetadata,
  FullOrganization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  Member,
  MemberWithUser,
  MemberRole,
  Invitation,
  InvitationDetail,
  InvitationStatus,

  // Team
  Team,
  TeamMetadata,
  TeamMember,
  CreateTeamRequest,
  UpdateTeamRequest,

  // API
  ApiClient,
  ApiClientConfig,
  ApiResponse,
  TokenStorage,
  AuthApi,
  OrganizationApi,
  TeamApi,

  // Store
  StoreActions,

  // Utilities
  AuthErrorCode,
  ParsedAuthError,
} from "@choiceform/shared-auth"
```

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Watch tests
pnpm test:watch
```

## License

MIT
