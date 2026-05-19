<?php
require 'db.php';

$action = $_GET['action'] ?? '';

// ── LOGIN ──
if ($action === 'login') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $idNumber = trim($data['idNumber'] ?? '');
    $password = trim($data['password'] ?? '');

    $stmt = $pdo->prepare('SELECT * FROM users WHERE idNumber = ?');
    $stmt->execute([$idNumber]);
    $user = $stmt->fetch();

    if ($user && $user['password'] === $password) {
        unset($user['password']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid ID or password.']);
    }
    exit();
}

// ── REGISTER ──
if ($action === 'register') {
    $data = json_decode(file_get_contents('php://input'), true);
    try {
        $stmt = $pdo->prepare('INSERT INTO users 
            (idNumber, lastName, firstName, middleName, course, yearLevel, email, address, password, sessions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 30)');
        $stmt->execute([
            trim($data['idNumber']   ?? ''),
            trim($data['lastName']   ?? ''),
            trim($data['firstName']  ?? ''),
            trim($data['middleName'] ?? ''),
            trim($data['course']     ?? ''),
            trim($data['yearLevel']  ?? ''),
            trim($data['email']      ?? ''),
            trim($data['address']    ?? ''),
            $data['password']        ?? '',
        ]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => false, 'message' => 'This ID number is already registered.']);
        } else {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    exit();
}

// ── GET ALL ──
if ($action === 'getAll') {
    $stmt = $pdo->query('SELECT id, idNumber, lastName, firstName, middleName, course, yearLevel, email, address, username, sessions, created_at FROM users ORDER BY lastName ASC');
    echo json_encode($stmt->fetchAll());
    exit();
}

// ── GET ONE ──
if ($action === 'getOne') {
    $idNumber = $_GET['idNumber'] ?? '';
    $stmt = $pdo->prepare('SELECT id, idNumber, lastName, firstName, middleName, course, yearLevel, email, address, username, sessions FROM users WHERE idNumber = ?');
    $stmt->execute([$idNumber]);
    $user = $stmt->fetch();
    echo json_encode($user ?: ['success' => false]);
    exit();
}

// ── UPDATE PROFILE ──
if ($action === 'update') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $fields = ['lastName','firstName','middleName','course','yearLevel','email','address','username'];
    $params = array_map(fn($f) => trim($data[$f] ?? ''), $fields);

    if (!empty($data['password'])) {
        $stmt = $pdo->prepare('UPDATE users SET lastName=?, firstName=?, middleName=?, course=?, yearLevel=?, email=?, address=?, username=?, password=? WHERE idNumber=?');
        $params[] = $data['password'];
    } else {
        $stmt = $pdo->prepare('UPDATE users SET lastName=?, firstName=?, middleName=?, course=?, yearLevel=?, email=?, address=?, username=? WHERE idNumber=?');
    }
    $params[] = $data['idNumber'];
    $stmt->execute($params);

    $stmt2 = $pdo->prepare('SELECT id, idNumber, lastName, firstName, middleName, course, yearLevel, email, address, username, sessions FROM users WHERE idNumber = ?');
    $stmt2->execute([$data['idNumber']]);
    echo json_encode(['success' => true, 'user' => $stmt2->fetch()]);
    exit();
}

// ── ADMIN EDIT ──
if ($action === 'adminEdit') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE users SET lastName=?, firstName=?, middleName=?, course=?, yearLevel=?, email=?, address=?, sessions=? WHERE idNumber=?');
    $stmt->execute([
        trim($data['lastName']   ?? ''),
        trim($data['firstName']  ?? ''),
        trim($data['middleName'] ?? ''),
        trim($data['course']     ?? ''),
        trim($data['yearLevel']  ?? ''),
        trim($data['email']      ?? ''),
        trim($data['address']    ?? ''),
        intval($data['sessions'] ?? 30),
        $data['idNumber'],
    ]);
    echo json_encode(['success' => true]);
    exit();
}

// ── ADD (admin) ──
if ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    try {
        $stmt = $pdo->prepare('INSERT INTO users 
            (idNumber, lastName, firstName, middleName, course, yearLevel, email, address, password, sessions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 30)');
        $stmt->execute([
            trim($data['idNumber']   ?? ''),
            trim($data['lastName']   ?? ''),
            trim($data['firstName']  ?? ''),
            trim($data['middleName'] ?? ''),
            trim($data['course']     ?? ''),
            trim($data['yearLevel']  ?? ''),
            trim($data['email']      ?? ''),
            trim($data['address']    ?? ''),
            $data['password']        ?? '',
        ]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'ID already registered.']);
    }
    exit();
}

// ── DELETE ──
if ($action === 'delete') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('DELETE FROM users WHERE idNumber = ?');
    $stmt->execute([$data['idNumber']]);
    echo json_encode(['success' => true]);
    exit();
}

// ── RESET ONE ──
if ($action === 'resetOne') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE users SET sessions = 30 WHERE idNumber = ?');
    $stmt->execute([$data['idNumber']]);
    echo json_encode(['success' => true]);
    exit();
}

// ── RESET ALL ──
if ($action === 'resetAll') {
    $pdo->query('UPDATE users SET sessions = 30');
    echo json_encode(['success' => true]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);