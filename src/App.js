import MapView from './MapView';

export default function App() {
  return (
    <div
      style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <header
        style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}
      >
        <h1 style={{ margin: 0, fontSize: 20 }}>
          WindBorne Constellation — Last 24h
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Base map</p>
      </header>
      <main style={{ flex: 1, padding: 16 }}>
        <MapView />
      </main>
    </div>
  );
}
