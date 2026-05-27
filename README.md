# vega-iruda-interactive

Vega Iruda Interactive 채팅 환경에서 동작하는 Deno 기반 봇 모음입니다. 웹소켓 서버에 연결한 뒤 여러 봇을 등록해 채팅 명령, 카드 메시지, 주기적 알림을 처리합니다.

## 기술 스택

- Runtime: [Deno](https://deno.com/)
- Language: TypeScript
- Framework: `https://eruhoon.github.io/vega-iruda-interactive-fw/`
- 주요 외부 연동: 기상청, 네이버 검색 API, Twitch API, Eternal Return Open API, LoL Esports, Onnada, AfreecaTV, DCInside/인벤 프록시 API

## 프로젝트 구조

```text
.
├── index.ts                 # 앱 진입점 및 봇 등록
├── deno.json                # import map, fmt, lint 설정
├── common/config/Config.ts  # .env 설정 로딩
└── src
    ├── bot                  # 채팅 봇 구현
    └── lib                  # 외부 서비스 로더
```

## 실행 준비

1. Deno를 설치합니다.

   ```sh
   deno --version
   ```

2. 환경 변수 파일을 준비합니다.

   ```sh
   cp .env.defaults .env
   ```

3. `.env` 값을 실제 환경에 맞게 채웁니다.

   ```dotenv
   WEB_SOCKET_HOST=wss://host:port
   NAVER_CLIENT_ID=
   NAVER_CLIENT_SECRET=
   TWITCH_CLIENT_ID=
   TWITCH_SECRET_KEY=
   TWITCH_EMBED_HOST=
   ETERNAL_RETURN_API_KEY=
   ```

   `WEB_SOCKET_HOST`는 앱 실행에 필요합니다. 네이버, Twitch, Eternal Return 관련 명령을 사용하려면 해당 API 키도 필요합니다.

## 실행

```sh
deno run --allow-net --allow-read=.env,.env.defaults --allow-env index.ts
```

최초 실행 시 원격 모듈을 내려받습니다.

## 개발 명령

```sh
# 포맷
deno fmt

# 린트
deno lint

# 테스트
deno test
```

## 등록된 봇

`index.ts` 기준으로 다음 봇이 실행됩니다.

| 봇 | 역할 |
| --- | --- |
| `PengBot` | 검색, 책/영화, LCK 일정, Twitch/AfreecaTV, 포켓몬 링크 등 복합 명령 |
| `DiceBot` | 주사위 및 랜덤 숫자 생성 |
| `CoronaBot` | 질병관리청 코로나 현황 조회 |
| `ClockBot` | 현재 시간 응답 및 매 정각 알림 |
| `LolGallBot` | LoL 갤러리 이슈 링크 주기 확인 |
| `LolInvenNewsBot` | LoL 인벤 뉴스 링크 주기 확인 |
| `WeatherBot` | 날씨, 태풍, 미세먼지, 꽃가루 정보 |
| `NamuWikiBot` | 나무위키 검색 링크 생성 |
| `OnnadaBot` | 애니/캐릭터/성우 검색 |
| `EternalReturnBot` | 이터널 리턴 유저 평균 랭크 조회 |
| `RandomPhotobot` | 랜덤 이미지 카드 전송 |

`MaplestoryBot` 구현은 존재하지만 현재 `index.ts`에는 등록되어 있지 않습니다.

## 주요 채팅 명령

| 명령 | 설명 |
| --- | --- |
| `@주사위` | 1부터 6까지 숫자 중 하나를 반환합니다. |
| `@랜덤 <최대값>` | 1부터 최대값까지 숫자 중 하나를 반환합니다. 최대값은 2 이상 31415 이하입니다. |
| `!시계`, `!시간` | 현재 시간을 반환합니다. |
| `@코로나` | 코로나 현황 카드를 전송합니다. |
| `@태풍` | 태풍/바람 지도 링크를 전송합니다. |
| `@미세`, `@미먼`, `@미세먼지` | 미세먼지 링크를 전송합니다. |
| `@꽃가루` | 꽃가루 정보 링크를 전송합니다. |
| `@웨더 <지역>` | 지역 날씨 카드를 전송합니다. |
| `@검색 <검색어>` | Google 검색 링크를 전송합니다. |
| `@책 <검색어>` | 네이버 책 검색 결과 카드를 전송합니다. |
| `@영화 <검색어>` | 네이버 영화 검색 결과 카드를 전송합니다. |
| `@lck` | 오늘의 LCK/LCK CL/Worlds 일정을 조회합니다. |
| `@트위치 <아이디>` | Twitch 채널 임베드 카드를 전송합니다. |
| `@아프리카 <검색어>` | AfreecaTV 검색 결과 카드를 전송합니다. |
| `@벌레 <포켓몬>` | 포켓몬 위키 링크를 전송합니다. |
| `@꺼라 <검색어>`, `@나무위키 <검색어>` | 나무위키 검색 링크를 전송합니다. |
| `@애니 <검색어>` | Onnada 애니 검색 결과 카드를 전송합니다. |
| `@캐릭 <검색어>` | Onnada 캐릭터 검색 링크를 전송합니다. |
| `@성우 <검색어>` | Onnada 성우 검색 링크를 전송합니다. |
| `@실험체 <닉네임>` | 이터널 리턴 최근 게임 평균 랭크를 조회합니다. |
| `@랜덤짤` | 랜덤 이미지 카드를 전송합니다. |

## 환경 변수

| 이름 | 용도 |
| --- | --- |
| `WEB_SOCKET_HOST` | Vega Iruda Interactive 웹소켓 서버 주소 |
| `NAVER_CLIENT_ID` | 네이버 검색 API Client ID |
| `NAVER_CLIENT_SECRET` | 네이버 검색 API Client Secret |
| `TWITCH_CLIENT_ID` | Twitch API Client ID |
| `TWITCH_SECRET_KEY` | Twitch API Secret |
| `TWITCH_EMBED_HOST` | Twitch 플레이어 embed parent 호스트 |
| `ETERNAL_RETURN_API_KEY` | Eternal Return Open API 키 |

## 참고 사항

- 일부 로더는 외부 웹페이지 구조를 파싱하므로 대상 사이트의 HTML 변경에 영향을 받을 수 있습니다.
- `LolGallBot`, `LolInvenNewsBot`, `RandomPhotobot`, `ClockBot`은 활성화 시 스케줄러를 사용합니다.
- `LolGallBot`은 `defaultMute`가 `true`로 설정되어 있습니다.
