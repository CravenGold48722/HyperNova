# Interstellar

## Overview
Interstellar is a web proxy application that allows browsing the web through a proxy server. It serves static content and uses a Bare server for proxy functionality.

## Project Structure
- `index.js` - Main Express server entry point
- `config.js` - Configuration file for password protection and user credentials
- `static/` - Static frontend files (HTML, CSS, JavaScript, images)
  - `index.html` - Homepage
  - `games.html` - Games section
  - `apps.html` - Apps section
  - `settings.html` - Settings page
  - `tabs.html` - Tabs management
  - `404.html` - Error page
  - `assets/` - CSS, JS, and media assets
    - `mathematics/` - Proxy engine files (Scramjet worker and assets)

## Technology Stack
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Proxy**: Scramjet (Primary)
- **Package Manager**: pnpm

## Branding & Preferences
- **Name**: HyperNova
- **Creator**: CravenGold48722
- **Themes**: Dark cosmic gradient with blue highlights
- **Cloaking**: Locked to "Clever | Portal" with custom icon
- **Redirection**: Panic key (Ctrl + E) and auto-cloak both point to Google Classroom

## Configuration
- Server runs on port 5000 (configurable via `PORT` environment variable)
- Password protection can be enabled in `config.js` by setting `challenge: true`
- Default credentials when enabled: interstellar/password

## Running the Application
```bash
npm start
```

## Deployment
Configured for autoscale deployment on Replit.
