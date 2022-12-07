# Budget-notes Telegram bot

Live example here [@MemoryManagerBot](https://t.me/MemoryManagerBot).

- Create some categories

```
├── 🏛 num- "1"
├── 🧸 num- "2"
│   └── 🏘 "2.1"
├── 🏠 num- "3"
│   └── 🧮 "3.1"
└── 🚗 num- "4"
    └── ⛽️ "4.1"
```

- Track some data into categories
- Obtain your monthly(any timeframe) budget

```
Total: +81,853.7 (+201,564) (-119,710.3)
├── 💊: -19,000
├── 🍎: -18,090
├── 🧸: -8,247
├── 👚: -7,469
├── 🛒: -19,955.71
├── 🏠: -6,319.21
│     └── 🧮: -5,541.21
├── 🌐: -11,459.76
├── 🏪: -7,140.06
├── 🍽: -2,635.91
├── 🚗: -3,712.77
│     └── ⛽️: -3,712.77
├── 💻: -2,097
├── 🏛: -8,966.88
├── 🎉: -4,617
└── 💰: +201,564
Balance till 18.11.2022 12:41:05 is +291,909.88
```

- Track some text data for whatever reason

## Run locally

- install [NodeJS](https://nodejs.org/en/),
  [PostgreSQL](https://www.postgresql.org/download/)
- run `npm i`
- create `memory` (by default) database for `PostgreSQL`
- create application at
  [https://my.telegram.org/apps](https://my.telegram.org/apps). Select
  application type - `Web`, set - `empty URL`, obtain `api id` and `api hash`.
- create Telegram Bot with [BotFather](https://telegram.me/botfather)
- build [tdLib](https://github.com/tdlib/td#building) for your system, check
  required version with
  [airgram](https://github.com/airgram/airgram#installation)
- create `.app_rc.json` config file

Build `npm run build` and run bot `npm start` or `cd ./dist` and `node app.js`

- use bot in private chat or add bot to chat with multiple users (assign bot
  admin rights to read all messages for better UX)

## TbLib vs TelegramBotAPI

[TdLib](https://github.com/tdlib/td) can be used for bot and user.
[TelegramBotAPI](https://core.telegram.org/bots/api) is limited to bots only.
Moreover TelegramBotAPI does not support a lot of handy methods, e.g.
[fetch message by id](https://stackoverflow.com/questions/44914815/how-to-get-message-info-by-id-telegram-api)
etc.

- NodeJS+TypeScript has awesome package for TdLib -
  [Airgram](https://github.com/airgram/airgram).
- NodeJS+TypeScript has awesome package for TelegramBotAPI -
  [Telegraf](https://github.com/telegraf/telegraf).

Currently TdLib has only one huge minus for NodeJS - you have to
[build TdLib](https://github.com/tdlib/td#building), but this can change in the
future using [WASM](https://github.com/airgram/airgram/issues/36).

## Config

Configuration file is required. See additional info, about
[cosmiconfig](https://www.npmjs.com/package/cosmiconfig) package. Configuration
example `.app_rc.example.json`. You need to create your own config file e.g.
`.app_rc.json` by default.

## Environment variables (Debug)

Path to the application config

```
CONFIG=... node app.js
```

Debug anything

```
DEBUG=bnb* node app.js
```

## Tests

For testing you need to have `test_section` in config file.
[Jest](https://jestjs.io/) performs tests.

- Run tests `npm run test`
- Run unit tests `npm run test-unit`
- Run integration tests `npm run test-int`
