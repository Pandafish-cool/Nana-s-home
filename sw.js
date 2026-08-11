var CACHE = "nana-home-v5";
// 跨境链路会把大文件截断成"下了一半但连接正常关闭"。index.html 有一百多万字节，
// 一旦把残文件存进缓存，下次打开就是白屏。存之前和取出来之前都验一遍完整性。
var HTML_MIN = 400000;
var htmlOk = function (t) { return !!t && t.length > HTML_MIN && t.lastIndexOf("</html>") > t.length - 400; };
var putHtml = function (t) {
  if (!htmlOk(t)) return;
  caches.open(CACHE).then(function (c) {
    c.put("index.html", new Response(t, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
  });
};
var ASSETS = ["./", "index.html", "disney_fireworks.jpg", "stella_theater.jpg", "stella_gift.jpg", "icon-192.png", "icon-512.png", "manifest.json"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url;
  try { url = new URL(e.request.url); } catch (_) { return; }
  // Never intercept media or Range requests — let the browser stream them natively.
  // SW caching breaks <audio>/<video> playback (it can't serve partial 206 responses),
  // which makes songs fail to play. Bypass the SW entirely for these.
  if (e.request.headers.has("range") ||
      e.request.destination === "audio" || e.request.destination === "video" ||
      /\.(mp3|m4a|aac|ogg|oga|wav|flac|mp4|webm|mov)$/i.test(url.pathname)) {
    return;
  }
  // 跨域数据接口（Supabase 等）不走缓存，直连
  var isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== self.location.origin && !isFont) return;
  var isNav = e.request.mode === "navigate" || (e.request.destination === "document");
  if (isNav) {
    // 秒开策略：有缓存就立刻用缓存渲染，同时后台静默拉新版本（下次打开生效）
    // 但缓存里的必须是完整的 HTML，残文件一律丢掉走网络
    e.respondWith(
      caches.match("index.html").then(function (cached) {
        var network = fetch(e.request).then(function (res) {
          if (res && res.status === 200) {
            res.clone().text().then(putHtml)["catch"](function () {});
          }
          return res;
        });
        if (!cached) return network["catch"](function () { return caches.match("index.html"); });
        return cached.clone().text().then(function (t) {
          if (htmlOk(t)) {
            network["catch"](function () {});
            return new Response(t, { headers: { "Content-Type": "text/html; charset=utf-8" } });
          }
          caches.open(CACHE).then(function (c) { c["delete"]("index.html"); });   // 残的，扔掉
          return network["catch"](function () { return cached; });
        })["catch"](function () { return network["catch"](function () { return cached; }); });
      })
    );
    return;
  }
  // 静态资源与字体：缓存优先，miss 时联网并回填
  e.respondWith(
    caches.match(e.request).then(function (m) {
      return m || fetch(e.request).then(function (res) {
        var ok = res && (res.status === 200 || res.type === "opaque");
        if (ok && (res.type === "basic" || isFont)) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      });
    })
  );
});
