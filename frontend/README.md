This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Chainhook Configuration

Set the following environment variables before registering hooks:

```bash
CHAINHOOK_URL=https://your-chainhook-host
CHAINHOOK_API_KEY=your-api-key-if-needed
AMM_CONTRACT_ID=STX_ADDRESS.amm
CHAINHOOK_CALLBACK_URL=https://your-app-host/api/chainhook/webhook
CHAINHOOK_NETWORK=testnet
```

Notes:
- `CHAINHOOK_URL` defaults to the SDK's built-in base URL for `CHAINHOOK_NETWORK` if omitted.
- `CHAINHOOK_API_KEY` is optional.
- Local endpoints:
  - `POST /api/chainhook/register` to register the hook.
  - `POST /api/chainhook/webhook` is the Chainhook callback target.
  - `GET /api/chainhook/status` checks API status via SDK.
  - `GET /api/chainhook/list` lists existing hooks.
  - `GET /api/chainhook/events?limit=10` reads stored payloads.
  - `POST /api/chainhook/clear` clears stored payloads.

You can view a basic Chainhook dashboard at `/chainhook` in the app.
- `CHAINHOOK_CALLBACK_URL` should be reachable by the Chainhook service.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
