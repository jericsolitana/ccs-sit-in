<?php
require 'db.php';

$action = $_GET['action'] ?? '';

// ── GET ALL ──
if ($action === 'getAll') {
    $stmt = $pdo->query('SELECT * FROM announcements ORDER BY created_at ASC');
    echo json_encode($stmt->fetchAll());
    exit();
}

// ── ADD ──
if ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO announcements (text, date) VALUES (?, ?)');
    $stmt->execute([trim($data['text'] ?? ''), $data['date'] ?? '']);
    $newId = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'id' => $newId]);
    exit();
}

// ── DELETE ──
if ($action === 'delete') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('DELETE FROM announcements WHERE id = ?');
    $stmt->execute([intval($data['id'])]);
    echo json_encode(['success' => true]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);