# HYUNMIN LAB

강현민의 앱과 로봇 연구를 모은 무료 GitHub Pages 사이트.

- `index.html`: 홈
- `apps.html`: TopDF, MtoG, WinCtrlZoom 소개·다운로드·설치 안내
- `robotics.html`: 수중 ROV 시뮬레이터, VLA 학습, 시각 프런트엔드 소개
- `scripts/build.py`: 콘텐츠와 정적 HTML 생성. 수정 후 Python 3으로 실행
- `assets/style.css`: 반응형 스타일

## 로컬 실행

```sh
python3 scripts/build.py
python3 -m http.server 8080
```

http://localhost:8080 에서 확인합니다. 빌드 도구와 유료 서비스 없이도 생성된 HTML을 그대로 호스팅할 수 있습니다.

## 게시

GitHub Pages 설정에서 `main` 브랜치의 `/ (root)`를 선택합니다.
앱 설치 파일은 각 앱의 GitHub Releases에서 배포하며 사이트 저장소에는 넣지 않습니다.

## 콘텐츠 출처

2026-10-02 공개 README 및 릴리스 기준입니다.

- https://github.com/kanghyunmin-bot/topdf
- https://github.com/kanghyunmin-bot/MactoGalaxy
- https://github.com/kanghyunmin-bot/WinCtrlZoom
- https://github.com/kanghyunmin-bot/ROS2-mujoco-UUVsimulator
- https://github.com/kanghyunmin-bot/UUV-VINS-SLAM

로봇 이미지에는 원래 공개 저장소의 MuJoCo 렌더링 이미지를 연결합니다. 실로봇 성능이나 미검증 연구 결과를 입증한다고 주장하지 않습니다. 이미지 링크가 향후 변경되면 갱신하세요.

사이트 자체 코드와 문서는 MIT입니다. 앱 아이콘·연결된 연구 자료와 각 앱·연구 프로젝트에는 각각의 기존 라이선스가 적용됩니다. 사이트에는 사용자 분석, 광고, 계정 또는 입력 양식이 없습니다. 호스팅 제공자인 GitHub에는 별도의 개인정보 처리 정책이 적용됩니다.

## Liquid Glass

상단 고정 메뉴에 [liquidGL](https://github.com/naughtyduk/liquidGL)을 사용합니다. 단순한 CSS 블러에 더해 캡처한 페이지 배경의 굴절·색 분산·반사광과 포인터 반응을 GPU로 렌더링합니다. 렌더러의 CSS fallback에서는 광학 굴절 없이 반투명 스타일을 사용합니다. 실제 Safari·Firefox·실기기 성능은 별도 확인이 필요합니다.

- 고정 원본 커밋: `88f681ab7035fd55b04f63edff1841e32c4199e9`
- 코드: `assets/vendor/liquidGL.js` (원본 그대로)
- 고지: `assets/vendor/liquidGL-LICENSE.txt`
- 원본 소스는 MIT; upstream 데모 이미지·폰트·음악은 제외
- 페이지의 ‘유리 효과’ 버튼으로 GPU 효과를 켜거나 끌 수 있습니다.
- 투명도 감소 설정은 효과 기본 꺼짐, 모션 감소 설정은 반사광 애니메이션과 유체 반응을 끕니다.
