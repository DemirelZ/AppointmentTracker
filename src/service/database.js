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

// export const createTables = () => {
//   // Kişiler tablosu
//   db.transaction(tx => {
//     tx.executeSql(
//       `CREATE TABLE IF NOT EXISTS contacts (
//                 id INTEGER PRIMARY KEY AUTOINCREMENT,
//                 name TEXT NOT NULL,
//                 phone TEXT,
//                 email TEXT,
//                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//             )`,
//       [],
//       () => {
//         console.log('Contacts table created successfully');
//       },
//       (_, error) => {
//         console.log('Error creating contacts table:', error);
//       },
//     );
//   });

//   // Randevular tablosu
//   db.transaction(tx => {
//     tx.executeSql(
//       `CREATE TABLE IF NOT EXISTS appointments (
//                 id INTEGER PRIMARY KEY AUTOINCREMENT,
//                 contact_id INTEGER,
//                 title TEXT NOT NULL,
//                 description TEXT,
//                 date DATETIME NOT NULL,
//                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//                 FOREIGN KEY (contact_id) REFERENCES contacts (id)
//             )`,
//       [],
//       () => {
//         console.log('Appointments table created successfully');
//       },
//       (_, error) => {
//         console.log('Error creating appointments table:', error);
//       },
//     );
//   });
// };

export const initTables = () => {
  return new Promise((resolve, reject) => {
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
          console.log('✅ Contacts table created successfully');
        },
        (_, error) => {
          console.error('❌ Error creating contacts table:', error);
          reject(error);
        },
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            date DATETIME NOT NULL,
            payment_status TEXT DEFAULT 'Pending',  
            payment_status_description TEXT, 
            completed INTEGER DEFAULT 0, -- Yeni eklenen sütun (0: Not Completed, 1: Completed)
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts (id)
)`,
        [],
        () => {
          console.log('✅ Appointments table created successfully');
          resolve();
        },
        (_, error) => {
          console.error('❌ Error creating appointments table:', error);
          reject(error);
        },
      );
    });
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

//Randevu ekleme
export const addAppointment = (
  contactId,
  title,
  description,
  date,
  paymentStatus = 'Pending',
  paymentStatusDescription = null,
) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO appointments (contact_id, title, description, date, payment_status, payment_status_description) VALUES (?, ?, ?, ?, ?, ?)',
        [
          contactId,
          title,
          description,
          date,
          paymentStatus,
          paymentStatusDescription,
        ],
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
export const updateAppointment = (
  id,
  contactId,
  title,
  description,
  date,
  paymentStatus,
  paymentStatusDescription,
) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE appointments SET contact_id = ?, title = ?, description = ?, date = ?, payment_status = ?, payment_status_description = ? WHERE id = ?',
        [
          contactId,
          title,
          description,
          date,
          paymentStatus,
          paymentStatusDescription,
          id,
        ],
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

//Bu fonksiyon, seçilen kişinin id değerine göre geçmiş ve gelecek randevuları alır.
export const fetchAppointmentsByContactId = contactId => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM appointments WHERE contact_id = ? ORDER BY date ASC`,
        [contactId],
        (_, result) => {
          let appointments = [];
          for (let i = 0; i < result.rows.length; i++) {
            appointments.push(result.rows.item(i));
          }
          resolve(appointments);
        },
        (_, error) => {
          console.error('❌ Error fetching appointments:', error);
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

// Gelecekteki randevuları getirme
export const getUpcomingAppointments = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT appointments.*, contacts.name as contact_name 
         FROM appointments 
         LEFT JOIN contacts ON appointments.contact_id = contacts.id 
         WHERE datetime(appointments.date) >= datetime('now')
         ORDER BY datetime(appointments.date) ASC`,
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

// Geçmiş randevuları getirme
export const getPastAppointments = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT appointments.*, contacts.name as contact_name 
         FROM appointments 
         LEFT JOIN contacts ON appointments.contact_id = contacts.id 
         WHERE datetime(appointments.date) < datetime('now')
         ORDER BY datetime(appointments.date) DESC`,
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

// Tüm Geçmiş randevuları silme
export const deletePastAppointments = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM appointments WHERE datetime(date) < datetime('now')`,
        [],
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

export const UpdateAppointmentCompleteStatus = (appointmentId, checked) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE appointments SET completed = ? WHERE id = ?`,
        [checked ? 1 : 0, appointmentId],
        (_, result) => {
          console.log('✅ Appointment status updated successfully');
          resolve(result);
        },
        (_, error) => {
          console.error('❌ Error updating appointment status:', error);
          reject(error);
        },
      );
    });
  });
};

// export const getAppointmentsByDateRange = (startDate, endDate) => {
//   return new Promise((resolve, reject) => {
//     // Başlangıç tarihinin başlangıcı (00:00:00)
//     const start = new Date(startDate);
//     start.setHours(0, 0, 0, 0);

