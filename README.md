# Amateur Radio Discord Bot

Discord.js bot for retrieving and displaying amateur radio data from a variety of sources:

- APRS station data <https://aprs.fi>
- *NEW* Parks on the Air <https://pota.app>
- *NEW* Summits on the Air <https://www.sota.org.uk/>
- More coming soon!

## Usage

You can use this code as a docker image, or run it from the source (see The next section).

A docker image of the latest `master` build is available on the GitHub Container Registry.

```sh
docker pull ghcr.io/brandonb927/amateur-radio-discord-bot:latest
```

## Installation

1. [Follow the guide here for creating your bot](https://anidiots.guide/getting-started/getting-started-long-version)
1. Clone this repository locally
1. Install [`asdf`](https://github.com/asdf-vm/asdf/) with the [`asdf-nodejs`](https://github.com/asdf-vm/asdf-nodejs) plugin (or run ensure the version of node in the `.tool-versions` is available to you)
1. Install dependencies with `npm ci`
1. Rename `config.example.json` to `config.json` and replace the tokens, timezone, and embed color with your own.
   OR
   Define the following environment variables when running the bot directly, or in a `.env` file for use with the Docker image:

   ```txt
   # Fallbacks available in loadConfig.js
   BOT_DISCORD_TOKEN=... # Discord API token
   BOT_MSG_PREFIX=... # Message prefix the bot will listen for
   BOT_APRSFI_TOKEN=... # APRS.fi API key
   BOT_GMAPS_TOKEN=... # Google Maps API key
   BOT_TIMEZONE=... # Timezone string
   BOT_EMBED_COLOR=... # Message embed colour
   BOT_USER_AGENT=... # User agent sent with network requests
   ```

1. Run `npm run start`

## Commands

- `?loc callsign` to retrieve location information.
- `?msg callsign` (alias for `messages`)
- `?messages callsign` to retrieve ten latest messages for given recipient.
- `?pota spots` to retrieve recent Parks on the Air summit spots.
- [not yet implemented] `?pota activations` to retrieve Parks on the Air upcoming activations.
- `?sota spots` to retrieve recent Summits on the Air summit spots.
- [not yet implemented] `?sota activations` to retrieve Summits on the Air upcoming activations.
- `?wx callsign` to retrieve weather data.`

Replace `callsign` with your device's callsign.

## Contributing

1. Run `npm run start:dev` to have the bot code refresh when changes are made

Build the docker image with: `docker build -t amateur-radio-discord-bot .` and run it with `docker run --env-file .env amateur-radio-discord-bot`
