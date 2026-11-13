# iTalent 出勤抓取：页面结构与排障笔记

供维护 `scripts/capture.js` 时参考。所有选择器均在 2026-11-06 于 macOS + Chrome 157 实测。

## 导航链路

1. `https://www.italent.cn/portal/iTalentHome` 未登录时跳转 `/Login?ReturnUrl=...`。
2. 登录页（账号登录 tab 默认选中）：
   - 账号 `#form-item-account`，密码 `#form-item-password`
   - 协议复选框 `.phoenix-checkbox__input`（**必须勾选**）
   - 登录按钮：`.phoenix-button__content` 文本为「登录」的元素，需点击其 `parentElement`
     （`.phoenix-button__wraper--primary`）。注意 `.phoenix-button__content` 有两个，
     另一个是隐藏的「获取验证码」，直接 `click .phoenix-button__content` 会点错。
3. 首页「员工自助」应用宫格中「我的假勤」为 `.menu-name`，需同时调用
   `el.click()` 与其 `parentElement.click()`（只点父元素不生效），随后跳转「我的月报」页。
4. 左侧二级菜单「我的出勤」为 `a.list-2nd-a`（文本精确匹配），点击其 `parentElement`（`li.list-2nd-li`）。
   落地 URL 含 `viewName=Attendance.AttendanceDataRecordNavView`。
5. 列表行日期链接：`a.saveHashHistory`，文本形如 `2026-11-05 星期四`。点击后打开**新标签页**，
   详情页 URL 含 `cloud.italent.cn/attendance?...&_qpt=detailpage`，含记录 id 与一次性签名，
   因此不能预先构造 URL，必须从列表点击进入。
6. **连续多次独立运行时导航会偶发失败**（2026-11-09 抓 1–5 月时，按自然月分 5 段跑，
   第 3/4/5 段连续报「未找到「我的出勤」菜单项」）：登录已成功，但首页应用宫格尚未渲染完，
   或跳转停在「我的月报」中间页，导致 `a.list-2nd-a` 查不到。原实现一次找不到就抛错。
   现 `navigateToAttendance()` 以 URL 是否含 `AttendanceDataRecordNavView` 为准做最多 **6 轮**校准：
   每轮尝试点「我的假勤」入口、再点侧栏「我的出勤」，落地即返回；单次找不到不再直接失败。
   另有一种更顽固的状态：卡在带 `_userSpecialType=1` 的首页、宫格完全不渲染，反复点击都无效
   （2026-11-09 抓 2025 上半年时探测阶段 4 轮重试仍失败）。因此第 3 轮会先 `reload` 当前页
   再继续；正式 5 段运行中该 reload 被触发 1 次并成功恢复，5 段与完整区间收尾全部 EXIT 0。
   另外，分段运行中若某段整体失败，最后的**完整区间运行会自动兜底补漏**（未抓日期仍会被
   逐日筛选补上），因此不会丢数据，只是耗时变长。
7. **登录也会偶发失败**（2026-11-09 抓 2025 下半年，7 段中第 2 段报「仍停留在登录页」）：
   登录按钮点击过早或跳转延迟，6 秒后 URL 仍在 `/Login`。现 `login()` 最多重试 3 次，
   每轮重新填账号密码、勾选协议、点登录并复查 URL；同时 `check` 复选框加了容错。
   注意该加固上线后各段均一次登录成功，重试逻辑尚未被真实触发过，但无回归。

## 考勤日期筛选（最容易出错的环节）

- 筛选标签容器：`.search-form-field.date-range-search`，点击其内部 `.field-left` 展开 popover。
- popover 内两个输入框：`.ant-calendar-range-picker`（起始 / 结束）。
- 点击某个 range-picker 后，出现对应日历面板，面板内输入框为 `.ant-calendar-input`。
  **最后出现的 `.ant-calendar-input` 就是当前编辑的那个端点**（点起始时只有 1 个，点结束时 2 个）。
- 在该输入框 `fill` 完整日期 `YYYY-MM-DD` 后按 `Enter`，即可同时完成月份跳转与赋值。
- **陷阱 1：值相同不生效。** 若输入框当前值已等于目标值，React 不更新内部 state，
  后续切换端点时该端点会变成空，提交后得到 `~ 2026-11-06` 这类半截区间，查询出全量历史数据（887 条）。
  解决：先填一个不同的「哨兵日期」（目标日期 −1 天）+ Enter，再重新聚焦端点填目标值 + Enter，
  并在每一步后校验 `.ant-calendar-range-picker` 的值。
