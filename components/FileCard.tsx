
import React, { useState } from 'react';
import { DBFile } from '../types.ts';
import { exportToExcel } from '../services/excelService.ts';
import { getAllTablesData } from '../services/sqliteService.ts';
import { analyzeDatabaseSchema } from '../services/geminiService.ts';

interface Props {
  db: DBFile;
  onRemove: (id: string) => void;
  onUpdate: (db: DBFile) => void;
}

const FileCard: React.FC<Props> = ({ db, onRemove, onUpdate }) => {
  const [exporting, setExporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await getAllTablesData(db.file);
      exportToExcel(data, db.name);
    } catch (err) {
      console.error(err);
      alert("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const summary = await analyzeDatabaseSchema(db);
      onUpdate({ ...db, analysis: summary });
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg leading-tight truncate max-w-[200px] md:max-w-xs" title={db.name}>
              {db.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {(db.size / (1024 * 1024)).toFixed(2)} MB • {db.tables.length} tables
            </p>
          </div>
        </div>
        <button 
          onClick={() => onRemove(db.id)}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tables</div>
        <div className="flex flex-wrap gap-2">
          {db.tables.slice(0, 5).map((t, idx) => (
            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] border border-slate-200">
              {t.name} ({t.rowCount})
            </span>
          ))}
          {db.tables.length > 5 && (
            <span className="text-[10px] text-slate-400 pt-1">+{db.tables.length - 5} more</span>
          )}
        </div>
      </div>

      {db.analysis && (
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-800 border border-indigo-100 relative group">
          <div className="font-bold text-[10px] uppercase text-indigo-400 mb-1">AI 数据库分析</div>
          {db.analysis}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-slate-100 flex gap-3">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {exporting ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <span>{exporting ? '导出中...' : '导出为 Excel'}</span>
        </button>
        {!db.analysis && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="AI 分析数据库"
          >
            {analyzing ? (
              <span className="animate-spin block h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FileCard;
