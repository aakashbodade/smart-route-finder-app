import React, { useState, useEffect } from 'react';
import { Button } from '@/components/pure/Button';
import { Label } from '@/components/pure/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/pure/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/pure/Select';
import { Badge } from '@/components/pure/Badge';
import { Route, ArrowRight, MapPin, Loader2, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/components/pure/Toast';
import { pathService } from '../services/pathService';

const PathFinder = ({ hubs, onPathFound }) => {
    const [sourceHub, setSourceHub] = useState('');
    const [destinationHub, setDestinationHub] = useState('');
    const [currentPath, setCurrentPath] = useState([]);
    const [pathDetails, setPathDetails] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [lastError, setLastError] = useState(null);

    const { toast } = useToast();

    const isNetworkConnected = () => {
        if (hubs.length < 2) return false;

        return hubs.some(hub => hub.connectedHubs && hub.connectedHubs.length > 0);
    };

    const handleFindPath = async () => {
        if (!sourceHub || !destinationHub) {
            toast({
                title: "Missing Selection",
                description: "Please select both source and destination hubs",
                variant: "destructive",
            });
            return;
        }

        if (sourceHub === destinationHub) {
            toast({
                title: "Same Hub Selected",
                description: "Source and destination cannot be the same",
                variant: "destructive",
            });
            return;
        }

        setIsCalculating(true);
        setLastError(null);

        try {
            const result = await pathService.findShortestPath(sourceHub, destinationHub);
            if (result.path && result.path.length > 0) {
                setCurrentPath(result.path);
                setPathDetails({
                    path: result.path,
                    distance: result.distance,
                    hops: result.path.length - 1
                });
                onPathFound(result.path);

                const sourceHubName = hubs.find(h => h.id === sourceHub)?.name;
                const destHubName = hubs.find(h => h.id === destinationHub)?.name;

                toast({
                    title: "Path Found!",
                    description: `Route from ${sourceHubName} to ${destHubName} found in ${result.distance} steps`,
                });
                setIsOnline(true);
            } else {
                handleNoPathFound();
            }
        } catch (error) {
            console.error('Pathfinding error:', error);
            setLastError(error.message);

            if (error.message.includes('No path found') || error.message.includes('not found')) {
                handleNoPathFound();
            } else {
                setIsOnline(false);
                toast({
                    title: "Connection Error",
                    description: "Unable to calculate path. Please check your connection and try again.",
                    variant: "destructive",
                });
                setCurrentPath([]);
                setPathDetails(null);
                onPathFound([]);
            }
        } finally {
            setIsCalculating(false);
        }
    };

    const handleNoPathFound = () => {
        setCurrentPath([]);
        setPathDetails(null);
        onPathFound([]);

        const sourceHubName = hubs.find(h => h.id === sourceHub)?.name;
        const destHubName = hubs.find(h => h.id === destinationHub)?.name;

        toast({
            title: "No Path Found",
            description: `There is no connection between ${sourceHubName} and ${destHubName}`,
            variant: "destructive",
        });
    };

    const handleClearPath = () => {
        setCurrentPath([]);
        setPathDetails(null);
        onPathFound([]);
        setSourceHub('');
        setDestinationHub('');
        setLastError(null);
    };

    const getPathWithNames = () => {
        if (!pathDetails || !pathDetails.path) return [];

        return pathDetails.path.map(hubId => {
            const hub = hubs.find(h => h.id === hubId);
            return {
                id: hubId,
                name: hub?.name || hubId
            };
        });
    };

    const networkConnected = isNetworkConnected();
    const pathWithNames = getPathWithNames();

    useEffect(() => {
        setCurrentPath([]);
        setPathDetails(null);
        onPathFound([]);
        setLastError(null);
    }, [hubs, onPathFound]);

    return (
        <div className="space-y-6">
            {!isOnline && (
                <Card className="border-destructive bg-destructive/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <WifiOff className="h-4 w-4" />
                            <span className="text-sm font-medium">Connection Issue</span>
                        </div>
                        <p className="text-sm text-destructive/80 mt-1">
                            Unable to connect to pathfinding service. Check if the backend is running.
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card className="pathfinder-card">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Route className="h-5 w-5" />
                            Find Shortest Path
                        </span>
                        <div className="flex items-center gap-2">
                            {isOnline ? (
                                <Wifi className="h-4 w-4 text-green-500" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-destructive" />
                            )}
                        </div>
                    </CardTitle>
                    {!networkConnected && hubs.length > 1 && (
                        <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Network is not fully connected - some paths may not be available
                        </div>
                    )}
                    {hubs.length < 2 && (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            Add at least 2 connected hubs to enable pathfinding
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Source Hub
                            </Label>
                            <Select
                                value={sourceHub}
                                onValueChange={setSourceHub}
                                disabled={isCalculating || hubs.length < 2}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select source hub" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hubs.map(hub => (
                                        <SelectItem key={hub.id} value={hub.id}>
                                            {hub.name} ({hub.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Destination Hub
                            </Label>
                            <Select
                                value={destinationHub}
                                onValueChange={setDestinationHub}
                                disabled={isCalculating || hubs.length < 2}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select destination hub" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hubs.filter(hub => hub.id !== sourceHub).map(hub => (
                                        <SelectItem key={hub.id} value={hub.id}>
                                            {hub.name} ({hub.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleFindPath}
                            className="flex-1"
                            disabled={isCalculating || hubs.length < 2 || !sourceHub || !destinationHub}
                        >
                            {isCalculating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Calculating...
                                </>
                            ) : (
                                <>
                                    <Route className="h-4 w-4 mr-2" />
                                    Find Path
                                </>
                            )}
                        </Button>
                        {(currentPath.length > 0 || lastError) && (
                            <Button variant="outline" onClick={handleClearPath}>
                                Clear
                            </Button>
                        )}
                    </div>

                    {lastError && (
                        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {lastError}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Path Results */}
            {pathDetails && pathWithNames.length > 0 && (
                <Card className="pathfinder-card path-result">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowRight className="h-5 w-5" />
                            Shortest Path Found
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="metric">
                                <div className="metric-value">{pathDetails.hops}</div>
                                <div className="metric-label">Hops</div>
                            </div>
                            <div className="metric">
                                <div className="metric-value">{pathDetails.distance}</div>
                                <div className="metric-label">Distance</div>
                            </div>
                            <div className="metric">
                                <div className="metric-value">{pathWithNames.length}</div>
                                <div className="metric-label">Total Hubs</div>
                            </div>
                        </div>

                        <div className="path-visualization">
                            <h4 className="font-medium mb-3">Route:</h4>
                            <div className="path-chain">
                                {pathWithNames.map((hub, index) => (
                                    <React.Fragment key={hub.id}>
                                        <div className="path-hub">
                                            <Badge
                                                variant={
                                                    index === 0 ? "default" :
                                                        index === pathWithNames.length - 1 ? "secondary" :
                                                            "outline"
                                                }
                                                className="path-badge"
                                            >
                                                {hub.name}
                                            </Badge>
                                            <div className="path-hub-id">{hub.id}</div>
                                        </div>
                                        {index < pathWithNames.length - 1 && (
                                            <ArrowRight className="path-arrow" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <div className="path-summary">
                            <p className="text-sm text-muted-foreground">
                                <strong>Path:</strong> {pathWithNames.map(h => h.id).join(' → ')}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                <strong>Route:</strong> {pathWithNames.map(h => h.name).join(' → ')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Network Statistics */}
            {hubs.length > 0 && (
                <Card className="pathfinder-card">
                    <CardHeader>
                        <CardTitle className="text-sm">Network Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Total Hubs:</span>
                                <span className="ml-2 font-medium">{hubs.length}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Connected Hubs:</span>
                                <span className="ml-2 font-medium">
                                    {hubs.filter(h => h.connectedHubs?.length > 0).length}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Isolated Hubs:</span>
                                <span className="ml-2 font-medium">
                                    {hubs.filter(h => !h.connectedHubs || h.connectedHubs.length === 0).length}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Network Status:</span>
                                <Badge
                                    variant={networkConnected ? "default" : "destructive"}
                                    className="ml-2"
                                >
                                    {networkConnected ? "Connected" : "Fragmented"}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <style>{`
        .pathfinder-card {
          border: 1px solid hsl(var(--border));
          background: white;
          box-shadow: var(--shadow-network);
        }
        
        .path-result {
          border-color: hsl(var(--hub-accent));
          background: hsl(var(--hub-accent) / 0.02);
        }
        
        .metric {
          text-align: center;
          padding: 16px;
          background: hsl(var(--muted) / 0.5);
          border-radius: 8px;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: hsl(var(--hub-primary));
        }
        
        .metric-label {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
          margin-top: 4px;
        }
        
        .path-chain {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .path-hub {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .path-badge {
          font-weight: 600;
        }
        
        .path-hub-id {
          font-size: 10px;
          color: hsl(var(--muted-foreground));
        }
        
        .path-arrow {
          color: hsl(var(--hub-accent));
          height: 16px;
          width: 16px;
        }
        
        .path-summary {
          padding: 12px;
          background: hsl(var(--muted) / 0.3);
          border-radius: 6px;
          border-left: 3px solid hsl(var(--hub-accent));
        }
      `}</style>
        </div>
    );
};

export default PathFinder;