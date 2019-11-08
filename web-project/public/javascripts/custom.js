$(function() {
    // tooltip 초기화
    $('[data-toggle="tooltip"]').tooltip()

    // 처음 진입하면 카테고리 선택 안내 문구를 출력
    $('#collapse-usage').collapse('show');

    // 지역 카테고리를 선택하면 usage는 안보이도록 설정
    $('.btn-group').on('click', function() {
        $('#closeUsage').trigger('click');
    });

    $('.portfolio-link').on('click', function() {
        $('.collapse').collapse('hide');

        setTimeout(function() {
            $('#goBtnGroup').trigger('click');
        }, 500);

        let sigun_nm = $(this).attr('name');
        let sigun_cd = $(this).attr('alt');

        $('#listTitle').text(`${sigun_nm} 놀이시설 목록`);
        $('#listScroll').text('');
        $('#loading').show();

        setTimeout(function() {
            $('#facility-list').collapse('show');
        }, 500);

        // ajax 통신
        var data = {
            'sigun_nm': sigun_nm,
            'sigun_cd': sigun_cd
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

            // $('#listScroll').text('');
            $('#loading').hide();

            if(result.facilities.length == 0)
                $('#listScroll').text(`${sigun_nm}에 등록된 어린이 놀이시설이 없습니다.`);
            else {
                result.facilities.forEach(function(item, index) {
                    $('#listScroll').append(
                        `<div class="col-md-6 d-flex listElement">
                            <p class="mr-auto">${item.test}</p>
                            <button class="btn btn-sm btn-success pull-right moreBtn">more</button>
                        </div>`
                    );
                });
            }
        });
    });
});