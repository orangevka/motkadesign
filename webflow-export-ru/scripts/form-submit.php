<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$captchaToken = $_POST['smart-token'] ?? '';
unset($_POST['smart-token']);

if (empty($captchaToken)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Captcha token is required']);
    exit;
}

$captchaResponse = file_get_contents('https://smartcaptcha.cloud.yandex.ru/validate', false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/x-www-form-urlencoded',
        'content' => http_build_query([
            'secret' => CAPTCHA_SERVER_KEY,
            'token' => $captchaToken,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]),
    ],
]));

if ($captchaResponse === false) {
    error_log('SmartCaptcha validation request failed');
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Captcha validation failed']);
    exit;
}

$captchaResult = json_decode($captchaResponse, true);
if (($captchaResult['status'] ?? '') !== 'ok') {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Captcha check failed']);
    exit;
}

$formName = $_POST['FormName'] ?? 'unknown';
$pageUrl = $_POST['PageUrl'] ?? '';
unset($_POST['FormName']);
unset($_POST['PageUrl']);

$bodyLines = [];
foreach ($_POST as $key => $value) {
    $bodyLines[] = "$key: $value";
}
$bodyText = "Form: $formName\nPage: $pageUrl\n\n" . implode("\n", $bodyLines);

$emailData = json_encode([
    'FromEmailAddress' => MAIL_FROM_ADDRESS,
    'Destination' => ['ToAddresses' => [MAIL_TO_ADDRESS]],
    'Content' => [
        'Simple' => [
            'Subject' => [
                'Data' => "Form submission: $formName",
            ],
            'Body' => [
                'Text' => [
                    'Data' => $bodyText,
                ],
            ],
        ],
    ],
]);

$ch = curl_init('https://postbox.cloud.yandex.net/v2/email/outbound-emails');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => $emailData,
    CURLOPT_USERPWD => POSTBOX_KEY_ID . ':' . POSTBOX_SECRET_KEY,
    CURLOPT_AWS_SIGV4 => 'aws:amz:ru-central1:ses',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
unset($ch);

if ($error || $httpCode >= 400) {
    error_log("Postbox API error (HTTP $httpCode): $error $response");
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Failed to send email']);
    exit;
}

http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Form submission successful']);
