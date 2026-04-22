---
title: AI Agents Architecture
description: Overview of the AI models and systems powering the workspace.
system: Ralph Wiggum / Gemini
---

# AI Agents Architecture

This repository is actively maintained and evolved through a coalition of AI agents.

## Primary Operators

- **Gemini CLI (Subagent)**: Handles deep-dive refactoring, long-context comprehension, and rigorous visual verification via automated browser testing. Follows strict rules for dependency deduplication and UI/UX layout fixing.
- **Claude / Sonnet (Orchestrator)**: The primary workflow director driving structural decisions, establishing the monorepo architecture, and guiding the Gemini CLI subagent.

## Core Rules

1. **No Shortcuts**: All code changes require comprehensive empirical reproduction and validation.
2. **Visual Verification**: All games must be proven to render using Vitest browser screenshots.
3. **No Primitives**: 2D ports require actual effort to map into 3D using composite shapes, not simple capsules.
