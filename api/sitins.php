<?php
require 'db.php';

$action = $_GET['action'] ?? '';

// ── GET ALL ──
if ($action === 'getAll') {
    $stmt = $pdo->query('SELECT * FROM sitins ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll());
    exit();
}

// ── GET BY USER ──
if ($action === 'getByUser') {
    $idNumber = $_GET['idNumber'] ?? '';
    $stmt = $pdo->prepare('SELECT * FROM sitins WHERE idNumber = ? ORDER BY created_at DESC');
    $stmt->execute([$idNumber]);
    echo json_encode($stmt->fetchAll());
    exit();
}

// ── ADD ──
if ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare('SELECT sessions FROM users WHERE idNumber = ?');
    $stmt->execute([$data['idNumber']]);
    $user = $stmt->fetch();

    if (!$user || $user['sessions'] <= 0) {
        echo json_encode(['success' => false, 'message' => 'No remaining sessions.']);
        exit();
    }

    $stmt = $pdo->prepare('INSERT INTO sitins (sitId, idNumber, purpose, lab, session, status, timeIn, timeOut, date)
        VALUES (?, ?, ?, ?, ?, "active", ?, NULL, ?)');
    $stmt->execute([
        $data['sitId'],
        $data['idNumber'],
        $data['purpose'],
        $data['lab'],
        $user['sessions'],
        $data['timeIn'],
        $data['date'],
    ]);
    echo json_encode(['success' => true]);
    exit();
}

// ── END SESSION ──
if ($action === 'endSession') {
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare('SELECT idNumber FROM sitins WHERE sitId = ?');
    $stmt->execute([$data['sitId']]);
    $sitin = $stmt->fetch();

    if (!$sitin) {
        echo json_encode(['success' => false, 'message' => 'Sit-in not found.']);
        exit();
    }

    $stmt = $pdo->prepare('UPDATE sitins SET status = "done", timeOut = ? WHERE sitId = ?');
    $stmt->execute([$data['timeOut'], $data['sitId']]);

    $stmt = $pdo->prepare('UPDATE users SET sessions = GREATEST(sessions - 1, 0) WHERE idNumber = ?');
    $stmt->execute([$sitin['idNumber']]);

    $stmt = $pdo->prepare('SELECT sessions FROM users WHERE idNumber = ?');
    $stmt->execute([$sitin['idNumber']]);
    $updated = $stmt->fetch();

    echo json_encode(['success' => true, 'sessions' => $updated['sessions']]);
    exit();
}

// ── CLEAR ALL ──
if ($action === 'clear') {
    $pdo->query('DELETE FROM sitins');
    echo json_encode(['success' => true]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);