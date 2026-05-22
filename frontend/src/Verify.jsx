import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "./api";
import logo from "./assets/logo.png";

export default function Verify() {
  const { token } = useParams();
  const [msg, setMsg] = useState("Confirmando seu cadastro na plataforma Help Food...");

  useEffect(() => {
    document.title = "Verificação | Help Food";
    api
      .get(`/verify/${token}`)
      .then((res) => setMsg(res.data.message))
      .catch((err) => setMsg(err?.response?.data?.detail || "Erro ao verificar a conta."));
  }, [token]);

  return (
    <div className="verify-page">
      <div className="verify-card fade-up">
        <img src={logo} alt="Help Food" className="auth-logo" />
        <h2>Verificação de conta</h2>
        <p>{msg}</p>
        <Link className="btn btn--primary" to="/login">
          Ir para login
        </Link>
      </div>
    </div>
  );
}
