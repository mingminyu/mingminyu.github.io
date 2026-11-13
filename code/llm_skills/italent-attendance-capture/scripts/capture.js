#!/usr/bin/env node
'use strict';

/**
 * iTalent 我的出勤 - 逐条详情页截图归档
 *
 * 依赖：agent-browser CLI（vercel-labs/agent-browser，已随 WorkBuddy agent-browser skill 安装）
 * 运行：node capture.js --start 2026-11-01 --end 2026-11-06 --out ./attendance-shots
 *
 * 行为：
 *   1. 账号密码登录 iTalent -> 我的假勤 -> 我的出勤
 *   2. 设置「考勤日期」起止范围
 *   3. 按 30 条/页分批遍历列表，逐条打开详情页并整页截图
 *   4. 文件名 = 日期；若「实打卡」时间晚于 18:00，追加「加班」
 *   5. 已抓取过的日期记录在 captured.json，默认跳过，不重复截图
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(SKILL_DIR, 'config.json');
const SESSION = 'italent-attendance-capture';
const HOME_URL = 'https://www.italent.cn/portal/iTalentHome';

// ---------------------------------------------------------------- 参数
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (key === 'force') { args.force = true; continue; }
    if (key === 'help') { args.help = true; continue; }
    args[key] = argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[++i] : '';
  }
  return args;
}

function pad(n) { return String(n).padStart(2, '0'); }
function iso(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s + 'T00:00:00').getTime()); }
function shiftDay(s, delta) {
  const d = new Date(s + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return iso(d);
}

function loadConfig() {
  let c = {};
  try { c = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch (_) { /* optional */ }
  return c;
}

