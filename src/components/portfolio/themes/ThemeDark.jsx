import React from 'react';
import { LinkIcon, EnvelopeIcon, DocumentTextIcon } from 'lucide-react';

const ThemeDark = ({ portfolio, onDownloadResume, onContact }) => {
  return (
    <div className="bg-gray-900 text-white rounded-2xl overflow-hidden">
      {/* Hero */}
      <div className="relative px-8 py-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20"></div>
        <div className="relative">
          <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-gray-700 mb-4">
            {portfolio.avatar ? (
              <img src={portfolio.avatar} alt={portfolio.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                {(portfolio.displayName?.[0] || portfolio.username?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold">{portfolio.displayName || portfolio.username}</h1>
          {portfolio.title && <p className="text-gray-400 mt-2">{portfolio.title}</p>}
          
          <div className="flex justify-center gap-4 mt-4">
            {portfolio.github && (
              <a 
                href={portfolio.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition"
              >
                GitHub
              </a>
            )}
            {portfolio.linkedin && (
              <a 
                href={portfolio.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition"
              >
                LinkedIn
              </a>
            )}
            {portfolio.twitter && (
              <a 
                href={portfolio.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition"
              >
                Twitter
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-12">
        {portfolio.bio && (
          <div className="mb-8">
            <p className="text-gray-300 leading-relaxed">{portfolio.bio}</p>
          </div>
        )}

        {portfolio.projects && portfolio.projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.projects.map((project, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition">
                  {project.image && (
                    <img src={project.image} alt={project.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                  )}
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.technologies.split(',').slice(0, 3).map((tech, j) => (
                        <span key={j} className="text-xs text-gray-500">{tech.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={onDownloadResume} 
            className="flex-1 bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            <DocumentTextIcon className="h-4 w-4 inline mr-2" />
            Resume
          </button>
          <button 
            onClick={onContact} 
            className="flex-1 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <EnvelopeIcon className="h-4 w-4 inline mr-2" />
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeDark;