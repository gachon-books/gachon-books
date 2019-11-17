$(function() {
    // tooltip 초기화
    // Bootstrap의 tooltip을 사용하기 위해서는 초기화 작업 필요
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

    // 처음 진입하면 카테고리 선택 안내 문구를 출력
    $('#collapse-usage').collapse('show');

    // 지역 카테고리를 선택하면 다른 지역 카테고리와 안내 문구는 안보이도록 설정
    $('#collapseBtn1').on('click', function() {
        $('#collapse2').collapse('hide');
        $('#collapse3').collapse('hide');
        $('#closeUsage').trigger('click');
    });

    // 지역 카테고리를 선택하면 다른 지역 카테고리와 안내 문구는 안보이도록 설정
    $('#collapseBtn2').on('click', function() {
        $('#collapse1').collapse('hide');
        $('#collapse3').collapse('hide');
        $('#closeUsage').trigger('click');
    });

    // 지역 카테고리를 선택하면 다른 지역 카테고리와 안내 문구는 안보이도록 설정
    $('#collapseBtn3').on('click', function() {
        $('#collapse1').collapse('hide');
        $('#collapse2').collapse('hide');
        $('#closeUsage').trigger('click');
    });

    // ajax를 통한 놀이시설 목록 출력(post, '/')
    let getList = function(sigun_nm, sigun_cd, page) {
        // 안내 문구 안보이도록 설정
        $('.collapse').collapse('hide');

        // list가 최대한 화면에 많이보일 수 있도록 스크롤을 이동
        // 원활한 애니메이션을 위한 지연 클릭
        setTimeout(function() {
            $('#btnList').trigger('click');
        }, 500);

        // 재호출을 대비하여 각 항목의 내용 초기화
        $('#listScroll').text('');
        $('#pagination').text('');
        
        // 놀이시설 목록 모달 창의 제목
        $('#listTitle').text(`${sigun_nm} 놀이시설 목록 `);

        // 검색된 놀이시설의 총 개수를 출력하기 위한 배지
        $('#listTitle').append(`<span class="badge badge-success" id="totalCountBadge"></span>`);

        // 검색되는 동안 출력할 로딩 이미지
        $('#loading').show();

        // 리스트 출력(애니메이션)
        setTimeout(function() {
            $('#facility-list').collapse('show');
        }, 500);

        // POST / 호출
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
        
        // 데이터 수신 완료되면 출력
        xhr.addEventListener('load', function() {
            var result = JSON.parse(xhr.responseText);
            
            if(result.result !== 'ok')
                return;

            // 놀이시설의 총 개수를 갱신(배지)
            $('#totalCountBadge').text(`${result.totalCount}`);

            // 로딩 아이콘 숨김
            $('#loading').hide();

            // 등록된 놀이시설이 없을 경우 대체 텍스트 출력(양평군이 해당) 
            if(result.facilities.length == 0)
                $('#listScroll').text(`${sigun_nm}에 등록된 어린이 놀이시설이 없습니다.`);
            else {
                // 수신받은 20개의 놀이시설 목록을 리스트에 출력
                // 향후 상세 정보를 표시하기 위해 index를 속성 값으로 저장
                result.facilities.forEach(function(item, index) {
                    $('#listScroll').append(
                        `<div class="col-md-6 d-flex listElement">
                            <p class="mr-auto my-auto font-weight-bold text-truncate">${item.name}</p>
                            <button class="btn btn-sm btn-outline-success pull-right moreBtn" index="${index}" data-toggle="modal" data-target="#info-modal">more</button>
                        </div>`
                    );
                });
            }

            // 놀이시설 리스트에서 'more' 버튼을 클릭하면 상세 정보 모달을 출력
            $('.moreBtn').on('click', function() {
                // 인덱스 정보 가져오기
                let index = Number($(this).attr('index'));
                let item = result.facilities[index];

                // 상세정보 모달에 해당 놀이시설의 정보를 표시
                $('#info-name').val(`[#${item.no}] ${item.name}`);
                $('#info-inoutType').val(`${item.inoutType}`);
                $('#info-buildDay').val(`${item.buildDay}`);
                $('#info-addr').val(`${item.addr}`);

                // 지도 구현(카카오맵 API)
                setTimeout(function() {
                    // 지도 컨테이너 설정
                    // 화면 스크롤시 의도치 않은 이동 때문에 드래그 방지 설정
                    let container = document.getElementById('map'),
                        options = {
                            center: new kakao.maps.LatLng(item.lat, item.logt),
                            draggable: false,
                            level: 3
                        };

                    // 해당 위치의 지도 설정
                    let map = new kakao.maps.Map(container, options);

                    // 마커 설정
                    let marker = new kakao.maps.Marker({ 
                        position: map.getCenter() 
                    });

                    // 지도 출력
                    marker.setMap(map);
                }, 500);

                // 즐겨찾기 등록 시 정보 전달할 수 있도록 속성 부여
                $('#favNo').val(item.no);
                $('#favCityName').val(item.cityName);
                $('#favName').val(item.name);
                $('#favAddr').val(item.addr);
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

            // 선택된 페이지는 active 속성 추가하여 선택됐음을 표시
            $(`.page${result.currentPage}`).addClass('active');
            
            // 페이지 클릭했을 때 시/군 정보를 알 수 있도록 속성 추가
            $('.page-link').attr('sigun_nm', sigun_nm);
            $('.page-link').attr('sigun_cd', sigun_cd);

            // 페이지 글씨 색상 CSS 변경
            $('.page-link').css('color', 'green');
            $('.page-item.active .page-link').css('color', 'white');
        });
    }

    // 시/군 로고를 클릭했을 때 getList() 호출하여 ajax 통신
    $('.portfolio-link').on('click', function() {
        let sigun_nm = $(this).attr('name');
        let sigun_cd = $(this).attr('alt');

        // 최초 호출이므로 페이지는 1로 설정한 후 호출
        getList(sigun_nm, sigun_cd, '1');
    });
    
    // 페이지를 클릭했을 때 getList() 호출하여 ajax 통신
    $('#pagination').on('click', 'li', function() {
        let sigun_nm = $(this).find('a').attr('sigun_nm');
        let sigun_cd = $(this).find('a').attr('sigun_cd');
        let page = $(this).find('a').text();

        // 선택된 페이지 번호를 설정하여 호출
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

    // Contact Us 구현(mailto)
    // 내용을 작성하고 send 버튼을 누르면 이메일 웹/앱 호출
    // 작성한 내용은 이메일 본문에 자동으로 작성된 상태로 호출
    $('#contactBtn').on('click', function() {
        let name = $('#contactName').val();
        let email = $('#contactEmail').val();
        let phone = $('#contactPhone').val();
        let message = $('#contactMessage').val();

        let subject = `경기도 어린이 놀이시설에서 보낸 메일입니다.`;
        let context =
            `"좋은 의견 감사합니다." / `
            + `이름: ${name} / `
            + `이메일: ${email} / `
            + `핸드폰: ${phone} / `
            + `내용: ${message}`;

        let mailContext = `mailto:tjrghks115@gmail.com?subject=${subject}&body=${context}`;
        window.open(mailContext, '_blank');
    });

});
