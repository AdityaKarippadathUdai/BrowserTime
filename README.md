# BrowserTime

BrowserTime is a privacy-friendly browser extension for tracking how much time you spend on websites, analyzing browsing habits, and improving daily productivity. It records website usage locally in the browser, shows visual analytics in a dashboard, and helps you understand where your time goes across productive, neutral, and distracting domains.

This project is designed as a Chrome and Firefox-compatible extension with a React-based dashboard, background tracking logic, and offline storage. It can be built locally, loaded as an unpacked extension, and packaged for distribution.

## Project Overview

BrowserTime collects browsing activity from the browser and presents it through:

- a dashboard with daily and weekly summaries
- productivity scoring based on website categories
- reports for 7-day trends and time distribution
- search and history views for browsing sessions
- configurable productivity and distraction rules
- JSON backup and restore support

The extension runs entirely in the browser and stores usage data locally using the browser storage API.

## Features

### Website Tracking
- Tracks active browser tab usage automatically
- Records domain-level time spent over time
- Separates browsing data by date and session
- Supports tracking across Chrome and Firefox

### Productivity Analytics
- Calculates a productivity score based on website classification
- Highlights productive vs distracting website usage
- Shows category breakdowns such as development, learning, social, entertainment, and more

### Dashboard and Reports
- Daily summary cards for time, weekly usage, most-used site, and longest session
- Charts for category distribution and 7-day browsing trends
- Report views for weekly analytics and browsing ratios

### History and Search
- Browse websites by time period
- Search by domain or site title
- Filter by category and timeframe

### Settings and Data Management
- Customize productive and distracting domains
- Toggle notifications and thresholds
- Export and import backup data as JSON
- Reset local statistics when needed

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- lucide-react
- Chrome/Firefox extension APIs

## Requirements

Before building the project, make sure you have:

- Node.js 18+ (recommended: Node.js 20 LTS or newer)
- npm 9+
- A modern browser such as Chrome, Edge, or Firefox

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/AdityaKarippadathUdai/BrowserTime.git
cd BrowserTime
npm install
```

If you are using a different branch or local checkout, run the same commands from the project root.

## Development Workflow

### Start the local development environment

```bash
npm run dev
```

This starts the Vite development server for the dashboard and UI preview. The extension itself is still loaded from the built output for browser testing.

## Build Instructions

### Build both Chrome and Firefox versions

```bash
npm run build
```

This command runs both of the following:

```bash
npm run build:chrome
npm run build:firefox
```

The build output will be created in:

- Chrome output: `chrome-dist/`
- Firefox output: `firefox-dist/`

### Build only Chrome

```bash
npm run build:chrome
```

### Build only Firefox

```bash
npm run build:firefox
```

## Packaging for Distribution

### Create zip archives for Chrome and Firefox

```bash
npm run zip
```

This creates:

- `chrome-extension.zip`
- `firefox-extension.zip`

### Create a Firefox XPI package

Firefox uses the `.xpi` format for packaged add-ons. After building the Firefox version, you can create an XPI file with:

```bash
cd firefox-dist
zip -r ../website-time-tracker.xpi .
```

You can also use the existing project artifact if it is already present at the repository root as `website-time-tracker.xpi`.

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-dist` folder from the repository root
5. The extension should appear in your browser toolbar

### Notes for Chrome
- The Chrome build uses Manifest V3
- The extension requires permissions such as `tabs`, `storage`, `alarms`, `idle`, and `notifications`
- Make sure the extension is allowed to access the sites you want to track

## Loading the Extension in Firefox

There are two common ways to test it in Firefox:

### Option 1: Load unpacked temporarily

1. Open Firefox
2. Navigate to `about:addons`
3. Open the gear menu and choose "Debug Add-ons"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` inside `firefox-dist`

### Option 2: Install the packaged XPI

1. Build the Firefox package as described above
2. Open `about:addons`
3. Use the add-on install flow or drag the `.xpi` file into the browser window
4. Confirm the installation prompt

## Project Structure

```text
src/
  App.tsx
  background/
  components/
  constants/
  content/
  contexts/
  pages/
  popup/
  styles/
  types/
  utils/

manifests/
  manifest.chrome.json
  manifest.firefox.json

public/
  icons/

scripts/
  build-chrome.ts
  build-firefox.ts
  generate-icons.ts
  zip-build.ts
```

## Important Notes

- The extension stores data locally in the browser; it does not require a backend service
- The extension uses browser permissions to monitor active tab activity and collect usage statistics
- Browsing activity is grouped by domain and can be customized through the settings page
- The productivity score is heuristic-based and configurable through custom rules

## Troubleshooting

### Build fails
Make sure dependencies are installed:

```bash
npm install
```

If you are using a very recent Node version, try updating npm and clearing the previous install:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Extension does not appear after loading
- Confirm that the correct folder was selected
- Check that the `manifest.json` exists in the selected build folder
- Reload the extension from the browser extension page

### Firefox install fails
- Ensure the `.xpi` file contains the complete extension contents
- Rebuild the Firefox output before packaging
- Confirm that the manifest and icons are present in the packaged folder

## Contributing

Contributions are welcome. If you would like to improve the project, please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
