import { cheerio } from 'https://deno.land/x/cheerio@1.0.7/mod.ts';
import { Config } from '../../common/config/Config.ts';
import { AfreecaSearchLoader } from '../lib/afreeca/AfreecaSearchLoader.ts';
import { LolScheduleLoader } from '../lib/lol/LolScheduleLoader.ts';
import { NaverBookLoader } from '../lib/naver/NaverBookLoader.ts';
import { NaverMovieLoader } from '../lib/naver/NaverMovieLoader.ts';
import { TwitchTokenLoader } from '../lib/twitch/TwitchTokenLoader.ts';
import { TwitchUserLoader } from '../lib/twitch/TwitchUserLoader.ts';
import { Bot } from '/framework/mod.ts';
import {
  SocketClient,
  SocketReceivedMessage,
  SocketSenderProfile,
} from '/framework/src/network/SocketClient.d.ts';

const LOL_SCHEDULE_URL = 'https://lolesports.com/schedule?leagues=lck,worlds';

export class PengBot implements Bot {
  readonly hash = 'peng-bot2';
  readonly icon = 'https://i.imgur.com/ID0sKjB.jpg';
  readonly nickname = '펭 봇';
  readonly defaultMute: boolean = false;
  #client: SocketClient;

  #numberChanged = false;
  #number = 0;

  constructor(client: SocketClient) {
    this.#client = client;
  }

  activate(): void {}