- **陷阱 2：日历面板遮挡「确定」按钮。** 面板浮在按钮上方，真实鼠标点击会落到日历
  （曾误触年份选择面板）。解决：用 DOM `click()` 派发到 `span.base-btn-title`（文本「确定」）
  本身，事件冒泡到绑定 onClick 的 `span.base-bg-ripple`，绕过遮挡。
  点击最外层 `div.base-button-component` 无效（React 只从 target 向上找 handler）。
- **陷阱 3：两端点都要改时，临时 id 必须唯一。** 点击第二个 picker 后 DOM 里会同时存在两个
  `.ant-calendar-input`（起始日历与结束日历，后者值形如 `2026-11-30`）。若两次都给「最后一个」
  加同一个 `id="tmp-cal-input"`，`fill #tmp-cal-input` 会命中第一个（起始），
  表现为「想改结束日期却把起始日期改掉」，最终区间校准失败。
  解决：每次标记用递增唯一 id（如 `tmp-cal-1`、`tmp-cal-2`），并按返回的 id 执行 fill。
  此问题仅在起始日期不等于默认「当月 1 日」、两个端点都需要修改时暴露。
- 提交后校验 `span.search-field-value` 文本是否为 `start ~ end`，否则报错中止。

## 详情页「实打卡」

- 结构：`[role="grid"]` → `[role="row"]`。表头 `[role="columnheader"]` 顺序为
  `["", "应打卡", "实打卡", "缺勤时长", ...]`；数据行 `[role="gridcell"]` 与表头下标对齐，
  `实打卡` 列下标 2。典型一天两行（上班 09:00 / 下班 18:00 应打卡）。
- 只在包含「应打卡」+「实打卡」表头的那个 grid 内取值，避免误取「打卡数据」表格的同下标列。
- 示例：`2026-11-05` 实打卡为 `08:46` 与 `18:50` → 晚于 18:00 → 文件名追加「加班」。
  `2026-11-06` 只有 `08:46`（下班尚未打卡）→ 不加。
- 兜底：若表格结构变化取不到值，截取 `打卡信息` 与 `打卡数据` 之间的文本，
  用正则提取 `YYYY-MM-DD HH:MM(:SS)`。

## 分页与虚拟表格（2026-11-09 实测修正）

- **结果少于一页时**（如 6 条）分页控件隐藏，曾误判为「无每页条数控件」。
  结果超过一页时，列表底部出现：`共24条 / 下一页 / 页码 / 上一页 / 15条/页 / 共2页`。
- 「15条/页」是 `span.drop-down-btn-title`，点击其父元素内的箭头
  `[class*=arrowdown]` / `.drop-down-btn-svg` 展开菜单，选项为 `.dropDownEllipsis`
  （15 / 30 / 60 / 100 条/页）。脚本 `trySetPageSize()` 会切到 30 条/页。
- 表格是 **虚拟渲染**（`.pps-virtual-table` / `.fixedDataTableLayout_rowsContainer`），
  一页内 DOM 只保留约 12 行。`scrollTop` 调整、原生滚轮、WheelEvent 派发、调高 viewport
  均无法让它渲染更多行（实测）。选 30 条/页后变成 1 页，但仍只有 12 行可见。
- 因此脚本采用两阶段：`listDates()` 抓当前可见行；对 `eachDay(start,end)` 中未出现在可见行里的日期，
  用 `setDateRange(d, d)` 做**单日筛选**（列表只剩 1 条，必然可点）逐日补漏。
  这样 24 条记录可完整抓取，不受分页/虚拟渲染影响。
- 单日筛选时日历面板会残留上一次的 `.ant-calendar-input`（可能同时有 2 个），
  因此 `markCalendarInput(index)` 必须按 `ins[min(index, ins.length-1)]` 取对应端点，
  且每次用唯一 id；否则「改起始」会误改到结束端点。
  端点被组件清空时 `setDateRange()` 的 4 轮校准会自动补齐，偶发失败会重试一次。
