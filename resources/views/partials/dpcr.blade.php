{{-- resources/views/partials/dpcr.blade.php --}}
<div class="page active" id="page-dpcr">

    <div id="d-alertOk"   class="alert-ok"></div>
    <div id="d-alertErr"  class="alert-err"></div>
    <div id="d-alertInfo" class="alert-info"></div>
    <div id="transferBanner" class="transfer-banner"></div>

<div class="form-ref">DOH – SPMS Form 2 &nbsp;|&nbsp; Employee ID: {{ $empid }}</div>



    {{-- ═══════════════════════════════════════════════════════
         DPCR HEADER + INTRO + SIGNATURE — single bordered block
         Uses NO intro-field / intro-line / intro-block classes
         so _upgradeIntroFields() in shared.js cannot touch the
         inputs and force them into block-level textareas.
    ═══════════════════════════════════════════════════════ --}}
    <div style="border:1px solid #000;font-family:Arial,sans-serif;margin-bottom:0;">

        {{-- ── TOP: Logo + Org Name + Form Title ── --}}
        <div style="display:flex;align-items:center;gap:14px;
                    border-bottom:2px solid #000;padding:8px 12px 6px;">
            <div style="flex-shrink:0;">
                <img src="img/qmmclogo1.png" alt="QMMC Logo"
                     style="max-width:80px;max-height:70px;object-fit:contain;display:block;">
            </div>
            <div style="flex:1;text-align:center;">
                <div style="font-size:14px;font-weight:700;text-transform:uppercase;
                            letter-spacing:.6px;color:#1a3b6e;line-height:1.3;">
                    QUIRINO MEMORIAL MEDICAL CENTER
                </div>
                <div style="font-size:10px;color:#555;margin:2px 0 4px;">
                    (Pang-ALAALANG Sentrong Medikal Quirino)
                </div>
                <div style="font-size:13px;font-weight:700;color:#1a3b6e;
                            text-transform:uppercase;letter-spacing:.4px;
                            border:2px solid #1a3b6e;display:inline-block;
                            padding:3px 20px;line-height:1.4;">
                    Division Performance Commitment and Review (DPCR)
                </div>
            </div>
        </div>

        {{-- ── MIDDLE: Inline intro sentence ── --}}
        {{--
            All inputs are plain <input type="text"> with NO class="intro-field"
            so shared.js _upgradeIntroFields() will never replace them with
            block-level textareas. All styling is inline.
        --}}
        <div style="padding:8px 12px 8px;border-bottom:1px solid #000;
                    font-size:11px;font-family:Arial,sans-serif;line-height:2.2;">
            I,&nbsp;<input type="text" id="d_emp_name"
                   placeholder="Full Name of Employee"
                   style="border:none;border-bottom:1.5px solid #000;background:transparent;
                          font-size:11px;font-family:Arial,sans-serif;font-weight:700;
                          outline:none;min-width:260px;vertical-align:baseline;padding:0 2px;">,
            <span style="font-size:9px;color:#444;font-style:italic;">Name of Employee</span>
            , Chief of&nbsp;<input type="text" id="d_emp_title"
                   placeholder="Position / Division / Service"
                   style="border:none;border-bottom:1.5px solid #000;background:transparent;
                          font-size:11px;font-family:Arial,sans-serif;font-weight:700;
                          outline:none;min-width:280px;vertical-align:baseline;padding:0 2px;">,
            <span style="font-size:9px;color:#444;font-style:italic;">Division / Service</span>
            , of the Quirino Memorial Medical Center, commit to deliver and agree to be rated
            on the attainment of the following targets in accordance with the indicated measures
            for the period&nbsp;<input type="text" id="d_period"
                   placeholder="e.g. January–June 2025"
                   style="border:none;border-bottom:1.5px solid #000;background:transparent;
                          font-size:11px;font-family:Arial,sans-serif;font-weight:700;
                          outline:none;min-width:180px;vertical-align:baseline;padding:0 2px;">.
        </div>

        {{-- ── BOTTOM: Approved By | Employee Sig | Rating Scale ── --}}
        <div style="display:flex;align-items:stretch;">

            {{-- LEFT col: Approved By --}}
            <div style="flex:2;padding:8px 14px 10px;border-right:1px solid #000;">
                <div style="font-size:10.5px;font-weight:700;margin-bottom:12px;">
                    Approved By:
                </div>
                <div style="text-align:center;">
                    <input type="text" id="d_approved_by"
                           placeholder="Name of Approver"
                           style="border:none;border-bottom:1.5px solid #000;background:transparent;
                                  font-size:11px;font-family:Arial,sans-serif;font-weight:700;
                                  outline:none;width:88%;text-align:center;padding:0 0 2px;">
                    <div style="font-size:9px;font-style:italic;color:#444;margin-top:2px;">
                        Medical Center Chief II
                    </div>
                </div>
                <div style="margin-top:8px;font-size:10px;">
                    <strong>Date:</strong>&nbsp;
                    <input type="date"
                           style="border:none;border-bottom:1px solid #000;background:transparent;
                                  font-size:10px;outline:none;">
                </div>
            </div>

            {{-- CENTER col: Employee signature --}}
            <div style="flex:2;padding:8px 14px 10px;border-right:1px solid #000;
                        text-align:center;">
                <div style="min-height:28px;"></div>{{-- space for handwritten signature --}}
                <span id="d_disp_name"
                      style="display:inline-block;border-bottom:1.5px solid #000;
                             min-width:240px;font-size:11px;font-weight:700;font-family:Arial,sans-serif;
                             text-align:center;padding:0 4px 2px;">
                    &nbsp;
                </span>
                <div style="font-size:9px;font-style:italic;color:#444;margin-top:2px;">
                    Division Chief / Name of Employee
                </div>
                <div style="margin-top:8px;font-size:10px;text-align:left;">
                    <strong>Date:</strong>&nbsp;
                    <input type="date"
                           style="border:none;border-bottom:1px solid #000;background:transparent;
                                  font-size:10px;outline:none;">
                </div>
            </div>

            {{-- RIGHT col: Rating Scale --}}
            <div style="flex:1;padding:8px 10px;min-width:145px;">
                <div style="font-size:9px;font-family:Arial,sans-serif;line-height:1.7;">
                    <div style="font-weight:700;margin-bottom:3px;">Rating Scale:</div>
                    <div>5 &nbsp;&nbsp;&nbsp;– Outstanding</div>
                    <div>4–4.99 – Very Satisfactory</div>
                    <div>3–3.99 – Satisfactory</div>
                    <div>2–2.99 – Unsatisfactory</div>
                    <div>1 &nbsp;&nbsp;&nbsp;– Poor</div>
                </div>
            </div>

        </div>{{-- /bottom sig row --}}

    </div>{{-- /dpcr header+intro+sig block --}}

    {{-- ─── DPCR MAIN TABLE ─── --}}
    <table class="dpcr-table" id="dpcrTable" style="margin-top:8px;">
        <thead>
            <tr>
                <th class="drag-handle-th no-print"
                    style="width:18px;border:none;background:transparent;padding:0;" rowspan="2"></th>
                <th class="spcr-th-actions no-print"
                    style="width:54px;border:none;background:transparent;padding:0;" rowspan="2"></th>
                <th class="col-goal" rowspan="2">STRATEGIC GOALS AND OBJECTIVES</th>
                <th class="col-indicator" rowspan="2">Performance / Success Indicator</th>
                <th class="col-target" rowspan="2">TARGET<br>(%)</th>
                <th class="col-budget"  rowspan="2">ALLOTTED BUDGET</th>
                <th class="col-section" rowspan="2">SECTION ACCOUNTABLE</th>
                <th class="col-actual"  rowspan="2">
                    ACTUAL ACCOMPLISHMENT<br>
                    <span style="font-weight:normal;font-size:8px;">(text + actual %)</span>
                </th>
                <th class="col-rate"    rowspan="2">
                    Accomplishment Rate<br>
                    <span style="font-weight:normal;font-size:8px;">(Actual% ÷ Target% × 100)</span>
                </th>
                <th colspan="4" style="text-align:center;font-size:9px;">RATING</th>
                <th class="col-remarks" rowspan="2">Remarks / Justification</th>
                <th style="border:none;background:transparent;width:26px;"
                    class="no-print" rowspan="2"></th>
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
                <td class="no-print"
                    style="border:none;background:transparent;padding:0;width:0;"></td>
            </tr>
        </tbody>
    </table>

    {{-- ═══════════════════════════════════════════════════════
         DPCR FUNCTION SUMMARY TABLE
         7 columns: Functions | % Distribution | Avg Rating per Fn |
                    Final Rating per Fn | Final Average Rating |
                    Adjectival Rating | Remarks
    ═══════════════════════════════════════════════════════════ --}}
    <div class="dpcr-summary-wrap" id="dpcrFuncSummary" style="margin-top:14px;">
        <table class="dpcr-func-summary-tbl" id="dpcrFuncSummaryTable">
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
            <tbody id="dpcrFuncSummaryBody">
                {{-- Rows injected by computeDpcrFuncSummary() in dpcr.js --}}
            </tbody>
            <tfoot>
                <tr class="dpcr-summary-footer-row">
                    <td colspan="4" class="dpcr-summary-footer-label">
                        <span id="dpcr_pct_warning"
                              style="display:none;color:#c00;font-weight:700;font-size:9px;"
                              class="no-print"></span>
                    </td>
                    <td id="dpcr_final_avg"  class="dpcr-summary-final-val">—</td>
                    <td id="dpcr_adjectival" class="dpcr-summary-adj-val">—</td>
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

        {{-- ── "Discussed with" signature block ── --}}
        <div class="dpcr-discussed-block">
            <div class="dpcr-discussed-label">Discussed with :</div>
            <div class="dpcr-sig-pair">

                {{-- Left sig: Division Chief --}}
                <div class="dpcr-sig-box">
                    <div class="dpcr-sig-name-area">
                        <input type="text" id="d_discussed_name"
                               placeholder="Name of Rater / Division Chief"
                               style="border:none;border-bottom:1px solid #000;background:transparent;
                                      font-size:10px;font-family:Arial,sans-serif;outline:none;
                                      width:100%;font-weight:700;text-align:center;padding:0;">
                    </div>
                    <div class="dpcr-sig-role">Chief Administrative Officer, HOPSS</div>
                    <div class="dpcr-sig-date">
                        Date:&nbsp;
                        <input type="date"
                               style="border:none;border-bottom:1px solid #999;background:transparent;
                                      font-size:9px;outline:none;">
                    </div>
                </div>

                {{-- Right sig: Medical Center Chief II --}}
                <div class="dpcr-sig-box">
                    <div class="dpcr-sig-name-area">
                        <input type="text" id="d_mcc_name"
                               placeholder="Medical Center Chief II Name"
                               style="border:none;border-bottom:1px solid #000;background:transparent;
                                      font-size:10px;font-family:Arial,sans-serif;outline:none;
                                      width:100%;font-weight:700;text-align:center;padding:0;">
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
            <em>*  Core functions should not be less than 70%</em>
        </div>

    </div>{{-- /.dpcr-summary-wrap / #dpcrFuncSummary --}}

    {{-- ─── ACTION BAR (screen only) ─── --}}
    <div class="action-bar no-print">
        <button type="button" class="btn-action btn-navy"  id="dAddRowBtn">+ Add Row</button>
        <button type="button" class="btn-action btn-slate" id="dAddSectionBtn">+ Add Section</button>
        <button type="button" class="btn-action btn-teal"  id="dViewSavedBtn"
                title="Browse and load any saved DPCR record into the form">
            View Saved DPCR
        </button>
        <button type="button" class="btn-action btn-green" id="dSaveBtn"
                style="margin-left:auto;">💾 Save DPCR</button>

        <div class="print-btn-group" title="Print options">
            <button type="button" class="btn-print-target"
                    onclick="printDpcrTarget()"
                    title="Print target form — budget, actuals and ratings are blank; Q/E/T show ✓ or –">
                🖨 Print Target
            </button>
            <button type="button" class="btn-print-actual"
                    onclick="printDpcrActual()"
                    title="Print full form with all data filled in">
                🖨 Print Actual
            </button>
        </div>
    </div>

    {{-- ─── RATING MATRIX EMBED SLOT ─── --}}
    <div class="rm-embed-slot" id="rm-slot-dpcr">
        <div class="rm-section-divider no-print">
            <div class="rm-section-divider-label">
                <span class="rm-section-divider-icon"></span>
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