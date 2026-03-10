{{-- resources/views/partials/spcr.blade.php --}}
<div class="page" id="page-spcr">

    <div id="s-alertOk"   class="alert-ok"></div>
    <div id="s-alertErr"  class="alert-err"></div>
    <div id="s-alertInfo" class="alert-info"></div>

    <div class="form-ref">DOH – SPMS Form 3</div>

    {{-- Header --}}
    <div class="doc-header">
        <div><img class="logo" src="img/qmmclogo1.png" alt="QMMC Logo"></div>
        <div class="header-text">
            <div class="org-name">Quirino Memorial Medical Center</div>
            <div class="org-sub">(Pang-ALAALANG Sentrong Medikal Quirino)</div>
            <div class="form-title">Section Performance Commitment and Review (SPCR)</div>
        </div>
    </div>

    {{-- Intro Block --}}
    <div class="intro-block">
        <div class="intro-line">
            I,&nbsp;
            <input type="text" id="s_emp_name" class="intro-field"
                   placeholder="Full Name of Employee" style="min-width:200px;">
            <span class="label-small"><em>Name of Employee</em></span>,&nbsp;
            <input type="text" id="s_emp_position" class="intro-field"
                   placeholder="Position / Designation" style="min-width:180px;">
            <span class="label-small"><em>Position</em></span>,&nbsp;
            <input type="text" id="s_emp_unit" class="intro-field"
                   placeholder="Unit / Section / Department" style="min-width:220px;">
            <span class="label-small"><em>Unit / Section / Department</em></span>
            of the Quirino Memorial Medical Center, commit to deliver and agree to be rated
            on the attainment of the following targets in accordance with the indicated
            measures for the period
            <input type="text" id="s_period" class="intro-field"
                   placeholder="e.g. July 1, 2025 to December 31, 2025" style="min-width:200px;">.
        </div>
    </div>

    {{-- Signature Row --}}
    <div class="d-sig-row" style="align-items:flex-start;">

        {{-- Employee --}}
        <div class="d-sig-cell" style="flex:2;">
            <div style="margin-bottom:18px;"></div>
            <div><span class="d-sig-name" id="s_disp_name">&nbsp;</span></div>
            <div class="d-sig-title"><em>Name of Employee</em></div>
            <div style="margin-top:4px;font-size:10px;">
                <strong>Date:</strong>
                <input type="date"
                       style="border:none;border-bottom:1px solid #000;background:transparent;font-size:10px;outline:none;">
            </div>
        </div>

        {{-- Supervisor --}}
        <div class="d-sig-cell" style="flex:2;">
            <div class="sig-label">Name of Supervisor:</div>
            <div style="margin-bottom:6px;"></div>
            <input type="text" id="s_supervisor" class="sig-name-input"
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
            <input type="text" id="s_approved_by" class="sig-name-input"
                   placeholder="Name of Section/Department Head" style="min-width:200px;">
            <div class="d-sig-title"><em>Name of Section/Department Head</em></div>
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

    {{-- SPCR Table --}}
    <table class="spcr-table" id="spcrTable" style="margin-top:8px;">
        <thead>
            <tr>
                <th class="scol-goal"      rowspan="2">STRATEGIC GOALS AND<br>OBJECTIVES</th>
                <th class="scol-indicator" rowspan="2">
                    Performance /Success Indicator<br>(Targets + Measure)
                </th>
                <th class="scol-budget"    rowspan="2">ALLOTTED<br>BUDGET</th>
                <th class="scol-person"    rowspan="2">PERSON<br>ACCOUNTABLE</th>
                <th class="scol-actual"    rowspan="2">ACTUAL ACCOMPLISHMENT</th>
                <th class="scol-rate"      rowspan="2">
                    Accomplishment<br>Rate<br>(Actual÷Target<br>× 100%)
                </th>
                <th colspan="4" class="spcr-rating-group">RATING</th>
                <th class="scol-remarks"   rowspan="2">Remarks/Justification<br>on Unmet Targets</th>
                <th class="scol-del"       rowspan="2"></th>
            </tr>
            <tr>
                <th class="scol-q">Q<br><span class="rating-sub">(1)</span></th>
                <th class="scol-e">E<br><span class="rating-sub">(2)</span></th>
                <th class="scol-t">T<br><span class="rating-sub">(3)</span></th>
                <th class="scol-a">A<br><span class="rating-sub">(4)</span></th>
            </tr>
        </thead>
        <tbody id="spcrBody">
            <tr class="spcr-section-row">
                <td colspan="11">STRATEGIC FUNCTIONS :</td>
                <td style="border:none;background:#f5f5f5;"></td>
            </tr>
        </tbody>
        <tfoot>
            <tr class="spcr-avg-footer">
                <td colspan="10" class="spcr-avg-label">Average Rating (Strategic)</td>
                <td id="s_avg_strategic" class="spcr-avg-val">0.00</td>
                <td style="border:none;background:transparent;"></td>
            </tr>
            <tr class="spcr-avg-footer">
                <td colspan="10" class="spcr-avg-label">Average Rating (Core)</td>
                <td id="s_avg_core" class="spcr-avg-val">0.00</td>
                <td style="border:none;background:transparent;"></td>
            </tr>
        </tfoot>
    </table>

    {{-- Action Bar --}}
    <div class="action-bar">
        <button type="button" class="btn-action btn-navy"   id="sAddRowBtn">+ Add Row</button>
        <button type="button" class="btn-action btn-slate"  id="sAddSectionBtn">+ Add Section</button>
        <button type="button" class="btn-action btn-orange" id="sClearBtn">Clear Form</button>
        <button type="button" class="btn-action btn-green"  id="sSaveBtn"
                style="margin-left:auto;">💾 Save SPCR</button>
        <button type="button" class="btn-action btn-navy"   onclick="window.print()">🖨 Print</button>
    </div>

    {{-- Saved SPCRs --}}
    <div class="prev-section">
        <h3>Saved SPCRs</h3>
        <div id="spcrPrevList"></div>
    </div>

</div>{{-- /page-spcr --}}