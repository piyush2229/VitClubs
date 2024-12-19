import { useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useNavigate } from 'react-router-dom';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
  
    console.log('Search Query:', query);
  
    setIsLoading(true);
    setError('');
    setResults([]);
  
    try {
      const response = await axios.get(`http://localhost:8001/api/v1/user/search?query=${query}`, {
        withCredentials: true // Important for authentication
      });
      
      console.log('Search Results:', response.data);
  
      if (response.data && Array.isArray(response.data.results)) {
        setResults(response.data.results);
      } else {
        setError('No results found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Error fetching search results');
    } finally {
      setIsLoading(false);
    }
  };

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 pl-4 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
          disabled={isLoading}
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
      {results.length > 0 && (
        <ul className="mt-6 space-y-4">
          {results.map((user) => (
            <li
              key={user._id}
              className="p-4 bg-white shadow-lg rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              onClick={() => goToProfile(user._id)}
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profilepicture} />
                  <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {user.username}
                  </h3>
                  <p className="text-gray-600">{user.college}</p>
                  {user.bio && (
                    <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {user.type === 'club' ? 'Club' : 'Student'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {results.length === 0 && !isLoading && !error && query && (
        <div className="text-center text-gray-500 mt-4">
          No users found matching "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchComponent;