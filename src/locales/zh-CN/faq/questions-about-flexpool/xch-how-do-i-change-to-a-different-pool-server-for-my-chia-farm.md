---
title: 如何为我的 Chia 矿场更改为不同的池服务器？
coin: XCH
---

首先，除非您看到服务器的 ping 时间为 500 毫秒或更高，否则您不需要这样做，甚至可能不需要这样做。 Chia 对网络延迟的敏感度不如以太坊。

话虽如此，“更改”池服务器在技术上是离开池并再次加入。 在 GUI 中，您将使用“更改池”按钮，更改为“新”区域服务器。 在 CLI 中，您将使用“chia plotnft leave”离开池并使用“chia plotnft join”加入新池