  #asSender(): SocketSenderProfile {
    return { icon: this.icon, nickname: this.nickname };
  }

  onMessage(msg: SocketReceivedMessage) {
    this.#numberChanged = false;
    const value = msg.value;
    if (value.type === 'chat') {
      if (value.value.text === '박스테스트') {
        this.#client.sendChat(this.hash, '박스테스트1');
        this.#client.sendGeneralPurposeCard(
          this.hash,
          JSON.stringify({
            title: '우...마...',
            subtitle: '무스,,메.,,',
            icon:
              'https://data.onnada.com/anime/202012/thumb300x400_2070905244_8a48c2b8_0.png',
            orientation: 'vertical',
          }),
        );
      }
      if (value.value.text === '1' && this.#number === 0) {
        this.#numberChanged = true;
        this.#number = 1;
      } else if (value.value.text === '2' && this.#number === 1) {
        this.#numberChanged = true;
        this.#number = 2;
        this.#client.sendChat(this.hash, '짝');
      } else if (value.value.text === '짝' && this.#number === 2) {
        this.#numberChanged = true;
        this.#number = 3;
      } else if (value.value.text === '4' && this.#number === 3) {
        this.#numberChanged = true;
        this.#number = 4;
      } else if (value.value.text === '5' && this.#number === 4) {
        this.#numberChanged = false;
        this.#client.sendChat(this.hash, '하겟냐');
      }
      //   if (value.value.text === '1') {
      //     this.#client.sendChat(bot, '아쉬워요 ㅠㅠㅠ');
      //   }

      if (value.value.text === 'ㅇㅂㅂ') {
        this.#client.sendChat(this.hash, '이보세요 별님 ㅋㅋㅋㅋ');
      }
      if (value.value.text === 'ㅇㅂㄱ') {
        this.#client.sendChat(this.hash, '이보세요 간님 ㅋㅋㅋㅋ');
      }
      if (value.value.text === 'ㅇㅂㅇ') {
        this.#client.sendChat(this.hash, '이보세요 융뎅구리 ㅋㅋㅋㅋ');
      }
      if (value.value.text === 'ㅇㅂㅍ') {
        this.#client.sendChat(this.hash, '이보세요 펭님 ㅋㅋㅋㅋ');
      }
      if (value.value.text === '99') {
        this.#client.sendChat(this.hash, '간델게고수');
      }

      if (value.value.text === '11') {
        this.#client.sendChat(this.hash, '11 반응하는 펭봇입니다.');
      }
      if (value.value.text === '12') {
        this.#client.sendChat(this.hash, '12도  반응하는 펭봇입니다.');
      }
      if (value.value.text === '13') {
        this.#client.sendChat(this.hash, '13도 음...  반응하는 펭봇입니다.');
      }
      if (value.value.text === '14') {
        this.#client.sendChat(this.hash, '14까지..도 뭐 반응하는 펭봇입니다.');
      }
      if (value.value.text === '하미') {
        this.#client.sendChat(this.hash, '하미귀여워요');
      }
      if (value.value.text === '서리') {
        this.#client.sendChat(this.hash, '서리이뻐요');
      }
      if (value.value.text === '하미서리') {
        this.#client.sendChat(this.hash, '하미서리조와');
      }

      if (value.value.text === '간삐') {
        this.#client.sendChat(this.hash, '...');
      }

      if (
        value.value.text.startsWith('@백준') ||
        value.value.text.startsWith('@문제') ||
        value.value.text.startsWith('@코딩')
      ) {
        const match = /@.*? (.*)/.exec(value.value.text);
        const word = match?.[1];
        this.#client.sendChat(this.hash, `http://boj.kr/${word}`);
      }

      if (value.value.text.startsWith('@검색 ')) {
        const match = /@검색 (.*)/.exec(value.value.text);
        const patt = /([+`~!@#$%^&*|\\\'\";:\/?])/gi;
        const word = match
          ? match[1].replace(patt, (s) => encodeURIComponent(s))
          : '';
        this.#client.sendChat(
          this.hash,
          `https://www.google.co.kr/search?q=${word}`,
        );
      }

      if (value.value.text.startsWith('@책 ')) {
        const match = /@책 (.*)/.exec(value.value.text);
        const keyword = match ? match[1] : '';
        new NaverBookLoader().getData(keyword).then((book) => {
          if (!book) {
            this.#client.sendChat(this.hash, '책 없음');
          } else {
            this.#client.sendGeneralPurposeCard(
              this.hash,
              JSON.stringify({
                link: book.link,
                title: book.title,
                icon: book.image,
                subtitle: book.author,
                orientation: 'vertical',
                showType: 'new-window',
              }),
            );
          }
        });
      }

      if (value.value.text.startsWith('@영화 ')) {
        const match = /@영화 (.*)/.exec(value.value.text);
        const keyword = match ? match[1] : '';

        new NaverMovieLoader().getData(keyword).then((movie) => {
          if (movie === null) {
            this.#client.sendChat(this.hash, '영화 없음');
          } else {
            this.#client.sendGeneralPurposeCard(
              this.hash,
              JSON.stringify({
                link: movie.link,
                title: movie.title,
                icon: movie.image,
                subtitle: movie.pubDate,
                orientation: 'vertical',
                showType: 'new-window',
              }),
            );
          }
        });
      }

      if (value.value.text === '@lck') {
        this.#load().then((found) => {
          if (!found || found.schedules.length === 0) {
            this.#client.sendChat(this.hash, LOL_SCHEDULE_URL);
          }
          found.schedules
            .map((s) => {
              const league = s[0];
              const home = s[1];
              const away = s[2];
              return {
                icon: this.#getIcon(league),
                title: this.#getName(league),
                subtitle: `${home} vs ${away}`,
                orientation: 'horizontal',
                showType: 'in-app-browser',
                link: LOL_SCHEDULE_URL,
              };
            })
            .forEach((opt) => {
              this.#client.sendGeneralPurposeCard(
                this.hash,
                JSON.stringify(opt),
              );
            });
        });
      }

      if (value.value.text.startsWith('@벌레 ')) {
        const text = value.value.text;
        this.#onPoke(text);
      }

      if (value.value.text.startsWith('@트위치 ')) {
        const text = value.value.text;
        const match = /@트위치 (.*)/.exec(text);
        const word = match?.[1];
        if (!word) {
          this.#client.sendChat(this.hash, '입력 오류');
          return;
        }
        this.#onTwitch(word);
      }

      if (value.value.text.startsWith('@아프리카 ')) {
        const match = /@아프리카 (.*)/.exec(value.value.text);
        const query = match ? match[1] : '';
        console.log('query');
        new AfreecaSearchLoader().getResults(query).then((results) => {
          const options = results.map((result) => {
            const link = `//play.afreecatv.com/${result.id}/embed`;
            return {
              icon: result.broadIcon,
              link,
              title: result.stationName,
              subtitle: result.broadTitle,
              orientation: 'horizontal',
              showType: 'content-viewer',
            };
          });

          options
            .filter((_, i) => i < 3)
            .forEach((option) => {
              this.#client.sendGeneralPurposeCard(
                this.hash,
                JSON.stringify(option),
              );
            });
        });
      }
    }

    if (!this.#numberChanged) {
      this.#number = 0;
    }
    this.#numberChanged = false;
  }

  #tokenLoader = new TwitchTokenLoader(
    Config.twitchClientId,
    Config.twitchSecretKey,
  );

  #userLoader = new TwitchUserLoader(Config.twitchClientId);

  async #onTwitch(userId: string) {
    const token = await this.#tokenLoader.load();
    if (!token) {
      this.#client.sendChat(this.hash, '토큰 오류');
      return;
    }
    const users = await this.#userLoader.load([userId], token);
    const user = users?.[0];

    if (!user) {
      this.#client.sendChat(this.hash, '유저 없음');
      return;
    }

    const host = 'player.twitch.tv';
    const embedHost = Config.twitchEmbedHost;
    this.#client.sendGeneralPurposeCard(
      this.hash,
      JSON.stringify({
        link: `https://${host}/?channel=${user.login}&parent=${embedHost}`,
        title: user.display_name,
        icon: user.profile_image_url,
        subtitle: user.description,
        showType: 'content-viewer',
        orientation: 'horizontal',
      }),
    );
  }

  async #onPoke(text: string) {
    const res = await fetch(
      'https://pokemon.fandom.com/ko/wiki/%EC%A0%84%EA%B5%AD%EB%8F%84%EA%B0%90',
    );
    const data = await res.text();

    if (!data) {
      this.#client.sendChat(this.hash, '파싱 에러');
      return;
    }

    const match = /@벌레 (.*)/.exec(text);
    const word = match?.[1];

    if (!word) {
      this.#client.sendChat(
        this.hash,
        decodeURI('https://pokemon.fandom.com/ko/wiki/전국도감'),
      );
      return;
    }

    const $ = cheerio.load(data);
    const idx = isNaN(parseInt(word)) ? 3 : 1;
    const href = $(`td:contains('${word}')`)
      .filter((i: number) => $(`td:contains('${word}')`).eq(i).index() == idx)
      .parent()
      .find('td:eq(3) a')
      .attr('href');
    this.#client.sendChat(
      this.hash,
      href
        ? decodeURI(`https://pokemon.fandom.com${href}`)
        : decodeURI('https://pokemon.fandom.com/ko/wiki/전국도감'),
    );
  }

  async #load(): Promise<Schedule> {
    const loaded = await new LolScheduleLoader().load();
    const today = this.#formatDate(new Date());
    const schedules: [League, string, string][] = loaded
      .filter((e) => {
        const isLck = e.league.slug === 'lck' || 'lck_challengers_league' ||
          'worlds';
        const isToday = today === this.#formatDate(new Date(e.startTime));
        return isLck && isToday;
      })
      .map((e) => {
        const league = this.#getLeagueName(e.league.slug);
        const teams = e.match.teams.map((t) => t.code);
        return [league, teams[0], teams[1]];
      });
    return { date: today, schedules };
  }

  #getLeagueName(slug: string) {
    switch (slug) {
      case 'lck':
      case 'worlds':
      case 'lck_challengers_league':
        return slug;
      default:
        return 'etc';
    }
  }

  #formatDate(dateObj: Date): string {
    const format = (src: number) => (src < 10 ? `0${src}` : `${src}`);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const date = dateObj.getDate();
    return `${year}-${format(month)}-${format(date)}`;
  }

  #getIcon(league: League): string {
    switch (league) {
      case 'lck':
        return 'https://am-a.akamaihd.net/image?resize=60:&f=http%3A%2F%2Fstatic.lolesports.com%2Fleagues%2Flck-color-on-black.png';
      case 'lck_challengers_league':
        return 'https://am-a.akamaihd.net/image?resize=120:&f=http%3A%2F%2Fstatic.lolesports.com%2Fleagues%2Flck-cl-white.png';
      case 'worlds':
        return 'https://am-a.akamaihd.net/image?resize=60:&f=http%3A%2F%2Fstatic.lolesports.com%2Fleagues%2F1592594612171_WorldsDarkBG.png';
      default:
        console.log('invalid league');
        return '';
    }
  }

  #getName(league: League): string {
    switch (league) {
      case 'lck':
        return 'LCK';
      case 'lck_challengers_league':
        return 'LCK CL';
      case 'worlds':
        return 'Worlds';
      default:
        console.log('invalid league');
        return '';
    }
  }
}

type Schedule = {
  date: string;
  schedules: [League, string, string][];
};

type League = 'lck' | 'lck_challengers_league' | 'worlds' | 'etc';
