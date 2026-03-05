<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPCR Rating Matrix - QMMC</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        :root { --navy: #1a3b6e; --navy-hover: #0f2651; --bg: #c8c8c4; --paper: #fdfcf8; --line: #333; --muted: #555; --section-bg: #e4e0d4; }
        body { background: var(--bg); font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 20px; }
        .page { background: var(--paper); width: 1140px; margin: 0 auto; border: 2px solid #999; box-shadow: 4px 4px 18px rgba(0,0,0,.35); padding: 20px 24px 32px; }
        .form-ref { text-align: right; font-size: 8.5px; color: var(--muted); margin-bottom: 3px; }
        .doc-header { display: flex; align-items: center; gap: 14px; border-bottom: 2.5px solid var(--navy); padding-bottom: 8px; }
        .logo-circle { width: 74px; height: 74px; border: 2px solid var(--navy); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #eef3fb; font-size: 7px; font-weight: 700; color: var(--navy); text-align: center; line-height: 1.3; padding: 6px; }
        .header-text { flex: 1; text-align: center; }
        .header-text .org-name { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--navy); }
        .header-text .org-sub { font-size: 10px; color: var(--muted); margin: 1px 0 4px; }
        .header-text .form-title { font-size: 13px; font-weight: 700; color: var(--navy); text-transform: uppercase; border: 2px solid var(--navy); display: inline-block; padding: 2px 18px; }
        .sig-outer { border: 1px solid var(--line); border-top: none; }
        .sig-row { display: flex; }
        .sig-cell { flex: 1; padding: 7px 12px; border-right: 1px solid var(--line); }
        .sig-cell:last-child { border-right: none; }
        .sig-label { font-size: 10px; font-weight: 700; margin-bottom: 3px; }
        .sig-name-input { border: none; border-bottom: 1px solid #000; background: transparent; font-weight: 700; font-size: 11px; font-family: inherit; width: 100%; text-align: center; outline: none; padding: 0 2px; }
        .sig-sub { font-size: 8.5px; color: var(--muted); font-style: italic; text-align: center; margin-top: 1px; }
        .date-row { margin-top: 5px; font-size: 10px; }
        .date-inp { border: none; border-bottom: 1px solid #000; background: transparent; font-size: 10px; font-family: inherit; outline: none; }
        .sub-inp { border: none; border-bottom: 1px solid #000; background: transparent; font-size: 10px; font-family: inherit; outline: none; width: 80%; }
        .matrix-title-bar { background: var(--navy); color: #fff; font-size: 11px; font-weight: 700; padding: 5px 10px; text-transform: uppercase; letter-spacing: .4px; }
        .matrix-table { width: 100%; border-collapse: collapse; border: 1px solid var(--line); border-top: none; table-layout: fixed; }
        .matrix-table th, .matrix-table td { border: 1px solid var(--line); padding: 4px 6px; vertical-align: top; font-size: 10px; word-wrap: break-word; }
        .matrix-table thead th { background: #dce4f0; text-align: center; font-weight: 700; vertical-align: middle; }
        .matrix-table .section-row td { background: var(--section-bg); font-weight: 700; text-align: center; font-size: 10px; padding: 4px 8px; }
        .col-measure { width: 15%; } .col-opdef { width: 20%; } .col-quality { width: 15%; } .col-eff { width: 15%; } .col-time { width: 15%; } .col-source { width: 10%; } .col-view { width: 42px; } .col-del { width: 28px; }
        .matrix-table textarea, .matrix-table input[type="text"] { width: 100%; border: none; background: transparent; font-family: Arial, sans-serif; font-size: 10px; outline: none; resize: none; overflow: hidden; min-height: 18px; line-height: 1.4; padding: 0; }
        .matrix-table textarea { min-height: 60px; }
        .matrix-table td:focus-within { background: #fffde7; }
        .remove-btn { background: none; border: none; color: #c00; font-size: 14px; cursor: pointer; padding: 0; line-height: 1; }
        .action-bar { display: flex; gap: 8px; align-items: center; margin-top: 10px; flex-wrap: wrap; }
        .btn-action { border: none; cursor: pointer; font-family: Arial, sans-serif; font-size: 11px; padding: 5px 16px; border-radius: 2px; font-weight: 700; }
        .btn-navy { background: var(--navy); color: #fff; } .btn-navy:hover { background: var(--navy-hover); }
        .btn-slate { background: #4a6fa5; color: #fff; } .btn-slate:hover { background: #375c8a; }
        .btn-green { background: #1e6e3a; color: #fff; } .btn-green:hover { background: #155230; }
        .alert-ok { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 8px 14px; margin-bottom: 12px; border-radius: 2px; font-size: 11px; }
        .prev-section { margin-top: 32px; }
        .prev-section h3 { font-size: 13px; font-weight: 700; color: var(--navy); border-bottom: 2px solid var(--navy); padding-bottom: 4px; margin-bottom: 10px; }
        .prev-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .prev-table th { background: var(--navy); color: #fff; padding: 6px 8px; text-align: left; font-weight: 600; }
        .prev-table td { padding: 5px 8px; border-bottom: 1px solid #ccc; }
        .prev-table tr:hover td { background: #f0f4fb; }
        .badge-btn { border: none; cursor: pointer; padding: 2px 8px; border-radius: 2px; font-size: 10px; font-family: inherit; text-decoration: none; display: inline-block; font-weight: 600; }
        .badge-view { background: var(--navy); color: #fff; }
        .badge-del { background: #dc3545; color: #fff; }

        /* ── view link inside data rows ── */
        .row-view-btn {
            background: none; border: none; font-family: inherit;
            font-size: 9px; color: var(--navy); text-decoration: underline;
            cursor: pointer; padding: 0; font-weight: 600;
            display: block; text-align: center; width: 100%;
            margin-top: 2px;
        }
        .row-view-btn:hover { color: #c00; }
        .col-view { text-align: center; vertical-align: middle; border: 1px solid var(--line); }

        /* ── modal ── */
        .modal-overlay {
            display: none; position: fixed; inset: 0;
            background: rgba(0,0,0,.5); z-index: 9999;
            align-items: center; justify-content: center;
        }
        .modal-overlay.open { display: flex; }
        .modal-box {
            background: #fff; border: 2px solid var(--navy);
            border-radius: 4px; padding: 20px 24px 18px;
            min-width: 280px; box-shadow: 0 6px 28px rgba(0,0,0,.3);
            position: relative;
        }
        .modal-box h4 {
            font-size: 11px; font-weight: 700; color: var(--navy);
            text-transform: uppercase; border-bottom: 2px solid var(--navy);
            padding-bottom: 6px; margin: 0 0 12px;
        }
        .modal-scale-table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
        .modal-scale-table td { padding: 5px 10px; border: 1px solid #ccc; }
        .modal-scale-table tr:nth-child(even) td { background: #f4f6fb; }
        .modal-scale-table td:first-child { font-weight: 700; text-align: center; background: #dce4f0; width: 36px; color: var(--navy); }
        .modal-close { position: absolute; top: 7px; right: 10px; background: none; border: none; font-size: 18px; cursor: pointer; color: #777; line-height: 1; }
        .modal-close:hover { color: #c00; }

        @media print {
    body { background: #fff; padding: 0; }
    .page { box-shadow: none; border: none; width: 100%; }
    .action-bar, .remove-btn, .prev-section { display: none !important; }
    .col-del { display: none !important; }
}
    </style>
</head>
<body>
<div class="page">

    @if(session('success'))
        <div class="alert-ok">{{ session('success') }}</div>
    @endif

    <div class="form-ref">PMT - SPCR Rating Matrix | Rev.0 01 March 2024</div>

    <div class="doc-header">
        <div class="logo-circle">QMMC<br>SEAL</div>
        <div class="header-text">
            <div class="org-name">Pang-Aalaing Sentrong Medikal Quirino</div>
            <div class="org-sub">(Quirino Memorial Medical Center)</div>
            <div class="form-title">Hospital Operation and Patient Support Service</div>
            <div style="font-size:11px; color:#333; margin-top:3px;">SPCR Rating Matrix</div>
        </div>
    </div>

    <form method="POST" action="{{ route('spcr.matrix.store') }}" id="mainForm">
        @csrf

        <div class="sig-outer">
            <div class="sig-row">
                <div class="sig-cell" style="flex:2;">
                    <div class="sig-label">Prepared By:</div>
                    <div style="margin-bottom:14px;"></div>
                    <input type="text" name="prepared_by" class="sig-name-input" placeholder="Full Name of Employee" value="{{ old('prepared_by') }}" required>
                    <div class="sig-sub"><em>Division Chief / Name of Employee</em></div>
                    <div style="margin-top:5px; font-size:10px;"><strong>Title:</strong> <input type="text" name="prepared_by_title" class="sub-inp" placeholder="Position / Division / Service" value="{{ old('prepared_by_title') }}"></div>
                </div>
                <div class="sig-cell" style="flex:2;">
                    <div class="sig-label">Reviewed By:</div>
                    <div style="margin-bottom:14px;"></div>
                    <input type="text" name="reviewed_by" class="sig-name-input" placeholder="Name of Reviewer" value="{{ old('reviewed_by') }}">
                    <div class="sig-sub"><em>Chairperson, Performance Management Team</em></div>
                    <div style="margin-top:5px; font-size:10px;"><strong>Title:</strong> <input type="text" name="reviewed_by_title" class="sub-inp" placeholder="e.g. MD, FPCP, FPCCP, MAS" value="{{ old('reviewed_by_title') }}"></div>
                </div>
                <div class="sig-cell" style="flex:2;">
                    <div class="sig-label">Approved By:</div>
                    <div style="margin-bottom:14px;"></div>
                    <input type="text" name="approved_by" class="sig-name-input" placeholder="Name of Approver" value="{{ old('approved_by') }}">
                    <div class="sig-sub"><em>Medical Center Chief II</em></div>
                    <div style="margin-top:5px; font-size:10px;"><strong>Title:</strong> <input type="text" name="approved_by_title" class="sub-inp" placeholder="e.g. Medical Center Chief II" value="{{ old('approved_by_title') }}"></div>
                </div>
            </div>
        </div>

        <div class="matrix-title-bar"></div>
        <table class="matrix-table" id="matrixTable">
            <thead>
                <tr>
                    <th class="col-measure">PERFORMANCE<br>MEASURE</th>
                    <th class="col-opdef">OPERATIONAL<br>DEFINITION</th>
                    <th class="col-quality">QUALITY (Q)</th>
                    <th class="col-eff">EFFICIENCY (E)</th>
                    <th class="col-time">TIMELINESS (T)</th>
                    <th class="col-source">SOURCE OF DATA /<br>MONITORING TOOL</th>
                    <th class="col-view" style="background:#dce4f0; font-size:9px; font-weight:700;">SCALE</th>
                    <th class="col-del" style="border:none; background:transparent;"></th>
                </tr>
            </thead>
            <tbody id="matrixBody">
                <tr class="section-row">
                    <td colspan="7">STRATEGIC FUNCTION</td>
                    <td style="border:none; background:var(--section-bg);"></td>
                </tr>
            </tbody>
        </table>

        <div class="action-bar">
            <button type="button" class="btn-action btn-navy" id="addRowBtn">+ Add Row</button>
            <button type="button" class="btn-action btn-slate" id="addSectionBtn">+ Add Section</button>
            <button type="submit" class="btn-action btn-green" style="margin-left:auto;">Save Rating Matrix</button>
            <button type="button" class="btn-action btn-navy" onclick="window.print()">Print</button>
        </div>
    </form>

    @if($matrices->isNotEmpty())
    <div class="prev-section">
        <h3>Previous Submissions</h3>
        <table class="prev-table">
            <thead>
                <tr>
                    <th>#</th><th>Prepared By</th><th>Title</th><th>Reviewed By</th><th>Approved By</th><th>-</th><th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($matrices as $m)
                <tr>
                    <td>{{ $m->id }}</td>
                    <td>{{ $m->prepared_by }}</td>
                    <td>{{ $m->prepared_by_title ?? '-' }}</td>
                    <td>{{ $m->reviewed_by ?? '-' }}</td>
                    <td>{{ $m->approved_by ?? '-' }}</td>
                    <td>{{ $m->prepared_date ? $m->prepared_date->format('M d, Y') : '-' }}</td>
                    <td style="display:flex; gap:4px; align-items:center;">
                        <a href="{{ route('spcr.matrix.show', $m->id) }}" class="badge-btn badge-view">View</a>
                        <form method="POST" action="{{ route('spcr.matrix.destroy', $m->id) }}" onsubmit="return confirm('Delete this entry?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="badge-btn badge-del">Delete</button>
                        </form>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

</div>

{{-- RATING SCALE MODAL --}}
<div class="modal-overlay" id="scaleModal" onclick="if(event.target===this) closeScaleModal()">
    <div class="modal-box">
        <button class="modal-close" onclick="closeScaleModal()">&times;</button>
        <h4>Accomplishment Rating Scale</h4>
        <table class="modal-scale-table">
            <tr><td>5</td><td>= 100% of the target</td></tr>
            <tr><td>4</td><td>= 85%–99% of the target</td></tr>
            <tr><td>3</td><td>= 75%–84% of the target</td></tr>
            <tr><td>2</td><td>= &lt;75% of the target</td></tr>
        </table>
    </div>
</div>

<script>
function openScaleModal()  { document.getElementById('scaleModal').classList.add('open'); }
function closeScaleModal() { document.getElementById('scaleModal').classList.remove('open'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeScaleModal(); });

let rowIdx = 0;
function autoExpand(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
function makeTA(name, placeholder) {
    const ta = document.createElement('textarea');
    ta.name = name; ta.placeholder = placeholder; ta.style.minHeight = '60px';
    ta.addEventListener('input', () => autoExpand(ta));
    return ta;
}
function createRow(idx, data = {}) {
    const tr = document.createElement('tr');
    const cols = [
        { key: 'performance_measure',    ph: 'Performance measure...' },
        { key: 'operational_definition', ph: 'Operational definition...' },
        { key: 'quality',                ph: 'Quality dimension elements...' },
        { key: 'efficiency',             ph: 'Efficiency dimension elements...' },
        { key: 'timeliness',             ph: 'Timeliness dimension elements...' },
        { key: 'source_monitoring',      ph: 'Source / Monitoring tool...' },
    ];
    cols.forEach(c => {
        const td = document.createElement('td');
        const ta = makeTA('items[' + idx + '][' + c.key + ']', c.ph);
        ta.value = data[c.key] || '';
        td.appendChild(ta); tr.appendChild(td);
    });

    // ── view button cell (right side of each data row) ──
    const tdView = document.createElement('td');
    tdView.className = 'col-view';
    tdView.style.cssText = 'text-align:center; vertical-align:middle; padding:4px 2px;';
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.className = 'row-view-btn';
    viewBtn.textContent = 'view';
    viewBtn.onclick = openScaleModal;
    tdView.appendChild(viewBtn);
    tr.appendChild(tdView);

    // ── delete button cell ──
    const tdDel = document.createElement('td');
    tdDel.style.cssText = 'border:none; text-align:center; vertical-align:middle; width:28px; padding:2px;';
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'remove-btn'; btn.title = 'Remove row'; btn.innerHTML = 'x';
    btn.onclick = () => tr.remove();
    tdDel.appendChild(btn); tr.appendChild(tdDel);
    return tr;
}

document.getElementById('addRowBtn').addEventListener('click', () => {
    const tr = createRow(rowIdx++);
    document.getElementById('matrixBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
    tr.querySelector('textarea').focus();
});

document.getElementById('addSectionBtn').addEventListener('click', () => {
    const tr = document.createElement('tr'); tr.className = 'section-row';
    const td = document.createElement('td'); td.colSpan = 7;
    const inp = document.createElement('input'); inp.type = 'text';
    inp.name = 'items[' + rowIdx + '][section_label]';
    inp.placeholder = 'Section name (e.g. CORE FUNCTION)';
    inp.style.cssText = 'width:100%; border:none; background:transparent; font-weight:700; font-size:10px; outline:none; text-align:center;';
    const flag = document.createElement('input'); flag.type = 'hidden';
    flag.name = 'items[' + rowIdx + '][is_section]'; flag.value = '1'; rowIdx++;
    td.appendChild(inp); td.appendChild(flag);
    const tdDel = document.createElement('td');
    tdDel.style.cssText = 'border:none; background:var(--section-bg); text-align:center; vertical-align:middle; width:28px;';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'remove-btn';
    btn.innerHTML = 'x'; btn.onclick = () => tr.remove();
    tdDel.appendChild(btn); tr.appendChild(td); tr.appendChild(tdDel);
    document.getElementById('matrixBody').appendChild(tr); inp.focus();
});

const defaults = [
    { performance_measure: '100% of the PGS Strategic deliverables are achieved within the prescribed timeline.', operational_definition: 'This indicator shall cover compliance to PGS Strategic Deliverables and Commitments of every sections which will appear in PGS Deliverables Monitoring tool.', quality: 'Accuracy\nCompleteness\nAcceptability\nMeeting the standards\nMeeting specifications\nClient satisfaction', efficiency: 'Rate of accomplishment versus target (volume)\nProductivity\nOutput over specific time', timeliness: 'Turnaround Time\nAverage Waiting Time\nResponse Time\nDeadlines\nLead Time\nCycle Time\nProcessing Time', source_monitoring: 'PGS Deliverable Monitoring' },
    { performance_measure: '90% compliance with the Green Viability Assessment (GVA) by June 2025.', operational_definition: '', quality: '', efficiency: '', timeliness: '', source_monitoring: 'GVA Compliance Checklist' }
];
defaults.forEach(d => {
    const tr = createRow(rowIdx++, d);
    document.getElementById('matrixBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
});
</script>
</body>
</html>