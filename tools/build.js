// 从 app.html 生成上线要的三个文件：
//   index.html  引导页（很小，压缩后十几 KB；老版本一秒就能下完装上，然后由它把真正的小屋分段搬进来）
//   index.bin   app.html 一模一样的副本（不压缩，好按字节分段下）
//   version.txt 版本号
// 用法：node tools/build.js   （在 main 上、cherry-pick 之后跑）
var fs = require("fs"), path = require("path");
var root = path.join(__dirname, "..");
var app = fs.readFileSync(path.join(root, "app.html"), "utf8");
var m = /var NANA_VER = "([^"]+)"/.exec(app);
if (!m) throw new Error("app.html 里没找到 NANA_VER");
var ver = m[1];
// 每段脚本都得能编译
var re = /<script\b[^>]*>([\s\S]*?)<\/script>/g, mm, blocks = 0;
while ((mm = re.exec(app))) { blocks++; if (/\ssrc=/.test(mm[0].slice(0, 120))) continue; new Function(mm[1]); }
if (app.indexOf("<!--nana-" + "bootstrap-->") >= 0) throw new Error("app.html 里不该有引导页标记");
var tpl = fs.readFileSync(path.join(__dirname, "boot-template.html"), "utf8");
// 老版本的更新代码只认「超过 40 万字、结尾是 </html>」的页面：塞一段空格进去（gzip 之后几乎不占字节）
var pad = new Array(420001).join(" ");
var boot = tpl.replace(/__VER__/g, ver).replace("<!--__PAD__-->", "<!--" + pad + "-->");
re.lastIndex = 0;
while ((mm = re.exec(boot))) { new Function(mm[1]); }
fs.writeFileSync(path.join(root, "index.html"), boot);
fs.writeFileSync(path.join(root, "index.bin"), app);
fs.writeFileSync(path.join(root, "version.txt"), ver + "\n");
console.log("built " + ver + " · app.html " + blocks + " blocks · index.html " + boot.length + " chars");
