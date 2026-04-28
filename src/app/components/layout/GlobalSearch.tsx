import { useState, useEffect, useRef } from "react";
import { Search, Loader2, BookOpen, User as UserIcon, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { useUserProfile } from "../../context/UserProfileContext";
import { searchService, SearchResult } from "../../../services/searchService";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (!profile?.id || !profile?.role) return;

    if (query.trim().length === 0) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchService.searchGlobal(query, profile.role, profile.id);
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, profile?.id, profile?.role]);

  const handleSelect = (result: SearchResult) => {
    setShowDropdown(false);
    setQuery("");
    navigate(result.link);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search courses, users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query.trim().length > 0) setShowDropdown(true); }}
        className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent focus:bg-background transition-all"
      />
      {isSearching && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
      )}

      {/* Dropdown Results */}
      {showDropdown && query.trim().length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50">
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {isSearching ? (
              <div className="p-4 flex items-center justify-center text-muted-foreground text-sm">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 flex flex-col items-center justify-center text-center text-muted-foreground">
                <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs mt-1">Try checking for typos or using different keywords.</p>
              </div>
            ) : (
              results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden">
                    {result.imageUrl ? (
                      <img src={result.imageUrl} alt={result.title} className="w-full h-full object-cover" />
                    ) : result.type === 'course' ? (
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-blue-600 transition-colors">
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider hidden sm:block">
                    {result.type}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
