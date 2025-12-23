
export interface DBTable {
  name: string;
  rowCount: number;
  columns: string[];
}

export interface DBFile {
  id: string;
  name: string;
  size: number;
  tables: DBTable[];
  file: File;
  status: 'pending' | 'processing' | 'ready' | 'error';
  error?: string;
  analysis?: string;
}

export interface TableData {
  tableName: string;
  rows: any[];
}
