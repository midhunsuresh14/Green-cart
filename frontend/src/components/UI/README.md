# SearchBar Component

A reusable search bar component with debounced search functionality and smooth animations.

## Features

- **Debounced Search**: Automatically delays search execution to avoid excessive API calls
- **Smooth Animations**: Built with Framer Motion for smooth transitions
- **Responsive Design**: Adapts to different screen sizes
- **Clear Button**: Easy way to clear the search query
- **Customizable**: Supports different sizes and styling options

## Usage

```jsx
import SearchBar from '../UI/SearchBar';

<SearchBar
  placeholder="Search products..."
  onSearch={handleSearch}
  debounceMs={300}
  size="medium"
  className="max-w-md mx-auto"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | string | "Search..." | Placeholder text for the input |
| `onSearch` | function | - | Callback function called with search query |
| `debounceMs` | number | 300 | Debounce delay in milliseconds |
| `className` | string | "" | Additional CSS classes |
| `showClearButton` | boolean | true | Whether to show the clear button |
| `size` | string | "medium" | Size variant: "small", "medium", "large" |

## Integration

The SearchBar component is integrated into:

1. **CategoryProductPage**: Allows users to search within a specific category
2. **CategoriesPage**: Enables searching through available categories

## Search Functionality

- **Product Search**: Searches through product names, descriptions, categories, and subcategories
- **Category Search**: Searches through category names, descriptions, and subcategory names
- **Case Insensitive**: All searches are case-insensitive
- **Real-time Results**: Results update as you type (with debouncing)

## Styling

The component uses Tailwind CSS classes and includes custom CSS for animations and responsive behavior.

