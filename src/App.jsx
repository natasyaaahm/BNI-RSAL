// App.jsx
import { useState, useEffect, useCallback } from "react";
import { getAllData, getAllDataTeller } from "./api";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Crud from "./pages/Crud";
import Login from "./pages/Login";
import TellerDashboard from "./pages/TellerDashboard";
import "./global.css";

// ── Session helpers ──────────────────────────────────────────
const SESSION_KEY = "bni_session";

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Cek apakah session sudah expired
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const [page, setPage]       = useState("dashboard");
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataTeller, setDataTeller]   = useState(null);
  const [tellerLoading, setTellerLoading] = useState(true);
  const [sidebarOpen, setSidebar] = useState(false);

  // Session state — diinisialisasi dari localStorage
  const [session, setSession] = useState(() => getStoredSession());

  // Collapsed sidebar state
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; }
    catch { return false; }
  });

  // Simpan collapsed ke localStorage
  useEffect(() => {
    try { localStorage.setItem("sidebar-collapsed", String(collapsed)); }
    catch {}
  }, [collapsed]);

  // ── Auth handlers ──
  const handleLogin = (newSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setData(null);
    setPage("dashboard");
  };

  // ── Data fetching ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getAllData();
      setData(d);
    } catch (err) {
      console.error("Gagal memuat data:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);
  useEffect(() => {
    if (!session) return;
    getAllDataTeller()
      .then(setDataTeller)
      .catch(() => setDataTeller([]))
      .finally(() => setTellerLoading(false));
  }, [session]);


  const handleNavigate = (newPage) => {
    setPage(newPage);
    setSidebar(false);
  };

  // ── Belum login → tampilkan halaman Login ──
  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  const tellerProps = { data: dataTeller, loading: tellerLoading };

  return (
    <div className="flex min-h-screen bg-[#F0F4FA] overflow-x-hidden">

      <Sidebar
        page={page}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebar(false)}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        session={session}
        onLogout={handleLogout}
      />

      <div className={[
        "flex flex-col flex-1 min-w-0 min-h-screen",
        "transition-[margin] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "lg:ml-16" : "lg:ml-64",
      ].join(" ")}>

        <Topbar
          page={page}
          onNavigate={handleNavigate}
          onOpenSidebar={() => setSidebar(true)}
          session={session}
          onLogout={handleLogout}
        />

        <main className="flex-1 min-w-0 overflow-x-hidden pb-24 lg:pb-0">
          {page === "dashboard" && <Dashboard data={data} loading={loading} onNavigate={handleNavigate} />}
          {page === "tellerdashboard" && <TellerDashboard {...tellerProps} />}
          {page === "crud"      && <Crud data={data} loading={loading} onRefresh={loadData} />}
        </main>

      </div>

      <BottomNav page={page} onNavigate={handleNavigate} />
    </div>
  );
}