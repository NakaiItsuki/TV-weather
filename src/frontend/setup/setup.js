$(function () {
    var center_name_list = []
    var area_name_list = []
    var xnumdata = window.localStorage.getItem('tenkixnum');
    var ynumdata = window.localStorage.getItem('tenkiynum');
    var urls = [];
    var serializedArray1 = window.localStorage.getItem('urldatanum');


    if (xnumdata != null) {
        $("#inputxnum").val(xnumdata);
        $("#inputynum").val(ynumdata);
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
        $('#menuAreaDisplay').empty();
        $('#menuAreaDisplay').append('<div class="fluentButton" id="chitenListCheck"><div class="fluentImgArea"><img class="fluentImg"src="../../../img/other/dark_ic_fluent_location_24_filled.png"></div><p>地点</p></div><div class="fluentButton" id="ichiListCheck"><div class="fluentImgArea"><img class="fluentImg"src="../../../img/other/dark_ic_fluent_position_forward_24_filled.png"></div><p>表示位置</p></div>');
    }
    $("#ichiAreaContents").toggle();
    fetch('https://www.jma.go.jp/bosai/common/const/area.json')
        .then(response => response.json())
        .then(data => {
            const areaListElement = document.getElementById('areaList');

            for (const centerCode in data.centers) {
                const center = data.centers[centerCode];
                center_name_list.push(center.name);
                $('.areaList').append('<tr><th class="centername">' + center.name + '</th></tr>');
                //$('#areaList').append("<ul id='"+center.name+"list'></ul>");
                for (var i = 0; i < center.children.length; i++) {
                    code = center.children[i]
                    url = "https://www.jma.go.jp/bosai/forecast/data/forecast/" + code + ".json";

                    try {
                        var jsonData = fetchJsonSync(url);
                        formatWeather(jsonData, center.name, code);
                    } catch (error) {
                        console.error('データの取得に失敗しました。', error);
                    }
                }
            }
        })
        .catch(error => console.error('データの取得に失敗しました。', error));

    function fetchJsonSync(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, false);  // 同期的に行うために false を指定
        request.send();

        if (request.status === 200) {
            return JSON.parse(request.responseText);
        } else {
            throw new Error(`Failed to fetch data: ${request.status}`);
        }
    }

    function formatWeather(weather, name, code) {
        const areaListElement = document.getElementById('areaList');
        var area_len = weather[0].timeSeries[0].areas.length;
        //console.log(area_len);
        for (var i = 0; i < area_len; i++) {
            var area = weather[0].timeSeries[2].areas[i].area.name;
            var tmp = [name, area, code, i];
            console.log(tmp);
            var val = code + String(i);
            console.log(val);
            $(".areaList").append("<tr><td class='centername'><div class='td_list'><p>" + area + "</p><input type='checkbox' name='check4' class='checkbox' id=" + val + " value=" + val + " /></div></td></tr>");
        }

        if (serializedArray1 != null) {
            var getValue = JSON.parse(serializedArray1);
            urls = [];
            urls = getValue;
            for (var i = 0; i < urls.length; i++) {
                $("#" + urls[i]).prop('checked', true);
            }
        }
        put_check_num()
    }

    jQuery(document).on('change', '[name="check4"]', function () {
        //console.log(i);
        put_check_num();

    });

    function put_check_num() {
        var i = 0;
        var aryCmp = [];
        $('[name="check4"]:checked').each(function (index, element) {
            i++;
        });
        $('#checknum').empty();
        $('#checknum').append("選択済みの地点：" + i);
    }

    $('#resetListCheck').on('click', function () {
        $('[name="check4"]').removeAttr('checked').prop('checked', false).change();
    });

    var now_page = 1;
    $("#ichiListCheck").hover(function () {
        if (now_page == 1) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
                $('#ichiListCheck').css('background-color', '#3c3c3c');
            } else {
                $('#ichiListCheck').css('background-color', '#ededed');
            }

        }
    }, function () {
        if (now_page == 1) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
                $('#ichiListCheck').css('background-color', '#202020');
            } else {
                $('#ichiListCheck').css('background-color', '#f3f3f3');
            }
        }
    });

    $("#chitenListCheck").hover(function () {
        if (now_page == 0) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
                $('#chitenListCheck').css('background-color', '#3c3c3c');
            } else {
                $('#chitenListCheck').css('background-color', '#ededed');
            }
        }
    }, function () {
        if (now_page == 0) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
                $('#ichiListCheck').css('background-color', '#202020');
            } else {
                $('#ichiListCheck').css('background-color', '#f3f3f3');
            }
        }
    });
    $('#chitenListCheck').on('click', function () {

        if (now_page == 0) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
                $('#chitenListCheck').css('background-color', '#3c3c3c');
                $('#ichiListCheck').css('background-color', '#202020');
                $("#ichiAreaContents").toggle();
                $("#chitenAreaContents").toggle();
            } else {
                $('#chitenListCheck').css('background-color', '#ededed');
                $('#ichiListCheck').css('background-color', '#f3f3f3');
                $("#ichiAreaContents").toggle();
                $("#chitenAreaContents").toggle();
            }

            now_page = 1;
        }
    });

    $('#ichiListCheck').on('click', function () {

        if (now_page == 1) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
                $('#chitenListCheck').css('background-color', '#202020');
                $('#ichiListCheck').css('background-color', '#3c3c3c');
                $("#ichiAreaContents").toggle();
                $("#chitenAreaContents").toggle();
            } else {
                $('#chitenListCheck').css('background-color', '#f3f3f3');
                $('#ichiListCheck').css('background-color', '#ededed');
                $("#ichiAreaContents").toggle();
                $("#chitenAreaContents").toggle();
            }


            now_page = 0;
        }
    });
    // $('#ichiListCheck').on('mouseenter', function() {
    //   $('#ichiListCheck').css('background-color', '#ededed');
    // });

    $('#setichiCheck').on('click', function () {
        if ($("#inputxnum").val() > 0 && $("#inputynum").val() > 0) {
            window.myAPI.send([2, $("#inputxnum").val(), $("#inputynum").val()]);
        }


    });
    $('#resetichiCheck').on('click', function () {
        $("#inputxnum").val(380);
        $("#inputynum").val(30);

    });



    $('#setListCheck').click(function () {
        var tmp = []
        tmp.push("1");
        $('[name="check4"]:checked').each(function (index, element) {
            tmp.push($(element).val());

        });
        if (tmp.length == 0) {
            alert("表示したい地点を選択してください。")
        } else {
            const serializedArray = JSON.stringify(tmp);
            window.localStorage.setItem('urldatanum', serializedArray);
            window.myAPI.send(tmp);
        }

    });
});