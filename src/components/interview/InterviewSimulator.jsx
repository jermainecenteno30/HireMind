import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { 
  MicrophoneIcon, 
  ChatBubbleLeftRightIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const InterviewSimulator = ({ jobRole, companyName }) => {
  const { isPremium } = useAuth();
  const { generateInterviewQuestion, evaluateAnswer, isProcessing } = useAI();
  const [sessionActive, setSessionActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [sessionType, setSessionType] = useState('technical');

  const sessionTypes = [
    { id: 'technical', name: 'Technical Interview', icon: '💻', desc: 'Role-specific technical questions' },
    { id: 'behavioral', name: 'Behavioral Interview', icon: '🧠', desc: 'STAR method questions' },
    { id: 'hr', name: 'HR Interview', icon: '🤝', desc: 'Culture fit & soft skills' },
    { id: 'mixed', name: 'Mixed Practice', icon: '🎲', desc: 'Random questions from all types' }
  ];

  const startSession = async () => {
    if (!isPremium) {
      toast.error('Premium feature. Upgrade to access Interview Simulator!');
      return;
    }

    setSessionActive(true);
    setQuestionHistory([]);
    setFeedback(null);
    await getNextQuestion();
  };

  const getNextQuestion = async () => {
    const result = await generateInterviewQuestion(jobRole, sessionType, questionHistory);
    if (result) {
      setCurrentQuestion(result);
      setUserAnswer('');
      setFeedback(null);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please write your answer first');
      return;
    }

    const result = await evaluateAnswer(currentQuestion, userAnswer, jobRole);
    if (result) {
      setFeedback(result);
      setQuestionHistory([...questionHistory, { question: currentQuestion, answer: userAnswer, feedback: result }]);
    }
  };

  const nextQuestion = () => {
    getNextQuestion();
  };

  const endSession = () => {
    setSessionActive(false);
    setCurrentQuestion(null);
    setFeedback(null);
    toast.success(`Session complete! You answered ${questionHistory.length} questions.`);
  };

  if (!isPremium) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Interview Simulator</h3>
          <p className="text-gray-600 mb-4">
            Practice interviews with AI. Get real-time feedback on your answers!
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg inline-block">
            <p className="text-sm font-semibold text-primary-900">Premium Feature</p>
            <p className="text-xs text-primary-700">Upgrade to Pro - ₱99/month</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!sessionActive) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600 mr-2" />
            AI Interview Simulator
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Practice interviews with AI and get instant feedback
          </p>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {/* Session Type Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sessionTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSessionType(type.id)}
                  className={`p-4 rounded-lg text-center transition-all ${
                    sessionType === type.id
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <p className="font-medium text-gray-900 text-sm">{type.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>

            {/* Job Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Interviewing for:</p>
              <p className="font-medium text-gray-900">{jobRole || 'Software Engineer'}</p>
              {companyName && <p className="text-sm text-gray-600">at {companyName}</p>}
            </div>

            <Button onClick={startSession} className="w-full">
              <PlayIcon className="h-4 w-4 mr-2" />
              Start Interview Practice
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MicrophoneIcon className="h-5 w-5 text-primary-600 mr-2" />
              Interview Session - {sessionTypes.find(t => t.id === sessionType)?.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Question {questionHistory.length + 1} • {jobRole || 'General Interview'}
            </p>
          </div>
          <Button onClick={endSession} variant="secondary" size="sm">
            <StopIcon className="h-4 w-4 mr-2" />
            End Session
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Current Question */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-sm text-blue-600 mb-2">AI Interviewer:</p>
            <p className="text-lg font-medium text-gray-900">{currentQuestion}</p>
          </div>

          {/* Answer Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer:
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Type your answer here... (Use STAR method for behavioral questions)"
              disabled={!!feedback}
            />
          </div>

          {/* Action Buttons */}
          {!feedback ? (
            <Button onClick={submitAnswer} isLoading={isProcessing} className="w-full">
              Submit Answer & Get Feedback
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Feedback */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  AI Feedback
                </h4>
                <p className="text-sm text-green-800">{feedback.feedback}</p>
                <div className="mt-3">
                  <p className="text-xs font-medium text-green-900">Score: {feedback.score}/10</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 rounded-full h-2 transition-all"
                      style={{ width: `${feedback.score * 10}%` }}
                    />
                  </div>
                </div>
                {feedback.improvement && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded">
                    <p className="text-xs text-yellow-800">
                      💡 Tip: {feedback.improvement}
                    </p>
                  </div>
                )}
              </div>

              <Button onClick={nextQuestion} isLoading={isProcessing} className="w-full">
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Next Question
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default InterviewSimulator;