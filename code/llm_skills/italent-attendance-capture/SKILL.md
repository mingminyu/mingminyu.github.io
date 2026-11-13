---
name: italent-attendance-capture
description: 抓取北森 iTalent「我的假勤 → 我的出勤」考勤详情并逐条截图归档。支持自定义考勤日期起止范围、按 30 条/页分批、实打卡晚于 18:00 自动在文件名追加「加班」、把每天加班分钟数追加写入 Excel 台账并返回累计加班分钟数、已抓取日期自动跳过不重复截图。当用户要求抓取出勤截图、考勤打卡记录、加班时长统计、加班分钟数、补抓某段日期的考勤时使用。
agent_created: true
---

# iTalent 出勤详情截图与加班台账

## Overview

自动登录 iTalent，进入「我的假勤 → 我的出勤」，按指定「考勤日期」区间逐条打开考勤详情页并整页截图。
截图以考勤日期命名；若详情页「实打卡」时间晚于阈值（默认 18:00），文件名追加「加班」。
已抓取过的日期记录在输出目录的 `captured.json`，重复运行默认跳过。
每次运行都会把全部已抓日期的**加班分钟数**同步进 Excel 台账（新日期追加、已有日期更新、按日期排序），并返回累计与本次加班分钟数。

## 使用方式

直接运行脚本，无需手工逐步操作浏览器：

```bash
node ~/.workbuddy/skills/italent-attendance-capture/scripts/capture.js \
  --start 2026-11-01 --end 2026-11-06 \
  --out /Users/yumm/Documents/hxworkhard/attendance-shots
```

运行前确认 `agent-browser` 可用（WorkBuddy 的 agent-browser skill 会自动安装），以及 Python 3 已装 `openpyxl`。
脚本会在独立的 `--session italent-attendance-capture` 会话中启动浏览器，结束时自动关闭。

> 大区间（如跨 3 个月）因列表虚拟渲染需逐日补漏，约 12–15 秒/天。想更快可按自然月分多次运行，
> 台账会自动累加；最后再用完整区间跑一次做零遗漏校验（此时全部日期命中去重，只做台账同步）。
> 详见 `references/workflow.md` 的「长区间耗时」。

### 参数

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `--start YYYY-MM-DD` | 考勤日期起始 | 当月 1 日 |
| `--end YYYY-MM-DD` | 考勤日期结束 | 今天 |
| `--out DIR` | 截图输出目录 | `./attendance-shots` |
| `--excel PATH` | 加班时长 Excel 路径 | `<out>/加班时长统计.xlsx` |
| `--overtime-after HH:MM` | 加班判定与时长起算阈值，严格「晚于」该时刻 | `18:00` |
| `--page-size N` | 每批处理条数 | `30` |
| `--force` | 忽略去重记录，强制重新截图 | 关闭 |
| `--user` / `--password` | 覆盖账号密码 | 读 `config.json` |
| `--help` | 打印参数说明 | — |

账号密码优先级：命令行 > 环境变量 `ITALENT_USER` / `ITALENT_PASSWORD` > `config.json`（已预置用户提供的账号）。
`config.json` 为明文凭据，仅限本机使用；换账号时编辑该文件即可。

### 输出

- `<日期>.png` / `<日期>加班.png`：详情页整页截图
- `加班时长统计.xlsx`：每日加班分钟数台账，末行为「合计」
- `captured.json`：已抓取日期 → 文件名、是否加班、实打卡时间、抓取时间
- `last-run.json`：本次运行摘要（总条数、批次数、新增、跳过、错误、加班分钟数）
- stdout：同样的摘要 JSON，关键字段 `overtimeMinutesTotal`、`overtimeMinutesInRange`、`overtimeMinutesThisRun`、`dailyOvertime`、`excel`

## 加班时长与 Excel 台账

- **每日加班分钟数** = 当天最晚「实打卡」时间 − 阈值（默认 `18:00`）；早于阈值记为 0，无打卡记录记为 0。
  例：`08:46 / 18:50` → 50 分钟；`08:46 / 20:03` → 123 分钟。`18:00` 整不算加班。
- Excel 列：`考勤日期 / 星期 / 最早实打卡 / 最晚实打卡 / 加班判定 / 加班分钟数 / 截图文件 / 更新时间`，
  加班行高亮，表头冻结并带筛选，末行「合计」为累计分钟数。
- **追加写入**：每次运行以 `captured.json` 全量为准同步 Excel，先读入已有行再按日期合并
  （已有日期更新、新日期追加），最后按日期升序重写。因此后续抓取其他时期只会累加新日期，
  不会丢历史、也不会产生重复行；即使某次运行全部日期都因去重被跳过，台账仍会同步更新。
- 返回值：`overtimeMinutesTotal`（台账累计分钟数）、`overtimeMinutesInRange`（本次查询区间分钟数）、
  `overtimeMinutesThisRun`（本次新抓日期分钟数）、`dailyOvertime`（每日明细），
  日志中同时打印「累计 X 分钟（Y 小时 Z 分钟）」。
- Excel 由脚本维护；手工在表内加列/改结构可能在下次同步时被覆盖。

## 去重规则

每次运行前读取 `<out>/captured.json`。若某日期已有记录且对应截图文件仍存在，则跳过；
文件被删除或指定 `--force` 时会重新抓取，并清理同日期的旧命名文件后再写入。
因此多次运行不同区间（例如先抓 11-01~11-06，再抓 10 月）只会补齐新增日期。

## 关键行为说明

- 「实打卡」取自详情页「打卡信息」表格的 `实打卡` 列；任一时间严格晚于阈值即判定加班。
- 当结果超过一页时页面会出现「N条/页」下拉（15 / 30 / 60 / 100）与「共N页」，脚本会自动切换为 `--page-size 30`。
  表格是虚拟渲染，一页内 DOM 通常只保留约 12 行；脚本先抓取当前可见行，再对区间内其余日期用**单日筛选**（把起止都设为当天，列表只剩 1 条）逐日补漏，确保一条不漏。
- 日期区间通过「考勤日期」筛选面板设置并点击「确定」，脚本会校验筛选标签是否变为目标区间，避免抓到全量历史数据。
  支持任意起始日期（不限于当月 1 日）；两端点都需修改时，每次标记日历输入框必须使用唯一临时 id，且按端点索引取对应输入框。
- 每条详情在新标签页打开，截完即关闭，回到列表页继续下一条。

## 故障排查与页面结构

页面 DOM 选择器与日期面板的已知陷阱（值相同不触发 React 更新、日历面板遮挡确定按钮、
重复临时 id 导致改错端点、eval 返回需解两层 JSON）记录在 `references/workflow.md`。
若 iTalent 改版导致脚本失败，先查阅该文件再调整脚本。

## 资源

- `scripts/capture.js`：完整自动化脚本（Node.js，零额外 npm 依赖）
- `scripts/excel_report.py`：Excel 台账创建/追加（Python 3 + openpyxl）
- `config.json`：账号密码与默认阈值
- `references/workflow.md`：页面结构与排障笔记
