import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CarFront,
  FileText,
  Plus,
  Receipt,
  ShoppingBasket,
  UserRound,
  WalletCards,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { getCustomers } from '../../services/customerService';
import { getParts } from '../../services/partService';
import { createSale, getSaleByOrderId } from '../../services/salesService';
import { getStaffMembers } from '../../services/staffService';

const emptyItem = {
  partId: '',
  quantity: '1',
};

const styles = {
  page: {
    display: 'grid',
    gap: 12,
    width: '100%',
    maxWidth: 1280,
    margin: '0 auto',
  },
  topBand: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.18fr) minmax(320px, 0.82fr)',
    gap: 12,
  },
  hero: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1f2937 58%, #0f766e 100%)',
    color: '#fff',
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)',
    position: 'relative',
    overflow: 'hidden',
  },
  topCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06)',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
  },
  statCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: 14,
    boxShadow: '0 18px 34px rgba(15, 23, 42, 0.05)',
  },
  shell: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.16fr) minmax(340px, 0.84fr)',
    gap: 12,
    alignItems: 'stretch',
  },
  panel: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 22px 42px rgba(15, 23, 42, 0.05)',
  },
  previewStack: {
    display: 'grid',
    gap: 18,
    minHeight: '100%',
    alignContent: 'start',
  },
  previewPanel: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 22px 42px rgba(15, 23, 42, 0.05)',
    minHeight: '100%',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#eef2ff',
    color: '#4f46e5',
    flexShrink: 0,
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 12,
    padding: '11px 13px',
    fontSize: 13,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
  },
  button: {
    border: 'none',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
};

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function SalesInvoicesPage() {
  const [customers, setCustomers] = useState([]);
  const [parts, setParts] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [lookupOrderId, setLookupOrderId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerId: '',
    vehiclePlate: '',
    staffId: '',
    isPaid: true,
    dueDate: '',
    items: [{ ...emptyItem }],
  });

  const selectedCustomer = useMemo(
    () => customers.find((customer) => String(customer.id) === String(form.customerId)),
    [customers, form.customerId]
  );

  const selectedStaff = useMemo(
    () => staffMembers.find((staff) => String(staff.id) === String(form.staffId)),
    [staffMembers, form.staffId]
  );

  const basketItems = useMemo(
    () =>
      form.items
        .map((item) => {
          const part = parts.find((entry) => String(entry.partId) === String(item.partId));
          if (!part) return null;

          const quantity = Number(item.quantity || 0);
          const unitPrice = Number(part.price || 0);

          return {
            ...item,
            partName: part.name,
            stockQty: Number(part.stockQty || 0),
            unitPrice,
            lineTotal: quantity * unitPrice,
          };
        })
        .filter(Boolean),
    [form.items, parts]
  );

  const subtotal = useMemo(
    () => basketItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
    [basketItems]
  );

  async function loadReferenceData() {
    const [customersResponse, partsResponse, staffResponse] = await Promise.all([
      getCustomers(),
      getParts(),
      getStaffMembers(),
    ]);

    setCustomers(customersResponse.data.data || []);
    setParts(partsResponse.data.data || []);
    setStaffMembers(staffResponse.data.data || []);
  }

  useEffect(() => {
    loadReferenceData().catch(() => {
      setError('Could not load sales form data right now.');
    });
  }, []);

  function clearFeedback() {
    setMessage('');
    setError('');
  }

  function updateItem(index, field, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addItem() {
    setForm((current) => ({
      ...current,
      items: [...current.items, { ...emptyItem }],
    }));
  }

  function removeItem(index) {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearFeedback();
    setIsSaving(true);

    try {
      const response = await createSale({
        customerId: Number(form.customerId),
        vehiclePlate: form.vehiclePlate,
        staffId: Number(form.staffId),
        isPaid: form.isPaid,
        dueDate: form.dueDate || null,
        items: form.items.map((item) => ({
          partId: Number(item.partId),
          quantity: Number(item.quantity),
        })),
      });

      setCreatedInvoice(response.data.data);
      setLookupOrderId(String(response.data.data.orderId));
      setMessage('Sale invoice created successfully.');
      setForm({
        customerId: '',
        vehiclePlate: '',
        staffId: '',
        isPaid: true,
        dueDate: '',
        items: [{ ...emptyItem }],
      });

      await loadReferenceData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not create the sales invoice.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLookup(event) {
    event.preventDefault();
    clearFeedback();
    setIsLookingUp(true);

    try {
      const response = await getSaleByOrderId(lookupOrderId);
      setCreatedInvoice(response.data.data);
      setMessage('Sale invoice loaded successfully.');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not load that order.'));
    } finally {
      setIsLookingUp(false);
    }
  }

  return (
    <Layout title="Sales & Invoices">
      <div style={styles.page}>
        <div style={styles.topBand}>
          <section style={styles.hero} className="gp-fade-up">
            <div
              style={{
                position: 'absolute',
                inset: 'auto auto -50px 72%',
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              }}
            />
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              <ShoppingBasket size={14} />
              Sales workspace
            </div>
            <h2 style={{ fontSize: 28, lineHeight: 1.2, marginBottom: 10 }}>
              Turn stocked parts into clean invoices without leaving the counter.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, maxWidth: 520, marginBottom: 18 }}>
              Build a sale from live inventory, link it to a customer vehicle, and preview
              the invoice right away.
            </p>

            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72 }}>
                  Basket total
                </p>
                <strong style={{ fontSize: 24 }}>{formatMoney(subtotal)}</strong>
              </div>
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72 }}>
                  Selected items
                </p>
                <strong style={{ fontSize: 24 }}>{basketItems.length}</strong>
              </div>
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72 }}>
                  Payment mode
                </p>
                <strong style={{ fontSize: 24 }}>{form.isPaid ? 'Paid' : 'Credit'}</strong>
              </div>
            </div>
          </section>

          <aside style={styles.topCard} className="gp-fade-up" data-delay="1">
            <div style={{ ...styles.titleWrap, marginBottom: 16 }}>
              <div style={{ ...styles.iconBox, background: '#ecfdf5', color: '#059669' }}>
                <WalletCards size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, color: '#111827', marginBottom: 3 }}>Live Sale Summary</h3>
                <p style={{ fontSize: 13, color: '#6b7280' }}>Quick read before you submit the invoice.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  padding: 16,
                  borderRadius: 14,
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Customer</span>
                  <strong style={{ fontSize: 13, color: '#111827' }}>
                    {selectedCustomer?.fullName || 'Not selected'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Vehicle</span>
                  <strong style={{ fontSize: 13, color: '#111827' }}>
                    {form.vehiclePlate || 'Not selected'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Staff</span>
                  <strong style={{ fontSize: 13, color: '#111827' }}>
                    {selectedStaff?.fullName || 'Not selected'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Status</span>
                  <span
                    style={{
                      padding: '5px 9px',
                      borderRadius: 999,
                      background: form.isPaid ? '#ecfdf5' : '#fff7ed',
                      color: form.isPaid ? '#047857' : '#c2410c',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {form.isPaid ? 'Paid invoice' : 'Pending credit'}
                  </span>
                </div>
              </div>

              <div className="gp-scroll-panel" style={{ display: 'grid', gap: 8, maxHeight: 244 }}>
                {basketItems.length ? (
                  basketItems.slice(0, 3).map((item, index) => (
                    <div
                      key={`${item.partId}-${index}`}
                      className="gp-fade-up"
                      data-delay={index + 2}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: 13, color: '#111827', marginBottom: 3 }}>
                          {item.partName}
                        </strong>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>
                          Qty {item.quantity} · {item.stockQty} in stock
                        </span>
                      </div>
                      <strong style={{ fontSize: 13, color: '#111827' }}>
                        {formatMoney(item.lineTotal)}
                      </strong>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      border: '1px dashed #d1d5db',
                      background: '#f8fafc',
                      color: '#6b7280',
                      fontSize: 13,
                    }}
                  >
                    Add parts to build the current sale basket.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        <div style={styles.stats}>
          {[
            {
              label: 'Customers Ready',
              value: customers.length,
              icon: <UserRound size={18} />,
              bg: '#eef2ff',
              accent: '#4f46e5',
            },
            {
              label: 'Available Parts',
              value: parts.filter((part) => Number(part.stockQty) > 0).length,
              icon: <ShoppingBasket size={18} />,
              bg: '#ecfeff',
              accent: '#0f766e',
            },
            {
              label: 'Current Basket',
              value: basketItems.length,
              icon: <Receipt size={18} />,
              bg: '#fff7ed',
              accent: '#c2410c',
            },
            {
              label: 'Estimated Sale Total',
              value: formatMoney(subtotal),
              icon: <BadgeCheck size={18} />,
              bg: '#ecfdf5',
              accent: '#059669',
            },
          ].map((item, index) => (
            <section
              key={item.label}
              style={styles.statCard}
              className="gp-fade-up"
              data-delay={index + 4}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{item.label}</p>
                  <p style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{item.value}</p>
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: item.bg,
                    color: item.accent,
                  }}
                >
                  {item.icon}
                </div>
              </div>
            </section>
          ))}
        </div>

        {(message || error) && (
          <div
            className="gp-toast-slide"
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              border: `1px solid ${error ? '#fecaca' : '#bbf7d0'}`,
              background: error ? '#fff1f2' : '#f0fdf4',
              color: error ? '#b91c1c' : '#166534',
              boxShadow: '0 18px 34px rgba(15, 23, 42, 0.06)',
            }}
          >
            {error || message}
          </div>
        )}

        <div style={styles.shell}>
          <section style={styles.panel} className="gp-fade-up" data-delay="8">
            <div style={{ ...styles.titleWrap, marginBottom: 18 }}>
              <div style={styles.iconBox}>
                <ShoppingBasket size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, color: '#111827', marginBottom: 4 }}>Create Sales Invoice</h3>
                <p style={{ fontSize: 13, color: '#6b7280' }}>
                  Connect the sale to a customer, a vehicle, and real inventory stock.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                    Customer
                  </label>
                  <select
                    style={styles.input}
                    value={form.customerId}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        customerId: event.target.value,
                        vehiclePlate: '',
                      })
                    }
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                    Staff
                  </label>
                  <select
                    style={styles.input}
                    value={form.staffId}
                    onChange={(event) => setForm({ ...form, staffId: event.target.value })}
                    required
                  >
                    <option value="">Select staff</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                    Vehicle
                  </label>
                  <select
                    style={styles.input}
                    value={form.vehiclePlate}
                    onChange={(event) => setForm({ ...form, vehiclePlate: event.target.value })}
                    required
                  >
                    <option value="">Select vehicle</option>
                    {(selectedCustomer?.vehicles || []).map((vehicle) => (
                      <option key={vehicle.vehiclePlate} value={vehicle.vehiclePlate}>
                        {vehicle.vehiclePlate} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                    Due date
                  </label>
                  <input
                    style={styles.input}
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: 14,
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={form.isPaid}
                    onChange={(event) => setForm({ ...form, isPaid: event.target.checked })}
                  />
                  Mark invoice as paid
                </label>
                <span
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: form.isPaid ? '#ecfdf5' : '#fff7ed',
                    color: form.isPaid ? '#047857' : '#c2410c',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {form.isPaid ? 'Payment complete' : 'Pending credit'}
                </span>
              </div>

              <div className="gp-scroll-panel" style={{ display: 'grid', gap: 12, maxHeight: 320 }}>
                {form.items.map((item, index) => (
                  <div
                    key={`${index}-${item.partId}`}
                    className="gp-table-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) 110px 48px',
                      gap: 10,
                    }}
                  >
                    <select
                      style={styles.input}
                      value={item.partId}
                      onChange={(event) => updateItem(index, 'partId', event.target.value)}
                      required
                    >
                      <option value="">Select part</option>
                      {parts
                        .filter((part) => Number(part.stockQty) > 0)
                        .map((part) => (
                          <option key={part.partId} value={part.partId}>
                            {part.name} ({part.stockQty} left)
                          </option>
                        ))}
                    </select>

                    <input
                      style={styles.input}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={form.items.length === 1}
                      style={{
                        ...styles.button,
                        padding: 11,
                        background: '#f3f4f6',
                        color: '#374151',
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItem}
                style={{
                  ...styles.button,
                  background: '#eef2ff',
                  color: '#4338ca',
                  justifySelf: 'start',
                  boxShadow: '0 14px 26px rgba(79, 70, 229, 0.12)',
                }}
              >
                <Plus size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Add Part
              </button>

              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 16,
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                  padding: 18,
                  display: 'grid',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Current total</p>
                    <p style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{formatMoney(subtotal)}</p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 10px',
                      borderRadius: 999,
                      background: '#eef2ff',
                      color: '#4338ca',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <CarFront size={14} />
                    {form.vehiclePlate || 'Vehicle not selected'}
                  </div>
                </div>

                <div className="gp-scroll-panel" style={{ display: 'grid', gap: 10, maxHeight: 240 }}>
                  {basketItems.length ? (
                    basketItems.map((item, index) => (
                      <div
                        key={`${item.partId}-${index}`}
                        className="gp-fade-up"
                        data-delay={index + 1}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          paddingBottom: 10,
                          borderBottom: index === basketItems.length - 1 ? 'none' : '1px solid #e5e7eb',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: 13, color: '#111827', display: 'block', marginBottom: 3 }}>
                            {item.partName}
                          </strong>
                          <span style={{ fontSize: 12, color: '#6b7280' }}>
                            Qty {item.quantity} · Unit {formatMoney(item.unitPrice)}
                          </span>
                        </div>
                        <strong style={{ fontSize: 13, color: '#111827' }}>
                          {formatMoney(item.lineTotal)}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>
                      Add one or more parts to generate the invoice amount.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.button,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: '#fff',
                  justifySelf: 'start',
                  boxShadow: '0 16px 28px rgba(79, 70, 229, 0.24)',
                }}
                disabled={isSaving}
              >
                {isSaving ? 'Creating...' : 'Create Invoice'}
              </button>
            </form>
          </section>

          <div style={styles.previewStack}>
            <section style={styles.panel} className="gp-fade-up" data-delay="9">
              <div style={{ ...styles.titleWrap, marginBottom: 16 }}>
                <div style={{ ...styles.iconBox, background: '#eff6ff', color: '#2563eb' }}>
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, color: '#111827', marginBottom: 4 }}>Find Order Invoice</h3>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>
                    Pull an existing order into the invoice preview in one step.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLookup} style={{ display: 'grid', gap: 12 }}>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  placeholder="Enter order ID"
                  value={lookupOrderId}
                  onChange={(event) => setLookupOrderId(event.target.value)}
                  required
                />
                <button
                  type="submit"
                  style={{
                    ...styles.button,
                    background: '#111827',
                    color: '#fff',
                    boxShadow: '0 16px 28px rgba(17, 24, 39, 0.16)',
                  }}
                  disabled={isLookingUp}
                >
                  {isLookingUp ? 'Loading...' : 'Load Invoice'}
                </button>
              </form>
            </section>

            <section style={styles.previewPanel} className="gp-fade-up" data-delay="10">
              <div style={{ ...styles.titleWrap, marginBottom: 16 }}>
                <div style={{ ...styles.iconBox, background: '#eef2ff', color: '#4f46e5' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, color: '#111827', marginBottom: 4 }}>Invoice Preview</h3>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>
                    Review invoice details before handing them over to the customer.
                  </p>
                </div>
              </div>

              {createdInvoice ? (
                <div style={{ display: 'grid', gap: 16 }}>
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                      border: '1px solid #e5e7eb',
                      display: 'grid',
                      gap: 10,
                    }}
                  >
                    {[
                      ['Order ID', `#${createdInvoice.orderId}`],
                      ['Invoice ID', `#${createdInvoice.invoiceId}`],
                      ['Customer', createdInvoice.customerName],
                      ['Vehicle', createdInvoice.vehiclePlate],
                      ['Staff', createdInvoice.staffName],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
                        <strong style={{ fontSize: 13, color: '#111827' }}>{value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="gp-scroll-panel" style={{ display: 'grid', gap: 10, maxHeight: 260 }}>
                    {createdInvoice.items.map((item, index) => (
                      <div
                        key={`${createdInvoice.orderId}-${item.partId}`}
                        className="gp-fade-up"
                        data-delay={index + 1}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: 14,
                          padding: 14,
                          display: 'grid',
                          gap: 4,
                          background: '#fff',
                        }}
                      >
                        <strong style={{ fontSize: 13, color: '#111827' }}>{item.partName}</strong>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>
                          Qty: {item.quantity} · Unit: {formatMoney(item.unitPrice)}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                          {formatMoney(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      borderRadius: 16,
                      border: '1px solid #e5e7eb',
                      padding: 16,
                      background: '#f8fafc',
                      display: 'grid',
                      gap: 8,
                    }}
                  >
                    {[
                      ['Subtotal', formatMoney(createdInvoice.subtotal)],
                      [
                        'Discount',
                        `${createdInvoice.discountPct}% (${formatMoney(createdInvoice.discountAmount)})`,
                      ],
                      ['Total', formatMoney(createdInvoice.invoiceTotal)],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
                        <strong style={{ fontSize: 13, color: '#111827' }}>{value}</strong>
                      </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 6 }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>Status</span>
                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: createdInvoice.isPaid ? '#ecfdf5' : '#fff7ed',
                          color: createdInvoice.isPaid ? '#047857' : '#c2410c',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {createdInvoice.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    border: '1px dashed #d1d5db',
                    background: '#f8fafc',
                    color: '#6b7280',
                    fontSize: 13,
                  }}
                >
                  Create a sale or load an order ID to preview the invoice here.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}


