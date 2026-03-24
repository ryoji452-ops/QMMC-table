/* ═══════════════════════════════════════════════════════════════
   print_modes.js
   Handles "Print Target" and "Print Actual" for DPCR / SPCR / IPCR.

   PRINT TARGET  (body class: print-target-mode)
     – Allotted Budget cell      → blank (content hidden)
     – Target % cell             → blank
     – Actual Accomplishment     → blank
     – Accomplishment Rate       → blank
     – Q / E / T cells          → ✓ if criterion active, – if N/A
     – A(4) cell                 → blank
     – Rating Matrix embed       → hidden (CSS)
     – Function summary          → hidden (CSS)

   PRINT ACTUAL  (body class: print-actual-mode)
     – All data prints normally
     – Rating Matrix embed       → hidden (CSS)
     – Function summary          → shown
═══════════════════════════════════════════════════════════════ */

/* ── Inject .qet-print-symbol spans into every Q/E/T rating cell ──
   Called once after DOM is ready and again after any hydration.
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

/* ── Helper: activate one page, set mode class, print, restore ── */
function _printPage(pageId, modeClass) {
    var allPages   = document.querySelectorAll('.page');
    var targetPage = document.getElementById(pageId);
    if (!targetPage) return;

    /* Refresh symbols just before printing so they reflect latest state */
    injectQetPrintSymbols();
    targetPage.querySelectorAll('.qet-print-symbol').forEach(function(sym) {
        var td  = sym.closest('.rating-cell');
        if (!td) return;
        var chk = td.querySelector('input.rating-chk');
        var inp = td.querySelector('input.rating-num');
        var active;
        if (chk) active = chk.checked;
        else if (inp) active = inp.value.trim() !== '';
        else active = false;
        sym.textContent = active ? '\u2713' : '\u2013';
    });

    /* Save active-page state */
    var wasActive = [];
    allPages.forEach(function(p) {
        wasActive.push(p.classList.contains('active'));
        p.classList.remove('active');
    });
    targetPage.classList.add('active');

    /* Apply print mode */
    document.body.classList.remove('print-target-mode', 'print-actual-mode');
    document.body.classList.add(modeClass);

    window.print();

    /* Restore */
    document.body.classList.remove('print-target-mode', 'print-actual-mode');
    allPages.forEach(function(p, i) {
        if (wasActive[i]) p.classList.add('active');
        else              p.classList.remove('active');
    });
}

/* ══════════════════════════════════════════
   PUBLIC API — called by blade print buttons
══════════════════════════════════════════ */
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
            setTimeout(injectQetPrintSymbols, 100);
        }).observe(el, { childList: true, subtree: false });
    });
})();