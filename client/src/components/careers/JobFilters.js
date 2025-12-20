'use client';
import { motion } from 'framer-motion';
import { Search, Filter, Building, Cpu, Palette, Megaphone, Headphones, BarChart } from 'lucide-react';

// Department icons mapping
const departmentIcons = {
  'all': Building,
  'Engineering': Cpu,
  'Design': Palette,
  'Marketing': Megaphone,
  'Support': Headphones,
  'Analytics': BarChart
};

export default function JobFilters({ 
  searchTerm, 
  setSearchTerm, 
  selectedDepartment, 
  setSelectedDepartment,
  selectedType,
  setSelectedType 
}) {
  // Define departments
  const departments = [
    { id: 'all', name: 'All Departments', color: 'from-gray-500 to-gray-700' },
    { id: 'Engineering', name: 'Engineering', color: 'from-blue-500 to-cyan-500' },
    { id: 'Design', name: 'Design', color: 'from-purple-500 to-pink-500' },
    { id: 'Marketing', name: 'Marketing', color: 'from-amber-500 to-orange-500' },
    { id: 'Support', name: 'Support', color: 'from-emerald-500 to-green-500' },
    { id:  'Analytics', name: 'Analytics', color: 'from-indigo-500 to-violet-500' }
  ];

  const jobTypes = [
    { id:  'all', name: 'All Types', color: 'gray' },
    { id: 'Full-time', name: 'Full-time', color: 'blue' },
    { id: 'Part-time', name: 'Part-time', color: 'purple' },
    { id: 'Contract', name: 'Contract', color: 'amber' },
    { id: 'Internship', name: 'Internship', color: 'emerald' }
  ];

  return (
    <div className="mb-12 space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by role, skills, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white shadow-lg"
        />
        <Filter className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Department Filter */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {departments.map((dept) => {
          const Icon = departmentIcons[dept.id] || Building;
          return (
            <motion.button
              key={dept. id}
              onClick={() => setSelectedDepartment(dept.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-3 cursor-pointer ${
                selectedDepartment === dept.id
                  ? `bg-gradient-to-r ${dept.color} text-white shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {dept.name}
            </motion.button>
          );
        })}
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {jobTypes.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer ${
              selectedType === type.id
                ? `bg-${type.color}-600 text-white shadow-lg`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {type. name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}