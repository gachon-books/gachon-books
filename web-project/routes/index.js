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

// 전체 놀이시설 정보
let facilities = [];

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
  let sigun_nm = req.query.sigun_nm;
  let sigun_cd = req.query.sigun_cd;
  console.log(`sigun_nm: ${sigun_nm}`);
  console.log(`sigun_cd: ${sigun_cd}`);

  // html 태그와 head 태그
  let htmlstream = fs.readFileSync(__dirname + '/../views/htmlhead.ejs', 'utf8');

  // 로그인했을 경우 로그인 전용 navbar 출력하도록 하는 코드(login 대신 logout, mypage 등)
  // {
  //   ...
    htmlstream += fs.readFileSync(__dirname + '/../views/navbar.ejs', 'utf8');
  // }

  // modal로 구현된 로그인 폼과 회원가입 폼
  htmlstream += fs.readFileSync(__dirname + '/../views/userform.ejs', 'utf8');

  // 우수 놀이시설
  htmlstream += fs.readFileSync(__dirname + '/../views/bestfacility.ejs', 'utf8');

  // 각 지역 놀이시설
  htmlstream += fs.readFileSync(__dirname + '/../views/search.ejs', 'utf8');

  /*
    이 부분 동기처리해야함
    데이터는 잘 불러오는데 새로고침 한 두번 해야됨
    +) 시군코드 정보 DB화 해서 해야할 듯(일단 시군코드 일일히 넣고 실행)
  */
  // 시군로고를 클릭했을 경우 시설의 list와 해당 시설의 info 출력
  if(sigun_cd != 'undefined') {
    // 공공 DB에서 전체 놀이시설 정보 받아오기
    let apiUrl = `https://openapi.gg.go.kr/ChildPlayFacility?KEY=${apiKey}&SIGUN_CD=${sigun_cd}`;
    request.get({ url: apiUrl }, function(err, res, body) {
      let $ = cheerio.load(body);
      let arr = $('ChildPlayFacility').children('row').children('PLAY_FACLT_NM');

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
        // console.log(facility);
      }
    });
  }
  htmlstream += fs.readFileSync(__dirname + '/../views/facilityinfo.ejs', 'utf8');

  // 개발자 소개 및 Contact U
  htmlstream += fs.readFileSync(__dirname + '/../views/teamcontact.ejs', 'utf8');

  // footer 및 script 태그
  htmlstream += fs.readFileSync(__dirname + '/../views/footer.ejs', 'utf8');
  res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});

  res.end(ejs.render(htmlstream, {
    title: '어린이 놀이시설 정보',
    bestFacilities : bestFacilities,  // 우수 어린이 놀이시설 리스트
    sigun_nm : sigun_nm,
    facilities : facilities // 전체 어린이 놀이시설 리스트
  }));
});

module.exports = router;
