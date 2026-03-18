{{-- resources/views/partials/ipcr.blade.php --}}
<div class="page" id="page-ipcr">

    <div id="i-alertOk"   class="alert-ok"></div>
    <div id="i-alertErr"  class="alert-err"></div>
    <div id="i-alertInfo" class="alert-info"></div>

    <div class="form-ref">IPCR – SPMS Form 4</div>

    {{-- Header --}}
    <div class="doc-header">
        <div><img class="logo" src="img/qmmclogo1.png" alt="QMMC Logo"></div>
        <div class="header-text">
            <div class="org-name">Quirino Memorial Medical Center</div>
            <div class="org-sub">(Pang-ALAALANG Sentrong Medikal Quirino)</div>
            <div class="form-title">Individual Performance Commitment and Review (IPCR)</div>
        </div>
    </div>

    {{-- Intro Block --}}
    <div class="intro-block">
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

    {{-- Signature Row --}}
    <div class="d-sig-row" style="align-items:flex-start;">

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

        {{-- Supervisor --}}
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


    {{-- IPCR Table --}}
    <table class="dpcr-table ipcr-table" id="ipcrTable" style="margin-top:8px;">
        <thead>
            <tr>
                <th class="drag-handle-th no-print" style="width:18px;border:none;background:transparent;padding:0;" rowspan="2"></th>
                <th class="spcr-th-actions no-print" style="width:54px;border:none;background:transparent;padding:0;" rowspan="2"></th>
                <th class="col-goal" rowspan="2">STRATEGIC GOALS AND OBJECTIVES</th>
                <th class="col-indicator" rowspan="2">
                    Performance / Success Indicator<br>(Targets + Measure)
                </th>
                <th class="col-actual" rowspan="2">ACTUAL ACCOMPLISHMENT</th>
                <th class="col-rate" rowspan="2">
                    Accomplishment Rate<br>(Actual÷Target × 100%)
                </th>
                <th colspan="4" style="text-align:center;font-size:9px;">RATING</th>
                <th class="col-remarks" rowspan="2">Remarks / Justification<br>&amp; Unmet Targets</th>
                <th style="border:none;background:transparent;width:26px;" class="no-print" rowspan="2"></th>
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
                <td colspan="10">CORE FUNCTIONS :</td>
            </tr>
        </tbody>
    </table>

    {{-- Average Ratings Summary --}}
    <div class="ipcr-summary" id="ipcrSummary" style="margin-top:14px;">
        <table class="ipcr-rating-summary">
            <thead>
                <tr>
                    <th>Functions</th>
                    <th>Percentage Distribution *</th>
                    <th>Average Rating per Function</th>
                    <th>Final Rating per Function<br>(Average Rating × Percentage Distribution)</th>
                    <th>Final Average Rating</th>
                    <th>Adjectival Rating</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Core</td>
                    <td><input type="text" class="ipcr-pct-input" id="i_pct_core" value="" style="width:60px;text-align:center;"></td>
                    <td><input type="text" class="ipcr-avg-input" id="i_avg_core" placeholder="e.g. 4.67" style="width:70px;text-align:center;"></td>
                    <td id="i_final_core" style="text-align:center;">—</td>
                    <td rowspan="2" id="i_final_avg" style="text-align:center;font-weight:700;vertical-align:middle;">—</td>
                    <td rowspan="2" id="i_adjectival" style="text-align:center;font-weight:700;vertical-align:middle;">—</td>
                </tr>
                <tr>
                    <td>Support</td>
                    <td><input type="text" class="ipcr-pct-input" id="i_pct_support" value="" style="width:60px;text-align:center;"></td>
                    <td><input type="text" class="ipcr-avg-input" id="i_avg_support" placeholder="e.g. 5.00" style="width:70px;text-align:center;"></td>
                    <td id="i_final_support" style="text-align:center;">—</td>
                </tr>
            </tbody>
        </table>
        <div style="font-size:9px;margin-top:4px;color:#555;">
            * Core functions should not be less than 70%.
            &nbsp;|&nbsp; Legend: 1 – Quantity &nbsp; 2 – Efficiency &nbsp; 3 – Timeliness &nbsp; 4 – Average
        </div>
    </div>

    {{-- Discussed With / Bottom Signatures --}}
    <div class="d-sig-row" style="margin-top:14px;border-top:1.5px solid var(--navy);padding-top:8px;">
        <div class="d-sig-cell" style="flex:1.5;">
            <div style="font-size:9px;font-weight:700;margin-bottom:4px;">Discussed With:</div>
            <div style="margin-bottom:18px;"></div>
            <span class="d-sig-name" style="font-size:11px;" id="i_disp_name2">&nbsp;</span>
            <div class="d-sig-title"><em>Employee</em></div>
        </div>
        <div class="d-sig-cell" style="flex:1.5;">
            <div style="font-size:9px;font-weight:700;margin-bottom:4px;">Assessed By:</div>
            <div style="margin-bottom:14px;"></div>
            <span class="d-sig-name" style="font-size:11px;" id="i_disp_supervisor">&nbsp;</span>
            <div class="d-sig-title"><em>Supervisor</em></div>
            <div style="font-size:9px;color:#555;margin-top:2px;font-style:italic;">
                I certify that I discussed my assessment of this employee's performance with the employee.
            </div>
        </div>
        <div class="d-sig-cell" style="flex:2;">
            <div style="font-size:9px;font-weight:700;margin-bottom:4px;">Recommending Approval:</div>
            <div style="margin-bottom:14px;"></div>
            <input type="text" id="i_recommending" class="sig-name-input"
                   placeholder="Division Head / Chief" style="min-width:200px;">
            <div class="d-sig-title"><em>Division Head / Chief</em></div>
        </div>
        <div class="d-sig-cell" style="flex:2;">
            <div style="font-size:9px;font-weight:700;margin-bottom:4px;">Approved Final Rating:</div>
            <div style="margin-bottom:14px;"></div>
            <span class="d-sig-name" style="font-size:11px;" id="i_disp_approved">&nbsp;</span>
            <div class="d-sig-title"><em>Medical Center Chief II</em></div>
            <div style="margin-top:4px;font-size:10px;">
                <strong>Date:</strong>
                <input type="date"
                       style="border:none;border-bottom:1px solid #000;background:transparent;font-size:10px;outline:none;">
            </div>
        </div>
    </div>

    {{-- Action Bar --}}
    <div class="action-bar">
        <button type="button" class="btn-action btn-navy"   id="iAddRowBtn">+ Add Row</button>
        <button type="button" class="btn-action btn-slate"  id="iAddSectionBtn">+ Add Section</button>
        <button type="button" class="btn-action btn-orange" id="iClearBtn">Clear Form</button>
        <button type="button" class="btn-action btn-teal"   id="iLoadSpcrBtn"
                title="Pick a saved SPCR and load its full table into IPCR">
             Load from SPCR
        </button>
        <button type="button" class="btn-action btn-green"  id="iSaveBtn"
                style="margin-left:auto;"> Save IPCR</button>
        <button type="button" class="btn-action btn-navy"   onclick="printIpcr()">🖨 Print IPCR</button>
    </div>

    {{-- ═══════════════════════════════════════════════════════════════
         Rating Matrix — embedded below the IPCR table.
         #rm-panel is moved here by switchTab() on every tab switch.
    ═══════════════════════════════════════════════════════════════ --}}
    <div class="rm-embed-slot" id="rm-slot-ipcr">
        <div class="rm-section-divider no-print">
            <div class="rm-section-divider-label">
                <span class="rm-section-divider-icon">▦</span>
                Rating Matrix
                <span class="rm-section-divider-sub">— source document for IPCR row</span>
            </div>
            <button type="button" class="rm-toggle-btn" id="rm-toggle-ipcr"
                    onclick="rmToggleCollapse('ipcr')" title="Collapse / expand Rating Matrix">
                ▲ Collapse
            </button>
        </div>
        <div class="rm-embed-body" id="rm-body-ipcr">
            {{-- #rm-panel is injected here by switchTab('ipcr') --}}
        </div>
    </div>

</div>{{-- /page-ipcr --}}