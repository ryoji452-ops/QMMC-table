<?php
// Quick proxy redirect for /api/* when the dev server runs on :8000.
// This file attempts to redirect API requests to the dev server port.
// Place under public/api so requests to /api/... get this script if webserver
// serves the project public directory directly.

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'];
// strip existing port if present
$hostParts = explode(':', $host);
$hostname = $hostParts[0];
// Build destination on same host, port 8000
$dest = $scheme . '://' . $hostname . ':8000' . $_SERVER['REQUEST_URI'];

// Send a temporary redirect
header('Location: ' . $dest, true, 302);
exit;
