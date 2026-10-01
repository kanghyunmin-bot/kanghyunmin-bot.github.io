# HYUNMIN LAB

강현민의 로봇 연구를 중심으로, 필요에 따라 만든 앱을 부가 프로젝트로 소개하는 무료 GitHub Pages 사이트.

- `index.html`: 로봇 중심 소개·탐색/연결/실험 정체성·부가 프로젝트
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

## 정체성

로봇이 중심이고 앱은 부가 프로젝트입니다. 이름의 이니셜 대신 탐색·연결·실험의 세 점 심볼을 사용합니다. 자세한 내용은 [IDENTITY.md](IDENTITY.md)를 확인하세요.

## 인터랙티브 지상 로봇 홈

Three.js로 직접 만든 바퀴·팔·카메라·라이다 콘셉트가 화면에 표시됩니다. GSAP ScrollTrigger가 스크롤에 따라 구조와 시점을 전환하고, 인식·제어·학습 선택에 따라 시야·연결망을 바꿉니다. 연구 선택은 설명과 실제 공개 저장소 링크를 갱신하며, 부가 앱은 별도 3D 패널로 표시합니다. Lenis는 데스크톱의 부드러운 스크롤에 사용합니다.

- `templates/home.html`: 홈의 의미 있는 HTML, 링크와 콘텐츠
- `assets/robot-world.js`: 절차적 지상 로봇과 Three.js 장면
- `assets/immersive.css`: 몰입형 홈 스타일
- `assets/vendor/libraries.json`: 고정 버전과 npm 원본 tarball의 검증된 integrity
- `INTERACTIVE_RESOURCES.md`: 예제·소스 모음 링크

Three.js·Lenis는 MIT입니다. **GSAP은 자체 Standard No Charge License**이며 고지와 원본 라이선스를 `assets/vendor/gsap-LICENSE.txt`에 보존합니다. 이 사이트는 애니메이션 편집기나 시각적 빌더가 아닌 포트폴리오입니다. 라이브러리를 CDN에서 실행하지 않고 해당 저장소에서 직접 제공합니다.

움직임 감소 설정에서는 자동 움직임과 부드러운 스크롤을 끄며, 움직임 버튼으로 자동 애니메이션을 중지할 수 있습니다. 탭이 숨겨지면 렌더링을 쉬고 모바일 픽셀 비율을 제한합니다. WebGL 불가 환경에서는 자체 SVG 포스터와 HTML 콘텐츠를 제공합니다. 특정 브라우저·실기기의 프레임률은 별도 검증이 필요합니다.

홈은 지상 로봇으로 표현하며 로봇과 VLA의 지상·수중·공중 확장을 지향합니다. 공개 연구의 실제 범위와 계획을 별도로 표시합니다. 3D 애니메이션은 실제 물리 시뮬레이션이나 정책 추론 결과가 아닙니다.
