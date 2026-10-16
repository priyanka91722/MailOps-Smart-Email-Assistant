---
name: Spring AI Google GenAI property versions
description: Version-specific configuration for the Spring AI Google GenAI model.
---

For Spring AI 1.1.x, configure Google GenAI chat settings beneath `spring.ai.google.genai.chat.options.*`, including `options.model`, `options.temperature`, and `options.max-output-tokens`. Newer Spring AI documentation may show a different property layout.

**Why:** A newer reference page appeared applicable but its model key was silently ignored by Spring AI 1.1.8, leaving the retired default model in use. Version-specific documentation and the autoconfigure jar metadata exposed the correct prefix.

**How to apply:** Check the documentation or configuration metadata for the project's pinned Spring AI version, then verify a real generation request. A passing health endpoint alone does not prove model configuration is active.
