const fs = require('fs');
const ejs = require('ejs');
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const session = require('express-session');
const router = express.Router();

let apiKey = 'apiKey'; // 경기데이터드림에서 발급된 apiKey

// 우수 놀이시설 정보
let bestFacilities = [];
let bestApiUrl = `https://openapi.gg.go.kr/ExcellenceChildPlayFaciliti?KEY=${apiKey}`;

// 공공 DB에서 우수 놀이시설 정보 받아오기
request.get({ url: bestApiUrl }, function(err, res, body) {
  let $ = cheerio.load(body);
  let arr = $('ExcellenceChildPlayFaciliti').children('row').children('FACLT_NM');

  // 도로명 주소 혹은 지번 주소 가져오기
  let getAddr = function(i) {
    try {
      return arr.prevObject[i].children[17].children[0].data;
    } catch(error) {
      // console.log(`'${arr.prevObject[i].children[7].children[0].data}'의 도로명 주소가 등록되지 않아 지번 주소로 대체`);
      try {
        return arr.prevObject[i].children[15].children[0].data;
      } catch(error) {
        // console.log(`'${arr.prevObject[i].children[7].children[0].data}'의 지번 주소가 등록되지 않아 텍스트로 대체`);
        return '등록된 주소가 없음';
      }
    }
  };

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
    // console.log(facility);
  }
});

router.get('/', function(req, res, next) {
  console.log(`req.session.auth: ${req.session.auth}`);

  // Header, Navbar
  let htmlstream = fs.readFileSync(__dirname + '/../views/htmlhead.ejs', 'utf8');
  htmlstream += fs.readFileSync(__dirname + '/../views/title.ejs', 'utf8');
  if(req.session.auth == 99)  // 로그인한 상태
    htmlstream += fs.readFileSync(__dirname + '/../views/authNavbar.ejs', 'utf8');
  else  // 로그인되지 않은 상태
    htmlstream += fs.readFileSync(__dirname + '/../views/navbar.ejs', 'utf8');
  htmlstream += fs.readFileSync(__dirname + '/../views/userform.ejs', 'utf8');

  // 놀이시설 정보
  htmlstream += fs.readFileSync(__dirname + '/../views/bestfacility.ejs', 'utf8');
  htmlstream += fs.readFileSync(__dirname + '/../views/search.ejs', 'utf8');
  htmlstream += fs.readFileSync(__dirname + '/../views/facilityinfo.ejs', 'utf8');

  // Footer 및 Scripts
  htmlstream += fs.readFileSync(__dirname + '/../views/teamcontact.ejs', 'utf8');
  htmlstream += fs.readFileSync(__dirname + '/../views/footer.ejs', 'utf8');
  res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

  res.end(ejs.render(htmlstream, {
    title: '어린이 놀이시설 정보',
    bestFacilities : bestFacilities,  // 우수 어린이 놀이시설 리스트
    name: req.session.name
  }));
  
});

router.post('/', function(req, res) {
  let sigun_nm = req.body.sigun_nm;
  let sigun_cd = req.body.sigun_cd;
  let currentPage = req.body.currentPage;
  // console.log(`시군이름: ${sigun_nm}, 시군코드: ${sigun_cd}, 페이지: ${currentPage}`);
  
  // 공공 DB에서 전체 놀이시설 정보 받아오기
  let totalCount, lastPage;
  let facilities = [];
  let apiUrl = `https://openapi.gg.go.kr/ChildPlayFacility?KEY=${apiKey}&SIGUN_CD=${sigun_cd}&pSize=20&pIndex=${currentPage}`;
  
  request.get({ url: apiUrl }, function(err, res, body) {
    let $ = cheerio.load(body);
    let arr = $('ChildPlayFacility').children('row').children('PLAY_FACLT_NM');

    // 전체 놀이시설 개수 추출 및 마지막 페이지 번호 계산하기
    totalCount = String($('ChildPlayFacility').children('list_total_count').prevObject.children('list_total_count'));
    totalCount = parseInt(totalCount.substring(18, totalCount.length-19));
    lastPage = parseInt(totalCount / 20);
    if(totalCount % 20 != 0)
      lastPage++;
    console.log(`totalCount: ${totalCount}, lastPage: ${lastPage}`);

    facilities = []; // 초기화
    
    // 도로명 주소 혹은 지번 주소 가져오기
    // { ... }
    
    for(let i = 0; i < arr.prevObject.length; i++) {
      let facility = {
        'test' : arr.prevObject[i].children[9].children[0].data
        // 'cityName' : arr.prevObject[i].children[3].children[0].data,   // 시군 이름
        // 'cityCode' : arr.prevObject[i].children[5].children[0].data,   // 시군 코드
        // 'name'     : arr.prevObject[i].children[7].children[0].data,   // 놀이시설 이름
        // 'tel'      : arr.prevObject[i].children[13].children[0].data,  // 전화번호
        // 'addr'     : getAddr(i),                                       // 주소
        // 'logt'     : arr.prevObject[i].children[21].children[0].data,  // 경도
        // 'lat'      : arr.prevObject[i].children[23].children[0].data   // 위도
      };
      facilities.push(facility);
      // console.log(`facility: ${facility.test}`);
    }
  });

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
