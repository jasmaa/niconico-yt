# Release

## Make a release on GitHub

Bump the version number in `package.json`.

Add changelog entry in `CHANGELOG`.

Add a feat commit to bump the version and push to `main`.

Create a release on the [GitHub release page](https://github.com/jasmaa/niconico-yt/releases). Add version number and details from changelog.

## Publish extension for Firefox and Chrome

Generate `dist` if not already:

```
yarn build
```

Create a dedicated folder for releases if not already:

```
mkdir "../niconico-yt-releases"
```

Generate a new release:

```
yarn generate-release --release-dir "../niconico-yt-releases"
```

Go to the [Firefox Add-On Developer Hub](https://addons.mozilla.org/en-US/developers) and upload new bundles.

Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and upload new bundles.
