import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useNavigate } from "react-router-dom";
import "./App.css";
import "./index.css";

// ======= UTILS =======
const TEST_TEXTS_KEY = "tm_texts";
const USERS_KEY = "tm_users";
const SESSIONS_KEY = "tm_sessions";

// PUBLIC_INTERFACE
function randomId(len = 8) {
  return Math.random().toString(36).substr(2, len);
}
// PUBLIC_INTERFACE
function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ======= STORAGE MOCKS =======
const LOCAL_DEFAULT_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "React makes it painless to create interactive UIs.",
  "Code is like humor. When you have to explain it, it’s bad.",
  "Typing tests are a great way to improve your speed and accuracy.",
  "Stay hungry. Stay foolish. – Steve Jobs"
];

// PUBLIC_INTERFACE
function loadTestTexts() {
  const saved = localStorage.getItem(TEST_TEXTS_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(TEST_TEXTS_KEY, JSON.stringify(LOCAL_DEFAULT_TEXTS));
  return LOCAL_DEFAULT_TEXTS;
}

// PUBLIC_INTERFACE
function saveTestTexts(texts) {
  localStorage.setItem(TEST_TEXTS_KEY, JSON.stringify(texts));
}

// PUBLIC_INTERFACE
function loadUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
}
// PUBLIC_INTERFACE
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
// PUBLIC_INTERFACE
function getSession() {
  return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "null");
}
// PUBLIC_INTERFACE
function setSession(user) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(user));
}
// PUBLIC_INTERFACE
function clearSession() {
  localStorage.removeItem(SESSIONS_KEY);
}

// PUBLIC_INTERFACE
function isLoggedIn() {
  return Boolean(getSession());
}

// PUBLIC_INTERFACE
function addScoreToUser(username, scoreObj) {
  const users = loadUsers();
  if (users[username]) {
    users[username].tests = users[username].tests || [];
    users[username].tests.push(scoreObj);
    saveUsers(users);
  }
}

// PUBLIC_INTERFACE
function deleteTestHistory(username) {
  const users = loadUsers();
  if (users[username]) {
    users[username].tests = [];
    saveUsers(users);
  }
}

// PUBLIC_INTERFACE
function getUserRole(username) {
  const users = loadUsers();
  if (users[username] && users[username].role === "admin") return "admin";
  return "user";
}

// ======= THEMING =======
function useDarkMode() {
  const [dark, setDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    if (dark) {
      document.body.style.backgroundColor = "#14171a";
    } else {
      document.body.style.backgroundColor = "#fff";
    }
  }, [dark]);
  return [dark, setDark];
}

// ======= CONTEXT =======
const AuthContext = React.createContext(null);

// ======= NAVBAR =======
function Navbar({ user, onLogout, darkMode, setDarkMode }) {
  return (
    <nav className="navbar">
      <div className="container nav-flex">
        <Link className="logo" to="/">
          <span className="logo-symbol" style={{ color: "#ff9800" }}>★</span> TypeMaster
        </Link>
        <div className="nav-items">
          {user && (
            <>
              <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              {/* Add admin panel link if admin panel is enabled in the future */}
              <span className="nav-user">
                👤 {user.username} | Tests: {user.tests ? user.tests.length : 0}
              </span>
              <button className="btn btn-outlined" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="btn btn-accent">Login</Link>
              <Link to="/signup" className="btn btn-highlight">Sign Up</Link>
            </>
          )}
          <span className="dark-toggle" style={{ marginLeft: 12 }}>
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={e => setDarkMode(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <span style={{ marginLeft: 4, fontSize: 16 }}>{darkMode ? "🌙" : "🌞"}</span>
          </span>
        </div>
      </div>
    </nav>
  );
}

// ======= AUTH PAGES =======
// PUBLIC_INTERFACE
function SignupPage() {
  const { setUser } = React.useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  function handleSignup(e) {
    e.preventDefault();
    const users = loadUsers();
    if (!username || !pass) {
      setErr("Username and password required");
      return;
    }
    if (users[username]) {
      setErr("User already exists!");
      return;
    }
    users[username] = {
      username,
      password: pass,
      tests: [],
      role: "user"
    };
    saveUsers(users);
    setUser(users[username]);
    setSession(users[username]);
    navigate("/");
  }
  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form className="auth-form" onSubmit={handleSignup}>
        <input autoFocus placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} />
        {err && <div className="error">{err}</div>}
        <button className="btn btn-large" type="submit">Create Account</button>
        <div>
          or <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}

// PUBLIC_INTERFACE
function LoginPage() {
  const { setUser } = React.useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    const users = loadUsers();
    if (users[username] && users[username].password === pass) {
      setUser(users[username]);
      setSession(users[username]);
      navigate("/");
    } else {
      setErr("Invalid username or password!");
    }
  }
  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="auth-form" onSubmit={handleLogin}>
        <input autoFocus placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} />
        {err && <div className="error">{err}</div>}
        <button className="btn btn-large" type="submit">Login</button>
        <div>
          or <Link to="/signup">Sign Up</Link>
        </div>
      </form>
    </div>
  );
}

