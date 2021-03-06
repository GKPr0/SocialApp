import React from 'react';
import { render } from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import 'react-calendar/dist/Calendar.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-datepicker/dist/react-datepicker.css'
import './app/layout/styles.css';
import App from './app/layout/App';
import { store, StoreContext } from './app/stores/store';
import { Router } from 'react-router-dom';
import {createBrowserHistory} from 'history';


export const history = createBrowserHistory();


const container = document.getElementById('root');
render(<React.StrictMode>
        <StoreContext.Provider value={store}>
          <Router history={history}>
            <App/>
          </Router>
        </StoreContext.Provider>
      </React.StrictMode>,
      container);

