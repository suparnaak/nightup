import React, { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

// You might want to create an interface for city data
interface City {
  id: string;
  name: string;
}

interface CityAutocompleteProps {
  onSelect: (city: City) => void;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Function to fetch city suggestions based on input
  const fetchCitySuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5`
      );
      const data = await response.json();
  
      // Convert OpenStreetMap results to match your City type
      const cities = data.map((item: any) => ({
        id: item.place_id.toString(),  // Convert place_id to string
        name: item.display_name,       // Use display_name (full city name)
      }));
  
      setSuggestions(cities);
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce function to limit API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCitySuggestions(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleCitySelect = (city: City) => {
    setInputValue(city.name);
    setShowSuggestions(false);
    onSelect(city);
  };

  return (
    <div className="relative inline-block">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for a city..."
          className="bg-gray-900 text-white pl-10 pr-3 py-2 border border-gray-500 rounded text-sm focus:border-purple-500 focus:ring-0 w-48"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.length === 0 && !isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-400">
              {inputValue.trim() ? "No cities found" : "Type to search cities"}
            </div>
          ) : (
            <ul>
              {suggestions.map((city) => (
                <li
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white"
                >
                  {city.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;