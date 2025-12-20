export const jobs = [
  {
    id: 1,
    title:  'Senior Full Stack Developer',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Colombo, Sri Lanka',
    salary: 'LKR 200,000 - 350,000',
    experience: '3-5 years',
    description: 'Build and scale our travel platform using modern web technologies.',
    fullDescription: 'Join our engineering team to build innovative solutions that revolutionize travel experiences.  You will work with cutting-edge technologies to create scalable, high-performance applications.',
    skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS', 'TypeScript', 'GraphQL'],
    openings: 2,
    urgency: 'high',
    perks: ['Remote First', 'Learning Budget', 'Tech Equipment', 'Stock Options'],
    postedDate:  '2 days ago'
  },
  {
    id: 2,
    title: 'UI/UX Designer',
    department: 'Design',
    type: 'Full-time',
    location: 'Remote',
    salary: 'LKR 150,000 - 250,000',
    experience: '2-4 years',
    description: 'Design beautiful and intuitive experiences for our travelers.',
    fullDescription: 'Create delightful user experiences that make travel planning effortless. You will be responsible for the entire design process from research to implementation.',
    skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems'],
    openings: 1,
    urgency: 'medium',
    perks: ['Flexible Hours', 'Design Budget', 'Creative Freedom'],
    postedDate: '1 week ago'
  },
  {
    id: 3,
    title: 'Travel Content Strategist',
    department: 'Marketing',
    type: 'Part-time',
    location: 'Hybrid',
    salary: 'LKR 80,000 - 120,000',
    experience: '1-3 years',
    description: 'Create engaging travel content and destination guides.',
    fullDescription: 'Craft compelling narratives that inspire travelers.  You will develop content strategies and produce high-quality travel guides and blogs.',
    skills: ['Content Writing', 'SEO', 'Research', 'Photography', 'Social Media'],
    openings: 3,
    urgency: 'low',
    perks: ['Travel Credits', 'Flexible Schedule', 'Content Creation Tools'],
    postedDate: '3 days ago'
  },
  {
    id: 4,
    title: 'Customer Experience Specialist',
    department: 'Support',
    type: 'Full-time',
    location: 'Colombo, Sri Lanka',
    salary: 'LKR 70,000 - 100,000',
    experience: '1-2 years',
    description: 'Help travelers have amazing experiences with exceptional support.',
    fullDescription: 'Be the voice of WanderWise, providing exceptional support and creating memorable customer experiences.',
    skills: ['Communication', 'Problem Solving', 'Empathy', 'Multitasking', 'CRM Tools'],
    openings: 4,
    urgency: 'high',
    perks: ['Performance Bonuses', 'Career Growth', 'Team Events'],
    postedDate: '5 days ago'
  },
  {
    id: 5,
    title: 'DevOps Engineer',
    department:  'Engineering',
    type:  'Full-time',
    location: 'Remote',
    salary: 'LKR 250,000 - 400,000',
    experience: '4-6 years',
    description: 'Manage infrastructure and ensure system reliability and scalability.',
    fullDescription: 'Build and maintain our cloud infrastructure, implement CI/CD pipelines, and ensure system reliability and security.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Monitoring'],
    openings: 1,
    urgency: 'medium',
    perks: ['Remote Work', 'Conference Budget', 'Latest Tools'],
    postedDate: '1 week ago'
  },
  {
    id: 6,
    title: 'Data Analyst',
    department: 'Analytics',
    type: 'Full-time',
    location: 'Colombo, Sri Lanka',
    salary: 'LKR 120,000 - 200,000',
    experience: '2-4 years',
    description: 'Turn data into insights to improve traveler experiences.',
    fullDescription: 'Analyze user behavior and platform data to generate insights that drive business decisions and improve user experiences.',
    skills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Machine Learning'],
    openings: 1,
    urgency: 'low',
    perks: ['Data Science Resources', 'Training Programs', 'Competitive Salary'],
    postedDate: '2 weeks ago'
  }
];

export const departments = [
  { id: 'all', name: 'All Departments', color: 'from-gray-500 to-gray-700' },
  { id: 'Engineering', name: 'Engineering', color: 'from-blue-500 to-cyan-500' },
  { id: 'Design', name: 'Design', color: 'from-purple-500 to-pink-500' },
  { id: 'Marketing', name: 'Marketing', color: 'from-amber-500 to-orange-500' },
  { id: 'Support', name: 'Support', color: 'from-emerald-500 to-green-500' },
  { id:  'Analytics', name: 'Analytics', color: 'from-indigo-500 to-violet-500' }
];

export const jobTypes = [
  { id: 'all', name: 'All Types', color: 'gray' },
  { id: 'Full-time', name: 'Full-time', color: 'blue' },
  { id:  'Part-time', name:  'Part-time', color:  'purple' },
  { id: 'Contract', name: 'Contract', color: 'amber' },
  { id: 'Internship', name: 'Internship', color: 'emerald' }
];