import React, { useState } from 'react';
import './ResumeScreener.css'; // We'll create this CSS file

const App = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Handle resume file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name);
    }
  };

  // Handle job description input
  const handleJobDescriptionChange = (e) => {
    setJobDescriptionText(e.target.value);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setResumeFile(file);
        setFileName(file.name);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jobDescriptionText.trim()) return;
    
    setLoading(true);
    setError(null);
    setScore(null);

    // Create FormData to send the resume file and JD
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescriptionText);

    try {
      // Send POST request to backend API
      const response = await fetch('https://resumeaudit-backend.onrender.com/api/resumes/process', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { score } = await response.json();
        setScore(score);
      } else {
        throw new Error('Failed to process the resume');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>AI-Based Resume Screening Tool</h1>
        <p>Upload your resume and job description to get an AI-powered match score</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="resume">Upload Resume (PDF or DOCX)</label>
            <div 
              className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <p>
                <label htmlFor="resume" className="file-label">
                  Upload a file
                </label> 
                or drag and drop
              </p>
              <input
                id="resume"
                name="resume"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                required
              />
              <p className="file-types">PDF or DOCX up to 10MB</p>
              {fileName && (
                <p className="selected-file">
                  Selected: {fileName}
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="jobDescription">Job Description</label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              rows="6"
              placeholder="Paste the job description here..."
              value={jobDescriptionText}
              onChange={handleJobDescriptionChange}
              required
            />
          </div>

          <div className="form-group">
            <button
              type="submit"
              disabled={loading}
              className={loading ? 'btn-loading' : 'btn-primary'}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                'Analyze Resume Match'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <div className="error-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {score !== null && (
          <div className="results-card">
            <h3>Resume Match Analysis</h3>
            <div className="score-container">
              <div className="score-header">
                <span className="score-label">Match Score</span>
                <span className="score-value">{score}%</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${score >= 70 ? 'high-score' : score >= 40 ? 'medium-score' : 'low-score'}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
            <p className="score-description">
              {score >= 70 
                ? "Strong match! This candidate's resume aligns well with the job requirements."
                : score >= 40 
                ? "Moderate match. The candidate meets some of the job requirements."
                : "Low match. This candidate's profile may not align with the job requirements."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;