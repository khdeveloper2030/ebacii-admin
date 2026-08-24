import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db, firebaseConfigured, googleProvider } from "./firebase";
import "./App.css";

const subjects = {
  real_science: [
    "គណិតវិទ្យា",
    "អក្សរសាស្ត្រខ្មែរ",
    "រូបវិទ្យា",
    "គីមីវិទ្យា",
    "ជីវវិទ្យា",
    "អង់គ្លេស",
    "ប្រវត្តិវិទ្យា",
  ],
  social_science: [
    "អក្សរសាស្ត្រខ្មែរ",
    "គណិតវិទ្យា",
    "ប្រវត្តិវិទ្យា",
    "ភូមិវិទ្យា",
    "សីលធម៌-ពលរដ្ឋ",
    "អង់គ្លេស",
    "ផែនដី និង បរិស្ថានវិទ្យា",
  ],
  "pre-School_primary_teacher_exam": [
    "អក្សរសាស្ត្រខ្មែរ",
    "គណិតវិទ្យា",
    "វប្បធម៌ទូទៅ",
  ],
  secondary_school_teacher_exam: [
    "គណិតវិទ្យា & រូបវិទ្យា",
    "រូបវិទ្យា & គីមីវិទ្យា",
    "ជីវវិទ្យា & គីមីវិទ្យា",
    "អក្សរសាស្ត្រខ្មែរ & សីលធម៌-ពលរដ្ឋ",
    "ប្រវត្តិវិទ្យា & ភូមិវិទ្យា",
    "ភូមិវិទ្យា & ប្រវត្តិវិទ្យា",
    "ភាសាអង់គ្លេស & អក្សរសាស្ត្រខ្មែរ",
    "កីឡា និងអប់រំកាយ & ចំណេះដឹងទូទៅ / សីលធម៌",
  ],
  high_school_exam: [
    "គណិតវិទ្យា",
    "រូបវិទ្យា",
    "គីមីវិទ្យា",
    "ជីវវិទ្យា",
    "អក្សរសាស្ត្រខ្មែរ",
    "ប្រវត្តិវិទ្យា",
    "ភូមិវិទ្យា",
    "សីលធម៌-ពលរដ្ឋ",
    "ព័ត៌មានវិទ្យា (ICT)",
  ],
  medical_exam: ["គីមីវិទ្យា", "ជីវវិទ្យា", "គណិតវិទ្យា"],
  itc_exam: ["គណិតវិទ្យា", "រូបវិទ្យា", "គីមីវិទ្យា", "តក្កវិទ្យា"],
};
const emptyPaper = {
  category: "social_science",
  subject: "អក្សរសាស្ត្រខ្មែរ",
  drive_url: "",
  title: "",
  year: new Date().getFullYear(),
};
const translations = {
  អក្សរសាស្ត្រខ្មែរ: "Khmer Literature",
  គណិតវិទ្យា: "Mathematics",
  ប្រវត្តិវិទ្យា: "History",
  ភូមិវិទ្យា: "Geography",
  រូបវិទ្យា: "Physics",
  គីមីវិទ្យា: "Chemistry",
  ជីវវិទ្យា: "Biology",
  អង់គ្លេស: "English",
  "សីលធម៌-ពលរដ្ឋ": "Morality and Civics",
  វប្បធម៌ទូទៅ: "General Culture",
  តក្កវិទ្យា: "Logic",
  "ផែនដី និង បរិស្ថានវិទ្យា": "Earth and Environment",
  "ព័ត៌មានវិទ្យា (ICT)": "Information Technology (ICT)",
};
const categoryTranslations = {
  real_science: "Real Science",
  social_science: "Social Science",
  "pre-School_primary_teacher_exam": "Primary Teacher Exam",
  secondary_school_teacher_exam: "Secondary Teacher Exam",
  high_school_exam: "High School Exam",
  medical_exam: "Medical Exam",
  itc_exam: "ITC Exam",
};
const titleTranslations = {
  វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០១៩:
    "2019 Bac II Khmer Literature Examination",
  "2019 Bac II Khmer Literature Examination":
    "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០១៩",
};
const text = {
  km: {
    library: "បណ្ណាល័យវិញ្ញាសា",
    manage: "គ្រប់គ្រងវិញ្ញាសា និងចែករំលែកចំណេះដឹងជាមួយសិស្ស។",
    login: "ចូលជាមួយ Google",
    allowed: "ប្រើ Gmail ដែល admin បានអនុញ្ញាត",
    edit: "កែប្រែវិញ្ញាសា",
    add: "បញ្ចូលវិញ្ញាសាថ្មី",
    cancel: "បោះបង់",
    save: "រក្សាទុកការកែប្រែ",
    create: "បញ្ចូលវិញ្ញាសា",
    list: "បញ្ជីវិញ្ញាសា",
    search: "ស្វែងរក...",
    logout: "ចាកចេញ",
    title: "ចំណងជើង",
    khmerTitle: "ចំណងជើងខ្មែរ",
    englishTitle: "ចំណងជើងអង់គ្លេស",
    year: "ឆ្នាំ",
    subject: "មុខវិជ្ជា",
    category: "ប្រភេទ",
    url: "URL របស់ Google Drive",
    actions: "សកម្មភាព",
    empty: "រកមិនឃើញទិន្នន័យ",
    access: "អនុញ្ញាត Gmail",
    addUser: "បន្ថែមអ្នកប្រើ",
  },
  en: {
    library: "Exam Paper Library",
    manage: "Manage exam papers and share knowledge with students.",
    login: "Continue with Google",
    allowed: "Use a Gmail account approved by the admin",
    edit: "Edit exam paper",
    add: "Add new exam paper",
    cancel: "Cancel",
    save: "Save changes",
    create: "Add exam paper",
    list: "Exam papers",
    search: "Search...",
    logout: "Sign out",
    title: "Title",
    khmerTitle: "Khmer title",
    englishTitle: "English title",
    year: "Year",
    subject: "Subject",
    category: "Category",
    url: "Google Drive URL",
    actions: "Actions",
    empty: "No records found",
    access: "Gmail access",
    addUser: "Add user",
  },
};

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [papers, setPapers] = useState([]);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [form, setForm] = useState(emptyPaper);
  const [category, setCategory] = useState("social_science");
  const [subject, setSubject] = useState("អក្សរសាស្ត្រខ្មែរ");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const [translationDirection, setTranslationDirection] = useState("km-en");
  const [translating, setTranslating] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState("");
  const skipAutoTranslation = useRef(false);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return undefined;
    }
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setRole(null);
      if (!currentUser) {
        setAuthLoading(false);
        return;
      }
      const emailAddress = currentUser.email.toLowerCase();
      const direct = await getDoc(doc(db, "allowed_users", emailAddress));
      let access = direct.exists() ? direct.data() : null;
      if (!access) {
        const matches = await getDocs(
          query(
            collection(db, "allowed_users"),
            where("email", "==", emailAddress),
          ),
        );
        access =
          matches.docs.find((item) => item.data().allowed)?.data() || null;
      }
      if (access?.allowed) setRole(access.role || "user");
      setAuthLoading(false);
    });
  }, []);
  useEffect(() => {
    if (role) return subscribeData();
  }, [role]);
  useEffect(() => {
    if (!role || form.title.trim().length < 3) return undefined;
    if (skipAutoTranslation.current) {
      skipAutoTranslation.current = false;
      return undefined;
    }
    const timer = setTimeout(() => translateTitle(translationDirection), 900);
    return () => clearTimeout(timer);
  }, [form.title, translationDirection, role]);
  useEffect(() => {
    setPage(1);
  }, [category, subject, search]);
  function subscribeData() {
    const stopPapers = onSnapshot(
      query(collection(db, "exam_papers"), orderBy("year", "desc")),
      (result) =>
        setPapers(result.docs.map((item) => ({ id: item.id, ...item.data() }))),
    );
    const stopUsers =
      role === "admin"
        ? onSnapshot(collection(db, "allowed_users"), (result) =>
            setAllowedUsers(
              result.docs.map((item) => ({ id: item.id, ...item.data() })),
            ),
          )
        : () => {};
    return () => {
      stopPapers();
      stopUsers();
    };
  }
  async function login() {
    if (auth) await signInWithPopup(auth, googleProvider);
  }
  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    if (event.target.name === "title") setTranslatedTitle("");
  }
  function updateTranslatedTitle(event) {
    setTranslatedTitle(event.target.value);
  }
  function selectCategory(event) {
    const value = event.target.value;
    setCategory(value);
    setSubject(subjects[value][0]);
    setForm({ ...form, category: value, subject: subjects[value][0] });
  }
  function editPaper(paper) {
    setForm(paper);
    setTranslatedTitle(paper.translated_title || "");
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function clearForm() {
    setForm({ ...emptyPaper, category, subject });
    setTranslatedTitle("");
    setEditing(false);
  }
  async function savePaper(event) {
    event.preventDefault();
    const values = {
      category: form.category,
      subject: form.subject,
      drive_url: form.drive_url,
      title: form.title,
      year: Number(form.year),
      ...(translatedTitle
        ? {
            translated_title: translatedTitle,
            translated_title_language: translationDirection.split("-")[1],
          }
        : {}),
    };
    if (editing) await setDoc(doc(db, "exam_papers", form.id), values);
    else await addDoc(collection(db, "exam_papers"), values);
    setMessage(editing ? "បានកែប្រែទិន្នន័យ" : "បានបញ្ចូលទិន្នន័យ");
    clearForm();
  }
  async function removePaper(id) {
    if (window.confirm("តើអ្នកពិតជាចង់លុបវិញ្ញាសានេះមែនទេ?")) {
      await deleteDoc(doc(db, "exam_papers", id));
      setMessage("បានលុបទិន្នន័យ");
    }
  }
  async function allowEmail(event) {
    event.preventDefault();
    const clean = email.trim().toLowerCase();
    await setDoc(doc(db, "allowed_users", clean), {
      email: clean,
      allowed: true,
      role: "user",
    });
    setEmail("");
    setMessage("បានអនុញ្ញាត Gmail");
  }
  async function revokeEmail(item) {
    await setDoc(doc(db, "allowed_users", item.id), {
      ...item,
      allowed: !item.allowed,
      email: item.email.toLowerCase(),
    });
  }
  async function translateTitle(direction = translationDirection) {
    const sourceTitle = form.title.trim();
    if (!sourceTitle) return;
    setTranslating(true);
    setMessage("");
    try {
      const [source, target] = direction.split("-");
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceTitle)}&langpair=${source}|${target}`,
      );
      const result = await response.json();
      const translated =
        titleTranslations[sourceTitle] || result.responseData?.translatedText;
      if (!translated) throw new Error("translation failed");
      skipAutoTranslation.current = true;
      setTranslatedTitle(translated);
      if (direction === "km-en") {
        setForm((current) => ({ ...current, title: sourceTitle }));
      }
      setMessage(
        language === "km"
          ? `បានបកប្រែ៖ ${translated}`
          : `Translated: ${translated}`,
      );
    } catch {
      setMessage(
        language === "km"
          ? "មិនអាចបកប្រែបានទេ សូមពិនិត្យ Internet"
          : "Translation failed. Check your internet connection.",
      );
    } finally {
      setTranslating(false);
    }
  }
  const t = text[language];
  const translate = (value) =>
    language === "en"
      ? translations[value] || categoryTranslations[value] || value
      : value;
  const displayTitle = (paper) => {
    if (!paper) return "";
    const title = paper.title || "";
    const translated = paper.translated_title || "";
    return language === "en" ? translated || title : title;
  };
  const toggleLanguage = (
    <button
      className="language-toggle"
      onClick={() => setLanguage(language === "km" ? "en" : "km")}
      aria-label="Change language"
    >
      {language === "km" ? "EN" : "ខ្មែរ"}
    </button>
  );

  if (!firebaseConfigured)
    return (
      <main className="login-screen">
        <div className="login-panel">
          <span className="kicker">FIREBASE SETUP</span>
          <h2>ត្រូវបញ្ចូល Firebase config</h2>
          <p>
            បង្កើត file <strong>client/.env</strong> ពី{" "}
            <strong>client/.env.example</strong> ហើយដាក់ Web App config ពី
            Firebase Console។ បន្ទាប់មក restart Vite server។
          </p>
          <code>npm run dev</code>
        </div>
      </main>
    );
  if (authLoading)
    return (
      <main className="login-screen">
        <div className="loading-mark">កំពុងរៀបចំ...</div>
      </main>
    );
  if (!user)
    return (
      <main className="login-screen">
        <div className="login-panel">
          <div className="login-tools">{toggleLanguage}</div>
          <span className="kicker">EBACII · ADMIN PORTAL</span>
          <h1>
            {language === "km" ? (
              <>
                <span>បណ្ណាល័យ</span>
                <em>វិញ្ញាសា</em>
              </>
            ) : (
              <>
                <span>Exam Paper</span>
                <em>Library</em>
              </>
            )}
          </h1>
          <p>{t.manage}</p>
          <button className="primary" onClick={login}>
            {t.login} <span>↗</span>
          </button>
          <small>{t.allowed}</small>
        </div>
      </main>
    );
  if (!role)
    return (
      <main className="login-screen">
        <div className="login-panel">
          <span className="kicker">ACCESS REQUEST</span>
          <h2>គណនីនេះមិនទាន់មានសិទ្ធិ</h2>
          <p>{user.email}</p>
          <button className="quiet" onClick={() => signOut(auth)}>
            ចាកចេញ
          </button>
        </div>
      </main>
    );

  const visible = papers.filter(
    (paper) =>
      paper.category === category &&
      paper.subject === subject &&
      (!search ||
        `${paper.title} ${paper.translated_title || ""} ${paper.subject}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const paged = visible.slice((page - 1) * pageSize, page * pageSize);
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">EBACII · CONTENT DESK</p>
          <h1>{t.library}</h1>
        </div>
        <div className="account">
          {toggleLanguage}
          <span>{user.email}</span>
          <button onClick={() => signOut(auth)}>{t.logout}</button>
        </div>
      </header>
      <section className="workspace">
        <form className="editor" onSubmit={savePaper}>
          <div className="section-heading">
            <div>
              <span className="kicker">
                {editing ? "EDIT RECORD" : "NEW RECORD"}
              </span>
              <h2>{editing ? t.edit : t.add}</h2>
            </div>
            {editing && (
              <button type="button" className="quiet" onClick={clearForm}>
                {t.cancel}
              </button>
            )}
          </div>
          <div className="fields">
            <label>
              {t.category}
              <select
                name="category"
                value={form.category}
                onChange={selectCategory}
              >
                {Object.keys(subjects).map((item) => (
                  <option key={item} value={item}>
                    {translate(item)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t.subject}
              <select name="subject" value={form.subject} onChange={update}>
                {subjects[form.category].map((item) => (
                  <option key={item} value={item}>
                    {translate(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide title-field">
              {t.khmerTitle}
              <input
                name="title"
                value={form.title}
                onChange={update}
                required
              />
            </label>
            <label className="wide title-field">
              {t.englishTitle}
              <input
                name="translated_title"
                value={translatedTitle}
                onChange={updateTranslatedTitle}
                placeholder="2022 Bac II Earth-Environment Examination"
              />
            </label>
            <label>
              {t.year}
              <input
                name="year"
                type="number"
                value={form.year}
                onChange={update}
                required
              />
            </label>
            <label className="wide">
              {t.url}
              <input
                name="drive_url"
                type="url"
                value={form.drive_url}
                onChange={update}
                required
              />
            </label>
          </div>
          <button className="primary" type="submit">
            {editing ? t.save : t.create} <span>↗</span>
          </button>
          {message && <p className="message">{message}</p>}
        </form>
        <section className="records">
          <div className="records-heading">
            <div>
              <span className="kicker">{translate(category)}</span>
              <h2>
                {t.list} <b>{visible.length}</b>
              </h2>
            </div>
          </div>
          <div className="tabs">
            {subjects[category].map((item) => (
              <button
                className={subject === item ? "active" : ""}
                onClick={() => setSubject(item)}
                key={item}
              >
                {translate(item)}
              </button>
            ))}
          </div>
          <div className="filters">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
            />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.title}</th>
                  <th>{t.year}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((paper) => (
                  <tr key={paper.id}>
                    <td>
                      <strong>{displayTitle(paper)}</strong>
                      <small>{translate(paper.subject)}</small>
                    </td>
                    <td>{paper.year}</td>
                    <td className="actions">
                      <a
                        href={paper.drive_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        ↗
                      </a>
                      <button onClick={() => editPaper(paper)}>✎</button>
                      <button
                        className="danger"
                        onClick={() => removePaper(paper.id)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visible.length && <p className="empty">{t.empty}</p>}
            {visible.length > 0 && (
              <nav className="pagination" aria-label="Pagination">
                <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <button key={number} className={page === number ? "active" : ""} onClick={() => setPage(number)}>{number}</button>
                ))}
                <button onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>Next</button>
              </nav>
            )}
          </div>
        </section>
      </section>
      {role === "admin" && (
        <section className="access-panel">
          <div>
            <span className="kicker">ACCESS CONTROL</span>
            <h2>{t.access}</h2>
          </div>
          <form onSubmit={allowEmail}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@gmail.com"
              required
            />
            <button className="primary" type="submit">
              {t.addUser} <span>+</span>
            </button>
          </form>
          <ul>
            {allowedUsers.map((item) => (
              <li key={item.id}>
                <span>{item.email}</span>
                <button onClick={() => revokeEmail(item)}>
                  {item.allowed
                    ? language === "km"
                      ? "អនុញ្ញាត"
                      : "Allowed"
                    : language === "km"
                      ? "បានដកសិទ្ធិ"
                      : "Revoked"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

export default App;
