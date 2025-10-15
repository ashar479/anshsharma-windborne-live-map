# WindBorne Live Map

Interactive live map combining WindBorne balloon telemetry (last 24h) with Open-Meteo current weather.
Resume: https://drive.google.com/file/d/19Wfk8fWFBkBU16lNx9Ip0A2VCyenkwKs/view?usp=sharing

## Summary
This project queries WindBorne's live constellation API (latest 24 hours from `https://a.windbornesystems.com/treasure/00.json`) and displays balloon positions on a Leaflet map. Clicking a balloon shows current weather from Open-Meteo for that location. The page updates automatically (polling).

Built with React, Leaflet, and a small Vercel serverless proxy to avoid CORS when fetching the live feed.

## Features
- Normalizes mixed/undocumented payloads from the WindBorne feed.
- Shows only latest 24-hour data (timestamp-aware).
- De-duplicates obvious duplicate points.
- Per-balloon popup with current weather (Open-Meteo) on click.
- Polls every 5 minutes to keep the view fresh.

## Tech stack
- Frontend: React (Create React App / Vite compatible), Leaflet
- Deployment: Vercel (recommended)
- Serverless proxy: Vercel API route `/api/treasure/[file]` to forward requests to `https://a.windbornesystems.com/treasure/*`

## Quick start (local)
1. Install
```bash
npm install
