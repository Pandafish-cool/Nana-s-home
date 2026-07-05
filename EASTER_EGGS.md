# 🎉 Nana Home 彩蛋规则文档

> 所有代码都在 **`index.html`**（用 `React.createElement` 写，没有 JSX）。
> 下面用「函数名 + 关键代码行」定位，**不用行号**（行号会随改动变化，搜代码行最稳）。
> 改完记得自测：浏览器打开页面看效果；上线就是合并到 `main`。

---

## 一、彩蛋总览

| 彩蛋 | 触发方式 | 现在的条件 | 是否还会触发 |
|---|---|---|---|
| 🎮 游戏连胜 | 行为 | **连续**玩游戏满 7 天（每 7 天一次） | ✅ 一直有效 |
| 🍽️ 好好吃饭 | 行为 | **连续吃午饭**满 7 天触发（断了清零）；奖品**待定** | ✅ 一直有效 |
| 🌙 午夜晚安 | 行为+时间 | **午夜(23:00–00:59)** 播放「月の光 ～ good night」→ 弹晚安动画 | ✅ 一直有效 |
| 🎈 儿童节 | 日期 | 每年 6/1 进门 | ✅ 每年 6/1 |
| 📚 Study Day | 日期 | 2026/6/5 白天 | ⛔ 已过期 |
| 🛋️ 别怕·安慰 | 日期 | 2026/6/5 15:00 ~ 6/6 09:00 | ⛔ 已过期 |
| 🌧️ 下雨好眠 | 日期 | 2026/6/9 09:00 前 | ⛔ 已过期 |

奖励券统一收进 **奖励钱包**（localStorage 键 `nana-rewards`，组件 `RewardsWallet`）。

---

## 二、🍽️ 好好吃饭彩蛋

**组件**：`MealCheckIn`（弹窗组件 `MealLotteryEgg`）

### 现在的逻辑（已改为：连续 7 天午餐）
- **只有勾「午饭」才计数**；用 `nana-meal-streak`（`{last, streak, claimed}`）记连续天数，接不上昨天就从 1 重新算。
- 触发在 `check()` 里（包在 `if (id === "lunch")` 内）：
```js
if ((ms.streak || 0) >= (ms.claimed || 0) + 7) setShowLottery(true); // ← 7 = 连续午餐天数阈值
```
- 关闭抽奖时（`MealLotteryEgg` 的 `onClose`）更新水位：
```js
ms.claimed = Math.floor((ms.streak || 0) / 7) * 7;
```
➡️ 即：**连续吃午饭满 7 天触发一次；之后要再连续 7 天才会再来。中间哪天没勾午饭，连续就清零重算。**

### 改触发天数
把 `check()` 里的 `+ 7` 和 `onClose` 里的 `/ 7) * 7` 一起改成同一个数字（例如 5、10）。

### 改成「任意一餐」都算
把 `check()` 里那层 `if (id === "lunch") { ... }` 去掉（让早/午/晚任意一餐都计数）。

### 改成「累计」而非「连续」（断了不清零）
把 `check()` 的午餐计数段换成累计版：
```js
if (id === "lunch") {
  var ds = JSON.parse(localStorage.getItem("nana-meal-days") || "[]");
  if (ds.indexOf(today) < 0) { ds.push(today); localStorage.setItem("nana-meal-days", JSON.stringify(ds)); }
  var rw = parseInt(localStorage.getItem("nana-meal-reward") || "0", 10);
  if (ds.length >= rw + 7) setShowLottery(true);
}
```
并把 `onClose` 改回 `localStorage.setItem("nana-meal-reward", String(ds.length))`。

### 奖励内容（当前：饭盒抽奖 → 礼品券）
- 抽奖盒子是 **🍱 饭盒**（`phase === "pick"` 里 `[0,1,2].map` 的 `"🍱"`），点一个"打卡"。
- 戳开得到「🎁 Nana 礼品券」，内容写着「**你猜是什么？🤫 请和商家联系～ 📞**」。
- 想换奖品/文案，在 `MealLotteryEgg` 改两处并保持一致：
  1. `nanaAddReward({ ... title, sub ... })`（存进卡包的内容）
  2. `phase === "win"` 展示卡片里的标题/描述文字

---

## 二·五、🌙 午夜晚安彩蛋

