#!/usr/bin/env python3
"""iTalent 加班时长台账：创建 / 追加写入 xlsx，并返回加班分钟数汇总。

输入（stdin JSON）:
  {
    "excelPath": "/abs/path/加班时长统计.xlsx",
    "rows": [
      {"date":"2026-11-05","weekday":"星期四","firstClock":"08:46",
       "lastClock":"18:50","overtime":true,"minutes":50,
       "file":"2026-11-05加班.png","updatedAt":"2026-11-06T10:01:09Z"}
    ],
    "runDates": ["2026-11-05"]   // 本次新抓取的日期，用于计算本次分钟数
  }

输出（stdout JSON）:
  {"excelPath":..., "rowCount":6, "added":6, "updated":0,
   "totalMinutes":313, "runMinutes":50, "created":true}
"""

import json
import os
import sys
from datetime import date, datetime

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

HEADERS = ['考勤日期', '星期', '最早实打卡', '最晚实打卡', '加班判定', '加班分钟数', '截图文件', '更新时间']
WIDTHS = [14, 10, 14, 14, 10, 13, 26, 21]

WEEKDAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

HEADER_FILL = PatternFill('solid', fgColor='1F4E79')
HEADER_FONT = Font(bold=True, color='FFFFFF', size=11)
OT_FILL = PatternFill('solid', fgColor='FCE4D6')
OT_FONT = Font(bold=True, color='C00000')
TOTAL_FILL = PatternFill('solid', fgColor='E7E6E6')
TOTAL_FONT = Font(bold=True, size=11)
CENTER = Alignment(horizontal='center', vertical='center')
THIN = Side(style='thin', color='D9D9D9')
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)


def weekday_of(s):
    try:
        d = date.fromisoformat(s[:10])
        return WEEKDAYS[d.weekday()]
    except Exception:
        return ''


def short_time(s):
    if not s:
        return ''
    t = str(s).strip()
    if 'T' in t:
        t = t.split('T', 1)[1]
    if ' ' in t:
        t = t.split(' ', 1)[1]
    return t[:5]


def stamp(s):
    if not s:
        return ''
    t = str(s).strip()
    if 'T' in t:
        t = t.replace('T', ' ')
    return t[:19]


def read_existing(path):
    """读取已有台账，返回 {date: [8 列值]}；文件不存在或损坏时返回空。"""
    if not os.path.exists(path):
        return {}
    try:
        wb = load_workbook(path, data_only=True)
        ws = wb.active
        header = [c.value for c in ws[1]]
        col = {str(v).strip(): i for i, v in enumerate(header) if v}
        date_i = col.get('考勤日期', 0)
        minute_i = col.get('加班分钟数', 5)
        out = {}
        for row in ws.iter_rows(min_row=2, values_only=True):
            d = row[date_i] if date_i < len(row) else None
            if d is None:
                continue
            d = str(d).strip()[:10]
            if not d or d in ('合计', '总计') or not d[:4].isdigit():
                continue
            vals = list(row[:len(HEADERS)]) + [''] * max(0, len(HEADERS) - len(row))
            vals = vals[:len(HEADERS)]
            vals[0] = d
            vals[1] = vals[1] or weekday_of(d)
            try:
                vals[5] = int(float(vals[5] or 0))
            except (TypeError, ValueError):
                vals[5] = 0
            out[d] = vals
        return out
    except Exception:
        return {}


def main():
    payload = json.loads(sys.stdin.read() or '{}')
    excel_path = payload.get('excelPath')
    if not excel_path:
        raise SystemExit('缺少 excelPath')
    rows = payload.get('rows', [])
    run_dates = set(payload.get('runDates', []))
    created = not os.path.exists(excel_path)

    merged = read_existing(excel_path)
    added = updated = 0
    for item in rows:
        d = str(item.get('date', ''))[:10]
        if not d:
            continue
        if d in merged:
            updated += 1
        else:
            added += 1
        merged[d] = [
            d,
            item.get('weekday') or weekday_of(d),
            short_time(item.get('firstClock')),
            short_time(item.get('lastClock')),
            '是' if item.get('overtime') else '否',
            int(item.get('minutes', 0) or 0),
            item.get('file', ''),
            stamp(item.get('updatedAt')),
        ]

    keys = sorted(merged)
    wb = Workbook()
    ws = wb.active
    ws.title = '加班时长'
    ws.append(HEADERS)
    for i, w in enumerate(WIDTHS, start=1):
        ws.column_dimensions[ws.cell(row=1, column=i).column_letter].width = w
    for c in ws[1]:
        c.fill = HEADER_FILL
        c.font = HEADER_FONT
        c.alignment = CENTER
        c.border = BORDER
    ws.row_dimensions[1].height = 24

    for d in keys:
        ws.append(merged[d])
        r = ws.max_row
        for c in ws[r]:
            c.border = BORDER
            c.alignment = CENTER if c.column != 7 else Alignment(horizontal='left', vertical='center')
        minutes = merged[d][5]
        if minutes > 0:
            ws.cell(row=r, column=6).fill = OT_FILL
            ws.cell(row=r, column=6).font = OT_FONT
        ws.cell(row=r, column=6).number_format = '0'

    total = sum(int(merged[d][5]) for d in keys)
    ws.append(['合计', '', '', '', '', total, '', ''])
    r = ws.max_row
    for c in ws[r]:
        c.fill = TOTAL_FILL
        c.font = TOTAL_FONT
        c.border = BORDER
        c.alignment = CENTER
    ws.cell(row=r, column=6).number_format = '0'

    ws.freeze_panes = 'A2'
    ws.auto_filter.ref = f'A1:H{max(1, ws.max_row - 1)}'

    parent = os.path.dirname(os.path.abspath(excel_path))
    if parent:
        os.makedirs(parent, exist_ok=True)
    wb.save(excel_path)

    run_minutes = sum(int(merged[d][5]) for d in run_dates if d in merged)
    print(json.dumps({
        'excelPath': os.path.abspath(excel_path),
        'rowCount': len(keys),
        'added': added,
        'updated': updated,
        'totalMinutes': total,
        'runMinutes': run_minutes,
        'created': created,
    }, ensure_ascii=False))


if __name__ == '__main__':
    main()
