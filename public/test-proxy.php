<?php
/**
 * Script de diagnostic pour proxy PHP
 * Test des fonctionnalités requises
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== DIAGNOSTIC PROXY PHP ===\n\n";

// Test 1: Version PHP
echo "1. Version PHP: " . PHP_VERSION . "\n";

// Test 2: Extension cURL
if (extension_loaded('curl')) {
    echo "2. Extension cURL: ✅ Disponible\n";
    $curl_version = curl_version();
    echo "   Version cURL: " . $curl_version['version'] . "\n";
} else {
    echo "2. Extension cURL: ❌ Non disponible\n";
}

// Test 3: Fonctions requises
$required_functions = ['curl_init', 'curl_setopt', 'curl_exec', 'json_decode', 'json_encode'];
echo "3. Fonctions requises:\n";
foreach ($required_functions as $func) {
    if (function_exists($func)) {
        echo "   $func: ✅\n";
    } else {
        echo "   $func: ❌\n";
    }
}

// Test 4: Variables globales
echo "4. Variables globales:\n";
echo "   REQUEST_METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'Non défini') . "\n";
echo "   REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'Non défini') . "\n";
echo "   Query String: " . ($_SERVER['QUERY_STRING'] ?? 'Vide') . "\n";

// Test 5: Paramètres GET
echo "5. Paramètres GET:\n";
if (!empty($_GET)) {
    foreach ($_GET as $key => $value) {
        echo "   $key = $value\n";
    }
} else {
    echo "   Aucun paramètre GET\n";
}

// Test 6: Test cURL simple
echo "6. Test cURL simple:\n";
if (extension_loaded('curl')) {
    $test_url = 'https://httpbin.org/get';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $test_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Pour test seulement
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($response !== false && $http_code === 200) {
        echo "   Test cURL: ✅ Réussi (HTTP $http_code)\n";
    } else {
        echo "   Test cURL: ❌ Échoué\n";
        echo "   Code HTTP: $http_code\n";
        echo "   Erreur: $error\n";
    }
} else {
    echo "   Test cURL: ❌ Extension non disponible\n";
}

// Test 7: Test API PokéTCG
echo "7. Test API PokéTCG:\n";
if (extension_loaded('curl')) {
    $api_url = 'https://api.pokemontcg.io/v2/sets?pageSize=1';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Test Proxy/1.0');
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($response !== false && $http_code === 200) {
        echo "   API PokéTCG: ✅ Accessible (HTTP $http_code)\n";
        $data = json_decode($response, true);
        if ($data && isset($data['data'])) {
            echo "   Données: " . count($data['data']) . " sets trouvés\n";
        }
    } else {
        echo "   API PokéTCG: ❌ Inaccessible\n";
        echo "   Code HTTP: $http_code\n";
        echo "   Erreur: $error\n";
    }
} else {
    echo "   Test API: ❌ cURL non disponible\n";
}

echo "\n=== FIN DIAGNOSTIC ===\n";
?>