**组件**：`GoodNightEgg`（弹窗）+ `NanaMixtapeCard`（随身听播放器里触发）。

- 触发：播放器开始播放某首**标了 `goodnight: true`** 的歌、且当前是**午夜 23:00–00:59** 时，弹出晚安动画（月亮+星空+飘 z + "晚安，Nana"）。
- 触发代码在 `NanaMixtapeCard` 的 `triggerGN()`：
```js
var triggerGN = function () { var hh = new Date().getHours(); if (cur.goodnight && (hh >= 23 || hh < 1)) setShowGN(true); };
```
（在两处 `play().then(...)` 成功回调里调用）
- 现在挂在「月の光 ～ good night」这首上（`tracks` 里该条加了 `goodnight: true`）。想换别的歌触发，把 `goodnight: true` 移到那条即可。
- 改时间窗：改 `hh >= 23 || hh < 1`。改文案/动画：改 `GoodNightEgg` 组件。

## 三、🎮 游戏连胜彩蛋

**组件**：`GameActivity`（弹窗 `GameStreakEgg`），localStorage 键 `nana-game-streak`（`{last, streak, claimed}`）。

- 每天玩游戏记一次；**连续**才累加，断了从 1 重算（`s.streak = s.last === y ? streak+1 : 1`）。
- 触发行（在 `GameActivity` 里）：
```js
if ((s.streak || 0) >= (s.claimed || 0) + 7) setShowGameLottery(true); // ← 改这个 7 = 连续天数
```
- 奖励：「⌨️ Nana 专属键盘券」（在 `GameStreakEgg` 的 `nanaAddReward({...})` 改文案）。

---

## 四、📅 日期彩蛋（儿童节 / Study Day / 别怕 / 下雨好眠）

**位置**：组件 `NanasHome` → `SplashScreen` 的 `onEnter`（进门那一刻判断日期）。
四个开关：`setShowEgg`(儿童节)、`setShowEgg2`(Study Day)、`setShowEgg3`(别怕)、`setShowEgg4`(下雨好眠)。

```js
var _ed = new Date();
// ⚠️ getMonth() 从 0 开始：0=1月 … 5=6月 … 11=12月
if (_ed.getMonth() === 5 && _ed.getDate() === 1) setShowEgg(true);                 // 每年 6/1 儿童节
var _cf = _ed.getFullYear() === 2026 && _ed.getMonth() === 5 && (_ed.getDate() === 5 && _ed.getHours() >= 15 || _ed.getDate() === 6 && _ed.getHours() < 9);
if (_cf) setShowEgg3(true);                                                        // 别怕：6/5 15点 ~ 6/6 9点
else if (_ed.getFullYear() === 2026 && _ed.getMonth() === 5 && _ed.getDate() === 5) setShowEgg2(true); // Study Day：6/5 白天
if (_ed.getFullYear() === 2026 && _ed.getMonth() === 5 && _ed.getDate() === 9 && _ed.getHours() < 9) setShowEgg4(true); // 下雨好眠：6/9 早上9点前
```

### 怎么改
- **改日期**：改 `getMonth()`（月份-1）和 `getDate()` 的数字。
- **改成每年都触发**：删掉 `_ed.getFullYear() === 2026 &&` 这段年份判断。
- **加新日期彩蛋**：① 新建一个弹窗组件（照着 `ChildrensDayEgg` 复制改文案/动画）；② 在 `NanasHome` 加一个 `showEggX/setShowEggX` 状态；③ 在上面 `onEnter` 加一行日期判断 `setShowEggX(true)`；④ 在渲染处加 `showEggX && h(你的组件, { onClose: ()=>setShowEggX(false) })`。

### 各彩蛋文案位置（改字就在对应组件里）
- `ChildrensDayEgg`：「祝 Nana 小朋友 儿童节快乐 🌈」
- `StudyDayEgg`：「今天是 Study Day · 激情满满的一天」
- `ComfortEgg`：「别怕别怕，Nana…玩偶们守在门口」
- `RainSleepEgg`：「外面下雨了，但屋里很暖…」+「💡 关灯睡觉」按钮

---

## 五、用到的 localStorage 键（清缓存/调试用）

