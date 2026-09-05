/**
 * 게스트 스냅 업로드 → 구글 드라이브 저장용 Apps Script
 *
 * 사용법 (README 3번 항목 참고):
 * 1. https://script.google.com 접속 → 새 프로젝트
 * 2. 기본 코드를 지우고 이 파일 내용 전체를 붙여넣기
 * 3. 우측 상단 "배포" → "새 배포" → 유형: "웹 앱"
 *    - 실행 계정: 나
 *    - 액세스 권한이 있는 사용자: 모든 사용자
 * 4. "배포" 클릭 → 권한 승인(구글 드라이브 접근 허용) → 웹 앱 URL 복사
 * 5. 그 URL을 script.js의 CONFIG.guestSnapUploadEndpoint 에 붙여넣기
 *
 * 실행되면 구글 드라이브에 "청첩장 게스트 스냅" 폴더가 자동으로 생기고,
 * 그 안에 사진/영상 파일과, 보낸 사람 성함·메시지가 정리된 스프레드시트가 함께 저장됩니다.
 */

var FOLDER_NAME = "청첩장 게스트 스냅";
var SHEET_FILE_NAME = "게스트 스냅 목록";

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var folder = getOrCreateFolder(FOLDER_NAME);

    var bytes = Utilities.base64Decode(body.data);
    var blob = Utilities.newBlob(bytes, body.mimeType || "application/octet-stream", body.filename || "upload");
    var file = folder.createFile(blob);

    var sheet = getOrCreateSheet(folder);
    sheet.appendRow([
      new Date(),
      body.name || "",
      body.message || "",
      file.getUrl(),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, url: file.getUrl() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder(name) {
  var it = DriveApp.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(name);
}

function getOrCreateSheet(folder) {
  var files = folder.getFilesByName(SHEET_FILE_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next()).getSheets()[0];
  }
  var ss = SpreadsheetApp.create(SHEET_FILE_NAME);
  var file = DriveApp.getFileById(ss.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file); // 내 드라이브 최상단에는 안 보이게, 폴더 안에만 있도록 정리
  var sheet = ss.getSheets()[0];
  sheet.appendRow(["시간", "성함", "메시지", "사진/영상 링크"]);
  return sheet;
}
