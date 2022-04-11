import React from 'react';
import { render } from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import 'react-calendar/dist/Calendar.css';
import './app/layout/styles.css';
import App from './app/layout/App';
import { store, StoreContext } from './app/stores/store';
import { BrowserRouter } from 'react-router-dom';


const container = document.getElementById('root');
render(<React.StrictMode>
        <StoreContext.Provider value={store}>
          <BrowserRouter>
            <App/>
          </BrowserRouter>
        </StoreContext.Provider>
      </React.StrictMode>,
      container);

