const fs = require('fs');
const path = require('path');

const rootDirectory = __dirname;
const channelsPath = path.join(rootDirectory, 'channels.json');
const publicDirectory = path.join(rootDirectory, 'public');

function readChannels() {
  let channels;

  try {
    channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read channels.json: ${error.message}`);
  }

  if (!Array.isArray(channels)) {
    throw new Error('channels.json must contain an array');
  }

  const ids = new Set();
  for (const [index, channel] of channels.entries()) {
    if (!channel || typeof channel !== 'object') {
      throw new Error(`Channel at index ${index} must be an object`);
    }

    for (const field of ['id', 'name', 'poster', 'streamUrl']) {
      if (typeof channel[field] !== 'string' || !channel[field].trim()) {
        throw new Error(`Channel at index ${index} must include a non-empty ${field}`);
      }
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(channel.id)) {
      throw new Error(`Channel ID "${channel.id}" may only contain letters, numbers, _ and -`);
    }

    if (ids.has(channel.id)) {
      throw new Error(`Duplicate channel ID: ${channel.id}`);
    }
    ids.add(channel.id);
  }

  return channels;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  }[character]));
}

function writePoster(channel) {
  const poster = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900" role="img" aria-label="${escapeXml(channel.name)}"><rect width="600" height="900" fill="#111827"/><rect x="32" y="32" width="536" height="836" rx="24" fill="#1f2937" stroke="#38bdf8" stroke-width="4"/><text x="300" y="430" fill="#f8fafc" font-family="Arial, sans-serif" font-size="42" font-weight="700" text-anchor="middle">${escapeXml(channel.name)}</text><text x="300" y="490" fill="#7dd3fc" font-family="Arial, sans-serif" font-size="22" text-anchor="middle">LIVE TV</text></svg>\n`;
  fs.mkdirSync(path.join(publicDirectory, 'posters'), { recursive: true });
  fs.writeFileSync(path.join(publicDirectory, 'posters', `${channel.id}.svg`), poster);
}

function toMeta(channel) {
  return {
    id: channel.id,
    type: 'tv',
    name: channel.name,
    poster: channel.poster,
    ...(channel.description ? { description: channel.description } : {})
  };
}

function build() {
  const channels = readChannels();
  fs.rmSync(publicDirectory, { recursive: true, force: true });
  fs.mkdirSync(publicDirectory, { recursive: true });

  const rootIndexPath = path.join(rootDirectory, 'index.html');
  if (fs.existsSync(rootIndexPath)) {
    fs.copyFileSync(rootIndexPath, path.join(publicDirectory, 'index.html'));
  }

  writeJson(path.join(publicDirectory, 'manifest.json'), {
    id: 'org.nuvio.static-live-tv',
    version: '1.0.0',
    name: 'Nuvio Live TV',
    description: 'Live TV channels for Nuvio and Stremio.',
    types: ['tv'],
    catalogs: [{ type: 'tv', id: 'live_channels', name: 'Live Channels' }],
    resources: ['catalog', 'meta', 'stream']
  });

  writeJson(path.join(publicDirectory, 'catalog/tv/live_channels.json'), {
    metas: channels.map(toMeta)
  });

  for (const channel of channels) {
    writePoster(channel);
    writeJson(path.join(publicDirectory, `meta/tv/${channel.id}.json`), {
      meta: toMeta(channel)
    });
    writeJson(path.join(publicDirectory, `stream/tv/${channel.id}.json`), {
      streams: [{ title: 'Live Stream', url: channel.streamUrl }]
    });
  }

  console.log(`Built ${channels.length} channel${channels.length === 1 ? '' : 's'} into public/.`);
}

try {
  build();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}