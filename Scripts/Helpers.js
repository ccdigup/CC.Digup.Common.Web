function getInteractiveExerciseHtml() {
    function getCookie(name) {
        var matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
    var id = getCookie('clientUniqueId');
    var dataNumber = $('#allgemein-3').val();
    var host = location.host;
    return '<iframe src="http://' + host + '/InteractiveExercise?lesson=01&exercise=' + dataNumber + '&id=' + id + '" width="100%" height="100%"></iframe>';
}