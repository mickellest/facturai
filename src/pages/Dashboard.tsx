import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, DollarSign, Clock, CheckCircle2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

interface DashboardStats {
  totalInvoices: number;
  totalAmount: number;
  pendingCount: number;
  validatedCount: number;
}

interface RecentInvoice {
  id: number;
  supplier: string;
  total: number;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const { formatAmount } = useCurrency();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalAmount: 0,
    pendingCount: 0,
    validatedCount: 0
  });
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      // Fetch stats
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('total, status, created_at');

      if (!error && invoices) {
        const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
        const pendingCount = invoices.filter(inv => inv.status !== 'Validada').length;
        const validatedCount = invoices.filter(inv => inv.status === 'Validada').length;

        setStats({
          totalInvoices: invoices.length,
          totalAmount,
          pendingCount,
          validatedCount
        });
      }

      // Fetch recent invoices
      const { data: recent, error: recentError } = await supabase
        .from('invoices')
        .select('id, supplier, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!recentError && recent) {
        setRecentInvoices(recent);
      }

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard General</h1>
          <p className="text-gray-500 mt-1">Resumen de la actividad de facturación y procesamiento AI.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 text-sm font-medium text-gray-600">
          <TrendingUp className="w-4 h-4 text-primary" />
          Actualizado en tiempo real
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Facturas" 
          value={stats.totalInvoices.toString()} 
          icon={<FileText className="w-6 h-6 text-blue-600" />} 
          trend="+12% este mes"
          color="bg-blue-50 border-blue-100"
        />
        <StatCard 
          title="Monto Procesado" 
          value={formatAmount(stats.totalAmount)} 
          icon={<DollarSign className="w-6 h-6 text-green-600" />} 
          trend="Calculado de totales"
          color="bg-green-50 border-green-100"
        />
        <StatCard 
          title="Por Validar" 
          value={stats.pendingCount.toString()} 
          icon={<Clock className="w-6 h-6 text-orange-600" />} 
          trend="Requieren tu atención"
          color="bg-orange-50 border-orange-100"
        />
        <StatCard 
          title="Validadas" 
          value={stats.validatedCount.toString()} 
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} 
          trend="Listas para pago"
          color="bg-emerald-50 border-emerald-100"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
            <Link to="/invoices" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
              Ver todas <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInvoices.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay facturas recientes.
              </div>
            ) : (
              recentInvoices.map((inv) => (
                <div key={inv.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${inv.status === 'Validada' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{inv.supplier}</p>
                      <p className="text-xs text-gray-500">{new Date(inv.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatAmount(inv.total)}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                      inv.status === 'Validada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Automatización Activa</h3>
            <p className="text-primary-100 text-sm leading-relaxed opacity-90">
              Tu flujo de n8n está escuchando nuevos correos. Las facturas que lleguen se procesarán automáticamente con IA y aparecerán aquí.
            </p>
          </div>
          
          <div className="relative z-10 mt-8">
            <Link to="/assistant" className="inline-flex w-full items-center justify-center gap-2 bg-white text-primary font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              Preguntar al Asistente
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: { title: string, value: string, icon: React.ReactNode, trend: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${color}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="text-gray-500 font-medium">{trend}</span>
      </div>
    </div>
  );
}
