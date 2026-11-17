var $aeeUC$axios = require("axios");
var $aeeUC$cheerio = require("cheerio");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "host", () => $f143b11fc67a70bd$export$5e032988b71f6158);
$parcel$export(module.exports, "default", () => $f143b11fc67a70bd$export$2e2bcd8739ae039);



async function $19a45cbfdc5a1d1d$var$searchMusic(query, page) {
    let keyword = encodeURIComponent(query);
    let serchUrl = (0, $f143b11fc67a70bd$export$5e032988b71f6158) + "/s/" + keyword;
    let songs = [];
    // 站点已迁到 Cloudflare，响应较慢，超时放宽
    let searchRes = (await (0, ($parcel$interopDefault($aeeUC$axios))).get(serchUrl, {
        timeout: 30000
    })).data;
    const $ = $aeeUC$cheerio.load(searchRes);
    // 新版结构：.card-text 下 .row.no-gutters 行，内含 a.hover-zoom（title="歌名 - 歌手"）
    var rowList = $(".card-text").find(".row.no-gutters");
    for(let i = 0; i < rowList.length; i++){
        var a = $(rowList[i]).find("a.hover-zoom").eq(0);
        var href = a.attr("href") || "";
        var m = href.match(/\/music\/(\d+)/);
        if (!m) continue;
        var titleAttr = (a.attr("title") || "").trim();
        var parts = titleAttr.split(" - ");
        var title = (parts[0] || "").trim();
        var artist = (parts.length > 1 ? parts.slice(1).join(" - ") : "").trim();
        songs.push({
            id: m[1],
            title: title,
            artist: artist
        });
    }
    return {
        isEnd: true,
        data: songs
    };
}
async function $19a45cbfdc5a1d1d$export$2e2bcd8739ae039(query, page, type) {
    if (type === "music") return $19a45cbfdc5a1d1d$var$searchMusic(query, page);
}




