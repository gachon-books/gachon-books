// 지역 카테고리를 선택하면 usage는 안보이도록 설정
$(function() {
    $('.btn-group').on('click', function() {
        $('#collapse-usage').hide();
    });
});