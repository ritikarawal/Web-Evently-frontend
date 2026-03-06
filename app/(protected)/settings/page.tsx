import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <Sidebar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>
        <p className="text-gray-600">This is your settings page. Add your settings UI here.</p>
      </div>
    </div>
  );
}
