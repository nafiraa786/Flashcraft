import { FileSystemTree } from '@webcontainer/api';

export const viteTemplate: FileSystemTree = {
  'package.json': {
    file: {
      contents: `
{
  "name": "flashcraft-generated-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5"
  }
}
      `.trim(),
    },
  },
  'vite.config.js': {
    file: {
      contents: `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all addresses
  }
})
      `.trim(),
    },
  },
  'index.html': {
    file: {
      contents: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FlashCraft App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
      `.trim(),
    },
  },
  'src': {
    directory: {
      'main.jsx': {
        file: {
          contents: `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
          `.trim(),
        },
      },
      'App.jsx': {
        file: {
          contents: `
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', color: '#fff', backgroundColor: '#0a0e1a', minHeight: '100vh' }}>
        <h1>FlashCraft</h1>
        <p>This is a live React app running inside your browser!</p>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)} style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
      </div>
    </>
  )
}

export default App
          `.trim(),
        },
      },
      'index.css': {
        file: {
          contents: `
body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}
          `.trim(),
        },
      },
      'App.css': {
        file: {
          contents: `
          `.trim(),
        },
      },
    },
  },
};
