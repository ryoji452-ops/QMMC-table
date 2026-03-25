{{-- resources/views/partials/spcr.blade.php --}}
<div class="page" id="page-spcr">

    <div id="s-alertOk"   class="alert-ok"></div>
    <div id="s-alertErr"  class="alert-err"></div>
    <div id="s-alertInfo" class="alert-info"></div>

    <div class="form-ref">DOH – SPMS Form 3</div>

    {{-- ─── PRINTABLE HEADER ─── --}}
    <div class="doc-header">
        <div><img class="logo" src="img/qmmclogo1.png" alt="QMMC Logo"></div>
        <div class="header-text">
            <div class="org-name">QUIRINO MEMORIAL MEDICAL CENTER</div>
            <div class="org-sub">(Pang-ALAALANG Sentrong Medikal Quirino)</div>
            <div class="form-title"
                 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;">
                Section Performance Commitment and Review (SPCR)
            </div>
        </div>
    </div>

    {{-- ─── INTRO PARAGRAPH (now with full border) ─── --}}
    <div class="spcr-intro-block">
        <div class="spcr-intro-line">
            I,&nbsp;
            <span class="spcr-intro-group">
                <input type="text" id="s_emp_name"
                       class="spcr-intro-field spcr-name-field"
                       placeholder="Full Name of Employee">
                <span class="spcr-intro-label">Name of Employee</span>
            </span>
            ,&nbsp;
            <span class="spcr-intro-group">
                <input type="text" id="s_emp_position" class="spcr-intro-field"
                       placeholder="Position / Unit / Section / Department">
                <span class="spcr-intro-label">Unit / Section / Department</span>
            </span>
            of the <em>Quirino Memorial Medical Center, commit to deliver
            and agree to be rated on the attainment of the following targets in accordance</em>
            with the indicated measures for the period&nbsp;
            <span class="spcr-intro-group">
                <input type="text" id="s_period" class="spcr-intro-field"
                       placeholder="e.g. July 1, 2025 to December 31, 2025">
            </span>.
        </div>
    </div>

    {{-- ─── SIGNATURE ROW ─── --}}
    <div class="spcr-sig-row">

        <div class="spcr-sig-cell" style="flex:2;">
            <div class="spcr-sig-spacer"></div>
            <div class="spcr-sig-name" id="s_disp_name">&nbsp;</div>
            <div class="spcr-sig-title-line">Name of Employee</div>
            <div class="spcr-sig-date-row">
                <strong>Date:</strong>
                <input type="date" class="spcr-date-inp">
            </div>
        </div>

        <div class="spcr-sig-cell" style="flex:2;">
            <div class="spcr-sig-spacer"></div>
            <input type="text" id="s_supervisor" class="spcr-sig-name"
                   placeholder="Section / Department Head name">
            <div class="spcr-sig-title-line">Name of Section/Department Head</div>
            <div class="spcr-sig-date-row">
                <strong>Date:</strong>
                <input type="date" class="spcr-date-inp">
            </div>
        </div>

        <div class="spcr-sig-cell spcr-rating-key-cell" style="flex:1.2;">
            <div class="spcr-rating-key">
                <div class="srk-row"><span class="srk-num">5</span><span>– Outstanding</span></div>
                <div class="srk-row"><span class="srk-num">4–4.99</span><span>– Very Satisfactory</span></div>
                <div class="srk-row"><span class="srk-num">3–3.99</span><span>– Satisfactory</span></div>
                <div class="srk-row"><span class="srk-num">2–2.99</span><span>– Unsatisfactory</span></div>
                <div class="srk-row"><span class="srk-num">1</span><span>– Poor</span></div>
            </div>
        </div>

    </div>

    {{-- ─── APPROVED BY ROW ─── --}}
    <div class="spcr-approved-row">
        <span class="spcr-approved-label">Approved By:</span>
        <span class="spcr-approved-group">
            <input type="text" id="s_approved_by" class="spcr-approved-inp"
                   placeholder="Name of Supervisor / Approver">
            <span class="spcr-approved-sub">Name of Supervisor</span>
        </span>
    </div>

    {{-- ─── SECTION FILTER BAR (screen only) ─── --}}
    <div class="spcr-filter-bar no-print">
        <label for="spcr-section-filter" class="spcr-filter-label">
            🔍 Filter by Section:
        </label>
        <select id="spcr-section-filter" class="spcr-filter-sel">
            <option value="">— All Sections —</option>
        </select>
        <button type="button" class="btn-action btn-slate spcr-filter-clear"
                onclick="document.getElementById('spcr-section-filter').value='';filterSpcrBySection('');"
                title="Clear filter" style="padding:3px 10px;font-size:10px;">✕ Clear</button>
        <span class="spcr-filter-hint">Sections sourced from DPCR Section Accountable.</span>
    </div>

    {{-- ─── SPCR MAIN TABLE ─── --}}
    <table class="spcr-table" id="spcrTable">
        <thead>
             <tr>
                <th class="drag-handle-th no-print"
                    style="width:18px;border:none;background:transparent;padding:0;" rowspan="2"></th>
                <th class="spcr-th-actions no-print"
                    style="width:54px;border:none;background:transparent;padding:0;" rowspan="2"></th>
                <th class="spcr-th-goal"  rowspan="2">STRATEGIC GOALS AND<br>OBJECTIVES</th>
                <th class="spcr-th-ind"   rowspan="2">
                    Performance / Success Indicator<br>
                    <span style="font-weight:normal;font-size:8px;">(Targets + Measure)</span>
                </th>
                <th class="spcr-th-bud"    rowspan="2">ALLOTTED<br>BUDGET</th>
                <th class="spcr-th-person" rowspan="2">PERSON<br>ACCOUNTABLE</th>
                <th class="spcr-th-actual" rowspan="2">ACTUAL ACCOMPLISHMENT</th>
                <th class="spcr-th-rate"   rowspan="2">
                    Accomplishment Rate<br>
                    <span style="font-weight:normal;font-size:8px;">(Actual ÷ Target × 100%)</span>
                </th>
                <th colspan="4" class="spcr-th-rating-group">RATING</th>
                <th class="spcr-th-remarks" rowspan="2">Remarks / Justification<br>of Unmet Targets</th>
                <th class="spcr-th-del no-print" rowspan="2"></th>
             </tr>
             <tr>
                <th class="spcr-th-q">Q<br><span style="font-weight:normal;font-size:8px;">(1)</span></th>
                <th class="spcr-th-e">E<br><span style="font-weight:normal;font-size:8px;">(2)</span></th>
                <th class="spcr-th-t">T<br><span style="font-weight:normal;font-size:8px;">(3)</span></th>
                <th class="spcr-th-a">A<br><span style="font-weight:normal;font-size:8px;">(4)</span></th>
             </tr>
        </thead>
        <tbody id="spcrBody">
            {{-- Rows injected by JS --}}
        </tbody>
    </table>

    {{-- ═══════════════════════════════════════════════════════
         SPCR FUNCTION SUMMARY TABLE
         7 columns: Functions | % Distribution | Avg Rating per Fn |
                    Final Rating per Fn | Final Average Rating |
                    Adjectival Rating | Remarks
    ═══════════════════════════════════════════════════════════ --}}
    <div class="dpcr-summary-wrap" id="spcrFuncSummary" style="margin-top:14px;">
        <table class="dpcr-func-summary-tbl" id="spcrFuncSummaryTable">
            <colgroup>
                <col style="width:12%;">
                <col style="width:13%;">
                <col style="width:14%;">
                <col style="width:18%;">
                <col style="width:10%;">
                <col style="width:10%;">
                <col style="width:23%;">
            </colgroup>
            <thead>
                 <tr>
                    <th rowspan="2">Functions</th>
                    <th rowspan="2">Percentage<br>Distribution *</th>
                    <th rowspan="2">Average Rating<br>per Function</th>
                    <th rowspan="2">
                        Final Rating per Functions<br>
                        <span style="font-weight:normal;font-size:8px;">
                            (Average Rating × Percentage Distribution)
                        </span>
                    </th>
                    <th colspan="2" style="text-align:center;">Final Average Rating</th>
                    <th rowspan="2">Remarks :</th>
                 </tr>
                 <tr>
                    <th style="font-size:9px;font-weight:600;">Final Average<br>Rating</th>
                    <th style="font-size:9px;font-weight:600;">Adjectival<br>Rating</th>
                 </tr>
            </thead>
            <tbody id="spcrFuncSummaryBody">
                {{-- Rows injected by computeSpcrFuncSummary() in spcr.js --}}
            </tbody>
            <tfoot>
                <tr class="dpcr-summary-footer-row">
                    <td colspan="4" class="dpcr-summary-footer-label">
                        <span id="spcr_pct_warning"
                              style="display:none;color:#c00;font-weight:700;font-size:9px;"
                              class="no-print"></span>
                     </td>
                    <td id="spcr_final_avg"  class="dpcr-summary-final-val">—</td>
                    <td id="spcr_adjectival" class="dpcr-summary-adj-val">—</td>
                    <td></td>
                </tr>
                <tr class="dpcr-approved-rating-row">
                    <td colspan="4" class="dpcr-approved-label">Approved Final Rating :</td>
                    <td colspan="2" class="dpcr-approved-val">
                        <input type="text" placeholder="—"
                               style="width:100%;border:none;background:transparent;font-size:10px;
                                      font-family:Arial,sans-serif;outline:none;text-align:center;font-weight:700;">
                    </td>
                    <td>
                        <span style="font-size:9px;">Date:&nbsp;</span>
                        <input type="date"
                               style="border:none;border-bottom:1px solid #999;background:transparent;
                                      font-size:9px;outline:none;">
                    </td>
                </tr>
            </tfoot>
        </table>

        {{-- ── "Discussed with" three-signature block ── --}}
        <div class="dpcr-discussed-block">
            <div class="dpcr-sig-pair">

                {{-- sig 1: Discussed with (Employee) --}}
                <div class="dpcr-sig-box">
                    <div style="font-size:9px;font-weight:700;margin-bottom:4px;">Discussed with:</div>
                    <div class="dpcr-sig-name-area">
                        <input type="text" id="s_discussed_name"
                               placeholder="Name of Rater / Section Head"
                               style="border:none;border-bottom:1px solid #000;background:transparent;
                                      font-size:10px;font-family:Arial,sans-serif;outline:none;
                                      width:100%;font-weight:700;text-align:center;">
                    </div>
                    <div class="dpcr-sig-role">Employee</div>
                    <div class="dpcr-sig-date">
                        Date:&nbsp;
                        <input type="date"
                               style="border:none;border-bottom:1px solid #999;background:transparent;
                                      font-size:9px;outline:none;">
                    </div>
                </div>

                {{-- sig 2: Assessed by (Division Head) --}}
                <div class="dpcr-sig-box">
                    <div style="font-size:9px;font-weight:700;margin-bottom:4px;">Assessed by:</div>
                    <div class="dpcr-sig-name-area">
                        <input type="text" id="s_assessed_by"
                               placeholder="Division Head / Chief"
                               style="border:none;border-bottom:1px solid #000;background:transparent;
                                      font-size:10px;font-family:Arial,sans-serif;outline:none;
                                      width:100%;font-weight:700;text-align:center;">
                    </div>
                    <div class="dpcr-sig-role">Division Head / Chief</div>
                    <div class="dpcr-sig-date">
                        Date:&nbsp;
                        <input type="date"
                               style="border:none;border-bottom:1px solid #999;background:transparent;
                                      font-size:9px;outline:none;">
                    </div>
                </div>

                {{-- sig 3: Approved Final Rating (MCC) --}}
                <div class="dpcr-sig-box">
                    <div style="font-size:9px;font-weight:700;margin-bottom:4px;">Approved Final Rating:</div>
                    <div class="dpcr-sig-name-area">
                        <input type="text" id="s_mcc_name"
                               placeholder="Medical Center Chief II Name"
                               style="border:none;border-bottom:1px solid #000;background:transparent;
                                      font-size:10px;font-family:Arial,sans-serif;outline:none;
                                      width:100%;font-weight:700;text-align:center;">
                    </div>
                    <div class="dpcr-sig-role">Medical Center Chief II</div>
                    <div class="dpcr-sig-date">
                        Date:&nbsp;
                        <input type="date"
                               style="border:none;border-bottom:1px solid #999;background:transparent;
                                      font-size:9px;outline:none;">
                    </div>
                </div>

            </div>{{-- /.dpcr-sig-pair --}}
        </div>{{-- /.dpcr-discussed-block --}}

        {{-- Legend --}}
        <div class="dpcr-summary-legend">
            Legend: &nbsp; 1 – Quality &nbsp;&nbsp; 2 – Efficiency &nbsp;&nbsp;
            3 – Timeliness &nbsp;&nbsp; 4 – Average
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <em>* Core functions should not be less than 70%</em>
        </div>

    </div>{{-- /.dpcr-summary-wrap / #spcrFuncSummary --}}

    {{-- ─── ACTION BAR (screen only) ─── --}}
    <div class="action-bar no-print">
        <button type="button" class="btn-action btn-navy"   id="sAddRowBtn">+ Add Row</button>
        <button type="button" class="btn-action btn-slate"  id="sAddSectionBtn">+ Add Section</button>
        <button type="button" class="btn-action btn-orange" id="sClearBtn">Clear Form</button>
        <button type="button" class="btn-action btn-teal"   id="sLoadDpcrBtn"
                title="Pick a saved DPCR and load its full table into SPCR">
            Load from DPCR
        </button>
        <button type="button" class="btn-action btn-green"  id="sSaveBtn"
                style="margin-left:auto;">💾 Save SPCR</button>

        <div class="print-btn-group" title="Print options">
            <button type="button" class="btn-print-target"
                    onclick="printSpcrTarget()"
                    title="Print target form — budget, actuals and ratings are blank; Q/E/T show ✓ or –">
                🖨 Print Target
            </button>
            <button type="button" class="btn-print-actual"
                    onclick="printSpcrActual()"
                    title="Print full form with all data filled in">
                🖨 Print Actual
            </button>
        </div>
    </div>

    {{-- ─── RATING MATRIX EMBED SLOT ─── --}}
    <div class="rm-embed-slot" id="rm-slot-spcr">
        <div class="rm-section-divider no-print">
            <div class="rm-section-divider-label">
                <span class="rm-section-divider-icon">▦</span>
                Rating Matrix
                <span class="rm-section-divider-sub">— source document for SPCR row</span>
            </div>
            <button type="button" class="rm-toggle-btn" id="rm-toggle-spcr"
                    onclick="rmToggleCollapse('spcr')"
                    title="Collapse / expand Rating Matrix">
                ▲ Collapse
            </button>
        </div>
        <div class="rm-embed-body" id="rm-body-spcr">
            {{-- #rm-panel is injected here by switchTab('spcr') --}}
        </div>
    </div>

</div>{{-- /page-spcr --}}