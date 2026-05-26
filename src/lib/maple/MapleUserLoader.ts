import * as cheerio from 'npm:cheerio@1.0.0-rc.12';

export class MapleUserLoader {
  async load(id: string): Promise<MapleUser | null> {
    const url = `https://maple.gg/u/${encodeURIComponent(id)}`;
    const res = await fetch(url);
    const body = await res.text();
    const $ = cheerio.load(body);
    const $body = $('body');

    const $icon = $body.find('.character-image');
    const $name = $body.find('.nickname');
    const $level = $body.find('.level');
    const $class = $body.find('.job');

    const name = $name?.text();
    const icon = $icon.attr('src')?.toString() || '';
    const levelText = $level.text();
    const level = Number.parseInt(levelText.replace(/Lv.(\d+).*/, '$1'));
    const expText = levelText.replace(/Lv.\d+\(([\d\.]+)\%\).*/, '$1');
    const exp = Number.parseFloat(expText);
    const jobClass = $class.text();
    if (name) {
      return { icon, name, level, exp, jobClass, link: url };
    } else {
      return null;
    }
  }
}

type MapleUser = {
  icon: string;
  name: string;
  link: string;
  jobClass: string;
  level: number;
  exp: number;
};
