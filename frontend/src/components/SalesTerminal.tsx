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

const mockProducts: Product[] = [
  { id: '1', name: 'Americano Coffee', price: 3.50, category: 'Beverages', stock: 100, barcode: '123456789' },
  { id: '2', name: 'Croissant', price: 2.25, category: 'Pastries', stock: 25, barcode: '987654321' },
  { id: '3', name: 'Cappuccino', price: 4.00, category: 'Beverages', stock: 100, barcode: '456789123' },
  { id: '4', name: 'Blueberry Muffin', price: 2.75, category: 'Pastries', stock: 15, barcode: '789123456' },
  { id: '5', name: 'Latte', price: 4.25, category: 'Beverages', stock: 100, barcode: '321654987' },
  { id: '6', name: 'Sandwich - Ham & Cheese', price: 6.50, category: 'Food', stock: 20, barcode: '654987321' },
  { id: '7', name: 'Green Tea', price: 2.50, category: 'Beverages', stock: 50, barcode: '147258369' },
  { id: '8', name: 'Chocolate Chip Cookie', price: 1.75, category: 'Pastries', stock: 30, barcode: '963852741' },
];

export const SalesTerminal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const categories = ['All', 'Beverages', 'Pastries', 'Food'];

  const filteredProducts = mockProducts.filter(product => {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Terminal</h1>
        <p className="text-gray-600">Process customer transactions quickly and efficiently</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="card">
            <div className="card-content">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products or scan barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input w-full sm:w-auto"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="card cursor-pointer hover:shadow-medium transition-shadow">
                <div className="card-content">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                    <span className="text-lg font-bold text-primary-600">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">{product.category}</p>
                      <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn-primary text-xs px-3 py-1"
                      disabled={product.stock === 0}
                    >
                      <PlusIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Cart */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Current Order</h3>
            </div>
            <div className="card-content">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-xs text-gray-500">${item.product.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-danger-400 hover:text-danger-600 ml-2"
                        >
                          <TrashIcon className="h-4 w-4" />
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
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax (8%):</span>
                    <span className="text-sm font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold">Total:</span>
                      <span className="text-lg font-bold text-primary-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="btn-primary w-full mt-4"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Checkout</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex items-center justify-center p-3 border rounded-lg ${
                        paymentMethod === 'cash' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300'
                      }`}
                    >
                      <BanknotesIcon className="h-5 w-5 mr-2" />
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center p-3 border rounded-lg ${
                        paymentMethod === 'card' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300'
                      }`}
                    >
                      <CreditCardIcon className="h-5 w-5 mr-2" />
                      Card
                    </button>
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <p className="text-sm text-success-600 mt-1">
                        Change: ${change.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Total Amount:</span>
                    <span className="text-lg font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={paymentMethod === 'cash' && parseFloat(cashReceived || '0') < total}
                    className="btn-success flex items-center gap-2"
                  >
                    <CurrencyDollarIcon className="h-4 w-4" />
                    Complete Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};