// AI Resume Tailor - Main JavaScript
let uploadedFile = null;
let resumeText = '';

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const fileInput = document.getElementById('resumeFile');
    const uploadArea = document.getElementById('uploadArea');
    
    if (fileInput && uploadArea) {
        fileInput.addEventListener('change', handleFileUpload);
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFileUpload({target: fileInput});
            }
        });
    }
    
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey && document.getElementById('apiKey')) {
        document.getElementById('apiKey').value = savedApiKey;
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }
    
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
        alert('Please upload a PDF, DOCX, or TXT file');
        return;
    }
    
    uploadedFile = file;
    document.getElementById('fileInfo').style.display = 'flex';
    document.getElementById('fileName').textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        resumeText = e.target.result;
    };
    reader.readAsText(file);
}

function removeFile() {
    uploadedFile = null;
    resumeText = '';
    document.getElementById('resumeFile').value = '';
    document.getElementById('fileInfo').style.display = 'none';
}

async function generateResume() {
    const jobDescription = document.getElementById('jobDescription').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!uploadedFile && !resumeText) {
        alert('Please upload your resume first');
        return;
    }
    
    if (!jobDescription) {
        alert('Please paste the job description');
        return;
    }
    
    if (!apiKey) {
        alert('Please enter your OpenAI API key');
        return;
    }
    
    localStorage.setItem('openai_api_key', apiKey);
    
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('generateBtn').disabled = true;
    
    try {
        const tailoredResume = await callOpenAI(resumeText, jobDescription, apiKey);
        displayResults(tailoredResume, jobDescription);
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating resume: ' + error.message);
    } finally {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('generateBtn').disabled = false;
    }
}

function displayResults(tailoredResume, jobDescription) {
    const matchData = calculateMatchScore(tailoredResume, jobDescription);
    
    document.getElementById('matchScore').textContent = matchData.score;
    document.getElementById('matchedKeywords').textContent = matchData.matched.join(', ');
    document.getElementById('missingKeywords').textContent = matchData.missing.join(', ') || 'None';
    document.getElementById('recommendations').textContent = matchData.recommendations;
    
    document.getElementById('resumeContent').textContent = tailoredResume;
    
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({behavior: 'smooth'});
}

function calculateMatchScore(resume, jobDesc) {
    const keywords = extractKeywords(jobDesc);
    const resumeLower = resume.toLowerCase();
    
    let matched = [];
    let missing = [];
    
    keywords.forEach(keyword => {
        if (resumeLower.includes(keyword.toLowerCase())) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    });
    
    const score = Math.round((matched.length / keywords.length) * 100);
    
    let recommendations = '';
    if (score >= 80) {
        recommendations = 'Excellent match! Your resume aligns well with the job requirements.';
    } else if (score >= 60) {
        recommendations = 'Good match. Consider adding the missing keywords where relevant.';
    } else {
        recommendations = 'Moderate match. Add more relevant skills and experience from the job description.';
    }
    
    return {score, matched, missing, recommendations};
}

function extractKeywords(text) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const wordFreq = {};
    
    words.forEach(word => {
        if (!commonWords.includes(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });
    
    return Object.keys(wordFreq).sort((a, b) => wordFreq[b] - wordFreq[a]).slice(0, 15);
}

async function generateCoverLetter() {
    const apiKey = localStorage.getItem('openai_api_key');
    const jobDescription = document.getElementById('jobDescription').value;
    const resumeContent = document.getElementById('resumeContent').textContent;
    
    if (!apiKey) {
        alert('Please enter your API key first');
        return;
    }
    
    document.getElementById('generateCoverLetter').disabled = true;
    document.getElementById('generateCoverLetter').textContent = 'Generating...';
    
    try {
        const coverLetter = await callOpenAIForCoverLetter(resumeContent, jobDescription, apiKey);
        document.getElementById('coverLetterContent').textContent = coverLetter;
        document.getElementById('coverLetterContent').style.display = 'block';
        document.getElementById('generateCoverLetter').style.display = 'none';
    } catch (error) {
        alert('Error generating cover letter: ' + error.message);
    } finally {
        document.getElementById('generateCoverLetter').disabled = false;
        document.getElementById('generateCoverLetter').textContent = 'Generate Cover Letter';
    }
}

async function generateLinkedInSummary() {
    const apiKey = localStorage.getItem('openai_api_key');
    const jobDescription = document.getElementById('jobDescription').value;
    const resumeContent = document.getElementById('resumeContent').textContent;
    
    if (!apiKey) {
        alert('Please enter your API key first');
        return;
    }
    
    document.getElementById('generateLinkedIn').disabled = true;
    document.getElementById('generateLinkedIn').textContent = 'Generating...';
    
    try {
        const linkedinSummary = await callOpenAIForLinkedIn(resumeContent, jobDescription, apiKey);
        document.getElementById('linkedinContent').textContent = linkedinSummary;
        document.getElementById('linkedinContent').style.display = 'block';
        document.getElementById('generateLinkedIn').style.display = 'none';
    } catch (error) {
        alert('Error generating LinkedIn summary: ' + error.message);
    } finally {
        document.getElementById('generateLinkedIn').disabled = false;
        document.getElementById('generateLinkedIn').textContent = 'Generate LinkedIn Summary';
    }
}

function downloadPDF() {
    const content = document.getElementById('resumeContent').textContent;
    alert('PDF download: Copy the text and paste it into a Word document, then save as PDF.');
}

function downloadDOCX() {
    const content = document.getElementById('resumeContent').textContent;
    alert('DOCX download: Copy the text and paste it into a Word document.');
}

function copyToClipboard() {
    const content = document.getElementById('resumeContent').textContent;
    navigator.clipboard.writeText(content).then(() => {
        alert('Resume copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}
