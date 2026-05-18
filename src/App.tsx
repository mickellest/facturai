
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { FileText, Bot, LayoutDashboard, Settings } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Assistant from './pages/Assistant';
import SettingsView from './pages/Settings';
import { CurrencyProvider } from './contexts/CurrencyContext';

function App() {
  return (
    <CurrencyProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-[#f8fafc] text-gray-900 font-sans selection:bg-primary/20 selection:text-primary">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
          <div className="p-8 border-b border-gray-100/60">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600 flex items-center gap-3 tracking-tight">
              <div className="bg-primary/10 p-2 rounded-xl">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              FacturAI
            </h2>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menú Principal</div>
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-gray-600 hover:text-primary font-medium transition-all group">
              <LayoutDashboard className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              Dashboard
            </Link>
            <Link to="/invoices" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-gray-600 hover:text-primary font-medium transition-all group">
              <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              Facturas
            </Link>
            <Link to="/assistant" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-gray-600 hover:text-primary font-medium transition-all group">
              <Bot className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              Asistente AI
            </Link>
          </nav>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
             <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-gray-600 font-medium transition-all group">
              <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              Configuración
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </main>
      </div>
      </BrowserRouter>
    </CurrencyProvider>
  );
}

export default App;
