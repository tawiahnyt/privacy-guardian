<!-- @format -->

# Privacy Guardian Browser Extension

Privacy Guardian is a browser extension that intercepts network requests and blocks or modifies requests to known trackers before they load. It's designed to protect your privacy while browsing the web without affecting page load speed.

## Features

- Blocks requests to known tracking domains
- Maintains statistics on blocked trackers
- Customizable blocking rules
- Minimal impact on browsing performance
- Simple, user-friendly interface

## Installation

### Chrome/Edge/Brave (Developer Mode)

1. Download or clone this repository
2. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the folder containing the extension files
5. The Privacy Guardian extension should now be installed and active

## Usage

- Click on the extension icon in your browser toolbar to open the popup interface
- Use the toggle switch in the header to enable/disable the extension
- View statistics about blocked trackers in the "Statistics" tab
- Configure settings in the "Settings" tab
- Add custom blocking rules in the "Custom Rules" tab

## How It Works

The extension uses the browser's webRequest API to intercept network requests before they are sent. It checks each request against a database of known tracking domains and blocks those that match. The extension is optimized for performance to ensure minimal impact on browsing speed.

## Privacy

- All blocking happens locally on your device
- No data is sent to external servers
- Your browsing data remains private

## License

MIT License
