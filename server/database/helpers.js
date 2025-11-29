const db = require('./db');

/**
 * Helper to convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
 * @param {string} query - SQL query with ? placeholders
 * @returns {string} - SQL query with $1, $2, etc. placeholders
 */
const convertQuery = (query) => {
    if (db.type === 'postgres') {
        let paramCount = 1;
        return query.replace(/\?/g, () => `$${paramCount++}`);
    }
    return query;
};

/**
 * Wrapper for db.run that handles both SQLite and PostgreSQL
 * Returns a promise with the result
 */
const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        const convertedQuery = convertQuery(query);

        if (db.type === 'postgres') {
            db.query(convertedQuery, params, (err, result) => {
                if (err) return reject(err);
                resolve({
                    lastID: result.rows[0]?.id,
                    changes: result.rowCount,
                    rows: result.rows
                });
            });
        } else {
            db.run(convertedQuery, params, function (err) {
                if (err) return reject(err);
                resolve({
                    lastID: this.lastID,
                    changes: this.changes
                });
            });
        }
    });
};

/**
 * Wrapper for db.get that returns a promise
 */
const getOne = (query, params = []) => {
    return new Promise((resolve, reject) => {
        const convertedQuery = convertQuery(query);
        db.get(convertedQuery, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

/**
 * Wrapper for db.all that returns a promise
 */
const getAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
        const convertedQuery = convertQuery(query);
        db.all(convertedQuery, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
};

/**
 * For PostgreSQL RETURNING clause
 */
const getReturningClause = () => {
    return db.type === 'postgres' ? 'RETURNING id' : '';
};

module.exports = {
    convertQuery,
    runQuery,
    getOne,
    getAll,
    getReturningClause,
    db
};
