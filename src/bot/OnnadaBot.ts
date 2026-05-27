import { OnnadaAnimationLoader } from '../lib/onnada/OnnadaAnimationLoader.ts';
import { OnnadaCharacterLoader } from '../lib/onnada/OnnadaCharacterLoader.ts';
import { Bot } from '/framework/mod.ts';
import {
  SocketClient,
  SocketReceivedMessage,
} from '/framework/src/network/SocketClient.d.ts';

export class OnnadaBot implements Bot {
  readonly hash: string = 'onnada-bot';
  readonly icon: string = 'https://i.imgur.com/dER0L3N.png';
  readonly nickname: string = '온나다 봇';
  readonly defaultMute: boolean = false;

  #client: SocketClient;
  #loader = new OnnadaAnimationLoader();
  #characterLoader = new OnnadaCharacterLoader();

  constructor(client: SocketClient) {
    this.#client = client;
  }

  activate(): void {}

  onMessage(msg: SocketReceivedMessage): void {
    const { value } = msg;
    const { type } = value;
    if (type === 'chat') {
      const { text } = value.value;
      if (text.startsWith('@애니 ')) {
        const match = /@애니 (.*)/.exec(text);
        const word = match ? match[1] : '';
        this.#loader.load(word).then((animation) => {
          if (animation) {
            this.#client.sendGeneralPurposeCard(
              this.hash,
              JSON.stringify({
                link: animation.link,
                title: animation.title,
                icon: animation.thumbnail,
                subtitle: (() => {
                  const a = (animation.genre ?? '').trim();
                  const b = (animation.media ?? '').trim();
                  if (!a && !b) return '';
                  if (a && b) return `${a} / ${b}`;
                  return a || b;
                })(),
                // 포스터를 크게 보여주기 위해 vertical 유지
                orientation: 'vertical',
                showType: 'in-app-browser',
              }),
            );
          } else {
            this.#client.sendChat(this.hash, '애니 없음');
          }
        });
      } else if (text.startsWith('@캐릭 ')) {
        const match = /@캐릭 (.*)/.exec(text);
        const word = match ? match[1] : '';
        this.#characterLoader.load(word).then((chara) => {
          if (chara) {
            this.#client.sendGeneralPurposeCard(
              this.hash,
              JSON.stringify({
                link: chara.link,
                title: chara.name,
                icon: chara.thumbnail,
                subtitle: chara.animeTitle,
                orientation: 'vertical',
                showType: 'in-app-browser',
              }),
            );
          } else {
            this.#client.sendChat(this.hash, '캐릭터 없음');
          }
        });
      } else if (text.startsWith('@성우 ')) {
        const match = /@성우 (.*)/.exec(text);
        const word = match ? match[1] : '';
        this.#client.sendChat(
          this.hash,
          `https://onnada.com/cv/search?q=${word}`,
        );
      }
    }
  }
}
