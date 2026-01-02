import { smartSearch } from "@/lib/search-action";
import { SearchResultCard } from "@/components/search_components/search-result-card"; 

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  
  // 1. Get Query & Explicit Location Filter
  const query = typeof resolvedSearchParams.query === 'string' ? resolvedSearchParams.query : 
                typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : "";
  
  const location = typeof resolvedSearchParams.loc === 'string' ? resolvedSearchParams.loc : 
                   typeof resolvedSearchParams.location === 'string' ? resolvedSearchParams.location : undefined;

  // ✅ 2. Get User's Physical Region (Passed from SearchBar)
  const userRegion = typeof resolvedSearchParams.region === 'string' ? resolvedSearchParams.region : undefined;

  // ✅ 3. Pass 'userRegion' to smartSearch so it logs the impression correctly
  const results = await smartSearch(query, location, userRegion);

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Search Results for <span className="text-blue-600">"{query}"</span>
        </h1>
        {location && (
          <p className="text-gray-500 mt-1">In {location}</p>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((company) => (
            <SearchResultCard 
                key={company.id}
                company={company}
                searchQuery={query}
                userLocation={location} // The filter typed (e.g. "Chicago")
                userRegion={userRegion} // ✅ Pass physical region (e.g. "Delhi") for click tracking
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-700">No results found</h2>
          <p className="text-gray-500 mt-2">Try adjusting your search terms or location.</p>
        </div>
      )}
    </div>
  );
}