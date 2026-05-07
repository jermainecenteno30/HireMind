import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService';
import { portfolioAnalyticsService } from '../../services/portfolioAnalyticsService';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon, 
  LinkIcon,
  UserIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

// Theme Imports
import ThemeModern from '../../components/portfolio/themes/ThemeModern';
import ThemeMinimalist from '../../components/portfolio/themes/ThemeMinimalist';
import ThemeDark from '../../components/portfolio/themes/ThemeDark';

// Contact Modal Component (inline for simplicity)
const ContactModal = ({ isOpen, onClose, portfolioOwner, portfolioId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setSending(true);
    // Track contact click
    if (portfolioId) {
      await portfolioAnalyticsService.trackClick(portfolioId, 'contact');
    }
    
    // In production, send to Firebase and email
    setTimeout(() => {
      toast.success('Message sent! The portfolio owner will contact you soon.');
      setFormData({ name: '', email: '', message: '' });
      onClose();
      setSending(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Contact {portfolioOwner}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Hi, I'm interested in your work..."
              required
            />
          </div>
          
          <Button type="submit" isLoading={sending} className="w-full">
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

const PublicPortfolio = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, [username]);

  // Load saved theme preference
  useEffect(() => {
    if (portfolio?.id) {
      const savedTheme = localStorage.getItem(`portfolio_theme_${portfolio.id}`);
      if (savedTheme) setSelectedTheme(savedTheme);
    }
  }, [portfolio]);

  // Track view and setup click tracking
  useEffect(() => {
    if (portfolio?.id) {
      // Track portfolio view
      portfolioAnalyticsService.trackView(portfolio.id, username);
      
      // Setup click tracking for links
      const trackClick = (type, id = null) => {
        portfolioAnalyticsService.trackClick(portfolio.id, type, id);
      };
      
      // Add event listeners to track clicks
      const githubLink = document.querySelector('a[href*="github.com"]');
      const linkedinLink = document.querySelector('a[href*="linkedin.com"]');
      const twitterLink = document.querySelector('a[href*="twitter.com"]');
      const projectLinks = document.querySelectorAll('.project-link');
      const resumeBtn = document.querySelector('#download-resume-btn');
      const contactBtn = document.querySelector('#contact-btn');
      
      if (githubLink) githubLink.addEventListener('click', () => trackClick('github'));
      if (linkedinLink) linkedinLink.addEventListener('click', () => trackClick('linkedin'));
      if (twitterLink) twitterLink.addEventListener('click', () => trackClick('twitter'));
      if (resumeBtn) resumeBtn.addEventListener('click', () => trackClick('resume'));
      if (contactBtn) contactBtn.addEventListener('click', () => trackClick('contact'));
      
      projectLinks.forEach(link => {
        link.addEventListener('click', () => trackClick('project', link.dataset.projectId));
      });
      
      return () => {
        if (githubLink) githubLink.removeEventListener('click', () => trackClick('github'));
        if (linkedinLink) linkedinLink.removeEventListener('click', () => trackClick('linkedin'));
        if (twitterLink) twitterLink.removeEventListener('click', () => trackClick('twitter'));
        if (resumeBtn) resumeBtn.removeEventListener('click', () => trackClick('resume'));
        if (contactBtn) contactBtn.removeEventListener('click', () => trackClick('contact'));
        projectLinks.forEach(link => {
          link.removeEventListener('click', () => trackClick('project', link.dataset.projectId));
        });
      };
    }
  }, [portfolio, username]);

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

  const handleDownloadResume = () => {
    if (portfolio?.id) {
      portfolioAnalyticsService.trackClick(portfolio.id, 'resume');
      
      // In production, generate and download PDF
      // For now, show toast
      toast.success('Resume download started');
      
      // You can implement actual PDF generation here
      // window.open(`/api/resume/download/${portfolio.id}`, '_blank');
    }
  };

  const handleContact = () => {
    setShowContactModal(true);
  };

  // Get theme component based on selection
  const getThemeComponent = () => {
    switch(selectedTheme) {
      case 'minimalist':
        return ThemeMinimalist;
      case 'dark':
        return ThemeDark;
      default:
        return ThemeModern;
    }
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

  // Update theme when selected (for theme selector in builder)
  const ThemeComponent = getThemeComponent();

  // If user has selected a theme in the builder
  if (selectedTheme !== 'modern') {
    return (
      <>
        {/* SEO Meta Tags */}
        <title>{portfolio.displayName || portfolio.username}'s Portfolio | HireMind</title>
        <meta name="description" content={portfolio.bio?.substring(0, 150) || 'View professional portfolio'} />
        <meta property="og:title" content={`${portfolio.displayName || portfolio.username}'s Portfolio`} />
        <meta property="og:description" content={portfolio.bio?.substring(0, 150)} />
        
        <ThemeComponent 
          portfolio={portfolio}
          onDownloadResume={handleDownloadResume}
          onContact={handleContact}
        />
        
        <ContactModal 
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          portfolioOwner={portfolio.displayName || portfolio.username}
          portfolioId={portfolio.id}
        />
      </>
    );
  }

  // Default modern theme with additional features
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
                          className="project-link inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                          data-project-id={project.id}
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

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              id="download-resume-btn"
              onClick={handleDownloadResume}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
            >
              <DocumentTextIcon className="h-4 w-4" />
              Download Resume
            </button>
            <button
              id="contact-btn"
              onClick={handleContact}
              className="flex-1 border border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition flex items-center justify-center gap-2"
            >
              <EnvelopeIcon className="h-4 w-4" />
              Contact Me
            </button>
          </div>

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
            <p>Portfolio created with HireMind</p>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        portfolioOwner={portfolio.displayName || portfolio.username}
        portfolioId={portfolio.id}
      />
    </>
  );
};

export default PublicPortfolio;