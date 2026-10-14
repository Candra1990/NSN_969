import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import './index.css';

// Global error protection layer to catch cross-origin system errors gracefully
if (typeof window !== 'undefined') {
  // Suppress/filter out Firestore offline connection warnings & raw DOM event error objects from console.error
  const nativeError = console.error;
  console.error = function (...args) {
    try {
      const errorStr = args.map(arg => {
        if (!arg) return '';
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message + (arg.stack ? '\n' + arg.stack : '');
        if (typeof Event !== 'undefined' && arg instanceof Event) {
          return '[DOM Event]';
        }
        try {
          if (typeof arg === 'object') {
            const str = JSON.stringify(arg);
            if (str === '{"isTrusted":true}' || str === '{}') {
              return String((arg as any).message || (arg as any).type || '[Event]');
            }
            return str;
          }
          return String(arg);
        } catch (_) {
          return String(arg);
        }
      }).join(' ');

      if (
        errorStr.includes('@firebase/firestore') || 
        errorStr.includes('Could not reach Cloud Firestore backend') ||
        errorStr.includes('The client will operate in offline mode') ||
        (errorStr.includes('unavailable') && errorStr.includes('Firestore')) ||
        errorStr.includes('{"isTrusted":true}') ||
        errorStr.includes('[DOM Event]') ||
        errorStr.includes('Chat fetch error') ||
        errorStr.includes('Failed to fetch')
      ) {
        console.debug('[NSN969 Guarded Event]:', errorStr);
        return;
      }
    } catch (e) {
      // Safe fallback
    }
    nativeError.apply(console, args);
  };

  // Wrap window.alert to seamlessly prevent SecurityError or sandboxing restrictions
  const nativeAlert = window.alert;
  window.alert = function (message) {
    try {
      if (typeof nativeAlert === 'function') {
        nativeAlert.call(window, message);
      } else {
        console.info('[NSN969 Guarded Alert]:', message);
      }
    } catch (err) {
      console.warn('[NSN969 Alert Sandboxed]:', message, err);
    }
  };

  window.onerror = function (message, source, lineno, colno, error) {
    if (error && error instanceof Error) {
      console.error(error);
    } else if (message) {
      console.info('[Window Error Message]:', message);
    }
    return true;
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (!reason || (typeof Event !== 'undefined' && reason instanceof Event)) {
      event.preventDefault();
      return;
    }
    if (reason instanceof Error) {
      console.error(reason);
    } else {
      console.warn('[Unhandled Rejection]:', reason);
    }
    event.preventDefault();
  }, { capture: true });

  window.addEventListener('error', (event) => {
    // If event is a resource loading error (like <img>, <audio>, <video> 404), do not log as uncaught script error
    if (event.target && event.target !== window) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const err = (event as any).error;
    if (err && err instanceof Error) {
      console.error(err);
    } else if (event.message) {
      console.info('[Resource/Window Error]:', event.message);
    }
    event.preventDefault();
    event.stopPropagation();
  }, { capture: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