| 键 | 含义 |
|---|---|
| `nana-meals` | 今天勾了哪几餐 `{date, meals}` |
| `nana-meal-streak` | 午餐**连续**打卡 `{last, streak, claimed}`（吃饭彩蛋用） |
| `nana-game-streak` | 游戏连胜 `{last, streak, claimed}` |
| `nana-rewards` | 奖励钱包里的所有券 |
| ~~`nana-bar-tasted`~~ | （已弃用）旧版「评鉴官」打卡用；现在评鉴改由 `LIST` 里的 `v`/`note` 直接提交，不再用 localStorage |
| `nana-bar-scratch-<日期>` | 当天的周末刮刮乐是否已刮开（周末刮刮乐已退役，此键弃用） |
| `nana-meal-days` / `nana-meal-reward` | （旧"累计"版用，现已弃用；切回累计版时才需要） |

> 测试吃饭彩蛋：控制台执行
> `localStorage.setItem("nana-meal-streak", JSON.stringify({last:null,streak:6,claimed:0}))`
> 然后勾一次「午饭」，连续数到 7 就会触发抽奖。

---

## 六、其它相关惊喜（非弹窗彩蛋）
- **🍸 酒蒙子雷达（广州探店评鉴卡）** `BarTastingList`：首页横向滑动小卡（在 香港/迪士尼 回忆卡下方），列 6 家广州收藏店铺。**点小卡 → app 内底部弹层**：显示 店铺特色 `feat` + 标签 `tags` + 公开评分 `r`。
  - **弹层内可交互评价**：点 👍不错 / 👎不得行（态度 `v`），存本机 `localStorage("nana-bar-reviews")`（`{id:{v,note}}`），即时生效、**只在这台设备可见**（想公开：把评价发我我提交进 `LIST` 的 `d.v`/`d.note`，或后续接免费云端实时同步）。弹层底部有独立**蓝色「📍查看地址·去高德」**按钮（`amap()` 深链，免登陆）。
  - **评语 note**：目前 app 内不写（写评语框已去掉），只能由代码里 `LIST` 的 `d.note` 提交展示。卡片本机评价读 `getV/getNote`（本机覆盖 > 代码里的 `d.v/d.note`）。
  - **排序**：没评过的（待酒）排前面，评过的沉到后面（`reviewed()` + 稳定排序）。未评占位「种草中，还没拔草 🌱」；已评无评语显示「打卡过啦 ✓」。右上计数「酒了 X/6」= 已评鉴数。⭐ 是大众点评公开分，仅作参考。
  - 改店铺：在 `LIST` 数组增删（`{id, e 品类emoji, n 店名, q 高德关键词=店名+区域, area 区域·类型, r 公开评分, tags 标签数组, feat 店铺特色, 可选 v/note}`）。
  - 这张卡**顶替了原来的周末刮刮乐酒吧卡**，现在天天显示。想改回只在周末出现：把渲染处的 `!room &&` 换成 `(new Date().getDay()%6===0) && !room &&`（周日=0、周六=6）。
- **周末刮刮乐酒吧卡（已退役）** `ScratchBar` / `WeekendBarCard`：组件还在代码里但不再渲染。酒吧房间仍可从「房间地图」进入。
- **奖励钱包** `RewardsWallet`：收集上面抽到的券，可「兑换」。
- **🎪 游乐场（原游戏室升级）** `FunRoomLobby`：满屏游乐园夜景大厅（摩天轮/木马/彩旗/小卖部/散步猫），三个入口：
  - **🎬 电影院** `CinemaActivity`：「今晚看什么」随机抽片（清单里标了🌟想看就只从想看里抽）+ 观影清单（加入→想看→看过打星，可自己加片）。localStorage：`nana-films`、`nana-films-custom`。
  - **🎮 游戏室** `GameActivity`：原 12+ 游戏不变，连续 7 天彩蛋照旧。
  - **📚 阅读室** `ReadingRoomActivity`：航空信纸读书笔记（写完「收进小本本」，✕两步确认删除）+ 我的书单（🌟想读→📖在读→✅读完）。localStorage：`nana-reading-notes`、`nana-books`。
  - **🛁 浴缸彩蛋**：大厅草地右侧的小浴缸，点一下会歪头说「游乐场露天泡澡，快乐加倍 🫧」。

---

_最后更新：2026-07-05。改完任意规则后，自测 → 合并到 `main` 即上线。_
