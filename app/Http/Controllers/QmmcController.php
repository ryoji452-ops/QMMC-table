<?php

// app/Http/Controllers/QmmcController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class QmmcController extends Controller
{
    /**
     * Display the SPCR Rating Matrix & DPCR form.
     */
    public function index()
    {
        return view('qmmc.index');
    }
}
