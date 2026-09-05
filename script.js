/* ============================================================
   CONFIG — 청첩장 정보는 전부 이 객체에서만 수정하면 됩니다.
   ============================================================ */
const CONFIG = {
  wedding: {
    year: 2026,
    month: 12,      // 1~12
    day: 5,
    hour: 17,       // 24시간제, 오후 5시 30분 = 17
    minute: 30,
  },
  venueName: "더 파티움",
  venueLat: 37.5281813,
  venueLng: 126.922743,

  // 갤러리에 쓸 이미지 파일명 (assets 폴더에 넣어주세요). 9~15장 권장.
  galleryImages: [
    "assets/gallery/01.jpg", "assets/gallery/02.jpg", "assets/gallery/03.jpg",
    "assets/gallery/04.jpg", "assets/gallery/05.jpg", "assets/gallery/06.jpg",
    "assets/gallery/07.jpg", "assets/gallery/08.jpg", "assets/gallery/09.jpg",
  ],

  // 게스트 스냅 업로드는 구글 드라이브에 저장됩니다 (Google Apps Script 경유).
  // 아래에 Apps Script 배포 후 받은 "웹 앱 URL"을 넣으면 업로드 버튼이 활성화됩니다.
  // (README 3번 항목 참고)
  guestSnapUploadEndpoint: "https://script.google.com/macros/s/AKfycbwnEbbhX58UvPFC61uN9FGfkrasfmWkDD6kyhbp948hl3WM36abWymA4aEwMkxNkIIbyQ/exec",

  // 배경음악: 유튜브 영상 ID (워터마크/음원권리는 유튜브 업로더 기준을 따릅니다)
  bgmYoutubeId: "ZLIl-TDPZu0",

  // RSVP 응답을 실제로 받으려면 마찬가지로 엔드포인트가 필요합니다.
  // 간단하게는 Google Forms 응답 URL이나 자체 서버 API를 넣어주세요.
  rsvpSubmitEndpoint: "", // 예: "https://your-api.example.com/rsvp"

  // Google Forms로 RSVP를 받으려면 아래 두 값을 채워주세요.
  // 1) 구글폼 우측 상단 ⋮ → "미리보기" → 주소창 URL에서
  //    ".../viewform" 을 ".../formResponse" 로 바꾼 값을 googleFormActionUrl에 넣습니다.
  // 2) 각 문항의 name="entry.123456789" 값을 미리보기 페이지 소스보기(Ctrl+U)에서 찾아
  //    아래 entry ID에 채워주세요. (문항 4개: 성함/구분/참석여부/참석인원/메시지)
  // 이 값을 채우면 위 rsvpSubmitEndpoint보다 우선 사용됩니다.
  googleFormActionUrl: "https://docs.google.com/forms/u/0/d/e/1FAIpQLSer1XSQAVTsuZIL7wFLnfeSC0m4r_wV3lAXRHg28JZXFrHiGQ/formResponse",
  googleFormEntryIds: {
    name: "entry.483015973",      // 성함
    side: "entry.77029554",       // 구분(신랑측/신부측)
    attend: "entry.170954859",    // 참석 여부
    count: "entry.1051914485",    // 참석 인원
    message: "entry.1125615396",  // 전하실 말씀
  },
};

/* ============================================================
   유틸
   ============================================================ */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

/* ============================================================
   배경음악 토글 (유튜브 IFrame Player API)
   ============================================================ */
