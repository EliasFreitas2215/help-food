import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

function NavItem({ to, children, currentPath }) {
  const active = currentPath === to;
  return (
    <Link className={`nav-link ${active ? "nav-link--active" : ""}`} to={to}>
      {children}
    </Link>
  );
}

export default function Navbar({ authenticated = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <header className="topbar topbar--app">
      <Link to={authenticated ? "/dashboard" : "/"} className="brand">
        <img src={logo} alt="Help Food" className="brand__logo" />
        <div className="brand__text">
          <span>Help Food</span>
          <small>Receitas por macronutrientes</small>
        </div>
      </Link>

      <nav className="navbar" aria-label="Navegação principal">
        {authenticated ? (
          <>
            <NavItem to="/dashboard" currentPath={location.pathname}>Painel</NavItem>
            <NavItem to="/macros" currentPath={location.pathname}>Buscar receitas</NavItem>
            <button className="btn btn--primary" onClick={logout}>Sair</button>
          </>
        ) : (
          <>
            <NavItem to="/" currentPath={location.pathname}>Início</NavItem>
            <NavItem to="/login" currentPath={location.pathname}>Entrar</NavItem>
            <Link className="btn btn--primary" to="/register">Criar conta</Link>
          </>
        )}
      </nav>
    </header>
  );
}
