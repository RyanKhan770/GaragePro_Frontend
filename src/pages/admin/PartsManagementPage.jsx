import { useEffect, useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  Boxes,
  Package,
  Pencil,
  ShoppingCart,
  Sparkles,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import {
  createPart,
  deletePart,
  getParts,
  purchaseParts,
  updatePart,
} from '../../services/partService';

const emptyPartForm = {
  name: '',
  sku: '',
  category: '',
  description: '',
  price: '',
  stockQty: '',
};

const emptyPurchaseForm = {
  partId: '',
  quantity: '1',
  unitCost: '',
};

const styles = {
  page: {
    display: 'grid',
    gap: 12,
    width: '100%',
    maxWidth: 1280,
    margin: '0 auto',
  },
  introBand: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.18fr) minmax(320px, 0.82fr)',
    gap: 12,
  },
  heroCard: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1f2937 58%, #0f766e 100%)',
    color: '#fff',
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)',
    overflow: 'hidden',
    position: 'relative',
  },
  sideInsight: {
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
    gridTemplateColumns: '360px minmax(0, 1fr)',
    gap: 12,
    alignItems: 'stretch',
  },
  leftStack: {
    display: 'grid',
    gap: 12,
    alignContent: 'start',
  },
  panel: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 22px 42px rgba(15, 23, 42, 0.05)',
  },
  inventoryPanel: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 22px 42px rgba(15, 23, 42, 0.05)',
    minHeight: '100%',
    display: 'grid',
    alignContent: 'start',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
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
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: 8,
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
  textArea: {
    width: '100%',
    minHeight: 76,
    resize: 'vertical',
    border: '1px solid #d1d5db',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 13,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
  },
  button: {
    border: 'none',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
    color: '#fff',
    boxShadow: '0 16px 28px rgba(79, 70, 229, 0.24)',
  },
  secondaryButton: {
    background: '#eef2ff',
    color: '#4338ca',
  },
  darkButton: {
    background: '#111827',
    color: '#fff',
    boxShadow: '0 16px 28px rgba(17, 24, 39, 0.16)',
  },
};

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`;
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function getStockTone(stockQty) {
  if (stockQty <= 3) return { bg: '#fef2f2', color: '#b91c1c', label: 'Critical' };
  if (stockQty <= 5) return { bg: '#fff7ed', color: '#c2410c', label: 'Low' };
  return { bg: '#ecfdf5', color: '#047857', label: 'Healthy' };
}

export default function PartsManagementPage() {
  const [parts, setParts] = useState([]);
  const [partForm, setPartForm] = useState(emptyPartForm);
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchaseForm);
  const [editingPartId, setEditingPartId] = useState(null);
  const [isSavingPart, setIsSavingPart] = useState(false);
  const [isSavingPurchase, setIsSavingPurchase] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const totalStock = useMemo(
    () => parts.reduce((sum, part) => sum + Number(part.stockQty || 0), 0),
    [parts]
  );

  const lowStockCount = useMemo(
    () => parts.filter((part) => Number(part.stockQty || 0) <= 5).length,
    [parts]
  );

  const inventoryValue = useMemo(
    () =>
      parts.reduce(
        (sum, part) => sum + Number(part.stockQty || 0) * Number(part.price || 0),
        0
      ),
    [parts]
  );

  const highlightedPart = useMemo(() => {
    if (!parts.length) return null;

    return [...parts].sort(
      (left, right) =>
        Number(left.stockQty || 0) * Number(left.price || 0) -
        Number(right.stockQty || 0) * Number(right.price || 0)
    )[0];
  }, [parts]);

  async function loadParts() {
    const response = await getParts();
    setParts(response.data.data || []);
  }

  useEffect(() => {
    loadParts().catch(() => {
      setError('Could not load parts right now.');
    });
  }, []);

  function clearFeedback() {
    setMessage('');
    setError('');
  }

  function resetPartForm() {
    setEditingPartId(null);
    setPartForm(emptyPartForm);
  }

  function handleEdit(part) {
    clearFeedback();
    setEditingPartId(part.partId);
    setPartForm({
      name: part.name || '',
      sku: part.sku || '',
      category: part.category || '',
      description: part.category || '',
      price: String(part.price ?? ''),
      stockQty: String(part.stockQty ?? ''),
    });
  }

  async function handlePartSubmit(event) {
    event.preventDefault();
    clearFeedback();
    setIsSavingPart(true);

    const payload = {
      name: partForm.name.trim(),
      sku: partForm.sku.trim() || null,
      category: partForm.category.trim() || null,
      description: partForm.description.trim() || null,
      price: Number(partForm.price),
      stockQty: Number(partForm.stockQty),
    };

    try {
      if (editingPartId) {
        await updatePart(editingPartId, payload);
        setMessage('Part updated successfully.');
      } else {
        await createPart(payload);
        setMessage('Part created successfully.');
      }

      resetPartForm();
      await loadParts();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not save the part.'));
    } finally {
      setIsSavingPart(false);
    }
  }

  async function handleDelete(partId) {
    clearFeedback();

    try {
      await deletePart(partId);
      setMessage('Part deleted successfully.');

      if (editingPartId === partId) {
        resetPartForm();
      }

      await loadParts();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not delete the part.'));
    }
  }

  async function handlePurchaseSubmit(event) {
    event.preventDefault();
    clearFeedback();
    setIsSavingPurchase(true);

    try {
      await purchaseParts({
        vendorId: 0,
        notes: 'Stock purchase from parts page.',
        items: [
          {
            partId: Number(purchaseForm.partId),
            quantity: Number(purchaseForm.quantity),
            unitCost: Number(purchaseForm.unitCost),
          },
        ],
      });

      setPurchaseForm(emptyPurchaseForm);
      setMessage('Stock purchase recorded successfully.');
      await loadParts();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not record the purchase.'));
    } finally {
      setIsSavingPurchase(false);
    }
  }

  return (
    <Layout title="Parts Management">
      <div style={styles.page}>
        <div style={styles.introBand}>
          <section style={styles.heroCard} className="gp-fade-up">
            <div
              style={{
                position: 'absolute',
                inset: 'auto -40px -60px auto',
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
              }}
            />
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.12)',
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              <Sparkles size={14} />
              Inventory control
            </div>
            <h2 style={{ fontSize: 28, lineHeight: 1.2, marginBottom: 10 }}>
              Keep your stock organized, updated, and ready for sales.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, maxWidth: 540, marginBottom: 18 }}>
              Add new parts, adjust stock, and record purchases from one workspace.
              The layout is built for quick updates during daily garage work.
            </p>

            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72 }}>
                  Inventory value
                </p>
                <strong style={{ fontSize: 24 }}>{formatMoney(inventoryValue)}</strong>
              </div>
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72 }}>
                  Active items
                </p>
                <strong style={{ fontSize: 24 }}>{parts.length}</strong>
              </div>
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72 }}>
                  Low stock watch
                </p>
                <strong style={{ fontSize: 24 }}>{lowStockCount}</strong>
              </div>
            </div>
          </section>

          <aside style={styles.sideInsight} className="gp-fade-up" data-delay="1">
            <div style={{ ...styles.titleWrap, marginBottom: 16 }}>
              <div style={{ ...styles.iconBox, background: '#ecfeff', color: '#0f766e' }}>
                <TriangleAlert size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, color: '#111827', marginBottom: 3 }}>Stock Focus</h3>
                <p style={{ fontSize: 13, color: '#6b7280' }}>Quick view of the part that needs attention.</p>
              </div>
            </div>

            {highlightedPart ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  display: 'grid',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Highlighted part</p>
                    <strong style={{ fontSize: 18, color: '#111827' }}>{highlightedPart.name}</strong>
                  </div>
                  <span
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: getStockTone(Number(highlightedPart.stockQty || 0)).bg,
                      color: getStockTone(Number(highlightedPart.stockQty || 0)).color,
                    }}
                  >
                    {getStockTone(Number(highlightedPart.stockQty || 0)).label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Stock</p>
                    <strong style={{ fontSize: 20, color: '#111827' }}>{highlightedPart.stockQty}</strong>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Unit Price</p>
                    <strong style={{ fontSize: 20, color: '#111827' }}>{formatMoney(highlightedPart.price)}</strong>
                  </div>
                </div>

                <div
                  style={{
                    height: 10,
                    borderRadius: 999,
                    background: '#e5e7eb',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(14, Math.min(100, Number(highlightedPart.stockQty || 0) * 10))}%`,
                      height: '100%',
                      borderRadius: 999,
                      background:
                        Number(highlightedPart.stockQty || 0) <= 5
                          ? 'linear-gradient(90deg, #fb923c, #f97316)'
                          : 'linear-gradient(90deg, #22c55e, #14b8a6)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 18,
                  borderRadius: 14,
                  background: '#f8fafc',
                  border: '1px dashed #d1d5db',
                  color: '#6b7280',
                  fontSize: 13,
                }}
              >
                Add your first part to start tracking stock movement and purchase activity.
              </div>
            )}
          </aside>
        </div>

        <div style={styles.stats}>
          {[
            {
              label: 'Parts In Catalog',
              value: parts.length,
              icon: <Package size={18} />,
              accent: '#4f46e5',
              bg: '#eef2ff',
            },
            {
              label: 'Units In Stock',
              value: totalStock,
              icon: <Boxes size={18} />,
              accent: '#0f766e',
              bg: '#ecfeff',
            },
            {
              label: 'Inventory Value',
              value: formatMoney(inventoryValue),
              icon: <BadgeDollarSign size={18} />,
              accent: '#059669',
              bg: '#ecfdf5',
            },
            {
              label: 'Low Stock Parts',
              value: lowStockCount,
              icon: <TriangleAlert size={18} />,
              accent: '#c2410c',
              bg: '#fff7ed',
            },
          ].map((item, index) => (
            <section
              key={item.label}
              style={styles.statCard}
              className="gp-fade-up"
              data-delay={index + 2}
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
          <div style={styles.leftStack}>
            <section style={styles.panel} className="gp-fade-up" data-delay="6">
              <div style={styles.headerRow}>
                <div style={styles.titleWrap}>
                  <div style={styles.iconBox}>
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, color: '#111827', marginBottom: 4 }}>
                      {editingPartId ? 'Edit Part' : 'Add New Part'}
                    </h3>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>
                      Keep each part clear, searchable, and ready for quick updates.
                    </p>
                  </div>
                </div>

                {editingPartId && (
                  <span
                    style={{
                      padding: '7px 10px',
                      borderRadius: 999,
                      background: '#eef2ff',
                      color: '#4338ca',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Editing
                  </span>
                )}
              </div>

              <form onSubmit={handlePartSubmit} style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={styles.label}>Part name</label>
                  <input
                    style={styles.input}
                    placeholder="Brake pad, oil filter, spark plug..."
                    value={partForm.name}
                    onChange={(event) => setPartForm({ ...partForm, name: event.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={styles.label}>SKU</label>
                    <input
                      style={styles.input}
                      placeholder="OF-2001"
                      value={partForm.sku}
                      onChange={(event) => setPartForm({ ...partForm, sku: event.target.value })}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Category</label>
                    <input
                      style={styles.input}
                      placeholder="Engine"
                      value={partForm.category}
                      onChange={(event) => setPartForm({ ...partForm, category: event.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={styles.label}>Short note</label>
                  <textarea
                    style={styles.textArea}
                    placeholder="Add a short internal note for staff use."
                    value={partForm.description}
                    onChange={(event) => setPartForm({ ...partForm, description: event.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={styles.label}>Unit price</label>
                    <input
                      style={styles.input}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="1200"
                      value={partForm.price}
                      onChange={(event) => setPartForm({ ...partForm, price: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Stock quantity</label>
                    <input
                      style={styles.input}
                      type="number"
                      min="0"
                      placeholder="10"
                      value={partForm.stockQty}
                      onChange={(event) => setPartForm({ ...partForm, stockQty: event.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    style={{ ...styles.button, ...styles.primaryButton }}
                    disabled={isSavingPart}
                  >
                    {isSavingPart ? 'Saving...' : editingPartId ? 'Update Part' : 'Add Part'}
                  </button>
                  {editingPartId && (
                    <button
                      type="button"
                      style={{ ...styles.button, ...styles.secondaryButton }}
                      onClick={resetPartForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section style={styles.panel} className="gp-fade-up" data-delay="7">
              <div style={styles.headerRow}>
                <div style={styles.titleWrap}>
                  <div style={{ ...styles.iconBox, background: '#fff7ed', color: '#ea580c' }}>
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, color: '#111827', marginBottom: 4 }}>Purchase Stock</h3>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>
                      Record incoming stock quickly and refresh your inventory count.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePurchaseSubmit} style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={styles.label}>Part</label>
                  <select
                    style={styles.input}
                    value={purchaseForm.partId}
                    onChange={(event) => setPurchaseForm({ ...purchaseForm, partId: event.target.value })}
                    required
                  >
                    <option value="">Select part</option>
                    {parts.map((part) => (
                      <option key={part.partId} value={part.partId}>
                        {part.name} ({part.stockQty} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={styles.label}>Quantity</label>
                    <input
                      style={styles.input}
                      type="number"
                      min="1"
                      placeholder="1"
                      value={purchaseForm.quantity}
                      onChange={(event) => setPurchaseForm({ ...purchaseForm, quantity: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Unit cost</label>
                    <input
                      style={styles.input}
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="950"
                      value={purchaseForm.unitCost}
                      onChange={(event) => setPurchaseForm({ ...purchaseForm, unitCost: event.target.value })}
                      required
                    />
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Purchase value</p>
                    <strong style={{ fontSize: 22, color: '#111827' }}>
                      {formatMoney(Number(purchaseForm.quantity || 0) * Number(purchaseForm.unitCost || 0))}
                    </strong>
                  </div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    Inventory updates after the purchase is saved.
                  </span>
                </div>

                <button
                  type="submit"
                  style={{ ...styles.button, ...styles.darkButton }}
                  disabled={isSavingPurchase}
                >
                  {isSavingPurchase ? 'Recording...' : 'Record Purchase'}
                </button>
              </form>
            </section>
          </div>

          <section style={styles.inventoryPanel} className="gp-fade-up" data-delay="8">
            <div style={styles.headerRow}>
              <div style={styles.titleWrap}>
                <div style={{ ...styles.iconBox, background: '#eef2ff', color: '#4f46e5' }}>
                  <Boxes size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, color: '#111827', marginBottom: 4 }}>Inventory List</h3>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>
                    View pricing, stock health, and quick actions in one place.
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  fontSize: 12,
                  color: '#475569',
                  fontWeight: 600,
                }}
              >
                {parts.length} items tracked
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    {['Part', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: '0 12px 8px',
                          fontSize: 12,
                          color: '#6b7280',
                          fontWeight: 700,
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parts.map((part, index) => {
                    const tone = getStockTone(Number(part.stockQty || 0));

                    return (
                      <tr key={part.partId} className="gp-table-row" style={{ animationDelay: `${index * 70}ms` }}>
                        <td
                          style={{
                            padding: '14px 12px',
                            background: '#fff',
                            borderTop: '1px solid #eef2f7',
                            borderBottom: '1px solid #eef2f7',
                            borderLeft: '1px solid #eef2f7',
                            borderTopLeftRadius: 14,
                            borderBottomLeftRadius: 14,
                          }}
                        >
                          <div style={{ display: 'grid', gap: 3 }}>
                            <strong style={{ fontSize: 14, color: '#111827' }}>{part.name}</strong>
                            <span style={{ fontSize: 12, color: '#9ca3af' }}>
                              {part.category || 'General inventory part'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 12px', background: '#fff', borderTop: '1px solid #eef2f7', borderBottom: '1px solid #eef2f7' }}>
                          <span style={{ fontSize: 13, color: '#475569' }}>{part.sku || '-'}</span>
                        </td>
                        <td style={{ padding: '14px 12px', background: '#fff', borderTop: '1px solid #eef2f7', borderBottom: '1px solid #eef2f7' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '6px 10px',
                              borderRadius: 999,
                              background: '#f8fafc',
                              border: '1px solid #e5e7eb',
                              fontSize: 12,
                              color: '#475569',
                              fontWeight: 600,
                            }}
                          >
                            {part.category || 'Unsorted'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', background: '#fff', borderTop: '1px solid #eef2f7', borderBottom: '1px solid #eef2f7' }}>
                          <strong style={{ fontSize: 14, color: '#111827' }}>{formatMoney(part.price)}</strong>
                        </td>
                        <td style={{ padding: '14px 12px', background: '#fff', borderTop: '1px solid #eef2f7', borderBottom: '1px solid #eef2f7' }}>
                          <strong style={{ fontSize: 14, color: '#111827' }}>{part.stockQty}</strong>
                        </td>
                        <td style={{ padding: '14px 12px', background: '#fff', borderTop: '1px solid #eef2f7', borderBottom: '1px solid #eef2f7' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '6px 10px',
                              borderRadius: 999,
                              background: tone.bg,
                              color: tone.color,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {tone.label}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '14px 12px',
                            background: '#fff',
                            borderTop: '1px solid #eef2f7',
                            borderBottom: '1px solid #eef2f7',
                            borderRight: '1px solid #eef2f7',
                            borderTopRightRadius: 14,
                            borderBottomRightRadius: 14,
                          }}
                        >
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              title="Edit part"
                              onClick={() => handleEdit(part)}
                              style={{
                                ...styles.button,
                                padding: 11,
                                background: '#eef2ff',
                                color: '#4338ca',
                              }}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              title="Delete part"
                              onClick={() => handleDelete(part.partId)}
                              style={{
                                ...styles.button,
                                padding: 11,
                                background: '#fff1f2',
                                color: '#be123c',
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!parts.length && (
                    <tr>
                      <td colSpan="7" style={{ padding: '22px 8px' }}>
                        <div
                          style={{
                            borderRadius: 16,
                            border: '1px dashed #d1d5db',
                            background: '#f8fafc',
                            padding: 28,
                            textAlign: 'center',
                            color: '#6b7280',
                          }}
                        >
                          Add your first part to begin managing stock and purchases from this page.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
