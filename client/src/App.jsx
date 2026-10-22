import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Dumbbell,
  History,
  LogOut,
  Moon,
  Salad,
  Sparkles,
  Sun,
  TrendingUp,
  UserRound
} from "lucide-react";
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "./api.js";
import "./index.css";

const emptyProgress = [
  { session: 1, load: 60 },
  { session: 2, load: 62 },
  { session: 3, load: 65 },
  { session: 4, load: 67 }
];

function useAuth() {
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem("fitness_token"),
    user: JSON.parse(localStorage.getItem("fitness_user") ?? "null")
  }));

  function save(next) {
    localStorage.setItem("fitness_token", next.token);
    localStorage.setItem("fitness_user", JSON.stringify(next.user));
    setAuth(next);
  }

  function logout() {
    localStorage.removeItem("fitness_token");
    localStorage.removeItem("fitness_user");
    setAuth({ token: null, user: null });
  }

  return { ...auth, save, logout };
}

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("fitness_theme") ?? "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("fitness_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return { theme, toggleTheme };
}

function App() {
  const auth = useAuth();
  const theme = useTheme();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" auth={auth} theme={theme} />} />
        <Route path="/signup" element={<AuthPage mode="signup" auth={auth} theme={theme} />} />
        <Route path="/*" element={auth.token ? <Shell auth={auth} theme={theme} /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function Shell({ auth, theme }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <Activity size={20} />
          Fit Optimizer
        </Link>
        <nav>
          <NavItem to="/" icon={TrendingUp} label="Dashboard" />
          <NavItem to="/meal-plan" icon={Salad} label="Meal Plan" />
          <NavItem to="/training" icon={CalendarDays} label="Training" />
          <NavItem to="/workouts" icon={Dumbbell} label="Workout Logger" />
          <NavItem to="/history" icon={History} label="History" />
          <NavItem to="/onboarding" icon={UserRound} label="Onboarding" />
        </nav>
        <button className="logout-button" onClick={auth.logout}>
          <LogOut size={16} />
          Log out
        </button>
      </aside>
      <main className="workspace">
        <Topbar user={auth.user} theme={theme} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding auth={auth} />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/training" element={<TrainingSplit />} />
          <Route path="/workouts" element={<WorkoutLogger />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink to={to} end={to === "/"}>
      <Icon size={17} />
      {label}
    </NavLink>
  );
}

function ThemeToggle({ theme, className = "" }) {
  const isDark = theme.theme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      className={`theme-toggle ${className}`}
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={theme.toggleTheme}
    >
      <Icon size={16} />
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

function Topbar({ user, theme }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Personalized fitness macro and program optimizer</p>
        <h1>{user?.name ? `${user.name}'s dashboard` : "Fitness dashboard"}</h1>
      </div>
      <div className="topbar-actions">
        <ThemeToggle theme={theme} />
        <div className="user-chip">{user?.dietPreference ?? "profile"}</div>
      </div>
    </header>
  );
}

function AuthPage({ mode, auth, theme }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: import.meta.env.DEV ? "demo@fitness.local" : "", password: import.meta.env.DEV ? "demo12345" : "" });
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  if (auth.token) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = isSignup ? form : { email: form.email, password: form.password };
      const result = isSignup ? await api.signup(payload) : await api.login(payload);
      auth.save(result);
      navigate(isSignup ? "/onboarding" : "/");
    } catch (err) {
      setError([502, 503, 504].includes(err.response?.status)
        ? "The server is temporarily unavailable or waking up. Please wait a minute and try again."
        : err.response?.data?.message ?? err.message ?? "Authentication failed.");
    }
  }

  return (
    <main className="auth-page">
      <ThemeToggle theme={theme} className="auth-theme-toggle" />
      <form className="auth-card" onSubmit={submit}>
        <Activity size={28} />
        <h1>{isSignup ? "Create your account" : "Log in"}</h1>
        <p>{import.meta.env.DEV ? "Demo account: demo@fitness.local / demo12345" : isSignup ? "Create an account to save your fitness plans." : "Log in with your account, or sign up below."}</p>
        {isSignup && (
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="primary-button" type="submit">{isSignup ? "Sign up" : "Log in"}</button>
        <Link className="text-link" to={isSignup ? "/login" : "/signup"}>
          {isSignup ? "Already have an account?" : "Need an account?"}
        </Link>
      </form>
    </main>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <section className="stat-card">
      <span><Icon size={18} />{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function Card({ title, icon: Icon, action, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      <div className="card-heading">
        <h2>{Icon && <Icon size={18} />}{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Dashboard() {
  const [mealPlans, setMealPlans] = useState([]);
  const [splits, setSplits] = useState([]);
  const [plateaus, setPlateaus] = useState([]);
  const [progress, setProgress] = useState(emptyProgress);

  useEffect(() => {
    api.mealPlans().then(setMealPlans).catch(() => setMealPlans([]));
    api.trainingSplits().then(setSplits).catch(() => setSplits([]));
    api.plateaus().then(setPlateaus).catch(() => setPlateaus([]));
    api.workoutLogs("Squat")
      .then((logs) => setProgress(logs.map((log, index) => ({ session: index + 1, load: Number(log.weight) }))))
      .catch(() => setProgress(emptyProgress));
  }, []);

  const latestMeal = mealPlans[0];
  const latestSplit = splits[0];
  const activePlateau = plateaus.find((flag) => !flag.resolved);

  return (
    <>
      <section className="stats-grid">
        <StatCard label="Protein today" value={`${Math.round(Number(latestMeal?.totalProtein ?? 0))}g`} icon={Activity} />
        <StatCard label="Meal cost" value={`Rs ${Math.round(Number(latestMeal?.totalCost ?? 0))}`} icon={Salad} />
        <StatCard label="Active plateaus" value={plateaus.filter((flag) => !flag.resolved).length} icon={AlertTriangle} />
      </section>
      <section className="page-grid">
        <Card title="Today's meal plan" icon={Salad} action={<Link className="ghost-button" to="/meal-plan">Generate</Link>}>
          {latestMeal?.items?.length ? latestMeal.items.slice(0, 4).map((item) => (
            <div className="row" key={item.id}>
              <span>{item.food.name}</span>
              <strong>{item.quantity} serving</strong>
            </div>
          )) : <p className="muted-text">Generate a meal plan to fill this card with real data.</p>}
        </Card>
        <Card title="This week's split" icon={CalendarDays} action={<Link className="ghost-button" to="/training">Generate</Link>}>
          {latestSplit?.days?.length ? latestSplit.days.map((day) => (
            <div className="row" key={day.id}>
              <span>Day {day.dayNumber}</span>
              <strong>{day.muscleGroups.join(", ")}</strong>
            </div>
          )) : <p className="muted-text">Create a training split to see the recovery-aware plan here.</p>}
        </Card>
        <Card title="Squat progress" icon={Dumbbell} className="wide-card">
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progress}>
                <XAxis dataKey="session" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
                <Line type="monotone" dataKey="load" stroke="var(--primary)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <aside className="plateau-alert">
          <AlertTriangle size={22} />
          <div>
            <h2>{activePlateau ? "Plateau detected" : "No active plateau"}</h2>
            <p>{activePlateau?.aiSuggestion ?? "Workout logs will automatically trigger plateau checks."}</p>
          </div>
        </aside>
      </section>
    </>
  );
}

function Onboarding({ auth }) {
  const [form, setForm] = useState({
    age: auth.user?.age ?? 21,
    weight: auth.user?.weight ?? 72,
    height: auth.user?.height ?? 175,
    activityLevel: auth.user?.activityLevel ?? "moderate",
    dietPreference: auth.user?.dietPreference ?? "flexible",
    trainingExperience: auth.user?.trainingExperience ?? "intermediate"
  });
  const [status, setStatus] = useState("");

  async function submit(event) {
    event.preventDefault();
    const result = await api.onboarding({
      ...form,
      age: Number(form.age),
      weight: Number(form.weight),
      height: Number(form.height)
    });
    auth.save({ token: auth.token, user: result.user });
    setStatus("Onboarding saved.");
  }

  return (
    <form className="card form-page" onSubmit={submit}>
      <div className="card-heading"><h2><UserRound size={18} />Onboarding</h2></div>
      <div className="form-grid">
        <Field label="Age" type="number" value={form.age} onChange={(value) => setForm({ ...form, age: value })} />
        <Field label="Weight (kg)" type="number" value={form.weight} onChange={(value) => setForm({ ...form, weight: value })} />
        <Field label="Height (cm)" type="number" value={form.height} onChange={(value) => setForm({ ...form, height: value })} />
        <Select label="Activity level" value={form.activityLevel} onChange={(value) => setForm({ ...form, activityLevel: value })} options={["sedentary", "light", "moderate", "active", "athlete"]} />
        <Select label="Diet preference" value={form.dietPreference} onChange={(value) => setForm({ ...form, dietPreference: value })} options={["veg", "non_veg", "eggetarian", "flexible"]} />
        <Select label="Training experience" value={form.trainingExperience} onChange={(value) => setForm({ ...form, trainingExperience: value })} options={["beginner", "intermediate", "advanced"]} />
      </div>
      <button className="primary-button" type="submit">Save onboarding</button>
      {status && <p className="success-text">{status}</p>}
    </form>
  );
}

function MealPlan() {
  const [foods, setFoods] = useState([]);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [naturalText, setNaturalText] = useState("I'm vegetarian, dislike paneer, and want a budget bulk meal plan.");
  const [constraints, setConstraints] = useState({});
  const [form, setForm] = useState({ budget: 200, protein: 120, carbs: 220, fat: 60, calories: 2100 });
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.foods().then(setFoods).catch(() => setFoods([]));
  }, []);

  async function parseText() {
    const parsed = await api.parse(naturalText);
    setConstraints(parsed);
  }

  async function generate() {
    setStatus("Generating meal plan...");
    const payload = {
      budget: Number(form.budget),
      calorieCeiling: Number(form.calories),
      objective: "closestMacros",
      targets: {
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
        calories: Number(form.calories)
      },
      foodIds: selectedFoodIds.length ? selectedFoodIds : foods.map((food) => food.id),
      constraints,
      persist: true
    };
    const next = await api.mealPlan(payload);
    setResult(next);
    setStatus("Meal plan saved.");
  }

  return (
    <section className="two-column">
      <Card title="Meal plan optimizer" icon={Salad}>
        <div className="form-grid">
          {Object.entries(form).map(([key, value]) => (
            <Field key={key} label={key} type="number" value={value} onChange={(next) => setForm({ ...form, [key]: next })} />
          ))}
        </div>
        <label>
          Available foods
          <select multiple value={selectedFoodIds.map(String)} onChange={(event) => setSelectedFoodIds([...event.target.selectedOptions].map((option) => Number(option.value)))}>
            {foods.map((food) => <option key={food.id} value={food.id}>{food.name} - Rs {food.costPerServing}</option>)}
          </select>
        </label>
        <label>
          Free-text constraints
          <textarea rows="4" value={naturalText} onChange={(event) => setNaturalText(event.target.value)} />
        </label>
        <div className="button-row">
          <button className="secondary-button" type="button" onClick={parseText}><Sparkles size={16} />Parse</button>
          <button className="primary-button" type="button" onClick={generate}>Generate and save</button>
        </div>
        {status && <p className="success-text">{status}</p>}
      </Card>
      <ResultPanel result={result} constraints={constraints} />
    </section>
  );
}

function ResultPanel({ result, constraints }) {
  const items = result?.plan?.items ?? [];
  return (
    <Card title="Optimizer result" icon={TrendingUp}>
      {items.length ? items.map((item) => (
        <div className="row" key={item.id ?? item.name}>
          <span>{item.name}</span>
          <strong>{item.quantity} serving</strong>
        </div>
      )) : <p className="muted-text">Generated foods and totals will appear here.</p>}
      {result?.explanation && <p className="info-callout">{result.explanation}</p>}
      <pre>{JSON.stringify(constraints, null, 2)}</pre>
    </Card>
  );
}

function TrainingSplit() {
  const [form, setForm] = useState({ daysPerWeek: 5, goal: "hypertrophy", equipment: "barbell,dumbbell" });
  const [result, setResult] = useState(null);

  async function generate() {
    const next = await api.trainingSplit({
      daysPerWeek: Number(form.daysPerWeek),
      goal: form.goal,
      equipment: form.equipment.split(",").map((item) => item.trim()).filter(Boolean),
      persist: true
    });
    setResult(next);
  }

  return (
    <section className="two-column">
      <Card title="Training split generator" icon={CalendarDays}>
        <div className="form-grid">
          <Field label="Days per week" type="number" value={form.daysPerWeek} onChange={(value) => setForm({ ...form, daysPerWeek: value })} />
          <Select label="Goal" value={form.goal} onChange={(value) => setForm({ ...form, goal: value })} options={["hypertrophy", "strength", "powerlifting"]} />
        </div>
        <Field label="Equipment" value={form.equipment} onChange={(value) => setForm({ ...form, equipment: value })} />
        <button className="primary-button" type="button" onClick={generate}>Generate and save</button>
      </Card>
      <Card title="Weekly output" icon={Dumbbell}>
        {(result?.split ?? []).map((day) => (
          <div className="split-day" key={day.dayNumber}>
            <strong>Day {day.dayNumber}: {day.title}</strong>
            <span>{day.suggestedExercises.join(", ")}</span>
          </div>
        ))}
        {!result && <p className="muted-text">Your recovery-aware schedule will appear here.</p>}
        {result?.explanation && <p className="info-callout">{result.explanation}</p>}
      </Card>
    </section>
  );
}

function WorkoutLogger() {
  const [form, setForm] = useState({ exerciseName: "Squat", weight: 100, reps: 5, sets: 3, date: new Date().toISOString().slice(0, 10) });
  const [logs, setLogs] = useState([]);
  const [plateau, setPlateau] = useState(null);

  const progress = useMemo(() => logs.map((log, index) => ({ session: index + 1, load: Number(log.weight) })), [logs]);

  async function refresh() {
    const next = await api.workoutLogs(form.exerciseName);
    setLogs(next);
  }

  async function addLog(event) {
    event.preventDefault();
    const result = await api.logWorkout({ ...form, weight: Number(form.weight), reps: Number(form.reps), sets: Number(form.sets), date: new Date(form.date).toISOString() });
    setPlateau(result);
    await refresh();
  }

  async function check() {
    const result = await api.checkPlateau({ exerciseName: form.exerciseName, windowSize: 5 });
    setPlateau(result);
  }

  useEffect(() => {
    refresh().catch(() => setLogs([]));
  }, []);

  return (
    <section className="two-column">
      <form className="card" onSubmit={addLog}>
        <div className="card-heading"><h2><Dumbbell size={18} />Workout logger</h2></div>
        <div className="form-grid">
          <Field label="Exercise" value={form.exerciseName} onChange={(value) => setForm({ ...form, exerciseName: value })} />
          <Field label="Weight" type="number" value={form.weight} onChange={(value) => setForm({ ...form, weight: value })} />
          <Field label="Reps" type="number" value={form.reps} onChange={(value) => setForm({ ...form, reps: value })} />
          <Field label="Sets" type="number" value={form.sets} onChange={(value) => setForm({ ...form, sets: value })} />
          <Field label="Date" type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} />
        </div>
        <div className="button-row">
          <button className="primary-button" type="submit">Add log</button>
          <button className="secondary-button" type="button" onClick={check}>Check plateau</button>
        </div>
      </form>
      <Card title="Progress and plateau" icon={TrendingUp}>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progress.length ? progress : emptyProgress}>
              <XAxis dataKey="session" stroke="var(--muted)" />
              <YAxis stroke="var(--muted)" />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
              <Line type="monotone" dataKey="load" stroke="var(--primary)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="info-callout">{plateau?.flag?.aiSuggestion ?? plateau?.detection?.reason ?? "Plateau feedback will appear after logging/checking."}</p>
      </Card>
    </section>
  );
}

function HistoryPage() {
  const [mealPlans, setMealPlans] = useState([]);
  const [splits, setSplits] = useState([]);
  const [plateaus, setPlateaus] = useState([]);

  useEffect(() => {
    api.mealPlans().then(setMealPlans).catch(() => setMealPlans([]));
    api.trainingSplits().then(setSplits).catch(() => setSplits([]));
    api.plateaus().then(setPlateaus).catch(() => setPlateaus([]));
  }, []);

  async function resolve(id) {
    await api.resolvePlateau(id);
    setPlateaus((current) => current.map((flag) => flag.id === id ? { ...flag, resolved: true } : flag));
  }

  return (
    <section className="page-grid">
      <Card title="Past meal plans" icon={Salad}>
        {mealPlans.map((plan) => <div className="row" key={plan.id}><span>{new Date(plan.date).toLocaleDateString()}</span><strong>Rs {Number(plan.totalCost)}</strong></div>)}
        {!mealPlans.length && <p className="muted-text">No meal plans saved yet.</p>}
      </Card>
      <Card title="Past training splits" icon={CalendarDays}>
        {splits.map((split) => <div className="row" key={split.id}><span>{split.goal}</span><strong>{split.daysPerWeek} days</strong></div>)}
        {!splits.length && <p className="muted-text">No training splits saved yet.</p>}
      </Card>
      <Card title="Plateau flags" icon={AlertTriangle} className="wide-card">
        {plateaus.map((flag) => (
          <div className="row" key={flag.id}>
            <span>{flag.exerciseName}</span>
            {flag.resolved ? <strong>Resolved</strong> : <button className="ghost-button" onClick={() => resolve(flag.id)}>Resolve</button>}
          </div>
        ))}
        {!plateaus.length && <p className="muted-text">No plateau flags yet.</p>}
      </Card>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

createRoot(document.getElementById("root")).render(<App />);
