import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/common/Header';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CustomerInfoPage } from './pages/CustomerInfoPage';
import { PaymentPage } from './pages/PaymentPage';
import { ResultPage } from './pages/ResultPage';

// Debug: Test API connection on app load
console.log('=== APP STARTING ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('All env vars:', import.meta.env);

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/customer-info" element={<CustomerInfoPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
