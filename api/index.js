const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

// Создаем экземпляр Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к базе данных
// Используем переменную окружения для пути к БД, если она задана
const dbFileToUse = process.env.DATABASE_PATH || path.join(__dirname, 'furnitrack.db');
console.log(`[DB Connection] Attempting to connect to database at: ${dbFileToUse}`);

const db = new sqlite3.Database(dbFileToUse, (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err.message, 'По пути:', dbFileToUse);
  } else {
    console.log('Подключение к базе данных SQLite установлено');
    createTables();
  }
});

// Создание таблиц в базе данных
function createTables() {
  db.serialize(() => {
    // Таблица сотрудников
    db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        position TEXT,
        rate REAL,
        hireDate TEXT,
        contactInfo TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT
      )
    `);

    // Таблица объектов (локаций)
    db.run(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        contactPerson TEXT,
        contactInfo TEXT,
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT
      )
    `);

    // Таблица записей о сборке
    db.run(`
      CREATE TABLE IF NOT EXISTS assembly_records (
        id TEXT PRIMARY KEY,
        employeeId TEXT NOT NULL,
        locationId TEXT,
        date TEXT NOT NULL,
        items TEXT,
        notes TEXT,
        quantity INTEGER,
        totalPrice REAL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT,
        FOREIGN KEY (employeeId) REFERENCES employees (id),
        FOREIGN KEY (locationId) REFERENCES locations (id)
      )
    `);

    // Таблица настроек приложения
    db.run(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        companyName TEXT DEFAULT 'Моя Компания',
        defaultPercentage REAL DEFAULT 0
      )
    `);
    // Убедимся, что строка с настройками существует
    db.run(`INSERT OR IGNORE INTO app_settings (id) VALUES (1)`);
  });
}

// Маршруты API

// Получение списка сотрудников
app.get('/api/employees', (req, res) => {
  console.log('GET /api/employees - Получение списка сотрудников');
  db.all('SELECT * FROM employees', [], (err, rows) => {
    if (err) {
      console.error('Ошибка при получении сотрудников:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Получено сотрудников:', rows.length);
    res.json(rows);
  });
});

// Добавление нового сотрудника
app.post('/api/employees', (req, res) => {
  console.log('POST /api/employees - Добавление сотрудника:', req.body);
  const { id, name, position, rate, hireDate, contactInfo } = req.body;
  const currentTime = new Date().toISOString();
  const newEmployee = { id, name, position, rate, hireDate, contactInfo, createdAt: currentTime, updatedAt: currentTime }; 

  db.run(
    'INSERT INTO employees (id, name, position, rate, hireDate, contactInfo, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, position, rate, hireDate, contactInfo, currentTime],
    function(err) {
      if (err) {
        console.error('Ошибка при добавлении сотрудника:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log('Сотрудник добавлен, id:', id);
      res.status(201).json(newEmployee);
    }
  );
});

// Обновление данных сотрудника
app.put('/api/employees/:id', (req, res) => {
  console.log(`PUT /api/employees/${req.params.id} - Обновление сотрудника:`, req.body);
  const { name, position, rate, hireDate, contactInfo } = req.body;
  const employeeId = req.params.id;
  const currentTime = new Date().toISOString();
  const updatedEmployeeData = { id: employeeId, name, position, rate, hireDate, contactInfo, updatedAt: currentTime }; 

  db.run(
    'UPDATE employees SET name = ?, position = ?, rate = ?, hireDate = ?, contactInfo = ?, updatedAt = ? WHERE id = ?',
    [name, position, rate, hireDate, contactInfo, currentTime, employeeId],
    function(err) {
      if (err) {
        console.error('Ошибка при обновлении сотрудника:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Сотрудник не найден' });
      }
      console.log('Сотрудник обновлен, id:', employeeId);
      res.json(updatedEmployeeData); 
    }
  );
});

// Удаление сотрудника
app.delete('/api/employees/:id', (req, res) => {
  console.log(`DELETE /api/employees/${req.params.id} - Удаление сотрудника`);
  db.run('DELETE FROM employees WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Ошибка при удалении сотрудника:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Сотрудник удален, id:', req.params.id);
    res.json({ message: 'Сотрудник удален' });
  });
});

// Получение списка объектов (локаций)
app.get('/api/locations', (req, res) => {
  console.log('GET /api/locations - Получение списка объектов');
  db.all('SELECT * FROM locations', [], (err, rows) => {
    if (err) {
      console.error('Ошибка при получении объектов:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Получено объектов:', rows.length);
    res.json(rows);
  });
});

// Добавление нового объекта
app.post('/api/locations', (req, res) => {
  console.log('POST /api/locations - Добавление объекта:', req.body);
  const { id, name, address, contactPerson, contactInfo, notes } = req.body;
  const currentTime = new Date().toISOString();
  const newLocation = { id, name, address, contactPerson, contactInfo, notes, createdAt: currentTime, updatedAt: currentTime }; 
  
  db.run(
    'INSERT INTO locations (id, name, address, contactPerson, contactInfo, notes, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, address, contactPerson, contactInfo, notes, currentTime],
    function(err) {
      if (err) {
        console.error('Ошибка при добавлении объекта:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log('Объект добавлен, id:', id);
      res.status(201).json(newLocation);
    }
  );
});

// Обновление данных объекта
app.put('/api/locations/:id', (req, res) => {
  console.log(`PUT /api/locations/${req.params.id} - Обновление объекта:`, req.body);
  const { name, address, contactPerson, contactInfo, notes } = req.body;
  const locationId = req.params.id;
  const currentTime = new Date().toISOString();
  const updatedLocationData = { id: locationId, name, address, contactPerson, contactInfo, notes, updatedAt: currentTime }; 
  
  db.run(
    'UPDATE locations SET name = ?, address = ?, contactPerson = ?, contactInfo = ?, notes = ?, updatedAt = ? WHERE id = ?',
    [name, address, contactPerson, contactInfo, notes, currentTime, locationId],
    function(err) {
      if (err) {
        console.error('Ошибка при обновлении объекта:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Объект не найден' });
      }
      console.log('Объект обновлен, id:', locationId);
      res.json(updatedLocationData); 
    }
  );
});

// Удаление объекта
app.delete('/api/locations/:id', (req, res) => {
  console.log(`DELETE /api/locations/${req.params.id} - Удаление объекта`);
  db.run('DELETE FROM locations WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Ошибка при удалении объекта:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Объект удален, id:', req.params.id);
    res.json({ message: 'Объект удален' });
  });
});

// Получение записей о сборке
app.get('/api/assembly-records', (req, res) => {
  console.log('GET /api/assembly-records - Получение записей о сборке');
  db.all('SELECT * FROM assembly_records', [], (err, rows) => {
    if (err) {
      console.error('Ошибка при получении записей о сборке:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    const recordsWithItems = rows.map(record => ({
      ...record,
      items: record.items ? JSON.parse(record.items) : []
    }));
    console.log('Получено записей о сборке:', recordsWithItems.length);
    res.json(recordsWithItems);
  });
});

// Добавление новой записи о сборке
app.post('/api/assembly-records', (req, res) => {
  console.log('POST /api/assembly-records - Добавление записи о сборке:', req.body);
  let { id, employeeId, locationId, date, items, notes, totalPrice } = req.body;
  const currentTime = new Date().toISOString();
  
  const itemsArray = Array.isArray(items) ? items : [];
  const itemsJson = JSON.stringify(itemsArray); 
  const calculatedQuantity = itemsArray.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const newRecord = { id, employeeId, locationId, date, items: itemsArray, notes, quantity: calculatedQuantity, totalPrice, createdAt: currentTime, updatedAt: currentTime };

  db.run(
    'INSERT INTO assembly_records (id, employeeId, locationId, date, items, notes, quantity, totalPrice, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, employeeId, locationId, date, itemsJson, notes, calculatedQuantity, totalPrice, currentTime],
    function(err) {
      if (err) {
        console.error('Ошибка при добавлении записи о сборке:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log('Запись о сборке добавлена, id:', id);
      res.status(201).json(newRecord);
    }
  );
});

// Массовое добавление записей о сборке
app.post('/api/assembly-records/batch', (req, res) => {
  console.log('POST /api/assembly-records/batch - Массовое добавление записей:', req.body.length);
  const records = req.body;
  const createdRecords = [];
  const currentTime = new Date().toISOString();
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    const stmt = db.prepare('INSERT INTO assembly_records (id, employeeId, locationId, date, items, notes, quantity, totalPrice, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    
    records.forEach(record => {
      const itemsArray = Array.isArray(record.items) ? record.items : [];
      const itemsJson = JSON.stringify(itemsArray);
      const calculatedQuantity = itemsArray.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      
      stmt.run(record.id, record.employeeId, record.locationId, record.date, itemsJson, record.notes, calculatedQuantity, record.totalPrice, currentTime);
      createdRecords.push({ ...record, items: itemsArray, quantity: calculatedQuantity, createdAt: currentTime, updatedAt: currentTime });
    });
    
    stmt.finalize((err) => {
      if (err) {
        db.run('ROLLBACK');
        console.error('Ошибка при массовом добавлении записей (финализация): ', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      db.run('COMMIT', (commitErr) => {
        if (commitErr) {
          console.error('Ошибка при коммите транзакции:', commitErr.message);
          res.status(500).json({ error: commitErr.message });
          return;
        }
        console.log(`Добавлено ${records.length} записей о сборке`);
        res.status(201).json(createdRecords);
      });
    });
  });
});

// Обновление записи о сборке
app.put('/api/assembly-records/:id', (req, res) => {
  const recordId = req.params.id;
  console.log(`PUT /api/assembly-records/${recordId} - Обновление записи:`, req.body);
  let { employeeId, locationId, date, items, notes, totalPrice } = req.body;
  const currentTime = new Date().toISOString();

  const itemsArray = Array.isArray(items) ? items : [];
  const itemsJson = JSON.stringify(itemsArray);
  const calculatedQuantity = itemsArray.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const updatedRecordData = { id: recordId, employeeId, locationId, date, items: itemsArray, notes, quantity: calculatedQuantity, totalPrice, updatedAt: currentTime };

  db.run(
    'UPDATE assembly_records SET employeeId = ?, locationId = ?, date = ?, items = ?, notes = ?, quantity = ?, totalPrice = ?, updatedAt = ? WHERE id = ?',
    [employeeId, locationId, date, itemsJson, notes, calculatedQuantity, totalPrice, currentTime, recordId],
    function(err) {
      if (err) {
        console.error('Ошибка при обновлении записи о сборке:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Запись о сборке не найдена' });
      }
      console.log('Запись о сборке обновлена, id:', recordId);
      res.json(updatedRecordData);
    }
  );
});

// Удаление записи о сборке
app.delete('/api/assembly-records/:id', (req, res) => {
  console.log(`DELETE /api/assembly-records/${req.params.id} - Удаление записи о сборке`);
  db.run('DELETE FROM assembly_records WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Ошибка при удалении записи о сборке:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Запись о сборке удалена, id:', req.params.id);
    res.json({ message: 'Запись о сборке удалена' });
  });
});

// --- Настройки Приложения ---

// Получение настроек приложения
app.get('/api/settings', (req, res) => {
  console.log('GET /api/settings - Получение настроек приложения');
  db.get('SELECT companyName, defaultPercentage FROM app_settings WHERE id = 1', [], (err, row) => {
    if (err) {
      console.error('Ошибка при получении настроек приложения:', err.message);
      // Если произошла ошибка, но это не "no such table" (таблица еще не создана), вернем ошибку
      // Если таблица не создана, createTables должна была это исправить при запуске,
      // но на всякий случай, если запрос пришел до полного создания.
      // Однако, с INSERT OR IGNORE выше, строка должна существовать.
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json(row);
    } else {
      // Этого не должно произойти из-за INSERT OR IGNORE, но как fallback
      console.warn('/api/settings: Строка настроек не найдена, возвращаем дефолтные значения.');
      res.json({ companyName: 'Моя Компания', defaultPercentage: 0 });
    }
  });
});

// Обновление настроек приложения
app.put('/api/settings', (req, res) => {
  console.log('PUT /api/settings - Обновление настроек приложения:', req.body);
  const { companyName, defaultPercentage } = req.body;

  if (typeof companyName !== 'string' || companyName.trim() === '') {
    return res.status(400).json({ error: 'Название компании не может быть пустым.' });
  }
  if (typeof defaultPercentage !== 'number' || isNaN(defaultPercentage) || defaultPercentage < 0 || defaultPercentage > 100) {
    return res.status(400).json({ error: 'Процент должен быть числом от 0 до 100.' });
  }

  db.run(
    'UPDATE app_settings SET companyName = ?, defaultPercentage = ? WHERE id = 1',
    [companyName.trim(), defaultPercentage],
    function(err) {
      if (err) {
        console.error('Ошибка при обновлении настроек приложения:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        // Этого не должно случиться, если строка с id=1 всегда существует
        console.error('/api/settings: Попытка обновить несуществующую строку настроек (id=1).');
        return res.status(404).json({ error: 'Строка настроек не найдена для обновления.' });
      }
      console.log('Настройки приложения обновлены.');
      // Возвращаем обновленные настройки
      // SQLite не возвращает обновленную строку в UPDATE, поэтому сделаем GET
      db.get('SELECT companyName, defaultPercentage FROM app_settings WHERE id = 1', [], (getErr, updatedRow) => {
        if (getErr) {
          return res.status(500).json({ error: getErr.message });
        }
        res.json(updatedRow);
      });
    }
  );
});

// Обслуживание статических файлов React-приложения
// Предполагается, что папка 'dist' находится в корне проекта, на один уровень выше 'api'
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Новый, более безопасный SPA fallback
app.get(/^(?!\/api\/).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// Обработка завершения работы приложения
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Соединение с базой данных закрыто');
    process.exit(0);
  });
}); 