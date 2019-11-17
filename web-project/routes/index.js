const fs = require('fs');
const ejs = require('ejs');
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const passport = require('passport');
const session = require('express-session');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

/*
  경기데이터드림(https://data.gg.go.kr/)에서 발급받은 인증키입니다.
*/
const apiKey = 'apiKey';

/*
  [경기데이터드림 - 우수 어린이 놀이시설 현황]
  '우수 어린이 놀이시설' 공공 DB에서 정보를 받아 파싱하는 작업입니다.
  데이터가 10개 미만이기 때문에 특별한 요청값 없이 모두 호출합니다.
*/
let bestFacilities = [];
let bestApiUrl = `https://openapi.gg.go.kr/ExcellenceChildPlayFaciliti?KEY=${apiKey}`;

// request 모듈을 통해 공공 데이터 호출
request.get({ url: bestApiUrl }, function(err, res, body) {
  let $ = cheerio.load(body);
  let arr = $('ExcellenceChildPlayFaciliti').children('row').children('FACLT_NM');

  // 도로명 주소가 등록되지 않은 시설의 경우 지번 주소를 가져옴
  // 지번 주소도 없을 경우 대체 텍스트로 초기화
  let getAddr = function(i) {
    try {
      return arr.prevObject[i].children[17].children[0].data;
    } catch(error) {
      try {
        return arr.prevObject[i].children[15].children[0].data;
      } catch(error) {
        return '등록된 주소가 없음';
      }
    }
  };

  // 각 놀이시설을 객체로 초기화하여 bestFacilities 리스트에 저장
  for(let i = 0; i < arr.prevObject.length; i++) {
    let facility = {
      'cityName' : arr.prevObject[i].children[3].children[0].data,   // 시군 이름
      'cityCode' : arr.prevObject[i].children[5].children[0].data,   // 시군 코드
      'name'     : arr.prevObject[i].children[7].children[0].data,   // 놀이시설 이름
      'tel'      : arr.prevObject[i].children[13].children[0].data,  // 전화번호
      'addr'     : getAddr(i),                                       // 주소
      'logt'     : arr.prevObject[i].children[21].children[0].data,  // 경도
      'lat'      : arr.prevObject[i].children[23].children[0].data   // 위도
    };
    bestFacilities.push(facility);
  }
});

/*
  [메인 페이지] / (GET)
  1 이 프로젝트의 메인 페이지입니다.
  2 htmlstream 변수에 ejs 파일들을 덧붙힌 후 ejs.render로 출력합니다.
  3 로그인 된 경우와 아닌 경우는 if문을 통해 처리합니다. (navbar, 유저 정보 등)
  4 저장된 '우수 어린이 놀이시설' 정보를 출력합니다.
  5 시/군 목록을 선택할 수 있고, 각 시/군에 해당하는 놀이시설 목록은 POST 작업(ajax)을 통해 별도로 처리합니다.
  6 로그인 폼, 회원가입 폼, 회원정보수정 폼을 모두 포함하고 있습니다. (usermodal.ejs)
    각 post 요청을 처리하는 모듈은 별도 js 파일로 분리했습니다.
*/
router.get('/', function(req, res, next) {
  // 현재 유저의 정보 저장
  let currentUser = req.session.user;

  // html 선언과 css를 포함한 <head> 태그
  let htmlstream = fs.readFileSync(__dirname + '/../views/htmlhead.ejs', 'utf8');

  // title 화면(대문)
  htmlstream += fs.readFileSync(__dirname + '/../views/title.ejs', 'utf8');

  // 로그인 된 상태일 경우 authNavbar.ejs를 출력하고,
  // 로그인되지 않은 상태일 경우 navbar.ejs를 출력함
  if(currentUser !== undefined)
    htmlstream += fs.readFileSync(__dirname + '/../views/authNavbar.ejs', 'utf8');
  else
    htmlstream += fs.readFileSync(__dirname + '/../views/navbar.ejs', 'utf8');

  // 로그인 모달, 회원가입 모달, 회원정보수정 모달, 즐겨찾기 모달
  htmlstream += fs.readFileSync(__dirname + '/../views/usermodals.ejs', 'utf8');

  // 우수 어린이 놀이시설 정보, 시/군 목록, 해당 시/군 어린이 놀이시설 목록 출력 및 상세 정보 조회
  htmlstream += fs.readFileSync(__dirname + '/../views/bestfacility.ejs', 'utf8');
  htmlstream += fs.readFileSync(__dirname + '/../views/search.ejs', 'utf8');
  htmlstream += fs.readFileSync(__dirname + '/../views/facilityinfo.ejs', 'utf8');

  // 개발자 소개, Contact Us
  htmlstream += fs.readFileSync(__dirname + '/../views/teamcontact.ejs', 'utf8');

  // footer와 js를 포함한 <body> 및 <html> 태그 종료
  htmlstream += fs.readFileSync(__dirname + '/../views/footer.ejs', 'utf8');
  res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

  // 로그인 상태일 경우 유저 정보를 저장하여 render하고
  // 로그인 상태가 아닐 경우 유저 정보를 포함하지 않고 render
  if(currentUser !== undefined) {
    res.end(ejs.render(htmlstream, {
      title: '경기도 어린이 놀이시설 정보',
      bestFacilities : bestFacilities,  // 우수 어린이 놀이시설 리스트
      icons : ["far fa-laugh-wink", "fas fa-child", "fas fa-gifts", "fab fa-angellist", "fas fa-cocktail", "fas fa-candy-cane"], // 우수 놀이시설 리스트 아이콘
      user: currentUser  // 유저 정보
    }));
  }
  else {
    res.end(ejs.render(htmlstream, {
      title: '경기도 어린이 놀이시설 정보',
      bestFacilities : bestFacilities,  // 우수 어린이 놀이시설 리스트
      icons : ["far fa-laugh-wink", "fas fa-child", "fas fa-gifts", "fab fa-angellist", "fas fa-cocktail", "fas fa-candy-cane"], // 우수 놀이시설 리스트 아이콘
      user: { _id: 'undefined', id: 'undefined', password: 'undefined', name: 'undefined', address: 'undefined' }
    }));
  }
});

