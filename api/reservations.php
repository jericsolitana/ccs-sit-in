<?php
require 'db.php';

$action = $_GET['action'] ?? '';

// ── GET ALL ──
if ($action === 'getAll') {
    $stmt = $pdo->query('SELECT * FROM reservations ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll());
    exit();
}

// ── GET BY USER ──
if ($action === 'getByUser') {
    $idNumber = $_GET['idNumber'] ?? '';
    if (!$idNumber) { echo json_encode([]); exit(); }
    $stmt = $pdo->prepare('SELECT * FROM reservations WHERE idNumber = ? ORDER BY created_at DESC');
    $stmt->execute([$idNumber]);
    echo json_encode($stmt->fetchAll());
    exit();
}

// ── ADD ──
if ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    try {
        $stmt = $pdo->prepare('
            INSERT INTO reservations (resId, idNumber, lab, computer, date, timeIn, purpose, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, "pending")
        ');
        $stmt->execute([
            $data['resId']           ?? '',
            $data['idNumber']        ?? '',
            $data['lab']             ?? '',
            intval($data['computer'] ?? 0),
            $data['date']            ?? '',
            $data['timeIn']          ?? '',
            $data['purpose']         ?? '',
        ]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// ── HANDLE (approve / reject) ──
if ($action === 'handle') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $resId  = $data['resId']  ?? '';
    $status = $data['status'] ?? '';

    $stmt = $pdo->prepare('UPDATE reservations SET status = ? WHERE resId = ?');
    $stmt->execute([$status, $resId]);

    if ($status === 'approved') {
        $stmt2 = $pdo->prepare('SELECT lab, computer FROM reservations WHERE resId = ?');
        $stmt2->execute([$resId]);
        $res = $stmt2->fetch();
        if ($res && $res['computer'] > 0) {
            $stmt3 = $pdo->prepare('
                INSERT INTO computers (lab, seat, status) VALUES (?, ?, "used")
                ON DUPLICATE KEY UPDATE status = "used"
            ');
            $stmt3->execute([$res['lab'], $res['computer']]);
        }
    }

    echo json_encode(['success' => true]);
    exit();
}

// ── DELETE ──
if ($action === 'delete') {
    $data  = json_decode(file_get_contents('php://input'), true);
    $resId = $data['resId'] ?? '';
    if (!$resId) { echo json_encode(['success' => false, 'message' => 'Missing resId.']); exit(); }
    $stmt = $pdo->prepare('DELETE FROM reservations WHERE resId = ?');
    $stmt->execute([$resId]);
    echo json_encode(['success' => true]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);