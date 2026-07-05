# 🏡 Nana's Home 功能总览文档

> 网站：https://pandafish-cool.github.io/Nana-s-home/
> 代码：全部在 `index.html`（React.createElement 写法，无 JSX）。彩蛋细则见 `EASTER_EGGS.md`。
> 上线方式：改代码 → 合并到 `main` → GitHub Pages 自动部署（约 1 分钟）。
> _最后更新：2026-07-05_

---

## 一、首页（从上往下）

| 板块 | 说明 |
|---|---|
| 🌅 问候横幅 `HeroBanner` | 开门第一眼：按时间/工作日切换场景与暖心文案，含时间/电量小组件 |
| 📝 便签卡组 `HomeDeck` | 每天 5 张便签（工作日=温暖港湾 / 周末=慵懒搞笑），一周不重样，手动点击翻页；含特殊薄荷绿叮嘱便签 |
| 🔋 Nana 的充电站 | 香港 🚢 / 迪士尼 🏰 回忆卡 |
| 🍸 酒蒙子雷达 `BarTastingList` | 广州探店卡（详见下） |
| 🎧 Nana 随身听 `NanaMixtapeCard` | 本地 mp3 播放器：列表循环/单曲循环/跨房间迷你条/午夜晚安彩蛋 |
| 🍚 今天好好吃饭 `MealCheckIn` | 三餐打卡；连续 7 天午餐触发饭盒抽奖（礼品券） |
| 🏠 房间地图 `HouseMap` | 郁金香花园 + 全部房间入口 |

**底部导航**：首页 · 客厅 · 卧室 · 盥洗室 · **游乐场** · 更多（其余房间在抽屉里）

---

## 二、🍸 酒蒙子雷达（广州探店卡）

- **6 家店**：La Table / 旧亭台bar / 屿秋Withchill / 老鹰威士忌吧 / 万金游·中餐Bistro / CANTINA AAH
- 横向滑动小卡，**待酒在前**（没去过的排前面），右上角计数「**酒了 X/6**」
- 点小卡 → **app 内弹层**：店铺特色 + 标签 + ⭐大众点评公开分
- 弹层内「🍸 酒后感」：点选 **👍不错 / 👎不得行**（存本机 `nana-bar-reviews`）
- **📷 随手拍**：拍店里的酒/环境（照片进本机 IndexedDB）
- 蓝色「📍 查看地址 · 去高德」按钮：高德深链免登陆直达店铺
- **改店铺**：改 `BarTastingList` 里的 `LIST` 数组（id/emoji/店名/高德关键词/区域/评分/标签/特色）

---

## 三、🎪 游乐场（原游戏室升级）

**大厅** `FunRoomLobby`：满屏游乐园夜景 —— 🎡摩天轮旋转、🎠木马、三角彩旗、✦星星、🎆烟花、🍿小卖部、草地上 🐈散步猫 + 🏮灯笼 + 🌷花，浮动「← 回家」按钮。

四个馆（点建筑进入）：

### 🎬 电影院 `CinemaActivity`
- **今晚看什么？抽一部！**：随机抽片动画；清单里标了 🌟想看 就只从想看里抽
- **观影清单**：14 部预置 + 可自己加片；状态循环 `加入 → 🌟想看 → ✅看过`（看过可打 ⭐1-5）
- 数据：`nana-films` / `nana-films-custom`

### 🎮 游戏室 `GameActivity`
- 12+ 台小游戏（俄罗斯方块/贪吃蛇/2048/记忆/马里奥/赛车/乒乓/太空/打靶/Stella跳跳/节奏星星/坦克…）
- 可全屏玩

### 📚 阅读室 `ReadingRoomActivity`
- **✍️ 读书笔记（信纸）**：
  - 写之前可 **选信纸**：💌航空 / 🌙星夜 / 🌿薄荷 / 🍑蜜桃（选择有记忆 `nana-note-theme`）
  - 信纸全套装饰：信封斜纹边、邮票、和纸胶带、横线红边线、水彩晕染、水印
  - 可 **📷 贴张照片**（拍立得样式，尺寸可选 **小/中/大**）
  - 「📮 收进小本本」保存；每张小笺记住自己的信纸和照片尺寸
  - **💌 分享**：点粉色胶囊 → 选信纸样式 → canvas 生成精美信纸图片 → 系统分享面板发微信/存相册
  - 删除两步确认「再点一下撕掉」
