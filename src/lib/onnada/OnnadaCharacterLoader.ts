export class OnnadaCharacterLoader {
  async load(input: string): Promise<CharacterLoaderResult | null> {
    const uri = OnnadaCharacterLoader.getUri(input);
    const res = await fetch(uri, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (res.status !== 200) {
      return null;
    }
    const html = await res.text();

    const results = OnnadaCharacterLoader.parseSearchResults(html);
    if (results.length === 0) return null;

    const toKeyword = (s: string) => s.toLowerCase().replace(/\s+/g, '');
    const keyword = toKeyword(input);

    let result = results.find((e) => toKeyword(e.name) === keyword);
    if (!result) {
      result = results.find((e) => toKeyword(e.name).includes(keyword));
    }
    return result ?? results[0];
  }

  static getUri(name: string): string {
    const params = new URLSearchParams();
    params.set('q', name);
    params.set('t', 'character');
    return `https://onnada.com/search?${params.toString()}`;
  }

  private static parseSearchResults(html: string): CharacterLoaderResult[] {
    // 예시:
    // <a aria-label="야마부키 아리스" ... href="/character/83772"> ... <a href="/anime/6430">한밤중 하트튠</a>
    const linkRe =
      /<a[^>]*aria-label="([^"]+)"[^>]*href="\/character\/(\d+)"[^>]*>/g;

    const results: CharacterLoaderResult[] = [];
    let match: RegExpExecArray | null;

    while ((match = linkRe.exec(html)) !== null) {
      const name = OnnadaCharacterLoader.decodeHtmlEntities(match[1]).trim();
      const id = match[2];

      const slice = html.slice(match.index, match.index + 4000);

      // 등장 작품명: 같은 카드 안의 첫 /anime/{id} 링크 텍스트
      const animeMatch =
        /href="\/anime\/\d+"[^>]*>([^<]+)<\/a>/.exec(slice);

      // 썸네일은 RSC payload 내 src 또는 SSR img 에서 가져온다.
      let thumbnail = '';
      const thumbInline =
        /src="(https:\/\/data\.onnada\.com\/[^"]+)"/.exec(slice);
      if (thumbInline?.[1]) {
        thumbnail = thumbInline[1];
      } else {
        const hrefKey = `\\\"href\\\":\\\"/character/${id}\\\"`;
        const idx = html.indexOf(hrefKey);
        if (idx >= 0) {
          const start = Math.max(0, idx - 4000);
          const end = Math.min(html.length, idx + 4000);
          const around = html.slice(start, end);
          const rscThumb =
            /\\\"src\\\":\\\"(https:\/\/data\.onnada\.com\/[^\\\"]+)\\\"/
              .exec(around);
          if (rscThumb?.[1]) thumbnail = rscThumb[1];
        }
      }

      results.push({
        name,
        link: `https://onnada.com/character/${id}`,
        animeTitle: animeMatch
          ? OnnadaCharacterLoader.decodeHtmlEntities(animeMatch[1]).trim()
          : '',
        thumbnail,
      });
    }

    return results;
  }

  private static decodeHtmlEntities(s: string): string {
    return s
      .replaceAll('&amp;', '&')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>');
  }
}

type CharacterLoaderResult = {
  name: string;
  thumbnail: string;
  link: string;
  animeTitle: string;
};

