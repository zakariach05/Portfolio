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
$email_subject = "🚀 Nouveau Message Portfolio : $subject";
$email_content = "Vouz avez reçu un nouveau message depuis votre portfolio.\n\n";
$email_content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$email_content .= "👤 Nom: $name\n";
$email_content .= "📧 Email: $email\n";
$email_content .= "📝 Sujet: $subject\n";
$email_content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$email_content .= "💬 Message:\n$message\n\n";
$email_content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

// Email headers (Modern and less likely to be marked as spam)
$headers = "From: Portfolio Contact <contact@zakariach05.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Attempt to send email
$mail_sent = @mail($recipient, $email_subject, $email_content, $headers);

if ($mail_sent) {
    // Optional: Send confirmation email to the user
    $user_subject = "Confirmation de réception : " . $name;
    $user_content = "Bonjour $name,\n\nMerci de m'avoir contacté ! J'ai bien reçu votre message concernant '$subject' et je vous répondrai dès que possible.\n\nCordialement,\nZakaria Chamekh";
    $user_headers = "From: Zakaria Chamekh <chamekhzakaria95@gmail.com>\r\n";
    @mail($email, $user_subject, $user_content, $user_headers);

    http_response_code(200);
    echo "Succès : Votre message a été envoyé directement à Zakaria !";
} else {
    // FALLBACK FOR LOCALHOST / DEV ENVIRONMENTS
    $log_file = "../messages.txt";
    $log_entry = "--- Nouveau Message [" . date("Y-m-d H:i:s") . "] ---\n";
    $log_entry .= "Nom: $name\nEmail: $email\nSujet: $subject\nMessage: $message\n";
    $log_entry .= "-------------------------------------------\n\n";
    
    file_put_contents($log_file, $log_entry, FILE_APPEND);

    http_response_code(200);
    echo "Note : Le message a été sauvegardé en local (Mode Démo). L'email sera envoyé une fois le site hébergé en ligne !";
}
?>
