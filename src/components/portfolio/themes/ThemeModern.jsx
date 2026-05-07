import React from 'react';
import { BriefcaseIcon, LinkIcon, EnvelopeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const ThemeModern = ({ portfolio, onDownloadResume, onContact }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-12 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white/20 flex items-center justify-center mb-4">
            {portfolio.avatar ? (
              <img src={portfolio.avatar} alt={portfolio.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-bold text-white">
                {(portfolio.displayName?.[0] || portfolio.username?.[0] || 'U').toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">{portfolio.displayName || portfolio.username}</h1>
          {portfolio.title && <p className="text-primary-100 mt-2">{portfolio.title}</p>}
          
          {/* Social Links */}
          <div className="flex gap-4 mt-4">
            {portfolio.github && (
              <a href={portfolio.github} target="_blank" className="text-white hover:text-primary-200 transition">GitHub</a>
            )}
            {portfolio.linkedin && (
              <a href={portfolio.linkedin} target="_blank" className="text-white hover:text-primary-200 transition">LinkedIn</a>
            )}
            {portfolio.twitter && (
              <a href={portfolio.twitter} target="_blank" className="text-white hover:text-primary-200 transition">Twitter</a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {portfolio.bio && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-primary-500 pb-2 mb-3">About Me</h2>
            <p className="text-gray-700 leading-relaxed">{portfolio.bio}</p>
          </div>
        )}

        {/* Projects Grid */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-primary-500 pb-2 mb-4">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolio.projects.map((project, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                  {project.image && (
                    <img src={project.image} alt={project.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                  )}
                  <h3 className="font-semibold text-gray-900 text-lg">{project.title}</h3>
                  <p className="text-gray-600 text-sm mt-2">{project.description}</p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.technologies.split(',').slice(0, 4).map((tech, j) => (
                        <span key={j} className="text-xs bg-gray-100 px-2 py-1 rounded">{tech.trim()}</span>
                      ))}
                    </div>
                  )}
                  {project.link && (
                    <a href={project.link} target="_blank" className="text-primary-600 text-sm mt-3 inline-flex items-center gap-1">
                      View Project <LinkIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact & Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button onClick={onDownloadResume} className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
            <DocumentTextIcon className="h-4 w-4 inline mr-2" />
            Download Resume
          </button>
          <button onClick={onContact} className="flex-1 border border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition">
            <EnvelopeIcon className="h-4 w-4 inline mr-2" />
            Contact Me
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeModern;