# TV Shqip Nuvio

Një addon statik i TV-live për Nuvio/Stremio që merr kanale shqiptare nga një burim i jashtëm, gjeneron skedarët e nevojshëm të katalogut, meta dhe stream-it dhe i publikon përmes GitHub Pages.

## Shtoje në Nuvio dhe shiko TV live

1. Shto këtë depo në GitHub.
2. Aktivizo GitHub Pages në parametrat e depove.
3. Sigurohu që faqja të jetë publikuar nga workflow-i i GitHub Pages.
4. Përdor URL-në e publikuar të projektit:

```text
https://mrkola2026-sys.github.io/tv-shqip-nuvio/manifest.json
```

5. Hap Nuvio dhe shto addon-in duke përdorur këtë URL.
6. Hap katalogun dhe zgjidh një kanal për të parë TV live.

Pasi addon-i të ngarkohet, Nuvio lexon manifestin dhe katalogun nga sajti i Pages dhe tregon kanalet e disponueshme.

## Çfarë bën ky projekt

Ky projekt krijon një paketë statike addon-i që Nuvio mund ta përdorë si burim TV live. Ai:

- lexon definicionet e kanalëve nga `channels.json`
- krijon një manifest dhe katalog të kompatueshëm me Stremio/Nuvio
- gjeneron skedarë JSON për meta dhe stream të çdo kanali
- krijon imazhe poster në format SVG për çdo kanal
- sinkronizon listën e kanalëve nga një burim publik i jashtëm
- publikon përmbajtjen e gjeneruar në GitHub Pages

## Struktura e projektit

- `build.js` – gjeneron output-in statik të addon-it nga `channels.json`
- `channels.json` – lista e burimit të kanalëve të përdorura nga addon-i
- `public/` – skedarët e gjeneruar statikë të addon-it të shërbyer nga GitHub Pages
- `scripts/sync-channels.js` – merr të dhëna nga burimi i jashtëm dhe rifreskon listën
- `scripts/add-channel.js` – ndihmës për shtimin manual të një kanali
- `.github/workflows/` – workflow-et e CI/CD për sinkronizim dhe deployim

## Si funksionon sinkronizimi

Projekti përfshin një workflow të planifikuar në GitHub Actions që ekzekutohet çdo ditë:

- `sync-channels.yml` ekzekutohet sipas një cron schedule
- merr të dhëna live të kanalëve shqiptarë nga:
  `https://raw.githubusercontent.com/famelack/famelack-data/refs/heads/main/tv/raw/countries/al.json`
- normalizon çdo element në formatin e kërkuar nga addon-i
- e shkruan rezultatin tek `channels.json`
- ndërton përsëri output-in statik në `public/`
- e komiton ndryshimin prapa në depo

## Si funksionon deployimi në GitHub Pages

Workflow-i i deployimit gjendet në `.github/workflows/deploy.yml`.

Ai:

- ekzekutohet kur bëhen push në `main`
- mund të ekzekutohet edhe manualisht
- ekzekuton `npm run build`
- ngarkon dosjen `public/` si artifact të Pages
- e deploy-aton në GitHub Pages

Kjo do të thotë se addon-i publikohet si një site statik dhe mund të përdoret nga Nuvio ose klientë të tjerë kompatibilë me Stremio.

## Zhvillim lokal

Instalo dependencies:

```bash
npm install
```

Ndërto addon-in lokal:

```bash
npm run build
```

Sinkronizo të dhënat e kanalëve nga burimi i jashtëm:

```bash
npm run sync-channels
```

Shto një kanal manualisht:

```bash
npm run add-channel
```

## Si ta përdorësh me Nuvio

1. Publiko depo-n në GitHub.
2. Aktivizo GitHub Pages në settings e depo-s.
3. Sigurohu që source-i i Pages të jetë vendosur në deployim nga workflow-i i GitHub Pages.
4. Përdor URL-në e publikuar si entry point të addon-it në Nuvio.
5. Nuvio do të lexojë manifestin dhe katalogun nga skedarët statikë të gjeneruar.

URL aktuale e projektit:

```text
https://mrkola2026-sys.github.io/tv-shqip-nuvio/manifest.json
```

Manifesti i addon-it gjenerohet në:

```text
/public/manifest.json
```

dhe katalogu gjenerohet në:

```text
/public/catalog/tv/live_channels.json
```

## Shënime

- Projekti është projektuar si një addon statik; nuk ka server backend.
- URL-të e stream-it vijnë nga burimi i jashtëm dhe janë të destinuara për klientë të kompatueshëm.
- Imazhet e posterëve gjenerohen si skedarë SVG në `public/posters` gjatë build-it.

## Licensa

Shiko skedarin e licencës së depo-s për më shumë detaje.
