/* ═══════════════════════════════════════════════════════════════
   print_modes.js  — FIXED & STANDARDIZED
   Handles "Print Target" and "Print Actual" for DPCR / SPCR / IPCR.

   PRINT TARGET  (body class: print-target-mode)
     – Actual Accomplishment  → blank
     – Accomplishment Rate    → blank
     – Q / E / T cells       → ✓ if criterion active, – if N/A
     – A(4) cell             → blank
     – Summary avg/final/adj → blank (% Distribution stays visible)
     – Rating Matrix embed   → hidden (CSS)

   PRINT ACTUAL  (body class: print-actual-mode)
     – All data prints normally
     – Rating Matrix embed   → hidden (CSS)
═══════════════════════════════════════════════════════════════ */

/* ── Inject .qet-print-symbol spans into every Q/E/T rating cell ──
   Idempotent — checks for existing span before inserting.
─────────────────────────────────────────────────────────────── */
function injectQetPrintSymbols() {
    document.querySelectorAll('.rating-cell').forEach(function(td) {
        /* Skip A(4) cells — they have .rating-a-display */
        if (td.querySelector('.rating-a-display')) return;
        /* Skip if symbol already injected */
        if (td.querySelector('.qet-print-symbol')) return;

        var inp = td.querySelector('input.rating-num');
        var chk = td.querySelector('input.rating-chk');

        var sym = document.createElement('span');
        sym.className = 'qet-print-symbol';

        function refreshSymbol() {
            var active;
            if (chk) {
                active = chk.checked;
            } else if (inp) {
                active = inp.value.trim() !== '';
            } else {
                active = false;
            }
            sym.textContent = active ? '\u2713' : '\u2013';
        }

        refreshSymbol();
        if (chk) chk.addEventListener('change', refreshSymbol);
        if (inp) inp.addEventListener('input',  refreshSymbol);
        td.appendChild(sym);
    });
}

/* ── Ensure all compute functions have run ──
   Called just before printing in either mode.
─────────────────────────────────────────────────────────────── */
function _runAllComputations() {
    try { if (typeof computeDpcrFuncSummary === 'function') computeDpcrFuncSummary(); } catch(e) {}
    try { if (typeof computeSpcrFuncSummary === 'function') computeSpcrFuncSummary(); } catch(e) {}
    try { if (typeof computeSpcrAverages    === 'function') computeSpcrAverages();    } catch(e) {}
    try { if (typeof computeIpcrSummary     === 'function') computeIpcrSummary();     } catch(e) {}
}

/* ── Refresh QET symbols for the given page element ── */
function _refreshSymbolsForPage(pageEl) {
    if (!pageEl) return;
    injectQetPrintSymbols();
    pageEl.querySelectorAll('.rating-cell').forEach(function(td) {
        if (td.querySelector('.rating-a-display')) return;
        var sym = td.querySelector('.qet-print-symbol');
        if (!sym) return;
        var chk = td.querySelector('input.rating-chk');
        var inp = td.querySelector('input.rating-num');
        var active;
        if (chk)      active = chk.checked;
        else if (inp) active = inp.value.trim() !== '';
        else          active = false;
        sym.textContent = active ? '\u2713' : '\u2013';
    });
}

/* ── Core print helper ──
   1. Run all computations so summary tables are fully populated.
   2. Activate only the target page.
   3. Apply the print-mode class.
   4. Print.
   5. Restore everything.
─────────────────────────────────────────────────────────────── */
function _printPage(pageId, modeClass) {
    var allPages   = document.querySelectorAll('.page');
    var targetPage = document.getElementById(pageId);
    if (!targetPage) return;

    /* Step 1 — ensure every computation is up to date */
    _runAllComputations();

    /* Step 2 — refresh QET symbols on the target page */
    _refreshSymbolsForPage(targetPage);

    /* Step 3 — capture current active-page state */
    var wasActive = [];
    allPages.forEach(function(p) {
        wasActive.push(p.classList.contains('active'));
        p.classList.remove('active');
    });
    targetPage.classList.add('active');

    /* Step 4 — apply print mode class */
    document.body.classList.remove('print-target-mode', 'print-actual-mode');
    document.body.classList.add(modeClass);

    /* Step 5 — print */
    window.print();

    /* Step 6 — restore */
    document.body.classList.remove('print-target-mode', 'print-actual-mode');
    allPages.forEach(function(p, i) {
        if (wasActive[i]) p.classList.add('active');
        else              p.classList.remove('active');
    });
}

/* ══════════════════════════════════════════════════════════════
   PUBLIC API — called by blade print buttons
══════════════════════════════════════════════════════════════ */
function printDpcrTarget() { _printPage('page-dpcr', 'print-target-mode'); }
function printDpcrActual() { _printPage('page-dpcr', 'print-actual-mode'); }

function printSpcrTarget() { _printPage('page-spcr', 'print-target-mode'); }
function printSpcrActual() { _printPage('page-spcr', 'print-actual-mode'); }

function printIpcrTarget() { _printPage('page-ipcr', 'print-target-mode'); }
function printIpcrActual() { _printPage('page-ipcr', 'print-actual-mode'); }

/* Override legacy single-button functions so old calls still work */
function printDpcr() { printDpcrActual(); }
function printSpcr() { printSpcrActual(); }
function printIpcr() { printIpcrActual(); }

/* ── Auto-inject symbols when DOM is ready ── */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectQetPrintSymbols);
} else {
    injectQetPrintSymbols();
}

/* ── Re-inject after rows are added dynamically (MutationObserver) ── */
(function _observeNewRows() {
    ['dpcrBody', 'spcrBody', 'ipcrBody'].forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        new MutationObserver(function() {
            setTimeout(injectQetPrintSymbols, 150);
        }).observe(el, { childList: true, subtree: false });
    });
})();