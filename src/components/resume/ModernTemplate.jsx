import React from 'react';

const ModernTemplate = ({ data }) => {
  if (!data || (!data.firstName && !data.lastName && !data.email)) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-6xl mb-4">📄</div>
        <p>Your resume preview will appear here</p>
        <p className="text-sm mt-2">Start filling out your information →</p>
      </div>
    );
  }

  return (
    <div className="font-sans max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-8 py-8 text-white">
        <h1 className="text-4xl font-bold tracking-tight">
          {data.firstName} {data.middleName ? data.middleName + ' ' : ''}{data.lastName}
        </h1>
        {data.title && (
          <p className="text-primary-200 text-lg mt-2">{data.title}</p>
        )}
        
        {/* Contact Information - Only show if exists */}
        {(data.phone || data.email || data.address) && (
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-primary-200">
            {data.phone && <span>📞 {data.phone}</span>}
            {data.email && <span>✉️ {data.email}</span>}
            {data.address && <span>📍 {data.address}</span>}
            {data.linkedin && <span>🔗 LinkedIn</span>}
          </div>
        )}
      </div>

      <div className="p-8">
        {/* Profile Summary */}
        {data.profileSummary && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-primary-500 pb-2 mb-3">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.profileSummary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Skills */}
          <div className="md:col-span-1 space-y-6">
            {data.skills && data.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-primary-500 pl-3 mb-3">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Work Experience */}
            {data.workExperience && data.workExperience.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                  Work Experience
                </h3>
                {data.workExperience.map((exp, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                        <p className="text-primary-600 font-medium">{exp.company}</p>
                      </div>
                      {exp.duration && (
                        <span className="text-sm text-gray-500">{exp.duration}</span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                  Projects
                </h3>
                {data.projects.map((project, i) => (
                  <div key={i} className="mb-4">
                    <h4 className="font-semibold text-gray-900">{project.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.split(',').slice(0, 3).map((tech, j) => (
                          <span key={j} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                  Education
                </h3>
                {data.education.map((edu, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                        <p className="text-gray-600">{edu.institution}</p>
                      </div>
                      {edu.year && <span className="text-sm text-gray-500">{edu.year}</span>}
                    </div>
                    {edu.description && (
                      <p className="text-sm text-gray-600 mt-1">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                  Certifications
                </h3>
                {data.certifications.map((cert, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-gray-800">
                      {cert.name}
                      {cert.issuer && <span className="text-gray-500 text-sm"> - {cert.issuer}</span>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;