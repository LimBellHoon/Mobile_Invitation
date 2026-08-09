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

  // 갤러리에 쓸 이미지 파일명 (assets 폴더에 넣어주세요). 9~15장 권장.
  galleryImages: [
    "assets/gallery/01.jpg", "assets/gallery/02.jpg", "assets/gallery/03.jpg",
    "assets/gallery/04.jpg", "assets/gallery/05.jpg", "assets/gallery/06.jpg",
    "assets/gallery/07.jpg", "assets/gallery/08.jpg", "assets/gallery/09.jpg",
  ],

  // 게스트 스냅 업로드를 실제로 저장하려면, 파일을 받아줄 엔드포인트가 필요합니다.
  // (GitHub Pages는 정적 호스팅이라 서버 저장이 불가능합니다.)
  // 예: Cloudinary unsigned upload URL, Firebase Storage REST 엔드포인트, 직접 만든 업로드 서버 등.
  // 값을 채우면 업로드 버튼이 활성화되고, 비워두면 미리보기만 가능합니다.
  guestSnapUploadEndpoint: "", // 예: "https://api.cloudinary.com/v1_1/your-cloud/auto/upload"
  guestSnapUploadField: "file",
  guestSnapExtraFields: {}, // 예: { upload_preset: "wedding_unsigned" }

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
  googleFormActionUrl: "", // 예: "https://docs.google.com/forms/d/e/xxxxxxxx/formResponse"
  googleFormEntryIds: {
    name: "",     // 성함 문항의 entry.xxxxxxxxxx
    side: "",     // 구분(신랑측/신부측) 문항의 entry.xxxxxxxxxx
    attend: "",   // 참석 여부 문항의 entry.xxxxxxxxxx
    count: "",    // 참석 인원 문항의 entry.xxxxxxxxxx
    message: "",  // 전하실 말씀 문항의 entry.xxxxxxxxxx
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
  if (!input || !drop) return;

  let files = [];

  if (!CONFIG.guestSnapUploadEndpoint) {
    note.textContent = "현재는 미리보기만 가능합니다. 관리자가 클라우드 업로드 주소를 연동하면 실제 업로드가 활성화됩니다.";
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
    submitBtn.disabled = files.length === 0 || !CONFIG.guestSnapUploadEndpoint;
  }

  function addFiles(fileList) {
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

  submitBtn.addEventListener("click", async () => {
    if (!CONFIG.guestSnapUploadEndpoint || files.length === 0) return;
    submitBtn.disabled = true;
    submitBtn.textContent = "업로드 중...";
    let success = 0;
    for (const file of files) {
      const form = new FormData();
      form.append(CONFIG.guestSnapUploadField, file);
      Object.entries(CONFIG.guestSnapExtraFields).forEach(([k, v]) => form.append(k, v));
      try {
        const res = await fetch(CONFIG.guestSnapUploadEndpoint, { method: "POST", body: form });
        if (res.ok) success++;
      } catch {
        /* 네트워크 오류는 아래 결과 메시지로 안내 */
      }
    }
    submitBtn.textContent = "업로드하기";
    note.textContent = `${success}/${files.length}개 업로드 완료. 소중한 순간 감사합니다 :)`;
    files = [];
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