(function initSound() {
  const btn = $("#soundToggle");
  const mount = $("#yt-bgm");
  if (!btn || !mount || !CONFIG.bgmYoutubeId) return;

  let player = null;
  let playerReady = false;
  let wantsPlay = false; // 사용자가 재생 버튼을 눌렀는지 (플레이어 준비 전이어도 기억)

  // 유튜브 IFrame API는 비동기로 로드되며, 준비되면 전역 함수를 호출합니다.
  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player(mount, {
      videoId: CONFIG.bgmYoutubeId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        loop: 1,
        playlist: CONFIG.bgmYoutubeId, // loop=1일 때 단일 영상 반복을 위해 필요
        playsinline: 1,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => {
          playerReady = true;
          if (wantsPlay) player.playVideo();
        },
      },
    });
  };

  btn.addEventListener("click", () => {
    const playing = btn.getAttribute("aria-pressed") === "true";
    if (playing) {
      wantsPlay = false;
      if (playerReady) player.pauseVideo();
      btn.setAttribute("aria-pressed", "false");
    } else {
      wantsPlay = true;
      if (playerReady) player.playVideo();
      btn.setAttribute("aria-pressed", "true");
    }
  });
})();

/* ============================================================
   달력 생성 + 카운트다운
   ============================================================ */
(function initCalendar() {
  const { year, month, day, hour, minute } = CONFIG.wedding;
  const body = $("#calendarBody");
  if (!body) return;

  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=일
  const lastDate = new Date(year, month, 0).getDate();

  let html = "";
  let date = 1;
  for (let row = 0; row < 6 && date <= lastDate; row++) {
    html += "<tr>";
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col < firstDay) {
        html += "<td></td>";
      } else if (date > lastDate) {
        html += "<td></td>";
      } else {
        const isWed = date === day;
        html += `<td class="${isWed ? "wed-day" : ""}">${
          isWed
            ? `<span class="day-badge">${date}</span><span class="day-time">오후 5시 30분</span>`
            : date
        }</td>`;
        date++;
      }
    }
    html += "</tr>";
  }
  body.innerHTML = html;

  // 카운트다운
  const target = new Date(year, month - 1, day, hour, minute, 0).getTime();
  const elDays = $("#cdDays"), elHours = $("#cdHours"), elMinutes = $("#cdMinutes"), elSeconds = $("#cdSeconds");

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      elDays.textContent = "00"; elHours.textContent = "00";
      elMinutes.textContent = "00"; elSeconds.textContent = "00";
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    elDays.textContent = String(d).padStart(2, "0");
    elHours.textContent = String(h).padStart(2, "0");
    elMinutes.textContent = String(m).padStart(2, "0");
    elSeconds.textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
})();

/* ============================================================
   네이버 지도
   ============================================================ */
(function initNaverMap() {
  const el = $("#naverMap");
  if (!el) return;

  // 네이버 지도 SDK(maps.js)가 로드되지 않은 경우(키 오류, 네트워크 차단 등) 대비
  if (typeof naver === "undefined" || !naver.maps) {
    el.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#F3EEE4;color:#B79A66;font-size:13px;text-align:center;padding:12px;">지도를 불러오지 못했습니다.<br>네이버지도 버튼으로 확인해주세요.</div>`;
    return;
  }

  const position = new naver.maps.LatLng(CONFIG.venueLat, CONFIG.venueLng);
  const map = new naver.maps.Map(el, {
    center: position,
    zoom: 16,
    scrollWheel: false,
  });
  new naver.maps.Marker({
    position,
    map,
    title: CONFIG.venueName,
  });
})();

/* ============================================================
   갤러리 렌더 + 라이트박스
   ============================================================ */
(function initGallery() {
  const grid = $("#galleryGrid");
  if (!grid) return;

  grid.innerHTML = CONFIG.galleryImages.map((src, i) => `
    <div class="g-item" data-src="${src}">
      <img src="${src}" alt="웨딩 사진 ${i + 1}" loading="lazy"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
      <span class="g-fallback" style="display:none">사진 ${i + 1}</span>
    </div>
  `).join("");

  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");

  grid.addEventListener("click", (e) => {
    const item = e.target.closest(".g-item");
    if (!item) return;
    lightboxImg.src = item.dataset.src;
    lightbox.hidden = false;
  });
  $("#lightboxClose").addEventListener("click", () => (lightbox.hidden = true));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.hidden = true; });
})();

