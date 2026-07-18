# Release Checklist

## Environment

- `npm install` completed successfully.
- `npm run dev` starts the Vite development server successfully.
- `npm run build` completes successfully.

## Security Audit

Confirmed:

- No real API keys were found in the repository.
- `.env` is ignored.
- `node_modules` is ignored.
- `dist` is ignored.
- `.tmp-tests` is ignored.

## First Launch Experience

Confirmed:

- Empty `localStorage` startup is supported by the current app architecture.
- Personal Vocabulary starts empty for a new user.
- Settings start with default values.
- No console errors were observed during the verified first-launch flow.

## AI Configuration

Supported providers:

- OpenAI
- Gemini
- DeepSeek
- Custom OpenAI Compatible

Confirmed behavior:

- When no API key is configured, AI Reading continues in fallback mode.

## Data Management

Confirmed features:

- Export Data
- Import Data
- Clear Local Data

Confirmed export exclusions:

- `aiApiKey`
- `dictionaryApiKey`

## Testing Results

Verified commands:

- `node --test`
- `npx tsc --noEmit`
- `npm run build`

Status:

- Passing at the current documented release-check stage.

## Known Issues

- `vocabulary-core` chunk size warning appears during production build.

Status:

- Non-blocking for open source release.
