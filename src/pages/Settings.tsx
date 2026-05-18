import { useCurrency, type Currency } from '../contexts/CurrencyContext';
import { Settings as SettingsIcon, DollarSign, Euro, Coins } from 'lucide-react';

export default function Settings() {
  const { currency, setCurrency } = useCurrency();

  const currencies: { id: Currency; name: string; symbol: string; icon: React.ReactNode }[] = [
    { id: 'VES', name: 'Bolívares', symbol: 'Bs.', icon: <Coins className="w-5 h-5" /> },
    { id: 'USD', name: 'Dólares Americanos', symbol: '$', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'EUR', name: 'Euros', symbol: '€', icon: <Euro className="w-5 h-5" /> },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-br from-primary to-indigo-600 p-2.5 rounded-xl shadow-sm">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configuración</h1>
          <p className="text-gray-500 mt-1">Personaliza tu experiencia en FacturAI.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Preferencias Regionales</h2>
          <p className="text-sm text-gray-500">Ajusta cómo se muestran los montos en el sistema.</p>
        </div>

        <div className="p-8">
          <div className="max-w-xl">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Moneda Principal de Visualización
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currencies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCurrency(c.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    currency === c.id
                      ? 'border-primary bg-indigo-50/50 text-primary'
                      : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${currency === c.id ? 'bg-primary/10' : 'bg-gray-100'}`}>
                    {c.icon}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className={`text-xs ${currency === c.id ? 'text-primary/70' : 'text-gray-400'}`}>
                      Símbolo: {c.symbol}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <strong className="text-gray-700">Nota:</strong> Este cambio solo afecta cómo se muestran los montos en el Dashboard y la lista de Facturas. Los valores originales en la base de datos se mantienen iguales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
