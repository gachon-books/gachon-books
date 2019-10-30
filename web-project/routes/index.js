const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const router = express.Router();

let apiKey = 'apiKey';  // 경기데이터드림에서 발급된 apiKey, GitHub 올리기 전에 반드시 지우기

// 우수 어린이 놀이시설 정보 가져오기
let bestFacilities = [];
let bestApiUrl = 'https://openapi.gg.go.kr/ExcellenceChildPlayFaciliti'
                  +`?KEY=${apiKey}`;

request.get({ url: bestApiUrl }, function(err, res, body) {
  let $ = cheerio.load(body);
  let arr = $('ExcellenceChildPlayFaciliti').children('row').children('FACLT_NM');

  for(let i = 0; i < arr.prevObject.length; i++) {
    let facility = {
      'cityName' : arr.prevObject[i].children[3].children[0].data,   // 시군 이름
      'cityCode' : arr.prevObject[i].children[5].children[0].data,   // 시군 코드
      'name'     : arr.prevObject[i].children[7].children[0].data,   // 놀이시설 이름
      'tel'      : arr.prevObject[i].children[13].children[0].data,  // 전화번호
      // 'addr'     : arr.prevObject[i].children[17].children[0].data,  // 도로명 주소
      // 'zipCode'  : arr.prevObject[i].children[19].children[0].data,  // 우편번호
      // 'logt'     : arr.prevObject[i].children[21].children[0].data,  // 경도
      // 'lat'      : arr.prevObject[i].children[23].children[0].data   // 위도
    };
    bestFacilities.push(facility);
  }
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: '어린이 놀이시설 정보',
    bestFacilities : bestFacilities  // 우수 어린이 놀이시설 리스트
  });
});

module.exports = router;
