import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon, 
  LinkIcon,
  UserIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPortfolio();
  }, [username]);

  useEffect(() => {
    if (portfolio) {
      document.title = `${portfolio.displayName || portfolio.username}'s Portfolio | HirePath`;
      
      // Update meta tags for SEO
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', portfolio.bio?.substring(0, 150) || 'View professional portfolio');
      
      // OpenGraph tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', `${portfolio.displayName || portfolio.username}'s Portfolio`);
      
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', portfolio.bio?.substring(0, 150) || 'Professional portfolio');
    }
  }, [portfolio]);

  const loadPortfolio = async () => {
    setLoading(true);
    const result = await portfolioService.getPortfolioByUsername(username);
    if (result.success) {
      setPortfolio(result.data);
    } else {
      setError('Portfolio not found');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GlobeAltIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Found</h1>
          <p className="text-gray-600">The portfolio you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Cover Image */}
            {portfolio.coverImage && (
              <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600">
                <img src={portfolio.coverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            
            {/* Profile Section */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col items-center text-center -mt-12">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                  {portfolio.avatar ? (
                    <img src={portfolio.avatar} alt={portfolio.displayName} className="w-full h-full object-cover" />
                  ) : (
                    (portfolio.displayName?.[0] || portfolio.username?.[0] || 'U').toUpperCase()
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mt-4">{portfolio.displayName || portfolio.username}</h1>
                {portfolio.title && (
                  <p className="text-gray-600 mt-1">{portfolio.title}</p>
                )}
                
                {/* Social Links */}
                <div className="flex gap-4 mt-4">
                  {portfolio.github && (
                    <a 
                      href={portfolio.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 text-sm"
                    >
                      GitHub <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    </a>
                  )}
                  {portfolio.linkedin && (
                    <a 
                      href={portfolio.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1 text-sm"
                    >
                      LinkedIn <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    </a>
                  )}
                  {portfolio.twitter && (
                    <a 
                      href={portfolio.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-600 hover:text-sky-500 transition-colors flex items-center gap-1 text-sm"
                    >
                      Twitter <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio Section */}
          {portfolio.bio && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About Me</h2>
              <p className="text-gray-600 leading-relaxed">{portfolio.bio}</p>
            </motion.div>
          )}

          {/* Projects Section */}
          {portfolio.projects && portfolio.projects.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolio.projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {project.image && (
                      <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.technologies.split(',').slice(0, 4).map((tech, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {project.link && (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Project <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!portfolio.bio && portfolio.projects.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-white rounded-xl shadow-md p-12 text-center"
            >
              <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Content Yet</h2>
              <p className="text-gray-500">This portfolio is still being built.</p>
            </motion.div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Portfolio created with HirePath</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicPortfolio;