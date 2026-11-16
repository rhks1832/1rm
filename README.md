# 1RM 추정표

든 무게와 횟수만 입력하면 추정 1RM과 1~10회 중량표를 보여주는 웹앱입니다. (React + Vite, 외부 CDN·서버 없음)

- 추정식: Epley — 무게 × (1 + 횟수 ÷ 30), 1회면 든 무게 그대로
- 입력값은 브라우저 localStorage에만 저장됩니다.

## 실행
```bash
npm install
npm run dev      # 개발
npm run build    # dist/ 생성
```

## 배포
### GitHub Pages
1. 새 저장소를 만들고 이 폴더를 `main` 브랜치에 push
2. 저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 선택
3. push 할 때마다 `.github/workflows/deploy.yml` 이 자동 배포합니다 → `https://<아이디>.github.io/<저장소>/`

### Vercel
저장소를 Import 하면 설정 없이 배포됩니다 (Framework: Vite).

## 설정
`src/config.js` 에서 링크를 바꿉니다.
- `INSTAGRAM_URL` / `INSTAGRAM_HANDLE` : 인스타그램 팔로우 버튼
- `INQUIRY_FORM_URL` : 온라인 PT 문의 구글폼 주소 (비워 두면 문의 버튼이 숨겨집니다)

## 설정
`src/config.js` 에서 마지막 화면 버튼 링크를 바꿉니다. 빈 문자열(`''`)이면 해당 버튼은 보이지 않습니다.
- `INSTAGRAM_URL` : 인스타그램 팔로우 버튼
- `INQUIRY_URL` : 온라인 PT 문의(구글폼) 버튼 — **주소를 넣어야 버튼이 나타납니다**
