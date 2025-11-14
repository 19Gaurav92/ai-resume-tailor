// OpenAI API Integration

async function callOpenAI(resumeText, jobDescription, apiKey) {
    const prompt = `You are an expert resume writer and ATS optimization specialist.

I will provide you with:
1. An existing resume
2. A target job description

Your task is to rewrite the resume to perfectly match the job description while:
- Keeping all the candidate's real experience and skills
- Optimizing for ATS (Applicant Tracking Systems)
- Using keywords from the job description naturally
- Maintaining a professional, clear format
- Highlighting relevant achievements
- Using action verbs and quantifiable results

EXISTING RESUME:
${resumeText}

TARGET JOB DESCRIPTION:
${jobDescription}

Please provide the tailored resume in a clean, ATS-friendly format. Do not use tables or columns. Use simple formatting with clear sections.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {role: 'system', content: 'You are an expert resume writer and ATS optimization specialist.'},
                {role: 'user', content: prompt}
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callOpenAIForCoverLetter(resumeContent, jobDescription, apiKey) {
    const prompt = `Based on this resume and job description, write a professional cover letter:

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Write a compelling cover letter that highlights the candidate's relevant experience and explains why they're a great fit for this role. Keep it professional, concise (300-400 words), and engaging.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {role: 'system', content: 'You are an expert cover letter writer.'},
                {role: 'user', content: prompt}
            ],
            temperature: 0.7,
            max_tokens: 800
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callOpenAIForLinkedIn(resumeContent, jobDescription, apiKey) {
    const prompt = `Based on this resume and target role, write a professional LinkedIn 'About' section:

RESUME:
${resumeContent}

TARGET ROLE:
${jobDescription}

Write a compelling LinkedIn summary (150-200 words) that:
- Highlights key achievements and skills
- Shows personality and passion
- Uses first-person voice
- Includes relevant keywords
- Ends with a call-to-action`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {role: 'system', content: 'You are an expert LinkedIn profile writer.'},
                {role: 'user', content: prompt}
            ],
            temperature: 0.7,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
