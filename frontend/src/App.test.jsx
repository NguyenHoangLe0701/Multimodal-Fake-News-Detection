import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    // Tạm thời mock window.matchMedia nếu UI thư viện nào đó dùng nó (phổ biến)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {}, // Deprecated
        removeListener: () => {}, // Deprecated
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Tìm thử 1 text cơ bản để check (bạn có thể thay đổi tùy UI)
    // expect(screen.getByText(/AntiFakeNews/i)).toBeInTheDocument();
  });
});
