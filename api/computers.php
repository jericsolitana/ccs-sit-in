<?php
require 'db.php';

$action = $_GET['action'] ?? '';

// ── GET BY LAB ──
if ($action === 'getByLab') {
    $lab  = $_GET['lab'] ?? '';
    $stmt = $pdo->prepare('SELECT seat, status FROM computers WHERE lab = ?');
    $stmt->execute([$lab]);
    $rows = $stmt->fetchAll();
    $map  = [];
    foreach ($rows as $r) { $map[$r['seat']] = $r['status']; }
    echo json_encode($map);
    exit();
}

// ── SET STATUS ──
if ($action === 'setStatus') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO computers (lab, seat, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?');
    $stmt->execute([$data['lab'], intval($data['seat']), $data['status'], $data['status']]);
    echo json_encode(['success' => true]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);