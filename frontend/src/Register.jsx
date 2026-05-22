import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "./api";
import logo from "./assets/logo.png";
import featureFood from "./assets/feature-food.png";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Cadastro | Help Food";
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await api.post("/register", form);
      setMsg(res.data.message || "Cadastro realizado com sucesso.");
    } catch (err) {
      setMsg(err?.response?.data?.detail || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-card auth-card--wide fade-up">
        <div className="auth-card__header auth-card__header--left">
          <img src={logo} alt="Help Food" className="auth-logo" />
          <h2>Criar conta</h2>
          <p>
            Cadastre-se para acessar a plataforma e iniciar suas buscas por receitas de acordo
            com metas de carboidratos, proteínas e gorduras.
          </p>
        </div>

        <form className="auth-form auth-form--grid" onSubmit={submit}>
          <label>
            Nome
            <input
              placeholder="Seu nome completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label>
            E-mail
            <input
              placeholder="Seu melhor e-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              placeholder="Crie uma senha segura"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>

          <label>
            CPF
            <input
              placeholder="CPF (opcional)"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            />
          </label>

          <label className="span-2">
            Endereço
            <input
              placeholder="Rua e número (opcional)"
              value={form.address_line1}
              onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
            />
          </label>

          <label>
            Complemento
            <input
              placeholder="Complemento (opcional)"
              value={form.address_line2}
              onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
            />
          </label>

          <label>
            Cidade
            <input
              placeholder="Cidade (opcional)"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </label>

          <label>
            Estado
            <input
              placeholder="Estado (opcional)"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </label>

          <label>
            CEP
            <input
              placeholder="CEP (opcional)"
              value={form.postal_code}
              onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
            />
          </label>

          <label>
            País
            <input
              placeholder="País (opcional)"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </label>

          <div className="span-2 auth-form__actions">
            <button className="btn btn--primary btn--block" disabled={loading}>
              {loading ? "Cadastrando..." : "Criar minha conta"}
            </button>
          </div>
        </form>

        {msg && <div className="alert alert--success">{msg}</div>}

        <p className="auth-card__footer">
          Já possui conta? <Link to="/login">Ir para login</Link>
        </p>
      </div>

      <div className="auth-visual auth-visual--register slide-in-right">
        <img src={featureFood} alt="Ingredientes saudáveis" className="auth-visual__banner" />
        <div className="auth-visual__content">
          <span className="eyebrow eyebrow--light">Projeto com foco nutricional</span>
          <h1>Crie sua conta e prepare a plataforma para recomendações personalizadas.</h1>
          <p>
            O cadastro é a primeira etapa para registrar usuários, salvar preferências e evoluir
            o sistema para buscas mais completas no próximo passo do projeto.
          </p>
        </div>
      </div>
    </div>
  );
}
