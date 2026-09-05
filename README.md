# 모바일 청첩장

순수 HTML/CSS/JS로 만든 반응형(모바일·태블릿·PC) 모바일 청첩장입니다.
빌드 도구 없이 그대로 GitHub Pages에 올리면 동작합니다.

## 파일 구성
```
index.html   구조 (섹션 순서: 인트로 → 이름/일시 → 인사말 → 연락처 → 캘린더 → 갤러리 → 오시는길 → 게스트스냅 → 계좌 → RSVP)
style.css    디자인 (컬러/폰트/레이아웃 전부 여기)
script.js    동작 (달력 자동생성, 카운트다운, 갤러리, 음악, 업로드, RSVP 등)
assets/      사진·음악 넣는 폴더 (직접 추가해야 함)
```

## 1. 내 정보로 채우기

1. **`script.js` 맨 위 `CONFIG` 객체**에서 예식 일시, 갤러리 이미지 경로, 배경음악 유튜브 ID(`bgmYoutubeId`)를 수정하세요. 배경음악은 mp3 파일 없이 유튜브 영상을 화면 밖에 숨겨 재생하는 방식입니다.
2. **`index.html`** 안의 이름, 전화번호(`tel:01000000000` → 실제 번호), 주소, 계좌번호, 카카오페이 링크(`href="#"`)를 실제 값으로 바꾸세요.
3. **`assets/` 폴더**에 아래 파일을 넣어주세요.
   - `assets/hero.jpg` — 상단 대표 사진 (세로 4:5 비율 권장)
   - `assets/gallery/01.jpg` ~ `09.jpg` (또는 원하는 장수, `CONFIG.galleryImages`에 경로 추가)
   - `assets/og-cover.jpg` — 카카오톡/문자로 링크 공유 시 보일 미리보기 이미지
   - `assets/photobooth.jpg`, `assets/parking.jpg` — 안내 탭(포토부스·주차안내)에 쓸 사진 (이미 넣어두었습니다)

## 2. 지도

오시는 길 섹션은 **네이버 지도(Dynamic Map)**로 연동되어 있습니다.

1. [Naver Cloud Platform](https://www.ncloud.com) 가입 → 콘솔에서 **Maps → Application 등록**
2. API 선택은 **Dynamic Map**만 체크
3. "Web 서비스 URL"에 실제 배포 도메인(예: `https://아이디.github.io/저장소이름/`)을 등록해야 그 도메인에서 지도가 정상 표시됩니다. 도메인이 바뀌면(예: 커스텀 도메인 연결) 이 항목도 다시 등록해주세요.
4. 발급된 **Client ID**를 `index.html` 맨 아래 `<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=...">`의 `ncpClientId` 값에 넣으면 됩니다.
5. 지도 중심 좌표/예식장 이름은 `script.js`의 `CONFIG.venueLat`, `CONFIG.venueLng`, `CONFIG.venueName`에서 관리합니다.

카카오내비·네이버지도 버튼(앱 바로 연결)은 `index.html`의 `.map-btns` 안 링크를 실제 예식장 이름/좌표로 바꾸면 됩니다.

## 3. 게스트 스냅(사진·영상 업로드) 연동

GitHub Pages는 정적 호스팅이라 서버가 없어서, 하객이 올린 사진을 **저장해줄 클라우드**가 하나 필요합니다.
지금은 미리보기까지만 동작하고, 실제 업로드는 비활성화되어 있습니다.

`script.js`의 `CONFIG.guestSnapUploadEndpoint`에 업로드를 받아줄 주소를 넣으면 바로 활성화됩니다. 예:

- **Cloudinary (가장 간단)**: 무료 계정 생성 → Unsigned upload preset 생성 →
  `guestSnapUploadEndpoint: "https://api.cloudinary.com/v1_1/내클라우드이름/auto/upload"`,
  `guestSnapExtraFields: { upload_preset: "내preset이름" }`
- **Firebase Storage / 자체 서버**: REST 업로드 엔드포인트 주소만 넣으면 됩니다.
- **직접 연동하실 클라우드가 있다면**: 업로드를 받는 엔드포인트 URL(및 필요한 파라미터)만 알려주시면 그대로 연결해 드릴 수 있습니다.

같은 방식으로 **참석 여부(RSVP)**도 `CONFIG.rsvpSubmitEndpoint`에 응답을 받을 주소(Google Forms, 자체 API 등)를 넣으면 실제 전달이 활성화됩니다.

### 3-1. RSVP를 Google Forms로 받고 이메일 알림 받기

지금 RSVP 폼은 눌러도 어디에도 저장되지 않는 상태입니다. 아래처럼 하면 응답이 올 때마다 이메일로 알림을 받을 수 있습니다.

1. [Google Forms](https://forms.google.com)에서 새 설문을 만들고, 문항을 아래처럼 구성하세요. (순서는 상관없음)
   - 성함 (단답형)
   - 구분 (객관식: 신랑측 하객 / 신부측 하객)
   - 참석 여부 (객관식: 참석합니다 / 참석이 어렵습니다)
   - 참석 인원 (단답형, 숫자)
   - 전하실 말씀 (장문형)
2. 우측 상단 ⋮ 메뉴 → **"응답" 탭** → 스프레드시트 아이콘 클릭 → 응답을 저장할 구글 시트 연결
3. 응답 탭에서 ⋮ → **"새 응답에 대한 이메일 알림 받기"** 켜기 → 응답이 올 때마다 자동으로 이메일 옴
4. 우측 상단 **미리보기(눈 모양 아이콘)** 클릭 → 주소창 URL 끝의 `viewform`을 `formResponse`로 바꾼 값을 복사
   - 예: `.../e/1FAIpQL.../viewform` → `.../e/1FAIpQL.../formResponse`
5. 미리보기 화면에서 **Ctrl+U(페이지 소스 보기)** → `Ctrl+F`로 `entry.` 검색 → 각 문항의 `name="entry.123456789"` 값을 문항 순서대로 확인
6. `script.js` 맨 위 `CONFIG.googleFormActionUrl`에 4번 값을, `CONFIG.googleFormEntryIds`의 각 항목에 5번에서 찾은 entry ID를 넣으면 바로 활성화됩니다.

이 값들을 저에게 알려주시면 코드에 바로 채워드릴 수 있습니다.

## 4. GitHub Pages로 배포하기

1. GitHub에서 새 저장소 생성 (예: `our-wedding`)
2. 이 폴더(`index.html`, `style.css`, `script.js`, `assets/`)를 저장소에 업로드
   ```bash
   git init
   git add .
   git commit -m "청첩장 첫 배포"
   git branch -M main
   git remote add origin https://github.com/아이디/our-wedding.git
   git push -u origin main
   ```
3. 저장소 **Settings → Pages** 에서 Source를 `main` 브랜치 `/ (root)`로 설정
4. 잠시 후 `https://아이디.github.io/our-wedding/` 로 접속 확인

## 참고

- 폰트: Pretendard(본문), Cormorant Garamond(영문/장식) — CDN으로 불러오므로 별도 설치 불필요
- `prefers-reduced-motion`을 켠 기기에서는 애니메이션이 자동으로 최소화됩니다
- 모든 텍스트/이름/계좌는 예시 데이터이므로 실제 배포 전 반드시 교체해주세요
