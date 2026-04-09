# Ottie — The Agent-Native IM

[简体中文](./README.zh-CN.md)

> "Ottie, ask them if they're free for dinner on Friday."

Ottie is not just an instant messenger.  
It is the beginning of a new communication interface.

A world is emerging where people no longer communicate alone. They communicate with and through AI. Messages are no longer just typed. They are interpreted, shaped, delegated, approved, and acted on.

Ottie is being built for that world.

## The Idea

In Ottie, you do not directly send final-form messages to other people.

You speak to your own AI secretary.  
Your agent understands what you mean, rewrites it properly, requests approval when needed, and sends the final message on your behalf.

On the other side, another human may also be speaking through their own agent.

That means Ottie is designed for all three directions of the future:

- human to human, mediated by AI
- human to AI
- AI to AI

This is why Ottie is not "chat with AI features."  
It is a new default model for communication.

## Why Ottie

The old messaging model assumes one person types one message to another person.

That model is already breaking.

The next generation of communication will need:

- intent before wording
- delegation before sending
- intelligent filtering before overload
- approval before action
- persistent memory across devices
- communication not only between people, but between people, agents, software, and tools

Ottie is being built as that new layer.

## Current Stage

Ottie is currently in a working MVP stage.

Already working today:

- Matrix login and registration
- 1:1 desktop messaging
- sending-side rewrite + approval flow
- receiving-side intent detection + suggested replies
- image / file upload
- message search
- desktop contacts, friend requests, profile editing, and blocklist
- local development against a self-hosted Tuwunel server

Still in progress:

- mobile product completion
- screen-aware device workflows
- richer A2UI integration into real product flows
- broader deployment, OIDC, E2EE, and ecosystem support

For the detailed build log and validation history, see [STATUS.md](./STATUS.md).

## What Ottie Is Becoming

Ottie is being built toward a full agent-native communication stack:

- every user has a persistent personal agent
- desktop becomes an intelligent communication surface
- devices can become context-aware device agents
- memory becomes part of communication
- self-hosted servers interoperate through Matrix federation
- third-party agents connect through A2A / A2UI / MCP
- communication expands from messaging into coordination

The long-term vision is simple:

Ottie becomes the default entrance to communication in a world where humans and AI increasingly speak through each other.

For the deeper systems and product view, see [docs/architecture.md](./docs/architecture.md).

## Repository Structure

Ottie is part of a three-repository GitHub organization:

- `ottie`: the main product repo with desktop, mobile, shared packages, and docs
- `ottie-agent`: the default agent adapter, skills, memory, and screen-awareness modules
- `server`: the Matrix / Tuwunel deployment package

Important: this repository is not currently a fully standalone one-repo setup.

Today, the desktop app consumes the local agent adapter from the sibling `ottie-agent` repository during development. That means the recommended setup is a shared workspace with all three repositories placed side by side.

## Recommended Local Workspace

```bash
workspace/
├── ottie/
├── ottie-agent/
└── server/
```

## Requirements

- Node.js 22+
- npm
- Docker

## Local Development

Clone all three repositories side by side:

```bash
git clone https://github.com/ottie-im/server
git clone https://github.com/ottie-im/ottie-agent
git clone https://github.com/ottie-im/ottie
```

Start the local Matrix server first:

```bash
cd server
./setup.sh localhost local
```

Install the agent repository:

```bash
cd ../ottie-agent
npm install
```

Install the main repository:

```bash
cd ../ottie
npm install
```

Run the desktop app:

```bash
cd apps/desktop
npm run dev
```

If you want to run the Tauri shell instead of the web development shell:

```bash
npm run tauri:dev
```

## Main Modules

- `packages/contracts`: shared type definitions
- `packages/matrix`: Matrix communication layer
- `packages/ui`: shared UI components
- `packages/a2ui`: A2UI renderer foundation
- `apps/desktop`: desktop application
- `apps/mobile`: mobile application in progress

## Documentation

- Architecture: [docs/architecture.md](./docs/architecture.md)
- Development plan: [docs/development-plan.md](./docs/development-plan.md)
- Current status: [STATUS.md](./STATUS.md)
- AI development guide: [CLAUDE.md](./CLAUDE.md)

## Contributing

Human contributors should start with the docs above.

If you are an AI coding agent working in this repository, read [CLAUDE.md](./CLAUDE.md) before making changes.

## License

MIT
