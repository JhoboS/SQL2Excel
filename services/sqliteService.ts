
import initSqlJs from 'sql.js';
import { DBTable, TableData } from '../types';

// Use a CDN for the wasm file
const SQL_WASM_URL = 'https://sql.js.org/dist/sql-wasm.wasm';

let SQL: any = null;

export const initSQLite = async () => {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    locateFile: () => SQL_WASM_URL
  });
  return SQL;
};

export const parseDatabase = async (file: File): Promise<DBTable[]> => {
  const sql = await initSQLite();
  const buffer = await file.arrayBuffer();
  const db = new sql.Database(new Uint8Array(buffer));

  try {
    // Get all tables
    const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (res.length === 0) return [];

    const tables: DBTable[] = [];
    const tableNames = res[0].values.map((v: any) => v[0]);

    for (const name of tableNames) {
      // Get column names
      const colRes = db.exec(`PRAGMA table_info("${name}")`);
      const columns = colRes[0].values.map((v: any) => v[1]);

      // Get row count
      const countRes = db.exec(`SELECT count(*) FROM "${name}"`);
      const rowCount = countRes[0].values[0][0];

      tables.push({ name, rowCount, columns });
    }

    db.close();
    return tables;
  } catch (error) {
    db.close();
    throw error;
  }
};

export const getTableData = async (file: File, tableName: string): Promise<any[]> => {
  const sql = await initSQLite();
  const buffer = await file.arrayBuffer();
  const db = new sql.Database(new Uint8Array(buffer));

  try {
    const res = db.exec(`SELECT * FROM "${tableName}"`);
    if (res.length === 0) return [];

    const columns = res[0].columns;
    const values = res[0].values;

    const data = values.map((row: any) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });

    db.close();
    return data;
  } catch (error) {
    db.close();
    throw error;
  }
};

export const getAllTablesData = async (file: File): Promise<TableData[]> => {
  const tables = await parseDatabase(file);
  const result: TableData[] = [];

  for (const table of tables) {
    const rows = await getTableData(file, table.name);
    result.push({ tableName: table.name, rows });
  }

  return result;
};
