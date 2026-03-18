{{-- resources/views/partials/dpcr.blade.php --}}
<div class="page active" id="page-dpcr">

    <div id="d-alertOk"   class="alert-ok"></div>
    <div id="d-alertErr"  class="alert-err"></div>
    <div id="d-alertInfo" class="alert-info"></div>
    <div id="transferBanner" class="transfer-banner"></div>

    <div class="form-ref">DPCR – SPMS Form 2</div>

    {{-- Header --}}
    <div class="doc-header">
        <div><img class="logo" src="img/qmmclogo1.png" alt="QMMC Logo"></div>
        <div class="header-text">
            <div class="org-name">Quirino Memorial Medical Center</div>
            <div class="org-sub">(Pang-ALAALANG Sentrong Medikal Quirino)</div>
            <div class="form-title">Division Performance Commitment and Review (DPCR)</div>
        </div>
    </div>

    {{-- Intro Paragraph --}}
    <div class="intro-block">
        <div class="intro-line">
            I,&nbsp;
            <input type="text" id="d_emp_name" class="intro-field"
                   placeholder="Full Name of Employee" style="min-width:200px;">
            <span class="label-small"><em>Name of Employee</em></span>,&nbsp;
            <input type="text" id="d_emp_title" class="intro-field"
                   placeholder="Position / Division / Service" style="min-width:240px;">
            <span class="label-small"><em>Division / Service</em></span>,
            of the Quirino Memorial Medical Center, commit to deliver and agree to be rated
            on the attainment of the following targets in accordance with the indicated
            measures for the period
            <input type="text" id="d_period" class="intro-field"
                   placeholder="e.g. January–June 2025" style="min-width:160px;">.
        </div>
    </div>

    {{-- DPCR Signature Row --}}
    <div class="d-sig-row">

        {{-- Employee --}}
        <div class="d-sig-cell" style="flex:2;">
            <div style="margin-bottom:18px;"></div>
            <div><span class="d-sig-name" id="d_disp_name">&nbsp;</span></div>
            <div class="d-sig-title"><em>Division Chief / Name of Employee</em></div>
            <div style="margin-top:4px;font-size:10px;">
                <strong>Date:</strong>
                <input type="date"
                       style="border:none;border-bottom:1px solid #000;background:transparent;font-size:10px;outline:none;">
            </div>
        </div>

        {{-- Approved By --}}
        <div class="d-sig-cell" style="flex:2;">
            <div class="sig-label">Approved By:</div>
            <div style="margin-bottom:6px;"></div>
            <input type="text" id="d_approved_by" class="sig-name-input"
                   placeholder="Name of Approver" style="min-width:220px;">
            <div class="d-sig-title"><em>Medical Center Chief II</em></div>
            <div style="margin-top:4px;font-size:10px;">
                <strong>Date:</strong>
                <input type="date"
                       style="border:none;border-bottom:1px solid #000;background:transparent;font-size:10px;outline:none;">
            </div>
        </div>

        {{-- Rating Scale Key --}}
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

    {{-- DPCR Table --}}
    <table class="dpcr-table" id="dpcrTable" style="margin-top:8px;">
        <thead>
            <tr>
                <th class="drag-handle-th no-print" style="width:18px;border:none;background:transparent;padding:0;" rowspan="2"></th>
                <th class="spcr-th-actions no-print" style="width:54px;border:none;background:transparent;padding:0;" rowspan="2"></th>
                <th class="col-goal" rowspan="2">STRATEGIC GOALS AND OBJECTIVES</th>
                <th class="col-indicator" rowspan="2">
                    Performance / Success Indicator
                </th>
                <th class="col-target" rowspan="2">TARGET<br>(%)</th>
                <th class="col-budget"  rowspan="2">ALLOTTED BUDGET</th>
                <th class="col-section" rowspan="2">SECTION ACCOUNTABLE</th>
                <th class="col-actual"  rowspan="2">ACTUAL ACCOMPLISHMENT<br><span style="font-weight:normal;font-size:8px;">(text + actual %)</span></th>
                <th class="col-rate"    rowspan="2">
                    Accomplishment Rate<br><span style="font-weight:normal;font-size:8px;">(Actual% ÷ Target% × 100)</span>
                </th>
                <th colspan="4" style="text-align:center;font-size:9px;">RATING</th>
                <th class="col-remarks" rowspan="2">Remarks / Justification</th>
                <th style="border:none;background:transparent;width:26px;" class="no-print" rowspan="2"></th>
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
                <td style="border:none;background:transparent;width:18px;padding:0;"></td>
                <td colspan="13" style="background:#dce4f0;color:#1a3b6e;font-weight:700;border-left:4px solid #1a3b6e;padding:4px 8px;font-size:10px;letter-spacing:.3px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">STRATEGIC FUNCTIONS :</td>
                <td class="no-print" style="border:none;background:transparent;padding:0;width:0;"></td>
            </tr>
        </tbody>
    </table>

    {{-- Action Bar --}}
    <div class="action-bar">
        <button type="button" class="btn-action btn-navy"  id="dAddRowBtn">+ Add Row</button>
        <button type="button" class="btn-action btn-slate" id="dAddSectionBtn">+ Add Section</button>
        <button type="button" class="btn-action btn-teal"  id="dViewSavedBtn"
                title="Browse and load any saved DPCR record into the form">
            View Saved DPCR
        </button>
        <button type="button" class="btn-action btn-green" id="dSaveBtn"
                style="margin-left:auto;">💾 Save DPCR</button>
        <button type="button" class="btn-action btn-navy"  onclick="printDpcr()">🖨 Print DPCR</button>
    </div>

    {{-- ═══════════════════════════════════════════════════════════════
         Rating Matrix — embedded below the DPCR table.
         #rm-panel is moved here by switchTab() on every tab switch.
    ═══════════════════════════════════════════════════════════════ --}}
    <div class="rm-embed-slot" id="rm-slot-dpcr">
        <div class="rm-section-divider no-print">
            <div class="rm-section-divider-label">
                <span class="rm-section-divider-icon">▦</span>
                Rating Matrix
                <span class="rm-section-divider-sub">— source document for DPCR row</span>
            </div>
            <button type="button" class="rm-toggle-btn" id="rm-toggle-dpcr"
                    onclick="rmToggleCollapse('dpcr')" title="Collapse / expand Rating Matrix">
                ▲ Collapse
            </button>
        </div>
        <div class="rm-embed-body" id="rm-body-dpcr">
            {{-- #rm-panel is injected here by switchTab('dpcr') --}}
        </div>
    </div>

</div>{{-- /page-dpcr --}}