import { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import { api } from "./api";

const PROTEIN_OPTIONS = [
  { value: "qualquer", label: "Qualquer" },
  { value: "frango", label: "Frango" },
  { value: "carne_bovina", label: "Carne bovina" },
  { value: "peixe", label: "Peixe" },
  { value: "ovo", label: "Ovos" },
  { value: "suina", label: "Carne suína" },
  { value: "vegetal", label: "Proteína vegetal" },
];

const RESTRICTION_OPTIONS = [
  { value: "nenhuma", label: "Nenhuma" },
  { value: "vegetariana", label: "Vegetariana" },
  { value: "vegana", label: "Vegana" },
  { value: "sem_lactose", label: "Sem lactose" },
  { value: "sem_gluten", label: "Sem glúten" },
];

const COMPLEXITY_OPTIONS = [
  { value: "facil", label: "Fácil" },
  { value: "media", label: "Média" },
  { value: "avancada", label: "Avançada" },
];

const MICRONUTRIENT_FIELDS = [
  { name: "vitamin_a", label: "Vitamina A", unit: "mcg", max: 5000 },
  { name: "vitamin_c", label: "Vitamina C", unit: "mg", max: 3000 },
  { name: "vitamin_d", label: "Vitamina D", unit: "UI", max: 4000 },
  { name: "vitamin_e", label: "Vitamina E", unit: "mg", max: 1000 },
  { name: "vitamin_b12", label: "Vitamina B12", unit: "mcg", max: 5000 },
  { name: "calcium", label: "Cálcio", unit: "mg", max: 3000 },
  { name: "iron", label: "Ferro", unit: "mg", max: 100 },
  { name: "magnesium", label: "Magnésio", unit: "mg", max: 1000 },
  { name: "potassium", label: "Potássio", unit: "mg", max: 6000 },
  { name: "zinc", label: "Zinco", unit: "mg", max: 100 },
];

const INITIAL_MICRONUTRIENTS = {
  vitamin_a: "",
  vitamin_c: "",
  vitamin_d: "",
  vitamin_e: "",
  vitamin_b12: "",
  calcium: "",
  iron: "",
  magnesium: "",
  potassium: "",
  zinc: "",
};

const INITIAL_FORM = {
  advanced_mode: false,
  micronutrients: INITIAL_MICRONUTRIENTS,
  carbs_min: 80,
  carbs_max: 150,
  protein_min: 90,
  protein_max: 140,
  fat_min: 20,
  fat_max: 45,
  protein_type: "qualquer",
  dietary_restriction: "nenhuma",
  recipe_complexity: "facil",
};

const sampleResults = [
  {
    title: "Frango grelhado com arroz integral",
    description: "Exemplo visual de receita compatível com metas equilibradas para almoço ou jantar.",
    macros: "42g proteína • 48g carbo • 12g gordura",
  },
  {
    title: "Omelete proteica com legumes",
    description: "Alternativa prática de preparo simples para rotina com foco em proteína.",
    macros: "30g proteína • 14g carbo • 10g gordura",
  },
  {
    title: "Tofu com legumes salteados",
    description: "Opção que representa filtros com proteína vegetal e restrições alimentares.",
    macros: "24g proteína • 18g carbo • 11g gordura",
  },
];

function extractMessage(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" | ");
  }
  if (typeof detail === "string") {
    return detail;
  }
  return "Não foi possível salvar os dados de macronutrientes.";
}

