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
            <div class="org-name">QUIRINO MEMORIAL MEDICAL CENTER</div>
            <div class="org-sub">(Pang-ALAALANG Sentrong Medikal Quirino)</div>
            <div class="form-title" style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;">
                Section Performance Commitment and Review (SPCR)
            </div>
        </div>
    </div>

    {{-- Intro Paragraph --}}
    <div class="spcr-intro-block">
        <div class="spcr-intro-line">
            I,&nbsp;
            <span class="spcr-intro-group">
                <input type="text" id="s_emp_name" class="spcr-intro-field spcr-name-field"
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

    {{-- Signature Row --}}
    <div class="spcr-sig-row">

        {{-- Employee name display --}}
        <div class="spcr-sig-cell" style="flex:2;">
            <div class="spcr-sig-spacer"></div>
            <div class="spcr-sig-name" id="s_disp_name">&nbsp;</div>
            <div class="spcr-sig-title-line">Name of Employee</div>
            <div class="spcr-sig-date-row">
                <strong>Date:</strong>
                <input type="date" class="spcr-date-inp">
            </div>
        </div>

                {{-- Section / Department Head --}}
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

        {{-- Rating Scale --}}
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

    {{-- Approved By row --}}
    <div class="spcr-approved-row">
        <span class="spcr-approved-label">Approved By:</span>
        <span class="spcr-approved-group">
            <input type="text" id="s_approved_by" class="spcr-approved-inp"
                   placeholder="Name of Supervisor / Approver">
            <span class="spcr-approved-sub">Name of Supervisor</span>
        </span>
    </div>

    {{-- SPCR Table --}}
    <table class="spcr-table" id="spcrTable">
        <thead>
            <tr>
                <th class="spcr-th-goal"  rowspan="2">STRATEGIC GOALS AND<br>OBJECTIVES</th>
                <th class="spcr-th-ind"   rowspan="2">Performance /Success Indicator<br><span style="font-weight:normal;font-size:8px;">(Targets + Measure)</span></th>
                <th class="spcr-th-bud"   rowspan="2">ALLOTTED<br>BUDGET</th>
                <th class="spcr-th-person" rowspan="2">PERSON<br>ACCOUNTABLE</th>
                <th class="spcr-th-actual" rowspan="2">ACTUAL ACCOMPLISHMENT</th>
                <th class="spcr-th-rate"  rowspan="2">Accomplishment<br>Rate(Actual÷Target<br><span style="font-weight:normal;font-size:8px;">x 100%)</span></th>
                <th colspan="4" class="spcr-th-rating-group">RATING</th>
                <th class="spcr-th-remarks" rowspan="2">Remarks/Justifica-ti<br>on of Unmet Targets</th>
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

    {{-- Action Bar --}}
    <div class="action-bar">
        <button type="button" class="btn-action btn-navy"   id="sAddRowBtn">+ Add Row</button>
        <button type="button" class="btn-action btn-slate"  id="sAddSectionBtn">+ Add Section</button>
        <button type="button" class="btn-action btn-orange" id="sClearBtn">Clear Form</button>
        <button type="button" class="btn-action btn-green"  id="sSaveBtn"
                style="margin-left:auto;">💾 Save SPCR</button>
        <button type="button" class="btn-action btn-navy"   onclick="window.print()">🖨 Print</button>
    </div>

</div>{{-- /page-spcr --}}