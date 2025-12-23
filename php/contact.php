<?php
// contact.php

// 1. Suppression des erreurs d'affichage (IMPORTANT pour JSON)
error_reporting(0);
ini_set('display_errors', 0);

// 2. Configuration Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

// 3. Configuration
$destinationEmail = "chamekhzakaria95@gmail.com"; 
$logFile = __DIR__ . '/../messages.txt';

try {
    // Vérification méthode
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Méthode non autorisée.", 405);
    }

    // Anti-spam
    if (!empty($_POST['_gotcha'])) {
        throw new Exception("Erreur de sécurité.", 400);
    }

    // Récupération données
    $name = strip_tags(trim($_POST["name"] ?? ''));
    $email = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
    $subject = strip_tags(trim($_POST["subject"] ?? ''));
    $message = trim($_POST["message"] ?? '');

    // Validation
    if (empty($name) OR empty($message) OR !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Champs invalides ou manquants.", 400);
    }

    // Préparation contenu
    $fullMessage = "Date: " . date("Y-m-d H:i:s") . "\n";
    $fullMessage .= "Nom: $name (<$email>)\n";
    $fullMessage .= "Sujet: $subject\n";
    $fullMessage .= "Message:\n$message\n";
    $fullMessage .= "--------------------------------------------------\n\n";

    // Action 1: Sauvegarde Fichier
    // On vérifie si on peut écrire
    $fileSaved = false;
    if (is_writable(dirname($logFile)) || is_writable($logFile)) {
        if (@file_put_contents($logFile, $fullMessage, FILE_APPEND | LOCK_EX) !== false) {
            $fileSaved = true;
        }
    }

    // Action 2: Envoi Email
    $headers = "From: $name <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Le @ masque les warnings si pas de serveur SMTP configuré
    $mailSent = @mail($destinationEmail, "Contact Portfolio: $subject", $fullMessage, $headers);

    // Résultat
    if ($fileSaved || $mailSent) {
        http_response_code(200);
        $msg = "Message enregistré !";
        if (!$mailSent) $msg .= " (Email non envoyé, mais sauvegardé sur serveur)";
        
        echo json_encode(["message" => $msg]);
    } else {
        throw new Exception("Echec de sauvegarde (Erreur permissions ou SMTP).", 500);
    }

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode(["message" => $e->getMessage()]);
}
?>
