# GyeonggiPlaygrounds

- 경기도 어린이 놀이시설 정보 제공 사이트

## 🐿 Contents

- 각종 스크린샷 및 설명

## 🐪 Developers

- [유석환](https://github.com/youseokhwan), [강성호](https://github.com/KANGSUNGHO)

## 🐔 Languages & Frameworks

- HTML5, CSS3, Javascript
- jQuery, Bootstrap
- 로컬 Server: NodeJS
- 로컬 DB: MongoDB
- 공공 DB: [경기데이터드림](https://data.gg.go.kr)
  - [우수 어린이 놀이시설 현황](https://data.gg.go.kr/portal/data/service/selectServicePage.do?page=1&sortColumn=&sortDirection=&infId=Y003P77LUN0Y3O66N47612192869&infSeq=1)
  - [어린이 놀이시설 현황](https://data.gg.go.kr/portal/data/service/selectServicePage.do?page=1&sortColumn=&sortDirection=&infId=I6Y5W00421151P0RPW7Y12521845&infSeq=1)

## 🐖 Environment

- macOS Catalina 10.15.1
- Windows 10 1809
- Google Chrome으로만 개발 및 테스트하였습니다.
- 카카오맵은 localhost에서만 출력됩니다.

## 🐍 Usage

1. 다운로드
~~~
$ git clone https://github.com/gachon-mobile-web-project/GyeonggiPlaygrounds.git
~~~

2. 경기데이터드림에서 인증키 발급 후 코드 수정
~~~
// rotues/index.js
const apiKey = 'PUT YOUR API KEY HERE';
~~~

3. 서버 실행
~~~
$ cd web-project
$ npm start
~~~

4. Google Chrome 실행 후 http://<span></span>localhost:3000으로 접속

## 🦢 Copyright

- [경기데이터드림](https://data.gg.go.kr)
- [카카오맵 API](http://apis.map.kakao.com/)
- [Start Bootstrap - 'Agency' Template](https://startbootstrap.com/previews/agency/)
- [Font-awesome](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
- [배달의민족 글꼴](https://www.woowahan.com/#/fonts)
