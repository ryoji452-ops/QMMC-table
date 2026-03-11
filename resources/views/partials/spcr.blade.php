{{-- resources/views/partials/spcr.blade.php --}}
<div class="page" id="page-spcr">

    <div id="s-alertOk"   class="alert-ok"></div>
    <div id="s-alertErr"  class="alert-err"></div>
    <div id="s-alertInfo" class="alert-info"></div>

    <div class="form-ref">PMT - SPCR | Rev.0 01 March 2024</div>

    {{-- Header --}}
    <div class="doc-header">
        <div><img class="logo" src="img/qmmclogo1.png" alt="QMMC Logo"></div>
        <div class="header-text">
            <div class="org-name">Pang-ALAALANG Sentrong Medikal Quirino</div>
            <div class="org-sub">(Quirino Memorial Medical Center)</div>
            <div class="form-title">Hospital Operation and Patient Support Service</div>
            <div style="font-size:11px;color:#333;margin-top:3px;">
                Strategic Performance Commitment Review (SPCR)
            </div>
        </div>
    </div>

    {{-- Employee Info Block --}}
    <div class="emp-info-block" style="display:flex;flex-wrap:wrap;gap:8px 16px;padding:8px 4px;border-bottom:1px solid #ddd;margin-bottom:6px;">

        <div class="emp-info-field" style="flex:2;min-width:160px;">
            <label style="font-size:9px;font-weight:700;color:#555;display:block;">EMPLOYEE NAME</label>
            <input type="text" id="s_emp_name" class="sig-name-input"
                   placeholder="Full name of employee"
                   style="width:100%;border:none;border-bottom:1px solid #bbb;font-size:11px;outline:none;padding:2px 0;">
            <div id="s_disp_name" style="font-size:8px;color:#888;min-height:10px;">&nbsp;</div>
        </div>

        <div class="emp-info-field" style="flex:2;min-width:160px;">
            <label style="font-size:9px;font-weight:700;color:#555;display:block;">POSITION / TITLE</label>
            <input type="text" id="s_emp_position" class="sub-inp"
                   placeholder="Position / Title"
                   style="width:100%;border:none;border-bottom:1px solid #bbb;font-size:11px;outline:none;padding:2px 0;">
        </div>

        <div class="emp-info-field" style="flex:2;min-width:140px;">
            <label style="font-size:9px;font-weight:700;color:#555;display:block;">DIVISION / UNIT</label>
            <input type="text" id="s_emp_unit" class="sub-inp"
                   placeholder="Division or Unit"
                   style="width:100%;border:none;border-bottom:1px solid #bbb;font-size:11px;outline:none;padding:2px 0;">
        </div>

        <div class="emp-info-field" style="flex:1;min-width:100px;">
            <label style="font-size:9px;font-weight:700;color:#555;display:block;">YEAR</label>
            <select id="s_year"
                    style="width:100%;border:none;border-bottom:1px solid #bbb;font-size:11px;outline:none;background:transparent;padding:2px 0;">
                @for ($y = date('Y') + 1; $y >= 2020; $y--)
                    <option value="{{ $y }}" {{ $y == date('Y') ? 'selected' : '' }}>{{ $y }}</option>
                @endfor
            </select>
        </div>

        <div class="emp-info-field" style="flex:1;min-width:120px;">
            <label style="font-size:9px;font-weight:700;color:#555;display:block;">SEMESTER</label>
            <select id="s_semester"
                    style="width:100%;border:none;border-bottom:1px solid #bbb;font-size:11px;outline:none;background:transparent;padding:2px 0;">
                <option value="1st">1st Semester (Jan–Jun)</option>
                <option value="2nd">2nd Semester (Jul–Dec)</option>
            </select>
        </div>

        <div class="emp-info-field" style="flex:2;min-width:140px;">
            <label style="font-size:9px;font-weight:700;color:#555;display:block;">PERIOD</label>
            <input type="text" id="s_period" class="sub-inp"
                   placeholder="e.g. January – June 2025"
                   style="width:100%;border:none;border-bottom:1px solid #bbb;font-size:11px;outline:none;padding:2px 0;">
        </div>

        <div class="emp-info-field" style="flex:2;min-width:140px;">
            <label style="font-size:9px;font-weight:700;color:#555;display:block;">SUPERVISOR / REVIEWED BY</label>
            <input type="text" id="s_supervisor" class="sub-inp"
                   placeholder="Supervisor name"
                   style="width:100%;border:none;border-bottom:1px solid #bbb;font-size:11px;outline:none;padding:2px 0;">
        </div>

        <div class="emp-info-field" style="flex:2;min-width:140px;">
            <label style="font-size:9px;font-weight:700;color:#555;display:block;">APPROVED BY</label>
            <input type="text" id="s_approved_by" class="sub-inp"
                   placeholder="Approver name"
                   style="width:100%;border:none;border-bottom:1px solid #bbb;font-size:11px;outline:none;padding:2px 0;">
        </div>

    </div>

    {{-- SPCR Table --}}
    <table class="spcr-table" id="spcrTable" style="margin-top:8px;">
        <thead>
            <tr>
                <th class="col-goal">STRATEGIC GOALS AND OBJECTIVES</th>
                <th class="col-indicator">PERFORMANCE / SUCCESS INDICATOR<br><span style="font-weight:normal;font-size:8px;">(Targets + Measures)</span></th>
                <th class="col-target">TARGET</th>
                <th class="col-budget">ALLOTTED BUDGET</th>
                <th class="col-person">PERSON ACCOUNTABLE</th>
                <th class="col-actual">ACTUAL ACCOMPLISHMENT</th>
                <th class="col-rate">ACCOMPLISHMENT RATE</th>
                <th colspan="4" style="text-align:center;font-size:9px;">RATING</th>
                <th class="col-remarks">REMARKS</th>
                <th style="border:none;background:transparent;width:26px;"></th>
            </tr>
            <tr>
                <th colspan="7"></th>
                <th class="col-q" style="font-size:9px;">Q<br><span style="font-weight:normal;">(1)</span></th>
                <th class="col-e" style="font-size:9px;">E<br><span style="font-weight:normal;">(2)</span></th>
                <th class="col-t" style="font-size:9px;">T<br><span style="font-weight:normal;">(3)</span></th>
                <th class="col-a" style="font-size:9px;">A<br><span style="font-weight:normal;">(4)</span></th>
                <th colspan="2"></th>
            </tr>
        </thead>
        <tbody id="spcrBody">
            <tr class="spcr-section-row">
                <td colspan="11">STRATEGIC FUNCTIONS</td>
                <td style="border:none;background:transparent;"></td>
            </tr>
        </tbody>
    </table>

    {{-- Action Bar --}}
    <div class="action-bar">
        <button type="button" class="btn-action btn-navy"  id="sAddRowBtn">+ Add Row</button>
        <button type="button" class="btn-action btn-slate" id="sAddSectionBtn">+ Add Section</button>
        <button type="button" class="btn-action btn-orange" id="sClearBtn">Clear Form</button>
        <button type="button" class="btn-action btn-green" id="sSaveBtn"
                style="margin-left:auto;">💾 Save SPCR</button>
        <button type="button" class="btn-action btn-navy" onclick="window.print()">🖨 Print</button>
    </div>

</div>{{-- /page-spcr --}}