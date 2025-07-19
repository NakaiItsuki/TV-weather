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

    // if (window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
    //     $('#menuAreaDisplay').empty();
    //     $('#menuAreaDisplay').append(
    //         '<div class="fluentButton" id="chitenListCheck"><div class="fluentImgArea"><img class="fluentImg"src="../../../img/other/dark_ic_fluent_location_24_filled.png"></div><p>地点</p></div>' +
    //         '<div class="fluentButton" id="ichiListCheck"><div class="fluentImgArea"><img class="fluentImg"src="../../../img/other/dark_ic_fluent_position_forward_24_filled.png"></div><p>表示位置</p></div>' +
    //         '<div class="fluentButton" id="displayListCheck"><div class="fluentImgArea"><img class="fluentImg"src="../../../img/other/dark_ic_fluent_position_forward_24_filled.png"></div><p>ディスプレイ</p></div>' +
    //         '<div class="fluentButton" id="sizeListCheck"><div class="fluentImgArea"><img class="fluentImg" src="../../../img/other/dark_ic_fluent_resize_24_filled.png"></div><p>表示サイズ</p></div>'
    //     );
    // }
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
                        console.error(`データの取得に失敗しました（URL: ${url}）`, error);
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
            // console.log(tmp);
            var val = code + String(i);
            // console.log(val);
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

    
    // 表示位置設定（X軸・Y軸）の決定ボタン
    $('#setichiCheck').on('click', function () {
        const x = $("#inputxnum").val();
        const y = $("#inputynum").val();
        if (x > 0 && y > 0) {
            window.localStorage.setItem('tenkixnum', x);
            window.localStorage.setItem('tenkiynum', y);
            window.myAPI.send([2, x, y]);
            alert("表示位置を設定しました。\nX: " + x + " / Y: " + y);
        } else {
            alert("X軸・Y軸の値を正しく入力してください。");
        }
    });

    // 表示位置設定の初期値ボタン
    $('#resetichiCheck').on('click', function () {
        $("#inputxnum").val(380);
        $("#inputynum").val(30);
        window.localStorage.setItem('tenkixnum', 380);
        window.localStorage.setItem('tenkiynum', 30);
        alert("表示位置を初期値に戻しました。");
    });

    // ディスプレイ選択画面の表示切替
    $('#displayListCheck').on('click', function () {
        $('.detailesAreaContents').hide();
        $('#displayAreaContents').show();
    });
    // ディスプレイ情報取得（Electron環境想定）
    if (window.myAPI && window.myAPI.getDisplays) {
        window.myAPI.getDisplays().then(displays => {
            $('#displaySelect').empty();
            displays.forEach((display, idx) => {
                $('#displaySelect').append(`<option value="${display.id}">ディスプレイ${idx + 1} (${display.bounds.width}x${display.bounds.height})</option>`);
            });
        });
    }
    // ディスプレイ決定ボタン
    $('#setDisplayCheck').on('click', function () {
        const selectedDisplay = $('#displaySelect').val();
        window.localStorage.setItem('displaynum', selectedDisplay);
        window.myAPI.send(['display', selectedDisplay]);
        alert('選択したディスプレイ: ' + selectedDisplay + ' に設定しました');
    });

    window.myAPI.getDisplays().then(displays => {
        $('#displaySelect').empty();
        displays.forEach((display, idx) => {
            $('#displaySelect').append(`<option value="${display.id}">ディスプレイ${idx + 1} (${display.bounds.width}x${display.bounds.height})</option>`);
        });
    });


    // 選択状態管理
    let selectedButton = 'chitenListCheck'; // 初期選択

    // ボタンリスト
    const buttons = ['chitenListCheck', 'ichiListCheck', 'displayListCheck','sizeListCheck'];

    // 選択状態の背景色を更新
    function updateButtonColors() {
        buttons.forEach(id => {
            if (id === selectedButton) {
                $('#' + id).css('background-color',
                    window.matchMedia('(prefers-color-scheme: dark)').matches ? '#3c3c3c' : '#ededed'
                );
            } else {
                $('#' + id).css('background-color',
                    window.matchMedia('(prefers-color-scheme: dark)').matches ? '#202020' : '#f3f3f3'
                );
            }
        });
    }

    // マウスオーバー時の処理
    buttons.forEach(id => {
        $('#' + id).hover(
            function () {
                $(this).css('background-color',
                    window.matchMedia('(prefers-color-scheme: dark)').matches ? '#3c3c3c' : '#ededed'
                );
            },
            function () {
                // 選択中以外は通常色に戻す
                if (selectedButton !== id) {
                    $(this).css('background-color',
                        window.matchMedia('(prefers-color-scheme: dark)').matches ? '#202020' : '#f3f3f3'
                    );
                }
            }
        );
    });

    // クリック時の処理
    $('#chitenListCheck').on('click', function () {
        selectedButton = 'chitenListCheck';
        updateButtonColors();
        $('.detailesAreaContents').hide();
        $('#chitenAreaContents').show();
    });
    $('#ichiListCheck').on('click', function () {
        selectedButton = 'ichiListCheck';
        updateButtonColors();
        $('.detailesAreaContents').hide();
        $('#ichiAreaContents').show();
    });
    $('#displayListCheck').on('click', function () {
        selectedButton = 'displayListCheck';
        updateButtonColors();
        $('.detailesAreaContents').hide();
        $('#displayAreaContents').show();
    });
    $('#sizeListCheck').on('click', function () {
        selectedButton = 'sizeListCheck';
        updateButtonColors();
        $('.detailesAreaContents').hide();
        $('#sizeAreaContents').show();
    });

    // サイズ決定ボタン
    $('#setTenkiScaleCheck').on('click', function () {
        const scale = parseFloat($('#tenkiScaleInput').val());
        if (scale >= 0.5 && scale <= 3.0) {
            window.localStorage.setItem('tenkiScale', scale);
            // weather.js側にスケール値を送信
            window.myAPI.send(['setTenkiScale', scale]);
            alert('表示サイズを ' + scale + ' 倍に設定しました');
        } else {
            alert('倍率は0.5～3.0の範囲で入力してください');
        }
    });

    // 表示サイズ入力の初期値をlocalStorageから取得してセット
    const savedScale = window.localStorage.getItem('tenkiScale');
    if (savedScale !== null) {
        $('#tenkiScaleInput').val(savedScale);
    }

    // 初期表示
    updateButtonColors();
    $('.detailesAreaContents').hide();
    $('#chitenAreaContents').show();
});