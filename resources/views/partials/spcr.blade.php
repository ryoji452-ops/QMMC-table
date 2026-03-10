{{-- resources/views/partials/spcr.blade.php --}}
<div class="page active" id="page-spcr">

    <div id="s-alertOk"   class="alert-ok"></div>
    <div id="s-alertErr"  class="alert-err"></div>
    <div id="s-alertInfo" class="alert-info"></div>

    <div class="form-ref">PMT - SPCR Rating Matrix | Rev.0 01 March 2024</div>

    {{-- Header --}}
    <div class="doc-header">
        <div><img class = "logo" src="img/qmmclogo1.png" alt="QMMC Logo"></div>
        <div class="header-text">
            <div class="org-name">Pang-ALAALANG Sentrong Medikal Quirino</div>
            <div class="org-sub">(Quirino Memorial Medical Center)</div>
            <div class="form-title">Hospital Operation and Patient Support Service</div>
            <div style="font-size:11px;color:#333;margin-top:3px;">SPCR Rating Matrix</div>
        </div>
    </div>

    {{-- Signature Block --}}
    <div class="sig-outer">
        <div class="sig-row">

            {{-- Prepared By --}}
            <div class="sig-cell" style="flex:2;">
                <div class="sig-label">Prepared By:</div>
                <div style="margin-bottom:14px;"></div>
                <input type="text" id="s_prepared_by" class="sig-name-input"
                       placeholder="Full Name of Employee">
                <div class="sig-sub"><em>Division Chief / Name of Employee</em></div>
                <div style="margin-top:5px;font-size:10px;">
                    <strong>Title:</strong>
                    <input type="text" id="s_prepared_by_title" class="sub-inp"
                           placeholder="Position / Division / Service">
                </div>
            </div>

            {{-- Reviewed By --}}
            <div class="sig-cell" style="flex:2;">
                <div class="sig-label">Reviewed By:</div>
                <div style="margin-bottom:14px;"></div>
                <input type="text" id="s_reviewed_by" class="sig-name-input"
                       placeholder="Name of Reviewer">
                <div class="sig-sub"><em>Chairperson, Performance Management Team</em></div>
                <div style="margin-top:5px;font-size:10px;">
                    <strong>Title:</strong>
                    <input type="text" id="s_reviewed_by_title" class="sub-inp"
                           placeholder="e.g. MD, FPCP, FPCCP, MAS">
                </div>
            </div>

            {{-- Approved By --}}
            <div class="sig-cell" style="flex:2;">
                <div class="sig-label">Approved By:</div>
                <div style="margin-bottom:14px;"></div>
                <input type="text" id="s_approved_by" class="sig-name-input"
                       placeholder="Name of Approver">
                <div class="sig-sub"><em>Medical Center Chief II</em></div>
                <div style="margin-top:5px;font-size:10px;">
                    <strong>Title:</strong>
                    <input type="text" id="s_approved_by_title" class="sub-inp"
                           placeholder="e.g. Medical Center Chief II">
                </div>
            </div>

        </div>
    </div>

    {{-- Matrix Table --}}
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

    {{-- Action Bar --}}
    <div class="action-bar">
        <button type="button" class="btn-action btn-navy" id="addRowBtn">+ Add Row</button>
        <button type="button" class="btn-action btn-slate" id="addSectionBtn">+ Add Section</button>
        <button type="button" class="btn-action btn-orange" id="clearBtn">Clear Form</button>
        <button type="button" class="btn-action btn-green" id="saveBtn"
                style="margin-left:auto;">💾 Save Matrix</button>
        <button type="button" class="btn-action btn-navy" onclick="window.print()">🖨 Print</button>
    </div>

    {{-- Saved Matrices --}}
    <div class="prev-section">
        <h3>Saved Matrices</h3>
        <div id="prevList"></div>
    </div>

</div>{{-- /page-spcr --}}