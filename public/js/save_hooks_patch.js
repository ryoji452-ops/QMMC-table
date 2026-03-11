/* ═══════════════════════════════════════════════════════════════
   SAVE HOOK PATCHES
   Add these small changes to your existing JS files so that
   every successful save automatically updates the Records page.
═══════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────
   1. dpcr.js  — find the dSaveBtn listener
      and replace it with this version:
───────────────────────────────────────── */
document.getElementById('dSaveBtn').addEventListener('click', async () => {
    const data = readDpcrForm();
    if (!data.employee_name) {
        showAlert('d-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        const saved = await apiFetch('/api/dpcr', 'POST', data);
        showAlert('d-alertOk', 'ok', `✔ DPCR for "${data.employee_name}" saved to database.`);
        // ← NEW: push to Records page
        if (typeof notifyRecordSaved === 'function') notifyRecordSaved('dpcr', saved.form ?? saved);
    } catch (err) {
        showAlert('d-alertErr', 'err', 'Save failed: ' + err.message);
    }
});


/* ─────────────────────────────────────────
   2. spcr.js  — find the sSaveBtn listener
      and replace it with this version:
───────────────────────────────────────── */
document.getElementById('sSaveBtn').addEventListener('click', async () => {
    const data = readSpcrForm();
    if (!data.employee_name) {
        showAlert('s-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        const saved = await apiFetch('/api/spcr', 'POST', data);
        showAlert('s-alertOk', 'ok', `✔ SPCR for "${data.employee_name}" saved to database.`);
        // ← NEW: push to Records page
        if (typeof notifyRecordSaved === 'function') notifyRecordSaved('spcr', saved.form ?? saved);
    } catch (err) {
        showAlert('s-alertErr', 'err', 'Save failed: ' + err.message);
    }
});


/* ─────────────────────────────────────────
   3. ipcr.js  — find the iSaveBtn listener
      and replace it with this version:
───────────────────────────────────────── */
document.getElementById('iSaveBtn').addEventListener('click', async () => {
    const data = readIpcrForm();
    if (!data.employee_name) {
        showAlert('i-alertErr', 'err', 'Please fill in the employee name.');
        return;
    }
    try {
        const saved = await apiFetch('/api/ipcr', 'POST', data);
        showAlert('i-alertOk', 'ok', `✔ IPCR for "${data.employee_name}" saved to database.`);
        // ← NEW: push to Records page
        if (typeof notifyRecordSaved === 'function') notifyRecordSaved('ipcr', saved.form ?? saved);
    } catch (err) {
        showAlert('i-alertErr', 'err', 'Save failed: ' + err.message);
    }
});
