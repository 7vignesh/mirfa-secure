# Mirfa — Secure Transaction Service 

A TurboRepo monorepo implementing a secure transaction service with Envelope Encryption (AES-256-GCM).

## 🧩 Project Structure

- **apps/web**: Next.js frontend for encrypting and decrypting payloads.
- **apps/api**: Fastify backend API that handles storage and encryption operations.
- **packages/crypto**: Shared TypeScript library containing the core AES-256-GCM envelope encryption logic and validation rules.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

```bash
pnpm install
```

### Running Locally

Start both the Web and API applications in development mode:

```bash
pnpm dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)

### Running Tests

Run the cryptographic unit tests in `packages/crypto`:

```bash
pnpm test
```

## 🔐 Security Architecture

This project uses **Envelope Encryption**:

1.  **Data Encryption Key (DEK)**: A random 32-byte key is generated for every transaction.
2.  **Payload Encryption**: The JSON payload is encrypted with the DEK using `AES-256-GCM` (authenticated encryption).
3.  **Key Wrapping**: The DEK itself is encrypted ("wrapped") using a **Master Key (KEK)**.
4.  **Storage**: The encrypted payload and the wrapped DEK are stored. The raw DEK is never stored.

## 🛠 Tech Stack

- **Monorepo**: TurboRepo
- **Package Manager**: pnpm
- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Fastify
- **Deployment**: Vercel (Serverless Functions)
