# 코드 봇

## 설명

다양한 프로그래밍 언어의 코드를 실행할 수 있는 디스코드 봇

## 설치

1. 이 저장소를 복제합니다.
2. 종속성 설치: `npm install`
3. 환경 파일 만들기:
    * Discord 봇 토큰을 포함하는 `.env`라는 파일을 만듭니다.
    * 선택적으로 개발 환경 변수를 위한 `.env.dev`라는 파일을 만듭니다.
4. 개발 모드에서 봇 실행: `npm run dev` (nodemon 전역적으로 설치되어 있어야 함)
5. 프로덕션 모드에서 봇 실행: `npm run start` (pm2 전역적으로 설치되어 있어야 함)

## 사용법

[help.md](help.md) 참고.

## 추가 정보

* 봇은 pm2 프로세스 관리자를 사용하여 봇을 시작하고 중지합니다.
* help.md 파일을 편집하여 도움말 메시지를 사용자 지정할 수 있습니다.

## .env 및 .env.dev 형식

다음 형식으로 `.env` 및 `.env.dev` 파일을 만들어야 합니다.

```
token=<your_bot_token>
clientId=<your_bot_clientId>
```

**설명:**

* `token`: Discord 봇 토큰
* `clientId`: Discord 봇 클라이언트 ID

**주의:**

* `.env` 파일은 버전 관리 시스템에 포함하지 않도록 주의하십시오.
* `.env.dev` 파일은 개발 환경에서만 사용해야 합니다.

## 참조
- https://tio.run/
- https://github.com/AviFS/tio-api