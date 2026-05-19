<?php
require 'db.php';

$action = $_GET['action'] ?? '';

// ── GET ALL ──
if ($action === 'getAll') {
    $stmt = $pdo->query('SELECT * FROM softwares ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll());
    exit();
}

// ── ADD ──
if ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    $labs = is_array($data['labs']) ? implode(',', $data['labs']) : ($data['labs'] ?? '');
    $stmt = $pdo->prepare('INSERT INTO softwares (name, category, description, labs, date) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
        trim($data['name']        ?? ''),
        trim($data['category']    ?? ''),
        trim($data['description'] ?? ''),
        $labs,
        $data['date'] ?? '',
    ]);
    $newId = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'id' => $newId]);
    exit();
}

// ── DELETE ──
if ($action === 'delete') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('DELETE FROM softwares WHERE id = ?');
    $stmt->execute([intval($data['id'])]);
    echo json_encode(['success' => true]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);