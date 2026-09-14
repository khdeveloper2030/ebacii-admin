import React, { useState, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase.js";
import { getDisplayTitle } from "../utils/titleUtils.js";
import { formatDriveDownloadUrl, normalizeDriveFileId } from "../utils/driveUtils.js";

const subjects = {
  real_science: ["គណិតវិទ្យា", "អក្សរសាស្ត្រខ្មែរ", "រូបវិទ្យា", "គីមីវិទ្យា", "ជីវវិទ្យា", "អង់គ្លេស", "ប្រវត្តិវិទ្យា"],
  social_science: ["អក្សរសាស្ត្រខ្មែរ", "គណិតវិទ្យា", "ប្រវត្តិវិទ្យា", "ភូមិវិទ្យា", "សីលធម៌-ពលរដ្ឋ", "អង់គ្លេស", "ផែនដី និង បរិស្ថានវិទ្យា"],
  "pre-School_primary_teacher_exam": ["អក្សរសាស្ត្រខ្មែរ", "គណិតវិទ្យា", "វប្បធម៌ទូទៅ"],
  secondary_school_teacher_exam: ["គណិតវិទ្យា & រូបវិទ្យា", "រូបវិទ្យា & គីមីវិទ្យា", "ជីវវិទ្យា & គីមីវិទ្យា", "អក្សរសាស្ត្រខ្មែរ & សីលធម៌-ពលរដ្ឋ", "ប្រវត្តិវិទ្យា & ភូមិវិទ្យា", "ភូមិវិទ្យា & ប្រវត្តិវិទ្យា", "ភាសាអង់គ្លេស & អក្សរសាស្ត្រខ្មែរ", "កីឡា និងអប់រំកាយ & ចំណេះដឹងទូទៅ / សីលធម៌"],
  high_school_exam: ["គណិតវិទ្យា", "រូបវិទ្យា", "គីមីវិទ្យា", "ជីវវិទ្យា", "អក្សរសាស្ត្រខ្មែរ", "ប្រវត្តិវិទ្យា", "ភូមិវិទ្យា", "សីលធម៌-ពលរដ្ឋ", "ព័ត៌មានវិទ្យា (ICT)"],
  medical_exam: ["គីមីវិទ្យា", "ជីវវិទ្យា", "គណិតវិទ្យា"],
  itc_exam: ["គណិតវិទ្យា", "រូបវិទ្យា", "គីមីវិទ្យា", "តក្កវិទ្យា"],
  outstanding_student_exam: ["គណិតវិទ្យា", "រូបវិទ្យា", "គីមីវិទ្យា"], 
};

const translations = {
  អក្សរសាស្ត្រខ្មែរ: "Khmer Literature", គណិតវិទ្យា: "Mathematics", ប្រវត្តិវិទ្យា: "History", ភូមិវិទ្យា: "Geography",
  រូបវិទ្យា: "Physics", គីមីវិទ្យា: "Chemistry", ជីវវិទ្យា: "Biology", អង់គ្លេស: "English",
  "សីលធម៌-ពលរដ្ឋ": "Morality and Civics", វប្បធម៌ទូទៅ: "General Culture", តក្កវិទ្យា: "Logic",
  "ផែនដី និង បរិស្ថានវិទ្យា": "Earth and Environment", "ព័ត៌មានវិទ្យា (ICT)": "Information Technology (ICT)",
};

const categoryTranslations = {
  real_science: "Real Science", social_science: "Social Science", "pre-School_primary_teacher_exam": "Primary Teacher Exam",
  secondary_school_teacher_exam: "Secondary Teacher Exam", high_school_exam: "High School Exam",
  medical_exam: "Medical Exam", itc_exam: "ITC Exam", outstanding_student_exam: "Outstanding Student Exam",
};

const emptyPaper = {
  category: "social_science", subject: "អក្សរសាស្ត្រខ្មែរ", drive_url: "", title: "", year: new Date().getFullYear(), teacherType: "", teacherType_km: ""
};

const teacherTypeOptions = [
  { id: "state teacher", display_en: "State Teacher", km: "គ្រូក្របខ័ណ្ឌ" },
  { id: "contract teacher", display_en: "Contract Teacher", km: "គ្រូកិច្ចសន្យា" },
  { id: "agreement teacher", display_en: "Agreement Teacher", km: "គ្រូកិច្ចព្រមព្រៀង" }
];

export default function ExamPapers({ papers, language, t }) {
  const [form, setForm] = useState(emptyPaper);
  
  // List Filters
  const [listCategory, setListCategory] = useState("social_science");
  const [listSubject, setListSubject] = useState("");
  const [listTeacherType, setListTeacherType] = useState("");
  const [search, setSearch] = useState("");
  
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const translate = (value) => language === "en" ? translations[value] || categoryTranslations[value] || value : value;
  const displayTitle = (paper) => getDisplayTitle(paper, language);

  useEffect(() => {
    setPage(1);
  }, [listCategory, listSubject, listTeacherType, search]);

  function update(event) {
    const { name, value } = event.target;
    if (name === "drive_url") {
      setForm({ ...form, [name]: normalizeDriveFileId(value) });
      return;
    }
    setForm({ ...form, [name]: value });
  }

  function updateTeacherType(event) {
    const value = event.target.value;
    if(!value) {
      setForm({...form, teacherType: "", teacherType_km: ""});
      return;
    }
    const option = teacherTypeOptions.find(opt => opt.id === value);
    setForm({...form, teacherType: option.id, teacherType_km: option.km});
  }

  function handleListCategoryChange(e) {
    const val = e.target.value;
    setListCategory(val);
    setListSubject(""); // Reset subject to show all subjects for that category
    setListTeacherType("");
  }

  function handleAddNew() {
    setForm({ ...emptyPaper, category: listCategory, subject: subjects[listCategory][0] });
    setTranslatedTitle("");
    setEditing(false);
    setIsFormOpen(true);
  }

  function editPaper(paper) {
    setForm({ ...paper, drive_url: normalizeDriveFileId(paper.drive_url) });
    setTranslatedTitle(paper.translated_title || "");
    setEditing(true);
    setIsFormOpen(true);
  }

  function handleClose() {
    setIsFormOpen(false);
  }

  async function savePaper(event) {
    event.preventDefault();
    const cleanedDriveId = normalizeDriveFileId(form.drive_url);
    const values = {
      category: form.category, subject: form.subject, drive_url: formatDriveDownloadUrl(cleanedDriveId),
      title: form.title, year: Number(form.year),
      ...(form.teacherType ? { teacherType: form.teacherType, teacherType_km: form.teacherType_km } : {}),
      ...(translatedTitle ? { translated_title: translatedTitle, translated_title_language: "en" } : {}),
    };
    try {
      if (editing) await setDoc(doc(db, "exam_papers", form.id), values);
      else await addDoc(collection(db, "exam_papers"), values);
      
      setIsFormOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
      setEditing(false);
    } catch (error) {
      alert("Error saving data");
    }
  }

  async function removePaper(id) {
    if (window.confirm(t.confirmDelete)) {
      await deleteDoc(doc(db, "exam_papers", id));
    }
  }

  const showTeacherTypeForm = ["pre-School_primary_teacher_exam", "secondary_school_teacher_exam", "high_school_exam"].includes(form.category);
  const showListTeacherType = ["pre-School_primary_teacher_exam", "secondary_school_teacher_exam", "high_school_exam"].includes(listCategory);
  
  const pageSize = 10;
  
  const visible = papers.filter((paper) => {
    const matchCategory = !listCategory || paper.category === listCategory;
    const matchSubject = !listSubject || paper.subject === listSubject;
    const matchTeacherType = !listTeacherType || paper.teacherType === listTeacherType;
    const matchSearch = !search || `${paper.title} ${paper.translated_title || ""} ${paper.subject}`.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSubject && matchTeacherType && matchSearch;
  });

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const paged = visible.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="records-header-bar">
        <div className="records-heading" style={{ marginBottom: 0 }}>
          <div>
            {/* <span className="kicker">{translate(listCategory)}</span> */}
            <h2>{t.list}</h2>
          </div>
        </div>
        <button className="primary" onClick={handleAddNew}>+ {t.add}</button>
      </div>
      
      <section className="records">
        
        {/* DROPDOWN FILTERS */}
        <div className="filter-controls">
          <select value={listCategory} onChange={handleListCategoryChange}>
            {Object.keys(subjects).map((cat) => (
              <option key={cat} value={cat}>{translate(cat)}</option>
            ))}
          </select>

          <select value={listSubject} onChange={(e) => setListSubject(e.target.value)}>
            <option value="">-- {t.subject} ({t.all}) --</option>
            {subjects[listCategory]?.map((sub) => (
              <option key={sub} value={sub}>{translate(sub)}</option>
            ))}
          </select>

          {showListTeacherType && (
            <select value={listTeacherType} onChange={(e) => setListTeacherType(e.target.value)}>
              <option value="">-- {t.teacherType} ({t.all}) --</option>
              {teacherTypeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{language === 'en' ? opt.display_en : opt.km}</option>
              ))}
            </select>
          )}
          
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} />
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
              {paged.map((item) => {
                const displayTeacherType = item.teacherType 
                  ? (language === 'en' ? (teacherTypeOptions.find(opt => opt.id === item.teacherType)?.display_en || item.teacherType) : item.teacherType_km) 
                  : "";
                
                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{displayTitle(item)}</strong>
                      <small>
                        {t.subject}: {translate(item.subject)} 
                        {displayTeacherType && ` | ${t.teacherType}: ${displayTeacherType}`}
                      </small>
                    </td>
                    <td>{item.year}</td>
                    <td className="actions">
                      <a href={formatDriveDownloadUrl(item.drive_url)} target="_blank" rel="noreferrer" title="Open Link">↗</a>
                      <button onClick={() => editPaper(item)} title="Edit record">✎</button>
                      <button className="danger" onClick={() => removePaper(item.id)} title="Delete record">×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!visible.length && <p className="empty">{t.empty}</p>}
          {visible.length > 0 && (
            <nav className="pagination" aria-label="Pagination">
              <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>{t.previous}</button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                <button key={number} className={page === number ? "active" : ""} onClick={() => setPage(number)}>{number}</button>
              ))}
              <button onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>{t.next}</button>
            </nav>
          )}
        </div>
      </section>

      {/* POPUP MODAL FOR ADD/EDIT */}
      <div className={`modal-overlay ${isFormOpen ? 'open' : ''}`}>
        <div className="modal-panel">
          <div className="modal-header">
            <div>
              {/* <span className="kicker">{editing ? (language === 'en' ? 'EDIT RECORD' : 'កែប្រែទិន្នន័យ') : (language === 'en' ? 'NEW RECORD' : 'ទិន្នន័យថ្មី')}</span> */}
              <h2>{editing ? t.edit : t.add}</h2>
            </div>
            <button type="button" className="close-btn" onClick={handleClose}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={savePaper}>
              <div className="fields">
                <label>
                  {t.category}
                  <select name="category" value={form.category} onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, category: value, subject: subjects[value][0], teacherType: "", teacherType_km: "" });
                  }}>
                    {Object.keys(subjects).map((item) => (
                      <option key={item} value={item}>{translate(item)}</option>
                    ))}     
                  </select>
                </label>
                <label>
                  {t.subject}
                  <select name="subject" value={form.subject} onChange={update}>
                    {subjects[form.category]?.map((item) => (
                      <option key={item} value={item}>{translate(item)}</option>
                    ))}
                  </select>
                </label>

                {showTeacherTypeForm && (
                  <label className="wide title-field">
                    {t.teacherType}
                    <select name="teacherType" value={form.teacherType} onChange={updateTeacherType}>
                      <option value="">-- {language === 'en' ? 'Select Type' : 'ជ្រើសរើសប្រភេទ'} --</option>
                      {teacherTypeOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{language === 'en' ? opt.display_en : opt.km}</option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="wide title-field">
                  {t.khmerTitle}
                  <input name="title" value={form.title} onChange={update} required lang="km" translate="no" />
                </label>
                <label className="wide title-field">
                  {t.englishTitle}
                  <input name="translated_title" value={translatedTitle} onChange={(e) => setTranslatedTitle(e.target.value)} placeholder="2022 Bac II Khmer Literature Examination" lang="en" translate="no" />
                </label>
                <label>
                  {t.year}
                  <input name="year" type="number" value={form.year} onChange={update} required />
                </label>
                <label className="wide">
                  {t.url}
                  <input name="drive_url" type="text" value={form.drive_url} onChange={update} placeholder="16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r" required />
                </label>
              </div>
              <button className="primary" type="submit">{editing ? t.save : t.create} <span>↗</span></button>
            </form>
          </div>
        </div>
      </div>

      <div className={`toast-success ${showToast ? 'show' : ''}`}>
        ✓ {t.success}
      </div>
    </>
  );
}