# Storyboard Prompt Builder

Create AI Video Storyboard Prompts in Seconds.

A fully local, client-side only React application that helps users build deterministic and AI-generated structured prompts for AI image and video generators (Midjourney, Sora, Runway, Kling, etc).

## Features
- **100% Local & Private:** No backend, no login. Uses LocalStorage and IndexedDB.
- **Static Template Builder:** Deterministic prompt generator that works offline.
- **AI Generation (Optional):** Plug in your own Gemini API key for intelligent scene creation.
- **Horizontal Scene Tabs:** Easy navigation through complex storyboards.
- **Character Library:** Reusable local character configurations for visual consistency.
- **Rich Exports:** Download your storyboards as JSON, TXT, or Markdown.

## Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Zustand (Local persistence)
- React Router

## Development

```bash
# Install dependencies using Bun
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Vercel Deployment

This app is a static site and easily deploys to the Vercel free tier.

1. Push your code to a GitHub repository.
2. Go to your Vercel Dashboard and click **Add New > Project**.
3. Import your repository.
4. Vercel will automatically detect the **Vite** framework.
5. Click **Deploy**.

No environment variables or backend configurations are required.

## License
MIT