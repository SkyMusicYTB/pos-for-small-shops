import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const SalesTerminal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [products] = useState<Product[]>([]); // Empty - should be loaded from API

  const categories = ['All', 'Beverages', 'Pastries', 'Food'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  const change = paymentMethod === 'cash' ? Math.max(0, parseFloat(cashReceived || '0') - total) : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (paymentMethod === 'cash' && parseFloat(cashReceived || '0') < total) {
      alert('Insufficient cash received');
      return;
    }

    // Simulate transaction processing
    alert(`Transaction completed successfully!\nTotal: $${total.toFixed(2)}\nPayment: ${paymentMethod.toUpperCase()}\n${paymentMethod === 'cash' ? `Change: $${change.toFixed(2)}` : ''}`);
    
    // Reset cart and form
    setCart([]);
    setCashReceived('');
    setShowCheckout(false);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Sales Terminal</h1>
        <p style={{ color: '#6b7280', marginTop: '0.25rem', margin: 0 }}>Process customer transactions quickly and efficiently</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Product Catalog */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search and Filters */}
          <div className="card">
            <div className="card-content">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <MagnifyingGlassIcon 
                    className="icon-sm" 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6b7280' 
                    }} 
                  />
                  <input
                    type="text"
                    placeholder="Search products or scan barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                  style={{ width: 'auto', minWidth: '150px' }}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {filteredProducts.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <div className="card-content" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <p>No products available. Add products to your inventory to start selling.</p>
                </div>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                  <div className="card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0 }}>{product.name}</h3>
                      <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#2563eb' }}>${product.price.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{product.category}</p>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Stock: {product.stock}</p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-primary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        disabled={product.stock === 0}
                      >
                        <PlusIcon className="icon-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shopping Cart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', margin: 0 }}>Current Order</h3>
            </div>
            <div className="card-content">
              {cart.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem', margin: 0 }}>Cart is empty</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0 }}>{item.product.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>${item.product.price.toFixed(2)} each</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.75rem' }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          style={{ padding: '0.25rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <MinusIcon className="icon-sm" />
                        </button>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', width: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          style={{ padding: '0.25rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <PlusIcon className="icon-sm" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          style={{ padding: '0.25rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.5rem' }}
                        >
                          <TrashIcon className="icon-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {cart.length > 0 && (
            <div className="card">
              <div className="card-content">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Subtotal:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tax (8%):</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>${tax.toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '600' }}>Total:</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#2563eb' }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '400px',
            margin: '1rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>Checkout</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.75rem',
                      border: `1px solid ${paymentMethod === 'cash' ? '#2563eb' : '#d1d5db'}`,
                      borderRadius: '0.5rem',
                      backgroundColor: paymentMethod === 'cash' ? '#eff6ff' : 'white',
                      color: paymentMethod === 'cash' ? '#1d4ed8' : '#374151',
                      cursor: 'pointer'
                    }}
                  >
                    <BanknotesIcon className="icon" style={{ marginRight: '0.5rem' }} />
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.75rem',
                      border: `1px solid ${paymentMethod === 'card' ? '#2563eb' : '#d1d5db'}`,
                      borderRadius: '0.5rem',
                      backgroundColor: paymentMethod === 'card' ? '#eff6ff' : 'white',
                      color: paymentMethod === 'card' ? '#1d4ed8' : '#374151',
                      cursor: 'pointer'
                    }}
                  >
                    <CreditCardIcon className="icon" style={{ marginRight: '0.5rem' }} />
                    Card
                  </button>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Cash Received
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="input"
                    placeholder="Enter amount received"
                  />
                  {cashReceived && parseFloat(cashReceived) >= total && (
                    <p style={{ fontSize: '0.875rem', color: '#16a34a', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                      Change: ${change.toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem' }}>Total Amount:</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={paymentMethod === 'cash' && parseFloat(cashReceived || '0') < total}
                  className="btn btn-success"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CurrencyDollarIcon className="icon-sm" />
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};