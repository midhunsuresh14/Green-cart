import React, { useMemo, useEffect } from 'react';

export default function CartDrawer({ open, onClose, items = [], onUpdateQuantity, onRemoveItem, onCheckout }) {
  // Image URL resolution function
  const resolveImageUrl = useMemo(() => {
    return (src) => {
      if (!src) return 'https://images.unsplash.com/photo-1509423350716-97f2360af5e4?auto=format&fit=crop&w=200&q=80';
      // If it's already a full URL, return as is
      if (/^https?:\/\//i.test(src)) return src;
      // If it's a local path that already starts with /uploads/, prepend the backend URL
      if (src.startsWith('/uploads/')) {
        const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
        const host = apiBase.replace(/\/api\/?$/, '');
        return host + src;
      }
      // If it's a local path, prepend the API base URL
      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      const host = apiBase.replace(/\/api\/?$/, '');
      return src.startsWith('/') ? host + src : host + '/' + src;
    };
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const total = items.reduce((sum, i) => sum + (Number(i.finalPrice || i.price || 0) * Number(i.quantity || 1)), 0);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'white',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 10000,
        }}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Your Cart</h3>
          <button 
            aria-label="Close" 
            onClick={onClose} 
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              border: 'none', 
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '18px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'calc(100% - 144px)', 
          overflowY: 'auto', 
          padding: '16px', 
          gap: '16px' 
        }}>
          {items.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '48px 0' }}>
              Your cart is empty.
            </div>
          )}
          {items.map((i) => (
            <div key={i.id} style={{ 
              display: 'flex', 
              gap: '12px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '12px' 
            }}>
              <img 
                src={resolveImageUrl(i.imageUrl || i.image || i.images?.[0])} 
                alt={i.name} 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  objectFit: 'cover', 
                  borderRadius: '4px' 
                }} 
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontWeight: '500', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#16a34a', margin: '4px 0 0 0' }}>
                      Limited time discount
                    </p>
                  </div>
                  <button 
                    onClick={() => onRemoveItem && onRemoveItem(i.id)} 
                    style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    onMouseOver={(e) => e.target.style.color = '#dc2626'}
                    onMouseOut={(e) => e.target.style.color = '#6b7280'}
                  >
                    Remove
                  </button>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                    <button
                      style={{ padding: '4px 8px', border: 'none', background: 'white', cursor: 'pointer' }}
                      onClick={() => onUpdateQuantity && onUpdateQuantity(i.id, Math.max(1, (i.quantity || 1) - 1))}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      -
                    </button>
                    <span style={{ padding: '4px 12px', userSelect: 'none' }}>{i.quantity || 1}</span>
                    <button
                      style={{ padding: '4px 8px', border: 'none', background: 'white', cursor: 'pointer' }}
                      onClick={() => onUpdateQuantity && onUpdateQuantity(i.id, (i.quantity || 1) + 1)}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '600', margin: 0 }}>₹{Number(i.finalPrice || i.price || 0).toFixed(2)}</p>
                    {i.originalPrice && (
                      <p style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'line-through', margin: 0 }}>
                        ₹{Number(i.originalPrice).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '16px', 
          borderTop: '1px solid #e5e7eb', 
          backgroundColor: 'white' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{total.toFixed(2)}</span>
          </div>
          <button
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#2e7d32',
              color: 'white',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              opacity: items.length === 0 ? 0.5 : 1,
              pointerEvents: items.length === 0 ? 'none' : 'auto'
            }}
            disabled={items.length === 0}
            onClick={onCheckout}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1b5e20'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2e7d32'}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
