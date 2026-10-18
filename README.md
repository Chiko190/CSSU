## Quick start (Windows)

1. Double-click **`RUN.bat`**. There's also one in the top project folder.
2. The browser opens http://localhost:3000. Click **Continue as Demo Learner**.

That's it. `RUN.bat` takes care of everything automatically:
- installs Node.js if it's missing (if it does, run `RUN.bat` again afterwards)
- creates `.env.local` in demo mode with its own session secret
- installs packages, but only the first time or when `package-lock.json` changes
- builds the app, but only the first time or after code changes
- starts the app and opens the browser, using the next free port if 3000 is busy

The first run takes a few minutes. After that it starts in a couple of seconds and pages load instantly.

Use **`DEV.bat`** instead if you're editing code: it reloads the page as you save, but each page is slow the first time it loads.

Keep the black window open while you use the app. Close it to stop the app.

## Running it from VS Code

1. Install Node.js LTS from https://nodejs.org (skip if you already have it), then open VS Code.
2. **File → Open Folder…** and choose this `nc2` folder.
3. Press **Ctrl+Shift+B**. The app gets set up and started in the terminal panel, then the browser opens.
   - Other ways to do the same: press **F5**, or run `npm run local` in the terminal.
   - To have the page auto-reload while you edit code, run **Terminal → Run Task… → Run app (dev mode, auto-reload)** or `npm run local:dev`.
4. To stop the app, click in the terminal and press **Ctrl+C**.

## Sending the project to someone

- `npm run ready-zip` creates `nc2-ready-to-run.zip` (about 280 MB) for Windows. It already includes Node.js, the packages and the built app, so the person installs nothing; they open the folder in VS Code and press Ctrl+Shift+B, or double-click `RUN.bat`. It's for running the app only (no dev mode).
- `npm run client-zip` creates a small `nc2-for-client.zip` (source only). The person needs Node.js, and the first run installs and builds everything.

Neither zip includes `.env.local` (your secrets). Re-run the command after changing code.

---

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
