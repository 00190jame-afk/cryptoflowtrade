import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Optimized fetch function with error handling
const fetchCryptoData = async (): Promise<CryptoData[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`,
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'max-age=60', // Cache for 1 minute
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

export const useMarketData = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const query = useQuery({
    queryKey: ['crypto-prices'],
    queryFn: fetchCryptoData,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: isOnline ? 60 * 1000 : false, // Refetch every minute when online
    refetchIntervalInBackground: false,
    enabled: isOnline, // Only fetch when online
    retry: (failureCount, error) => {
      // Don't retry if offline or on rate limit
      if (!isOnline || error.message.includes('429')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  const refreshData = useCallback(() => {
    if (isOnline) {
      query.refetch();
    }
  }, [query, isOnline]);

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isRefetching: query.isFetching && !query.isLoading,
    isOnline,
    refreshData,
    lastUpdated: query.dataUpdatedAt,
  };
};