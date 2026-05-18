import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, Eye, X, Edit2, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

interface Invoice {
  id: number;
  supplier: string;
  client: string;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  subtotal?: number;
  taxes?: number;
  total: number;
  status: string;
}

interface InvoiceLine {
  id: number;
  concept: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_line: number;
}

export default function Invoices() {
  const { formatAmount, symbol } = useCurrency();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);
  const [loadingLines, setLoadingLines] = useState(false);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(null);
  const [editedLines, setEditedLines] = useState<InvoiceLine[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
    } else {
      setInvoices(data || []);
    }
    setLoading(false);
  }

  async function handleViewDetails(invoice: Invoice) {
    setSelectedInvoice(invoice);
    setIsEditing(false);
    setLoadingLines(true);
    const { data, error } = await supabase
      .from('invoice_lines')
      .select('*')
      .eq('invoice_id', invoice.id);
      
    if (error) {
      console.error('Error fetching lines:', error);
    } else {
      setInvoiceLines(data || []);
    }
    setLoadingLines(false);
  }

  function closeModal() {
    setSelectedInvoice(null);
    setInvoiceLines([]);
    setIsEditing(false);
  }

  function startEditing() {
    setEditedInvoice({ ...selectedInvoice! });
    setEditedLines(invoiceLines.map(line => ({ ...line })));
    setIsEditing(true);
  }

  async function handleSave() {
    if (!editedInvoice) return;
    setSaving(true);

    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({
        supplier: editedInvoice.supplier,
        client: editedInvoice.client,
        invoice_number: editedInvoice.invoice_number,
        issue_date: editedInvoice.issue_date,
        due_date: editedInvoice.due_date,
        subtotal: editedInvoice.subtotal,
        taxes: editedInvoice.taxes,
        total: editedInvoice.total
      })
      .eq('id', editedInvoice.id);

    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError);
      setSaving(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from('invoice_lines')
      .delete()
      .eq('invoice_id', editedInvoice.id);

    if (!deleteError && editedLines.length > 0) {
      const linesToInsert = editedLines.map(line => ({
        invoice_id: editedInvoice.id,
        concept: line.concept,
        quantity: line.quantity,
        unit_price: line.unit_price,
        discount: line.discount,
        total_line: line.total_line
      }));
      
      await supabase.from('invoice_lines').insert(linesToInsert);
    }

    setSelectedInvoice(editedInvoice);
    setInvoiceLines(editedLines.map((l, i) => ({ ...l, id: i }))); // Temp ids for local state
    setIsEditing(false);
    setSaving(false);
    fetchInvoices();
  }

  async function handleValidate() {
    if (!selectedInvoice) return;
    setSaving(true);
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'Validada' })
      .eq('id', selectedInvoice.id);
      
    if (!error) {
      const updated = { ...selectedInvoice, status: 'Validada' };
      setSelectedInvoice(updated);
      setInvoices(invoices.map(inv => inv.id === updated.id ? updated : inv));
    }
    setSaving(false);
  }

  function updateInvoiceField(field: keyof Invoice, value: string | number) {
    if (editedInvoice) {
      setEditedInvoice({ ...editedInvoice, [field]: value });
    }
  }

  function updateLineField(index: number, field: keyof InvoiceLine, value: string | number) {
    const newLines = [...editedLines];
    newLines[index] = { ...newLines[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price' || field === 'discount') {
      const qty = Number(newLines[index].quantity) || 0;
      const price = Number(newLines[index].unit_price) || 0;
      const desc = Number(newLines[index].discount) || 0;
      newLines[index].total_line = (qty * price) - desc;
    }
    setEditedLines(newLines);
  }

  function addLine() {
    setEditedLines([
      ...editedLines,
      { id: Date.now(), concept: '', quantity: 1, unit_price: 0, discount: 0, total_line: 0 }
    ]);
  }

  function removeLine(index: number) {
    setEditedLines(editedLines.filter((_, i) => i !== index));
  }

  if (loading) {
    return <div className="p-8"><p className="text-gray-500">Cargando facturas...</p></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Listado de Facturas</h1>
          <p className="text-gray-500 mt-1">Gestiona, edita y valida las facturas procesadas.</p>
        </div>
        <button onClick={fetchInvoices} className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:text-primary transition shadow-sm font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
          Actualizar Datos
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No hay facturas procesadas aún. (¡Espera a que el flujo de n8n empiece a trabajar!)
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {inv.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{inv.supplier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{inv.issue_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{formatAmount(inv.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      inv.status === 'Validada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => handleViewDetails(inv)}
                      className="text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {isEditing ? 'Editando Factura' : `Detalle de Factura: ${selectedInvoice.invoice_number}`}
              </h2>
              <div className="flex items-center gap-2">
                {!isEditing && selectedInvoice.status !== 'Validada' && (
                  <>
                    <button 
                      onClick={startEditing}
                      className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition text-sm font-medium shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" /> Editar
                    </button>
                    <button 
                      onClick={handleValidate}
                      disabled={saving}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition text-sm font-medium shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Validar Factura
                    </button>
                  </>
                )}
                {isEditing && (
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-hover transition text-sm font-medium shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                )}
                <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition ml-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-white">
              {/* Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-5 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Proveedor</p>
                  {isEditing ? (
                    <input type="text" value={editedInvoice?.supplier || ''} onChange={e => updateInvoiceField('supplier', e.target.value)} className="w-full border border-gray-300 rounded p-1.5 text-sm" />
                  ) : (
                    <p className="font-medium text-gray-900">{selectedInvoice.supplier}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Cliente</p>
                  {isEditing ? (
                    <input type="text" value={editedInvoice?.client || ''} onChange={e => updateInvoiceField('client', e.target.value)} className="w-full border border-gray-300 rounded p-1.5 text-sm" />
                  ) : (
                    <p className="font-medium text-gray-900">{selectedInvoice.client || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Número de Factura</p>
                  {isEditing ? (
                    <input type="text" value={editedInvoice?.invoice_number || ''} onChange={e => updateInvoiceField('invoice_number', e.target.value)} className="w-full border border-gray-300 rounded p-1.5 text-sm" />
                  ) : (
                    <p className="font-medium text-gray-900">{selectedInvoice.invoice_number}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Fecha Emisión</p>
                  {isEditing ? (
                    <input type="date" value={editedInvoice?.issue_date || ''} onChange={e => updateInvoiceField('issue_date', e.target.value)} className="w-full border border-gray-300 rounded p-1.5 text-sm" />
                  ) : (
                    <p className="font-medium text-gray-900">{selectedInvoice.issue_date}</p>
                  )}
                </div>
              </div>

              {/* Lines Table */}
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-lg font-bold text-gray-800">Líneas de Factura</h3>
                {isEditing && (
                  <button onClick={addLine} className="flex items-center gap-1 text-sm text-primary hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-md transition">
                    <Plus className="w-4 h-4" /> Agregar Línea
                  </button>
                )}
              </div>
              
              {loadingLines ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-500">Cargando líneas...</p>
                </div>
              ) : invoiceLines.length === 0 && !isEditing ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-500">No se encontraron líneas para esta factura.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Concepto</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Cant.</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Precio Unit.</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Desc.</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Total Línea</th>
                        {isEditing && <th className="px-2 py-3 w-10"></th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(isEditing ? editedLines : invoiceLines).map((line, index) => (
                        <tr key={line.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2">
                            {isEditing ? (
                              <input type="text" value={line.concept} onChange={e => updateLineField(index, 'concept', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                            ) : (
                              <span className="text-sm text-gray-900">{line.concept}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {isEditing ? (
                              <input type="number" step="0.01" value={line.quantity} onChange={e => updateLineField(index, 'quantity', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                            ) : (
                              <span className="text-sm text-gray-900">{Number(line.quantity).toFixed(2)}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {isEditing ? (
                              <div className="relative">
                                <span className="absolute left-2 top-1.5 text-gray-500 text-sm">{symbol}</span>
                                <input type="number" step="0.01" value={line.unit_price} onChange={e => updateLineField(index, 'unit_price', e.target.value)} className="w-full border border-gray-300 rounded pl-7 pr-2 py-1 text-sm text-right focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                              </div>
                            ) : (
                              <span className="text-sm text-gray-900">{formatAmount(line.unit_price)}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {isEditing ? (
                               <input type="number" step="0.01" value={line.discount || 0} onChange={e => updateLineField(index, 'discount', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                            ) : (
                              <span className="text-sm text-gray-900">{formatAmount(line.discount || 0)}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            <span className="text-sm text-gray-900">{formatAmount(line.total_line)}</span>
                          </td>
                          {isEditing && (
                            <td className="px-2 py-2 text-center">
                              <button onClick={() => removeLine(index)} className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium text-gray-500">Subtotal</td>
                        <td className="px-4 py-2 text-right">
                          {isEditing ? (
                             <input type="number" step="0.01" value={editedInvoice?.subtotal || 0} onChange={e => updateInvoiceField('subtotal', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{formatAmount(selectedInvoice.subtotal || 0)}</span>
                          )}
                        </td>
                        {isEditing && <td></td>}
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium text-gray-500">Impuestos</td>
                        <td className="px-4 py-2 text-right">
                          {isEditing ? (
                             <input type="number" step="0.01" value={editedInvoice?.taxes || 0} onChange={e => updateInvoiceField('taxes', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{formatAmount(selectedInvoice.taxes || 0)}</span>
                          )}
                        </td>
                        {isEditing && <td></td>}
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right text-base font-bold text-gray-900">Total</td>
                        <td className="px-4 py-3 text-right">
                           {isEditing ? (
                             <input type="number" step="0.01" value={editedInvoice?.total || 0} onChange={e => updateInvoiceField('total', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-base text-right font-bold text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                          ) : (
                            <span className="text-base font-bold text-primary">{formatAmount(selectedInvoice.total || 0)}</span>
                          )}
                        </td>
                        {isEditing && <td></td>}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