const $f143b11fc67a70bd$export$5e032988b71f6158 = "https://www.gequbao.com";
const $f143b11fc67a70bd$var$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
async function $f143b11fc67a70bd$var$getMediaSource(musicItem, quality) {
    // https://www.gequbao.com/music/5465
    let tempUrl = $f143b11fc67a70bd$export$5e032988b71f6158 + "/music/" + musicItem.id;
    // 1. 获取歌页（建立会话，站点在 Cloudflare 后较慢）
    const pageRes = await (0, ($parcel$interopDefault($aeeUC$axios))).get(tempUrl, {
        headers: {
            "User-Agent": $f143b11fc67a70bd$var$UA,
            "Referer": $f143b11fc67a70bd$export$5e032988b71f6158 + "/"
        },
        timeout: 30000
    });
    const html = typeof pageRes.data === "string" ? pageRes.data : "";
    let id = "";
    // 新版：window.appData = JSON.parse('...\u0022play_id\u0022:\u0022(base64)...')
    const mNew = html.match(/play_id\\u0022:\\u0022([A-Za-z0-9+/=]+)/);
    if (mNew) id = mNew[1];
    if (!id) {
        // 旧版兼容：window.appData = {...};
        const scriptContent = html.match(/<script[^>]*>[\s\S]*?window\.appData\s*=\s*({.*?});[\s\S]*?<\/script>/i);
        if (scriptContent && scriptContent[1]) try {
            id = JSON.parse(scriptContent[1]).play_id;
        } catch (e) {}
    }
    if (!id) return {
        url: ""
    };
    // 2. 提取会话 cookie（新接口必须携带）
    let cookie = "";
    try {
        const setCookies = pageRes.headers["set-cookie"] || pageRes.headers["Set-Cookie"] || [];
        const arr = Array.isArray(setCookies) ? setCookies : [
            setCookies
        ];
        cookie = arr.map((c)=>String(c).split(";")[0]).join("; ");
    } catch (e) {}
    // 3. 新版取链接口 /member/common-play-url
    const res = await (0, ($parcel$interopDefault($aeeUC$axios))).post($f143b11fc67a70bd$export$5e032988b71f6158 + "/member/common-play-url", "id=" + encodeURIComponent(id) + "&purpose=play", {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": tempUrl,
            "User-Agent": $f143b11fc67a70bd$var$UA,
            ...cookie ? {
                Cookie: cookie
            } : {}
        },
        timeout: 30000
    });
    const d = res.data;
    if (d && d.code === 1 && d.data && d.data.url) return {
        url: d.data.url
    };
    return {
        url: ""
    };
}
async function $f143b11fc67a70bd$var$getLyric(musicItem) {
    let serchUrl = $f143b11fc67a70bd$export$5e032988b71f6158 + "/music/" + musicItem.id;
    let searchRes = (await (0, ($parcel$interopDefault($aeeUC$axios))).get(serchUrl, {
        headers: {
            "User-Agent": $f143b11fc67a70bd$var$UA,
            "Referer": $f143b11fc67a70bd$export$5e032988b71f6158 + "/"
        },
        timeout: 30000
    })).data;
    const $ = $aeeUC$cheerio.load(searchRes);
    return {
        rawLrc: $("#content-lrc").text().toString()
    };
}
async function $f143b11fc67a70bd$var$getRecommendSheetTags() {
    try {
        var result = {};
        var datas = [];
        var pinned = [];
        pinned.push({
            id: "/history/",
            title: "最新搜索"
        });
        pinned.push({
            id: "/top/yesterday",
            title: "昨日搜索"
        });
        pinned.push({
            id: "/top/week",
            title: "本周搜索"
        });
        pinned.push({
            id: "/top/month",
            title: "本月搜索"
        });
        pinned.push({
            id: "/top/last_month",
            title: "上月搜索"
        });
        datas.push({
            title: "搜索记录",
            data: pinned
        });
        result.data = datas;
        result.pinned = pinned;
        return result;
    } catch (e) {
        console.log(e);
    }
}
async function $f143b11fc67a70bd$var$getRecommendSheetsByTag(tag, page) {
    try {
        var result = {};
        var sheets = [];
        var searchUrl = "";
        if (tag.id.toString().startsWith("/history")) searchUrl = $f143b11fc67a70bd$export$5e032988b71f6158 + tag.id + page;
        else if (tag.id.toString().startsWith("/top")) searchUrl = $f143b11fc67a70bd$export$5e032988b71f6158 + tag.id + "?page=" + page;
        else if (tag.id.toString() == "") searchUrl = $f143b11fc67a70bd$export$5e032988b71f6158 + "/history/" + page;
        let searchRes = (await (0, ($parcel$interopDefault($aeeUC$axios))).get(searchUrl, {
            timeout: 5000
        })).data;
        const $ = $aeeUC$cheerio.load(searchRes);
        var rowList = $("tbody").find("tr");
        for(let i = 0; i < rowList.length; i++){
            var id = $(rowList[i]).find("td a").attr("href");
            var title = $(rowList[i]).find("td a").attr("href").toString().trim().replace("/s/", "");
            sheets.push({
                id: id,
                title: title,
                description: '"' + title + '"的搜索记录'
            });
        }
        result.data = sheets;
        result.isEnd = sheets.length < 10;
        return result;
    } catch (e) {}
}
async function $f143b11fc67a70bd$var$getMusicSheetInfo(sheetItem, page) {
    try {
        var result = {
            sheetItem: {
                ...sheetItem
            }
        };
        let searchRes = await (0, $19a45cbfdc5a1d1d$export$2e2bcd8739ae039)(sheetItem.title, page, "music");
        result.musicList = searchRes.data;
        result.isEnd = searchRes.isEnd;
    } catch (e) {
        console.log(e);
    }
    return result;
}
const $f143b11fc67a70bd$var$pluginInstance = {
    platform: "歌曲宝",
    version: "0.0.6",
    author: "SoEasy同学",
    srcUrl: "https://gitee.com/kevinr/tvbox/raw/master/musicfree/plugins/gequbao.js",
    cacheControl: "no-cache",
    supportedSearchType: [
        "music"
    ],
    search: $19a45cbfdc5a1d1d$export$2e2bcd8739ae039,
    getMediaSource: $f143b11fc67a70bd$var$getMediaSource,
    getLyric: $f143b11fc67a70bd$var$getLyric,
    getRecommendSheetTags: $f143b11fc67a70bd$var$getRecommendSheetTags,
    getRecommendSheetsByTag: $f143b11fc67a70bd$var$getRecommendSheetsByTag,
    getMusicSheetInfo: $f143b11fc67a70bd$var$getMusicSheetInfo
};
var /*search("明天会更好", 1, "music").then((res) => {
    console.log(res)
    getMediaSource(res.data[0], "standard").then((res) => {
        console.log(res)
    })
    getLyric(res.data[0]).then((res) => {
        console.log(res)
    })
})*/ /*getRecommendSheetTags().then((res) => {
    console.log(res)
    getRecommendSheetsByTag(res.data[0].data[0], 1).then((res) => {
        console.log(res)
        getMusicSheetInfo(res.data[0], 1).then((res) => {
            console.log(res);
            getMediaSource(res.musicList[0], "standard").then((res) => {
                console.log(res)
            })
            getLyric(res.musicList[0]).then((res) => {
                console.log(res)
            })
        })
    })
})*/ $f143b11fc67a70bd$export$2e2bcd8739ae039 = $f143b11fc67a70bd$var$pluginInstance;


//# sourceMappingURL=htqyy.js.map
