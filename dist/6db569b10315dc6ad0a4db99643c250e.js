var $hTj9b$axios = require("axios");
var $hTj9b$cheerio = require("cheerio");
var $hTj9b$cryptojs = require("crypto-js");
var $hTj9b$he = require("he");

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

$parcel$export(module.exports, "default", () => $28c810e89c2349b3$export$2e2bcd8739ae039);




/**
 * 星海音乐后端 (yy.zddyr.top/lx/api) 通用取链工具
 *
 * 替代已失效的 lxmusicapi.onrender.com：
 * 通过星海统一后端获取各平台播放地址（网易云/酷狗/酷我/QQ/咪咕）。
 * 服务器需先签发 token (X-Token)，token 有效期约 5 分钟，本地提前刷新。
 */ 
const $d6283ddcbc551b94$var$API_BASE = "https://yy.zddyr.top/lx/api/";
const $d6283ddcbc551b94$var$TOKEN_TTL = 240000; // 4 分钟，早于服务端 5 分钟过期
let $d6283ddcbc551b94$var$_token = "";
let $d6283ddcbc551b94$var$_tokenExpire = 0;
/** 获取(并缓存)服务器令牌 */ async function $d6283ddcbc551b94$var$ensureToken() {
    if ($d6283ddcbc551b94$var$_token && Date.now() < $d6283ddcbc551b94$var$_tokenExpire) return $d6283ddcbc551b94$var$_token;
    const deviceId = "lx-musicfree-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const res = await (0, ($parcel$interopDefault($hTj9b$axios))).get($d6283ddcbc551b94$var$API_BASE + "token.php", {
        params: {
            device_id: deviceId
        },
        headers: {
            "User-Agent": "lx-music",
            "X-Client": "LX-Music-Mobile"
        },
        timeout: 8000
    });
    const tk = res.data && res.data.data && res.data.data.token;
    if (tk) {
        $d6283ddcbc551b94$var$_token = tk;
        $d6283ddcbc551b94$var$_tokenExpire = Date.now() + $d6283ddcbc551b94$var$TOKEN_TTL;
    }
    return tk || "";
}
/** MusicFree 音质档位 -> 后端音质 */ const $d6283ddcbc551b94$var$qualityMap = {
    low: "128k",
    standard: "320k",
    high: "flac",
    super: "flac24bit"
};
/** 平台 -> 后端 source 参数 */ const $d6283ddcbc551b94$var$platformSourceMap = {
    netease: "wy",
    kugou: "kg",
    kuwo: "kw",
    qq: "qq",
    migu: "migu"
};
async function $d6283ddcbc551b94$export$2e074d413efa36c6(platform, musicItem, quality) {
    const backendSource = $d6283ddcbc551b94$var$platformSourceMap[platform];
    const q = $d6283ddcbc551b94$var$qualityMap[quality] || "320k";
    if (!backendSource) return "";
    const params = {
        source: backendSource,
        quality: q
    };
    if (backendSource === "kg") {
        // 酷狗：以 hash 为准
        const h = musicItem.id || musicItem.hash || "";
        params.songmid = h;
        params.mainHash = h;
        params.hash = h;
        params.name = musicItem.title || "";
    } else if (backendSource === "migu") {
        // 咪咕：优先 copyrightId，其次 songId/id
        params.name = musicItem.title || "";
        params.singer = musicItem.artist || "";
        params.songmid = musicItem.copyrightId || musicItem.id || "";
        params.albumName = musicItem.album || "";
    } else if (backendSource === "qq") {
        // QQ：用 songmid
        params.name = musicItem.title || "";
        params.singer = musicItem.artist || "";
        params.songmid = musicItem.songmid || musicItem.id || "";
        params.albumName = musicItem.album || "";
    } else {
        params.name = musicItem.title || "";
        params.singer = musicItem.artist || "";
        params.songmid = musicItem.id || "";
        params.albumName = musicItem.album || "";
    }
    // 注意：不能用 async 箭头函数（安卓 Hermes 引擎不支持），必须用具名 function
    async function doFetch(tokenValue) {
        return (await (0, ($parcel$interopDefault($hTj9b$axios))).get($d6283ddcbc551b94$var$API_BASE, {
            params: params,
            headers: {
                "X-Token": tokenValue,
                "User-Agent": "lx-music"
            },
            timeout: 20000
        })).data;
    }
    let tk = await $d6283ddcbc551b94$var$ensureToken();
    if (!tk) return "";
    let data = await doFetch(tk);
    // token 失效则刷新一次重试
    if (!data || data.code === 403 || data.auth && (data.auth.tk_mismatch || data.auth.tk_error)) {
        $d6283ddcbc551b94$var$_token = "";
        $d6283ddcbc551b94$var$_tokenExpire = 0;
        tk = await $d6283ddcbc551b94$var$ensureToken();
        if (tk) data = await doFetch(tk);
    }
    if (data && data.code === 200 && data.url) return String(data.url);
    return "";
}


