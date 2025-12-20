'use client';
import "./../../app/globals.css"

import { Fragment, useState } from 'react';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers3,
  Landmark,
  TreePine,
  Church,
  Mountain,
  Sun,
  PawPrint,
  Building2,
  MoreHorizontal,
  Sparkles,
  X
} from 'lucide-react';

const iconMap = {
  All: Layers3,
  Historical: Landmark,
  Cultural: Landmark,
  Nature: TreePine,
  Religious: Church,
  Adventure: Mountain,
  'Beach / Adventure': Sun,
  'Beach / Leisure': Sun,
  'Wildlife / National Park': PawPrint,
  'Coastal / Cultural': Landmark,
  'Historical / Coastal': Landmark,
  'Cultural / Coastal / Wildlife': Landmark,
  'Coastal / Adventure / Relaxation': Mountain,
  'Wildlife / Family-Friendly / Cultural': PawPrint,
  'Coastal / Adventure / Eco-Tourism': Mountain,
  'Natural Attraction / Waterfalls / Scenic': TreePine,
  'City & Urban Experience': Building2,
};

const allCategories = Object.keys(iconMap);
const primaryCategories = allCategories.slice(0, 3);
const extraCategories = allCategories.slice(3);

export default function CategoryFilter({ selected, onSelect }) {
  const [dropdownSelected, setDropdownSelected] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const renderButton = (cat, isDropdown = false) => {
    const Icon = iconMap[cat];
    const isSelected = selected === cat;

    return (
      <motion.button
        key={cat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(cat)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer relative overflow-hidden group ${
          isSelected
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
        } ${isDropdown ? 'w-full justify-start' : ''}`}
      >
        {/* Shine effect on hover */}
        <span className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${isSelected ? 'opacity-50' : 'opacity-0'}`}></span>
        
        {Icon && <Icon size={18} className={isSelected ? 'text-white' : 'text-blue-500'} />}
        <span className="font-semibold">{cat}</span>
        
        {isSelected && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto"
          >
            <Sparkles size={16} className="text-yellow-300" />
          </motion.span>
        )}
      </motion.button>
    );
  };

  const clearFilter = () => {
    onSelect('All');
    setDropdownSelected(null);
  };

  return (
    <div className="w-full">
      {/* Header with clear button */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Layers3 size={20} className="text-blue-500" />
          Filter by Category
        </h3>
        {selected !== 'All' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={clearFilter}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={14} />
            Clear
          </motion.button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* Main category grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        >
          {primaryCategories.map((cat) => renderButton(cat))}
          
          {/* Show the selected dropdown category if it exists */}
          {dropdownSelected && !primaryCategories.includes(dropdownSelected) && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {renderButton(dropdownSelected)}
              </motion.div>
            </AnimatePresence>
          )}

          {/* More Categories dropdown */}
          <Menu as="div" className="relative">
            <MenuButton as={Fragment}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium shadow-md hover:shadow-lg transition-all cursor-pointer w-full"
              >
                <MoreHorizontal size={18} />
                <span className="font-semibold">More</span>
              </motion.button>
            </MenuButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 scale-90 -translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-90 -translate-y-4"
            >
              <MenuItems className="absolute z-50 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none p-3 grid gap-1 custom-scrollbar right-0 origin-top-right">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  All Categories
                </div>
                {extraCategories.map((cat) => {
                  const Icon = iconMap[cat];
                  const isSelected = selected === cat;
                  return (
                    <MenuItem key={cat}>
                      {({ active }) => (
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            onSelect(cat);
                            setDropdownSelected(cat);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : active
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {Icon && <Icon size={16} className={isSelected ? 'text-blue-500' : 'text-gray-400'} />}
                          <span className="font-medium">{cat}</span>
                          {isSelected && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto"
                            >
                              <Sparkles size={14} className="text-blue-500" />
                            </motion.span>
                          )}
                        </motion.button>
                      )}
                    </MenuItem>
                  );
                })}
              </MenuItems>
            </Transition>
          </Menu>
        </motion.div>

        {/* Selected category indicator */}
        {selected !== 'All' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Filtering by: <strong>{selected}</strong>
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}