// ---------------------------------------------------------------- CLI 封装
function resolveBrowserBin() {
  if (process.env.AGENT_BROWSER_BIN) return process.env.AGENT_BROWSER_BIN;
  try {
    const p = execFileSync('npm', ['config', 'get', 'prefix'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const candidate = path.join(p, 'bin', 'agent-browser');
    if (fs.existsSync(candidate)) return candidate;
  } catch (_) { /* fall through */ }
  return 'agent-browser';
}
const AB = resolveBrowserBin();
const AB_PREFIX = ['--session', SESSION];

function ab(args, timeout = 120000) {
  const full = [...AB_PREFIX, ...args];
  try {
    return execFileSync(AB, full, {
      encoding: 'utf8',
      timeout,
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (e) {
    const detail = (e.stderr || e.stdout || e.message || '').toString().trim();
    throw new Error(`agent-browser ${args[0]} 失败: ${detail.slice(0, 500)}`);
  }
}

/** 执行页面 JS；返回原始输出文本 */
function js(code) { return ab(['eval', code]); }

/** 执行页面 JS 并解析 JSON 返回值（页面代码需自行 JSON.stringify） */
function jsJson(code) {
  const out = js(code);
  const cleaned = out.split('\n').filter(l => !/^[✓✗]/.test(l.trim())).join('\n').trim();
  let parsed;
  try { parsed = JSON.parse(cleaned); }
  catch (_) { throw new Error(`页面返回值无法解析为 JSON: ${cleaned.slice(0, 300)}`); }
  // eval 会把 JSON.stringify 的结果再次包成 JSON 字符串，需解两层
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch (_) { /* 本身就是普通字符串，保留 */ }
  }
  return parsed;
}

function wait(ms) { ab(['wait', String(ms)]); }
function log(msg) { process.stderr.write(`[capture] ${msg}\n`); }

// ---------------------------------------------------------------- 页面操作
function login(user, password) {
  log('登录 iTalent（账号密码方式）');
  // 短时间内多次独立运行（按自然月分段抓取）时，登录按钮偶发点击过早或跳转延迟，
  // 表现为「仍停留在登录页」。重新填写并重试即可，不必整段任务失败。
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (!ab(['get', 'url']).includes('/Login')) { log('登录成功'); return; }
    ab(['fill', '#form-item-account', user]);
    ab(['fill', '#form-item-password', password]);
    try { ab(['check', '.phoenix-checkbox__input']); } catch (_) { /* 已勾选时可忽略 */ }
    js(String.raw`(()=>{const b=Array.from(document.querySelectorAll('.phoenix-button__content')).find(e=>e.textContent.trim()==='登录');if(!b)return 'no-button';b.parentElement.click();return 'clicked'})()`);
    wait(6000);
    if (!ab(['get', 'url']).includes('/Login')) { log('登录成功'); return; }
    log(`  · 第 ${attempt} 次登录未跳转，重试`);
    wait(2000);
  }
  throw new Error('登录未成功，仍停留在登录页（已重试 3 次；请检查账号密码或是否触发验证码）');
}

function navigateToAttendance() {
  log('进入 我的假勤 -> 我的出勤');
  // 连续多次独立运行时，首页应用宫格可能尚未渲染完，或跳转落在「我的月报」中间页；
  // 因此按「是否已落到列表页」为准做多轮校准，而不是一次找不到就抛错。
  for (let attempt = 1; attempt <= 6; attempt++) {
    if (ab(['get', 'url']).includes('AttendanceDataRecordNavView')) return;

    // 偶发卡在带 _userSpecialType 参数的首页（宫格不渲染），重载一次可恢复
    if (attempt === 3) {
      log('  · 导航仍未落地，重新加载页面后继续');
      try { ab(['reload']); } catch (_) { /* ignore */ }
      wait(5000);
    }

    const clickedApp = jsJson(String.raw`JSON.stringify((()=>{
      const els=Array.from(document.querySelectorAll('.menu-name')).filter(x=>x.textContent.trim()==='我的假勤');
      els.forEach(x=>{x.click();if(x.parentElement)x.parentElement.click()});
      return els.length
    })())`);
    wait(clickedApp > 0 ? 5000 : 3500);

    const clickedMenu = jsJson(String.raw`JSON.stringify((()=>{
      const a=Array.from(document.querySelectorAll('a.list-2nd-a')).find(x=>x.textContent.trim()==='我的出勤');
      if(a){a.parentElement.click();return 1}return 0
    })())`);
    if (clickedMenu) {
      wait(5000);
      if (ab(['get', 'url']).includes('AttendanceDataRecordNavView')) return;
    } else {
      wait(2500);
    }
    log(`  · 第 ${attempt} 次导航未落地，重试（应用入口 ${clickedApp} / 出勤菜单 ${clickedMenu}）`);
  }
  const url = ab(['get', 'url']);
  throw new Error(`未进入「我的出勤」列表页（重试 6 次后），当前 URL: ${url.slice(0, 200)}`);
}

/** 打开「考勤日期」筛选弹层 */
function openDateFilter() {
  const ok = jsJson(String.raw`JSON.stringify((()=>{
    const f=document.querySelector('.search-form-field.date-range-search .field-left');
    if(!f)return false;f.click();return true
  })())`);
  if (!ok) throw new Error('未找到「考勤日期」筛选控件');
  wait(700);
}

function pickerValues() {
  return jsJson(String.raw`JSON.stringify(Array.from(document.querySelectorAll('.ant-calendar-range-picker')).map(i=>i.value))`);
}

let calIdSeq = 0;
/** 给端点 index 对应的日历输入框打一个唯一临时 id，返回 {value, id}。
 *  两个陷阱：日历面板会残留上一次的输入框，因此 (1) id 必须唯一，
 *  (2) 必须按 index 取对应的输入框，不能一律取「最后一个」——否则改起始时会改到结束端点。 */
function markCalendarInput(index) {
  const id = `tmp-cal-${++calIdSeq}`;
  const value = jsJson(String.raw`JSON.stringify((()=>{
    const ins=Array.from(document.querySelectorAll('.ant-calendar-input'));
    if(!ins.length)return null;
    const el=ins[Math.min(${index},ins.length-1)];el.id=${JSON.stringify(id)};return el.value
  })())`);
  return value === null ? null : { value, id };
}

/**
 * 设置范围的一个端点。
 * 仅在端点当前值与目标不同时调用：React 受控输入框在值相同时不更新内部 state，
 * 会导致另一端被修改后本端变空（曾出现「~ 2026-11-06」查到 887 条历史数据）。
 */
function setEndpoint(index, target) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    js(String.raw`(()=>{const p=document.querySelectorAll('.ant-calendar-range-picker')[${index}];if(p)p.click();return true})()`);
    wait(600);
    const mark = markCalendarInput(index);
    if (mark === null) { continue; }
    if (mark.value === target) { return; } // 已一致，无需触发输入事件
    ab(['fill', `#${mark.id}`, target]);
    ab(['press', 'Enter']);
    wait(700);

    const vals = pickerValues();
    if (vals[index] === target) { return; }
    log(`  · 第 ${attempt} 次设置端点 ${index} 后值为 ${JSON.stringify(vals)}，重试`);
  }
  throw new Error(`无法设置考勤日期端点 ${index} 为 ${target}，当前 ${JSON.stringify(pickerValues())}`);
}

function ensureDatePopover() {
  const n = jsJson(String.raw`JSON.stringify(document.querySelectorAll('.ant-calendar-range-picker').length)`);
  if (!n) { openDateFilter(); }
  return n >= 2;
}

function setDateRange(start, end) {
  log(`设置考勤日期 ${start} ~ ${end}`);
  openDateFilter();

  // 逐轮校准：某端点可能被组件清空，下一轮会补齐（此时值不同，输入才会生效）
  let final = [];
  for (let round = 1; round <= 4; round++) {
    if (ensureDatePopover()) {
      let vals = pickerValues();
      if (vals[0] !== start) setEndpoint(0, start);
      vals = pickerValues();
      if (vals[1] !== end) setEndpoint(1, end);
      final = pickerValues();
      if (final[0] === start && final[1] === end) break;
      log(`  · 第 ${round} 轮端点值 ${JSON.stringify(final)}，继续校准`);
    } else {
      wait(500);
    }
  }
  if (!(final[0] === start && final[1] === end)) {
    throw new Error(`考勤日期端点校准失败: ${JSON.stringify(final)}，期望 ${start} ~ ${end}`);
  }

  // 提交：日历面板常盖住确定按钮，使用 DOM click 派发到按钮内部 span 以绕过遮挡
  js(String.raw`(()=>{const s=Array.from(document.querySelectorAll('.base-btn-title')).find(e=>e.textContent.trim()==='确定');if(!s)return false;s.click();return true})()`);
  wait(2500);

  const labels = jsJson(String.raw`JSON.stringify(Array.from(document.querySelectorAll('span.search-field-value')).map(e=>e.textContent.trim()).filter(Boolean))`);
  const expected = `${start} ~ ${end}`;
  if (!labels.some(l => l.replace(/\s+/g, '') === expected.replace(/\s+/g, ''))) {
    throw new Error(`考勤日期未生效，筛选标签为 ${JSON.stringify(labels)}，期望 ${expected}`);
  }
  log(`筛选生效：${expected}`);
}

/** 结果超过一页时页面出现「N条/页」下拉，切换为 pageSize 条/页（默认 30）。
 *  注意：表格是虚拟渲染，一页内 DOM 仍可能只保留约 12 行，缺失日期由逐日筛选补齐。 */
function trySetPageSize(pageSize) {
  const before = jsJson(String.raw`JSON.stringify((()=>{
    const t=Array.from(document.querySelectorAll('.drop-down-btn-title')).find(e=>/\d+\s*条\s*\/\s*页/.test(e.textContent));
    return t?t.textContent.trim():''
  })())`);
  if (!before) { log('结果不足一页，页面未出现「每页条数」控件'); return false; }

  const desired = `${pageSize}条/页`;
  if (before.replace(/\s/g, '') === desired) { log(`每页已为 ${desired}`); return true; }

  js(String.raw`(()=>{const t=Array.from(document.querySelectorAll('.drop-down-btn-title')).find(e=>/\d+\s*条\s*\/\s*页/.test(e.textContent));if(!t)return false;const svg=t.parentElement.querySelector('[class*=arrowdown],.drop-down-btn-svg');(svg||t.parentElement).click();return true})()`);
  wait(600);
  const chosen = jsJson(String.raw`JSON.stringify((()=>{
    const e=Array.from(document.querySelectorAll('.dropDownEllipsis')).find(x=>x.textContent.trim().replace(/\s/g,'')===${JSON.stringify(desired)});
    if(!e)return 0;e.click();if(e.parentElement)e.parentElement.click();return 1
  })())`);
  wait(2200);
  const after = jsJson(String.raw`JSON.stringify((()=>{
    const t=Array.from(document.querySelectorAll('.drop-down-btn-title')).find(e=>/\d+\s*条\s*\/\s*页/.test(e.textContent));
    return t?t.textContent.trim():''
  })())`);
  log(`每页条数：${before} -> ${after || '未变更'}${chosen ? '' : '（未找到该选项）'}`);
  return true;
}

function readTotalCount() {
  return Number(jsJson(String.raw`JSON.stringify((document.body.innerText.match(/共(\d+)条/)||[])[1]||0)`)) || 0;
}

function eachDay(start, end) {
  const out = [];
  const d = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (d <= last && out.length < 400) {
    out.push(iso(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function listDates() {
  return jsJson(String.raw`JSON.stringify((()=>{
    const out=[];
    for(const a of document.querySelectorAll('a')){
      const t=a.textContent.trim();
      const m=t.match(/^(\d{4}-\d{2}-\d{2})/);
      if(m&&!out.includes(m[1]))out.push(m[1]);
    }
    return out
  })())`);
}

function parseTabs(text) {
  return text.split('\n').map(l => l.match(/\[(t\d+)\]/)).filter(Boolean).map(m => m[1]);
}

/** 打开某天详情，返回 {times, date, tabId, sameTab} */
function openDetail(date) {
  const before = parseTabs(ab(['tab', 'list']));
  const clicked = jsJson(String.raw`JSON.stringify((()=>{
    const a=Array.from(document.querySelectorAll('a')).find(x=>x.textContent.trim().indexOf(${JSON.stringify(date)})===0);
    if(!a)return 0;a.click();return 1
  })())`);
  if (!clicked) throw new Error(`列表中没有找到 ${date} 的链接`);

  let tabId = null;
  for (let i = 0; i < 12; i++) {
    wait(700);
    const after = parseTabs(ab(['tab', 'list']));
    const fresh = after.filter(t => !before.includes(t));
    if (fresh.length) { tabId = fresh[fresh.length - 1]; break; }
  }
  if (tabId) {
    ab(['tab', tabId]);
  } else {
    // 少数情况下在当前标签页内打开详情
    tabId = null;
  }

  for (let i = 0; i < 15; i++) {
    const ready = jsJson(String.raw`JSON.stringify((()=>{
      const t=document.body.innerText;
      return t.indexOf('打卡信息')>=0 && t.indexOf(${JSON.stringify(date)})>=0
    })())`);
    if (ready) break;
    wait(700);
  }

  const info = jsJson(String.raw`JSON.stringify((()=>{
    const vals=[];
    for(const g of document.querySelectorAll('[role="grid"]')){
      const rows=Array.from(g.querySelectorAll('[role="row"]'));
      const h=rows.find(r=>r.innerText.indexOf('应打卡')>=0 && r.innerText.indexOf('实打卡')>=0);
      if(!h)continue;
      const heads=Array.from(h.querySelectorAll('[role="columnheader"]')).map(e=>e.innerText.trim());
      const idx=heads.indexOf('实打卡');
      if(idx<0)continue;
      for(const r of rows){
        const c=r.querySelectorAll('[role="gridcell"]');
        if(c.length>idx){
          const v=c[idx].innerText.trim();
          if(/\d{1,2}:\d{2}/.test(v))vals.push(v);
        }
      }
    }
    const body=document.body.innerText;
    const m=body.match(/考勤日期\s*(\d{4}-\d{2}-\d{2})/);
    // 兜底：若表格结构变化，扫描「打卡信息」区块中的时间
    let fallback=[];
    if(!vals.length){
      const seg=(body.split('打卡信息')[1]||'').split('打卡数据')[0]||'';
      fallback=seg.match(/\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}(:\d{2})?/g)||[];
    }
    return {date:m?m[1]:'',vals,fallback}
  })())`);

  return { ...info, tabId, sameTab: tabId === null };
}

function closeDetail(detail) {
  if (detail.sameTab) { ab(['back']); wait(1500); }
  else { ab(['tab', 'close']); wait(600); }
}

// ---------------------------------------------------------------- 主流程
function minutesOf(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function hasOvertime(info, thresholdMin) {
  const all = [...(info.vals || []), ...(info.fallback || [])];
  return all.some(v => {
    const m = String(v).match(/(\d{1,2}):(\d{2})/);
    if (!m) return false;
    return Number(m[1]) * 60 + Number(m[2]) > thresholdMin;
  });
}

/** 当日加班分钟数 = 最晚「实打卡」时间 − 阈值（默认 18:00），早于阈值则为 0 */
function overtimeOf(clockTimes, thresholdMin) {
  const times = [];
  for (const v of clockTimes || []) {
    const m = String(v).match(/(\d{1,2}):(\d{2})/);
    if (!m) continue;
    const minutes = Number(m[1]) * 60 + Number(m[2]);
    const text = `${String(m[1]).padStart(2, '0')}:${m[2]}`;
    times.push({ minutes, text });
  }
  if (!times.length) return { minutes: 0, firstClock: '', lastClock: '' };
  times.sort((a, b) => a.minutes - b.minutes);
  const last = times[times.length - 1];
  return {
    minutes: Math.max(0, last.minutes - thresholdMin),
    firstClock: times[0].text,
    lastClock: last.text,
  };
}

/** 把 captured.json 全量台账同步进 Excel（已存在日期更新、新日期追加、按日期排序） */
function syncExcel(state, summary, thresholdMin, excelPath) {
  const rows = Object.keys(state.entries)
    .filter(d => validDate(d))
    .map(d => {
      const rec = state.entries[d];
      const o = overtimeOf(rec.clockTimes, thresholdMin);
      return {
        date: d,
        weekday: '',
        firstClock: o.firstClock,
        lastClock: o.lastClock,
        overtime: o.minutes > 0,
        minutes: o.minutes,
        file: rec.file || '',
        updatedAt: rec.capturedAt || '',
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const payload = {
    excelPath,
    rows,
    runDates: summary.captured.map(x => x.date),
  };
  const helper = path.join(__dirname, 'excel_report.py');
  const existedBefore = fs.existsSync(excelPath);
  // 台账行数已达数百行、且浏览器进程占用资源时，python3 helper 偶发 spawnSync ETIMEDOUT。
  // 放宽超时并重试一次；captured.json 是全量源，即使单次失败也不会丢数据。
  let raw = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      raw = execFileSync('python3', [helper], {
        input: JSON.stringify(payload),
        encoding: 'utf8',
        timeout: 180000,
        maxBuffer: 8 * 1024 * 1024,
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      break;
    } catch (e) {
      if (attempt === 2) throw e;
      log(`  · Excel helper 第 ${attempt} 次调用失败（${String(e.code || e.message).slice(0, 100)}），重试`);
    }
  }
  const report = JSON.parse(raw.split('\n').filter(Boolean).pop());
  // 以调用前的文件状态为准，避免统计口径受重复写入影响
  report.created = !existedBefore;
  if (!existedBefore) { report.added = report.rowCount; report.updated = 0; }
  summary.excel = report;
  summary.overtimeMinutesTotal = report.totalMinutes;
  summary.overtimeMinutesThisRun = report.runMinutes;
  summary.overtimeMinutesInRange = rows
    .filter(r => r.date >= summary.start && r.date <= summary.end)
    .reduce((s, r) => s + r.minutes, 0);
  summary.dailyOvertime = rows.map(r => ({ date: r.date, minutes: r.minutes }));

  const h = Math.floor(report.totalMinutes / 60);
  const m = report.totalMinutes % 60;
  log(`Excel 台账：${report.excelPath}（${report.rowCount} 天，新增 ${report.added} / 更新 ${report.updated}）`);
  log(`加班分钟数：本次新抓 ${report.runMinutes} 分钟，查询区间 ${summary.overtimeMinutesInRange} 分钟，累计 ${report.totalMinutes} 分钟（${h} 小时 ${m} 分钟）`);
  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write([
      '用法: node capture.js [options]',
      '  --start YYYY-MM-DD     考勤日期起始（默认当月 1 日）',
      '  --end   YYYY-MM-DD     考勤日期结束（默认今天）',
      '  --out   DIR            截图输出目录（默认 ./attendance-shots）',
      '  --excel PATH          加班时长 Excel 路径（默认 <out>/加班时长统计.xlsx）',
      '  --user  USER           iTalent 账号（覆盖 config.json / ITALENT_USER）',
      '  --password PASS        iTalent 密码（覆盖 config.json / ITALENT_PASSWORD）',
      '  --overtime-after HH:MM 加班判定阈值（默认 18:00，严格晚于该时刻）',
      '  --page-size N          每批处理条数（默认 30）',
      '  --force                强制重抓，忽略已抓取记录',
      '',
    ].join('\n'));
    return;
  }

  const cfg = loadConfig();
  const now = new Date();
  const start = args.start || iso(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = args.end || iso(now);
  if (!validDate(start) || !validDate(end)) throw new Error(`日期格式不合法: ${start} ~ ${end}`);
  if (start > end) throw new Error(`起始日期晚于结束日期: ${start} > ${end}`);

  const user = args.user || process.env.ITALENT_USER || cfg.user;
  const password = args.password || process.env.ITALENT_PASSWORD || cfg.password;
  if (!user || !password) throw new Error('缺少 iTalent 账号密码，请通过 config.json / ITALENT_USER / ITALENT_PASSWORD / --user --password 提供');

  const outDir = path.resolve(args.out || path.join(process.cwd(), 'attendance-shots'));
  fs.mkdirSync(outDir, { recursive: true });
  const excelPath = path.resolve(args.excel || cfg.excelPath || path.join(outDir, '加班时长统计.xlsx'));
  const statePath = path.join(outDir, 'captured.json');
  let state = { version: 1, entries: {} };
  try {
    const loaded = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    if (loaded && loaded.entries) state = loaded;
  } catch (_) { /* 首次运行 */ }

  const threshold = args['overtime-after'] || cfg.overtimeAfter || '18:00';
  if (!/^\d{1,2}:\d{2}$/.test(threshold)) throw new Error(`加班阈值格式不合法: ${threshold}`);
  const thresholdMin = minutesOf(threshold);
  const pageSize = Math.max(1, Number(args['page-size'] || cfg.pageSize || 30));
  const force = !!args.force;

  const summary = {
    start, end, outDir, pageSize, overtimeAfter: threshold,
    excelPath,
    totalRows: 0, batches: 0, captured: [], skipped: [], errors: [],
  };

  const saveState = () => {
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
  };

  try {
    log(`打开 ${HOME_URL}`);
    ab(['open', HOME_URL]);
    wait(3000);
    if (ab(['get', 'url']).includes('/Login')) login(user, password);
    else log('会话已登录，跳过登录步骤');

    navigateToAttendance();
    const listTabId = parseTabs(ab(['tab', 'list']))[0] || 't1';
    setDateRange(start, end);
    trySetPageSize(pageSize);

    const totalFromPager = readTotalCount();
    const visible = listDates().filter(d => d >= start && d <= end);
    const allDays = eachDay(start, end);
    const missing = allDays.filter(d => !visible.includes(d));
    summary.totalRows = totalFromPager || visible.length;
    log(`列表共 ${totalFromPager || visible.length} 条记录，当前页可见 ${visible.length} 天，需单日补漏 ${missing.length} 天`);

    const needsCapture = (d) => {
      const rec = state.entries[d];
      const file = rec && path.join(outDir, rec.file);
      if (!force && rec && file && fs.existsSync(file)) return false;
      return true;
    };

    // 抓取单条：打开详情 -> 判定加班 -> 整页截图 -> 写台账 -> 关闭详情标签
    const captureOne = (date) => {
      try { ab(['tab', listTabId]); } catch (_) { /* 单标签页时可忽略 */ }
      let detail = null;
      try {
        detail = openDetail(date);
        const overtime = hasOvertime(detail, thresholdMin);
        const filename = `${date}${overtime ? '加班' : ''}.png`;
        const target = path.join(outDir, filename);

        for (const old of [`${date}.png`, `${date}加班.png`]) {
          const p = path.join(outDir, old);
          if (p !== target && fs.existsSync(p)) fs.unlinkSync(p);
        }

        ab(['screenshot', target, '--full'], 120000);
        if (!fs.existsSync(target)) throw new Error('截图文件未生成');

        state.entries[date] = {
          file: filename,
          overtime,
          clockTimes: detail.vals || detail.fallback || [],
          capturedAt: new Date().toISOString(),
        };
        saveState();
        summary.captured.push({ date, file: filename, overtime, clockTimes: state.entries[date].clockTimes });
        log(`  ✓ ${filename}${overtime ? '（实打卡晚于 ' + threshold + '）' : ''}`);
      } catch (e) {
        summary.errors.push({ date, message: String(e.message || e).slice(0, 300) });
        log(`  ✗ ${date}: ${String(e.message || e).slice(0, 200)}`);
      } finally {
        if (detail) { try { closeDetail(detail); } catch (_) { /* ignore */ } }
      }
    };

    const pendingVisible = visible.filter(needsCapture);
    const pendingMissing = missing.filter(needsCapture);
    const pending = [...pendingVisible, ...pendingMissing];
    summary.skipped = [...visible, ...missing].filter(d => !needsCapture(d)).sort();
    if (summary.skipped.length) log(`跳过已抓取 ${summary.skipped.length} 天`);
    summary.batches = Math.ceil(pending.length / pageSize);

    // 阶段 A：当前页已渲染的日期，直接逐条点击
    for (const date of pendingVisible) {
      captureOne(date);
    }

    // 阶段 B：虚拟表格未渲染的日期，改为单日筛选后再点击
    if (pendingMissing.length) {
      log(`启用逐日筛选补漏 ${pendingMissing.length} 天（每页 ${pageSize} 条，本批 ${Math.min(pendingMissing.length, pageSize)} 条起）`);
      for (const date of pendingMissing) {
        let done = false;
        for (let attempt = 1; attempt <= 2 && !done; attempt++) {
          try {
            if (attempt > 1) { try { ab(['press', 'Escape']); } catch (_) {} wait(400); }
            setDateRange(date, date);
            wait(1200);
            const nowVisible = listDates();
            if (!nowVisible.includes(date)) {
              log(`  · ${date} 无考勤记录，跳过`);
              done = true;
              break;
            }
            captureOne(date);
            done = true;
          } catch (e) {
            const msg = String(e.message || e).slice(0, 200);
            log(`  · ${date} 第 ${attempt} 次单日筛选失败: ${msg}`);
            if (attempt === 2) summary.errors.push({ date, message: msg });
          }
        }
      }
    }

    // 无论本次是否有新截图，都把全量台账同步进 Excel（后续抓取其他时期时追加新行）
    try {
      syncExcel(state, summary, thresholdMin, excelPath);
    } catch (e) {
      summary.excelError = String(e.message || e).slice(0, 400);
      summary.errors.push({ date: 'excel', message: summary.excelError });
      log(`✗ Excel 台账写入失败: ${summary.excelError}`);
    }
  } finally {
    try { ab(['close']); } catch (_) { /* ignore */ }
  }

  fs.writeFileSync(path.join(outDir, 'last-run.json'), JSON.stringify(summary, null, 2), 'utf8');
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  if (summary.errors.length) process.exitCode = 2;
}

try { main(); }
catch (e) {
  process.stderr.write(`[capture] 致命错误: ${e.stack || e.message}\n`);
  process.exitCode = 1;
}
