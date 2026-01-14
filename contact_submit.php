<?php
/**
 * Contact Form Handler for Rakennusliike Suvenkari Oy
 * Sends contact form submissions to info@rakennusliikesuvenkari.fi
 */

// Set headers for JSON response
header('Content-Type: application/json; charset=utf-8');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Virheellinen pyyntö. Käytä POST-metodia.'
    ]);
    exit;
}

// Get and sanitize form data
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$email = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';
$consent = isset($_POST['consent']) ? $_POST['consent'] : '';

// Validate required fields
$errors = [];

if (empty($name)) {
    $errors[] = 'Nimi on pakollinen';
}

if (empty($phone)) {
    $errors[] = 'Puhelinnumero on pakollinen';
} elseif (!preg_match('/^[\d\s\-\+\(\)]+$/', $phone)) {
    $errors[] = 'Puhelinnumero on virheellinen';
}

if (empty($message)) {
    $errors[] = 'Viesti on pakollinen';
}

if (empty($consent)) {
    $errors[] = 'Hyväksyntä tietojen käsittelyyn on pakollinen';
}

// Validate email if provided
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Sähköpostiosoite on virheellinen';
}

// Return errors if validation fails
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Lomakkeessa on virheitä: ' . implode(', ', $errors)
    ]);
    exit;
}

// Prepare email
$to = 'info@rakennusliikesuvenkari.fi';
$subject = 'Uusi yhteydenotto - Rakennusliike Suvenkari Oy';

// Build email body
$email_body = "Uusi yhteydenottopyyntö Suvenkari-sivustolta\n\n";
$email_body .= "Nimi: " . $name . "\n";
$email_body .= "Puhelinnumero: " . $phone . "\n";

if (!empty($email)) {
    $email_body .= "Sähköposti: " . $email . "\n";
}

$email_body .= "\nViesti:\n" . $message . "\n\n";
$email_body .= "---\n";
$email_body .= "Lähetetty: " . date('d.m.Y H:i:s') . "\n";
$email_body .= "IP-osoite: " . $_SERVER['REMOTE_ADDR'] . "\n";

// Set email headers
$headers = [];
$headers[] = 'From: noreply@rakennusliikesuvenkari.fi';
$headers[] = 'Reply-To: ' . (!empty($email) ? $email : 'noreply@rakennusliikesuvenkari.fi');
$headers[] = 'X-Mailer: PHP/' . phpversion();
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

// Send email
$mail_sent = @mail($to, $subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Viesti lähetetty onnistuneesti! Otamme yhteyttä pian.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Viestin lähetys epäonnistui. Yritä myöhemmin uudelleen tai soita meille.'
    ]);
}
