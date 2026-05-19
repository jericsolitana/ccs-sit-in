<?php
require 'db.php';

$action = $_GET['action'] ?? '';

// ── GET ALL ──
if ($action === 'getAll') {
    $stmt = $pdo->query('SELECT * FROM feedbacks ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll());
    exit();
}

// ── ADD ──
if ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO feedbacks (idNumber, sitId, lab, message, date) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
        $data['idNumber'] ?? '',
        $data['sitId']    ?? '',
        $data['lab']      ?? '',
        $data['message']  ?? '',
        $data['date']     ?? '',
    ]);
    echo json_encode(['success' => true]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);