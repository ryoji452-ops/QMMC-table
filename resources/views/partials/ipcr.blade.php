{{-- resources/views/partials/ipcr.blade.php --}}
<div class="page" id="page-ipcr">

    <div id="i-alertOk"   class="alert-ok"></div>
    <div id="i-alertErr"  class="alert-err"></div>
    <div id="i-alertInfo" class="alert-info"></div>

    <div class="form-ref">DOH – SPMS Form 4</div>

    {{-- ─── INTRO BLOCK ─── --}}
    <div class="intro-block">
            <div class="doc-header">
        <div><img class="logo" src="img/qmmclogo1.png" alt="QMMC Logo"></div>
        <div class="header-text">
            <div class="org-name">Quirino Memorial Medical Center</div>
            <div class="org-sub">(Pang-ALAALANG Sentrong Medikal Quirino)</div>
            <div class="form-title">Individual Performance Commitment and Review (IPCR)</div>
        </div>
    </div>
        <div class="intro-line">
            I,&nbsp;
            <input type="text" id="i_emp_name" class="intro-field"
                   placeholder="Full Name of Employee" style="min-width:220px;">
            <span class="label-small"><em>Name of Employee</em></span>,&nbsp;
            <input type="text" id="i_emp_position" class="intro-field"
                   placeholder="Position / Designation" style="min-width:200px;">
            <span class="label-small"><em>Position</em></span>,&nbsp;
            <input type="text" id="i_emp_unit" class="intro-field"
                   placeholder="Unit / Section / Division" style="min-width:220px;">
            <span class="label-small"><em>Unit / Section / Division</em></span>
            of the Quirino Memorial Medical Center, commit to deliver and agree to be rated
            on the attainment of the following targets in accordance with the indicated
            measures for the period
            <input type="text" id="i_period" class="intro-field"
                   placeholder="e.g. January 1, 2025 to June 30, 2025" style="min-width:200px;">.
        </div>
    </div>

    {{-- ─── SIGNATURE ROW ─── --}}
    <div class="d-sig-row">

        {{-- Employee --}}
        <div class="d-sig-cell" style="flex:2;">
            <div style="margin-bottom:18px;"></div>
            <div><span class="d-sig-name" id="i_disp_name">&nbsp;</span></div>
            <div class="d-sig-title"><em>Name of Employee</em></div>
            <div style="margin-top:4px;font-size:10px;">
                <strong>Date:</strong>
                <input type="date"
                       style="border:none;border-bottom:1px solid #000;background:transparent;font-size:10px;outline:none;">
            </div>
        </div>

        {{-- Immediate Supervisor --}}
        <div class="d-sig-cell" style="flex:2;">
            <div class="sig-label">Immediate Supervisor:</div>
            <div style="margin-bottom:6px;"></div>
            <input type="text" id="i_supervisor" class="sig-name-input"
                   placeholder="Name of Supervisor" style="min-width:200px;">
            <div class="d-sig-title"><em>Name of Supervisor</em></div>
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
            <input type="text" id="i_approved_by" class="sig-name-input"
                   placeholder="Name of Approver" style="min-width:200px;">
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

    {{-- ─── IPCR MAIN TABLE ─── --}}
    <table class="dpcr-table ipcr-table" id="ipcrTable" style="margin-top:8px;">
        <thead>
            <tr>
                <th class="drag-handle-th no-print"
                    style="width:18px;border:none;background:transparent;padding:0;" rowspan="2"></th>
                <th class="spcr-th-actions no-print"
                    style="width:54px;border:none;background:transparent;padding:0;" rowspan="2"></th>
                <th class="col-goal" rowspan="2">STRATEGIC GOALS AND OBJECTIVES</th>
                <th class="col-indicator" rowspan="2">
                    Performance / Success Indicator<br>(Targets + Measure)
                </th>
                <th class="col-actual" rowspan="2">ACTUAL ACCOMPLISHMENT</th>
                <th class="col-rate"   rowspan="2">
                    Accomplishment Rate<br>(Actual ÷ Target × 100%)
                </th>
                <th colspan="4" style="text-align:center;font-size:9px;">RATING</th>
                <th class="col-remarks" rowspan="2">Remarks / Justification<br>&amp; Unmet Targets</th>
                {{--
                    FIX: Delete column uses class="no-print" only.
                    Do NOT use th:last-child / td:last-child in CSS — that
                    was eating the A(4) rating column. The .no-print rule
                    in print_modes.css hides this header correctly.
                --}}
                <th class="no-print" style="border:none;background:transparent;width:26px;" rowspan="2"></th>
            </tr>
            <tr>
                <th class="col-q" style="font-size:9px;">Q<br><span style="font-weight:normal;">(1)</span></th>
                <th class="col-e" style="font-size:9px;">E<br><span style="font-weight:normal;">(2)</span></th>
                <th class="col-t" style="font-size:9px;">T<br><span style="font-weight:normal;">(3)</span></th>
                <th class="col-a" style="font-size:9px;">A<br><span style="font-weight:normal;">(4)</span></th>
            </tr>
        </thead>
        <tbody id="ipcrBody">
            <tr class="section-header">
                <td style="border:none;background:transparent;width:18px;padding:0;"></td>
                <td style="border:none;background:transparent;padding:0;width:54px;min-width:54px;"
                    class="no-print"></td>
                <td class="no-print"
                    style="border:none;background:transparent;padding:0;width:0;"></td>
            </tr>
        </tbody>
    </table>

    {{-- ═══════════════════════════════════════════════════════
         IPCR FUNCTION SUMMARY TABLE
         7 columns: Functions | % Distribution | Avg Rating per Fn |
                    Final Rating per Fn | Final Avg Rating |
                    Adjectival Rating | Remarks
    ═══════════════════════════════════════════════════════════ --}}
    <div class="dpcr-summary-wrap" id="ipcrFuncSummary" style="margin-top:14px;">
        <table class="dpcr-func-summary-tbl" id="ipcrFuncSummaryTable">
            {{-- Inline colgroup widths are overridden in @media print by print_modes.css
                 to ensure all 7 columns (incl. Adjectival Rating) fit on A4 landscape. --}}
            <colgroup>
                <col style="width:12%;">
                <col style="width:13%;">
                <col style="width:15%;">
                <col style="width:20%;">
                <col style="width:10%;">
                <col style="width:10%;">
                <col style="width:20%;">
            </colgroup>
            <thead>
                <tr>
                    <th>Functions</th>
                    <th>Percentage<br>Distribution *</th>
                    <th>Average Rating<br>per Function</th>
                    <th>Final Rating per Functions<br>
                        <span style="font-weight:normal;font-size:8px;">
                            (Average Rating × Percentage Distribution)
                        </span>
                    </th>
                    <th style="font-size:9px;font-weight:600;">Final Average<br>Rating</th>
                    <th style="font-size:9px;font-weight:600;">Adjectival<br>Rating</th>
                    <th>Remarks :</th>
                </tr>
            </thead>
            <tbody id="ipcrFuncSummaryBody">
                {{-- Rows injected by computeIpcrSummary() in ipcr.js --}}
            </tbody>
            <tfoot>
                <tr class="dpcr-summary-footer-row">
                    <td colspan="4" class="dpcr-summary-footer-label">
                        <span id="ipcr_pct_warning"
                              style="display:none;color:#c00;font-weight:700;font-size:9px;"
                              class="no-print"></span>
                    </td>
                    <td id="i_final_avg"    class="dpcr-summary-final-val">—</td>
                    <td id="i_adjectival"   class="dpcr-summary-adj-val">—</td>
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

        {{-- ── "Discussed with" four-signature block ── --}}
        <div class="dpcr-discussed-block">
            <div class="ipcr-sig-quad">

                {{--
                    sig 1: Discussed with (Employee)
                    FIX: id="i_disp_name2" added here as a <span> that mirrors
                    the employee name. ipcr.js references this id in:
                      • hydrateIpcrForm()
                      • iClearBtn handler
                      • i_emp_name input listener
                    Without this element the JS threw silent errors that
                    prevented computeIpcrSummary() from completing.
                --}}
                <div class="dpcr-sig-box">
                    <div style="font-size:9px;font-weight:700;margin-bottom:6px;">Discussed with:</div>
                    <div class="dpcr-sig-name-area">
                        <span class="d-sig-name" id="i_disp_name2"
                              style="border-bottom:1px solid #000;width:100%;display:block;
                                     text-align:center;padding-bottom:1px;">&nbsp;</span>
                    </div>
                    <div class="dpcr-sig-role">Employee</div>
                    <div class="dpcr-sig-date">
                        Date:&nbsp;
                        <input type="date"
                               style="border:none;border-bottom:1px solid #999;background:transparent;
                                      font-size:9px;outline:none;">
                    </div>
                </div>

                {{-- sig 2: Assessed By (Supervisor) --}}
                <div class="dpcr-sig-box">
                    <div style="font-size:9px;font-weight:700;margin-bottom:6px;">Assessed By:</div>
                    <div class="dpcr-sig-name-area">
                        <span class="d-sig-name" id="i_disp_supervisor"
                              style="border-bottom:1px solid #000;width:100%;display:block;
                                     text-align:center;padding-bottom:1px;">&nbsp;</span>
                    </div>
                    <div class="dpcr-sig-role">Supervisor</div>
                    <div class="dpcr-sig-date">
                        Date:&nbsp;
                        <input type="date"
                               style="border:none;border-bottom:1px solid #999;background:transparent;
                                      font-size:9px;outline:none;">
                    </div>
                </div>

                {{-- sig 3: Recommending Approval --}}
                <div class="dpcr-sig-box">
                    <div style="font-size:9px;font-weight:700;margin-bottom:6px;">Recommending Approval:</div>
                    <div class="dpcr-sig-name-area">
                        <input type="text" id="i_recommending"
                               placeholder="Division Head / Chief"
                               style="border:none;border-bottom:1px solid #000;background:transparent;
                                      font-size:10px;font-family:Arial,sans-serif;outline:none;
                                      width:100%;font-weight:700;text-align:center;padding:0;">
                    </div>
                    <div class="dpcr-sig-role">Division Head / Chief</div>
                    <div class="dpcr-sig-date">
                        Date:&nbsp;
                        <input type="date"
                               style="border:none;border-bottom:1px solid #999;background:transparent;
                                      font-size:9px;outline:none;">
                    </div>
                </div>

                {{-- sig 4: Approved Final Rating --}}
                <div class="dpcr-sig-box">
                    <div style="font-size:9px;font-weight:700;margin-bottom:6px;">Approved Final Rating:</div>
                    <div class="dpcr-sig-name-area">
                        <span class="d-sig-name" id="i_disp_approved"
                              style="border-bottom:1px solid #000;width:100%;display:block;
                                     text-align:center;padding-bottom:1px;">&nbsp;</span>
                    </div>
                    <div class="dpcr-sig-role">Medical Center Chief II</div>
                    <div class="dpcr-sig-date">
                        Date:&nbsp;
                        <input type="date"
                               style="border:none;border-bottom:1px solid #999;background:transparent;
                                      font-size:9px;outline:none;">
                    </div>
                </div>

            </div>{{-- /.ipcr-sig-quad --}}
        </div>{{-- /.dpcr-discussed-block --}}

        {{-- Legend --}}
        <div class="dpcr-summary-legend">
            Legend: &nbsp; 1 – Quality &nbsp;&nbsp; 2 – Efficiency &nbsp;&nbsp;
            3 – Timeliness &nbsp;&nbsp; 4 – Average
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <em>* Core functions should not be less than 70%</em>
        </div>

    </div>{{-- /.dpcr-summary-wrap / #ipcrFuncSummary --}}

    {{-- ─── ACTION BAR (screen only) ─── --}}
    <div class="action-bar no-print">
        <button type="button" class="btn-action btn-navy"   id="iAddRowBtn">+ Add Row</button>
        <button type="button" class="btn-action btn-slate"  id="iAddSectionBtn">+ Add Section</button>
        <button type="button" class="btn-action btn-orange" id="iClearBtn">Clear Form</button>
        <button type="button" class="btn-action btn-teal"   id="iLoadSpcrBtn"
                title="Pick a saved SPCR and load its full table into IPCR">
            Load from SPCR
        </button>
        <button type="button" class="btn-action btn-green"  id="iSaveBtn"
                style="margin-left:auto;">💾 Save IPCR</button>

        <div class="print-btn-group" title="Print options">
            <button type="button" class="btn-print-target"
                    onclick="printIpcrTarget()"
                    title="Print target form — actuals and ratings are blank; Q/E/T show ✓ or –">
                🖨 Print Target
            </button>
            <button type="button" class="btn-print-actual"
                    onclick="printIpcrActual()"
                    title="Print full form with all data filled in">
                🖨 Print Actual
            </button>
        </div>
    </div>

    {{-- ─── RATING MATRIX EMBED SLOT ─── --}}
    <div class="rm-embed-slot" id="rm-slot-ipcr">
        <div class="rm-section-divider no-print">
            <div class="rm-section-divider-label">
                <span class="rm-section-divider-icon">▦</span>
                Rating Matrix
                <span class="rm-section-divider-sub">— source document for IPCR row</span>
            </div>
            <button type="button" class="rm-toggle-btn" id="rm-toggle-ipcr"
                    onclick="rmToggleCollapse('ipcr')"
                    title="Collapse / expand Rating Matrix">
                ▲ Collapse
            </button>
        </div>
        <div class="rm-embed-body" id="rm-body-ipcr">
            {{-- #rm-panel is injected here by switchTab('ipcr') --}}
        </div>
    </div>

</div>{{-- /page-ipcr --}}