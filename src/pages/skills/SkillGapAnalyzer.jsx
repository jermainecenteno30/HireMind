import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AcademicCapIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  BookOpenIcon,
  ArrowPathIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

const SkillGapAnalyzer = () => {
  const [targetRole, setTargetRole] = useState('');
  const [userSkills, setUserSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Skill database (in production, this would come from an API)
  const roleRequirements = {
    'frontend developer': {
      required: ['JavaScript', 'React', 'HTML', 'CSS', 'Git', 'Responsive Design'],
      preferred: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Testing'],
      resources: {
        'React': 'https://react.dev/learn',
        'JavaScript': 'https://javascript.info/',
        'Git': 'https://git-scm.com/doc'
      }
    },
    'backend developer': {
      required: ['Python', 'Node.js', 'SQL', 'Git', 'REST APIs', 'Databases'],
      preferred: ['Docker', 'AWS', 'MongoDB', 'Redis'],
      resources: {
        'Python': 'https://www.python.org/about/gettingstarted/',
        'Node.js': 'https://nodejs.org/en/learn',
        'SQL': 'https://www.w3schools.com/sql/'
      }
    },
    'full stack developer': {
      required: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'HTML/CSS'],
      preferred: ['TypeScript', 'MongoDB', 'AWS', 'Docker'],
      resources: {
        'React': 'https://react.dev/learn',
        'Node.js': 'https://nodejs.org/en/learn',
        'MongoDB': 'https://www.mongodb.com/docs/'
      }
    },
    'data scientist': {
      required: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Pandas'],
      preferred: ['TensorFlow', 'PyTorch', 'Tableau', 'AWS'],
      resources: {
        'Python': 'https://www.python.org/about/gettingstarted/',
        'Machine Learning': 'https://developers.google.com/machine-learning/crash-course',
        'Pandas': 'https://pandas.pydata.org/docs/'
      }
    }
  };

  const addSkill = () => {
    if (newSkill && !userSkills.includes(newSkill)) {
      setUserSkills([...userSkills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setUserSkills(userSkills.filter(s => s !== skill));
  };

  const analyzeGap = () => {
    if (!targetRole) {
      alert('Please enter a target role');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const roleKey = targetRole.toLowerCase();
      const requirements = roleRequirements[roleKey] || {
        required: ['JavaScript', 'React', 'Node.js', 'Git'],
        preferred: ['TypeScript', 'AWS', 'Docker'],
        resources: {}
      };

      const missingRequired = requirements.required.filter(
        skill => !userSkills.some(us => us.toLowerCase() === skill.toLowerCase())
      );
      
      const missingPreferred = requirements.preferred.filter(
        skill => !userSkills.some(us => us.toLowerCase() === skill.toLowerCase())
      );

      const matchedSkills = requirements.required.filter(
        skill => userSkills.some(us => us.toLowerCase() === skill.toLowerCase())
      );

      const progress = (matchedSkills.length / requirements.required.length) * 100;

      setAnalysis({
        targetRole: targetRole,
        matchedSkills: matchedSkills,
        missingRequired: missingRequired,
        missingPreferred: missingPreferred,
        progress: progress,
        totalRequired: requirements.required.length,
        resources: requirements.resources
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Skill Gap Analyzer</h1>
        <p className="text-gray-600 mt-2">
          Discover what skills you need for your dream job
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Target Role</h3>
              <p className="text-sm text-gray-600 mt-1">What job are you aiming for?</p>
            </CardHeader>
            <CardBody>
              <Input
                placeholder="e.g., Frontend Developer, Data Scientist"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Popular:</span>
                {Object.keys(roleRequirements).map(role => (
                  <button
                    key={role}
                    onClick={() => setTargetRole(role)}
                    className="text-xs px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Your Skills</h3>
              <p className="text-sm text-gray-600 mt-1">Add all the skills you currently have</p>
            </CardHeader>
            <CardBody>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill (e.g., Python, React)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button onClick={addSkill} size="sm">Add</Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {userSkills.map(skill => (
                  <Badge key={skill} variant="info">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {userSkills.length === 0 && (
                  <p className="text-sm text-gray-500">No skills added yet</p>
                )}
              </div>
            </CardBody>
          </Card>

          <Button onClick={analyzeGap} isLoading={loading} className="w-full">
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Analyze Skill Gap
          </Button>
        </div>

        {/* Right Column - Results */}
        <div>
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Gap Analysis Results</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      For {analysis.targetRole} position
                    </p>
                  </CardHeader>
                  <CardBody>
                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Match Score</span>
                        <span className="text-sm font-medium text-primary-600">
                          {analysis.progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 rounded-full h-2 transition-all duration-500"
                          style={{ width: `${analysis.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {analysis.matchedSkills.length} of {analysis.totalRequired} required skills
                      </p>
                    </div>

                    {/* Matched Skills */}
                    {analysis.matchedSkills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-green-900 mb-2 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
                          Skills You Have
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.matchedSkills.map(skill => (
                            <Badge key={skill} variant="success">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Required Skills */}
                    {analysis.missingRequired.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-red-900 mb-2 flex items-center">
                          <XCircleIcon className="h-4 w-4 mr-2 text-red-600" />
                          Missing Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingRequired.map(skill => (
                            <Badge key={skill} variant="danger">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Preferred Skills */}
                    {analysis.missingPreferred.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-yellow-900 mb-2">Nice to Have (Missing)</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingPreferred.map(skill => (
                            <Badge key={skill} variant="warning">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Learning Path */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <BookOpenIcon className="h-5 w-5 mr-2 text-primary-600" />
                      Recommended Learning Path
                    </h3>
                  </CardHeader>
                  <CardBody>
                    {analysis.missingRequired.length > 0 ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700">
                          To become a {analysis.targetRole}, focus on learning these skills first:
                        </p>
                        <div className="space-y-3">
                          {analysis.missingRequired.slice(0, 3).map((skill, index) => (
                            <div key={skill} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{skill}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Priority: {index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low'}
                                  </p>
                                </div>
                                {analysis.resources[skill] && (
                                  <a 
                                    href={analysis.resources[skill]} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                                  >
                                    Learn More
                                    <LinkIcon className="h-3 w-3 ml-1" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-900">
                            💡 Pro Tip: Create a learning schedule. Spend 30 minutes daily on these skills.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-gray-900 font-medium">Great job!</p>
                        <p className="text-sm text-gray-600">
                          You have all the required skills for {analysis.targetRole}
                        </p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!analysis && !loading && (
            <Card>
              <CardBody className="text-center py-12">
                <AcademicCapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Enter your target role and skills to see the gap analysis
                </p>
              </CardBody>
            </Card>
          )}

          {loading && (
            <Card>
              <CardBody className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing skill gap...</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;