# Viewer Chrome Extension

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup/index.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a file to the `contents` folder,

## Deploying

Run the following:

```bash
yarn deploy
```

This should create a production bundle for your extension, create a zip file out of it, open the Chrome Developer Dashboard.
