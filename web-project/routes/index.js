const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const router = express.Router();

let apiKey = 'apiKey'; // 경기데이터드림에서 발급된 apiKey

// 우수 어린이 놀이시설 정보 가져오기
let bestFacilities = [];
let bestApiUrl = 'https://openapi.gg.go.kr/ExcellenceChildPlayFaciliti'
                  +`?KEY=${apiKey}`;

request.get({ url: bestApiUrl }, function(err, res, body) {
  let $ = cheerio.load(body);
  let arr = $('ExcellenceChildPlayFaciliti').children('row').children('FACLT_NM');

  /*
    도로명 주소를 우선적으로 가져오되, 없으면 지번 주소를 가져오고
    그마저도 없으면 공백으로 대체
  */
  let getAddr = function(i) {
    try {
      return arr.prevObject[i].children[17].children[0].data;
    } catch(error) {
      console.log('도로명 주소가 등록되지 않아 지번 주소로 대체');
      try {
        return arr.prevObject[i].children[15].children[0].data;
      } catch(error) {
        console.log('지번 주소도 등록되지 않아 공백으로 대체');
        return '';
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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: '어린이 놀이시설 정보',
    bestFacilities : bestFacilities  // 우수 어린이 놀이시설 리스트
  });
});

module.exports = router;
