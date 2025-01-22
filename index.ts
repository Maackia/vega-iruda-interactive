import { Config } from './common/config/Config.ts';
import { ClockBot } from './src/bot/ClockBot.ts';
import { CoronaBot } from './src/bot/CoronaBot.ts';
import { DiceBot } from './src/bot/DiceBot.ts';
import { EternalReturnBot } from './src/bot/EternalReturnBot.ts';
import { LolGallBot } from './src/bot/LolGallBot.ts';
import { LolInvenNewsBot } from './src/bot/LolInvenNewsBot.ts';
import { NamuWikiBot } from './src/bot/NamuWikiBot.ts';
import { OnnadaBot } from './src/bot/OnnadaBot.ts';
import { PengBot } from './src/bot/PengBot.ts';
import { WeatherBot } from './src/bot/WeatherBot.ts';
import { RandomPhotobot } from './src/bot/RandomPhotoBot.ts';

import { Bot, IrudaApp } from '/framework/mod.ts';

const app = new IrudaApp(Config.websocketHost);
const { client } = app;

const pengBot = new PengBot(client);
const diceBot = new DiceBot(client);
const coronaBot = new CoronaBot(client);
const clockBot = new ClockBot(client);
const lolGallBot = new LolGallBot(client);
const lolInvenNewsBot = new LolInvenNewsBot(client);
const weatherBot = new WeatherBot(client);
const namuWikiBot = new NamuWikiBot(client);
const onnadaBot = new OnnadaBot(client);
const eternalReturnBot = new EternalReturnBot(client);
const randomPhotobot = new RandomPhotobot(client);

const bots: Bot[] = [
  pengBot,
  diceBot,
  coronaBot,
  clockBot,
  lolGallBot,
  lolInvenNewsBot,
  weatherBot,
  namuWikiBot,
  onnadaBot,
  eternalReturnBot,
  randomPhotobot,
];

app.run(bots);
