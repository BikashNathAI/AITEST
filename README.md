# AITest — AI-Native Automation Framework

![CI](https://github.com/YOUR_USERNAME/AITest/actions/workflows/run-tests.yml/badge.svg)

> Enterprise-grade hybrid automation framework built with Playwright + TypeScript + BDD + AI self-healing

## Stack
- **UI Testing** — Playwright + Page Object Model
- **BDD** — Cucumber + Gherkin feature files
- **API Testing** — REST client with chain pattern
- **AI Layer** — Groq/Llama3 self-healing + NLP test generator
- **CI/CD** — GitHub Actions

## Run locally
\`\`\`bash
npm install
npx playwright install chromium
npm test
\`\`\`

## Run BDD
\`\`\`bash
npm run test:bdd
\`\`\`

## Generate test from plain English
\`\`\`bash
npx tsx src/nlp/nlpToTest.ts "your instruction here"
\`\`\`