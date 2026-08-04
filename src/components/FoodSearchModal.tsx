import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Star, Clock, Plus, ChevronRight } from 'lucide-react';
import { FoodItem } from '../types';
import { COMMON_AUSTRALIAN_FOODS } from '../data/mockData';

interface FoodSearchModalProps {
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  onClose,
  onSelectFood,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>(COMMON_AUSTRALIAN_FOODS);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setSearchResults(COMMON_AUSTRALIAN_FOODS);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(text.trim())}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        // Fallback filter local
        const localMatches = COMMON_AUSTRALIAN_FOODS.filter(
          (f) =>
            f.name.toLowerCase().includes(text.toLowerCase()) ||
            (f.brand && f.brand.toLowerCase().includes(text.toLowerCase()))
        );
        setSearchResults(localMatches);
      }
    } catch {
      // Fallback
      const localMatches = COMMON_AUSTRALIAN_FOODS.filter((f) =>
        f.name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(localMatches);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustom = () => {
    const customFood: FoodItem = {
      id: `custom_${Date.now()}`,
      name: query.trim() || 'Custom Meal',
      brand: 'Custom Entry',
      serving: { amount: 100, unit: 'g', label: '1 serving' },
      nutritionPerServing: { calories: 200, proteinG: 20, carbsG: 15, fatG: 5 },
      category: 'Custom',
      source: 'custom',
    };
    onSelectFood(customFood);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0D0E12] flex flex-col justify-between sm:max-w-md sm:mx-auto"
    >
      {/* Search Header */}
      <div className="bg-[#0D0E12]/90 backdrop-blur-md px-5 py-4 border-b border-white/5 space-y-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search chicken, yoghurt, protein..."
              autoFocus
              className="w-full bg-[#181A20] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Results / List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {!query && (
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Common Foods</span>
            </div>
          </div>
        )}

        <div className="divide-y divide-white/5 bg-[#181A20] border border-white/10 rounded-2xl overflow-hidden">
          {searchResults.map((food) => (
            <button
              key={food.id}
              onClick={() => onSelectFood(food)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  {food.brand && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 px-2 py-0.5 rounded-md">
                      {food.brand}
                    </span>
                  )}
                  <p className="text-sm font-bold text-white leading-snug">{food.name}</p>
                </div>
                <p className="text-xs text-zinc-400">
                  Serving: {food.serving.amount} {food.serving.unit}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {food.nutritionPerServing.calories}{' '}
                    <span className="text-xs font-normal text-zinc-400">kcal</span>
                  </p>
                  <p className="text-xs text-indigo-400 font-medium">
                    {food.nutritionPerServing.proteinG}g protein
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </div>
            </button>
          ))}

          {query && searchResults.length === 0 && !loading && (
            <div className="p-6 text-center space-y-3">
              <p className="text-sm text-zinc-400">
                No matching foods found for "{query}".
              </p>
              <button
                onClick={handleCreateCustom}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Item "{query}"</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