// ======= TYPING TEST FEATURE =======
function getRandomTestText() {
  const texts = loadTestTexts();
  return texts[Math.floor(Math.random() * texts.length)];
}

// PUBLIC_INTERFACE
function TypingTest({ onComplete }) {
  const [testText, setTestText] = useState(getRandomTestText());
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 60 sec default
  const [timer, setTimer] = useState(null);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (started && !done && timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      setTimer(id);
      return () => clearTimeout(id);
    }
    if (started && (done || timeLeft === 0)) {
      setDone(true);
      if (timer) clearTimeout(timer);
    }
  }, [started, timeLeft, done]);

  useEffect(() => {
    if (done) {
      const stats = calculateStats(testText, input, 60 - timeLeft);
      onComplete && onComplete({
        ...stats,
        testText,
        timestamp: new Date().toISOString(),
        duration: 60 - timeLeft
      });
    }
    // eslint-disable-next-line
  }, [done]);

  function handleChange(e) {
    if (!started) {
      setStarted(true);
      setStartTime(new Date());
    }
    setInput(e.target.value);
    if (e.target.value.length >= testText.length) setDone(true);
  }

  function handleRestart() {
    setTestText(getRandomTestText());
    setInput("");
    setDone(false);
    setTimeLeft(60);
    setStarted(false);
    setStartTime(null);
    inputRef.current && inputRef.current.focus();
  }

  // PUBLIC_INTERFACE
  function calculateStats(original, typed, seconds) {
    const charsTyped = typed.length;
    const correctChars = [...typed].filter(
      (ch, i) => original[i] && ch === original[i]
    ).length;
    const accuracy = original.length === 0 ? 0 : Math.round((correctChars / original.length) * 100);
    const wpm = Math.round((charsTyped / 5) / (seconds / 60));
    return {
      accuracy,
      wpm: wpm > 0 ? wpm : 0,
      charsTyped,
      correctChars,
      totalChars: original.length
    };
  }

  return (
    <div className="typingtest-container">
      <TestStats
        testText={testText}
        input={input}
        timeLeft={timeLeft}
        started={started}
        done={done}
      />
      <div className={`test-textarea ${done ? "done" : ""}`}>
        {testText.split("").map((letter, idx) => {
          let status = "";
          if (input[idx]) {
            status = letter === input[idx] ? "correct" : "incorrect";
          }
          return <span key={idx} className={status}>{letter}</span>;
        })}
      </div>
      <textarea
        className="test-input"
        ref={inputRef}
        value={input}
        onChange={handleChange}
        disabled={done}
        placeholder={done ? "Test finished! Restart to try again." : "Start typing here..."}
        maxLength={testText.length}
        rows={3}
        autoFocus
      />
      <div className="typingtest-actions" style={{ marginTop: 12 }}>
        <button className="btn" onClick={handleRestart}>
          {done ? "Restart" : "Reset"}
        </button>
      </div>
      {done && (
        <div className="aftertest-message">
          <span>Test completed!</span>
        </div>
      )}
    </div>
  );
}

function TestStats({ testText, input, timeLeft, started, done }) {
  // PUBLIC_INTERFACE
  function calculateStats(original, typed) {
    const charsTyped = typed.length;
    const correctChars = [...typed].filter(
      (ch, i) => original[i] && ch === original[i]
    ).length;
    const accuracy = original.length === 0 ? 0 : Math.round((correctChars / original.length) * 100);
    const wpm = Math.round((charsTyped / 5) / ((60 - timeLeft) / 60));
    return {
      accuracy,
      wpm: started && timeLeft !== 60 && (60 - timeLeft) > 0 ? (wpm > 0 ? wpm : 0) : 0,
      charsTyped,
      correctChars,
      totalChars: original.length
    };
  }
  const stats = calculateStats(testText, input);

  return (
    <div className="teststats-row">
      <div style={{ color: "#6198e2" }}>
        WPM: <span className="stat-value">{stats.wpm}</span>
      </div>
      <div style={{ color: "#ff9800" }}>
        Accuracy: <span className="stat-value">{stats.accuracy}%</span>
      </div>
      <div>Time Left: <span className="stat-value">{timeLeft}s</span></div>
      <div>
        Chars: <span className="stat-value">{stats.charsTyped}/{stats.totalChars}</span>
      </div>
    </div>
  );
}

