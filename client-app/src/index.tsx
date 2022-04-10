import React from 'react';
import { render } from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import App from './App';


const container = document.getElementById('root');
render(<React.StrictMode>
        <App />
      </React.StrictMode>,
      container);

