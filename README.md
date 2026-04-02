# BG Remover

> Upload an image, remove background, download transparent PNG in seconds. No signup required.

![Demo](https://via.placeholder.com/800x400?text=BG+Remover+Demo)

## Features

- 🚀 **Fast** - Remove background in 2-3 seconds
- 🎨 **Quality** - High-quality PNG output with transparency preserved
- 📱 **Responsive** - Works on desktop and mobile
- 🔒 **Private** - No images are stored or uploaded to any server except Remove.bg
- ⚡ **Simple** - Just drag, drop, and download

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **API**: Remove.bg API for background removal
- **Deployment**: Vercel / Cloudflare Pages / any Node.js host

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/wujuxiang/image-background-remover.git
cd image-background-remover
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and add your Remove.bg API key:

```bash
cp .env.example .env.local
```

Get your API key from [remove.bg/api](https://www.remove.bg/api).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REMOVE_BG_API_KEY` | Your Remove.bg API key. [Get one here](https://www.remove.bg/api) |

## Usage

1. Open the website
2. Drag & drop an image (or click to select)
3. Wait 2-3 seconds for processing
4. Download the transparent PNG

## Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wujuxiang/image-background-remover)

Set the `REMOVE_BG_API_KEY` environment variable in your Vercel project.

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Add environment variable: `REMOVE_BG_API_KEY`
3. Build command: `npm run build`
4. Output directory: `.next`

## License

MIT
