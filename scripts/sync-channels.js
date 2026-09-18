const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const sourceUrl = 'https://raw.githubusercontent.com/famelack/famelack-data/refs/heads/main/tv/raw/countries/al.json';
const rootDirectory = path.join(__dirname, '..');
const channelsPath = path.join(rootDirectory, 'channels.json');
const posterBaseUrl = (process.env.POSTER_BASE_URL || '').replace(/\/$/, '');

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sourceFor(channel) {
  return (channel.sources?.streams || channel.sources?.youtube || [])[0];
}

function normalizeChannel(channel) {
  const streamUrl = sourceFor(channel);
  if (!channel.name || !streamUrl) {
    return null;
  }

  const id = slugify(channel.name);
  return {
    id,
    name: channel.name,
    description: 'Live Albanian TV channel.',
    poster: posterBaseUrl ? `${posterBaseUrl}/posters/${id}.svg` : `https://placehold.co/600x900/111827/ffffff?text=${encodeURIComponent(channel.name)}`,
    streamUrl
  };
}

async function main() {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Upstream request failed: ${response.status} ${response.statusText}`);
  }

  const sourceChannels = await response.json();
  const channels = sourceChannels.map(normalizeChannel).filter(Boolean);
  const ids = new Set();
  for (const channel of channels) {
    if (ids.has(channel.id)) {
      throw new Error(`Duplicate generated channel ID: ${channel.id}`);
    }
    ids.add(channel.id);
  }

  fs.writeFileSync(channelsPath, `${JSON.stringify(channels, null, 2)}\n`);
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCommand, ['run', 'build'], {
    cwd: rootDirectory,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    throw new Error('The channel data was saved, but the static build failed.');
  }

  console.log(`Synced ${channels.length} channel${channels.length === 1 ? '' : 's'} from famelack-data.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});