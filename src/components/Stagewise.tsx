import { useEffect } from 'react';

function Stagewise() {
  useEffect(() => {
    async function loadStagewise() {
      if (import.meta.env.MODE === 'development') {
        const { StagewiseToolbar } = await import('@stagewise/toolbar-react');
        const { default: ReactPlugin } = await import(
          '@stagewise-plugins/react'
        );

        const toolbar = document.createElement('div');
        toolbar.id = 'stagewise-toolbar';
        document.body.appendChild(toolbar);

        const ReactDOM = await import('react-dom');
        ReactDOM.render(
          <StagewiseToolbar
            config={{
              plugins: [new ReactPlugin()],
            }}
          />,
          toolbar
        );
      }
    }
    loadStagewise();
  }, []);

  return null;
}

export default Stagewise; 