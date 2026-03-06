{{-- resources/views/partials/modals.blade.php --}}

{{-- Scale Modal --}}
<div class="modal-overlay" id="scaleModal"
     onclick="if(event.target===this) closeScaleModal()">
    <div class="modal-box">
        <button class="modal-close" onclick="closeScaleModal()">&times;</button>
        <h4>Accomplishment Rating Scale</h4>
        <table class="modal-scale-table">
            <tr><td>5</td><td>= 100% of the target</td></tr>
            <tr><td>4</td><td>= 85%–99% of the target</td></tr>
            <tr><td>3</td><td>= 75%–84% of the target</td></tr>
            <tr><td>2</td><td>= &lt;75% of the target</td></tr>
        </table>
    </div>
</div>

{{-- View Record Modal --}}
<div class="view-modal-overlay" id="viewModal"
     onclick="if(event.target===this) closeViewModal()">
    <div class="view-modal-box">
        <button class="view-modal-close" onclick="closeViewModal()">&times;</button>
        <h4 id="viewModalTitle">Viewing Record</h4>
        <div id="viewModalContent"></div>
    </div>
</div>