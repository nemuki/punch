# Copilot Instructions for Punch

## Project Overview

Punch is a React-based Slack app for Japanese workplace attendance tracking (勤怠連絡). Users authenticate via Slack OAuth, configure channels/conversations, and send attendance messages with optional emoji status updates.

## Architecture & Key Patterns

### Core Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Mantine v7 (components, forms, hooks, notifications)
- **State**: React Context + Mantine forms + LocalStorage persistence
- **Slack Integration**: Custom API wrappers around Slack Web API
- **Code Quality**: Biome for linting/formatting, no tests currently

### Key Architectural Decisions

**1. Layered API Architecture**

- `src/infra/api/slack.ts` - Raw Slack API calls with FormData
- `src/infra/repository/slack.ts` - Business logic layer with error handling
- Pattern: Repository functions handle multiple API calls and transformations

**2. Context-Based State Management**

```typescript
// Two main contexts:
AuthContext - Slack OAuth tokens, user profile, auth state
Mantine Form Contexts - App settings and punch-in forms via createFormContext
```

**3. LocalStorage Persistence**

- Settings stored in `punch-app-settings` and `punch-slack-oauth-token` keys
- Validation via `isLocalStorageValid()` in `src/utils/local-storage-validator.ts`
- Default settings in `applicationConstants.defaultAppSettings`

### Critical Data Flow

**Authentication Flow:**

1. OAuth redirect → `AuthContext` handles code exchange
2. Tokens stored in LocalStorage with expiration
3. Auto-refresh via refresh tokens
4. User profile fetched and cached

**Punch-In Flow:**

1. User configures channels via `AppSettings` form
2. App fetches conversation history to find thread targets
3. Message posted to configured channels with optional emoji status
4. Emoji status auto-expires (9 hours for work, 24:00 for leave)

## Development Workflows

### Environment Setup

```bash
# Required environment variables (create .env from .env.example)
VITE_SLACK_CLIENT_ID=your_slack_client_id
VITE_SLACK_CLIENT_SECRET=your_slack_client_secret
VITE_SLACK_REDIRECT_URI=http://localhost:5173
VITE_USAGE_URL=optional_usage_url
VITE_MAINTAINER_URL=optional_maintainer_url
```

### Build Commands

```bash
pnpm dev          # Development server
pnpm build        # TypeScript compile + Vite build
pnpm preview      # Preview production build
pnpm check:fix    # Biome check + auto-fix
```

### Slack App Configuration

- Use `slack-manifest.yml` to create Slack app
- Required scopes: `channels:history`, `channels:read`, `users.profile:read`, `users.profile:write`, `chat:write`
- Configure OAuth redirect URLs for development/production

## Project-Specific Conventions

### File Organization

- `src/components/` - Pure UI components, exported via index.ts
- `src/context/` - React Context providers and form contexts
- `src/infra/` - External service abstractions (API, repository layers)
- `src/types/` - TypeScript definitions, app-settings.ts for core domain types
- `src/utils/` - Pure functions, constants, environment configuration

### Form Management Pattern

```typescript
// Use Mantine's createFormContext for complex forms
const [Provider, useContext, useForm] = createFormContext<TypeName>();

// Forms can be 'controlled' or 'uncontrolled' mode
// Settings forms typically use 'uncontrolled' with LocalStorage sync
// Temporary forms use 'controlled' mode
```

### Error Handling

- API errors logged to console and shown via Mantine notifications
- LocalStorage validation prevents app crashes from corrupted data
- Auth errors displayed via `AuthError` component

### Japanese Localization

- All UI text in Japanese
- Form validation messages in Japanese
- Default emoji and status text configured for Japanese workplace culture

## Integration Points

### Slack API Constraints

- OAuth tokens expire and require refresh
- Conversation history limited to posts since 6 AM current day
- Thread detection relies on searching message history for specific patterns
- Rate limiting handled implicitly (no explicit retry logic)

### Deployment Considerations

- Vite base path configured for subdirectory deployment (`/punch/`)
- Static build output, no server-side requirements
- Environment variables must be prefixed with `VITE_`

### LocalStorage Schema

```typescript
// App settings include conversation configs and emoji preferences
AppSettings: { conversations: Conversation[], status: StatusEmojiSetting }
// OAuth tokens with expiration tracking
SlackOauthToken: { accessToken?: string, refreshToken?: string, expiresAt?: number }
```

## Common Tasks

**Adding new Slack API endpoints:** Follow the pattern in `src/infra/api/slack.ts` using FormData and proper error handling.

**Extending form validation:** Use Mantine's validate prop with Japanese error messages, see `App.tsx` for examples.

**Adding new UI components:** Create in `src/components/`, export via index.ts, follow Mantine design system patterns.

**Debugging auth issues:** Check browser console for API errors, verify tokens in LocalStorage, ensure Slack app configuration matches manifest.
