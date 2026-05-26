import * as cheerio from 'npm:cheerio@1.0.0-rc.12';

export class MapleEventLoader {
  async load(): Promise<MapleEvent[] | null> {
    const host = 'https://m.maplestory.nexon.com';
    const uri = `${host}/News/Event/Ongoing`;
    const res = await fetch(uri, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.1.2222.33 Safari/537.36',
        'Accept-Encoding': '*',
        Connection: 'keep-alive',
      },
      referrer: 'm.maplestory.nexon.com',
    });
    const body = await res.text();
    const $ = cheerio.load(body, {
      lowerCaseAttributeNames: true,
    });
    const options = $('div.event-list a')
      .toArray()
      .map((e) => {
        const $e = $(e);
        const $icon = $e.find('.content-thumbnail img');
        const $title = $e.find('span.content-title');
        const $info = $e.find('.content-date');
        const link = `${host}${$e.attr('href') || ''}`;
        const icon = $icon.attr('src') || '';
        const title = $title.text();
        const subtitle = $info.text().trim();
        return { icon, title, subtitle, link };
      });
    return options;
  }
}

type MapleEvent = {
  icon: string;
  title: string;
  subtitle: string;
  link: string;
};
