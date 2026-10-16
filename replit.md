# MailOps — Smart Email Assistant

MailOps turns a pasted email into a context-aware, editable reply using Spring Boot, Spring AI, and Google Gemini.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the Java Spring Boot API on `/api`
- `pnpm --filter @workspace/mailops run dev` — run the React + Vite interface
- `mvn -f backend/mailops/pom.xml test` — run backend tests (mocked AI; no external calls)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck and build workspace packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required secret: `GEMINI_API_KEY`

## Stack

- React, TypeScript, and Vite frontend in `artifacts/mailops`
- Java 17+ and Spring Boot 3.5 backend in `backend/mailops`
- Spring AI 1.1 with the Google GenAI chat starter
- OpenAPI contract and generated React Query hooks in `lib/api-spec` and `lib/api-client-react`

## Where things live

- `artifacts/mailops/src/pages/home.tsx` — email reply workspace
- `backend/mailops/src/main/java/com/mailops` — API, validation, prompt, and Gemini integration
- `backend/mailops/src/test/java/com/mailops` — controller and service tests
- `backend/mailops/src/main/resources/application.yml` — server and Spring AI configuration
- `lib/api-spec/openapi.yaml` — source API contract

## Architecture decisions

- Email content is pasted manually; Gmail access and sending are intentionally out of scope.
- The Java service owns the `/api` endpoints and calls Gemini through Spring AI.
- API keys are provided through Replit Secrets or environment variables, never source files.

## Product

Users paste an email, select tone and length, optionally give instructions, generate a reply, edit it, and copy it. The backend does not store email content.

## User preferences

- Keep the implementation straightforward to demonstrate and explain in a placement interview.

## Gotchas

- The API uses the `/api` context path so it can be routed beside the React artifact.
- Run OpenAPI codegen after editing `lib/api-spec/openapi.yaml`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