// ======= LEADERBOARD =======
const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "all", label: "All Time" }
];

/**
 * PUBLIC_INTERFACE
 * Enhance LeaderboardPage: User icon, accent icons, bolder user, highlight top row.
 */
function LeaderboardPage() {
  const [period, setPeriod] = useState("today");
  const [data, setData] = useState([]);

  useEffect(() => {
    // Prepare leaderboard
    const users = loadUsers();
    let allTests = [];
    Object.values(users).forEach(u => {
      (u.tests || []).forEach(test => {
        if (!(test && typeof test === "object")) return;
        allTests.push({
          username: u.username,
          ...test,
        });
      });
    });
    // Filter by date
    let filtered = [];
    const now = new Date();
    filtered = allTests.filter(t => {
      if (period === "all") return true;
      const date = new Date(t.timestamp);
      if (period === "today") {
        return date.toDateString() === now.toDateString();
      }
      if (period === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }
      return true;
    });
    // Sort by WPM, accuracy
    filtered.sort((a, b) => (b.wpm - a.wpm) || (b.accuracy - a.accuracy));
    // Top 10
    setData(filtered.slice(0, 10));
  }, [period]);

  function leaderAvatar(username) {
    return (
      <span className="profile-avatar" style={{
        display: "inline-flex", marginRight: 7, width: 30, height: 30, fontSize: "1.2em", border: 0, boxShadow: "none", borderRadius: "50%"
      }}>{username?.trim()?.charAt(0).toUpperCase() || "🤖"}</span>
    );
  }

  function leaderIcon(idx) {
    if(idx===0) return <span className="icon-cell" title="Top performer">🏆</span>;
    if(idx===1) return <span className="icon-cell" title="2nd">🥈</span>;
    if(idx===2) return <span className="icon-cell" title="3rd">🥉</span>;
    return <span className="icon-cell" title="Participant">⌨️</span>;
  }

  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>
      <div className="leaderboard-periods">
        {PERIODS.map(p => (
          <button
            key={p.key}
            className={`btn btn-small${period === p.key ? " btn-active" : ""}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="table-scroll">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="icon-cell"></th>
              <th>#</th>
              <th>User</th>
              <th>WPM</th>
              <th>Accuracy</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  No scores yet!
                </td>
              </tr>
            )}
            {data.map((row, idx) => (
              <tr key={row.username + idx} style={idx === 0 ? {background: "var(--stat-accent1)", fontWeight: "bold"} : {}}>
                <td className="icon-cell">{leaderIcon(idx)}</td>
                <td>{idx + 1}</td>
                <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                  {leaderAvatar(row.username)}
                  {row.username}
                </td>
                <td>{row.wpm}</td>
                <td>{row.accuracy}%</td>
                <td>{(new Date(row.timestamp)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======= PROFILE PAGE =======
function average(arr) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

/**
 * PUBLIC_INTERFACE
 * Enhanced ProfilePage: avatar, bold colorful stats, icons, animated stats, updated meta layout.
 */
function ProfilePage() {
  const { user, setUser } = React.useContext(AuthContext);
  const [confirm, setConfirm] = useState(false);

  // Animated stat value counter
  function useAnimatedNumber(n, duration=500) {
    const [val, setVal] = useState(n);
    useEffect(() => {
      let start = val, end = n, startTime;
      if (start === end) return;
      function animate(ts) {
        if (!startTime) startTime = ts;
        let prog = Math.min((ts-startTime)/(duration), 1);
        setVal(start + Math.round((end-start)*prog));
        if (prog < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
      // eslint-disable-next-line
    }, [n]);
    return val;
  }

  if (!user) return <Navigate to="/login" />;

  const tests = user.tests || [];
  const avgWpm = average(tests.map(t => t.wpm));
  const avgAcc = average(tests.map(t => t.accuracy));

  // Avatar: use first letter or emoji, fallback
  const avatar = (
    <span className="profile-avatar" title={user.username}>
      {user.username?.trim()?.charAt(0).toUpperCase() || "👤"}
    </span>
  );

  function handleDelete() {
    deleteTestHistory(user.username);
    const users = loadUsers();
    setUser({ ...users[user.username] });
    setConfirm(false);
  }

  // Stat icon helpers
  const StatIcon = ({ type }) => {
    if(type==="wpm") return <span className="profile-stat-icon" title="Average WPM">🚀</span>;
    if(type==="acc") return <span className="profile-stat-icon" title="Average Accuracy">🎯</span>;
    if(type==="tests") return <span className="profile-stat-icon" title="Tests Taken">⏳</span>;
    return <span className="profile-stat-icon">📄</span>;
  };
  const animatedTests = useAnimatedNumber(tests.length, 500);
  const animatedWpm = useAnimatedNumber(avgWpm || 0, 900);
  const animatedAcc = useAnimatedNumber(avgAcc || 0, 900);

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <div className="profile-meta" style={{ alignItems: "center" }}>
        {avatar}
        <div>
          Username: <b>{user.username}</b>
        </div>
        <div>Role: {user.role}</div>
      </div>
      <div className="profile-stats-row">
        <div className="profile-stat-block">
          <div className="profile-stat-label">Total Tests</div>
          <div className="profile-stat-value">
            <StatIcon type="tests" />
            <span>{animatedTests}</span>
          </div>
        </div>
        <div className="profile-stat-block">
          <div className="profile-stat-label">Avg WPM</div>
          <div className="profile-stat-value">
            <StatIcon type="wpm" />
            <span>{animatedWpm || "-"}</span>
          </div>
        </div>
        <div className="profile-stat-block">
          <div className="profile-stat-label">Avg Accuracy</div>
          <div className="profile-stat-value">
            <StatIcon type="acc" />
            <span>{animatedAcc || "-"}%</span>
          </div>
        </div>
      </div>
      <h3>Test History</h3>
      {tests.length === 0 && <div>No test results yet.</div>}
      {tests.length > 0 && (
        <div className="table-scroll">
          <table className="profile-table">
            <thead>
              <tr>
                <th className="icon-cell"></th>
                <th>#</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Date</th>
                <th>Text</th>
              </tr>
            </thead>
            <tbody>
              {tests.slice().reverse().map((test, idx) => (
                <tr key={test.timestamp + idx}>
                  <td className="icon-cell" title="Test">{idx === 0 ? "⭐" : "⌨️"}</td>
                  <td>{tests.length - idx}</td>
                  <td>{test.wpm}</td>
                  <td>{test.accuracy}%</td>
                  <td>{(new Date(test.timestamp)).toLocaleString()}</td>
                  <td className="tiny-cell">{test.testText?.slice(0, 36) || ""}{test.testText && test.testText.length > 36 ? "..." : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tests.length > 0 && (
        <div className="profile-actions">
          {!confirm && (
            <button className="btn btn-delete" onClick={() => setConfirm(true)}>
              Delete History
            </button>
          )}
          {confirm && (
            <div>
              <span>Are you sure?</span>
              <button className="btn btn-danger" onClick={handleDelete}>Yes, delete</button>
              <button className="btn btn-outline" onClick={() => setConfirm(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ======= APP ROOT =======
function HomeTestContainer() {
  const { user, setUser } = React.useContext(AuthContext);
  const [testResult, setTestResult] = useState(null);
  const [showStats, setShowStats] = useState(false);

  function onTestComplete(res) {
    setTestResult(res);
    setShowStats(true);
    if (user) {
      addScoreToUser(user.username, res);
      const users = loadUsers();
      setUser({ ...users[user.username] }); // update context
    }
  }
  function handleCloseStats() {
    setShowStats(false);
    setTestResult(null);
  }
  return (
    <div className="maincenter">
      <h1 className="type-title">Test your Typing Skills!</h1>
      <TypingTest onComplete={onTestComplete} />
      {showStats && testResult && (
        <div className="aftertest-modal">
          <div className="test-result-modal-content">
            <h4>Your Results</h4>
            <div>WPM: <b>{testResult.wpm}</b></div>
            <div>Accuracy: <b>{testResult.accuracy}%</b></div>
            <div>Time Taken: <b>{testResult.duration}s</b></div>
            <button className="btn" onClick={handleCloseStats}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ======= APP =======
function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const [user, setUser] = useState(getSession());

  function handleLogout() {
    setUser(null);
    clearSession();
  }

  // Responsive nav collapse for mobile (handled by CSS)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <div className={`app${darkMode ? " dark" : ""}`}>
          <Navbar user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomeTestContainer />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
              <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
              {/* Future route: <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/" />}/> */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