/* ============================================================
   혼주 연락처 토글
   ============================================================ */
(function initParentsToggle() {
  const btn = $("#parentsContactToggle");
  const panel = $("#parentsContacts");
  if (!btn || !panel) return;
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
  });
})();

/* ============================================================
   안내 탭 (포토부스 · 주차안내 · 답례품)
   ============================================================ */
(function initInfoTabs() {
  const tabs = $$(".info-tab");
  const panels = $$(".info-panel");
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach((p) => {
        p.hidden = p.dataset.panel !== target;
      });
    });
  });
})();

/* ============================================================
   계좌번호 복사
   ============================================================ */
(function initCopyButtons() {
  $$(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = "복사됨";
        setTimeout(() => (btn.textContent = original), 1500);
      } catch {
        alert(`계좌번호: ${text}`);
      }
    });
  });
})();

/* ============================================================
   게스트 스냅 업로드
   ============================================================ */
(function initGuestSnap() {
  const input = $("#snapInput");
  const drop = $("#snapDrop");
  const preview = $("#snapPreview");
  const submitBtn = $("#snapSubmit");
  const note = $("#snapNote");
  const nameInput = $("#snapName");
  const messageInput = $("#snapMessage");
  if (!input || !drop) return;

  let files = [];

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 결혼식 당일 0시부터 업로드 오픈. 주소 끝에 ?preview=1 을 붙이면
  // (본인 테스트용) 날짜와 상관없이 항상 열려 있는 상태로 미리 확인할 수 있음.
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";
  const uploadOpensAt = new Date(CONFIG.wedding.year, CONFIG.wedding.month - 1, CONFIG.wedding.day, 0, 0, 0);
  const isLocked = () => new Date() < uploadOpensAt && !isPreview;

  if (isLocked()) {
    drop.classList.add("locked");
    drop.addEventListener("click", (e) => e.preventDefault());
    note.textContent = "2026년 12월 5일부터 업로드가 가능합니다.";
  } else if (!CONFIG.guestSnapUploadEndpoint) {
    note.textContent = "현재는 미리보기만 가능합니다. 관리자가 업로드 주소를 연동하면 실제 업로드가 활성화됩니다.";
  }

  function renderPreview() {
    preview.innerHTML = files.map((f, i) => {
      const url = URL.createObjectURL(f);
      const isVideo = f.type.startsWith("video");
      return `
        <div class="p-thumb">
          ${isVideo ? `<video src="${url}" muted></video>` : `<img src="${url}" alt="" />`}
          <button type="button" class="p-remove" data-i="${i}" aria-label="삭제">×</button>
        </div>`;
    }).join("");
    submitBtn.disabled = files.length === 0 || !CONFIG.guestSnapUploadEndpoint || isLocked();
  }

  function addFiles(fileList) {
    if (isLocked()) return;
    files = files.concat(Array.from(fileList));
    renderPreview();
  }

  input.addEventListener("change", () => addFiles(input.files));

  ["dragover", "dragenter"].forEach((evt) =>
    drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.add("dragover"); })
  );
  ["dragleave", "drop"].forEach((evt) =>
    drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.remove("dragover"); })
  );
  drop.addEventListener("drop", (e) => {
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });

  preview.addEventListener("click", (e) => {
    const btn = e.target.closest(".p-remove");
    if (!btn) return;
    files.splice(Number(btn.dataset.i), 1);
    renderPreview();
  });

  function beforeUnloadGuard(e) {
    e.preventDefault();
    e.returnValue = "";
  }

  async function uploadOne(file, name, message) {
    const data = await fileToBase64(file);
    const res = await fetch(CONFIG.guestSnapUploadEndpoint, {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        data,
        name,
        message,
      }),
    });
    const json = await res.json().catch(() => null);
    return !!(json && json.ok);
  }

  submitBtn.addEventListener("click", async () => {
    if (isLocked() || !CONFIG.guestSnapUploadEndpoint || files.length === 0) return;
    submitBtn.disabled = true;
    const total = files.length;
    let done = 0;
    submitBtn.textContent = `업로드 중... (0/${total}) 창을 닫지 말아주세요`;
    window.addEventListener("beforeunload", beforeUnloadGuard);

    const name = nameInput ? nameInput.value.trim() : "";
    const message = messageInput ? messageInput.value.trim() : "";

    // 여러 장을 동시에 보내서(순차 X) 전체 대기 시간을 줄입니다.
    const results = await Promise.allSettled(
      files.map((file) =>
        uploadOne(file, name, message).then((ok) => {
          done++;
          submitBtn.textContent = `업로드 중... (${done}/${total}) 창을 닫지 말아주세요`;
          return ok;
        })
      )
    );
    const success = results.filter((r) => r.status === "fulfilled" && r.value).length;

    window.removeEventListener("beforeunload", beforeUnloadGuard);
    submitBtn.textContent = "업로드하기";
    note.textContent = `${success}/${total}개 업로드 완료. 소중한 순간 감사합니다 :)`;
    files = [];
    if (nameInput) nameInput.value = "";
    if (messageInput) messageInput.value = "";
    renderPreview();
  });
})();

