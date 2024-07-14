// this function moves current ESN to Arhieve esn on the server side
const mysql = require('mysql2');

function moveCurrentToArchive(db, callback) {
    const selectSql = 'SELECT serial_number, carrier FROM current_esn';
    const insertSql = 'INSERT INTO archive_esn (serial_number, carrier) SELECT serial_number, carrier FROM current_esn';
    const deleteSql = 'DELETE FROM current_esn';

    db.query(selectSql, (err, rows) => {
        if (err) {
            console.error('Error selecting data from current_esn:', err.stack);
            return callback(err);
        }

        // If there are no rows to move, exit early
        if (rows.length === 0) {
            console.log('No rows to move to archive_esn');
            return callback(null, { affectedRows: 0 });
        }

        db.query(insertSql, (err, result) => {
            if (err) {
                console.error('Error moving data to archive_esn:', err.stack);
                return callback(err);
            }

            console.log('Moved ' + result.affectedRows + ' rows to archive_esn');

            // After successfully inserting into archive_esn, delete from current_esn
            db.query(deleteSql, (err, deleteResult) => {
                if (err) {
                    console.error('Error deleting data from current_esn:', err.stack);
                    return callback(err);
                }

                console.log('Deleted ' + deleteResult.affectedRows + ' rows from current_esn');
                callback(null, result); // Return the result of the insert operation
            });
        });
    });
}

module.exports = moveCurrentToArchive;
