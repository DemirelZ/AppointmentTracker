import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'AppointmentDB',
    location: 'default',
  },
  () => {},
  error => {
    console.log('Database Error: ', error);
  },
);

// Tabloları oluşturma
export const createTables = () => {
  // Kişiler tablosu
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
      [],
      () => {
        console.log('Contacts table created successfully');
      },
      (_, error) => {
        console.log('Error creating contacts table:', error);
      },
    );
  });

  // Randevular tablosu
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contact_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                date DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (contact_id) REFERENCES contacts (id)
            )`,
      [],
      () => {
        console.log('Appointments table created successfully');
      },
      (_, error) => {
        console.log('Error creating appointments table:', error);
      },
    );
  });
};

// Kişi ekleme
export const addContact = (name, phone, email) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
        [name, phone, email],
        (_, result) => {
          resolve(result.insertId);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Kişi güncelleme
export const updateContact = (id, name, phone, email) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
        [name, phone, email, id],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Kişi silme
export const deleteContact = id => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM contacts WHERE id = ?',
        [id],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Randevu ekleme
export const addAppointment = (contactId, title, description, date) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO appointments (contact_id, title, description, date) VALUES (?, ?, ?, ?)',
        [contactId, title, description, date],
        (_, result) => {
          resolve(result.insertId);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Randevu güncelleme
export const updateAppointment = (id, contactId, title, description, date) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE appointments SET contact_id = ?, title = ?, description = ?, date = ? WHERE id = ?',
        [contactId, title, description, date, id],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Randevu silme
export const deleteAppointment = id => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM appointments WHERE id = ?',
        [id],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Tüm kişileri getirme
export const getAllContacts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM contacts ORDER BY created_at DESC, id DESC',
        [],
        (_, result) => {
          resolve(result.rows.raw());
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Tüm randevuları getirme
export const getAllAppointments = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT appointments.*, contacts.name as contact_name 
                 FROM appointments 
                 LEFT JOIN contacts ON appointments.contact_id = contacts.id 
                 ORDER BY appointments.created_at DESC, appointments.id DESC`,
        [],
        (_, result) => {
          resolve(result.rows.raw());
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Belirli bir tarih aralığındaki randevuları getirme
export const getAppointmentsByDateRange = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    // Başlangıç tarihinin başlangıcı (00:00:00)
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    // Bitiş tarihinin sonu (23:59:59)
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    db.transaction(tx => {
      tx.executeSql(
        `SELECT appointments.*, contacts.name as contact_name 
                 FROM appointments 
                 LEFT JOIN contacts ON appointments.contact_id = contacts.id 
                 WHERE date >= ? AND date <= ?
                 ORDER BY date ASC, appointments.created_at DESC`,
        [start.toISOString(), end.toISOString()],
        (_, result) => {
          resolve(result.rows.raw());
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Bugünün randevu sayısını getirme
export const getTodayAppointmentsCount = () => {
  return new Promise((resolve, reject) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM appointments WHERE date >= ? AND date < ?',
        [today.toISOString(), tomorrow.toISOString()],
        (_, result) => {
          resolve(result.rows.raw()[0].count);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Bu haftanın randevu sayısını getirme
export const getWeekAppointmentsCount = () => {
  return new Promise((resolve, reject) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM appointments WHERE date >= ? AND date < ?',
        [weekStart.toISOString(), weekEnd.toISOString()],
        (_, result) => {
          resolve(result.rows.raw()[0].count);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

// Bu ayın randevu sayısını getirme
export const getMonthAppointmentsCount = () => {
  return new Promise((resolve, reject) => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM appointments WHERE date >= ? AND date <= ?',
        [monthStart.toISOString(), monthEnd.toISOString()],
        (_, result) => {
          resolve(result.rows.raw()[0].count);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

export default db;
