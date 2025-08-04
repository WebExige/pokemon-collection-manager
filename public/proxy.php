<?php
/**
 * Proxy PHP simplifié pour API PokéTCG
 * Compatible avec hébergement partagé O2switch
 * Version robuste avec gestion d'erreurs
 */

// Activer l'affichage des erreurs pour diagnostic (à désactiver en prod)
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    // Configuration CORS
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Api-Key');
    
    // Répondre aux requêtes OPTIONS (preflight CORS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    // Vérifier si cURL est disponible
    if (!extension_loaded('curl')) {
        throw new Exception('Extension cURL non disponible');
    }

    // Configuration de l'API PokéTCG
    $API_BASE = 'https://api.pokemontcg.io/v2';

    // Récupérer le path depuis l'URL
    $path = isset($_GET['path']) ? trim($_GET['path']) : '';
    if (empty($path)) {
        throw new Exception('Paramètre path manquant');
    }

    // Construire l'URL complète
    $url = $API_BASE . '/' . ltrim($path, '/');

    // Ajouter les paramètres de query string (sauf 'path')
    $query_params = $_GET;
    unset($query_params['path']);
    if (!empty($query_params)) {
        $url .= '?' . http_build_query($query_params);
    }

    // Initialiser cURL
    $ch = curl_init();
    if ($ch === false) {
        throw new Exception('Impossible d\'initialiser cURL');
    }

    // Configuration cURL simplifiée
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Désactivé pour compatibilité
    curl_setopt($ch, CURLOPT_USERAGENT, 'Pokemon Collection Manager Proxy/1.0');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);

    // Exécuter la requête
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    
    curl_close($ch);

    // Vérifier les erreurs cURL
    if ($response === false) {
        throw new Exception('Erreur cURL: ' . $curl_error);
    }

    // Vérifier le code de réponse HTTP
    if ($http_code === 0) {
        throw new Exception('Aucune réponse du serveur');
    }

    // Définir le type de contenu
    header('Content-Type: application/json; charset=utf-8');
    
    // Retourner la réponse avec le même code HTTP
    http_response_code($http_code);
    echo $response;

} catch (Exception $e) {
    // Gestion d'erreur
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    
    echo json_encode([
        'error' => $e->getMessage(),
        'proxy_version' => '1.0',
        'debug' => [
            'php_version' => PHP_VERSION,
            'curl_available' => extension_loaded('curl'),
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
            'query_string' => $_SERVER['QUERY_STRING'] ?? 'empty'
        ]
    ]);
}
?>