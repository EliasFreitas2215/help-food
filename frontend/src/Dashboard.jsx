import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import heroBanner from "./assets/hero-banner.png";

const recipeCards = [
  {
    title: "Frango grelhado com arroz integral",
    meta: "42g proteína • 48g carbo • 12g gordura",
    text: "Exemplo de refeição equilibrada para almoço ou jantar com boa distribuição entre proteína e energia.",
  },
  {
    title: "Omelete com legumes e ricota",
    meta: "28g proteína • 16g carbo • 14g gordura",
    text: "Sugestão prática para quem busca uma refeição leve com boa densidade proteica e preparo simples.",
  },
  {
    title: "Iogurte com aveia e frutas",
    meta: "20g proteína • 35g carbo • 8g gordura",
    text: "Opção funcional para café da manhã ou lanche, com combinação equilibrada de saciedade e energia.",
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <Navbar authenticated />

      <main className="dashboard-main">
        <section className="dashboard-hero fade-up">
          <div className="dashboard-hero__copy">
            <span className="eyebrow">Painel nutricional</span>
            <h1>Centralize sua experiência e avance para a busca por receitas.</h1>
            <p>
              --
            </p>
            <div className="hero-actions">
              <Link className="btn btn--primary btn--lg" to="/macros">
                Buscar receitas
              </Link>
              <Link className="btn btn--secondary btn--lg" to="/">
                Ver apresentação
              </Link>
            </div>
          </div>

          <div className="dashboard-hero__media dashboard-hero__media--highlight slide-in-right">
            <img src={heroBanner} alt="Painel do sistema Help Food" />
            <div className="floating-panel floating-panel--dashboard">
              <span>--</span>
              <strong>--</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-strip slide-in-left">
          <div className="dashboard-strip__item">
            <strong>Busca personalizada</strong>
            <span>Defina macronutrientes e encontre refeições compatíveis com diferentes objetivos.</span>
          </div>
          <div className="dashboard-strip__item">
            <strong>--</strong>
            <span>--</span>
          </div>
          <div className="dashboard-strip__item">
            <strong>--</strong>
            <span>--</span>
          </div>
        </section>

        <section className="recipes-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Exemplos visuais</span>
              <h2>Receitas ilustrativas para demonstrar o objetivo da plataforma</h2>
            </div>
            <Link className="btn btn--ghost-dark" to="/macros">
              Abrir busca
            </Link>
          </div>

          <div className="recipes-grid">
            {recipeCards.map((card) => (
              <article className="recipe-card fade-up" key={card.title}>
                <div className="recipe-card__badge">Exemplo</div>
                <h3>{card.title}</h3>
                <span className="recipe-card__meta">{card.meta}</span>
                <p>{card.text}</p>
                <Link to="/macros" className="recipe-card__link">
                  Buscar opções similares
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
