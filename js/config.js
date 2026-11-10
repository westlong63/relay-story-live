/* Relay Story Live · 설정 (배포하는 사람이 처음 한 번만 고칩니다)
   Firebase 콘솔 → 프로젝트 설정 → 내 앱 → 웹 앱의 firebaseConfig 내용을 아래 firebase: 자리에 붙여 넣으세요.
   비워 두면(null) 시연 모드만 쓸 수 있어요. 자세한 방법은 README.md (배포·수업 안내서)를 보세요. */
window.RSL_CONFIG = {
  /* 모든 화면 아래에 나오는 개발 표시 */
  credit: "중앙대학교 영어교육과 · 이진화 교수 | 영어교과교육과정 프로젝트로 개발된 프로그램입니다.",
  firebase: {
    apiKey: "AIzaSyCREA2pYbXTHu6VOLjqfmUuuj9WEWOsQWY",
    authDomain: "sinseomid.firebaseapp.com",
    databaseURL: "https://sinseomid-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sinseomid",
    storageBucket: "sinseomid.firebasestorage.app",
    messagingSenderId: "555427085120",
    appId: "1:555427085120:web:02c6958a6afcf128b5d8a5",
  },
  /* 예시:
  firebase: {
    apiKey: "AIza...",
    authDomain: "my-relay-story.firebaseapp.com",
    databaseURL: "https://my-relay-story-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "my-relay-story",
    appId: "1:1234567890:web:abcdef",
  },
  */
};
