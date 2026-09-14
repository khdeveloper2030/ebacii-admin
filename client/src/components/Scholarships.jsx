import React, { useState, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const emptyScholarship = {
  applyLink: "", contactEmail: "", coverage: "", coverage_km: "", deadline: "",
  degreeLevel: "", degreeLevel_km: "", description: "", description_km: "",
  location: "", location_km: "", phoneNumber: "", provider: "", provider_km: "",
  requirements: "", requirement_km: "", scholarshipType: "", scholarshipType_km: "",
  status: "open", status_km: "នៅតែបើក", title: "", title_km: ""
};

// Helper to extract unique dropdown options dynamically (case-insensitive & trims spaces)
function getUniqueOptions(data, enKey, kmKey) {
  const options = [];
  const seen = new Set();
  data.forEach(item => {
    let valEn = item[enKey];
    let valKm = item[kmKey] || valEn;
    
    if (valEn) {
      const normalized = typeof valEn === 'string' ? valEn.trim().toLowerCase() : valEn;
      if (!seen.has(normalized)) {
        seen.add(normalized);
        options.push({ 
          en: typeof valEn === 'string' ? valEn.trim() : valEn, 
          km: typeof valKm === 'string' ? valKm.trim() : valKm,
          value: normalized
        });
      }
    }
  });
  return options;
}

export default function Scholarships({ scholarships, language, t }) {
  const [scholarshipForm, setScholarshipForm] = useState(emptyScholarship);
  const [search, setSearch] = useState("");
  
  // List Filters
  const [filterCoverage, setFilterCoverage] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterProvider, setFilterProvider] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, filterCoverage, filterLocation, filterProvider, filterType, filterStatus]);

  function updateScholarship(event) {
    setScholarshipForm({ ...scholarshipForm, [event.target.name]: event.target.value });
  }

  function handleAddNew() {
    setScholarshipForm(emptyScholarship);
    setEditing(false);
    setIsFormOpen(true);
  }

  function editScholarship(scholarship) {
    setScholarshipForm(scholarship);
    setEditing(true);
    setIsFormOpen(true);
  }

  function handleClose() {
    setIsFormOpen(false);
  }

  async function saveScholarship(event) {
    event.preventDefault();
    try {
      if (editing) await setDoc(doc(db, "scholarship", scholarshipForm.id), scholarshipForm);
      else await addDoc(collection(db, "scholarship"), scholarshipForm);
      
      setIsFormOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
      setScholarshipForm(emptyScholarship);
      setEditing(false);
    } catch (error) {
      alert("Error saving data");
    }
  }

  async function removeScholarship(id) {
    if (window.confirm(t.confirmDelete)) {
      await deleteDoc(doc(db, "scholarship", id));
    }
  }

  // Extract Dropdown Options dynamically
  const coverages = getUniqueOptions(scholarships, "coverage", "coverage_km");
  const locations = getUniqueOptions(scholarships, "location", "location_km");
  const providers = getUniqueOptions(scholarships, "provider", "provider_km");
  const scholarshipTypes = getUniqueOptions(scholarships, "scholarshipType", "scholarshipType_km");
  const statuses = getUniqueOptions(scholarships, "status", "status_km");

  const pageSize = 10;
  const visible = scholarships.filter((s) => {
    const matchSearch = !search || `${s.title} ${s.title_km} ${s.provider}`.toLowerCase().includes(search.toLowerCase());
    
    // Safely match the normalized version stored in filter with current item
    const matchCov = !filterCoverage || (s.coverage && s.coverage.trim().toLowerCase() === filterCoverage);
    const matchLoc = !filterLocation || (s.location && s.location.trim().toLowerCase() === filterLocation);
    const matchProv = !filterProvider || (s.provider && s.provider.trim().toLowerCase() === filterProvider);
    const matchType = !filterType || (s.scholarshipType && s.scholarshipType.trim().toLowerCase() === filterType);
    const matchStat = !filterStatus || (s.status && s.status.trim().toLowerCase() === filterStatus);

    return matchSearch && matchCov && matchLoc && matchProv && matchType && matchStat;
  });

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const paged = visible.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="records-header-bar">
        <div className="records-heading" style={{ marginBottom: 0 }}>
          <div>
            {/* <span className="kicker">{t.scholarshipsTitle}</span> */}
            <h2>{t.list}</h2>
          </div>
        </div>
        <button className="primary" onClick={handleAddNew}>+ {t.add}</button>
      </div>

      <section className="records">
        
        {/* DROPDOWN FILTERS */}
        <div className="filter-controls">
          <select value={filterCoverage} onChange={(e) => setFilterCoverage(e.target.value)}>
            <option value="">-- {t.coverage} ({t.all}) --</option>
            {coverages.map(opt => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.en : opt.km}</option>)}
          </select>
          
          <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
            <option value="">-- {t.location} ({t.all}) --</option>
            {locations.map(opt => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.en : opt.km}</option>)}
          </select>
          
          <select value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)}>
            <option value="">-- {t.provider} ({t.all}) --</option>
            {providers.map(opt => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.en : opt.km}</option>)}
          </select>
          
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">-- {t.scholarshipType} ({t.all}) --</option>
            {scholarshipTypes.map(opt => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.en : opt.km}</option>)}
          </select>
          
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">-- {t.status} ({t.all}) --</option>
            {statuses.map(opt => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.en : opt.km}</option>)}
          </select>

          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} />
        </div>
        
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t.title}</th>
                <th>{t.deadline}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{language === 'km' ? (item.title_km || item.title) : item.title}</strong>
                    <small>
                      {t.provider}: {language === 'km' ? (item.provider_km || item.provider) : item.provider}
                      {item.coverage && ` | ${t.coverage}: ${language === 'km' ? (item.coverage_km || item.coverage) : item.coverage}`}
                      {item.location && ` | ${t.location}: ${language === 'km' ? (item.location_km || item.location) : item.location}`}
                    </small>
                  </td>
                  <td>{item.deadline}</td>
                  <td className="actions">
                    <a href={item.applyLink} target="_blank" rel="noreferrer" title="Open Link">↗</a>
                    <button onClick={() => editScholarship(item)} title="Edit record">✎</button>
                    <button className="danger" onClick={() => removeScholarship(item.id)} title="Delete record">×</button>
                  </td>
                </tr>
              ))}
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
              {/* <span className="kicker">{editing ? t.editScholarship : t.addScholarship}</span> */}
              <h2>{editing ? t.edit : t.add}</h2>
            </div>
            <button type="button" className="close-btn" onClick={handleClose}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={saveScholarship}>
              <div className="fields">
                <label>{language === 'en' ? 'Title' : 'ចំណងជើង'} <input name="title" value={scholarshipForm.title} onChange={updateScholarship} required /></label>
                <label>{language === 'en' ? 'Title (Khmer)' : 'ចំណងជើង (ខ្មែរ)'} <input name="title_km" value={scholarshipForm.title_km} onChange={updateScholarship} /></label>

                <label>{t.provider} <input name="provider" value={scholarshipForm.provider} onChange={updateScholarship} /></label>
                <label>{t.provider} (Khmer) <input name="provider_km" value={scholarshipForm.provider_km} onChange={updateScholarship} /></label>

                <label>{language === 'en' ? 'Degree Level' : 'កម្រិតសិក្សា'} <input name="degreeLevel" value={scholarshipForm.degreeLevel} onChange={updateScholarship} /></label>
                <label>{language === 'en' ? 'Degree Level (Khmer)' : 'កម្រិតសិក្សា (ខ្មែរ)'} <input name="degreeLevel_km" value={scholarshipForm.degreeLevel_km} onChange={updateScholarship} /></label>
                
                <label>{t.coverage} <input name="coverage" value={scholarshipForm.coverage} onChange={updateScholarship} /></label>
                <label>{t.coverage} (Khmer) <input name="coverage_km" value={scholarshipForm.coverage_km} onChange={updateScholarship} /></label>
                
                <label>{t.location} <input name="location" value={scholarshipForm.location} onChange={updateScholarship} /></label>
                <label>{t.location} (Khmer) <input name="location_km" value={scholarshipForm.location_km} onChange={updateScholarship} /></label>
                
                <label>{t.scholarshipType} <input name="scholarshipType" value={scholarshipForm.scholarshipType} onChange={updateScholarship} /></label>
                <label>{t.scholarshipType} (Khmer) <input name="scholarshipType_km" value={scholarshipForm.scholarshipType_km} onChange={updateScholarship} /></label>

                <label>{t.status} <input name="status" value={scholarshipForm.status} onChange={updateScholarship} /></label>
                <label>{t.status} (Khmer) <input name="status_km" value={scholarshipForm.status_km} onChange={updateScholarship} /></label>

                <label>{t.deadline} <input name="deadline" value={scholarshipForm.deadline} onChange={updateScholarship} /></label>

                <label className="wide">{language === 'en' ? 'Description' : 'ការពិពណ៌នា'} <textarea name="description" value={scholarshipForm.description} onChange={updateScholarship} rows="4"></textarea></label>
                <label className="wide">{language === 'en' ? 'Description (Khmer)' : 'ការពិពណ៌នា (ខ្Khmer)'} <textarea name="description_km" value={scholarshipForm.description_km} onChange={updateScholarship} rows="4"></textarea></label>
                
                <label className="wide">{language === 'en' ? 'Requirements' : 'តម្រូវការ'} <textarea name="requirements" value={scholarshipForm.requirements} onChange={updateScholarship} rows="4"></textarea></label>
                <label className="wide">{language === 'en' ? 'Requirements (Khmer)' : 'តម្រូវការ (ខ្មែរ)'} <textarea name="requirement_km" value={scholarshipForm.requirement_km} onChange={updateScholarship} rows="4"></textarea></label>
                
                <label>{language === 'en' ? 'Contact Email' : 'អ៊ីមែល'} <input name="contactEmail" value={scholarshipForm.contactEmail} onChange={updateScholarship} /></label>
                <label>{language === 'en' ? 'Phone Number' : 'លេខទូរស័ព្ទ'} <input name="phoneNumber" value={scholarshipForm.phoneNumber} onChange={updateScholarship} /></label>
                
                <label className="wide">{language === 'en' ? 'Apply Link' : 'តំណភ្ជាប់ដាក់ពាក្យ'} <input name="applyLink" value={scholarshipForm.applyLink} onChange={updateScholarship} required /></label>
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