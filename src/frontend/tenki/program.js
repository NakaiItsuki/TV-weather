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

    var tenkimode = 100;

    var nowTime;
    var nowHour;
    var nowMin;
    var nowSec;

    var i = 0;
    var j = 0;

    var xnumdata = window.localStorage.getItem('tenkixnum');
    var ynumdata = window.localStorage.getItem('tenkiynum');

    if (xnumdata != null) {
        $('#tenki').css('left', xnumdata + 'px');
        $('#tenki').css('top', ynumdata + 'px');
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
    var serializedArray = window.localStorage.getItem('urldata');

    if (serializedArray != null) {
        var getValue = JSON.parse(serializedArray);
        urls = [];
        urls = getValue;
    }
    loadjson();

    var loadflag = 0;

    function putsWeather() {
        nowTime = new Date();
        nowHour = nowTime.getHours();
        nowMin = nowTime.getMinutes();
        nowSec = nowTime.getSeconds();
        if (nowHour == 0 && loadflag == 0) {
            loadjson();
            loadflag = 1;
        }
        if (nowHour == 1 && loadflag == 1) {
            loadflag = 0;
        }

        if (nowHour >= 17) {
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
            switch (array[i].ntenki) {
                //晴れ
                case "100":
                case "123":
                case "124":
                case "130":
                case "131":
                    tenkimode = 100;
                    break;
                //晴れ時々くもり
                case "101":
                case "132":
                    tenkimode = 101;
                    break;
                //晴れ時々雨
                case "102":
                case "103":
                case "106":
                case "107":
                case "108":
                case "120":
                case "140":
                    tenkimode = 102;
                    break;
                //晴れ時々雪
                case "104":
                case "105":
                case "160":
                case "170":
                    tenkimode = 104;
                    break;
                //晴れのちくもり
                case "110":
                case "111":
                    tenkimode = 110;
                    break;
                //晴れのち雨
                case "112":
                case "113":
                case "114":
                case "118":
                case "119":
                case "122":
                case "125":
                case "126":
                case "127":
                case "128":
                case "129":
                    tenkimode = 112;
                    break;
                //晴れのち雪
                case "115":
                case "116":
                case "117":
                    tenkimode = 115;
                    break;
                //くもり
                case "200":
                case "209":
                case "231":
                    tenkimode = 200;
                    break;
                //くもり時々晴れ
                case "201":
                case "223":
                    tenkimode = 201;
                    break;
                //くもり時々雨
                case "202":
                case "202":
                case "203":
                case "206":
                case "207":
                case "208":
                case "220":
                case "240":
                    tenkimode = 202;
                    break;
                //くもり時々雪
                case "204":
                case "205":
                case "250":
                case "260":
                case "270":
                    tenkimode = 204;
                    break;
                //くもりのち晴れ
                case "210":
                case "211":
                    tenkimode = 210;
                    break;
                //くもりのち雨
                case "212":
                case "213":
                case "214":
                case "218":
                case "219":
                case "222":
                case "224":
                case "225":
                case "226":
                case "227":
                    tenkimode = 212;
                    break;
                //くもりのち雪
                case "215":
                case "216":
                case "217":
                case "228":
                case "229":
                case "230":
                case "281":
                    tenkimode = 215;
                    break;
                //雨
                case "300":
                case "306":
                case "307":
                case "308":
                case "328":
                case "350":
                    tenkimode = 300;
                    break;
                //雨時々晴れ
                case "301":
                    tenkimode = 301;
                    break;
                //雨時々くもり
                case "302":
                    tenkimode = 302;
                    break;
                //雨時々雪
                case "303":
                case "304":
                case "309":
                case "322":
                case "329":
                    tenkimode = 303;
                    break;
                //雨のち晴れ
                case "311":
                case "316":
                case "320":
                case "323":
                case "324":
                case "325":
                    tenkimode = 311;
                    break;
                //雨のちくもり
                case "313":
                case "317":
                case "321":
                case "221":
                    tenkimode = 313;
                    break;
                //雨のち雪
                case "314":
                case "315":
                case "326":
                case "327":
                    tenkimode = 314;
                    break;
                //雪
                case "400":
                case "405":
                case "406":
                case "407":
                case "450":
                case "425":
                    tenkimode = 400;
                    break;
                //雪時々晴れ
                case "401":
                    tenkimode = 401;
                    break;
                //雪時々くもり
                case "402":
                    tenkimode = 402;
                    break;
                //雪時々雨
                case "340":
                case "403":
                case "409":
                case "427":
                    tenkimode = 403;
                    break;
                //雪のち晴れ
                case "361":
                case "411":
                case "420":
                    tenkimode = 411;
                    break;
                //雪のちくもり
                case "371":
                case "413":
                case "421":
                    tenkimode = 413;
                    break;
                //雪のち雨
                case "414":
                case "422":
                case "423":
                case "424":
                case "426":
                    tenkimode = 414;
                    break;

            }
        } else {
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
            switch (array[i].tenki) {
                //晴れ
                case "100":
                case "123":
                case "124":
                case "130":
                case "131":
                    tenkimode = 100;
                    break;
                //晴れ時々くもり
                case "101":
                case "132":
                    tenkimode = 101;
                    break;
                //晴れ時々雨
                case "102":
                case "103":
                case "106":
                case "107":
                case "108":
                case "120":
                case "140":
                    tenkimode = 102;
                    break;
                //晴れ時々雪
                case "104":
                case "105":
                case "160":
                case "170":
                    tenkimode = 104;
                    break;
                //晴れのちくもり
                case "110":
                case "111":
                    tenkimode = 110;
                    break;
                //晴れのち雨
                case "112":
                case "113":
                case "114":
                case "118":
                case "119":
                case "122":
                case "125":
                case "126":
                case "127":
                case "128":
                case "129":
                    tenkimode = 112;
                    break;
                //晴れのち雪
                case "115":
                case "116":
                case "117":
                    tenkimode = 115;
                    break;
                //くもり
                case "200":
                case "209":
                case "231":
                    tenkimode = 200;
                    break;
                //くもり時々晴れ
                case "201":
                case "223":
                    tenkimode = 201;
                    break;
                //くもり時々雨
                case "202":
                case "202":
                case "203":
                case "206":
                case "207":
                case "208":
                case "220":
                case "240":
                    tenkimode = 202;
                    break;
                //くもり時々雪
                case "204":
                case "205":
                case "250":
                case "260":
                case "270":
                    tenkimode = 204;
                    break;
                //くもりのち晴れ
                case "210":
                case "211":
                    tenkimode = 210;
                    break;
                //くもりのち雨
                case "212":
                case "213":
                case "214":
                case "218":
                case "219":
                case "222":
                case "224":
                case "225":
                case "226":
                case "227":
                    tenkimode = 212;
                    break;
                //くもりのち雪
                case "215":
                case "216":
                case "217":
                case "228":
                case "229":
                case "230":
                case "281":
                    tenkimode = 215;
                    break;
                //雨
                case "300":
                case "306":
                case "307":
                case "308":
                case "328":
                case "350":
                    tenkimode = 300;
                    break;
                //雨時々晴れ
                case "301":
                    tenkimode = 301;
                    break;
                //雨時々くもり
                case "302":
                    tenkimode = 302;
                    break;
                //雨時々雪
                case "303":
                case "304":
                case "309":
                case "322":
                case "329":
                    tenkimode = 303;
                    break;
                //雨のち晴れ
                case "311":
                case "316":
                case "320":
                case "323":
                case "324":
                case "325":
                    tenkimode = 311;
                    break;
                //雨のちくもり
                case "313":
                case "317":
                case "321":
                case "221":
                    tenkimode = 313;
                    break;
                //雨のち雪
                case "314":
                case "315":
                case "326":
                case "327":
                    tenkimode = 314;
                    break;
                //雪
                case "400":
                case "405":
                case "406":
                case "407":
                case "450":
                case "425":
                    tenkimode = 400;
                    break;
                //雪時々晴れ
                case "401":
                    tenkimode = 401;
                    break;
                //雪時々くもり
                case "402":
                    tenkimode = 402;
                    break;
                //雪時々雨
                case "340":
                case "403":
                case "409":
                case "427":
                    tenkimode = 403;
                    break;
                //雪のち晴れ
                case "361":
                case "411":
                case "420":
                    tenkimode = 411;
                    break;
                //雪のちくもり
                case "371":
                case "413":
                case "421":
                    tenkimode = 413;
                    break;
                //雪のち雨
                case "414":
                case "422":
                case "423":
                case "424":
                case "426":
                    tenkimode = 414;
                    break;

            }
        }


        $('.mark').css('opacity', 0);
        $('#m' + tenkimode).css('opacity', 1);
        $('#m' + tenkimode).animate({ paddingRight: 1 }, {
            //1秒かけてアニメーション
            duration: 1000,
            //stepは、アニメーションが進むたびに呼ばれる
            step: function (now) {
                //nowに現在のpadding-rightの値が渡してもらえる
                //0から1に向かって変化していくnowを利用してscaleさせてみる
                $(this).css({ transform: 'scale(' + now + ')' });
            },
            //終わったら
            complete: function () {
                //次のために、元に戻しておく
                $('#m' + tenkimode).css('paddingRight', 0);
            }
        })
        if (i > array.length - 2) {
            i = 0;
        } else {
            i++;
        }
    }

    function reload_tenki(data) {
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
        putsWeather();
    }, 5000);


    setInterval(() => {
        loadjson();
    }, 3600000);

    window.myAPI.onReply((e, arg) => {
        // メインプロセスから転送されてきたメッセージを表示
        //alert(arg);
        if (arg[0] == 1) {
            reload_tenki(arg);
            loadjson();
        } else if (arg[0] == 2) {
            $('#tenki').css('left', arg[1] + 'px');
            $('#tenki').css('top', arg[2] + 'px');
            window.localStorage.setItem('tenkixnum', arg[1]);
            window.localStorage.setItem('tenkiynum', arg[2]);
        }

    });



});