//     // Bitiş tarihinin sonu (23:59:59)
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);

//     db.transaction(tx => {
//       tx.executeSql(
//         `SELECT appointments.*, contacts.name as contact_name
//                  FROM appointments
//                  LEFT JOIN contacts ON appointments.contact_id = contacts.id
//                  WHERE date >= ? AND date <= ?
//                  ORDER BY date ASC, appointments.created_at DESC`,
//         [start.toISOString(), end.toISOString()],
//         (_, result) => {
//           resolve(result.rows.raw());
//         },
//         (_, error) => {
//           reject(error);
//         },
//       );
//     });
//   });
// };

// Belirli bir tarih aralığındaki randevuları getirme Bu ikincisiydi
// export const getAppointmentsByDateRange = async (startDate, endDate) => {
//   return new Promise((resolve, reject) => {
//     const start = new Date(startDate);
//     start.setHours(0, 0, 0, 0);
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);

//     console.log(
//       '📅 SQL Query Tarih Aralığı:',
//       start.toISOString(),
//       end.toISOString(),
//     );

//     db.transaction(tx => {
//       tx.executeSql(
//         `SELECT appointments.*, contacts.name as contact_name
//          FROM appointments
//          LEFT JOIN contacts ON appointments.contact_id = contacts.id
//          WHERE date >= ? AND date <= ?
//          ORDER BY date ASC, appointments.created_at DESC`,
//         [start.toISOString(), end.toISOString()],
//         (_, result) => {
//           console.log('✅ SQL Sorgu Başarılı:', result.rows.raw());
//           resolve(result.rows.raw());
//         },
//         (_, error) => {
//           console.error('❌ SQL Hatası:', error);
//           reject(
//             new Error('SQL sorgusu başarısız oldu: ' + JSON.stringify(error)),
//           );
//         },
//       );
//     });
//   });
// };

//Belirli bir tarih aralığındaki randevuları getirme
export const getAppointmentsByDateRange = async (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    console.log(
      '📅 SQL Query Tarih Aralığı:',
      start.toISOString(),
      end.toISOString(),
    );

    db.transaction(tx => {
      // 🛠️ Appointments tablosunun var olup olmadığını kontrol et ve yoksa oluştur
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            date DATETIME NOT NULL,
            payment_status TEXT DEFAULT 'Pending',
            payment_status_description TEXT,
            completed INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts (id)
        )`,
        [],
        () =>
          console.log('✅ Appointments tablosu kontrol edildi / oluşturuldu'),
        (_, error) =>
          console.error('❌ Appointments tablo oluşturma hatası:', error),
      );

      // 📊 Appointment tablosundaki veri sayısını kontrol et
      tx.executeSql(
        'SELECT COUNT(*) as count FROM appointments',
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            const count = result.rows.item(0).count;
            console.log('📊 Tablodaki Randevu Sayısı:', count);

            if (count === 0) {
              //console.warn('⚠️ Hiç randevu bulunamadı.');
              resolve([]); // Eğer randevu yoksa boş bir dizi döndür
              return;
            }

            // Eğer randevu varsa, verileri sorgula
            tx.executeSql(
              `SELECT appointments.*,
                      contacts.name AS contact_name,
                      contacts.phone AS contact_phone
               FROM appointments
               LEFT JOIN contacts ON appointments.contact_id = contacts.id
               WHERE date >= ? AND date <= ?
               ORDER BY date ASC, appointments.created_at DESC`,
              [start.toISOString(), end.toISOString()],
              (_, result) => {
                console.log('✅ SQL Sorgu Başarılı:', result.rows.raw());
                resolve(result.rows.raw());
              },
              (_, error) => {
                console.error('❌ SQL Hatası:', error);
                reject(
                  new Error(
                    'SQL sorgusu başarısız oldu: ' + JSON.stringify(error),
                  ),
                );
              },
            );
          }
        },
        (_, error) => {
          console.error('❌ SQL Hatası:', error);
          reject(
            new Error('Veri sayısı sorgulama hatası: ' + JSON.stringify(error)),
          );
        },
      );
    });
  });
};

// Bugüne ait kaç randevu var
export const getTodayAppointmentsCount = () => {
  return new Promise((resolve, reject) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Saatleri sıfırla

    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM appointments WHERE datetime(date) >= datetime(?) AND datetime(date) < datetime(?)',
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

    // Haftanın başlangıcı (Pazartesi günü olacak şekilde hesaplanıyor)
    const weekStart = new Date(today);
    weekStart.setDate(
      weekStart.getDate() -
        (weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1),
    );

    // Haftanın son günü (Pazar günü, 23:59:59.999)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM appointments WHERE datetime(date) >= datetime(?) AND datetime(date) <= datetime(?)',
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

    // Ayın başlangıcı (1. gün, 00:00:00)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    // Ayın son günü (23:59:59.999)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM appointments WHERE datetime(date) >= datetime(?) AND datetime(date) <= datetime(?)',
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
