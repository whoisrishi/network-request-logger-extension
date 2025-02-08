# Network Request Logger

A **Chrome Extension** that captures, categorizes, and allows exporting of network requests made by a website. It also provides whitelist functionality to ignore specific domains and includes an auto-clear feature to manage stored logs efficiently.

## Features
✅ **Captures and logs network requests** (including payload & headers)
✅ **Categorizes requests by domain and route**
✅ **Auto-clear logs** (configurable interval)
✅ **Export requests** as a JSON file
✅ **Clear all logs** with a single button
✅ **Stylish, user-friendly UI**

##Currently Working on
 **Whitelist support** (ignore specified domains)

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/network-request-logger.git
   cd network-request-logger
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer Mode** (top right corner)
4. Click **Load unpacked** and select the cloned folder
5. The extension is now installed!

## Usage
1. Click the extension icon to open the popup.
2. View, categorize, and expand network requests.
3. Use the **Export Requests** button to download request logs.
4. Add domains to the **whitelist** (via `options`) to ignore them. (not working)
5. Set **auto-clear** to delete logs automatically after a set time.
6. Click **Clear All Requests** to remove all stored logs.

## Configuration
- Open `chrome://extensions/` → Click **Details** under the extension → **Extension Options**
- Here, you can:
  - Add domains to the whitelist
  - Set the maximum number of stored requests
  - Configure the auto-clear interval

## Contributing
1. Fork the repository
2. Create a new branch:
   ```sh
   git checkout -b feature-branch
   ```
3. Commit your changes:
   ```sh
   git commit -m "Add new feature"
   ```
4. Push to your fork:
   ```sh
   git push origin feature-branch
   ```
5. Open a **Pull Request**

🚀 Happy Logging!

