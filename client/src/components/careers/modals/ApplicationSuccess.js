'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Briefcase, CheckCircle, Clock, Home, PartyPopper, Sparkles, Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function ApplicationSuccess({ isOpen, onClose, jobTitle, applicationId }) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks:  60, zIndex: 9999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nextSteps = [
    {
      icon: Mail,
      title: 'Check Your Email',
      description: 'We\'ve sent a confirmation to your email address',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: FileText,
      title: 'Application Review',
      description: 'Our team will review your application within 3-5 business days',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark: bg-purple-900/20'
    },
    {
      icon: Calendar,
      title:  'Interview Scheduling',
      description: 'If selected, we\'ll reach out to schedule an interview',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: MessageSquare,
      title: 'Stay Connected',
      description: 'Follow up questions?  Email us at careers@wanderwise. com',
      color: 'text-amber-500',
      bgColor:  'bg-amber-50 dark:bg-amber-900/20'
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity:  1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale:  1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all z-10"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Header with Animation */}
          <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-12 text-center overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    scale: 0
                  }}
                  animate={{
                    y: [null, '-100%'],
                    scale: [0, 1, 0],
                    opacity:  [0, 1, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math. random() * 2
                  }}
                  className="absolute w-2 h-2 bg-white rounded-full"
                />
              ))}
            </div>

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale:  1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.2 
              }}
              className="relative z-10 mb-6"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </motion. div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity:  1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10"
            >
              <h2 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                Application Submitted!
                <PartyPopper className="w-8 h-8" />
              </h2>
              <p className="text-xl text-white/90">
                Thank you for applying to <span className="font-semibold">{jobTitle}</span>
              </p>
            </motion.div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Application ID */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-blue-800 dark:text-blue-300">Your Application ID</h3>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                  #{applicationId || 'APP-' + Math.random().toString(36).substr(2, 9).toUpperCase()}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(applicationId);
                    alert('Application ID copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                >
                  Copy ID
                </button>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                Save this ID for reference when following up on your application
              </p>
            </motion.div>

            {/* Next Steps */}
            <motion. div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">What Happens Next? </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {nextSteps. map((step, index) => {
                  const Icon = step. icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className={`p-5 ${step.bgColor} rounded-2xl border border-gray-200 dark:border-gray-700`}
                    >
                      <Icon className={`w-8 h-8 ${step. color} mb-3`} />
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {step.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-amber-500" />
                <h4 className="font-bold text-gray-900 dark:text-white">Typical Timeline</h4>
              </div>
              
              <div className="space-y-4">
                {[
                  { day: 'Day 1-3', text: 'Application review by hiring team' },
                  { day:  'Day 3-5', text: 'Initial screening call (if selected)' },
                  { day: 'Week 2', text: 'Technical/skills assessment' },
                  { day: 'Week 3', text: 'Final interviews' },
                  { day:  'Week 4', text:  'Offer decision' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-20 text-sm font-bold text-blue-600 dark:text-blue-400">
                      {item.day}
                    </div>
                    <div className="flex-1 text-gray-700 dark:text-gray-300">
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion. div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={() => {
                  onClose();
                  router.push('/careers');
                }}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-5 h-5" />
                Browse More Positions
              </button>

              <button
                onClick={() => {
                  onClose();
                  router.push('/');
                }}
                className="flex-1 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </button>
            </motion.div>

            {/* Share Success */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Share your achievement with your network! 
              </p>
              <div className="flex items-center justify-center gap-3">
                {[
                  { name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
                  { name: 'Twitter', icon: '🐦', color: 'bg-sky-500' },
                  { name:  'Facebook', icon: '📘', color: 'bg-blue-700' }
                ].map((social, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const text = `I just applied for ${jobTitle} at WanderWise! 🎉`;
                      if (social.name === 'Twitter') {
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
                      }
                    }}
                    className={`p-3 ${social.color} text-white rounded-xl hover:scale-110 transition-transform cursor-pointer`}
                    title={`Share on ${social.name}`}
                  >
                    <span className="text-xl">{social.icon}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion. div>
      </div>
    </>
  );
}