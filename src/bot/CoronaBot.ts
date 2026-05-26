import * as cheerio from 'npm:cheerio@1.0.0-rc.12';
import { Bot } from '/framework/mod.ts';
import {
  SocketClient,
  SocketReceivedMessage,
} from '/framework/src/network/SocketClient.d.ts';

export class CoronaBot implements Bot {
  readonly hash: string = 'corona-bot';
  readonly icon: string = 'https://i.imgur.com/el4WyBdb.png';
  readonly nickname: string = '코로나 봇';
  readonly defaultMute: boolean = false;
  #client: SocketClient;

  constructor(client: SocketClient) {
    this.#client = client;
  }

  activate(): void {}

  onMessage(msg: SocketReceivedMessage) {
    const value = msg.value;
    if (value.type === 'chat') {
      if (value.value.text === '@코로나') {
        this.fetchSite().then((it) => {
          this.#client.sendGeneralPurposeCard(
            this.hash,
            JSON.stringify({
              title: `${it.total} 명`,
              subtitle: it.date,
              icon: 'https://i.imgur.com/B9H3UYL.png',
              orientation: 'horizontal',
            }),
          );
        });
      }
    }
  }

  async fetchSite(): Promise<CoronaStatus> {
    const res = await fetch('https://ncov.kdca.go.kr/');
    const $ = cheerio.load(await res.text());
    const dateString = $('.occurrenceStatus .livedate').text();
    return {
      date: dateString,
      total: $('.occurrenceStatus .ds_table tbody td').eq(3).text(),
    };
  }
}

type CoronaStatus = {
  date: string;
  total: string;
};
