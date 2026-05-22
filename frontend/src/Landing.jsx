import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import heroBanner from "./assets/hero-banner.png";
import featureFood from "./assets/feature-food.png";

const highlights = [
  {
    title: "Busca por macronutrientes",
    text: "Informe carboidratos, proteínas e gorduras para encontrar receitas mais compatíveis com sua meta alimentar.",
  },
  {
    title: "Experiência objetiva",
    text: "------",
  },
  {
    title: "--",
    text: "----",
  },
];

const showcaseItems = [
  "Definição rápida de metas nutricionais",
  "Fluxo simples de cadastro, login e busca",
  "Interface pronta para resultados gerados por IA",
];

export default function Landing() {
  return (
    <div className="site-shell">
      <Navbar />

      <main>
        <section className="hero-section hero-section--enhanced">
          <div className="hero-copy fade-up">
            <span className="eyebrow">Plataforma de receitas nutricionais</span>
            <h1>Descubra receitas ideais para suas metas de macronutrientes.</h1>
            <p>
              O Help Food foi pensado para ajudar o usuário a localizar refeições mais adequadas
              à sua necessidade nutricional, com uma experiência clara, moderna e pronta para
              evoluir com automação e inteligência artificial.
            </p>

            <div className="hero-actions">
              <Link className="btn btn--primary btn--lg" to="/register">
                Começar agora
              </Link>
              <Link className="btn btn--secondary btn--lg" to="/login">
                Já tenho conta
              </Link>
            </div>

            <div className="hero-stats hero-stats--enhanced">
              <div className="stat-card stat-card--accent">
                <strong>Busca inteligente</strong>
                <span>Encontre receitas com foco em equilíbrio entre carboidratos, proteínas e gorduras.</span>
              </div>
              <div className="stat-card">
                <strong>--</strong>
                <span>--</span>
              </div>
            </div>
          </div>

          <div className="hero-media hero-media--floating slide-in-right">
            <img src={heroBanner} alt="Receitas e alimentação equilibrada" />
            <div className="floating-panel floating-panel--top">
              <span>Meta nutricional</span>
              <strong>100g proteína · 80g carbo · 20g gordura</strong>
            </div>
            <div className="floating-panel floating-panel--bottom">
              <span>--</span>
              <strong>--</strong>
            </div>
          </div>
        </section>

        <section className="section-grid section-grid--startup">
          <div className="feature-panel feature-panel--image slide-in-left">
            <img src={featureFood} alt="Ingredientes e alimentação saudável" />
          </div>

          <div className="feature-panel feature-panel--content fade-up delay-1">
            <span className="eyebrow">Como o sistema funciona</span>
            <h2>--</h2>
            <p>
              O foco da plataforma é permitir que o usuário informe metas nutricionais e encontre
              receitas alinhadas ao seu objetivo. Toda a comunicação visual foi ajustada para reforçar
              essa proposta de valor.
            </p>

            <div className="feature-list">
              {highlights.map((item) => (
                <article className="mini-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="showcase-strip fade-up delay-2">
          {showcaseItems.map((item) => (
            <div className="showcase-strip__item" key={item}>
              <span className="showcase-strip__dot" />
              <strong>{item}</strong>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
