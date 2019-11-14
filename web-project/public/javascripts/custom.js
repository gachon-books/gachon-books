$(function() {
    // tooltip 초기화
    $('[data-toggle="tooltip"]').tooltip();

    // 로그인 창이 닫힐 때 input에 입력된 내용을 삭제
    $('#login-modal').on('hidden.bs.modal', function () {
        $('#loginid').val('');
        $('#loginpw').val('');
    });

    // 회원가입 창이 닫힐 때 input에 입력된 내용을 삭제
    $('#signup-modal').on('hidden.bs.modal', function () {
        $('#signupid').val('');
        $('#signuppw').val('');
        $('#signuppw2').val('');
        $('#signupname').val('');
        $('#signuplocation').val('');
    });

    // 회원정보수정 창이 닫힐 때 input에 입력된 내용을 삭제
    $('#update-modal').on('hidden.bs.modal', function () {
        $('#updatepw').val('');
        $('#updatepw2').val('');
        $('#updatename').val('');
        $('#updatelocation').val('');
    });

    // 처음 진입하면 카테고리 선택 안내 문구를 출력
    $('#collapse-usage').collapse('show');

    // 지역 카테고리를 선택하면 다른 지역 카테고리와 안내 문구는 안보이도록 설정
    $('#collapseBtn1').on('click', function() {
        $('#collapse2').collapse('hide');
        $('#collapse3').collapse('hide');
        $('#closeUsage').trigger('click');
    });

    $('#collapseBtn2').on('click', function() {
        $('#collapse1').collapse('hide');
        $('#collapse3').collapse('hide');
        $('#closeUsage').trigger('click');
    });

    $('#collapseBtn3').on('click', function() {
        $('#collapse1').collapse('hide');
        $('#collapse2').collapse('hide');
        $('#closeUsage').trigger('click');
    });

    // ajax를 통한 놀이시설 목록 출력(post, '/')
    let getList = function(sigun_nm, sigun_cd, page) {
        $('.collapse').collapse('hide');

        setTimeout(function() {
            $('#btnList').trigger('click');
        }, 500);

        $('#listScroll').text('');
        $('#pagination').text('');
        $('#listTitle').text(`${sigun_nm} 놀이시설 목록 `);
        $('#listTitle').append(`<span class="badge badge-success" id="totalCountBadge"></span>`);
        $('#loading').show();

        setTimeout(function() {
            $('#facility-list').collapse('show');
        }, 500);

        // ajax 통신
        var data = {
            'sigun_nm': sigun_nm,
            'sigun_cd': sigun_cd,
            'currentPage': page
        };
        data = JSON.stringify(data);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/');
        xhr.setRequestHeader('Content-type', "application/json");
        xhr.send(data);
        
        // 데이터 수신 완료되면 실행
        xhr.addEventListener('load', function() {
            var result = JSON.parse(xhr.responseText);
            
            if(result.result !== 'ok')
                return;

            $('#totalCountBadge').text(`${result.totalCount}`);
            $('#loading').hide();

            if(result.facilities.length == 0)
                $('#listScroll').text(`${sigun_nm}에 등록된 어린이 놀이시설이 없습니다.`);
            else {
                result.facilities.forEach(function(item, index) {
                    $('#listScroll').append(
                        `<div class="col-md-6 d-flex listElement">
                            <p class="mr-auto my-auto font-weight-bold text-truncate">${item.name}</p>
                            <button class="btn btn-sm btn-outline-success pull-right moreBtn" index="${index}" data-toggle="modal" data-target="#info-modal">more</button>
                        </div>`
                    );
                });
            }

            $('.moreBtn').on('click', function() {
                let index = Number($(this).attr('index'));
                let item = result.facilities[index];

                // $('#info-img').attr('src', `img/sigun_logo/${item.cityName}.jpg`);
                $('#info-name').val(`[#${item.no}] ${item.name}`);
                $('#info-inoutType').val(`${item.inoutType}`);
                $('#info-buildDay').val(`${item.buildDay}`);
                $('#info-addr').val(`${item.addr}`);

                // 지도 구현(카카오맵 API)
                setTimeout(function() {
                    // 지도 컨테이너
                    let container = document.getElementById('map'),
                        options = {
                            center: new kakao.maps.LatLng(item.lat, item.logt),
                            draggable: false,
                            level: 3
                        };

                    // 해당 위치에 지도 그리기
                    let map = new kakao.maps.Map(container, options);

                    // 마커 표시하기
                    let marker = new kakao.maps.Marker({ 
                        position: map.getCenter() 
                    }); 
                    marker.setMap(map);
                }, 500);
            });

            /*
                페이지네이션 구현
            */
            // '처음' 페이지 추가
            $('#pagination').append(
                `<li class="page-item"><a class="page-link" style="font-weight: bold">처음</a></li>`
            );
            
            // 등록된 놀이시설이 없을 경우
            if(result.lastPage == 0) {
                $('#pagination').append(
                    `<li class="page-item page1"><a class="page-link">1</a></li>`
                );
            }
            // 전체 페이지가 5개 이하일 경우
            else if(result.lastPage <= 5) {
                for(let i = 1; i <= result.lastPage; i++)
                    $('#pagination').append(
                        `<li class="page-item page${i}"><a class="page-link">${i}</a></li>`
                    );
            }
            // 전체 페이지가 5개 이상이고 현재 페이지가 3 이하일 경우
            else if(result.currentPage <= 3) {
                for(let i = 1; i <= 5; i++)
                    $('#pagination').append(
                        `<li class="page-item page${i}"><a class="page-link">${i}</a></li>`
                    );
            }
            // 전체 페이지가 5개 이상이고 현재 페이지가 뒤에서 3개 이내일 경우
            else if(result.lastPage - result.currentPage < 3) {
                for(let i = result.lastPage - 4; i <= result.lastPage; i++)
                    $('#pagination').append(
                        `<li class="page-item page${i}"><a class="page-link">${i}</a></li>`
                    );
            }
            // 전체 페이지가 5개 이상이고 앞뒤로 3개 이상 페이지가 있을 경우
            else {
                for(let i = parseInt(result.currentPage)-2; i <= parseInt(result.currentPage)+2; i++) {
                    $('#pagination').append(
                        `<li class="page-item page${i}"><a class="page-link">${i}</a></li>`
                    );
                }
            }

            // '마지막' 페이지 추가
            $('#pagination').append(
                `<li class="page-item"><a class="page-link" lastPage="${result.lastPage}" style="font-weight: bold">마지막</a></li>`
            );

            // 선택된 페이지에 active 속성 추가하여 선택됐음을 표시
            $(`.page${result.currentPage}`).addClass('active');
            
            // 페이지 클릭했을 때 시군 정보를 알 수 있도록 속성 추가
            $('.page-link').attr('sigun_nm', sigun_nm);
            $('.page-link').attr('sigun_cd', sigun_cd);

            // 페이지 글씨 색상 CSS 변경
            $('.page-link').css('color', 'green');
            $('.page-item.active .page-link').css('color', 'white');
        });
    }

    // 시군로고를 클릭했을 때 getList() 호출하여 ajax 통신
    $('.portfolio-link').on('click', function() {
        let sigun_nm = $(this).attr('name');
        let sigun_cd = $(this).attr('alt');

        getList(sigun_nm, sigun_cd, '1');
    });
    
    // 페이지를 클릭했을 때 getList() 호출하여 ajax 통신
    $('#pagination').on('click', 'li', function() {
        let sigun_nm = $(this).find('a').attr('sigun_nm');
        let sigun_cd = $(this).find('a').attr('sigun_cd');
        let page = $(this).find('a').text();

        if(page == '처음') {
            getList(sigun_nm, sigun_cd, '1');
        }
        else if(page == '마지막') {
            getList(sigun_nm, sigun_cd, $(this).find('a').attr('lastPage'));
        }
        else {
            getList(sigun_nm, sigun_cd, page);
        }
    });
});