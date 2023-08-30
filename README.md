# APRS Discord Bot

Discord.js bot for retrieving station data from the APRS network and <https://aprs.fi>
!["Bot Snapshot"](https://i.imgur.com/zEMXdkY.png)

## Installation

1. [Follow the guide here for creating your bot](https://anidiots.guide/getting-started/getting-started-long-version)
2. Clone this repository locally
3. Navigate to the bot directory and run `npm ci`
4. Rename `config.example.json` to `config.json` and replace the tokens, timezone, and embed color with your own
5. Run `node src/bot.js`

## Commands

- `?loc [callsign]` to retrieve location information
- `?telemetry [callsign] [timerange]` to retrieve location information
- `?wx [callsign]` to retrieve weather data
- `?help` to display the help message

Replace `callsign` with the callsign you wish to get data for, and `timerange` should be one of the following strings:

- `1h`
- `3h`
- `6h`
- `12h`
- `24h`
- `48h`
- `72h`
- `7d`

## TODO

- Handle empty/additional fields in the response data for different types of stations
