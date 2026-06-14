# My Closet — AI Wardrobe Manager

My Closet is a personal wardrobe digitizer and outfit generator designed for single-user private use. It helps you digitize your clothes, manage your wardrobe, and generate outfit suggestions using both a fast, local matching engine and an advanced Google Gemini AI assistant.

This application is built with a desktop-first design mindset and a premium, clean aesthetic that prioritizes visual balance and typography.

## Core Principles

- Single User: Dedicated to one owner account with private access. No social feeds, likes, sharing, or multi-tenancy.
- Privacy First: Data and images are locked strictly to the owner's Firebase account.
- Manual Tagging: Attributes and labels are entered manually by the owner, ensuring high-quality structured data without unreliable automated vision analysis.
- Clean Aesthetic: Focused on typography, spacing, and micro-interactions. The interface remains quiet and premium to respect and highlight the wardrobe's own imagery.

## Tech Stack

- Framework: Next.js 14 (App Router) + TypeScript
- Styling: Tailwind CSS
- State Management: Zustand
- Database and Auth: Firebase (Auth and Firestore)
- Image Management: Cloudinary (client-side compression and uploads)
- AI Suggestions: Google Gemini API (proxied via a Next.js Route Handler)

## Getting Started

### Prerequisites

You need a Firebase project, a Cloudinary account with an unsigned upload preset, and a Google Gemini API key.

### Configuration

Create a `.env.local` file in the root directory and configure the following environment variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Auth Restriction (supports comma-separated emails)
NEXT_PUBLIC_ALLOW_EMAIL=your_email@gmail.com,another_email@gmail.com

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

# Gemini API Key (Server-side only)
GEMINI_API_KEY=your_gemini_api_key
```

### Installation

Install the project dependencies using Yarn:

```bash
yarn install
```

### Running the Development Server

To start the local development server:

```bash
npm run dev
# or
npx next dev
```

Open http://localhost:3000 in your browser to view the application.

## Key Features

### Wardrobe Digitization
- Add, edit, and delete wardrobe items with ease.
- High-quality client-side image compression and resizing using the Canvas API before uploading to Cloudinary.
- Manage properties including clothing type (outerwear, top, bottom, shoes, accessory), colors, style tags, occasions, and formality levels (scale 1 to 5).

### Closet View
- Browse all digitized clothing items organized and grouped by clothing type.
- Clean filters to view items by occasion, style tags, and formality.

### Outfit Builder
- Slot-based layout supporting combinations of outerwear, tops, bottoms, shoes, and accessories.
- Local Matching Engine: Generates outfits instantly in your browser based on color harmony, style coherence, and formality alignment.
- Ask AI: Passes structured tag data of your wardrobe along with optional natural language requests (e.g., "formal dinner on a rainy day") to Gemini to receive tailored outfit suggestions.

## Production Build

To compile a production build of the Next.js application:

```bash
npx next build
```
