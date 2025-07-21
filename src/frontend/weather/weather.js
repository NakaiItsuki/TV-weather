$(function () {
    window.myAPI.openWindow();

    init();//初期化処理を実行

    /**
     * 初期化処理を行う関数
     * @returns {void}
     */
    function init() {
        //表示する地点の初期値を設定
        const baseUrl = "https://www.jma.go.jp/bosai/forecast/data/forecast/";
        const locations = ["016000", "040000", "150000", "130000", "230000", "270000", "340000", "400000"];
        var urls = locations.map(location => [`${baseUrl}${location}.json`, "0"]);//表示する地点の初期値を設定
        var weather_datas = [];//気象庁のサーバから取得した情報を格納する
        var serializedArray = window.localStorage.getItem('urldata');//以前に選択済みの地点の情報を取得する
        var x_value = window.localStorage.getItem('tenkixnum');//以前に設定済みの天気ループの表示位置（X軸）を取得する
        var y_value = window.localStorage.getItem('tenkiynum');//以前に設定済みの天気ループの表示位置（Y軸）を取得する
        if (x_value != null) {//以前に表示位置が設定されていた場合
            $('#tenki').css('left', x_value + 'px');//X軸のCSSの情報を更新
            $('#tenki').css('top', y_value + 'px');//Y軸のCSSの情報を更新
        }

        if (serializedArray != null) {//以前に表示する地点を設定されていた場合
            urls = JSON.parse(serializedArray);//json形式で保存されているURLの情報を取得する
        }
        weather_datas = getWeatherData(urls);//気象庁のサーバからjsonデータを取得する

        draw(weather_datas);
    }

    /**
     * 天気情報を順番に表示する関数
     * @param {Array} weather_datas - 表示する天気情報の配列
     * @returns {void}
     */
    function draw(weather_datas) {
        let currentIndex = 0;//表示する地点を指定する配列のインデックス
        setInterval(() => {
            showWeather(weather_datas[currentIndex]);//指定したインデックスの地点の天気を表示
            currentIndex = (currentIndex + 1) % weather_datas.length; // インデックスをリセットしてループさせる
        }, 5000);
    }

    /**
     * 各URLから天気情報を取得し、整形して配列で返す関数
     * @param {Array} urls - 天気情報取得用のURLとインデックスの配列
     * @returns {Array} - 整形済み天気情報オブジェクトの配列
     */
    function getWeatherData(urls) {
        //各urlからjsonデータを取得する
        var weather_datas = [];//気象庁のサーバから取得した情報を格納する
        for (let t = 0; t < urls.length; t++) {
            try {
                var jsonData = fetchJsonSync(urls[t][0]);
                weather_datas[weather_datas.length] = formatWeather(jsonData, Number(urls[t][1]));
            } catch (error) {
                console.error('データの取得に失敗しました。', error);
            }
        }
        return weather_datas
    }

    /**
     * 指定したURLからJSONデータを同期的に取得する関数
     * @param {string} url - 取得するJSONデータのURL
     * @returns {Object} - 取得したJSONデータ（オブジェクト）
     * @throws {Error} - 通信エラー時
     */
    function fetchJsonSync(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, false); // 同期リクエスト
        try {
            request.send();

            if (request.status === 200) {
                console.log(`気象庁のサーバーからデータを取得しました: ${url}`);
                return JSON.parse(request.responseText);
            } else {
                throw new Error(`Failed to fetch data: ${request.status} ${request.statusText}`);
            }
        } catch (error) {
            console.error('Error:', error.message);
            throw error; // エラーを再度投げて上位で処理できるようにする
        }
    }

    /**
     * 天気情報を順番に表示する関数
     * @param {Array} weather_datas - 表示する天気情報の配列
     * @returns {void}
     */
    function draw(weather_datas) {
        let currentIndex = 0;//表示する地点を指定する配列のインデックス

        // weather_datasを外部から更新できるようにする
        window.updateWeatherDatas = function (newWeatherDatas) {
            weather_datas = newWeatherDatas;
            currentIndex = 0; // インデックスをリセット
            $('#tenki').css('opacity', 1);
        };

        setInterval(() => {
            showWeather(weather_datas[currentIndex]);//指定したインデックスの地点の天気を表示
            currentIndex = (currentIndex + 1) % weather_datas.length; // インデックスをリセットしてループさせる
        }, 5000);
    }

    /**
     * 1地点分の天気情報を表示する関数
     * @param {Object} weather_data - 1地点分の天気情報オブジェクト
     * @returns {void}
     */
    function showWeather(weather_data) {
        let nowTime = new Date();
        let nowHour = nowTime.getHours();//時間 Hour を取得する
        // タイマーによって非表示に設定されている場合は、フェードアニメーションを実行しない
        if ($('#tenki').css('opacity') !== '0') {
            hideAndShowTenki();
        }
        //17時以降は明日の天気を表示するようにする
        if (nowHour >= 16) {
            updateWeatherForTomorrow(weather_data);//明日の天気を表示
        } else {
            updateWeatherForToday(weather_data);//今日の天気を表示
        }
    }

    /**
     * 天気情報を非表示にしてから再表示する関数
     * @param {void}
     * @returns {void}
     */
    function hideAndShowTenki() {
        const tenkiElement = document.getElementById('tenki');
        // 1. まず要素を透明にして非表示にする
        tenkiElement.style.opacity = '0';

        // 2. 5ミリ秒後に再表示するタイマーをセットする
        setTimeout(() => {
            tenkiElement.style.opacity = '1';
        }, 5);
    }

    /**
     * 今日の天気情報を画面に表示する関数
     * @param {Object} weather_data - 1地点分の天気情報オブジェクト
     * @returns {void}
     */
    function updateWeatherForToday(weather_data) {
        $('#asuarea').empty();//{id:asuarea}内の要素を削除する
        $('#ltmparea').empty();//{id:ltmparea}内の要素を削除する
        $('#ltmparea').append('<style>#tenki{opacity:1;}#tr2{opacity:0;}#htmp{top:5px;}#hp{top:30px;}</style>');//{id:ltmparea}内にCSSを追加する
        $('#chiten').empty();//{id:chiten}内の既存の地点名を削除する
        $('#chiten').append(weather_data.area);//{id:chiten}内に新規の地点名を表示する
        $('#htmp').empty();//{id:htmp}内の要素を削除する
        $('#htmp').append(Math.round(weather_data.htmp));//{id:htmp}内に最高気温を表示する
        $('#pop1').empty();//{id:pop1}内の要素を削除する
        $('#pop1').append(Math.round(weather_data.pop1));//{id:pop1}内に降水確率を表示する
        $('#pop2').empty();//{id:pop2}内の要素を削除する
        $('#pop2').append(Math.round(weather_data.pop2));//{id:pop2}内に降水確率を表示する
        let tenkimode = getWeatherMode(weather_data.tenki);//気象庁のサーバから取得した天気コードを変換する
        animateWeatherIcon(tenkimode);//天気アイコンを表示
    }

    /**
     * 明日の天気情報を画面に表示する関数
     * @param {Object} weather_data - 1地点分の天気情報オブジェクト
     * @returns {void}
     */
    function updateWeatherForTomorrow(weather_data) {
        $('#asuarea').empty();//{id:asuarea}内の要素を削除する
        $('#asuarea').append('<div id="asu">あす</div>');//{id:asuarea}内に「あす」と表示する
        $('#ltmparea').empty();//{id:ltmparea}内の要素を削除する
        $('#ltmparea').append('<style>#tenki{opacity:1;}#pop1{font-size:30px;right:190px;top:130px;}#pop2{font-size:30px;right:120px;top:130px;}#htmp{right:105px;}#hp{left:200px;}#tr,#tp2{opacity:0;}#tp{top:145px;right:130px;}</style>');
        $('#ltmparea').append('<div id="lp">℃</div><div id="ltmp"></div>');//{id:ltmparea}内にCSSを追加する
        $('#chiten').empty();//{id:chiten}内の既存の地点名を削除する
        $('#chiten').append(weather_data.area);//{id:chiten}内に新規の地点名を表示する
        $('#htmp').empty();//{id:htmp}内の要素を削除する
        $('#htmp').append(Math.round(weather_data.nhtmp));//{id:htmp}内に明日の最高気温を表示する
        $('#ltmp').empty();//{id:ltmp}内の要素を削除する
        $('#ltmp').append(Math.round(weather_data.nltmp));//{id:ltmp}内に明日の最低気温を表示する
        $('#pop1').empty();//{id:pop1}内の要素を削除する
        $('#pop1').append(Math.round(weather_data.npop1));//{id:pop1}内に明日の降水確率を表示する
        $('#pop2').empty();//{id:pop2}内の要素を削除する
        $('#pop2').append(Math.round(weather_data.npop2));//{id:pop2}内に明日の降水確率を表示する
        let tenkimode = getWeatherMode(weather_data.ntenki);//気象庁のサーバから取得した天気コードを変換する
        animateWeatherIcon(tenkimode);//天気アイコンを表示
    }

    /**
     * 天気アイコンをアニメーション表示する関数
     * @param {number} tenkimode - 独自定義の天気コード
     * @returns {void}
     */
    function animateWeatherIcon(tenkimode) {
        $('.mark').css('opacity', 0);
        $('#m' + tenkimode).css('opacity', 1).animate({ paddingRight: 1 }, {
            duration: 1000,
            step: function (now) {
                $(this).css({ transform: 'scale(' + now + ')' });
            },
            complete: function () {
                $('#m' + tenkimode).css('paddingRight', 0);
            }
        });
    }

    /**
     * 気象庁の天気コードを独自定義のコードに変換する関数
     * @param {string|number} code - 気象庁の天気コード
     * @returns {number|null} - 独自定義の天気コード（該当しない場合はnull）
     */
    function getWeatherMode(code) {
        const weatherMapping = {
            "100": 100, "123": 100, "124": 100, "130": 100, "131": 100,//晴れ
            "101": 101, "132": 101,//晴れ時々くもり
            "102": 102, "103": 102, "106": 102, "107": 102, "108": 102, "120": 102, "140": 102,//晴れ時々雨
            "104": 104, "105": 104, "160": 104, "170": 104,//晴れ時々雪
            "110": 110, "111": 110,//晴れのちくもり
            "112": 112, "113": 112, "114": 112, "118": 112, "119": 112, "122": 112, "125": 112,//晴れのち雨
            "126": 112, "127": 112, "128": 112, "129": 112,//晴れのち雨
            "115": 115, "116": 115, "117": 115,//晴れのち雪
            "200": 200, "209": 200, "231": 200,//くもり
            "201": 201, "223": 201,//くもり時々晴れ
            "202": 202, "203": 202, "206": 202, "207": 202, "208": 202, "220": 202, "240": 202,//くもり時々雨
            "204": 204, "205": 204, "250": 204, "260": 204, "270": 204,//くもり時々雪
            "210": 210, "211": 210,//くもりのち晴れ
            "212": 212, "213": 212, "214": 212, "218": 212, "219": 212, "222": 212,//くもりのち雨
            "224": 212, "225": 212, "226": 212, "227": 212,//くもりのち雨
            "215": 215, "216": 215, "217": 215, "228": 215, "229": 215, "230": 215, "281": 215,//くもりのち雪
            "300": 300, "306": 300, "307": 300, "308": 300, "328": 300, "350": 300,//雨
            "301": 301,//雨時々晴れ
            "302": 302,//雨時々くもり
            "303": 303, "304": 303, "309": 303, "322": 303, "329": 303,//雨時々雪
            "311": 311, "316": 311, "320": 311, "323": 311, "324": 311, "325": 311,//雨のち晴れ
            "313": 313, "317": 313, "321": 313, "221": 313,//雨のちくもり
            "314": 314, "315": 314, "326": 314, "327": 314,//雨のち雪
            "400": 400, "405": 400, "406": 400, "407": 400, "450": 400, "425": 400,//雪
            "401": 401,//雪時々晴れ
            "402": 402,//雪時々くもり
            "340": 403, "403": 403, "409": 403, "427": 403,//雪時々雨
            "361": 411, "411": 411, "420": 411,//雪のち晴れ
            "371": 413, "413": 413, "421": 413,//雪のちくもり
            "414": 414, "422": 414, "423": 414, "424": 414, "426": 414//雪のち雨
        };
        return weatherMapping[code] || null;//本アプリ独自の天気コードを返す
    }

    /**
     * 設定画面で表示する地点を更新した際に実行する関数
     * @param {Array} data - 地点情報の配列（1要素目は除外、2要素目以降が対象）
     * @returns {void}
     */
    function reloadWeather(data) {
        let urls = [];
        let weather_datas = [];
        for (var i = 1; i < data.length; i++) {
            var part1 = data[i].substr(0, 6); // "100009"
            var part2 = data[i].substr(6);
            url = "https://www.jma.go.jp/bosai/forecast/data/forecast/" + part1 + ".json";
            var tdata = [url, part2];
            urls.push(tdata);
        }
        window.localStorage.removeItem("urldata");
        const serializedArray = JSON.stringify(urls);
        window.localStorage.setItem('urldata', serializedArray);
        weather_datas = getWeatherData(urls);//気象庁のサーバからjsonデータを取得する
        window.updateWeatherDatas(weather_datas);
    }

    /**
     * 気象庁のサーバから取得したjsonデータから情報を取得する関数
     * @param {Object} weather - 取得したJSONデータ
     * @param {number} area_index - 地点のインデックス
     * @returns {Object} - 整形済みの天気情報オブジェクト
     */
    function formatWeather(weather, area_index) {
        // ... 冒頭のconsole.logはデバッグ用に残してもOK ...

        // ▼▼▼【ここを修正】▼▼▼
        // reportDatetimeの文字列から直接 "YYYY-MM-DD" を切り出す
        const todayStr = weather[0].reportDatetime.slice(0, 10);

        // reportDateを元にしていたtomorrowDateも修正が必要
        const tomorrow = new Date(todayStr);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);
        // ▲▲▲【修正はここまで】▲▲▲

        const tempTimeSeries = weather[0].timeSeries[2];
        const timeDefines = tempTimeSeries.timeDefines;
        const allTemps = tempTimeSeries.areas[area_index].temps;

        // これ以降のコードは変更不要です
        const todayTempsAsNumbers = allTemps
            .filter((temp, index) => timeDefines[index].startsWith(todayStr))
            .map(temp => Number(temp));

        const tomorrowTempsAsNumbers = allTemps
            .filter((temp, index) => timeDefines[index].startsWith(tomorrowStr))
            .map(temp => Number(temp));

        const htmp = todayTempsAsNumbers.length > 0 ? Math.max(...todayTempsAsNumbers) : '--';
        let ltmp = todayTempsAsNumbers.length > 0 ? Math.min(...todayTempsAsNumbers) : '--';

        const nhtmp = tomorrowTempsAsNumbers.length > 0 ? Math.max(...tomorrowTempsAsNumbers) : '--';
        const nltmp = tomorrowTempsAsNumbers.length > 0 ? Math.min(...tomorrowTempsAsNumbers) : '--';

        const uniqueTodayTemps = new Set(todayTempsAsNumbers);
        if (uniqueTodayTemps.size === 1) {
            ltmp = '--';
        }

        // --- 以下の部分は変更なし ---
        const area_name = tempTimeSeries.areas[area_index].area.name;
        const tenki = weather[0].timeSeries[0].areas[area_index].weatherCodes[0];
        const pop1 = weather[0].timeSeries[1].areas[area_index].pops[0];
        const pop2 = weather[0].timeSeries[1].areas[area_index].pops[1];
        const ntenki = weather[0].timeSeries[0].areas[area_index].weatherCodes[1];
        const npop1 = weather[0].timeSeries[1].areas[area_index].pops[2];
        const npop2 = weather[0].timeSeries[1].areas[area_index].pops[3];

        return { area: area_name, tenki: tenki, htmp: htmp, ltmp: ltmp, pop1: pop1, pop2: pop2, ntenki: ntenki, nhtmp: nhtmp, nltmp: nltmp, npop1: npop1, npop2: npop2 };
    }



    setInterval(() => {
        init();//1時間ごとに初期化を実行する
    }, 3600000);

    window.myAPI.onReply((e, arg) => {
        if (arg[0] == 1) {
            $('#tenki').css('opacity', 0);
            reloadWeather(arg);
            loadjson();
        } else if (arg[0] == 2) {
            $('#tenki').css('left', arg[1] + 'px');
            $('#tenki').css('top', arg[2] + 'px');
            window.localStorage.setItem('tenkixnum', arg[1]);
            window.localStorage.setItem('tenkiynum', arg[2]);
        }
    });

    if (window.myAPI && window.myAPI.onSetTenkiScale) {
        window.myAPI.onSetTenkiScale((event, scale) => {
            $('#tenki').css('transform', 'scale(' + scale + ')');
        });
    }

    // ページ初期表示時にもlocalStorageの値を反映
    $(function () {
        const scale = window.localStorage.getItem('tenkiScale') || 1.0;
        $('#tenki').css('transform', 'scale(' + scale + ')');
    });

    function checkStartTimers() {
        const timers = JSON.parse(localStorage.getItem('tenkiStartTimers') || '[]');

        timers.forEach(timer => {
            const now = new Date();
            const nowTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            const showTime = parseTime(timer.show);

            // 表示時刻が設定されていて、現在時刻が表示時刻より前の場合、非表示にする
            if (nowTime == showTime) {
                $('#tenki').css('opacity', 1);
            }
        });


    }

    function checkStopTimers() {
        const timers = JSON.parse(localStorage.getItem('tenkiStopTimers') || '[]');

        timers.forEach(timer => {
            const now = new Date();
            const nowTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            const hideTime = parseTime(timer.hide);

            // 表示時刻が設定されていて、現在時刻が表示時刻より前の場合、非表示にする
            if (nowTime == hideTime) {
                $('#tenki').css('opacity', 0);
            }
        });


    }

    // 時刻を数値 (秒の単位) に変換
    function parseTime(timeStr) {
        if (!timeStr) return null; // 時刻が設定されていない場合は null を返す
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return hours * 3600 + minutes * 60 + (seconds || 0);
    }


    // 1秒ごとにタイマーをチェック
    setInterval(checkStartTimers, 1 * 1000);
    setInterval(checkStopTimers, 1 * 1000);

    // 初期状態をチェック
    checkStartTimers();
    checkStopTimers();
});