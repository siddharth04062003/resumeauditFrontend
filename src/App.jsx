import React, { useState } from 'react';
import './ResumeScreener.css'; // Ensure you have this CSS file

const App = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Handle file upload
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
    setDragActive(e.type === "dragenter" || e.type === "dragover");
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
    setResult(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescriptionText);

    try {
      const response = await fetch('https://resumeaudit-backend-wkep.vercel.app/api/resumes/process', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
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
        <h1>AI-Based Resume Analyzing Tool</h1>
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
                📄
              </div>
              <p>
                <label htmlFor="resume" className="file-label">Upload a file</label> 
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
              <p className="file-types">PDF or DOCX up to 1MB</p>
              {fileName && <p className="selected-file">Selected: {fileName}</p>}
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
            <button type="submit" disabled={loading} className={loading ? 'btn-loading' : 'btn-primary'}>
              {loading ? <>⏳ Processing...</> : 'Analyze Resume Match'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            ❌ Error: {error}
          </div>
        )}

        {result && (
          <div className="results-card">
            <h3>Resume Match Analysis</h3>
            <div className="score-container">
              <div className="score-header">
                <span className="score-label">Match Score</span>
                <span className="score-value">{result.score}%</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${result.score >= 70 ? 'high-score' : result.score >= 40 ? 'medium-score' : 'low-score'}`}
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>
            </div>
            <p className="score-description">
              {result.score >= 90 
                ? "✅ Strong match! Your resume aligns well with the job description."
                : result.score >= 70 
                ? "⚡ Good match, but could be improved."
                : "🔴 Low match. Consider tailoring your resume."}
            </p>

            {/* Show missing keywords if score is below 90 */}
            {result.score < 90 && result.suggestions.length > 0 && (
              <div className="suggestions">
                <h4>Suggested Keywords to Improve Your Score</h4>
                <ul>
                  {result.suggestions.map((word, index) => (
                    <li key={index}>✅ {word}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
