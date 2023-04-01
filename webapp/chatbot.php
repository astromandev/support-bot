<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $query = $_POST["query"];

    // Replace this with your API URL and API key
    $apiUrl = "https://yourdomain.com/api.php";
    $apiKey = "your_api_key";

    $url = $apiUrl . "?key=" . $apiKey . "&query=" . urlencode($query);
    $response = file_get_contents($url);
    $result = json_decode($response, true);

    if ($result["success"]) {
        echo "<h2>Closest match:</h2>";
        echo "<pre>" . htmlentities($result["error"]) . "</pre>";
        echo "<h2>Solution:</h2>";
        echo "<pre>" . htmlentities($result["solution"]) . "</pre>";
    } else {
        echo "<p>Error: " . htmlentities($result["message"]) . "</p>";
    }
}
?>
