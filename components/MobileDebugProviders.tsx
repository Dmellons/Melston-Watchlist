'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/User';
import { Card, CardContent } from './ui/card';
import SafeIcon from './SafeIcon';
import { Loader2, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface MobileDebugProvidersProps {
    tmdbId: number;
    tmdbType: string;
    userProviders?: number[] | boolean;
}

const MobileDebugProviders = ({ tmdbId, tmdbType, userProviders }: MobileDebugProvidersProps) => {
    const { user } = useUser();
    const [debugInfo, setDebugInfo] = useState<any>({
        mounted: false,
        windowWidth: 0,
        userAgent: '',
        hasNetwork: false,
        apiCalled: false,
        apiSuccess: false,
        apiError: null,
        apiData: null,
        providersData: null,
        finalResult: 'not-calculated'
    });

    useEffect(() => {
        // Initial debug info
        setDebugInfo(prev => ({
            ...prev,
            mounted: true,
            windowWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            hasNetwork: typeof navigator !== 'undefined' ? navigator.onLine : false,
            tmdbId,
            tmdbType,
            userProviders: Array.isArray(userProviders) ? userProviders : (userProviders === true ? user?.providers || [] : []),
            userLabels: user?.labels || []
        }));

        // Simulate API call with detailed logging
        const testProvidersAPI = async () => {
            try {
                setDebugInfo(prev => ({ ...prev, apiCalled: true }));

                const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}/watch/providers`;
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                
                setDebugInfo(prev => ({
                    ...prev,
                    apiSuccess: true,
                    apiData: data,
                    providersData: data.results?.US,
                    finalResult: data.results?.US?.flatrate ? 'has-providers' : 'no-providers'
                }));

            } catch (error) {
                setDebugInfo(prev => ({
                    ...prev,
                    apiError: error instanceof Error ? error.message : 'Unknown error',
                    finalResult: 'error'
                }));
            }
        };

        testProvidersAPI();
    }, [tmdbId, tmdbType, userProviders, user]);

    return (
        <div className="space-y-2 w-full">
            {/* Always Visible Debug Card */}
            <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950">
                <CardContent className="p-3">
                    <h4 className="font-bold text-red-800 dark:text-red-200 text-sm mb-2">
                        🐛 Mobile Debug - ProvidersBlock
                    </h4>
                    
                    <div className="text-xs space-y-1 text-red-700 dark:text-red-300">
                        <div className="grid grid-cols-2 gap-2">
                            <div><strong>Screen:</strong> {debugInfo.windowWidth}px</div>
                            <div><strong>Network:</strong> {debugInfo.hasNetwork ? '✅ Online' : '❌ Offline'}</div>
                            <div><strong>TMDB ID:</strong> {tmdbId}</div>
                            <div><strong>Type:</strong> {tmdbType}</div>
                        </div>
                        
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                            <div><strong>User Providers:</strong> {JSON.stringify(debugInfo.userProviders)}</div>
                            <div><strong>User Labels:</strong> {JSON.stringify(debugInfo.userLabels)}</div>
                        </div>

                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                            <div><strong>API Called:</strong> {debugInfo.apiCalled ? '✅' : '❌'}</div>
                            <div><strong>API Success:</strong> {debugInfo.apiSuccess ? '✅' : '❌'}</div>
                            <div><strong>Error:</strong> {debugInfo.apiError || 'None'}</div>
                            <div><strong>Result:</strong> {debugInfo.finalResult}</div>
                        </div>

                        {debugInfo.providersData && (
                            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                                <div><strong>US Providers:</strong> Found</div>
                                <div><strong>Flatrate:</strong> {debugInfo.providersData.flatrate?.length || 0} providers</div>
                                {debugInfo.providersData.flatrate?.map((provider: any, index: number) => (
                                    <div key={index} className="text-xs">
                                        - {provider.provider_name}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-2 text-xs">
                            <strong>User Agent:</strong><br />
                            <div className="break-all">{debugInfo.userAgent}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Indicator */}
            <Card className={`border-2 ${
                debugInfo.finalResult === 'has-providers' ? 'border-green-500 bg-green-50' :
                debugInfo.finalResult === 'no-providers' ? 'border-yellow-500 bg-yellow-50' :
                debugInfo.finalResult === 'error' ? 'border-red-500 bg-red-50' :
                'border-gray-500 bg-gray-50'
            }`}>
                <CardContent className="p-3 text-center">
                    {debugInfo.finalResult === 'not-calculated' && (
                        <div className="flex items-center justify-center gap-2">
                            <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} />
                            <span className="text-sm">Testing API...</span>
                        </div>
                    )}
                    
                    {debugInfo.finalResult === 'has-providers' && (
                        <div className="text-green-700">
                            ✅ Providers Found - Should be visible!
                        </div>
                    )}
                    
                    {debugInfo.finalResult === 'no-providers' && (
                        <div className="text-yellow-700">
                            ⚠️ No Providers - Showing fallback
                        </div>
                    )}
                    
                    {debugInfo.finalResult === 'error' && (
                        <div className="text-red-700">
                            ❌ API Error - Check console
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Simulated ProvidersBlock Result */}
            <Card className="border border-blue-500 bg-blue-50">
                <CardContent className="p-3">
                    <div className="text-center text-sm font-semibold text-blue-800 mb-2">
                        Simulated ProvidersBlock Output:
                    </div>
                    
                    {debugInfo.finalResult === 'has-providers' && debugInfo.providersData?.flatrate && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {debugInfo.providersData.flatrate.slice(0, 4).map((provider: any, index: number) => (
                                <div key={index} className="bg-white px-2 py-1 rounded border text-xs">
                                    {provider.provider_name}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {debugInfo.finalResult === 'no-providers' && (
                        <div className="text-center text-yellow-700 text-sm">
                            No streaming available
                        </div>
                    )}
                    
                    {debugInfo.finalResult === 'error' && (
                        <div className="text-center text-red-700 text-sm">
                            Error: {debugInfo.apiError}
                        </div>
                    )}
                    
                    {debugInfo.finalResult === 'not-calculated' && (
                        <div className="text-center text-gray-700 text-sm">
                            Loading...
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Network Test */}
            <Card className="border border-purple-500 bg-purple-50">
                <CardContent className="p-3">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <SafeIcon 
                                icon={debugInfo.hasNetwork ? Wifi : WifiOff} 
                                className={`h-4 w-4 ${debugInfo.hasNetwork ? 'text-green-500' : 'text-red-500'}`} 
                                size={16} 
                            />
                            <span className="text-sm font-semibold">
                                Network: {debugInfo.hasNetwork ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        <div className="text-xs text-purple-700">
                            If this shows disconnected, that might be your issue!
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MobileDebugProviders;