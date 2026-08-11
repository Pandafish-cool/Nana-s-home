var CACHE = "nana-home-v6";
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
// 预缓存改成一个一个来。addAll 是全有或全无 —— 跨境链路上随便哪个文件没下来，
// 整个安装就失败，新版本永远装不上，坏掉的旧缓存也就一直留着。
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (u) {
        return fetch(u, { cache: "no-store" }).then(function (r) {
          if (!r || !r.ok) return null;
          if (u === "index.html" || u === "./") {
            return r.clone().text().then(function (t) { if (htmlOk(t)) return c.put(u, new Response(t, { headers: { "Content-Type": "text/html; charset=utf-8" } })); });
          }
          return c.put(u, r);
        })["catch"](function () { return null; });
      }));
    })["catch"](function () {}).then(function () { return self.skipWaiting(); })
  );
});
// 实在拿不到任何完整页面时的自救页，保证永远不会是一片白
var RESCUE = '<!doctype html><html lang="zh"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1"><title>\u5C0F\u5C4B</title>' +
  '<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FFF8F7;' +
  'font-family:-apple-system,"PingFang SC",system-ui;color:#5a4340;padding:28px}' +
  '.b{max-width:340px;text-align:center}h1{font-size:1.15rem;margin:14px 0 8px}' +
  'p{font-size:0.86rem;line-height:1.8;color:#8a6a64;margin:0 0 18px}' +
  'button{border:none;border-radius:999px;padding:13px 26px;font-size:0.92rem;font-weight:800;' +
  'background:linear-gradient(135deg,#f27a9a,#d9537a);color:#fff;cursor:pointer}' +
  '.s{margin-top:14px;font-size:0.72rem;color:#b09a95}</style></head><body><div class="b">' +
  '<div style="font-size:2.6rem">\uD83C\uDFE1</div><h1>\u5C0F\u5C4B\u6CA1\u6253\u5F00</h1>' +
  '<p>\u7F51\u4E0D\u597D\u7684\u65F6\u5019\uFF0C\u9875\u9762\u53EF\u80FD\u53EA\u4E0B\u5230\u4E00\u534A\u3002<br>' +
  '\u70B9\u4E00\u4E0B\u628A\u5B58\u7684\u4E1C\u897F\u6E05\u6389\u91CD\u6765\u5C31\u597D\uFF0C<br>' +
  '\u4F60\u5199\u7684\u4FE1\u548C\u6E05\u5355\u90FD\u5728\u4E91\u4E0A\uFF0C\u4E0D\u4F1A\u4E22\u3002</p>' +
  '<button id="fix">\u4FEE\u4E00\u4E0B\uFF0C\u91CD\u65B0\u8FDB\u5C4B</button><div class="s" id="st"></div></div><script>' +
  'document.getElementById("fix").onclick=function(){var st=document.getElementById("st");st.textContent="\u6E05\u7406\u4E2D\u2026";' +
  'var p=[];if(window.caches)p.push(caches.keys().then(function(k){return Promise.all(k.map(function(x){return caches.delete(x)}))}));' +
  'if(navigator.serviceWorker)p.push(navigator.serviceWorker.getRegistrations().then(function(r){return Promise.all(r.map(function(x){return x.unregister()}))}));' +
  'Promise.all(p)["catch"](function(){}).then(function(){setTimeout(function(){location.replace("./?fix="+Date.now())},400)})};' +
  '<\/script></body></html>';
var rescue = function () { return new Response(RESCUE, { headers: { "Content-Type": "text/html; charset=utf-8" } }); };
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
        if (!cached) return network.then(function (r) { return r || rescue(); })["catch"](rescue);
        return cached.clone().text().then(function (t) {
          if (htmlOk(t)) {
            network["catch"](function () {});
            return new Response(t, { headers: { "Content-Type": "text/html; charset=utf-8" } });
          }
          caches.open(CACHE).then(function (c) { c["delete"]("index.html"); });   // 残的，扔掉
          return network.then(function (r) { return r || rescue(); })["catch"](rescue);
        })["catch"](function () { return network["catch"](rescue); });
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
