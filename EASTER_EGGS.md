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
| `nana-bar-scratch-<日期>` | 当天的周末刮刮乐是否已刮开 |
| `nana-meal-days` / `nana-meal-reward` | （旧"累计"版用，现已弃用；切回累计版时才需要） |

> 测试吃饭彩蛋：控制台执行
> `localStorage.setItem("nana-meal-streak", JSON.stringify({last:null,streak:6,claimed:0}))`
> 然后勾一次「午饭」，连续数到 7 就会触发抽奖。

---

## 六、其它相关惊喜（非弹窗彩蛋）
- **周末刮刮乐酒吧卡** `ScratchBar` / `WeekendBarCard`：周末出现，手指刮开。
- **奖励钱包** `RewardsWallet`：收集上面抽到的券，可「兑换」。

---

_最后更新：2026-06-14。改完任意规则后，自测 → 合并到 `main` 即上线。_
