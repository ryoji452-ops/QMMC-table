<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DPCR – Quirino Memorial Medical Center</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; }

        body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            background: #d0d0d0;
            margin: 0;
            padding: 20px;
        }

        .page {
            background: #fff;
            width: 1100px;
            margin: 0 auto;
            border: 1px solid #999;
            padding: 18px 22px 28px 22px;
            box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
        }

        /* ---- HEADER ---- */
        .doc-header {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 4px;
            position: relative;
        }

        .doc-header .logo {
            width: 68px;
            height: 68px;
            position: absolute;
            left: 0;
            border: 2px solid #1a3b6e;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 8px; color: #1a3b6e; font-weight: bold; text-align: center;
            background: #eef3fb;
        }

        .doc-header .center-title {
            text-align: center;
        }

        .doc-header .center-title h1 {
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin: 0;
            text-transform: uppercase;
        }

        .doc-header .center-title h2 {
            font-size: 13px;
            font-weight: 700;
            margin: 0;
            padding: 2px 18px;
            border: 2px solid #000;
            display: inline-block;
            letter-spacing: 0.3px;
        }

        /* ---- FORM-NUMBER ---- */
        .form-number {
            text-align: right;
            font-size: 9px;
            color: #444;
            margin-bottom: 2px;
        }

        /* ---- INTRO TEXT ---- */
        .intro-block {
            border: 1px solid #000;
            padding: 6px 10px 4px 10px;
            margin-bottom: 0;
        }

        .intro-block .intro-line {
            font-size: 11px;
            line-height: 1.6;
        }

        .intro-block .intro-line .underline-field {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 140px;
            font-weight: bold;
        }

        .intro-block .label-small {
            font-size: 9px;
            color: #333;
            margin-left: 4px;
        }

        /* ---- SIGNATURE ROW ---- */
        .sig-row {
            display: flex;
            border: 1px solid #000;
            border-top: none;
        }

        .sig-cell {
            flex: 1;
            padding: 5px 10px;
            border-right: 1px solid #000;
        }
        .sig-cell:last-child { border-right: none; }

        .sig-cell .sig-name {
            font-weight: bold;
            font-size: 11px;
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 200px;
            text-align: center;
        }

        .sig-cell .sig-title {
            font-size: 9px;
            text-align: center;
            margin-top: 1px;
        }

        .sig-cell .sig-label {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 2px;
        }

        .sig-cell .date-val {
            font-weight: bold;
            font-size: 11px;
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 120px;
        }

        /* ---- RATING KEY ---- */
        .rating-key {
            font-size: 9px;
            line-height: 1.5;
        }

        /* ---- MAIN TABLE ---- */
        .dpcr-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            table-layout: fixed;
        }

        .dpcr-table th, .dpcr-table td {
            border: 1px solid #000;
            padding: 4px 5px;
            vertical-align: middle;
            font-size: 10px;
            word-wrap: break-word;
        }

        .dpcr-table thead tr th {
            background-color: #e8e8e8;
            text-align: center;
            font-weight: bold;
            font-size: 10px;
        }

        .dpcr-table .rating-group-header {
            text-align: center;
            font-size: 9px;
        }

        .dpcr-table .section-header td {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 10px;
            padding: 3px 5px;
        }

        .col-goal     { width: 14%; }
        .col-indicator{ width: 22%; }
        .col-budget   { width: 7%; }
        .col-section  { width: 9%; }
        .col-actual   { width: 14%; }
        .col-rate     { width: 9%; }
        .col-q        { width: 4%; }
        .col-e        { width: 4%; }
        .col-t        { width: 4%; }
        .col-a        { width: 4%; }
        .col-remarks  { width: 13%; }

        /* ---- FORM CONTROLS ---- */
        .dpcr-table input[type="text"],
        .dpcr-table input[type="date"],
        .dpcr-table select,
        .dpcr-table textarea {
            width: 100%;
            border: none;
            background: transparent;
            font-size: 10px;
            font-family: Arial, sans-serif;
            padding: 1px 2px;
            outline: none;
            resize: none;
            overflow: hidden;
            min-height: 20px;
        }

        .dpcr-table textarea {
            min-height: 52px;
            line-height: 1.4;
        }

        .dpcr-table select {
            -webkit-appearance: none;
            cursor: pointer;
        }

        .dpcr-table input[type="checkbox"] {
            width: 14px;
            height: 14px;
            cursor: pointer;
        }

        .rating-cell {
            text-align: center;
            vertical-align: middle;
        }

        .remove-btn {
            background: none;
            border: none;
            color: #c00;
            font-size: 11px;
            cursor: pointer;
            padding: 0;
        }

        .goal-cell {
            font-size: 10px;
            font-style: italic;
        }

        /* ---- ACTION BUTTONS ---- */
        .action-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;
        }

        .btn-add {
            background: #1a3b6e;
            color: white;
            border: none;
            padding: 5px 14px;
            font-size: 11px;
            cursor: pointer;
            border-radius: 2px;
        }
        .btn-add:hover { background: #0f2651; }

        .btn-save {
            background: #1a3b6e;
            color: white;
            border: none;
            padding: 6px 22px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            border-radius: 2px;
            letter-spacing: 0.3px;
        }
        .btn-save:hover { background: #0f2651; }

        /* ---- PREVIOUS SUBMISSIONS ---- */
        .submissions-section h3 {
            font-size: 13px;
            font-weight: bold;
            border-bottom: 2px solid #1a3b6e;
            padding-bottom: 4px;
            margin-bottom: 12px;
            color: #1a3b6e;
        }

        /* highlight on focus */
        .dpcr-table td:focus-within {
            background-color: #fffde7;
        }

        @media print {
            body { background: #fff; padding: 0; }
            .page { box-shadow: none; border: none; }
            .action-bar { display: none; }
            .remove-btn { display: none; }
        }
    </style>
</head>
<body>
<div class="page">

    <!-- Form Number -->
    <div class="form-number">DPCR – SPMS Form 2</div>

    <!-- Header -->
    <div class="doc-header mb-2">
        <div class="logo">QMMC<br>SEAL</div>
        <div class="center-title">
            <h1>QUIRINO MEMORIAL MEDICAL CENTER</h1>
            <h2>DIVISION PERFORMANCE COMMITMENT AND REVIEW (DPCR)</h2>
        </div>
    </div>

    <!-- Intro Block -->
    <div class="intro-block">
        <div class="intro-line">
            I,&nbsp;
            <input type="text" class="underline-field" placeholder="Full Name of Employee" style="min-width:200px; font-weight:bold;" id="emp_name">
            <span class="label-small"><em>Name of Employee</em></span>
            ,&nbsp;
            <input type="text" class="underline-field" placeholder="Position / Division / Service" style="min-width:260px;" id="emp_title">
            <span class="label-small"><em>Division / Service</em></span>
            , of the Quirino Memorial Medical Center, commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measures for the period
            <input type="text" class="underline-field" placeholder="e.g. January–June 2025" style="min-width:160px; font-weight:bold;" id="period">
            .
        </div>
    </div>

    <!-- Signature Row -->
    <div class="sig-row">
        <!-- Employee signature -->
        <div class="sig-cell" style="flex:2;">
            <div style="margin-bottom: 18px;"></div>
            <div><span class="sig-name" id="disp_name">&nbsp;</span></div>
            <div class="sig-title"><em>Division Chief / Name of Employee</em></div>
            <div style="margin-top:4px;"><span class="sig-label">Date:</span>
                <input type="date" style="border:none; border-bottom:1px solid #000; background:transparent; font-size:10px; outline:none;">
            </div>
        </div>

        <!-- Approved by -->
        <div class="sig-cell" style="flex:2;">
            <div class="sig-label">Approved By:</div>
            <div style="margin-bottom: 6px;"></div>
            <div><input type="text" class="underline-field" placeholder="Name of Approver" style="min-width:220px; text-align:center; font-weight:bold;"></div>
            <div class="sig-title"><em>Medical Center Chief II</em></div>
            <div style="margin-top:4px;"><span class="sig-label">Date:</span>
                <input type="date" style="border:none; border-bottom:1px solid #000; background:transparent; font-size:10px; outline:none;">
            </div>
        </div>

        <!-- Rating key -->
        <div class="sig-cell" style="flex:1; font-size:9px;">
            <div class="rating-key">
                <div style="font-weight:bold; margin-bottom:2px;">Rating Scale:</div>
                <div>5 &nbsp;&nbsp;&nbsp;– Outstanding</div>
                <div>4–4.99 – Very Satisfactory</div>
                <div>3–3.99 – Satisfactory</div>
                <div>2–2.99 – Unsatisfactory</div>
                <div>1 &nbsp;&nbsp;&nbsp;– Poor</div>
            </div>
        </div>
    </div>

    <!-- Main DPCR Table -->
    <table class="dpcr-table" id="dpcrTable" style="margin-top:0;">
        <thead>
            <tr>
                <th class="col-goal" rowspan="2">STRATEGIC GOALS AND OBJECTIVES</th>
                <th class="col-indicator" rowspan="2">Performance / Success Indicator<br>(Targets + Measure)</th>
                <th class="col-budget" rowspan="2">ALLOTED BUDGET</th>
                <th class="col-section" rowspan="2">SECTION ACCOUNTABLE</th>
                <th class="col-actual" rowspan="2">ACTUAL ACCOMPLISHMENT</th>
                <th class="col-rate" rowspan="2">Accomplishment Rate<br>(Actual÷Target × 100%)</th>
                <th colspan="4" class="rating-group-header">RATING</th>
                <th class="col-remarks" rowspan="2">Remarks / Justification of Unmet Targets</th>
            </tr>
            <tr>
                <th class="col-q" style="font-size:9px;">Q<br><span style="font-weight:normal;">(1)</span></th>
                <th class="col-e" style="font-size:9px;">E<br><span style="font-weight:normal;">(2)</span></th>
                <th class="col-t" style="font-size:9px;">T<br><span style="font-weight:normal;">(3)</span></th>
                <th class="col-a" style="font-size:9px;">A<br><span style="font-weight:normal;">(4)</span></th>
            </tr>
        </thead>
        <tbody id="itemsBody">
            <!-- Section Header -->
            <tr class="section-header" id="firstSectionRow">
                <td colspan="11">STRATEGIC FUNCTIONS :</td>
            </tr>
        </tbody>
    </table>

    <div class="action-bar">
        <div>
            <button class="btn-add" id="addRowBtn">+ Add Row</button>
            <button class="btn-add" id="addSectionBtn" style="margin-left:6px; background:#4a6fa5;">+ Add Section Header</button>
        </div>
        <button class="btn-save" onclick="alert('DPCR saved!')">Save DPCR</button>
    </div>

</div><!-- /page -->

<script>
    let rowIndex = 0;

    // Mirror employee name into signature area
    document.getElementById('emp_name').addEventListener('input', function() {
        document.getElementById('disp_name').textContent = this.value || '\u00a0';
    });

    function autoExpand(el) {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }

    const sections = ['ALL SECTIONS','EFMS','IMISS','PMG / EFMS / PROCUREMENT','NURSING','MEDICAL','ADMINISTRATIVE','FINANCE','PHARMACY'];

    function createRow(idx, data = {}) {
        const tr = document.createElement('tr');

        // Strategic Goal
        const tdGoal = document.createElement('td');
        tdGoal.className = 'goal-cell';
        const goalTA = document.createElement('textarea');
        goalTA.name = `items[${idx}][strategic_goal]`;
        goalTA.placeholder = 'Strategic goal…';
        goalTA.value = data.strategic_goal || '';
        goalTA.addEventListener('input', () => autoExpand(goalTA));
        tdGoal.appendChild(goalTA);
        tr.appendChild(tdGoal);

        // Performance Indicator
        const tdInd = document.createElement('td');
        const indTA = document.createElement('textarea');
        indTA.name = `items[${idx}][performance_indicator]`;
        indTA.placeholder = 'Performance/Success indicator…';
        indTA.value = data.performance_indicator || '';
        indTA.addEventListener('input', () => autoExpand(indTA));
        tdInd.appendChild(indTA);
        tr.appendChild(tdInd);

        // Budget
        const tdBudget = document.createElement('td');
        const budgetIn = document.createElement('input');
        budgetIn.type = 'text';
        budgetIn.name = `items[${idx}][allotted_budget]`;
        budgetIn.placeholder = '—';
        budgetIn.value = data.allotted_budget || '';
        tdBudget.appendChild(budgetIn);
        tr.appendChild(tdBudget);

        // Section accountable
        const tdSec = document.createElement('td');
        const secSel = document.createElement('select');
        secSel.name = `items[${idx}][section_accountable]`;
        sections.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (data.section_accountable === s) opt.selected = true;
            secSel.appendChild(opt);
        });
        tdSec.appendChild(secSel);
        tr.appendChild(tdSec);

        // Actual Accomplishment
        const tdActual = document.createElement('td');
        const actualTA = document.createElement('textarea');
        actualTA.name = `items[${idx}][actual_accomplishment]`;
        actualTA.placeholder = '—';
        actualTA.value = data.actual_accomplishment || '';
        actualTA.addEventListener('input', () => autoExpand(actualTA));
        tdActual.appendChild(actualTA);
        tr.appendChild(tdActual);

        // Accomplishment Rate
        const tdRate = document.createElement('td');
        tdRate.style.textAlign = 'center';
        const rateIn = document.createElement('input');
        rateIn.type = 'text';
        rateIn.name = `items[${idx}][accomplishment_rate]`;
        rateIn.placeholder = 'e.g. 85%';
        rateIn.value = data.accomplishment_rate || '';
        rateIn.style.textAlign = 'center';
        tdRate.appendChild(rateIn);
        tr.appendChild(tdRate);

        // Rating checkboxes Q E T A
        ['q','e','t','a'].forEach(r => {
            const tdR = document.createElement('td');
            tdR.className = 'rating-cell';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.name = `items[${idx}][rating_${r}]`;
            cb.value = '1';
            if (data[`rating_${r}`]) cb.checked = true;
            tdR.appendChild(cb);
            tr.appendChild(tdR);
        });

        // Remarks
        const tdRem = document.createElement('td');
        const remTA = document.createElement('textarea');
        remTA.name = `items[${idx}][remarks]`;
        remTA.placeholder = '—';
        remTA.value = data.remarks || '';
        remTA.addEventListener('input', () => autoExpand(remTA));
        tdRem.appendChild(remTA);
        tr.appendChild(tdRem);

        // Remove button (hidden col)
        const tdDel = document.createElement('td');
        tdDel.style.textAlign = 'center';
        tdDel.style.width = '20px';
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'remove-btn';
        delBtn.title = 'Remove row';
        delBtn.innerHTML = '✕';
        delBtn.onclick = () => tr.remove();
        tdDel.appendChild(delBtn);
        tr.appendChild(tdDel);

        return tr;
    }

    document.getElementById('addRowBtn').addEventListener('click', () => {
        const tr = createRow(rowIndex++);
        document.getElementById('itemsBody').appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
    });

    document.getElementById('addSectionBtn').addEventListener('click', () => {
        const tr = document.createElement('tr');
        tr.className = 'section-header';
        const td = document.createElement('td');
        td.colSpan = 11;
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'Section name (e.g. SUPPORT FUNCTIONS)';
        inp.style.cssText = 'width:100%;border:none;background:transparent;font-weight:bold;font-size:10px;outline:none;';
        td.appendChild(inp);
        // delete button
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'remove-btn';
        del.innerHTML = '✕';
        del.style.marginLeft = '8px';
        del.onclick = () => tr.remove();
        td.appendChild(del);
        tr.appendChild(td);
        document.getElementById('itemsBody').appendChild(tr);
    });

    // Seed with default rows matching the photo
    const defaultRows = [
        {
            strategic_goal: 'Ensure safe health facilities and quality services',
            performance_indicator: '100% of the PGS Strategic deliverables are achieved within the prescribed timeline.',
            section_accountable: 'ALL SECTIONS',
            accomplishment_rate: 'NA',
            rating_e: true, rating_t: true
        },
        {
            strategic_goal: '',
            performance_indicator: '90% compliance with the Green Viability Assessment (GVA) by June 2025.',
            section_accountable: 'EFMS',
            accomplishment_rate: 'NA',
            rating_e: true, rating_t: true
        },
        {
            strategic_goal: 'Implementation of Electronic Medical Record (EMR)',
            performance_indicator: '73% among elected hospital areas are provided with Electronic Medical Record (EMR) system within the prescribed timeline.',
            section_accountable: 'IMISS',
            accomplishment_rate: 'NA',
            rating_e: true, rating_t: true
        },
        {
            strategic_goal: 'Upgrading of QMMC infrastructures and facilities',
            performance_indicator: '50% of the approved Infrastructure and Equipment projects are bidded and prepared for implementation by June 2025',
            section_accountable: 'PMG / EFMS / PROCUREMENT',
            rating_q: true, rating_e: true, rating_t: true
        },
        {
            strategic_goal: 'Ensure compliance with cross-cutting requirements based on standard procedures and timelines and other international standards',
            performance_indicator: 'At least one (1) Electronic / Less Paper Transaction is completely developed and implemented within the year.',
            section_accountable: 'IMISS',
            rating_q: true, rating_e: true, rating_t: true
        }
    ];

    defaultRows.forEach(row => {
        const tr = createRow(rowIndex++, row);
        document.getElementById('itemsBody').appendChild(tr);
        tr.querySelectorAll('textarea').forEach(autoExpand);
    });
</script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>