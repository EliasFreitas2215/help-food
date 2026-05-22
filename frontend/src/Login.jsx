import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "./api";
import logo from "./assets/logo.png";
import heroBanner from "./assets/hero-banner.png";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.title = "Login | Help Food";
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await api.post("/login", form);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setMsg(err?.response?.data?.detail || "Erro ao realizar login.");
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-visual auth-visual--login">
        <img src={heroBanner} alt="Banner Help Food" className="auth-visual__banner" />
        <div className="auth-visual__content fade-up">
          <span className="eyebrow eyebrow--light">Acesso à plataforma</span>
          <h1>Entre e continue sua busca por receitas baseadas em macronutrientes.</h1>
          <p>
            Faça login para acessar sua área principal, definir metas nutricionais e preparar o
            sistema para receber sugestões personalizadas de receitas.
          </p>
        </div>
      </div>

      <div className="auth-card fade-up delay-1">
        <div className="auth-card__header">
          <img src={logo} alt="Help Food" className="auth-logo" />
          <h2>Entrar</h2>
          <p>Acesse sua conta para continuar no Help Food.</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label>
            E-mail
            <input
              placeholder="Digite seu e-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              placeholder="Digite sua senha"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>

          <button className="btn btn--primary btn--block" disabled={loading}>
            {loading ? "Entrando..." : "Acessar plataforma"}
          </button>
        </form>

        {msg && <div className="alert alert--error">{msg}</div>}

        <p className="auth-card__footer">
          Ainda não tem conta? <Link to="/register">Criar cadastro</Link>
        </p>
      </div>
    </div>
  );
}
