import { Star, Clock, Users, Shield, Award, Calendar, Heart, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function ActivityInfo({ activity }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const truncatedDescription = activity.description 
    ? activity.description.slice(0, 200) + (activity.description.length > 200 ? '...' : '')
    : "No description available.";

  return (
    <div className="mb-12 space-y-8">
      {/* Description Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="text-blue-600" size={24} />
          About This Experience
        </h2>
        <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${
          !isDescriptionExpanded && activity.description?.length > 200 ? 'line-clamp-4' : ''
        }`}>
          {activity.description || "No description available."}
        </p>
        {activity.description?.length > 200 && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            {isDescriptionExpanded ? 'Read less' : 'Read more'}
            <svg 
              className={`w-4 h-4 transition-transform ${isDescriptionExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Rating & Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guest Ratings</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={`${
                    i < Math.round(activity.rating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {activity.rating ? Number(activity.rating).toFixed(1) : 'N/A'}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {activity.review_count 
              ? `Based on ${activity.review_count} reviews` 
              : 'Be the first to review!'
            }
          </p>
          
          {/* Rating Breakdown (if available) - FIXED LAYOUT */}
          {activity.rating_breakdown && (
            <div className="mt-4 space-y-3">
              {Object.entries(activity.rating_breakdown).map(([category, score]) => (
                <div key={category} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize min-w-[80px] flex-shrink-0">
                    {category}
                  </span>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[120px]">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${(score / 5) * 20}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right flex-shrink-0 ml-50">
                      {score.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Card */}
        {activity.max_price && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Pricing Details
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Starting from</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${activity.min_price}
                </span>
                {activity.original_price && activity.original_price > activity.min_price && (
                  <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    ${activity.original_price}
                  </span>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.currency || "USD"}
                </span>
              </div>
              {activity.original_price && activity.original_price > activity.min_price && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                    Save ${activity.original_price - activity.min_price}
                  </span>
                </div>
              )}
            </div>

            {/* Additional Pricing Info */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {activity.duration && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{activity.duration} duration</span>
                </div>
              )}
              {activity.group_size && (
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>Group size: {activity.group_size}</span>
                </div>
              )}
              {activity.free_cancellation && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Shield size={16} />
                  <span>Free cancellation</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Facts */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Facts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activity.difficulty && (
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Difficulty</div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">
                {activity.difficulty}
              </div>
            </div>
          )}
          
          {activity.season && (
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Best Season</div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">
                {activity.season}
              </div>
            </div>
          )}
          
          {activity.age_limit && (
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Age Limit</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {activity.age_limit}+
              </div>
            </div>
          )}
          
          {activity.availability && (
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Availability</div>
              <div className="font-semibold text-green-600 dark:text-green-400 capitalize">
                {activity.availability}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}