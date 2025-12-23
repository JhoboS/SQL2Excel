
import * as XLSX from 'xlsx';
import { TableData } from '../types';

export const exportToExcel = (data: TableData[], fileName: string) => {
  const workbook = XLSX.utils.book_new();

  data.forEach((table) => {
    const worksheet = XLSX.utils.json_to_sheet(table.rows);
    // Sheet name must be < 31 chars and no special chars
    const safeName = table.tableName.substring(0, 31).replace(/[\/\?\*\[\]]/g, '');
    XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
  });

  const baseName = fileName.replace(/\.[^/.]+$/, "");
  XLSX.writeFile(workbook, `${baseName}.xlsx`);
};
