import React, { useState, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const emptyJob = {
  companyName: "", companyName_km: "", contactEmail: "", deadline: "",
  description: "", description_km: "", jobType: "", jobtype_km: "",
  location: "", location_km: "", phoneNumber: "", requirements: "", requirement_km: "",
  salary: "", status: "open", status_km: "នៅតែបើក", title: "", title_km: "", viewDetailLink: ""
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

export default function JobOpportunities({ jobs, language, t }) {
  const [jobForm, setJobForm] = useState(emptyJob);
  const [search, setSearch] = useState("");
  
  // List Filters
  const [filterJobType, setFilterJobType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, filterJobType, filterLocation, filterStatus]);

  function updateJob(event) {
    setJobForm({ ...jobForm, [event.target.name]: event.target.value });
  }

  function handleAddNew() {
    setJobForm(emptyJob);
    setEditing(false);
    setIsFormOpen(true);
  }

  function editJob(job) {
    setJobForm(job);
    setEditing(true);
    setIsFormOpen(true);
  }

  function handleClose() {
    setIsFormOpen(false);
  }

  async function saveJob(event) {
    event.preventDefault();
    try {
      if (editing) await setDoc(doc(db, "job_opportunities", jobForm.id), jobForm);
      else await addDoc(collection(db, "job_opportunities"), jobForm);
      
      setIsFormOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
      setJobForm(emptyJob);
      setEditing(false);
    } catch (error) {
      alert("Error saving data");
    }
  }

  async function removeJob(id) {
    if (window.confirm(t.confirmDelete)) {
      await deleteDoc(doc(db, "job_opportunities", id));
    }
  }

  // Extract Dropdown Options dynamically with exact unique checking
  const jobTypes = getUniqueOptions(jobs, "jobType", "jobtype_km");
  const locations = getUniqueOptions(jobs, "location", "location_km");
  const statuses = getUniqueOptions(jobs, "status", "status_km");

  const pageSize = 10;
  const visible = jobs.filter((job) => {
    const matchSearch = !search || `${job.title} ${job.title_km} ${job.companyName}`.toLowerCase().includes(search.toLowerCase());
    
    // Safely match the normalized version stored in filter with current item
    const matchJobType = !filterJobType || (job.jobType && job.jobType.trim().toLowerCase() === filterJobType);
    const matchLocation = !filterLocation || (job.location && job.location.trim().toLowerCase() === filterLocation);
    const matchStatus = !filterStatus || (job.status && job.status.trim().toLowerCase() === filterStatus);
    
    return matchSearch && matchJobType && matchLocation && matchStatus;
  });
  
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const paged = visible.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="records-header-bar">
        <div className="records-heading" style={{ marginBottom: 0 }}>
          <div>
            {/* <span className="kicker">{t.jobsTitle}</span> */}
            <h2>{t.list}</h2>
          </div>
        </div>
        <button className="primary" onClick={handleAddNew}>+ {t.add}</button>
      </div>

      <section className="records">
        
        {/* DROPDOWN FILTERS */}
        <div className="filter-controls">
          <select value={filterJobType} onChange={(e) => setFilterJobType(e.target.value)}>
            <option value="">-- {t.jobType} ({t.all}) --</option>
            {jobTypes.map(opt => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.en : opt.km}</option>)}
          </select>
          
          <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
            <option value="">-- {t.location} ({t.all}) --</option>
            {locations.map(opt => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.en : opt.km}</option>)}
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
                      {language === 'km' ? (item.companyName_km || item.companyName) : item.companyName}
                      {item.jobType && ` | ${t.jobType}: ${language === 'km' ? (item.jobtype_km || item.jobType) : item.jobType}`}
                      {item.location && ` | ${t.location}: ${language === 'km' ? (item.location_km || item.location) : item.location}`}
                    </small>
                  </td>
                  <td>{item.deadline}</td>
                  <td className="actions">
                    <a href={item.viewDetailLink} target="_blank" rel="noreferrer" title="Open Link">↗</a>
                    <button onClick={() => editJob(item)} title="Edit record">✎</button>
                    <button className="danger" onClick={() => removeJob(item.id)} title="Delete record">×</button>
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
              {/* <span className="kicker">{editing ? t.editJob : t.addJob}</span> */}
              <h2>{editing ? t.edit : t.add}</h2>
            </div>
            <button type="button" className="close-btn" onClick={handleClose}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={saveJob}>
              <div className="fields">
                <label>{language === 'en' ? 'Company Name' : 'ឈ្មោះក្រុមហ៊ុន'} <input name="companyName" value={jobForm.companyName} onChange={updateJob} required /></label>
                <label>{language === 'en' ? 'Company Name (Khmer)' : 'ឈ្មោះក្រុមហ៊ុន (ខ្មែរ)'} <input name="companyName_km" value={jobForm.companyName_km} onChange={updateJob} /></label>
                
                <label>{language === 'en' ? 'Title' : 'ចំណងជើង'} <input name="title" value={jobForm.title} onChange={updateJob} required /></label>
                <label>{language === 'en' ? 'Title (Khmer)' : 'ចំណងជើង (ខ្មែរ)'} <input name="title_km" value={jobForm.title_km} onChange={updateJob} /></label>
                
                <label>{t.jobType} <input name="jobType" value={jobForm.jobType} onChange={updateJob} /></label>
                <label>{t.jobType} (Khmer) <input name="jobtype_km" value={jobForm.jobtype_km} onChange={updateJob} /></label>
                
                <label>{t.location} <input name="location" value={jobForm.location} onChange={updateJob} /></label>
                <label>{t.location} (Khmer) <input name="location_km" value={jobForm.location_km} onChange={updateJob} /></label>

                <label>{t.status} <input name="status" value={jobForm.status} onChange={updateJob} /></label>
                <label>{t.status} (Khmer) <input name="status_km" value={jobForm.status_km} onChange={updateJob} /></label>
                
                <label>{language === 'en' ? 'Salary' : 'ប្រាក់ខែ'} <input name="salary" value={jobForm.salary} onChange={updateJob} /></label>
                <label>{t.deadline} <input name="deadline" value={jobForm.deadline} onChange={updateJob} /></label>

                <label className="wide">{language === 'en' ? 'Description' : 'ការពិពណ៌នា'} <textarea name="description" value={jobForm.description} onChange={updateJob} rows="4"></textarea></label>
                <label className="wide">{language === 'en' ? 'Description (Khmer)' : 'ការពិពណ៌នា (ខ្មែរ)'} <textarea name="description_km" value={jobForm.description_km} onChange={updateJob} rows="4"></textarea></label>
                
                <label className="wide">{language === 'en' ? 'Requirements' : 'តម្រូវការ'} <textarea name="requirements" value={jobForm.requirements} onChange={updateJob} rows="4"></textarea></label>
                <label className="wide">{language === 'en' ? 'Requirements (Khmer)' : 'តម្រូវការ (ខ្មែរ)'} <textarea name="requirement_km" value={jobForm.requirement_km} onChange={updateJob} rows="4"></textarea></label>
                
                <label>{language === 'en' ? 'Contact Email' : 'អ៊ីមែល'} <input name="contactEmail" value={jobForm.contactEmail} onChange={updateJob} /></label>
                <label>{language === 'en' ? 'Phone Number' : 'លេខទូរស័ព្ទ'} <input name="phoneNumber" value={jobForm.phoneNumber} onChange={updateJob} /></label>
                
                <label className="wide">{language === 'en' ? 'View Detail Link' : 'តំណភ្ជាប់លម្អិត'} <input name="viewDetailLink" value={jobForm.viewDetailLink} onChange={updateJob} required /></label>
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