const $28c810e89c2349b3$var$pageSize = 20;
function $28c810e89c2349b3$var$formatMusicItem(_) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    return {
        id: (_d = _.FileHash) !== null && _d !== void 0 ? _d : _.Grp[0].FileHash,
        title: (_a = _.SongName) !== null && _a !== void 0 ? _a : _.OriSongName,
        artist: (_b = _.SingerName) !== null && _b !== void 0 ? _b : _.Singers[0].name,
        album: (_c = _.AlbumName) !== null && _c !== void 0 ? _c : _.Grp[0].AlbumName,
        album_id: (_e = _.AlbumID) !== null && _e !== void 0 ? _e : _.Grp[0].AlbumID,
        album_audio_id: 0,
        duration: _.Duration,
        artwork: ((_f = _.Image) !== null && _f !== void 0 ? _f : _.Grp[0].Image).replace("{size}", "1080"),
        "320hash": (_i = _.HQFileHash) !== null && _i !== void 0 ? _i : undefined,
        sqhash: (_g = _.SQFileHash) !== null && _g !== void 0 ? _g : undefined,
        ResFileHash: (_h = _.ResFileHash) !== null && _h !== void 0 ? _h : undefined
    };
}
function $28c810e89c2349b3$var$formatMusicItem2(_) {
    var _a, _b, _c, _d, _e, _f, _g;
    return {
        id: _.hash,
        title: _.songname,
        artist: (_a = _.singername) !== null && _a !== void 0 ? _a : ((_c = (_b = _.authors) === null || _b === void 0 ? void 0 : _b.map((_)=>{
            var _a;
            return (_a = _ === null || _ === void 0 ? void 0 : _.author_name) !== null && _a !== void 0 ? _a : "";
        })) === null || _c === void 0 ? void 0 : _c.join(", ")) || ((_f = (_e = (_d = _.filename) === null || _d === void 0 ? void 0 : _d.split("-")) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.trim()),
        album: (_g = _.album_name) !== null && _g !== void 0 ? _g : _.remark,
        album_id: _.album_id,
        album_audio_id: _.album_audio_id,
        artwork: _.album_sizable_cover ? _.album_sizable_cover.replace("{size}", "400") : undefined,
        duration: _.duration,
        "320hash": _["320hash"],
        sqhash: _.sqhash,
        origin_hash: _.origin_hash
    };
}
function $28c810e89c2349b3$var$formatImportMusicItem(_) {
    var _a, _b, _c, _d, _e, _f, _g;
    let title = _.name;
    const singerName = _.singername;
    if (singerName && title) {
        const index = title.indexOf(singerName);
        if (index !== -1) title = (_a = title.substring(index + singerName.length + 2)) === null || _a === void 0 ? void 0 : _a.trim();
        if (!title) title = singerName;
    }
    const qualites = _.relate_goods;
    return {
        id: _.hash,
        title: title,
        artist: singerName,
        album: (_b = _.albumname) !== null && _b !== void 0 ? _b : "",
        album_id: _.album_id,
        album_audio_id: _.album_audio_id,
        artwork: (_d = (_c = _ === null || _ === void 0 ? void 0 : _.info) === null || _c === void 0 ? void 0 : _c.image) === null || _d === void 0 ? void 0 : _d.replace("{size}", "400"),
        "320hash": (_e = qualites === null || qualites === void 0 ? void 0 : qualites[1]) === null || _e === void 0 ? void 0 : _e.hash,
        sqhash: (_f = qualites === null || qualites === void 0 ? void 0 : qualites[2]) === null || _f === void 0 ? void 0 : _f.hash,
        origin_hash: (_g = qualites === null || qualites === void 0 ? void 0 : qualites[3]) === null || _g === void 0 ? void 0 : _g.hash
    };
}
const $28c810e89c2349b3$var$headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9"
};
async function $28c810e89c2349b3$var$searchMusic(query, page) {
    const res = (await (0, ($parcel$interopDefault($hTj9b$axios))).get("https://songsearch.kugou.com/song_search_v2", {
        headers: $28c810e89c2349b3$var$headers,
        params: {
            keyword: query,
            page: page,
            pagesize: $28c810e89c2349b3$var$pageSize,
            userid: 0,
            clientver: "",
            platform: "WebFilter",
            filter: 2,
            iscorrection: 1,
            privilege_filter: 0,
            area_code: 1
        }
    })).data;
    const songs = res.data.lists.map($28c810e89c2349b3$var$formatMusicItem);
    return {
        isEnd: page * $28c810e89c2349b3$var$pageSize >= res.data.total,
        data: songs
    };
}
async function $28c810e89c2349b3$var$searchAlbum(query, page) {
    const res = (await (0, ($parcel$interopDefault($hTj9b$axios))).get("http://msearch.kugou.com/api/v3/search/album", {
        headers: $28c810e89c2349b3$var$headers,
        params: {
            version: 9108,
            iscorrection: 1,
            highlight: "em",
            plat: 0,
            keyword: query,
            pagesize: 20,
            page: page,
            sver: 2,
            with_res_tag: 0
        }
    })).data;
    const albums = res.data.info.map((_)=>{
        var _a, _b;
        return {
            id: _.albumid,
            artwork: (_a = _.imgurl) === null || _a === void 0 ? void 0 : _a.replace("{size}", "400"),
            artist: _.singername,
            title: (0, $hTj9b$cheerio.load)(_.albumname).text(),
            description: _.intro,
            date: (_b = _.publishtime) === null || _b === void 0 ? void 0 : _b.slice(0, 10)
        };
    });
    return {
        isEnd: page * 20 >= res.data.total,
        data: albums
    };
}
async function $28c810e89c2349b3$var$searchMusicSheet(query, page) {
    const res = (await (0, ($parcel$interopDefault($hTj9b$axios))).get("http://mobilecdn.kugou.com/api/v3/search/special", {
        headers: $28c810e89c2349b3$var$headers,
        params: {
            format: "json",
            keyword: query,
            page: page,
            pagesize: $28c810e89c2349b3$var$pageSize,
            showtype: 1
        }
    })).data;
    const sheets = res.data.info.map((item)=>({
            title: item.specialname,
            createAt: item.publishtime,
            description: item.intro,
            artist: item.nickname,
            coverImg: item.imgurl,
            gid: item.gid,
            playCount: item.playcount,
            id: item.specialid,
            worksNum: item.songcount
        }));
    return {
        isEnd: page * $28c810e89c2349b3$var$pageSize >= res.data.total,
        data: sheets
    };
}
const $28c810e89c2349b3$var$qualityLevels = {
    low: "128k",
    standard: "320k",
    high: "flac",
    super: "flac24bit"
};
async function $28c810e89c2349b3$var$getMediaSource(musicItem, quality) {
    // 酷狗：通过星海后端取链（替代已失效的 lxmusicapi.onrender.com）
    const url = await (0, $d6283ddcbc551b94$export$2e074d413efa36c6)("kugou", musicItem, quality);
    return {
        url: url
    };
}
async function $28c810e89c2349b3$var$getTopLists() {
    const lists = (await (0, ($parcel$interopDefault($hTj9b$axios))).get("http://mobilecdnbj.kugou.com/api/v3/rank/list?version=9108&plat=0&showtype=2&parentid=0&apiver=6&area_code=1&withsong=0&with_res_tag=0", {
        headers: $28c810e89c2349b3$var$headers
    })).data.data.info;
    const res = [
        {
            title: "热门榜单",
            data: []
        },
        {
            title: "特色音乐榜",
            data: []
        },
        {
            title: "全球榜",
            data: []
        }
    ];
    const extra = {
        title: "其他",
        data: []
    };
    lists.forEach((item)=>{
        var _a, _b, _c, _d;
        if (item.classify === 1 || item.classify === 2) res[0].data.push({
            id: item.rankid,
            description: item.intro,
            coverImg: (_a = item.imgurl) === null || _a === void 0 ? void 0 : _a.replace("{size}", "400"),
            title: item.rankname
        });
        else if (item.classify === 3 || item.classify === 5) res[1].data.push({
            id: item.rankid,
            description: item.intro,
            coverImg: (_b = item.imgurl) === null || _b === void 0 ? void 0 : _b.replace("{size}", "400"),
            title: item.rankname
        });
        else if (item.classify === 4) res[2].data.push({
            id: item.rankid,
            description: item.intro,
            coverImg: (_c = item.imgurl) === null || _c === void 0 ? void 0 : _c.replace("{size}", "400"),
            title: item.rankname
        });
        else extra.data.push({
            id: item.rankid,
            description: item.intro,
            coverImg: (_d = item.imgurl) === null || _d === void 0 ? void 0 : _d.replace("{size}", "400"),
            title: item.rankname
        });
    });
    if (extra.data.length !== 0) res.push(extra);
    return res;
}
async function $28c810e89c2349b3$var$getTopListDetail(topListItem) {
    const res = await (0, ($parcel$interopDefault($hTj9b$axios))).get(`http://mobilecdnbj.kugou.com/api/v3/rank/song?version=9108&ranktype=0&plat=0&pagesize=100&area_code=1&page=1&volid=35050&rankid=${topListItem.id}&with_res_tag=0`, {
        headers: $28c810e89c2349b3$var$headers
    });
    return Object.assign(Object.assign({}, topListItem), {
        musicList: res.data.data.info.map($28c810e89c2349b3$var$formatMusicItem2)
    });
}
async function $28c810e89c2349b3$var$getLyricDownload(lyrdata) {
    const result = (await (0, ($parcel$interopDefault($hTj9b$axios)))({
        // url: `http://lyrics.kugou.com/download?ver=1&client=pc&id=${lyrdata.id}&accesskey=${lyrdata.accessKey}&fmt=krc&charset=utf8`,
        url: `http://lyrics.kugou.com/download?ver=1&client=pc&id=${lyrdata.id}&accesskey=${lyrdata.accessKey}&fmt=lrc&charset=utf8`,
        headers: {
            "KG-RC": 1,
            "KG-THash": "expand_search_manager.cpp:852736169:451",
            "User-Agent": "KuGou2012-9020-ExpandSearchManager"
        },
        method: "get",
        xsrfCookieName: "XSRF-TOKEN",
        withCredentials: true
    })).data;
    return {
        rawLrc: (0, ($parcel$interopDefault($hTj9b$he))).decode((0, ($parcel$interopDefault($hTj9b$cryptojs))).enc.Base64.parse(result.content).toString((0, ($parcel$interopDefault($hTj9b$cryptojs))).enc.Utf8))
    };
}
// copy from lxmusic https://github.com/lyswhut/lx-music-desktop/blob/master/src/renderer/utils/musicSdk/kg/lyric.js#L114
async function $28c810e89c2349b3$var$getLyric(musicItem) {
    const result = (await (0, ($parcel$interopDefault($hTj9b$axios)))({
        url: `http://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=${musicItem.title}&hash=${musicItem.id}&timelength=${musicItem.duration}`,
        headers: {
            "KG-RC": 1,
            "KG-THash": "expand_search_manager.cpp:852736169:451",
            "User-Agent": "KuGou2012-9020-ExpandSearchManager"
        },
        method: "get",
        xsrfCookieName: "XSRF-TOKEN",
        withCredentials: true
    })).data;
    const info = result.candidates[0];
    return await $28c810e89c2349b3$var$getLyricDownload({
        id: info.id,
        accessKey: info.accesskey
    });
}
async function $28c810e89c2349b3$var$getAlbumInfo(albumItem, page = 1) {
    const res = (await (0, ($parcel$interopDefault($hTj9b$axios))).get("http://mobilecdn.kugou.com/api/v3/album/song", {
        params: {
            version: 9108,
            albumid: albumItem.id,
            plat: 0,
            pagesize: 100,
            area_code: 1,
            page: page,
            with_res_tag: 0
        }
    })).data;
    return {
        isEnd: page * 100 >= res.data.total,
        albumItem: {
            worksNum: res.data.total
        },
        musicList: res.data.info.map((_)=>{
            var _a;
            const [artist, songname] = _.filename.split("-");
            return {
                id: _.hash,
                title: songname.trim(),
                artist: artist.trim(),
                album: (_a = _.album_name) !== null && _a !== void 0 ? _a : _.remark,
                album_id: _.album_id,
                album_audio_id: _.album_audio_id,
                artwork: albumItem.artwork,
                "320hash": _.HQFileHash,
                sqhash: _.SQFileHash,
                origin_hash: _.id
            };
        })
    };
}
async function $28c810e89c2349b3$var$search(query, page, type) {
    if (type === "music") return await $28c810e89c2349b3$var$searchMusic(query, page);
    else if (type === "album") return await $28c810e89c2349b3$var$searchAlbum(query, page);
    else if (type === "sheet") return await $28c810e89c2349b3$var$searchMusicSheet(query, page);
}
const $28c810e89c2349b3$var$pluginInstance = {
    platform: "小枸音乐",
    author: "SoEasy同学",
    version: "0.0.4",
    srcUrl: "https://gitee.com/kevinr/tvbox/raw/master/musicfree/plugins/xiaogou.js",
    cacheControl: "no-cache",
    primaryKey: [
        "id",
        "album_id",
        "album_audio_id"
    ],
    hints: {
        importMusicSheet: [
            "仅支持酷狗APP通过酷狗码导入，输入纯数字酷狗码即可。",
            "导入时间和歌单大小有关，请耐心等待"
        ],
        importMusicItem: []
    },
    supportedSearchType: [
        "music",
        "album",
        "sheet"
    ],
    search: $28c810e89c2349b3$var$search,
    getMediaSource: $28c810e89c2349b3$var$getMediaSource,
    getTopLists: $28c810e89c2349b3$var$getTopLists,
    getLyric: $28c810e89c2349b3$var$getLyric,
    getTopListDetail: $28c810e89c2349b3$var$getTopListDetail,
    getAlbumInfo: $28c810e89c2349b3$var$getAlbumInfo
};
$28c810e89c2349b3$var$search("童话镇", 1, "music").then((res)=>{
    console.log(res);
    $28c810e89c2349b3$var$getMediaSource(res.data[0], "standard").then((res)=>{
        console.log(res);
    });
    $28c810e89c2349b3$var$getLyric(res.data[0]).then((res)=>{
        console.log(res);
    });
});
var $28c810e89c2349b3$export$2e2bcd8739ae039 = $28c810e89c2349b3$var$pluginInstance;


//# sourceMappingURL=htqyy.js.map