- 表格右上角齿轮 `.icon-datatable-setting-normal` 只有「设置显示字段」「选择间距类型」，与分页无关。

### 长区间耗时（2026-11-09 实测）

- 一次跑完整区间 `2026-06-01 ~ 2026-08-31`（92 天）耗时约 **21 分钟**：可见行约 12 天直接抓，
  其余 80 天全部走单日筛选，每天约 12–15 秒（含重设起止日期、打开详情、整页截图、关闭标签）。
- 想缩短耗时可按自然月分多次运行（如 6 月 / 7 月 / 8 月各一次），每次只需补漏约 18 天，
  台账按 `captured.json` 全量同步，多次运行结果与一次全区间完全等价；最后再用完整区间跑一次，
  此时全部日期命中去重，只做台账同步并返回 `overtimeMinutesInRange`，可用于校验零遗漏。
- 串联多次运行时注意 **zsh 不做未加引号变量的单词拆分**：`R="2026-06-01 2026-06-30"; set -- $R`
  在 zsh 下 `$1` 会是整串、`$2` 为空，导致 `日期格式不合法`。请直接写三条独立命令，
  或用 `${=R}` / `read start end <<< "$R"` 显式拆分。
- 单日筛选时起始端点常与上一天结束值相同，会触发一次「哨兵值」校准重试（日志里的
  `第 1 次设置端点 0 后值为 ...，重试`），属正常现象，不影响结果。

## 加班台账（scripts/excel_report.py）

- Node 侧 `syncExcel()` 从 `captured.json` **全量**生成行数据（不只本次区间），经 stdin 以 JSON 传给 Python helper。
- 每日加班分钟数 = 当天最晚实打卡时间 − 阈值（`--overtime-after`，默认 18:00）；早于阈值或无打卡记 0。
- Python helper 先用 `load_workbook` 读已有行（跳过「合计」行），按日期合并（传入数据覆盖同日期），
  升序重写整张表，末尾追加静态「合计」行；表头冻结、加班行高亮、带筛选。
  输出 JSON：`rowCount / added / updated / totalMinutes / runMinutes / created`。
- 即使本次所有日期都因去重被跳过，也会执行同步，保证台账与 `captured.json` 一致；
  因此后续抓取其他时期只会累加新日期，不会丢历史或产生重复行。
- 依赖 Python 3 + `openpyxl`；Excel 路径默认 `<out>/加班时长统计.xlsx`，可用 `--excel` 覆盖。
- **helper 偶发 `spawnSync python3 ETIMEDOUT`**：台账达数百行且浏览器进程占用资源时，
  120 秒超时会触发，表现为该段 `✗ Excel 台账写入失败` 并以退出码 2 结束（截图其实已全部落盘）。
  现已放宽到 180 秒并自动重试一次；由于 `captured.json` 是全量源，即使单次失败，
  下一次运行（含完整区间收尾）也会重建台账，不会丢数据。

## agent-browser CLI 要点

- 所有命令统一带 `--session <name>`，与手工会话隔离；`tab <id>` 接受 `t1`/`t2` 形式，
  不接受纯数字。`tab close` 关闭当前活动标签页并自动回到列表页。
- `screenshot <path> --full` 保存整页截图；目标目录需事先存在。
- `eval` 返回体为 JSON 文本时用 `JSON.stringify(...)` 包裹，便于 Node 侧解析。
- 每条详情截完后关闭标签页；脚本 finally 中 `close` 释放会话，避免残留 Chromium。

## 数据覆盖范围（2026-11-09 实测）

- 「我的出勤」全量记录为 **887 天：2024-06-03 ~ 2026-11-06**（当日）。这正是最早误判为
  「日期筛选半截导致查出 887 条历史数据」的那个数字，其实是系统全部考勤记录。
- `2024-06-01`、`2024-06-02` 在单日筛选下均返回「无考勤记录」，推测为入职前，系统本身没有数据。
  因此早于 `2024-06-03` 的区间无需抓取。
- 区间自然天数 > `readTotalCount()` 时属正常：差出来的日期会在阶段 B 打印
  `无考勤记录，跳过`，不写入 `captured.json` 与 Excel，也不计入 `errors`。
  例：`2024-06-01 ~ 2024-12-31` 共 214 天，实际 212 条记录。