export default function MacrosPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [fieldErrors, setFieldErrors] = useState({});
  const [latestRequest, setLatestRequest] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);

  useEffect(() => {
    document.title = "Macronutrientes | Help Food";
    loadLatestRequest();
    loadRecipes();
  }, []);

  const estimatedCalories = useMemo(() => {
    const avgCarbs = (Number(form.carbs_min) + Number(form.carbs_max)) / 2;
    const avgProtein = (Number(form.protein_min) + Number(form.protein_max)) / 2;
    const avgFat = (Number(form.fat_min) + Number(form.fat_max)) / 2;
    return Math.round(avgCarbs * 4 + avgProtein * 4 + avgFat * 9);
  }, [form]);

  async function loadLatestRequest() {
    try {
      const response = await api.get("/macro-request/me/latest");
      setLatestRequest(response.data);
    } catch (error) {
      if (error?.response?.status !== 404) {
        setMessageType("error");
        setMessage("Não foi possível carregar a última configuração salva.");
      }
    }
  }

  async function loadRecipes() {
    try {
      const response = await api.get("/recipes");
      setRecipes(response.data);
    } catch (error) {
      if (error?.response?.status !== 404) {
        setMessageType("error");
        setMessage("Não foi possível carregar as receitas geradas.");
      }
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  function updateMicronutrient(field, value) {
    setForm((current) => ({
      ...current,
      micronutrients: { ...current.micronutrients, [field]: value },
    }));
    setFieldErrors((current) => ({ ...current, [`micronutrients.${field}`]: "" }));
  }

  function toggleAdvancedMode() {
    setForm((current) => ({ ...current, advanced_mode: !current.advanced_mode }));
    setMessage("");
  }

  function validateForm() {
    const errors = {};
    const numericFields = [
      ["carbs_min", "Carboidratos mínimos"],
      ["carbs_max", "Carboidratos máximos"],
      ["protein_min", "Proteínas mínimas"],
      ["protein_max", "Proteínas máximas"],
      ["fat_min", "Gorduras mínimas"],
      ["fat_max", "Gorduras máximas"],
    ];

    for (const [field, label] of numericFields) {
      const value = Number(form[field]);
      if (Number.isNaN(value)) {
        errors[field] = `${label} deve ser numérico.`;
      }
      if (value < 0) {
        errors[field] = `${label} não pode ser negativo.`;
      }
    }

    if (Number(form.carbs_min) > Number(form.carbs_max)) {
      errors.carbs_min = "O mínimo de carboidratos não pode ser maior que o máximo.";
      errors.carbs_max = "O máximo de carboidratos deve ser maior ou igual ao mínimo.";
    }
    if (Number(form.protein_min) > Number(form.protein_max)) {
      errors.protein_min = "O mínimo de proteínas não pode ser maior que o máximo.";
      errors.protein_max = "O máximo de proteínas deve ser maior ou igual ao mínimo.";
    }
    if (Number(form.fat_min) > Number(form.fat_max)) {
      errors.fat_min = "O mínimo de gorduras não pode ser maior que o máximo.";
      errors.fat_max = "O máximo de gorduras deve ser maior ou igual ao mínimo.";
    }

    if (form.advanced_mode) {
      const hasMicronutrient = MICRONUTRIENT_FIELDS.some((field) => form.micronutrients[field.name] !== "");
      if (!hasMicronutrient) {
        errors.micronutrients = "Preencha pelo menos um micronutriente para usar o modo avançado.";
      }

      for (const field of MICRONUTRIENT_FIELDS) {
        const rawValue = form.micronutrients[field.name];
        if (rawValue === "") continue;
        const value = Number(rawValue);
        if (Number.isNaN(value) || value < 0) {
          errors[`micronutrients.${field.name}`] = `${field.label} deve ser um número positivo.`;
        }
        if (value > field.max) {
          errors[`micronutrients.${field.name}`] = `${field.label} deve ser menor ou igual a ${field.max} ${field.unit}.`;
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function resetFilters() {
    setForm({ ...INITIAL_FORM, micronutrients: { ...INITIAL_MICRONUTRIENTS } });
    setFieldErrors({});
    setMessage("");
  }


  function buildPayload() {
    const micronutrients = {};

    if (form.advanced_mode) {
      for (const field of MICRONUTRIENT_FIELDS) {
        const value = form.micronutrients[field.name];
        if (value !== "") {
          micronutrients[field.name] = Number(value);
        }
      }
    }

    return {
      advanced_mode: form.advanced_mode,
      micronutrients: form.advanced_mode ? micronutrients : null,
      carbs_min: Number(form.carbs_min),
      carbs_max: Number(form.carbs_max),
      protein_min: Number(form.protein_min),
      protein_max: Number(form.protein_max),
      fat_min: Number(form.fat_min),
      fat_max: Number(form.fat_max),
      protein_type: form.protein_type,
      dietary_restriction: form.dietary_restriction,
      recipe_complexity: form.recipe_complexity,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("success");

    if (!validateForm()) {
      setMessageType("error");
      setMessage("Revise os campos destacados antes de continuar.");
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      const response = await api.post("/macro-request", payload);
      setLatestRequest(response.data);
      setMessageType("success");
      setMessage("Metas nutricionais salvas com sucesso.");
    } catch (error) {
      setMessageType("error");
      setMessage(extractMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateRecipe() {
    setMessage("");
    setMessageType("success");

    if (!validateForm()) {
      setMessageType("error");
      setMessage("Revise os campos destacados antes de gerar a receita.");
      return;
    }

    setGeneratingRecipe(true);
    try {
      const payload = buildPayload();
      const response = await api.post("/recipes/generate", payload);
      setLatestRequest(response.data.macro_request);
      setRecipes((current) => [response.data.recipe, ...current]);
      setMessageType("success");
      setMessage("Receita gerada pela IA e salva no banco com sucesso.");
    } catch (error) {
      setMessageType("error");
      setMessage(extractMessage(error) || "Não foi possível gerar a receita com IA.");
    } finally {
      setGeneratingRecipe(false);
    }
  }

  function renderFieldError(name) {
    if (!fieldErrors[name]) return null;
    return <small className="field-error">{fieldErrors[name]}</small>;
  }

  return (
    <div className="macros-page">
      <Navbar authenticated />

      <main className="macros-layout">
        <section className="macros-intro fade-up">
          <span className="eyebrow">Cadastro de metas nutricionais</span>
          <h1>Defina intervalos de macronutrientes e aplique filtros para a próxima etapa de sugestões.</h1>
          <p>
Nesta fase, o formulário envia os macronutrientes ao backend, aciona o webhook do n8n,
            recebe a receita estruturada da IA, salva no banco e exibe o resultado na tela.
          </p>
        </section>

        <form className="macro-request-form macro-builder slide-in-left" onSubmit={handleSubmit}>
          <div className="macro-field-group">
            <h2>Carboidratos</h2>
            <div className="macro-range-grid">
              <label>
                Mínimo (g)
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={form.carbs_min}
                  onChange={(e) => updateField("carbs_min", e.target.value)}
                />
                {renderFieldError("carbs_min")}
              </label>
              <label>
                Máximo (g)
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={form.carbs_max}
                  onChange={(e) => updateField("carbs_max", e.target.value)}
                />
                {renderFieldError("carbs_max")}
              </label>
            </div>
          </div>

          <div className="macro-field-group">
            <h2>Proteínas</h2>
            <div className="macro-range-grid">
              <label>
                Mínimo (g)
                <input
                  type="number"
                  min="0"
                  max="400"
                  value={form.protein_min}
                  onChange={(e) => updateField("protein_min", e.target.value)}
                />
                {renderFieldError("protein_min")}
              </label>
              <label>
                Máximo (g)
                <input
                  type="number"
                  min="0"
                  max="400"
                  value={form.protein_max}
                  onChange={(e) => updateField("protein_max", e.target.value)}
                />
                {renderFieldError("protein_max")}
              </label>
            </div>
          </div>

          <div className="macro-field-group">
            <h2>Gorduras</h2>
            <div className="macro-range-grid">
              <label>
                Mínimo (g)
                <input
                  type="number"
                  min="0"
                  max="250"
                  value={form.fat_min}
                  onChange={(e) => updateField("fat_min", e.target.value)}
                />
                {renderFieldError("fat_min")}
              </label>
              <label>
                Máximo (g)
                <input
                  type="number"
                  min="0"
                  max="250"
                  value={form.fat_max}
                  onChange={(e) => updateField("fat_max", e.target.value)}
                />
                {renderFieldError("fat_max")}
              </label>
            </div>
          </div>

          <div className="macro-field-group macro-field-group--filters span-3">
            <h2>Filtros da receita</h2>
            <div className="macro-filter-grid">
              <label>
                Tipo de proteína
                <select
                  value={form.protein_type}
                  onChange={(e) => updateField("protein_type", e.target.value)}
                >
                  {PROTEIN_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label>
                Restrição alimentar
                <select
                  value={form.dietary_restriction}
                  onChange={(e) => updateField("dietary_restriction", e.target.value)}
                >
                  {RESTRICTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label>
                Complexidade da receita
                <select
                  value={form.recipe_complexity}
                  onChange={(e) => updateField("recipe_complexity", e.target.value)}
                >
                  {COMPLEXITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="advanced-mode-card span-3">
            <div>
              <span className="goal-card__tag">Fase 4</span>
              <h2>Modo Avançado com micronutrientes</h2>
              <p>Inclua vitaminas e minerais para a IA otimizar a receita além dos macros.</p>
            </div>
            <button className="btn btn--secondary" type="button" onClick={toggleAdvancedMode}>
              {form.advanced_mode ? "Desativar Modo Avançado" : "Ativar Modo Avançado"}
            </button>
          </div>

          {form.advanced_mode && (
            <div className="macro-field-group span-3">
              <h2>Questionário de micronutrientes</h2>
              <p className="field-hint">Informe metas por porção. Deixe em branco o que não quiser controlar.</p>
              {fieldErrors.micronutrients && <small className="field-error">{fieldErrors.micronutrients}</small>}
              <div className="micronutrient-grid">
                {MICRONUTRIENT_FIELDS.map((field) => (
                  <label key={field.name}>
                    {field.label} ({field.unit})
                    <input
                      type="number"
                      min="0"
                      max={field.max}
                      value={form.micronutrients[field.name]}
                      onChange={(e) => updateMicronutrient(field.name, e.target.value)}
                      placeholder={`Até ${field.max}`}
                    />
                    {renderFieldError(`micronutrients.${field.name}`)}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="macro-summary span-3">
            <div>
              <span>Estimativa calórica média</span>
              <strong>{estimatedCalories} kcal</strong>
            </div>
            <p>
              A estimativa usa a média entre mínimo e máximo de cada macro para representar uma
              meta intermediária de referência.
            </p>
          </div>

          <div className="macro-actions span-3">
            <button className="btn btn--primary" type="button" onClick={handleGenerateRecipe} disabled={generatingRecipe || loading}>
              {generatingRecipe ? "Gerando com IA..." : "Gerar receita com IA"}
            </button>
            <button className="btn btn--secondary" type="submit" disabled={loading || generatingRecipe}>
              {loading ? "Salvando..." : "Salvar somente metas"}
            </button>
            <button className="btn btn--secondary" type="button" onClick={resetFilters}>
              Limpar formulário
            </button>
          </div>
        </form>

        {message && (
          <div className={`alert ${messageType === "error" ? "alert--error" : "alert--success"}`}>
            {message}
          </div>
        )}

        <section className="goal-cards">
          <article className="goal-card fade-up">
            <span className="goal-card__tag">Persistência</span>
            <h3>Dados salvos no banco</h3>
            <p>O endpoint POST /macro-request já registra os intervalos e filtros vinculados ao usuário autenticado.</p>
          </article>
          <article className="goal-card fade-up delay-1">
            <span className="goal-card__tag">Validação</span>
            <h3>Faixas mínimas e máximas</h3>
            <p>O formulário impede intervalos inconsistentes e o backend reforça a validação antes de salvar.</p>
          </article>
          <article className="goal-card fade-up delay-2">
            <span className="goal-card__tag">IA</span>
            <h3>n8n + agente de receita</h3>
            <p>O backend envia macros e micronutrientes ao n8n e grava a resposta nutricional detalhada na tabela recipes.</p>
          </article>
        </section>

        <section className="results-panel fade-up delay-1">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Receitas geradas por IA</span>
              <h2>{recipes.length ? "Histórico de receitas salvas" : "Nenhuma receita gerada ainda"}</h2>
            </div>
          </div>

          {recipes.length > 0 ? (
            <div className="recipes-generated-list">
              {recipes.map((recipe) => (
                <article className="generated-recipe-card" key={recipe.id}>
                  <div className="generated-recipe-card__header">
                    <div>
                      <span className="goal-card__tag">{recipe.recipe_complexity}</span>
                      <h3>{recipe.title}</h3>
                    </div>
                    <strong>{recipe.calories} kcal</strong>
                  </div>
                  <p>{recipe.description}</p>
                  <div className="recipe-macros">
                    <span>{recipe.carbs}g carbo</span>
                    <span>{recipe.protein}g proteína</span>
                    <span>{recipe.fat}g gordura</span>
                  </div>
                  {recipe.micronutrients && Object.keys(recipe.micronutrients).length > 0 && (
                    <div className="nutrition-table-wrap">
                      <h4>Tabela nutricional detalhada</h4>
                      <table className="nutrition-table">
                        <tbody>
                          {Object.entries(recipe.micronutrients).map(([key, value]) => {
                            const field = MICRONUTRIENT_FIELDS.find((item) => item.name === key);
                            return (
                              <tr key={`${recipe.id}-micro-${key}`}>
                                <th>{field?.label || key}</th>
                                <td>{value}{field?.unit ? ` ${field.unit}` : ""}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="recipe-details-grid">
                    <div>
                      <h4>Ingredientes</h4>
                      <ul>
                        {recipe.ingredients.map((item, index) => <li key={`${recipe.id}-ing-${index}`}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4>Preparo</h4>
                      <ol>
                        {recipe.preparation_steps.map((item, index) => <li key={`${recipe.id}-step-${index}`}>{item}</li>)}
                      </ol>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="results-placeholder">
              <article className="result-card">
                <h3>Aguardando primeira geração</h3>
                <p>Preencha os filtros e clique em Gerar receita com IA para registrar a solicitação e salvar a receita.</p>
                <span>n8n + IA + PostgreSQL</span>
              </article>
            </div>
          )}
        </section>

        <section className="results-panel fade-up delay-1">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Último cadastro salvo</span>
              <h2>{latestRequest ? "Resumo da última solicitação" : "Nenhuma solicitação salva ainda"}</h2>
            </div>
          </div>

          {latestRequest ? (
            <div className="latest-request-card">
              <div>
                <span>Carboidratos</span>
                <strong>{latestRequest.carbs_min}g a {latestRequest.carbs_max}g</strong>
              </div>
              <div>
                <span>Proteínas</span>
                <strong>{latestRequest.protein_min}g a {latestRequest.protein_max}g</strong>
              </div>
              <div>
                <span>Gorduras</span>
                <strong>{latestRequest.fat_min}g a {latestRequest.fat_max}g</strong>
              </div>
              <div>
                <span>Tipo de proteína</span>
                <strong>{PROTEIN_OPTIONS.find((item) => item.value === latestRequest.protein_type)?.label}</strong>
              </div>
              <div>
                <span>Restrição alimentar</span>
                <strong>{RESTRICTION_OPTIONS.find((item) => item.value === latestRequest.dietary_restriction)?.label}</strong>
              </div>
              <div>
                <span>Complexidade</span>
                <strong>{COMPLEXITY_OPTIONS.find((item) => item.value === latestRequest.recipe_complexity)?.label}</strong>
              </div>
              <div>
                <span>Modo avançado</span>
                <strong>{latestRequest.advanced_mode ? "Ativado" : "Desativado"}</strong>
              </div>
            </div>
          ) : (
            <div className="results-placeholder">
              {sampleResults.map((item) => (
                <article className="result-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span>{item.macros}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