/* ============================================================
   RSVP 모달
   ============================================================ */
(function initRSVP() {
  const openBtn = $("#rsvpOpen");
  const closeBtn = $("#rsvpClose");
  const modal = $("#rsvpModal");
  const form = $("#rsvpForm");
  const status = $("#rsvpStatus");
  if (!openBtn || !modal) return;

  openBtn.addEventListener("click", () => (modal.hidden = false));
  closeBtn.addEventListener("click", () => (modal.hidden = true));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

  // 페이지 접속 시 자동으로 한 번 띄우기 (같은 방문 세션에서는 반복되지 않도록)
  if (!sessionStorage.getItem("rsvpAutoShown")) {
    setTimeout(() => {
      modal.hidden = false;
      sessionStorage.setItem("rsvpAutoShown", "1");
    }, 1200);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const gf = CONFIG.googleFormActionUrl;
    const ids = CONFIG.googleFormEntryIds || {};

    // 1순위: Google Forms 연동
    if (gf && ids.name) {
      status.textContent = "전달 중...";
      try {
        const body = new URLSearchParams();
        if (ids.name) body.append(ids.name, data.name || "");
        if (ids.side) body.append(ids.side, data.side || "");
        if (ids.attend) body.append(ids.attend, data.attend || "");
        if (ids.count) body.append(ids.count, data.count || "");
        if (ids.message) body.append(ids.message, data.message || "");
        // Google Forms는 CORS 응답을 주지 않으므로 no-cors로 전송(응답 내용 확인 불가, 전송 자체는 됨)
        await fetch(gf, { method: "POST", mode: "no-cors", body });
        status.textContent = "전달되었습니다. 감사합니다!";
        form.reset();
      } catch {
        status.textContent = "전달에 실패했습니다. 잠시 후 다시 시도해주세요.";
      }
      return;
    }

    // 2순위: 자체 API 엔드포인트
    if (CONFIG.rsvpSubmitEndpoint) {
      status.textContent = "전달 중...";
      try {
        await fetch(CONFIG.rsvpSubmitEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        status.textContent = "전달되었습니다. 감사합니다!";
        form.reset();
      } catch {
        status.textContent = "전달에 실패했습니다. 잠시 후 다시 시도해주세요.";
      }
      return;
    }

    status.textContent = "전달 기능은 관리자가 연동을 완료하면 활성화됩니다. 마음만 감사히 받았습니다 :)";
  });
})();

/* ============================================================
   스크롤 리빌 애니메이션
   ============================================================ */
(function initReveal() {
  const targets = $$(".section, .divider");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((t) => t.classList.add("in-view"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach((t) => io.observe(t));
})();
