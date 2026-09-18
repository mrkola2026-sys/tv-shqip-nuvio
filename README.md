# TV Shqip Nuvio

A static live TV addon for Nuvio/Stremio that pulls Albanian channels from an upstream source, generates the required catalog/meta/stream files, and publishes them through GitHub Pages.

## Add it to Nuvio and watch live TV

1. Push this repository to GitHub.
2. Enable GitHub Pages in the repository settings.
3. Make sure the site is deployed from the GitHub Pages workflow.
4. Copy the deployed URL, for example:

```text
https://<your-github-user>.github.io/<your-repo-name>
```

5. Open Nuvio and add the addon using that URL.
6. Open the catalog and select a channel to start watching live TV.

Once the addon is loaded, Nuvio reads the generated manifest and catalog from the Pages site and shows the available channels.

## What this project does

This project creates a static addon package that Nuvio can consume as a live TV source. It:

- reads channel definitions from `channels.json`
- builds a Stremio/Nuvio-compatible manifest and catalog
- generates per-channel meta and stream JSON files
- creates poster SVG images for each channel
- syncs the channel list from an upstream public raw source
- deploys the generated content to GitHub Pages automatically

## Project structure

- `build.js` – generates the static addon output from `channels.json`
- `channels.json` – the source list of channels used by the addon
- `public/` – built static addon files served by GitHub Pages
- `scripts/sync-channels.js` – fetches upstream channel data and refreshes the list
- `scripts/add-channel.js` – helper to add a channel manually
- `.github/workflows/` – CI/CD workflows for sync and deployment

## How the sync works

The project includes a scheduled GitHub Actions workflow that runs daily:

- `sync-channels.yml` runs on a cron schedule
- it fetches live Albania channel data from:
  `https://raw.githubusercontent.com/famelack/famelack-data/refs/heads/main/tv/raw/countries/al.json`
- it normalizes each entry into the format required by the addon
- it writes the result to `channels.json`
- it rebuilds the static output in `public/`
- it commits the changes back to the repository

## How the GitHub Pages deployment works

The deployment workflow is in `.github/workflows/deploy.yml`.

It:

- runs on pushes to `main`
- can also be triggered manually
- runs `npm run build`
- uploads the generated `public/` folder as a Pages artifact
- deploys it to GitHub Pages

This means the addon is published as a static site and can be used by Nuvio or Stremio-compatible clients.

## Local development

Install dependencies:

```bash
npm install
```

Build the addon locally:

```bash
npm run build
```

Sync channel data from the upstream source:

```bash
npm run sync-channels
```

Add a channel manually:

```bash
npm run add-channel
```

## How to use it with Nuvio

1. Publish the repository to GitHub.
2. Enable GitHub Pages in the repository settings.
3. Make sure the Pages source is set to the GitHub Pages deployment from the workflow.
4. Use the Pages URL from the deployed site as the addon endpoint in Nuvio.
5. Nuvio will read the addon manifest and catalog from the generated static files.

Example format:

```text
https://<your-github-user>.github.io/<your-repo-name>
```

The addon manifest is generated under:

```text
/public/manifest.json
```

and the catalog is generated under:

```text
/public/catalog/tv/live_channels.json
```

## Notes

- The project is designed as a static addon; there is no backend server.
- Stream URLs are supplied from the upstream data source and are intended to be used by compatible clients.
- Poster images are generated as SVG files in `public/posters` during build.

## License

See the repository license file for more details.
