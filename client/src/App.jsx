import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, getDocs, onSnapshot, query, setDoc, where, collection, orderBy } from "firebase/firestore";
import { auth, db, firebaseConfigured, googleProvider } from "./config/firebase.js";
import { formatDriveDownloadUrl } from "./utils/driveUtils.js";

import ExamPapers from "./components/ExamPapers";
import JobOpportunities from "./components/JobOpportunities";
import Scholarships from "./components/Scholarships";
import "./App.css";

const text = {
  km: {
    library: "បណ្ណាល័យវិញ្ញាសា",
    manage: "គ្រប់គ្រងវិញ្ញាសា ការងារ និងអាហារូបករណ៍។",
    login: "ចូលជាមួយ Google",
    allowed: "ប្រើ Gmail ដែល admin បានអនុញ្ញាត",
    edit: "កែប្រែទិន្នន័យ",
    add: "បញ្ចូលទិន្នន័យថ្មី",
    cancel: "បោះបង់",
    save: "រក្សាទុកការកែប្រែ",
    create: "បញ្ចូល",
    list: "បញ្ជីទិន្នន័យ",
    search: "ស្វែងរក...",
    logout: "ចាកចេញ",
    title: "ចំណងជើង",
    khmerTitle: "ចំណងជើងខ្មែរ",
    englishTitle: "ចំណងជើងអង់គ្លេស",
    year: "ឆ្នាំ",
    subject: "មុខវិជ្ជា",
    category: "ប្រភេទ",
    url: "URL",
    actions: "សកម្មភាព",
    empty: "រកមិនឃើញទិន្នន័យ",
    access: "អនុញ្ញាត Gmail",
    addUser: "បន្ថែមអ្នកប្រើ",
    moduleExams: "វិញ្ញាសា",
    moduleJobs: "ឱកាសការងារ",
    moduleScholarships: "អាហារូបករណ៍",
    teacherType: "ប្រភេទគ្រូបង្រៀន",
    all: "ទាំងអស់",
    previous: "មុន",
    next: "បន្ទាប់",
    success: "រក្សាទុកបានជោគជ័យ!",
    confirmDelete: "តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?",
    jobsTitle: "ការងារ",
    scholarshipsTitle: "អាហារូបករណ៍",
    addJob: "បន្ថែមការងារ",
    editJob: "កែប្រែការងារ",
    addScholarship: "បន្ថែមអាហារូបករណ៍",
    editScholarship: "កែប្រែអាហារូបករណ៍",
    deadline: "ថ្ងៃផុតកំណត់",
    jobType: "ប្រភេទការងារ",
    location: "ទីតាំង",
    status: "ស្ថានភាព",
    coverage: "ការរ៉ាប់រង",
    provider: "អ្នកផ្តល់ជូន",
    scholarshipType: "ប្រភេទអាហារូបករណ៍"
  },
  en: {
    library: "Content Desk",
    manage: "Manage exam papers, jobs, and scholarships.",
    login: "Continue with Google",
    allowed: "Use a Gmail account approved by the admin",
    edit: "Edit record",
    add: "Add new record",
    cancel: "Cancel",
    save: "Save changes",
    create: "Add record",
    list: "Records list",
    search: "Search...",
    logout: "Sign out",
    title: "Title",
    khmerTitle: "Khmer title",
    englishTitle: "English title",
    year: "Year",
    subject: "Subject",
    category: "Category",
    url: "Link/URL",
    actions: "Actions",
    empty: "No records found",
    access: "Gmail access",
    addUser: "Add user",
    moduleExams: "Exam Papers",
    moduleJobs: "Job Opportunities",
    moduleScholarships: "Scholarships",
    teacherType: "Teacher Type",
    all: "All",
    previous: "Previous",
    next: "Next",
    success: "Record saved successfully!",
    confirmDelete: "Are you sure you want to delete this record?",
    jobsTitle: "JOBS",
    scholarshipsTitle: "SCHOLARSHIPS",
    addJob: "Add Job",
    editJob: "Edit Job",
    addScholarship: "Add Scholarship",
    editScholarship: "Edit Scholarship",
    deadline: "Deadline",
    jobType: "Job Type",
    location: "Location",
    status: "Status",
    coverage: "Coverage",
    provider: "Provider",
    scholarshipType: "Scholarship Type"
  },
};

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [allowedUsers, setAllowedUsers] = useState([]);
  
  const [papers, setPapers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);

  const [currentModule, setCurrentModule] = useState("exams"); 
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("km");

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
          query(collection(db, "allowed_users"), where("email", "==", emailAddress))
        );
        access = matches.docs.find((item) => item.data().allowed)?.data() || null;
      }
      if (access?.allowed) setRole(access.role || "user");
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (role) return subscribeData();
  }, [role]);

  function subscribeData() {
    const stopPapers = onSnapshot(query(collection(db, "exam_papers"), orderBy("year", "desc")), (result) =>
        setPapers(result.docs.map((item) => ({ id: item.id, ...item.data() })))
    );
    const stopJobs = onSnapshot(collection(db, "job_opportunities"), (result) =>
      setJobs(result.docs.map((item) => ({ id: item.id, ...item.data() })))
    );
    const stopScholarships = onSnapshot(collection(db, "scholarship"), (result) =>
      setScholarships(result.docs.map((item) => ({ id: item.id, ...item.data() })))
    );
    const stopUsers = role === "admin" ? onSnapshot(collection(db, "allowed_users"), (result) =>
            setAllowedUsers(result.docs.map((item) => ({ id: item.id, ...item.data() })))
          ) : () => {};
          
    return () => { stopPapers(); stopJobs(); stopScholarships(); stopUsers(); };
  }

  async function login() {
    if (auth) await signInWithPopup(auth, googleProvider);
  }

  async function allowEmail(event) {
    event.preventDefault();
    const clean = email.trim().toLowerCase();
    await setDoc(doc(db, "allowed_users", clean), { email: clean, allowed: true, role: "user" });
    setEmail("");
    setMessage("បានអនុញ្ញាត Gmail");
  }

  async function revokeEmail(item) {
    await setDoc(doc(db, "allowed_users", item.id), { ...item, allowed: !item.allowed, email: item.email.toLowerCase() });
  }

  async function migrateDriveLinks() {
    if (!db) return;
    const snapshot = await getDocs(collection(db, "exam_papers"));
    await Promise.all(
      snapshot.docs.map(async (paperDoc) => {
        const paper = paperDoc.data();
        const nextUrl = formatDriveDownloadUrl(paper.drive_url || "");
        if (!paper.drive_url || nextUrl === paper.drive_url) return;
        await setDoc(doc(db, "exam_papers", paperDoc.id), { ...paper, drive_url: nextUrl });
      })
    );
    setMessage("បានកែប្រែ Google Drive URL របស់វិញ្ញាសាទាំងអស់");
  }

  const t = text[language];
  const toggleLanguage = (
    <button className="language-toggle" onClick={() => setLanguage(language === "km" ? "en" : "km")} aria-label="Change language">
      {language === "km" ? "EN" : "ខ្មែរ"}
    </button>
  );

  if (!firebaseConfigured) return (
    <main className="login-screen">
      <div className="login-panel">
        <span className="kicker">FIREBASE SETUP</span>
        <h2>ត្រូវបញ្ចូល Firebase config</h2>
      </div>
    </main>
  );

  if (authLoading) return <main className="login-screen"><div className="loading-mark">កំពុងរៀបចំ...</div></main>;

  if (!user) return (
    <main className="login-screen">
      <div className="login-panel">
        <div className="login-tools">{toggleLanguage}</div>
        <span className="kicker">EBACII · ADMIN PORTAL</span>
        <h1 className="brand-lockup">
          {language === "km" ? (<><span className="brand-primary">បណ្ណាល័យ</span><span className="brand-secondary">វិញ្ញាសា</span></>) : (<><span className="brand-primary">Content</span><span className="brand-secondary">Desk</span></>)}
        </h1>
        <p>{t.manage}</p>
        <button className="primary" onClick={login}>{t.login} <span>↗</span></button>
        <small>{t.allowed}</small>
      </div>
    </main>
  );

  if (!role) return (
    <main className="login-screen">
      <div className="login-panel">
        <span className="kicker">ACCESS REQUEST</span>
        <h2>គណនីនេះមិនទាន់មានសិទ្ធិ</h2>
        <p>{user.email}</p>
        <button className="quiet" onClick={() => signOut(auth)}>ចាកចេញ</button>
      </div>
    </main>
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        {/* header */}
        <div>
          <h1>{t.library}</h1>
        </div>
        <div className="account">
          {toggleLanguage}
          <span>{user.email}</span>
          <button onClick={() => signOut(auth)}>{t.logout}</button>
        </div>
      </header>
      {/* all tabs */}
      <div className="module-tabs">
        <button className={currentModule === "exams" ? "active" : ""} onClick={() => setCurrentModule("exams")}>{t.moduleExams}</button>
        <button className={currentModule === "jobs" ? "active" : ""} onClick={() => setCurrentModule("jobs")}>{t.moduleJobs}</button>
        <button className={currentModule === "scholarships" ? "active" : ""} onClick={() => setCurrentModule("scholarships")}>{t.moduleScholarships}</button>
      </div>

      <section className="workspace full-width">
        {currentModule === "exams" && <ExamPapers papers={papers} language={language} t={t} />}
        {currentModule === "jobs" && <JobOpportunities jobs={jobs} language={language} t={t} />}
        {currentModule === "scholarships" && <Scholarships scholarships={scholarships} language={language} t={t} />}
      </section>

      {role === "admin" && (
        <section className="access-panel">
          <div><span className="kicker"></span><h2>{t.access}</h2></div>
          <form onSubmit={allowEmail}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@gmail.com" required />
            <button className="primary" type="submit">{t.addUser} <span>+</span></button>
          </form>
          {message && <p className="message">{message}</p>}
          <button type="button" className="quiet" onClick={migrateDriveLinks}>Fix old Google Drive URLs</button>
          <ul>
            {allowedUsers.map((item) => (
              <li key={item.id}>
                <span>{item.email}</span>
                <button onClick={() => revokeEmail(item)}>
                  {item.allowed ? (language === "km" ? "អនុញ្ញាត" : "Allowed") : (language === "km" ? "បានដកសិទ្ធិ" : "Revoked")}
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