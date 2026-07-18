# Ivy's Challenge User Guide

## What This App Is

Ivy's Challenge is a personal English learning space for vocabulary growth, memory review, and reading-based word discovery.

It is designed for learners who want:

- a private browser-based study space
- structured vocabulary review
- a personal word bank
- optional AI-assisted reading

## How To Open The App

You can use Ivy's Challenge in two ways:

- Local development:
  - install dependencies
  - run `npm run dev`
- GitHub Pages:
  - open the published website in your browser

## Main Areas

### Vocabulary Library

Use this section to study the main vocabulary collection by chapter.

You can open:

- Word Card Mode
- Word List Mode

### Word Card Mode

Use Word Card Mode when you want focused review one word at a time.

You can:

- reveal meanings
- listen to pronunciation
- mark words as known, unsure, or unknown

### Word List Mode

Use Word List Mode when you want to review many words in a table layout.

You can:

- check pronunciation
- practice spelling
- update memory marks
- select words for AI Reading

### Personal Vocabulary Bank

This is your private word collection.

Words can be added from:

- AI Reading
- manual learning flow inside the app

This section is useful for:

- collecting unfamiliar words
- reviewing custom vocabulary
- keeping personal learning records separate from the main library

### Vocabulary Garden

Vocabulary Garden is a visual progress area that reflects your learning activity.

It helps you see long-term growth in a more relaxed format.

### AI Reading

AI Reading generates reading material from selected vocabulary.

It supports:

- user-selected words from Word List
- fallback mode when no API key is configured
- optional AI provider usage when you add your own API key

You can also double-click a word in the reading article to add it to your Personal Vocabulary Bank.

### Settings

Settings is the browser-local control center for:

- AI provider selection
- Dictionary provider selection
- learning level
- daily goal
- data export and import

## First-Time Setup

If you do not configure any API keys:

- the main learning features still work
- Dictionary can stay on Free Dictionary
- AI Reading will use fallback mode

This means new users can start learning without any paid service.

## AI And Dictionary Setup

### AI Providers

Supported options:

- None
- OpenAI
- Gemini
- DeepSeek
- Custom OpenAI-compatible provider

If you want AI-generated reading with your own provider:

1. Open Settings
2. Choose the provider
3. Enter your API key
4. Enter model and endpoint if needed

### Dictionary Providers

Supported options:

- Free Dictionary
- Custom

If you do not need a custom dictionary service, keep the default Free Dictionary option.

## Privacy And Storage

Your data is stored locally in your browser.

This includes:

- learning progress
- personal vocabulary
- settings
- memory state

Ivy's Challenge does not provide a project server for storing your study data.

API keys are stored only in your browser settings for your local profile.

## Backup And Restore

In Settings, use the Data Management section to:

- Export My Data
- Import Data
- Clear Local Data

Exported backup files do not include:

- `aiApiKey`
- `dictionaryApiKey`

## Recommended Learning Flow

For a simple start:

1. Open Vocabulary Library
2. Review words in Word Card or Word List Mode
3. Use AI Reading for contextual reading practice
4. Add unfamiliar words to Personal Vocabulary
5. Revisit saved words later
6. Export your data occasionally as a backup

## Troubleshooting

### AI Reading does not use an external provider

Check:

- whether an AI provider is selected in Settings
- whether an API key is saved
- whether the endpoint and model are correct

If no valid AI configuration is present, the app should continue in fallback mode.

### Personal Vocabulary or progress looks missing

Check:

- whether you are using the same browser profile
- whether browser local storage was cleared
- whether you imported a backup file after clearing data

### The published site looks broken

Try:

- refreshing the page
- opening the GitHub Pages URL again
- clearing cached site assets in the browser

## Documentation

Technical documentation:

- [Architecture Guide](ARCHITECTURE.md)
- [Release Checklist](RELEASE_CHECKLIST.md)
