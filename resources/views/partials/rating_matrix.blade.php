{{-- resources/views/partials/rating_matrix.blade.php
     ─────────────────────────────────────────────────
     The Rating Matrix panel lives once in the DOM as #rm-panel.
     shared.js::switchTab() physically moves it into the .rm-embed-slot
     of whichever DPCR / SPCR / IPCR tab becomes active, so all
     element IDs and JS event listeners remain intact.
--}}

<div id="rm-panel">

    <div id="rm-alertOk"   class="alert-ok"></div>
    <div id="rm-alertErr"  class="alert-err"></div>
    <div id="rm-alertInfo" class="alert-info"></div>

    <div class="form-ref">PMT – DPCR Rating Matrix Rev 0 01 March 2024</div>

    {{-- Header --}}
    <div class="doc-header">
        <div><img class="logo" src="img/qmmclogo1.png" alt="QMMC Logo"></div>
        <div class="header-text">
            <div class="org-name">PANG-ALAALANG SENTRONG MEDIKAL QUIRINO</div>
            <div class="org-sub">(Quirino Memorial Medical Center)</div>
            <div class="form-title">HOSPITAL OPERATION AND PATIENT SUPPORT SERVICE</div>
            <div style="font-size:12px;font-weight:700;color:#111;margin-top:3px;letter-spacing:.5px;">
                RATING MATRIX
            </div>
        </div>
    </div>

    {{-- Signature Block --}}
    <div class="rm-sig-block">
        <div class="rm-sig-col">
            <div class="rm-sig-label">Prepared By:</div>
            <div class="rm-sig-name-wrap">
                <input type="text" id="rm_prepared_by" class="rm-sig-input" placeholder="Full name">
            </div>
            <div class="rm-sig-title-wrap">
                <input type="text" id="rm_prepared_by_title" class="rm-sig-sub" placeholder="Position / Title">
            </div>
            <div class="rm-sig-date-row">
                <strong>Date:</strong>
                <input type="date" id="rm_prepared_date" class="rm-date-inp">
            </div>
        </div>
        <div class="rm-sig-col">
            <div class="rm-sig-label">Reviewed By:</div>
            <div class="rm-sig-name-wrap">
                <input type="text" id="rm_reviewed_by" class="rm-sig-input" placeholder="Full name">
            </div>
            <div class="rm-sig-title-wrap">
                <input type="text" id="rm_reviewed_by_title" class="rm-sig-sub" placeholder="Chairperson / Position">
            </div>
            <div class="rm-sig-date-row">
                <strong>Date:</strong>
                <input type="date" id="rm_reviewed_date" class="rm-date-inp">
            </div>
        </div>
        <div class="rm-sig-col">
            <div class="rm-sig-label">Approved By:</div>
            <div class="rm-sig-name-wrap">
                <input type="text" id="rm_approved_by" class="rm-sig-input" placeholder="Full name">
            </div>
            <div class="rm-sig-title-wrap">
                <input type="text" id="rm_approved_by_title" class="rm-sig-sub" placeholder="Medical Center Chief II">
            </div>
            <div class="rm-sig-date-row">
                <strong>Date:</strong>
                <input type="date" id="rm_approved_date" class="rm-date-inp">
            </div>
        </div>
    </div>

    {{-- Rating Matrix Table --}}
    <table class="rm-table" id="rmTable">
        <thead>
            <tr>
                <th class="rm-th-pm">PERFORMANCE MEASURE</th>
                <th class="rm-th-od">OPERATIONAL DEFINITION</th>
                <th class="rm-th-q">QUALITY<br><span class="rm-th-sub">(Q)</span></th>
                <th class="rm-th-e">EFFICIENCY<br><span class="rm-th-sub">(E)</span></th>
                <th class="rm-th-t">TIMELINESS<br><span class="rm-th-sub">(T)</span></th>
                <th class="rm-th-src">SOURCE OF DATA /<br>MONITORING TOOL</th>
                <th class="rm-th-push no-print">PUSH TO</th>
                <th class="rm-th-del  no-print"></th>
            </tr>
        </thead>
        <tbody id="rmBody">
            {{-- Rows injected by rating_matrix.js --}}
        </tbody>
    </table>

    {{-- Action Bar (screen only) --}}
    <div class="action-bar no-print" style="margin-top:14px;">
        <button type="button" class="btn-action btn-navy"   id="rmAddRowBtn">+ Add Row</button>
        <button type="button" class="btn-action btn-slate"  id="rmAddSectionBtn">+ Add Section</button>
        <button type="button" class="btn-action btn-orange" id="rmClearBtn">Clear Matrix</button>
        <button type="button" class="btn-action btn-green"  id="rmSaveBtn"
                style="margin-left:auto;">💾 Save Matrix</button>
        <button type="button" class="btn-action btn-navy"   onclick="window.print()">🖨 Print</button>
    </div>

</div>
