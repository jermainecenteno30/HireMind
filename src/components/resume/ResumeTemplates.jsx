import React from 'react';

// Helper function to check if content is structured JSON
const isStructuredData = (content) => {
  if (!content || typeof content !== 'string') return false;
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' && (parsed.firstName || parsed.skills || parsed.workExperience);
  } catch {
    return false;
  }
};

// Helper function to parse structured JSON data
const parseStructuredData = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};

// Template 1: Modern Professional
export const ModernTemplate = ({ resume }) => {
  if (!resume || !resume.content) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Resume content not available</p>
      </div>
    );
  }

  // Check if content is structured JSON
  const isStructured = isStructuredData(resume.content);
  let structuredData = null;
  let markdownContent = resume.content;

  if (isStructured) {
    structuredData = parseStructuredData(resume.content);
    markdownContent = '';
  }

  // If we have structured data, render using that
  if (structuredData && structuredData.firstName) {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold">
            {structuredData.firstName} {structuredData.middleName ? structuredData.middleName + ' ' : ''}{structuredData.lastName}
          </h1>
          {structuredData.title && <p className="text-primary-100 mt-1">{structuredData.title}</p>}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-primary-200">
            {structuredData.phone && <span>📞 {structuredData.phone}</span>}
            {structuredData.email && <span>✉️ {structuredData.email}</span>}
            {structuredData.address && <span>📍 {structuredData.address}</span>}
          </div>
        </div>
        
        <div className="p-6">
          {/* Profile Summary */}
          {structuredData.profileSummary && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-primary-500 pb-2 mb-3">
                Professional Summary
              </h2>
              <p className="text-gray-700">{structuredData.profileSummary}</p>
            </div>
          )}

          {/* Work Experience */}
          {structuredData.workExperience && structuredData.workExperience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-primary-500 pb-2 mb-3">
                Work Experience
              </h2>
              {structuredData.workExperience.map((exp, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-start flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-primary-600">{exp.company}</p>
                    </div>
                    {exp.duration && <span className="text-sm text-gray-500">{exp.duration}</span>}
                  </div>
                  {exp.description && <p className="text-gray-600 text-sm mt-1">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {structuredData.projects && structuredData.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-primary-500 pb-2 mb-3">
                Projects
              </h2>
              {structuredData.projects.map((project, idx) => (
                <div key={idx} className="mb-3">
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  <p className="text-gray-600 text-sm">{project.description}</p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.technologies.split(',').map((tech, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{tech.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {structuredData.skills && structuredData.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-primary-500 pb-2 mb-3">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {structuredData.skills.map((skill, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {structuredData.education && structuredData.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-primary-500 pb-2 mb-3">
                Education
              </h2>
              {structuredData.education.map((edu, idx) => (
                <div key={idx} className="mb-2">
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-600">{edu.institution}</p>
                  {edu.year && <p className="text-sm text-gray-500">{edu.year}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {structuredData.certifications && structuredData.certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-primary-500 pb-2 mb-3">
                Certifications
              </h2>
              {structuredData.certifications.map((cert, idx) => (
                <div key={idx} className="mb-1">
                  <p className="text-gray-700">{cert.name}{cert.issuer && ` - ${cert.issuer}`}{cert.date && ` (${cert.date})`}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Generated by HireMind • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  // Otherwise, render markdown content (original behavior)
  const parseContent = (content) => {
    const sections = [];
    let currentSection = { title: 'Summary', content: [] };
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('# ')) {
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = { title: line.substring(2), content: [] };
      } else if (line.trim()) {
        currentSection.content.push(line);
      }
    }
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    return sections;
  };
  
  const sections = parseContent(markdownContent);
  
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-6 text-white">
        <h1 className="text-3xl font-bold">{resume.title || 'Professional Resume'}</h1>
        <p className="text-primary-100 mt-1">Version {resume.version || 1}</p>
      </div>
      
      <div className="p-8 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-primary-500 pb-2 mb-3">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.content.map((line, lineIdx) => {
                if (line.startsWith('- ')) {
                  return <li key={lineIdx} className="text-gray-700 ml-4">{line.substring(2)}</li>;
                }
                if (line.includes('**')) {
                  const boldMatch = line.match(/\*\*(.*?)\*\*/);
                  if (boldMatch) {
                    const parts = line.split(/\*\*.*?\*\*/);
                    return <p key={lineIdx} className="text-gray-700">{parts[0]}<strong>{boldMatch[1]}</strong>{parts[1] || ''}</p>;
                  }
                }
                return <p key={lineIdx} className="text-gray-700">{line}</p>;
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Generated by HireMind • {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

// Template 2: Minimal Clean
export const MinimalTemplate = ({ resume }) => {
  if (!resume || !resume.content) {
    return <div className="text-center py-8 text-gray-500">Resume content not available</div>;
  }

  const isStructured = isStructuredData(resume.content);
  const structuredData = isStructured ? parseStructuredData(resume.content) : null;
  
  if (structuredData && structuredData.firstName) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="border-b-2 border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-light text-gray-800">
            {structuredData.firstName} {structuredData.lastName}
          </h1>
          {structuredData.title && <p className="text-gray-500 mt-1">{structuredData.title}</p>}
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            {structuredData.phone && <span>{structuredData.phone}</span>}
            {structuredData.email && <span>{structuredData.email}</span>}
          </div>
        </div>
        
        {structuredData.profileSummary && <p className="text-gray-600 mb-6">{structuredData.profileSummary}</p>}
        
        {structuredData.workExperience && structuredData.workExperience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Experience</h2>
            {structuredData.workExperience.map((exp, idx) => (
              <div key={idx} className="mb-3">
                <h3 className="font-medium text-gray-900">{exp.position} at {exp.company}</h3>
                {exp.duration && <p className="text-xs text-gray-400">{exp.duration}</p>}
                <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        )}
        
        {structuredData.skills && structuredData.skills.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {structuredData.skills.map((skill, idx) => (
                <span key={idx} className="text-xs text-gray-500">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback to markdown rendering
  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <div className="border-b-2 border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-light text-gray-800">{resume.title || 'Resume'}</h1>
        <p className="text-sm text-gray-500 mt-1">Version {resume.version || 1}</p>
      </div>
      <div className="prose prose-gray max-w-none">
        <div className="whitespace-pre-wrap font-sans text-gray-700">
          {resume.content.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-semibold mt-4 mb-2">{line.substring(2)}</h2>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.substring(2)}</li>;
            if (line.trim() === '') return <div key={i} className="h-2"></div>;
            return <p key={i} className="mb-1">{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
};

// Template 3: Corporate Professional
export const CorporateTemplate = ({ resume }) => {
  if (!resume || !resume.content) {
    return <div className="text-center py-8 text-gray-500">Resume content not available</div>;
  }

  const isStructured = isStructuredData(resume.content);
  const structuredData = isStructured ? parseStructuredData(resume.content) : null;
  
  if (structuredData && structuredData.firstName) {
    return (
      <div className="bg-gray-50 shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-900 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold">{structuredData.firstName} {structuredData.lastName}</h1>
          {structuredData.title && <p className="text-gray-400 mt-1">{structuredData.title}</p>}
        </div>
        <div className="p-8">
          {structuredData.profileSummary && <p className="text-gray-600 mb-6">{structuredData.profileSummary}</p>}
          {structuredData.workExperience && structuredData.workExperience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="font-semibold text-gray-900">{exp.position}</h3>
              <p className="text-primary-600">{exp.company}</p>
              {exp.duration && <p className="text-sm text-gray-500">{exp.duration}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback to markdown rendering
  return (
    <div className="bg-gray-50 shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gray-900 px-8 py-6 text-white">
        <h1 className="text-3xl font-bold">{resume.title || 'Professional Resume'}</h1>
        <p className="text-gray-400 mt-1">Version {resume.version || 1}</p>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 gap-6">
          {resume.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('# ')) {
              return <h2 key={idx} className="text-lg font-semibold border-l-4 border-primary-600 pl-3 mb-2">{paragraph.substring(2)}</h2>;
            }
            return <p key={idx} className="text-gray-600">{paragraph}</p>;
          })}
        </div>
      </div>
    </div>
  );
};

// Template Selector Component
export const TemplateSelector = ({ selectedTemplate, onSelect }) => {
  const templates = [
    { id: 'modern', name: 'Modern Professional', icon: '🎨', description: 'Colorful header, clean layout' },
    { id: 'minimal', name: 'Minimal Clean', icon: '✨', description: 'Simple, elegant, focus on content' },
    { id: 'corporate', name: 'Corporate Classic', icon: '💼', description: 'Traditional, professional look' }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            selectedTemplate === template.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl mb-2">{template.icon}</div>
          <h4 className="font-semibold text-gray-900">{template.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{template.description}</p>
        </button>
      ))}
    </div>
  );
};