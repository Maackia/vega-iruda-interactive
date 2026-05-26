export class OnnadaAnimationLoader {
  async load(input: string): Promise<AnimationLoaderResult | null> {
    const result = await this.search(input);
    return result;
  }

  async search(
    input: string,
  ): Promise<AnimationLoaderResult | null> {
    const uri = OnnadaAnimationLoader.getUri(input);
    const res = await fetch(uri, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (res.status !== 200) {
      return null;
    }
    const data = await res.text();

    // Onnada 개편 이후(Next.js)에도 SSR HTML에 검색 결과가 포함됨.
    // 결과 카드 단위에서 제목/ID 뿐 아니라 썸네일/분류/방영일도 같이 추출한다.
    const results = OnnadaAnimationLoader.parseSearchResults(data);

    if (results.length === 0) {
      return null;
    }

    const toKeyword = (s: string) => s.toLowerCase().replace(/\s+/g, '');
    const keyword = toKeyword(input);
    let result = results.find((e) => toKeyword(e.title) === keyword);
    if (!result) {
      result = results.find((e) => toKeyword(e.title).search(keyword) >= 0);
    }
    if (!result) {
      result = results[0];
    }

    // 상세 페이지에서 키워드/분류/방영일 등 보강 (검색 화면에는 장르가 없거나 축약됨)
    const enriched = await this.enrichFromDetail(result);
    return enriched ?? result;
  }

  static getUri(animationName: string): string {
    const params = new URLSearchParams();
    params.set('q', animationName);
    params.set('t', 'anime');
    return `https://onnada.com/search?${params.toString()}`;
  }

  private async enrichFromDetail(
    base: AnimationLoaderResult,
  ): Promise<AnimationLoaderResult | null> {
    const idMatch = /\/anime\/(\d+)$/.exec(base.link);
    const id = idMatch?.[1];
    if (!id) return null;

    const url = `https://onnada.com/anime/${id}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (res.status !== 200) return null;
    const html = await res.text();

    const extracted = OnnadaAnimationLoader.parseDetailPage(html);
    if (!extracted) return null;

    return {
      ...base,
      // 상세가 비어있으면 검색 결과 값을 유지
      media: extracted.media || base.media,
      genre: extracted.genre || base.genre,
      date: extracted.date || base.date,
      thumbnail: extracted.thumbnail || base.thumbnail,
    };
  }

  private static parseSearchResults(html: string): AnimationLoaderResult[] {
    // 예시:
    // <a aria-label="귀멸의 칼날" ... href="/anime/4095"> ... src="https://data.onnada.com/anime/...jpg" ...
    const linkRe =
      /<a[^>]*aria-label="([^"]+)"[^>]*href="\/anime\/(\d+)"[^>]*>/g;

    const results: AnimationLoaderResult[] = [];
    let match: RegExpExecArray | null;
    while ((match = linkRe.exec(html)) !== null) {
      const title = OnnadaAnimationLoader.decodeHtmlEntities(match[1]).trim();
      const id = match[2];

      // 한 카드 내에서 보조 정보 찾기 (너무 멀리 가면 다른 결과를 잡을 수 있으니 제한)
      const slice = html.slice(match.index, match.index + 8000);

      const thumbMatch =
        /src="(https:\/\/data\.onnada\.com\/anime\/[^"]+)"/.exec(slice);

      const mediaMatch =
        /분류<\/span><span[^>]*>([^<]+)<\/span>/.exec(slice);

      const dateMatch =
        /방영일<\/span><span[^>]*>([^<]+)<\/span>/.exec(slice);

      results.push({
        title,
        link: `https://onnada.com/anime/${id}`,
        thumbnail: thumbMatch?.[1] ?? '',
        genre: '',
        media: (mediaMatch?.[1] ?? '').trim(),
        date: (dateMatch?.[1] ?? '').trim(),
      });
    }

    // SSR 영역에 실제 이미지 src가 없는 경우가 있어,
    // RSC payload(self.__next_f) 내 \"href\":\"/anime/{id}\" 주변에서 src를 보강한다.
    for (const r of results) {
      if (r.thumbnail) continue;
      const idMatch = /\/anime\/(\d+)$/.exec(r.link);
      const id = idMatch?.[1];
      if (!id) continue;

      const hrefKey = `\\\"href\\\":\\\"/anime/${id}\\\"`;
      const idx = html.indexOf(hrefKey);
      if (idx < 0) continue;

      const start = Math.max(0, idx - 3500);
      const end = Math.min(html.length, idx + 3500);
      const around = html.slice(start, end);

      const m =
        /\\\"src\\\":\\\"(https:\/\/data\.onnada\.com\/anime\/[^\\\"]+)\\\"/
          .exec(around);
      if (m?.[1]) r.thumbnail = m[1];
    }

    // aria-label이 없는 케이스를 대비한 fallback (타이틀 텍스트 기반)
    if (results.length > 0) return results;

    const fallbackRe = /href="\/anime\/(\d+)"[\s\S]{0,2000}?<p[^>]*>([^<]+)<\/p>/g;
    while ((match = fallbackRe.exec(html)) !== null) {
      const id = match[1];
      const title = OnnadaAnimationLoader.decodeHtmlEntities(match[2]).trim();
      results.push({
        title,
        link: `https://onnada.com/anime/${id}`,
        thumbnail: '',
        genre: '',
        media: '',
        date: '',
      });
    }

    return results;
  }

  private static parseDetailPage(html: string): Partial<AnimationLoaderResult> | null {
    // 상세 메타: <dt>분류</dt> = TV/영화 등, 장르는 상단 category 링크 또는 RSC category 필드
    const mediaMatch =
      /<dt[^>]*>분류<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/.exec(html);
    const dateMatch =
      /<dt[^>]*>방영일<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/.exec(html);

    const genre = OnnadaAnimationLoader.parseGenres(html);

    // 썸네일은 RSC payload에서 src를 찾는 편이 안정적 (SSR에서 비어있는 경우 있음)
    const thumbMatch =
      /\\\"src\\\":\\\"(https:\/\/data\.onnada\.com\/anime\/[^\\\"]+)\\\"/.exec(
        html,
      ) ??
        /src="(https:\/\/data\.onnada\.com\/anime\/[^"]+)"/.exec(html);

    const media = OnnadaAnimationLoader.decodeHtmlEntities(mediaMatch?.[1] ?? '')
      .trim();
    const date = OnnadaAnimationLoader.decodeHtmlEntities(dateMatch?.[1] ?? '')
      .trim();

    return {
      media,
      date,
      genre,
      thumbnail: thumbMatch?.[1] ?? '',
    };
  }

  /** 장르(학원, 로맨스 등) — RSC `category` 또는 /anime?category= 링크 */
  private static parseGenres(html: string): string {
    const fromRsc =
      /\\?"category\\?":\\?"([^"\\]+)\\?"/.exec(html) ??
        /"category":"([^"]+)"/.exec(html);
    if (fromRsc?.[1]) {
      return OnnadaAnimationLoader.decodeHtmlEntities(fromRsc[1])
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(', ');
    }

    const genres: string[] = [];
    const linkRe = /href="\/anime\?category=[^"]*"[^>]*>([^<]+)<\/a>/g;
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(html)) !== null) {
      const g = OnnadaAnimationLoader.decodeHtmlEntities(m[1]).trim();
      if (g && !genres.includes(g)) genres.push(g);
    }
    return genres.join(' · ');
  }

  private static decodeHtmlEntities(s: string): string {
    // 최소한의 엔티티만 처리 (Onnada 타이틀에 자주 등장)
    return s
      .replaceAll('&amp;', '&')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>');
  }
}

type AnimationLoaderResult = {
  title: string;
  thumbnail: string;
  link: string;
  media: string;
  genre: string;
  date: string;
};
