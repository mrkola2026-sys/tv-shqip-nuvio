const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const readline = require('readline');

const channelsPath = path.join(__dirname, '..', 'channels.json');
const promptInterface = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => promptInterface.question(question, resolve));
}

function createId(name, channels) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'channel';
  let id = base;
  let suffix = 2;
  while (channels.some((channel) => channel.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

async function main() {
  const channels = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
  if (!Array.isArray(channels)) {
    throw new Error('channels.json must contain an array');
  }

  const name = (await ask('Name: ')).trim();
  if (!name) {
    throw new Error('Name is required.');
  }

  const description = (await ask('Description (optional): ')).trim();
  const poster = (await ask('Poster URL: ')).trim();
  const streamUrl = (await ask('Stream URL: ')).trim();
  if (!poster || !streamUrl) {
    throw new Error('Poster URL and Stream URL are required.');
  }

  channels.push({
    id: createId(name, channels),
    name,
    ...(description ? { description } : {}),
    poster,
    streamUrl
  });
  fs.writeFileSync(channelsPath, `${JSON.stringify(channels, null, 2)}\n`);

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCommand, ['run', 'build'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    throw new Error('Channel saved, but the static build failed.');
  }
  console.log(`Added "${name}".`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => promptInterface.close());