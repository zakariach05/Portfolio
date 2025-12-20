<?php
// Enable CORS if needed for local development servers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

// Prevent direct access
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(403);
    echo "Accès interdit";
    exit;
}

// Get form data
$name = strip_tags(trim($_POST["name"] ?? ''));
$email = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
$subject = strip_tags(trim($_POST["subject"] ?? ''));
$message = trim($_POST["message"] ?? '');

// Check data
if (empty($name) OR empty($message) OR !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo "Veuillez remplir tous les champs correctement.";
    exit;
}

// Recipient email
$recipient = "chamekhzakaria95@gmail.com";

// Email content
$email_subject = "Nouveau contact portfolio : $subject";
$email_content = "Nom: $name\n";
$email_content .= "Email: $email\n\n";
$email_content .= "Message:\n$message\n";

// Email headers
$headers = "From: $name <$email>";

// Attempt to send email
// We use the @ operator to suppress warnings if mail server is not configured
$mail_sent = @mail($recipient, $email_subject, $email_content, $headers);

if ($mail_sent) {
    http_response_code(200);
    echo "Merci ! Votre message a été envoyé.";
} else {
    // FALLBACK FOR LOCALHOST / DEV ENVIRONMENTS
    // If mail() fails (common on local WAMP/XAMPP without SMTP config), 
    // we log the message to a text file instead of failing.
    
    $log_file = "../messages.txt";
    $log_entry = "--- Nouveau Message [" . date("Y-m-d H:i:s") . "] ---\n";
    $log_entry .= "Nom: $name\nEmail: $email\nSujet: $subject\nMessage: $message\n";
    $log_entry .= "-------------------------------------------\n\n";
    
    // Write to file
    file_put_contents($log_file, $log_entry, FILE_APPEND);

    // Return 200 OK so the frontend shows success
    http_response_code(200);
    echo "Merci ! Votre message a été bien enregistré (Mode Démo/Local).";
}
?>
