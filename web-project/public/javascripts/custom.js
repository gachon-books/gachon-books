$(function() {
    // tooltip 초기화
    $('[data-toggle="tooltip"]').tooltip()

    // 처음 진입하면 카테고리 선택 안내 문구를 출력
    $('#collapse-usage').collapse('show');

    // 지역 카테고리를 선택하면 usage는 안보이도록 설정
    $('.btn-group').on('click', function() {
        $('#closeUsage').trigger('click');
    });
});