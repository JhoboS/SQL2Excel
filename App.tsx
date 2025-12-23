
import React, { useState, useCallback } from 'react';
import { DBFile } from './types';
import { parseDatabase } from './services/sqliteService';
import FileCard from './components/FileCard';

const App: React.FC = () => {
  const [files, setFiles] = useState<DBFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const processFiles = async (inputFiles: FileList | null) => {
    if (!inputFiles) return;
    setIsLoading(true);

    const newFiles: DBFile[] = [];
    for (const file of Array.from(inputFiles)) {
      if (!file.name.endsWith('.db') && !file.name.endsWith('.sqlite')) {
        continue;
      }

      try {
        const tables = await parseDatabase(file);
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          tables,
          file,
          status: 'ready'
        });
      } catch (err) {
        console.error(`Error parsing ${file.name}:`, err);
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          tables: [],
          file,
          status: 'error',
          error: "Failed to parse database file."
        });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setIsLoading(false);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFile = (updatedDb: DBFile) => {
    setFiles(prev => prev.map(f => f.id === updatedDb.id ? updatedDb : f));
  };

  const clearAll = () => {
    setFiles([]);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
              S2X
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">SQLite 到 Excel</h1>
              <p className="text-xs text-slate-500 font-medium">批量数据库导出工具</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>100% 浏览器内处理，数据更安全</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section / Upload Area */}
        <section className="mb-12">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200
              flex flex-col items-center justify-center text-center
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'}
            `}
          >
            <input
              type="file"
              multiple
              accept=".db,.sqlite"
              onChange={(e) => processFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">拖放您的 SQLite 文件</h2>
            <p className="text-slate-500 mb-6 max-w-md">
              选择一个或多个 .db 或 .sqlite 文件。您的数据不会上传到任何服务器。
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                支持批量转换
              </span>
              <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                AI 结构分析
              </span>
              <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                保留表结构
              </span>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        {files.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-slate-800">已就绪文件 ({files.length})</h3>
              {isLoading && (
                <div className="flex items-center text-sm text-blue-600">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                  处理中...
                </div>
              )}
            </div>
            <button
              onClick={clearAll}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清空全部
            </button>
          </div>
        )}

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map(db => (
            <FileCard 
              key={db.id} 
              db={db} 
              onRemove={removeFile} 
              onUpdate={updateFile}
            />
          ))}
        </div>

        {/* Empty State */}
        {files.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="inline-block p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">暂无已解析的文件</p>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 py-3 text-center">
        <p className="text-xs text-slate-500">
          使用了 sql.js (WebAssembly) 和 Gemini AI 技术。所有数据处理均在您的浏览器中完成。
        </p>
      </footer>
    </div>
  );
};

export default App;
