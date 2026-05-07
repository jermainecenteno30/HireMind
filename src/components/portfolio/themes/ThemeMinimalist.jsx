import React from 'react';
import { LinkIcon, EnvelopeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const ThemeMinimalist = ({ portfolio, onDownloadResume, onContact }) => {
  return (
    <div className="max-w-3xl mx-auto py-12">
      {/* Clean, Minimal Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-gray-900 tracking-tight">
          {portfolio.displayName || portfolio.username}
        </h1>
        {portfolio.title && <p className="text-gray-500 mt-2 text-lg">{portfolio.title}</p>}
        
        <div className="flex justify-center gap-4 mt-4">
          {portfolio.github && <a href={portfolio.github} target="_blank" className="text-gray-400 hover:text-gray-600 text-sm">GitHub</a>}
          {portfolio.linkedin && <a href={portfolio.linkedin} target="_blank" className="text-gray-400 hover:text-gray-600 text-sm">LinkedIn</a>}
          {portfolio.twitter && <a href={portfolio.twitter} target="_blank" className="text-gray-400 hover:text-gray-600 text-sm">Twitter</a>}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {portfolio.bio && (
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{portfolio.bio}</p>
          </section>
        )}

        {portfolio.projects && portfolio.projects.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Projects</h2>
            <div className="space-y-6">
              {portfolio.projects.map((project, i) => (
                <div key={i} className="border-l-2 border-gray-200 pl-4">
                  <h3 className="font-medium text-gray-900">{project.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{project.description}</p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.technologies.split(',').slice(0, 3).map((tech, j) => (
                        <span key={j} className="text-xs text-gray-400">{tech.trim()}</span>
                      ))}
                    </div>
                  )}
                  {project.link && (
                    <a href={project.link} target="_blank" className="text-primary-600 text-sm mt-2 inline-block">
                      View → <LinkIcon className="w-3 h-3 inline" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex gap-3 pt-4">
          <button onClick={onDownloadResume} className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm">
            <DocumentTextIcon className="h-4 w-4 inline mr-2" />
            Resume
          </button>
          <button onClick={onContact} className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
            <EnvelopeIcon className="h-4 w-4 inline mr-2" />
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeMinimalist;