/**
 * Application Entry Point
 * 
 * Initializes React application with Redux store, routing, and persistence
 * Configures RTK Query listeners for automatic refetching behaviors
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { setupListeners } from '@reduxjs/toolkit/query';

import './index.css';
import App from './App.jsx';
import { store, persistor } from './store/store.js';

/**
 * Root element selector constant
 */
const ROOT_ELEMENT_ID = 'root';

/**
 * Enable refetchOnFocus and refetchOnReconnect behaviors for RTK Query
 * This allows automatic data refetching when window regains focus or reconnects
 */
setupListeners(store.dispatch);

/**
 * Retrieves the root DOM element
 * 
 * @returns {HTMLElement} - Root element for React rendering
 * @throws {Error} - If root element is not found
 */
const getRootElement = () => {
    const element = document.getElementById(ROOT_ELEMENT_ID);
    if (!element) {
        throw new Error(`Root element with id "${ROOT_ELEMENT_ID}" not found`);
    }
    return element;
};

/**
 * Renders the application to the DOM
 */
const rootElement = getRootElement();

createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <App />
                </PersistGate>
            </Provider>
        </BrowserRouter>
    </StrictMode>
);
