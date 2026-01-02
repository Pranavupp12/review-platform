import { Globe, Mail, MapPin } from "lucide-react";

interface ContactDetailsCardProps {
  // Update these types to allow null
  websiteUrl?: string | null; 
  email?: string | null;
  address?: string | null;
}

export function ContactDetailsCard({ websiteUrl, email, address }: ContactDetailsCardProps) {
  // Helper to format URL
  const formatUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 space-y-5">
      <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Contact Details</h3>

      {websiteUrl && (
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 uppercase font-semibold">Website</p>
            <a 
              href={websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline text-sm truncate block"
            >
              {formatUrl(websiteUrl)}
            </a>
          </div>
        </div>
      )}

      {email && (
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
            <a href={`mailto:${email}`} className="text-gray-700 hover:text-blue-600 text-sm">
              {email}
            </a>
          </div>
        </div>
      )}

      {address && (
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
            <p className="text-gray-700 text-sm leading-snug">
              {address}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}