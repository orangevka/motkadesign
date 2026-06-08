<?php
require __DIR__ . '/lib.php';
cms_start_session();
$_SESSION = [];
session_destroy();
header('Location: /services-cms.html');
exit;
