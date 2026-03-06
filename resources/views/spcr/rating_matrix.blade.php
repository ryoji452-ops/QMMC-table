<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>QMMC – SPCR Matrix & DPCR</title>
<style>
*, *::before, *::after { box-sizing: border-box; }
:root {
  --navy: #1a3b6e; --navy-h: #0f2651;
  --slate: #4a6fa5; --green: #1e6e3a;
  --line: #333; --muted: #555; --sec-bg: #fcfcfc;
}

/* ── LAYOUT ── */
body { background: #c8cfd8; font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 16px; }

/* ── TAB NAV ── */
.tab-nav { display: flex; gap: 0; margin-bottom: 0; width: 1160px; margin-inline: auto; }
.tab-btn {
  padding: 8px 28px; font-size: 12px; font-weight: 700; cursor: pointer;
  background: #b0bac8; color: #333; border: 2px solid #999; border-bottom: none;
  border-radius: 6px 6px 0 0; letter-spacing: .3px; transition: background .15s;
  font-family: Arial, sans-serif;
}
.tab-btn.active { background: #fff; color: var(--navy); border-color: var(--navy); border-bottom: 2px solid #fff; z-index: 2; }
.tab-btn:not(.active):hover { background: #cdd4de; }

/* ── PAGE WRAPPER ── */
.page {
  background: #fff; width: 1160px; margin: 0 auto;
  border: 2px solid var(--navy); border-radius: 0 4px 4px 4px;
  box-shadow: 4px 4px 18px rgba(0,0,0,.35);
  padding: 18px 22px 28px;
  display: none;
}
.page.active { display: block; }

/* ── SHARED HEADER ── */
.form-ref { text-align: right; font-size: 8.5px; color: var(--muted); margin-bottom: 3px; }
.doc-header { display: flex; align-items: center; gap: 14px; border-bottom: 2.5px solid var(--navy); padding-bottom: 8px; margin-bottom: 0; }
.logo-circle {
  width: 74px; height: 74px; border: 2px solid var(--navy); border-radius: 50%;
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: #eef3fb; font-size: 7px; font-weight: 700; color: var(--navy);
  text-align: center; line-height: 1.3; padding: 6px;
}
.header-text { flex: 1; text-align: center; }
.org-name { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--navy); }
.org-sub { font-size: 10px; color: var(--muted); margin: 1px 0 4px; }
.form-title { font-size: 13px; font-weight: 700; color: var(--navy); text-transform: uppercase; border: 2px solid var(--navy); display: inline-block; padding: 2px 18px; }

/* ── SIGNATURE BLOCKS ── */
.sig-outer { border: 1px solid var(--line); border-top: none; }
.sig-row { display: flex; }
.sig-cell { flex: 1; padding: 7px 12px; border-right: 1px solid var(--line); }
.sig-cell:last-child { border-right: none; }
.sig-label { font-size: 10px; font-weight: 700; margin-bottom: 3px; }
.sig-name-input {
  border: none; border-bottom: 1px solid #000; background: transparent;
  font-weight: 700; font-size: 11px; font-family: inherit;
  width: 100%; text-align: center; outline: none; padding: 0 2px;
}
.sig-sub { font-size: 8.5px; color: var(--muted); font-style: italic; text-align: center; margin-top: 1px; }
.sub-inp {
  border: none; border-bottom: 1px solid #000; background: transparent;
  font-size: 10px; font-family: inherit; outline: none; width: 80%;
}

/* ── SYNC BADGE ── */
.sync-note {
  font-size: 9.5px; color: #1e6e3a; background: #e6f4ec; border: 1px solid #b2dfc0;
  padding: 3px 10px; border-radius: 2px; margin-top: 6px; display: inline-block;
}

/* ── MATRIX TABLE ── */
.matrix-title-bar { background: var(--navy); color: #fff; font-size: 11px; font-weight: 700; padding: 5px 10px; text-transform: uppercase; letter-spacing: .4px; margin-top: 10px; }
.matrix-table { width: 100%; border-collapse: collapse; border: 1px solid var(--line); border-top: none; table-layout: fixed; }
.matrix-table th, .matrix-table td { border: 1px solid var(--line); padding: 4px 6px; vertical-align: top; font-size: 10px; word-wrap: break-word; }
.matrix-table thead th { background: #dce4f0; text-align: center; font-weight: 700; vertical-align: middle; }
.matrix-table .section-row td { background: var(--sec-bg); font-weight: 700; text-align: center; font-size: 10px; padding: 4px 8px; }
.col-measure{width:15%} .col-opdef{width:20%} .col-quality{width:15%} .col-eff{width:15%} .col-time{width:14%} .col-source{width:11%} .col-view{width:42px} .col-del{width:26px}
.matrix-table textarea, .matrix-table input[type="text"] { width:100%; border:none; background:transparent; font-family:Arial,sans-serif; font-size:10px; outline:none; resize:none; overflow:hidden; min-height:18px; line-height:1.4; padding:0; }
.matrix-table textarea { min-height: 58px; }
.matrix-table td:focus-within { background: #fffde7; }
.row-view-btn { background:none; border:none; font-family:inherit; font-size:9px; color:var(--navy); text-decoration:underline; cursor:pointer; padding:0; font-weight:600; display:block; text-align:center; width:100%; }
.row-view-btn:hover { color:#c00; }

/* ── DPCR TABLE ── */
.dpcr-table { width: 100%; border-collapse: collapse; border: 1px solid #000; table-layout: fixed; margin-top: 0; }
.dpcr-table th, .dpcr-table td { border: 1px solid #000; padding: 4px 5px; vertical-align: middle; font-size: 10px; word-wrap: break-word; }
.dpcr-table thead tr th { background-color: #dce4f0; text-align: center; font-weight: bold; font-size: 10px; }
.dpcr-table .section-header td { background-color: #f0f0f0; font-weight: bold; font-size: 10px; padding: 3px 5px; }
.col-goal{width:14%} .col-indicator{width:22%} .col-budget{width:7%} .col-section{width:9%} .col-actual{width:14%} .col-rate{width:9%} .col-q{width:4%} .col-e{width:4%} .col-t{width:4%} .col-a{width:4%} .col-remarks{width:13%}
.dpcr-table input[type="text"], .dpcr-table input[type="date"], .dpcr-table select, .dpcr-table textarea { width:100%; border:none; background:transparent; font-size:10px; font-family:Arial,sans-serif; padding:1px 2px; outline:none; resize:none; overflow:hidden; min-height:20px; }
.dpcr-table textarea { min-height: 52px; line-height: 1.4; }
.dpcr-table select { -webkit-appearance:none; cursor:pointer; }
.dpcr-table td:focus-within { background-color: #fffde7; }
.rating-cell { text-align: center; vertical-align: middle; }
.goal-cell { font-size: 10px; font-style: italic; }
.rating-key { font-size: 9px; line-height: 1.5; }

/* ── INTRO BLOCK (DPCR) ── */
.intro-block { border: 1px solid #000; padding: 6px 10px 4px; margin-bottom: 0; }
.intro-line { font-size: 11px; line-height: 1.6; }
.underline-field { border-bottom: 1px solid #000; display: inline-block; min-width: 140px; font-weight: bold; }
.label-small { font-size: 9px; color: #333; margin-left: 4px; }
.intro-field { border:none; border-bottom:1px solid #000; background:transparent; font-size:11px; font-family:inherit; font-weight:bold; outline:none; }

/* ── ACTION BAR ── */
.action-bar { display: flex; gap: 8px; align-items: center; margin-top: 10px; flex-wrap: wrap; }
.btn-action { border:none; cursor:pointer; font-family:Arial,sans-serif; font-size:11px; padding:5px 16px; border-radius:2px; font-weight:700; }
.btn-navy { background:var(--navy); color:#fff; } .btn-navy:hover { background:var(--navy-h); }
.btn-slate { background:var(--slate); color:#fff; } .btn-slate:hover { background:#375c8a; }
.btn-green { background:var(--green); color:#fff; } .btn-green:hover { background:#155230; }
.btn-orange { background:#c0540a; color:#fff; } .btn-orange:hover { background:#943f07; }
.btn-purple { background:#6a3e9e; color:#fff; } .btn-purple:hover { background:#512d7a; }
.btn-teal { background:#0d7377; color:#fff; } .btn-teal:hover { background:#095a5d; }
.remove-btn { background:none; border:none; color:#c00; font-size:14px; cursor:pointer; padding:0; line-height:1; }

/* ── ALERTS ── */
.alert-ok  { background:#d4edda; border:1px solid #c3e6cb; color:#155724; padding:8px 14px; margin-bottom:10px; border-radius:2px; font-size:11px; display:none; }
.alert-err { background:#f8d7da; border:1px solid #f5c6cb; color:#721c24; padding:8px 14px; margin-bottom:10px; border-radius:2px; font-size:11px; display:none; }
.alert-info{ background:#d1ecf1; border:1px solid #bee5eb; color:#0c5460; padding:8px 14px; margin-bottom:10px; border-radius:2px; font-size:11px; display:none; }

/* ── PREVIOUS TABLE ── */
.prev-section { margin-top: 28px; }
.prev-section h3 { font-size:13px; font-weight:700; color:var(--navy); border-bottom:2px solid var(--navy); padding-bottom:4px; margin-bottom:10px; }
.prev-table { width:100%; border-collapse:collapse; font-size:11px; }
.prev-table th { background:var(--navy); color:#fff; padding:6px 8px; text-align:left; font-weight:600; }
.prev-table td { padding:5px 8px; border-bottom:1px solid #ccc; vertical-align:middle; }
.prev-table tr:hover td { background:#f0f4fb; }
.badge-btn { border:none; cursor:pointer; padding:2px 10px; border-radius:2px; font-size:10px; font-family:inherit; font-weight:600; }
.badge-view { background:var(--navy); color:#fff; }
.badge-del  { background:#dc3545; color:#fff; }
.badge-push { background:var(--green); color:#fff; }
.no-prev { color:var(--muted); font-style:italic; font-size:11px; padding:8px 0; }

/* ── MODALS ── */
.modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:9999; align-items:center; justify-content:center; }
.modal-overlay.open { display:flex; }
.modal-box { background:#fff; border:2px solid var(--navy); border-radius:4px; padding:20px 24px 18px; min-width:280px; box-shadow:0 6px 28px rgba(0,0,0,.3); position:relative; }
.modal-box h4 { font-size:11px; font-weight:700; color:var(--navy); text-transform:uppercase; border-bottom:2px solid var(--navy); padding-bottom:6px; margin:0 0 12px; }
.modal-scale-table { width:100%; border-collapse:collapse; font-size:10.5px; }
.modal-scale-table td { padding:5px 10px; border:1px solid #ccc; }
.modal-scale-table tr:nth-child(even) td { background:#f4f6fb; }
.modal-scale-table td:first-child { font-weight:700; text-align:center; background:#dce4f0; width:36px; color:var(--navy); }
.modal-close { position:absolute; top:7px; right:10px; background:none; border:none; font-size:18px; cursor:pointer; color:#777; line-height:1; }
.modal-close:hover { color:#c00; }

.view-modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:9998; align-items:flex-start; justify-content:center; overflow-y:auto; padding:30px 16px; }
.view-modal-overlay.open { display:flex; }
.view-modal-box { background:#fff; border:2px solid var(--navy); border-radius:4px; padding:24px 28px 22px; width:100%; max-width:1100px; box-shadow:0 6px 32px rgba(0,0,0,.35); position:relative; margin:auto; }
.view-modal-box h4 { font-size:13px; font-weight:700; color:var(--navy); text-transform:uppercase; border-bottom:2px solid var(--navy); padding-bottom:6px; margin:0 0 14px; }
.view-meta { display:flex; gap:24px; flex-wrap:wrap; margin-bottom:14px; font-size:11px; }
.view-meta span { color:var(--muted); }
.view-tbl { width:100%; border-collapse:collapse; font-size:10px; margin-top:10px; }
.view-tbl th { background:#dce4f0; border:1px solid var(--line); padding:5px 7px; font-weight:700; text-align:center; }
.view-tbl td { border:1px solid var(--line); padding:5px 7px; vertical-align:top; white-space:pre-wrap; word-break:break-word; }
.view-tbl .sec-row td { background:var(--sec-bg); font-weight:700; text-align:center; }
.view-modal-close { position:absolute; top:10px; right:14px; background:none; border:none; font-size:22px; cursor:pointer; color:#777; line-height:1; }
.view-modal-close:hover { color:#c00; }

/* ── DPCR SIG AREA ── */
.d-sig-row { display:flex; border:1px solid #000; border-top:none; }
.d-sig-cell { flex:1; padding:5px 10px; border-right:1px solid #000; }
.d-sig-cell:last-child { border-right:none; }
.d-sig-name { font-weight:bold; font-size:11px; border-bottom:1px solid #000; display:inline-block; min-width:200px; text-align:center; }
.d-sig-title { font-size:9px; text-align:center; margin-top:1px; }

/* ── TRANSFER BANNER ── */
.transfer-banner {
  background:#e6f4ec; border:1px solid #b2dfc0; color:#155724;
  padding:6px 12px; border-radius:2px; font-size:11px; margin-bottom:10px;
  display:none; font-weight:600;
}

@media print {
  body { background:#fff; padding:0; margin:0; }
  .tab-nav { display:none !important; }
  .action-bar, .remove-btn, .prev-section,
  .alert-ok, .alert-err, .alert-info,
  .transfer-banner, .sync-note { display:none !important; }

  /* hide the inactive tab page */
  .page { display:none !important; box-shadow:none; border:none; }
  .page.active { display:block !important; width:100% !important; padding:10px 14px !important; }

  /* hide delete column */
  .col-del, th:last-child, td:last-child { display:none !important; }

  /* DPCR-specific: landscape + fit table */
  #page-dpcr { font-size:9px !important; }
  #page-dpcr .dpcr-table { font-size:8.5px !important; table-layout:fixed; width:100% !important; }
  #page-dpcr .dpcr-table th,
  #page-dpcr .dpcr-table td { padding:3px 4px !important; font-size:8.5px !important; word-break:break-word; }
  #page-dpcr .intro-block { font-size:9px !important; }
  #page-dpcr .intro-field { font-size:9px !important; }
  #page-dpcr .d-sig-row { font-size:9px !important; }
  #page-dpcr .doc-header { padding-bottom:6px !important; }
  #page-dpcr textarea, #page-dpcr input { font-size:8.5px !important; }

  /* SPCR-specific */
  #page-spcr .matrix-table { font-size:8.5px !important; }
  #page-spcr .matrix-table th,
  #page-spcr .matrix-table td { padding:3px 4px !important; font-size:8.5px !important; }
  #page-spcr textarea { font-size:8.5px !important; }

  /* focus highlight off for print */
  .matrix-table td:focus-within,
  .dpcr-table td:focus-within { background:transparent !important; }
}

@page {
  size: A4 landscape;
  margin: 10mm 8mm;
}

@page :first {
  margin-top: 8mm;
}
</style>
</head>
<body>

<!-- TAB NAVIGATION -->
<div class="tab-nav">
  <button class="tab-btn active" onclick="switchTab('spcr')">📋 SPCR Rating Matrix</button>
  <button class="tab-btn" onclick="switchTab('dpcr')">📄 DPCR</button>
</div>

<!-- ═══════════════════════════════════════════════
     PAGE 1 — SPCR RATING MATRIX
═══════════════════════════════════════════════ -->
<div class="page active" id="page-spcr">

  <div id="s-alertOk"   class="alert-ok"></div>
  <div id="s-alertErr"  class="alert-err"></div>
  <div id="s-alertInfo" class="alert-info"></div>

  <div class="form-ref">PMT - SPCR Rating Matrix | Rev.0 01 March 2024</div>

  <div class="doc-header">
    <div class="logo-circle">QMMC<br>SEAL</div>
    <div class="header-text">
      <div class="org-name">Pang-ALAALANG Sentrong Medikal Quirino</div>
      <div class="org-sub">(Quirino Memorial Medical Center)</div>
      <div class="form-title">Hospital Operation and Patient Support Service</div>
      <div style="font-size:11px;color:#333;margin-top:3px;">SPCR Rating Matrix</div>
    </div>
  </div>

  <div class="sig-outer">
    <div class="sig-row">
      <div class="sig-cell" style="flex:2;">
        <div class="sig-label">Prepared By:</div>
        <div style="margin-bottom:14px;"></div>
        <input type="text" id="s_prepared_by" class="sig-name-input" placeholder="Full Name of Employee">
        <div class="sig-sub"><em>Division Chief / Name of Employee</em></div>
        <div style="margin-top:5px;font-size:10px;"><strong>Title:</strong>
          <input type="text" id="s_prepared_by_title" class="sub-inp" placeholder="Position / Division / Service">
        </div>
      </div>
      <div class="sig-cell" style="flex:2;">
        <div class="sig-label">Reviewed By:</div>
        <div style="margin-bottom:14px;"></div>
        <input type="text" id="s_reviewed_by" class="sig-name-input" placeholder="Name of Reviewer">
        <div class="sig-sub"><em>Chairperson, Performance Management Team</em></div>
        <div style="margin-top:5px;font-size:10px;"><strong>Title:</strong>
          <input type="text" id="s_reviewed_by_title" class="sub-inp" placeholder="e.g. MD, FPCP, FPCCP, MAS">
        </div>
      </div>
      <div class="sig-cell" style="flex:2;">
        <div class="sig-label">Approved By:</div>
        <div style="margin-bottom:14px;"></div>
        <input type="text" id="s_approved_by" class="sig-name-input" placeholder="Name of Approver">
        <div class="sig-sub"><em>Medical Center Chief II</em></div>
        <div style="margin-top:5px;font-size:10px;"><strong>Title:</strong>
          <input type="text" id="s_approved_by_title" class="sub-inp" placeholder="e.g. Medical Center Chief II">
        </div>
      </div>
    </div>
  </div>

  <div class="matrix-title-bar">SPCR Rating Matrix</div>
  <table class="matrix-table" id="matrixTable">
    <thead>
      <tr>
        <th class="col-measure">PERFORMANCE<br>MEASURE</th>
        <th class="col-opdef">OPERATIONAL<br>DEFINITION</th>
        <th class="col-quality">QUALITY (Q)</th>
        <th class="col-eff">EFFICIENCY (E)</th>
        <th class="col-time">TIMELINESS (T)</th>
        <th class="col-source">SOURCE OF DATA /<br>MONITORING TOOL</th>
        <th class="col-view" style="background:#dce4f0;font-size:9px;font-weight:700;">SCALE</th>
        <th class="col-del" style="border:none;background:transparent;"></th>
      </tr>
    </thead>
    <tbody id="matrixBody">
      <tr class="section-row">
        <td colspan="7">STRATEGIC FUNCTION</td>
        <td style="border:none;background:var(--sec-bg);"></td>
      </tr>
    </tbody>
  </table>

  <div class="action-bar">
    <button type="button" class="btn-action btn-navy" id="addRowBtn">+ Add Row</button>
    <button type="button" class="btn-action btn-slate" id="addSectionBtn">+ Add Section</button>
    <button type="button" class="btn-action btn-orange" id="clearBtn">Clear Form</button>
    <button type="button" class="btn-action btn-green" id="saveBtn" style="margin-left:auto;">💾 Save Matrix</button>
    <button type="button" class="btn-action btn-navy" onclick="window.print()">🖨 Print</button>
  </div>

  <!-- Previous Submissions -->
  <div class="prev-section">
    <h3>Saved Matrices</h3>
    <div id="prevList"></div>
  </div>

</div><!-- /page-spcr -->


<!-- ═══════════════════════════════════════════════
     PAGE 2 — DPCR
═══════════════════════════════════════════════ -->
<div class="page" id="page-dpcr">

  <div id="d-alertOk"   class="alert-ok"></div>
  <div id="d-alertErr"  class="alert-err"></div>
  <div id="transferBanner" class="transfer-banner"></div>

  <div class="form-ref">DPCR – SPMS Form 2</div>

  <div class="doc-header">
    <div class="logo-circle">QMMC<br>SEAL</div>
    <div class="header-text">
      <div class="org-name">Quirino Memorial Medical Center</div>
      <div class="org-sub">(Pang-ALAALANG Sentrong Medikal Quirino)</div>
      <div class="form-title">Division Performance Commitment and Review (DPCR)</div>
    </div>
  </div>

  <!-- Intro -->
  <div class="intro-block">
    <div class="intro-line">
      I,&nbsp;
      <input type="text" id="d_emp_name" class="intro-field" placeholder="Full Name of Employee" style="min-width:200px;">
      <span class="label-small"><em>Name of Employee</em></span>,&nbsp;
      <input type="text" id="d_emp_title" class="intro-field" placeholder="Position / Division / Service" style="min-width:240px;">
      <span class="label-small"><em>Division / Service</em></span>,
      of the Quirino Memorial Medical Center, commit to deliver and agree to be rated on the attainment
      of the following targets in accordance with the indicated measures for the period
      <input type="text" id="d_period" class="intro-field" placeholder="e.g. January–June 2025" style="min-width:160px;">.
    </div>
  </div>

  <!-- DPCR Sig Row -->
  <div class="d-sig-row">
    <div class="d-sig-cell" style="flex:2;">
      <div style="margin-bottom:18px;"></div>
      <div><span class="d-sig-name" id="d_disp_name">&nbsp;</span></div>
      <div class="d-sig-title"><em>Division Chief / Name of Employee</em></div>
      <div style="margin-top:4px;font-size:10px;"><strong>Date:</strong>
        <input type="date" style="border:none;border-bottom:1px solid #000;background:transparent;font-size:10px;outline:none;">
      </div>
    </div>
    <div class="d-sig-cell" style="flex:2;">
      <div class="sig-label">Approved By:</div>
      <div style="margin-bottom:6px;"></div>
      <input type="text" id="d_approved_by" class="sig-name-input" placeholder="Name of Approver" style="min-width:220px;">
      <div class="d-sig-title"><em>Medical Center Chief II</em></div>
      <div style="margin-top:4px;font-size:10px;"><strong>Date:</strong>
        <input type="date" style="border:none;border-bottom:1px solid #000;background:transparent;font-size:10px;outline:none;">
      </div>
    </div>
    <div class="d-sig-cell" style="flex:1;">
      <div class="rating-key">
        <div style="font-weight:700;margin-bottom:2px;">Rating Scale:</div>
        <div>5 &nbsp;&nbsp;&nbsp;– Outstanding</div>
        <div>4–4.99 – Very Satisfactory</div>
        <div>3–3.99 – Satisfactory</div>
        <div>2–2.99 – Unsatisfactory</div>
        <div>1 &nbsp;&nbsp;&nbsp;– Poor</div>
      </div>
    </div>
  </div>

  <!-- DPCR Table -->
  <table class="dpcr-table" id="dpcrTable" style="margin-top:8px;">
    <thead>
      <tr>
        <th class="col-goal" rowspan="2">STRATEGIC GOALS AND OBJECTIVES</th>
        <th class="col-indicator" rowspan="2">Performance / Success Indicator<br>(Targets + Measure)</th>
        <th class="col-budget" rowspan="2">ALLOTTED BUDGET</th>
        <th class="col-section" rowspan="2">SECTION ACCOUNTABLE</th>
        <th class="col-actual" rowspan="2">ACTUAL ACCOMPLISHMENT</th>
        <th class="col-rate" rowspan="2">Accomplishment Rate<br>(Actual÷Target × 100%)</th>
        <th colspan="4" style="text-align:center;font-size:9px;">RATING</th>
        <th class="col-remarks" rowspan="2">Remarks / Justification</th>
        <th style="border:none;background:transparent;width:26px;" rowspan="2"></th>
      </tr>
      <tr>
        <th class="col-q" style="font-size:9px;">Q<br><span style="font-weight:normal;">(1)</span></th>
        <th class="col-e" style="font-size:9px;">E<br><span style="font-weight:normal;">(2)</span></th>
        <th class="col-t" style="font-size:9px;">T<br><span style="font-weight:normal;">(3)</span></th>
        <th class="col-a" style="font-size:9px;">A<br><span style="font-weight:normal;">(4)</span></th>
      </tr>
    </thead>
    <tbody id="dpcrBody">
      <tr class="section-header">
        <td colspan="12">STRATEGIC FUNCTIONS :</td>
      </tr>
    </tbody>
  </table>

  <div class="action-bar">
    <button type="button" class="btn-action btn-navy" id="dAddRowBtn">+ Add Row</button>
    <button type="button" class="btn-action btn-slate" id="dAddSectionBtn">+ Add Section</button>
    <button type="button" class="btn-action btn-green"  id="dSaveBtn" style="margin-left:auto;">💾 Save DPCR</button>
    <button type="button" class="btn-action btn-navy" onclick="window.print()">🖨 Print</button>
  </div>

</div><!-- /page-dpcr -->


<!-- ── SCALE MODAL ── -->
<div class="modal-overlay" id="scaleModal" onclick="if(event.target===this)closeScaleModal()">
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

<!-- ── VIEW RECORD MODAL ── -->
<div class="view-modal-overlay" id="viewModal" onclick="if(event.target===this)closeViewModal()">
  <div class="view-modal-box">
    <button class="view-modal-close" onclick="closeViewModal()">&times;</button>
    <h4 id="viewModalTitle">Viewing Record</h4>
    <div id="viewModalContent"></div>
  </div>
</div>


<script>
/* ══════════════════════════════════════════
   SHARED STATE
══════════════════════════════════════════ */
const DB = { matrices: [], dpcrRecords: [], nextMatrixId: 1, nextDpcrId: 1 };

const SECTIONS = ['ALL SECTIONS','EFMS','IMISS','PMG / EFMS / PROCUREMENT',
                  'NURSING','MEDICAL','ADMINISTRATIVE','FINANCE','PHARMACY'];

/* ── Tab switching ── */
function switchTab(tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
  event.currentTarget.classList.add('active');
}

/* ── Keyboard ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeScaleModal(); closeViewModal(); }
});

/* ── Modals ── */
function openScaleModal()  { document.getElementById('scaleModal').classList.add('open'); }
function closeScaleModal() { document.getElementById('scaleModal').classList.remove('open'); }
function closeViewModal()  { document.getElementById('viewModal').classList.remove('open'); }

/* ── Alerts ── */
function showAlert(elId, type, msg) {
  const el = document.getElementById(elId);
  el.className = type === 'ok' ? 'alert-ok' : type === 'info' ? 'alert-info' : 'alert-err';
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4500);
}

/* ── Auto-expand textareas ── */
function autoExpand(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }

/* ── HTML escape ── */
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════
   SYNC: SPCR ↔ DPCR shared fields
══════════════════════════════════════════ */
function syncShared() {
  const name     = document.getElementById('s_prepared_by').value;
  const title    = document.getElementById('s_prepared_by_title').value;
  const approved = document.getElementById('s_approved_by').value;
  document.getElementById('d_emp_name').value    = name;
  document.getElementById('d_emp_title').value   = title;
  document.getElementById('d_approved_by').value = approved;
  document.getElementById('d_disp_name').textContent = name || '\u00a0';
}
function syncSharedReverse() {
  const name     = document.getElementById('d_emp_name').value;
  const title    = document.getElementById('d_emp_title').value;
  const approved = document.getElementById('d_approved_by').value;
  document.getElementById('s_prepared_by').value       = name;
  document.getElementById('s_prepared_by_title').value = title;
  document.getElementById('s_approved_by').value       = approved;
  document.getElementById('d_disp_name').textContent   = name || '\u00a0';
}

/* ══════════════════════════════════════════
   SPCR — ROW FACTORY
══════════════════════════════════════════ */
function makeTA(placeholder, minH) {
  const ta = document.createElement('textarea');
  ta.placeholder = placeholder;
  ta.style.minHeight = (minH || 58) + 'px';
  ta.addEventListener('input', () => autoExpand(ta));
  return ta;
}

function makeDimTable(key) {
  const td = document.createElement('td');
  td.dataset.key = key;
  return td;
}

function createMatrixRow(data = {}) {
  const tr = document.createElement('tr');
  tr.dataset.type = 'data';

  // Performance Measure
  const tdPM = document.createElement('td');
  const taPM = makeTA('Performance measure...');
  taPM.dataset.key = 'performance_measure';
  taPM.value = data.performance_measure || '';
  tdPM.appendChild(taPM); tr.appendChild(tdPM);

  // Operational Definition
  const tdOD = document.createElement('td');
  const taOD = makeTA('Operational definition...');
  taOD.dataset.key = 'operational_definition';
  taOD.value = data.operational_definition || '';
  tdOD.appendChild(taOD); tr.appendChild(tdOD);

  // Auto-generated dimension tables
  tr.appendChild(makeDimTable('quality'));
  tr.appendChild(makeDimTable('efficiency'));
  tr.appendChild(makeDimTable('timeliness'));

  // Source / Monitoring
  const tdSrc = document.createElement('td');
  const taSrc = makeTA('Source / Monitoring tool...');
  taSrc.dataset.key = 'source_monitoring';
  taSrc.value = data.source_monitoring || '';
  tdSrc.appendChild(taSrc); tr.appendChild(tdSrc);
  // Scale view btn
  const tdV = document.createElement('td');
  tdV.className = 'col-view';
  tdV.style.cssText = 'text-align:center;vertical-align:middle;padding:4px 2px;';
  const vBtn = document.createElement('button');
  vBtn.type = 'button'; vBtn.className = 'row-view-btn';
  vBtn.textContent = 'view'; vBtn.onclick = openScaleModal;
  tdV.appendChild(vBtn); tr.appendChild(tdV);
  // Delete
  const tdD = document.createElement('td');
  tdD.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
  const dBtn = document.createElement('button');
  dBtn.type = 'button'; dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
  dBtn.onclick = () => tr.remove();
  tdD.appendChild(dBtn); tr.appendChild(tdD);
  return tr;
}

/* ── Section row ── */
function addMatrixSection() {
  const tr = document.createElement('tr');
  tr.className = 'section-row'; tr.dataset.type = 'section';
  const td = document.createElement('td'); td.colSpan = 7;
  const inp = document.createElement('input');
  inp.type = 'text'; inp.placeholder = 'Section name (e.g. CORE FUNCTION)';
  inp.style.cssText = 'width:100%;border:none;background:transparent;font-weight:700;font-size:10px;outline:none;text-align:center;';
  inp.dataset.key = 'section_label';
  td.appendChild(inp);
  const tdD = document.createElement('td');
  tdD.style.cssText = 'border:none;background:var(--sec-bg);text-align:center;vertical-align:middle;width:26px;';
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'remove-btn';
  btn.innerHTML = '&times;'; btn.onclick = () => tr.remove();
  tdD.appendChild(btn); tr.appendChild(td); tr.appendChild(tdD);
  document.getElementById('matrixBody').appendChild(tr); inp.focus();
}

document.getElementById('addSectionBtn').addEventListener('click', addMatrixSection);
document.getElementById('addRowBtn').addEventListener('click', () => {
  const tr = createMatrixRow();
  document.getElementById('matrixBody').appendChild(tr);
  tr.querySelectorAll('textarea').forEach(autoExpand);
  tr.querySelector('textarea').focus();
});

/* ── Read SPCR form ── */
function readMatrixForm() {
  const items = [];
  document.querySelectorAll('#matrixBody tr').forEach(tr => {
    if (tr.classList.contains('section-row')) {
      const inp = tr.querySelector('input[data-key="section_label"]');
      items.push({ type:'section', section_label: inp ? inp.value.trim() : 'SECTION' });
    } else if (tr.dataset.type === 'data') {
      const obj = { type:'data' };
      tr.querySelectorAll('[data-key]').forEach(el => {
        // dimension table cells have no .value — mark them as fixed
        if (el.tagName === 'TD') {
          obj[el.dataset.key] = el.dataset.key; // truthy flag; actual content is the constant
        } else {
          obj[el.dataset.key] = el.value.trim();
        }
      });
      // dimension table cells are blank — mark as present flags only
      obj.quality    = true;
      obj.efficiency = true;
      obj.timeliness = true;
      items.push(obj);
    }
  });
  return {
    prepared_by:        document.getElementById('s_prepared_by').value.trim(),
    prepared_by_title:  document.getElementById('s_prepared_by_title').value.trim(),
    reviewed_by:        document.getElementById('s_reviewed_by').value.trim(),
    reviewed_by_title:  document.getElementById('s_reviewed_by_title').value.trim(),
    approved_by:        document.getElementById('s_approved_by').value.trim(),
    approved_by_title:  document.getElementById('s_approved_by_title').value.trim(),
    saved_at:           new Date().toLocaleString('en-PH',{hour12:true}),
    items
  };
}

/* ── Save Matrix ── */
document.getElementById('saveBtn').addEventListener('click', () => {
  const data = readMatrixForm();
  if (!data.prepared_by) { showAlert('s-alertErr','err','Please fill in the "Prepared By" field.'); return; }
  data.id = DB.nextMatrixId++;
  DB.matrices.unshift(data);
  renderMatrixList();
  showAlert('s-alertOk','ok',`✔ Matrix saved (Record #${data.id}). You can now push it to DPCR.`);
});

/* ── Clear SPCR ── */
document.getElementById('clearBtn').addEventListener('click', () => {
  if (!confirm('Clear all SPCR fields and rows?')) return;
  ['s_prepared_by','s_prepared_by_title','s_reviewed_by','s_reviewed_by_title','s_approved_by','s_approved_by_title']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('matrixBody').innerHTML = `
    <tr class="section-row">
      <td colspan="7">STRATEGIC FUNCTION</td>
      <td style="border:none;background:var(--sec-bg);"></td>
    </tr>`;
  loadMatrixDefaults();
  syncShared();
});

/* ── Render saved matrices list ── */
function renderMatrixList() {
  const c = document.getElementById('prevList');
  if (!DB.matrices.length) { c.innerHTML = '<p class="no-prev">No saved matrices yet.</p>'; return; }
  let html = `<table class="prev-table"><thead><tr>
    <th>#</th><th>Prepared By</th><th>Title</th>
    <th>Reviewed By</th><th>Approved By</th><th>Saved At</th><th>Actions</th>
  </tr></thead><tbody>`;
  DB.matrices.forEach(m => {
    html += `<tr>
      <td>${m.id}</td><td>${esc(m.prepared_by)}</td>
      <td>${esc(m.prepared_by_title||'—')}</td>
      <td>${esc(m.reviewed_by||'—')}</td>
      <td>${esc(m.approved_by||'—')}</td>
      <td>${esc(m.saved_at)}</td>
      <td style="display:flex;gap:4px;align-items:center;">
        <button class="badge-btn badge-view" onclick="viewMatrix(${m.id})">View</button>
        <button class="badge-btn badge-push" onclick="pushToDPCR(${m.id})">→ Push to DPCR</button>
        <button class="badge-btn badge-del"  onclick="deleteMatrix(${m.id})">Delete</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  c.innerHTML = html;
}

/* ── View saved matrix ── */
function viewMatrix(id) {
  const m = DB.matrices.find(x => x.id === id); if (!m) return;
  document.getElementById('viewModalTitle').textContent = `Matrix #${m.id} — ${m.saved_at}`;
  let html = `<div class="view-meta">
    <div><span>Prepared By: </span><strong>${esc(m.prepared_by)}</strong>${m.prepared_by_title?' <em style="color:#555;font-size:10px;">('+esc(m.prepared_by_title)+')</em>':''}</div>
    <div><span>Reviewed By: </span><strong>${esc(m.reviewed_by||'—')}</strong></div>
    <div><span>Approved By: </span><strong>${esc(m.approved_by||'—')}</strong></div>
  </div>
  <table class="view-tbl"><thead><tr>
    <th style="width:15%">PERFORMANCE MEASURE</th>
    <th style="width:20%">OPERATIONAL DEFINITION</th>
    <th style="width:15%">QUALITY (Q)</th>
    <th style="width:15%">EFFICIENCY (E)</th>
    <th style="width:15%">TIMELINESS (T)</th>
    <th style="width:10%">SOURCE OF DATA</th>
  </tr></thead><tbody>`;
  m.items.forEach(item => {
    if (item.type === 'section') {
      html += `<tr class="sec-row"><td colspan="6">${esc(item.section_label||'SECTION')}</td></tr>`;
    } else {
      html += `<tr>
        <td>${esc(item.performance_measure||'')}</td>
        <td>${esc(item.operational_definition||'')}</td>
        <td>${esc(item.quality||'')}</td>
        <td>${esc(item.efficiency||'')}</td>
        <td>${esc(item.timeliness||'')}</td>
        <td>${esc(item.source_monitoring||'')}</td>
      </tr>`;
    }
  });
  html += '</tbody></table>';
  document.getElementById('viewModalContent').innerHTML = html;
  document.getElementById('viewModal').classList.add('open');
}

/* ── Delete matrix ── */
function deleteMatrix(id) {
  if (!confirm(`Delete Matrix #${id}?`)) return;
  const i = DB.matrices.findIndex(x => x.id === id);
  if (i > -1) DB.matrices.splice(i, 1);
  renderMatrixList();
  showAlert('s-alertOk','ok',`Matrix #${id} deleted.`);
}

/* ══════════════════════════════════════════
   PUSH SPCR → DPCR
══════════════════════════════════════════ */
function pushToDPCR(id) {
  const m = DB.matrices.find(x => x.id === id); if (!m) return;

  const body = document.getElementById('dpcrBody');

  m.items.forEach(item => {
    if (item.type === 'section') {
      const tr = document.createElement('tr');
      tr.className = 'section-header';
      const td = document.createElement('td'); td.colSpan = 12;
      td.textContent = item.section_label || 'SECTION';
      tr.appendChild(td); body.appendChild(tr);
    } else {
      // Map SPCR fields → DPCR columns:
      //   performance_measure      → Performance Indicator
      //   operational_definition   → Strategic Goals (goal column)
      //   source_monitoring        → Remarks
      //   quality present          → Q checkbox
      //   efficiency present       → E checkbox
      //   timeliness present       → T checkbox
      const tr = createDpcrRow({
        strategic_goal:        item.operational_definition,
        performance_indicator: item.performance_measure,
        remarks:               item.source_monitoring,
        rating_q:              !!item.quality,
        rating_e:              !!item.efficiency,
        rating_t:              !!item.timeliness,
      });
      body.appendChild(tr);
      tr.querySelectorAll('textarea').forEach(autoExpand);
    }
  });

  // Sync signatories
  document.getElementById('d_emp_name').value    = m.prepared_by;
  document.getElementById('d_emp_title').value   = m.prepared_by_title;
  document.getElementById('d_approved_by').value = m.approved_by;
  document.getElementById('d_disp_name').textContent = m.prepared_by || '\u00a0';

  // Banner on DPCR tab
  const banner = document.getElementById('transferBanner');
  banner.textContent = `✔ Matrix #${id} (${m.prepared_by}) pushed — ${m.items.filter(i=>i.type==='data').length} row(s) added.`;
  banner.style.display = 'block';
  setTimeout(() => { banner.style.display = 'none'; }, 5000);

  // Switch to DPCR immediately
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn')[1].classList.add('active');
  document.getElementById('page-dpcr').classList.add('active');
}

/* ══════════════════════════════════════════
   DPCR — ROW FACTORY
══════════════════════════════════════════ */
function createDpcrRow(data = {}) {
  const tr = document.createElement('tr');

  // Strategic Goal
  const tdGoal = document.createElement('td'); tdGoal.className = 'goal-cell';
  const goalTA = document.createElement('textarea');
  goalTA.placeholder = 'Strategic goal…'; goalTA.value = data.strategic_goal || '';
  goalTA.addEventListener('input', () => autoExpand(goalTA));
  tdGoal.appendChild(goalTA); tr.appendChild(tdGoal);

  // Performance Indicator
  const tdInd = document.createElement('td');
  const indTA = document.createElement('textarea');
  indTA.placeholder = 'Performance/Success indicator…'; indTA.value = data.performance_indicator || '';
  indTA.addEventListener('input', () => autoExpand(indTA));
  tdInd.appendChild(indTA); tr.appendChild(tdInd);

  // Budget
  const tdB = document.createElement('td');
  const bIn = document.createElement('input'); bIn.type = 'text'; bIn.placeholder = '—'; bIn.value = data.allotted_budget || '';
  tdB.appendChild(bIn); tr.appendChild(tdB);

  // Section Accountable
  const tdS = document.createElement('td');
  const sel = document.createElement('select');
  SECTIONS.forEach(s => {
    const opt = document.createElement('option'); opt.value = s; opt.textContent = s;
    if (data.section_accountable === s) opt.selected = true;
    sel.appendChild(opt);
  });
  tdS.appendChild(sel); tr.appendChild(tdS);

  // Actual Accomplishment
  const tdA = document.createElement('td');
  const aTA = document.createElement('textarea');
  aTA.placeholder = '—'; aTA.value = data.actual_accomplishment || '';
  aTA.addEventListener('input', () => autoExpand(aTA));
  tdA.appendChild(aTA); tr.appendChild(tdA);

  // Rate
  const tdR = document.createElement('td'); tdR.style.textAlign = 'center';
  const rIn = document.createElement('input'); rIn.type = 'text'; rIn.placeholder = 'e.g. 85%';
  rIn.value = data.accomplishment_rate || ''; rIn.style.textAlign = 'center';
  tdR.appendChild(rIn); tr.appendChild(tdR);

  // Q E T A — blank, auto-generated
  ['q','e','t','a'].forEach(() => {
    const td = document.createElement('td'); td.className = 'rating-cell';
    tr.appendChild(td);
  });

  // Remarks
  const tdRem = document.createElement('td');
  const remTA = document.createElement('textarea');
  remTA.placeholder = '—'; remTA.value = data.remarks || '';
  remTA.addEventListener('input', () => autoExpand(remTA));
  tdRem.appendChild(remTA); tr.appendChild(tdRem);

  // Delete
  const tdDel = document.createElement('td'); tdDel.style.cssText = 'border:none;text-align:center;vertical-align:middle;width:26px;padding:2px;';
  const dBtn = document.createElement('button'); dBtn.type = 'button'; dBtn.className = 'remove-btn'; dBtn.innerHTML = '&times;';
  dBtn.onclick = () => tr.remove();
  tdDel.appendChild(dBtn); tr.appendChild(tdDel);
  return tr;
}

/* ── DPCR add row/section ── */
document.getElementById('dAddRowBtn').addEventListener('click', () => {
  const tr = createDpcrRow();
  document.getElementById('dpcrBody').appendChild(tr);
  tr.querySelectorAll('textarea').forEach(autoExpand);
  tr.querySelector('textarea').focus();
});
document.getElementById('dAddSectionBtn').addEventListener('click', () => {
  const tr = document.createElement('tr'); tr.className = 'section-header';
  const td = document.createElement('td'); td.colSpan = 12;
  const inp = document.createElement('input'); inp.type = 'text';
  inp.placeholder = 'Section name (e.g. SUPPORT FUNCTIONS)';
  inp.style.cssText = 'width:100%;border:none;background:transparent;font-weight:bold;font-size:10px;outline:none;';
  const del = document.createElement('button'); del.type = 'button'; del.className = 'remove-btn';
  del.innerHTML = '&times;'; del.style.marginLeft = '8px'; del.onclick = () => tr.remove();
  td.appendChild(inp); td.appendChild(del); tr.appendChild(td);
  document.getElementById('dpcrBody').appendChild(tr); inp.focus();
});

/* ── Save DPCR ── */
document.getElementById('dSaveBtn').addEventListener('click', () => {
  const name = document.getElementById('d_emp_name').value.trim();
  if (!name) { showAlert('d-alertErr','err','Please fill in the employee name.'); return; }
  showAlert('d-alertOk','ok',`✔ DPCR for "${name}" saved successfully.`);
});

/* ══════════════════════════════════════════
   DEFAULT SPCR ROWS
══════════════════════════════════════════ */
function loadMatrixDefaults() {
  const defaults = [
    {
      performance_measure: '100% of the PGS Strategic deliverables are achieved within the prescribed timeline.',
      operational_definition: 'This indicator shall cover compliance to PGS Strategic Deliverables and Commitments of every sections which will appear in PGS Deliverables Monitoring tool.',
      source_monitoring: 'PGS Deliverable Monitoring'
    },
    {
      performance_measure: '90% compliance with the Green Viability Assessment (GVA) by June 2025.',
      operational_definition: '',
      source_monitoring: 'GVA Compliance Checklist'
    }
  ];
  defaults.forEach(d => {
    const tr = createMatrixRow(d);
    document.getElementById('matrixBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
  });
}

/* ── DEFAULT DPCR ROWS ── */
function loadDpcrDefaults() {
  const rows = [
    { strategic_goal:'Ensure safe health facilities and quality services', performance_indicator:'100% of the PGS Strategic deliverables are achieved within the prescribed timeline.', section_accountable:'ALL SECTIONS', accomplishment_rate:'NA', rating_e:true, rating_t:true },
    { strategic_goal:'', performance_indicator:'90% compliance with the Green Viability Assessment (GVA) by June 2025.', section_accountable:'EFMS', accomplishment_rate:'NA', rating_e:true, rating_t:true },
    { strategic_goal:'Implementation of Electronic Medical Record (EMR)', performance_indicator:'73% among elected hospital areas are provided with Electronic Medical Record (EMR) system within the prescribed timeline.', section_accountable:'IMISS', accomplishment_rate:'NA', rating_e:true, rating_t:true },
    { strategic_goal:'Upgrading of QMMC infrastructures and facilities', performance_indicator:'50% of the approved Infrastructure and Equipment projects are bidded and prepared for implementation by June 2025.', section_accountable:'PMG / EFMS / PROCUREMENT', rating_q:true, rating_e:true, rating_t:true },
    { strategic_goal:'Ensure compliance with cross-cutting requirements', performance_indicator:'At least one (1) Electronic / Less Paper Transaction is completely developed and implemented within the year.', section_accountable:'IMISS', rating_q:true, rating_e:true, rating_t:true }
  ];
  rows.forEach(d => {
    const tr = createDpcrRow(d);
    document.getElementById('dpcrBody').appendChild(tr);
    tr.querySelectorAll('textarea').forEach(autoExpand);
  });
}

/* ── INIT ── */
loadMatrixDefaults();
loadDpcrDefaults();
renderMatrixList();
</script>
</body>
</html>