- **📚 我的书单**：加书；状态循环 `🌟想读 → 📖在读 → ✅读完`（图标跟着变、读完划线计数）
- 数据：`nana-reading-notes` / `nana-books`

### 📸 咔嚓小站 `PhotoBoothActivity`
- 拍一张（或从相册选）→ 配一句话 → 「📌 贴上墙」
- 双列歪斜 **拍立得墙**（配字 + 日期），点图全屏看，✕ 两步确认撕掉
- 数据：`nana-photo-diary`

**🛁 彩蛋**：大厅草地右侧小浴缸，点一下歪头说「游乐场露天泡澡，快乐加倍 🫧」

**⌨️ 游乐场奖励**：四个馆**第一次累计进 30 次** → 弹翻金币抽奖 → 「⌨️ Nana 专属键盘券」进奖励钱包；**一次性奖励**，领过不再触发（数据 `nana-fun-plays` / `nana-fun-claimed`）

---

## 四、📷 拍照系统（三处入口）

| 入口 | 位置 |
|---|---|
| 读书小笺贴照片 | 阅读室写笔记时 |
| 探店随手拍 | 酒蒙子雷达店铺弹层 |
| 拍立得日记 | 咔嚓小站 |

- 手机上点按钮 → 弹「拍照 / 从相册选」
- 照片 canvas 压缩（最长边 900px JPEG）后存 **IndexedDB（`nana-photos`）**
- **全部本机私密，不上传任何服务器**；删记录连带清照片
- 点任意照片 → 全屏看图

---

## 五、💌 信纸分享（读书笔记）

- 每张小笺点 💌 → 「选个信纸样式」面板（四款）→ canvas 手绘完整信纸图片：
  航空斜纹边、邮票、和纸胶带、横线、她写的字、贴的照片（按小/中/大缩放）、
  「—— 来自 Nana 的小笺 💌」落款
- 手机走 `navigator.share` 系统分享面板（发微信 / 存相册）；不支持时自动下载 PNG
- 改配色/加新款信纸：改 `NANA_LETTER_THEMES` 数组

---

## 六、其它房间/彩蛋（简表，细则见 EASTER_EGGS.md）

- 客厅（电视/读书/小食）· 卧室（睡觉/睡眠记录/日记）· 盥洗室 · 花园 · 窗边 · 音乐室（钢琴）· 泳池 · 酒吧（调酒/点歌/氛围）· 雪茄房 · 车库 · 厨房（菜谱）
- 🌙 午夜播「月の光」触发晚安动画 · 🍽️ 连续7天午餐抽饭盒 · 🎈 每年6/1儿童节彩蛋
- 🎁 奖励钱包 `RewardsWallet`：收所有抽到的券

---

## 七、localStorage / IndexedDB 键总表

| 键 | 用途 |
|---|---|
| `nana-meals` / `nana-meal-streak` | 三餐打卡 / 午餐连续天数 |
| `nana-rewards` | 奖励钱包 |
| `nana-bar-reviews` / `nana-bar-photos` | 探店 酒后感 / 随手拍索引 |
| `nana-films` / `nana-films-custom` | 观影清单标记 / 自加影片 |
| `nana-reading-notes` / `nana-books` / `nana-note-theme` | 读书笔记 / 书单 / 默认信纸 |
| `nana-photo-diary` | 拍立得日记索引 |
| `nana-fun-plays` / `nana-fun-claimed` | 游乐场畅玩次数 / 已领奖水位 |
| IndexedDB `nana-photos` | 所有照片本体 |
| `nana-game-streak` | （旧游戏连胜，仍记录不再触发） |

---

## 八、音乐清单（随身听）

Epilogue(La La Land) · Hotline Bling(Slowed) · Tied Up · Running Up That Hill ·
Have You Ever · Still A Rose · You're On My Mind · All I Have · You Didn't Need My Love ·
GTFO · cédes · Easy Interlude · 月の光〜good night(压轴·午夜彩蛋)

加歌：mp3 放仓库根目录（文件名用英文），在 `NanaMixtapeCard` 的 `tracks` 加一行。