/*
  [시/군 놀이시설 목록 및 상세 정보 조회] / (POST)
  1 시/군 로고를 클릭하면 ajax를 통해 호출됩니다. (/public/custom.js의 getList() 메소드 참조)
  2 시/군 코드와 페이지네이션의 페이지를 요청 인자에 넣어 '어린이 놀이시설' 공공 DB에서 정보를 가져옵니다.
  3 놀이시설 목록과 각 놀이시설의 상세 정보를 비동기로 전달합니다.
*/
router.post('/', function(req, res) {
  // 요청할 시/군 정보와 페이지 넘버를 가져옴
  let sigun_nm = req.body.sigun_nm;
  let sigun_cd = req.body.sigun_cd;
  let currentPage = req.body.currentPage;
  console.log(`시군이름: ${sigun_nm}, 시군코드: ${sigun_cd}, 페이지: ${currentPage}`);
  
  /*
    [경기데이터드림 - 어린이 놀이시설 현황]
    '어린이 놀이시설' 공공 DB에서 정보를 받아 파싱하는 작업입니다.
    시/군 코드와 페이지를 요청 값으로 전달하여 놀이시설을 20개씩 받아옵니다.
  */
  let totalCount, lastPage;
  let facilities = [];
  let apiUrl = `https://openapi.gg.go.kr/ChildPlayFacility?KEY=${apiKey}&SIGUN_CD=${sigun_cd}&pSize=20&pIndex=${currentPage}`;
  
  request.get({ url: apiUrl }, function(err, res, body) {
    let $ = cheerio.load(body);
    let arr = $('ChildPlayFacility').children('row').children('PLAY_FACLT_NM');

    // 전체 놀이시설 개수 추출 및 마지막 페이지 번호 계산
    totalCount = String($('ChildPlayFacility').children('list_total_count').prevObject.children('list_total_count'));
    totalCount = parseInt(totalCount.substring(18, totalCount.length-19));
    lastPage = parseInt(totalCount / 20);
    if(totalCount % 20 != 0)
      lastPage++;
    console.log(`totalCount: ${totalCount}, lastPage: ${lastPage}`);

    // 재호출을 대비하여 목록을 초기화
    facilities = [];
    
    // 도로명 주소가 등록되지 않은 시설의 경우 지번 주소를 가져옴
    // 지번 주소도 없을 경우 대체 텍스트로 초기화
    let getAddr = function(i) {
      try {
        return arr.prevObject[i].children[21].children[0].data;
      }
      catch(error) {
        try {
          return arr.prevObject[i].children[19].children[0].data;
        }
        catch(error) {
          return '등록된 주소가 없음';
        }
      }
    };
    
    // 각 놀이시설을 객체로 초기화하여 facilities 리스트에 저장
    for(let i = 0; i < arr.prevObject.length; i++) {
      let facility = {
        'cityName'  : arr.prevObject[i].children[3].children[0].data,    // 시군 이름
        'no'        : arr.prevObject[i].children[7].children[0].data,    // 놀이시설 코드
        'name'      : arr.prevObject[i].children[9].children[0].data,    // 놀이시설 이름
        'buildDay'  : arr.prevObject[i].children[11].children[0].data,   // 건축 날짜
        'inoutType' : arr.prevObject[i].children[17].children[0].data,   // 실내외 구분
        'addr'      : getAddr(i),                                        // 도로명 주소 혹은 지번 주소
        'logt'      : arr.prevObject[i].children[25].children[0].data,   // 경도
        'lat'       : arr.prevObject[i].children[27].children[0].data,   // 위도
      };
      facilities.push(facility);
    }
  });

  // 애니메이션을 위한 비동기 출력
  setTimeout(function() {
    var responseData = {
      'result': 'ok',
      'facilities': facilities,
      'totalCount': totalCount,
      'currentPage': currentPage,
      'lastPage': lastPage
    };

    res.json(responseData);
  }, 1500);
});

module.exports = router;
