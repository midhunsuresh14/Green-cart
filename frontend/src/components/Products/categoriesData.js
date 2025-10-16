import { api } from '../../lib/api';

// This file exports an async function to fetch categories from the backend
// instead of using static data

let cachedCategories = null;
let isFetching = false;
let fetchPromise = null;

export async function fetchCategories() {
  // If we have cached categories, return them immediately
  if (cachedCategories) {
    return cachedCategories;
  }
  
  // If we're already fetching, return the existing promise
  if (isFetching) {
    return fetchPromise;
  }
  
  // Set fetching flag and create promise
  isFetching = true;
  fetchPromise = api.listCategories()
    .then(categories => {
      // Transform the API response to match the expected format
      const transformed = categories.map(cat => ({
        name: cat.name,
        key: cat.name,
        // Use a default cover image if none provided
        cover: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600&auto=format&fit=crop',
        children: (cat.subcategories || []).map(sub => ({
          name: sub.name,
          key: sub.name
        }))
      }));
      
      cachedCategories = transformed;
      isFetching = false;
      return transformed;
    })
    .catch(error => {
      console.error('Error fetching categories:', error);
      isFetching = false;
      // Return empty array if fetch fails
      return [];
    });
  
  return fetchPromise;
}

export function findCategoryByKey(key) {
  if (!cachedCategories) return null;
  return cachedCategories.find((c) => c.key === key);
}