'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaLinkedin, FaGithub, FaFacebook, FaTwitter, FaInstagram, FaRocket } from 'react-icons/fa';
import { Mail, Users, Sparkles, Award, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const team = [
  {
    name: 'Supun Akalanka',
    role: 'Founder & CEO',
    image: '/images/team/supun.jpg',
    bio: 'Visionary leader with a passion for travel tech innovation and sustainable tourism. 3+ years in the industry.',
    socials: {
      facebook: 'https://facebook.com/supunakalanka76',
      linkedin: 'https://linkedin.com/in/supunakalanka76',
      github: 'https://github.com/supunakalanka76',
      twitter: '#',
    },
    expertise: ['Strategy', 'Leadership', 'Innovation'],
    color: 'from-blue-500 to-cyan-500',
    delay: 0.1
  },
  {
    name: 'Rushini Perera',
    role: 'Lead Designer',
    image: '/images/team/rushini.jpg',
    bio: 'Creates stunning and intuitive user experiences that transform how people explore Sri Lanka.',
    socials: {
      facebook: '#',
      linkedin: '#',
      instagram: '#',
      twitter: '#',
    },
    expertise: ['UI/UX Design', 'Branding', 'User Research'],
    color: 'from-purple-500 to-pink-500',
    delay: 0.2
  },
  {
    name: 'Shevon Costa',
    role: 'Backend Engineer',
    image: '/images/team/shevon.jpg',
    bio: 'Scales systems and ensures data flows smoothly to deliver seamless travel experiences.',
    socials: {
      linkedin: '#',
      github: '#',
      twitter: '#',
    },
    expertise: ['System Architecture', 'API Development', 'Database Management'],
    color: 'from-green-500 to-emerald-500',
    delay: 0.3
  },
  {
    name: 'Amaya Silva',
    role: 'Travel Expert',
    image: '/images/team/amaya.jpg',
    bio: 'Local guide with extensive knowledge of Sri Lankan culture and hidden gems.',
    socials: {
      facebook: '#',
      instagram: '#',
      twitter: '#',
    },
    expertise: ['Local Culture', 'Adventure Tours', 'Customer Experience'],
    color: 'from-orange-500 to-amber-500',
    delay: 0.4
  }
];

const socialIcons = {
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  github: FaGithub,
  twitter: FaTwitter,
  instagram: FaInstagram
};

export default function TeamSection() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 mb-6"
          >
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Our Dream Team</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Meet the <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Team</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            The passionate individuals behind WanderWise, dedicated to creating unforgettable Sri Lankan adventures
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: member.delay }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              whileHover={{ y: -8 }}
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 h-full relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                {/* Profile Image */}
                <div className="relative p-6">
                  <div className="relative mx-auto w-32 h-32 mb-4">
                    <div className={`absolute inset-0 bg-gradient-to-br ${member.color} rounded-full opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                    <Image
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full object-cover mx-auto relative z-10 group-hover:scale-105 transition-transform duration-300"
                      width={128}
                      height={128}
                    />
                    {/* Online status indicator */}
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white z-20"></div>
                  </div>

                  {/* Name and Role */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{member.role}</p>
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <MessageCircle className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">Available</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm text-center mb-4 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Expertise */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {member.expertise.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex justify-center gap-3">
                    {Object.entries(member.socials).map(([platform, url]) => {
                      const IconComponent = socialIcons[platform];
                      return (
                        <motion.a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.2, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        >
                          <IconComponent className="w-4 h-4" />
                        </motion.a>
                      );
                    })}
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join Team CTA */}
        <motion.div
          className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg border border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <FaRocket className="text-blue-600 text-2xl" />
            <h3 className="text-2xl font-bold text-gray-800">Want to Join Our Journey?</h3>
          </div>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We&#39;re always looking for passionate individuals to help us reshape travel in Sri Lanka
          </p>
          <Link href="/careers">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              View Open Positions
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </section>
  );
}