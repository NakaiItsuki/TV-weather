$(function () {
    window.myAPI.openWindow();
    var urls = [];
    urls[0] = ["https://www.jma.go.jp/bosai/forecast/data/forecast/016000.json", "0"];
    urls[1] = ["https://www.jma.go.jp/bosai/forecast/data/forecast/040000.json", "0"];
    urls[2] = ["https://www.jma.go.jp/bosai/forecast/data/forecast/150000.json", "0"];
    urls[3] = ["https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json", "0"];
    urls[4] = ["https://www.jma.go.jp/bosai/forecast/data/forecast/230000.json", "0"];
    urls[5] = ["https://www.jma.go.jp/bosai/forecast/data/forecast/270000.json", "0"];
    urls[6] = ["https://www.jma.go.jp/bosai/forecast/data/forecast/340000.json", "0"];
    urls[7] = ["https://www.jma.go.jp/bosai/forecast/data/forecast/400000.json", "0"];

    var array = [];
    var childarray = [];

    init();


    function init(){
        var serializedArray = window.localStorage.getItem('urldata');
        var xnumdata = window.localStorage.getItem('tenkixnum');
        var ynumdata = window.localStorage.getItem('tenkiynum');
        if (xnumdata != null) {
            $('#tenki').css('left', xnumdata + 'px');
            $('#tenki').css('top', ynumdata + 'px');
        }

        if (serializedArray != null) {
            var getValue = JSON.parse(serializedArray);
            urls = [];
            urls = getValue;
        }
        loadjson();
    }

    function loadjson() {
        array = [];
        i = 0;
        for (var t = 0; t < urls.length; t++) {
            try {
                var jsonData = fetchJsonSync(urls[t][0]);
                formatWeather(jsonData, Number(urls[t][1]));
            } catch (error) {
                console.error('データの取得に失敗しました。', error);
            }
        }
    }
    
    function fetchJsonSync(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, false);
        request.send();

        if (request.status === 200) {
            return JSON.parse(request.responseText);
        } else {
            throw new Error(`Failed to fetch data: ${request.status}`);
        }
    }

    function showWeather() {
        nowTime = new Date();
        nowHour = nowTime.getHours();
        let loadflag = 0;
        if (nowHour == 0 && loadflag == 0) {
            loadjson();
            loadflag = 1;
        }
        if (nowHour == 1 && loadflag == 1) {
            loadflag = 0;
        }

        if (nowHour >= 17) {
            updateWeatherForTomorrow();
        } else {
            updateWeatherForToday();
        }
        animateWeatherIcon();
        if (i > array.length - 2) {
            i = 0;
        } else {
            i++;
        }
    }

    function updateWeatherForToday() {
        $('#asuarea').empty();
        $('#ltmparea').empty();
        $('#ltmparea').append('<style>#tenki{opacity:1;}#tr2{opacity:0;}#htmp{top:5px;}#hp{top:30px;}</style>');
        $('#chiten').empty();
        $('#chiten').append(array[i].area);
        $('#htmp').empty();
        $('#htmp').append(Math.round(array[i].htmp));
        $('#pop1').empty();
        $('#pop1').append(Math.round(array[i].pop1));
        $('#pop2').empty();
        $('#pop2').append(Math.round(array[i].pop2));
        tenkimode = getWeatherMode(array[i].tenki);
    }

    function updateWeatherForTomorrow() {
        $('#asuarea').empty();
        $('#asuarea').append('<div id="asu">あす</div>');
        $('#ltmparea').empty();
        $('#ltmparea').append('<style>#tenki{opacity:1;}#pop1{font-size:30px;right:190px;top:130px;}#pop2{font-size:30px;right:120px;top:130px;}#htmp{right:105px;}#hp{left:200px;}#tr,#tp2{opacity:0;}#tp{top:145px;right:130px;}</style>');
        $('#ltmparea').append('<div id="lp">℃</div><div id="ltmp"></div>');
        $('#chiten').empty();
        $('#chiten').append(array[i].area);
        $('#htmp').empty();
        $('#htmp').append(Math.round(array[i].nhtmp));
        $('#ltmp').empty();
        $('#ltmp').append(Math.round(array[i].nltmp));
        $('#pop1').empty();
        $('#pop1').append(Math.round(array[i].npop1));
        $('#pop2').empty();
        $('#pop2').append(Math.round(array[i].npop2));
        tenkimode = getWeatherMode(array[i].ntenki);
    }

    function animateWeatherIcon() {
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
        return weatherMapping[code] || null;
    }

    function reloadWeather(data) {
        urls = [];
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
        array = [];

    }

    function formatWeather(weather, num) {
        var dd;
        var area = weather[0].timeSeries[2].areas[num].area.name;
        var tenki = weather[0].timeSeries[0].areas[num].weatherCodes[0];
        var htmp = weather[0].timeSeries[2].areas[num].temps[1];
        var ltmp = weather[0].timeSeries[2].areas[num].temps[0];
        var pop1 = weather[0].timeSeries[1].areas[num].pops[0];
        var pop2 = weather[0].timeSeries[1].areas[num].pops[1];
        var ntenki = weather[0].timeSeries[0].areas[num].weatherCodes[1];
        var nhtmp = weather[0].timeSeries[2].areas[num].temps[2];
        var nltmp = weather[0].timeSeries[2].areas[num].temps[1];
        var npop1 = weather[0].timeSeries[1].areas[num].pops[2];
        var npop2 = weather[0].timeSeries[1].areas[num].pops[3];
        if (nhtmp == null) {
            nhtmp = weather[0].timeSeries[2].areas[num].temps[1];
            nltmp = weather[0].timeSeries[2].areas[num].temps[0];
        }
        if (parseInt(nhtmp) < parseInt(nltmp)) {
            dd = nhtmp;
            nhtmp = nltmp;
            nltmp = dd;
        }
        if (parseInt(htmp) < parseInt(ltmp)) {
            dd = htmp;
            htmp = ltmp;
            ltmp = dd;
        }

        childarray = { area: area, tenki: tenki, htmp: htmp, ltmp: ltmp, pop1: pop1, pop2: pop2, ntenki: ntenki, nhtmp: nhtmp, nltmp: nltmp, npop1: npop1, npop2: npop2 };
        array[array.length] = childarray;
    }

    setInterval(() => {
        showWeather();
    }, 5000);

    setInterval(() => {
        loadjson();
    }, 3600000);

    window.myAPI.onReply((e, arg) => {
        if (arg[0] == 1) {
            reloadWeather(arg);
            loadjson();
        } else if (arg[0] == 2) {
            $('#tenki').css('left', arg[1] + 'px');
            $('#tenki').css('top', arg[2] + 'px');
            window.localStorage.setItem('tenkixnum', arg[1]);
            window.localStorage.setItem('tenkiynum', arg[2]);
        }
    });
});