const request = require('request');
const cheerio = require('cheerio');

let apiKey = 'apiKey';
let sigun_cd = '41310';

let apiUrl = `https://openapi.gg.go.kr/ChildPlayFacility?KEY=${apiKey}&SIGUN_CD=${sigun_cd}&pSize=5`;

request.get({ url: apiUrl }, function(err, res, body) {
	let $ = cheerio.load(body);
	let arr = $('ChildPlayFacility').children('row').children('PLAY_FACLT_NM');
	
	// arr.prevObject[0].children[x]
	// 3: sigun_nm - 시군명
	// 5: sigun_cd - 시군코드
	// 9: play_faclt_nm - 놀이시설명
	// 13: instl_plc - 설치장소
	// ...
	// 27: 위도 / 25: 경도
	
	for(let i = 0; i < arr.prevObject.length; i++) {
		console.log(`${i+1}번째 장소 이름: ${arr.prevObject[i].children[9].children[0].data}`);
		console.log(`위도, 경도: ${arr.prevObject[i].children[27].children[0].data}, ${arr.prevObject[i].children[25].children[0].data}`);
		console.log('----------------------');
	}
});
