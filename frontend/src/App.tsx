import React, { useState } from 'react';
import { AdminCatalogPage } from './pages/AdminCatalogPage';
import { AvatarStudioEditorPage } from './pages/AvatarStudioEditorPage';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'admin' | 'editor'>('editor');

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#FAF9FD] text-[#252137] flex flex-col select-none">
      {/* Barra de Navegación Global de la Plataforma */}
      <nav className="bg-white text-[#252137] px-6 py-3 flex justify-between items-center border-b border-[#E5E3ED] shrink-0 z-30">
        {/* Logo de Avatar Studio 2D */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FACC15] border-2 border-[#252137] flex flex-col items-center justify-center relative shadow-xs">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1 h-1 rounded-full bg-[#252137]" />
              <span className="w-1 h-1 rounded-full bg-[#252137]" />
            </div>
            <div className="w-2.5 h-0.5 bg-[#252137] rounded-full" />
          </div>
          <span className="font-black text-lg tracking-tight text-[#252137]">
            Avatar Studio 2D
          </span>
        </div>

        {/* Switch de Vistas Principales (Cápsula Central Redondeada) */}
        <div className="flex bg-[#F0EFF5] p-1 rounded-full border border-stone-200/60 shadow-2xs">
          <button
            onClick={() => setCurrentView('editor')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentView === 'editor'
                ? 'bg-[#252137] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 font-semibold'
            }`}
          >
            Mi avatar
          </button>
          <button
            onClick={() => setCurrentView('admin')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentView === 'admin'
                ? 'bg-[#252137] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 font-semibold'
            }`}
          >
            Administración
          </button>
        </div>
      </nav>

      {/* Vista Activa */}
      <main className="flex-1 min-h-0 overflow-hidden bg-[#FAF9FD]">
        {currentView === 'editor' ? (
          <AvatarStudioEditorPage onNavigateToAdmin={() => setCurrentView('admin')} />
        ) : (
          <AdminCatalogPage onNavigateToEditor={() => setCurrentView('editor')} />
        )}
      </main>
    </div>
  );
};
