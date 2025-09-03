import React, { useState, useEffect } from 'react';
import { Button } from '@/components/pure/Button';
import { Input } from '@/components/pure/Input';
import { Label } from '@/components/pure/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/pure/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/pure/Select.jsx"
import { Badge } from '@/components/pure/Badge';
import { Plus, Link, Network, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/pure/Toast';
import { hubService } from '../services/hubService';

const HubManagement = ({
                           hubs,
                           onHubsUpdate,
                       }) => {
    const [newHubId, setNewHubId] = useState('');
    const [newHubName, setNewHubName] = useState('');
    const [connectionHub1, setConnectionHub1] = useState('');
    const [connectionHub2, setConnectionHub2] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { toast } = useToast();

    // Load hubs on component mount
    useEffect(() => {
        loadHubs();
    }, []);

    const loadHubs = async () => {
        setIsRefreshing(true);
        try {
            const Data = await hubService.getAllHubs();
            onHubsUpdate(Data.hubs);
        } catch (error) {
            toast({
                title: "Failed to Load Hubs",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleAddHub = async () => {
        if (!newHubId.trim() || !newHubName.trim()) {
            toast({
                title: "Missing Information",
                description: "Please provide both Hub ID and Name",
                variant: "destructive",
            });
            return;
        }

        if (hubs.some(hub => hub.id === newHubId)) {
            toast({
                title: "Duplicate Hub ID",
                description: "A hub with this ID already exists",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const newHub = await hubService.createHub({
                id: newHubId,
                name: newHubName,
            });

            await loadHubs();

            setNewHubId('');
            setNewHubName('');

            toast({
                title: "Hub Added Successfully",
                description: `Hub "${newHubName}" has been added to the network`,
            });
        } catch (error) {
            toast({
                title: "Failed to Add Hub",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnectHubs = async () => {
        if (!connectionHub1 || !connectionHub2) {
            toast({
                title: "Missing Selection",
                description: "Please select both hubs to connect",
                variant: "destructive",
            });
            return;
        }

        if (connectionHub1 === connectionHub2) {
            toast({
                title: "Invalid Connection",
                description: "Cannot connect a hub to itself",
                variant: "destructive",
            });
            return;
        }

        const sourceHubId = hubs.find(h => h.id === connectionHub1);
        const targetHubId = hubs.find(h => h.id === connectionHub2);

        if (sourceHubId?.connectedHubs?.includes(connectionHub2)) {
            toast({
                title: "Already Connected",
                description: "These hubs are already connected",
                variant: "destructive",
            });
            return;
        }

        setIsConnecting(true);
        try {
            await hubService.connectHubs(connectionHub1, connectionHub2);
            await loadHubs();

            // Clear the selections after successful connection
            setConnectionHub1('');
            setConnectionHub2('');

            toast({
                title: "Hubs Connected Successfully",
                description: `${sourceHubId?.name} and ${targetHubId?.name} are now connected`,
            });
        } catch (error) {
            toast({
                title: "Failed to Connect Hubs",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnectHubs = async (hubId1, hubId2) => {
        try {
            await hubService.disconnectHubs(hubId1, hubId2);
            await loadHubs();

            toast({
                title: "Hubs Disconnected",
                description: "The connection has been removed",
            });
        } catch (error) {
            toast({
                title: "Failed to Disconnect Hubs",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Hub Management</h2>
                <Button
                    onClick={loadHubs}
                    variant="outline"
                    size="sm"
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                </Button>
            </div>
            <Card className="hub-management-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add New Hub
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hub-id">Hub ID</Label>
                            <Input
                                id="hub-id"
                                placeholder="e.g., HUB001"
                                value={newHubId}
                                onChange={(e) => setNewHubId(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hub-name">Hub Name</Label>
                            <Input
                                id="hub-name"
                                placeholder="e.g., Central Station"
                                value={newHubName}
                                onChange={(e) => setNewHubName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleAddHub}
                        className="w-full"
                        variant="default"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? 'Adding Hub...' : 'Add Hub'}
                    </Button>
                </CardContent>
            </Card>

            {/* Connect Hubs Section */}
            <Card className="hub-management-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link className="h-5 w-5" />
                        Connect Hubs
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Hub</Label>
                            <Select
                                value={connectionHub1}
                                onValueChange={setConnectionHub1}
                                disabled={isConnecting || hubs.length < 2}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select first hub" />
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
                            <Label>Second Hub</Label>
                            <Select
                                value={connectionHub2}
                                onValueChange={setConnectionHub2}
                                disabled={isConnecting || hubs.length < 2}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select second hub" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hubs.filter(hub => hub.id !== connectionHub1).map(hub => (
                                        <SelectItem key={hub.id} value={hub.id}>
                                            {hub.name} ({hub.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button
                        onClick={handleConnectHubs}
                        className="w-full"
                        variant="secondary"
                        disabled={hubs.length < 2 || isConnecting}
                    >
                        {isConnecting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Link className="h-4 w-4 mr-2" />
                        )}
                        {isConnecting ? 'Connecting...' : 'Connect Hubs'}
                    </Button>
                </CardContent>
            </Card>

            {/* Existing Hubs List */}
            <Card className="hub-management-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Network Overview ({hubs.length} hubs)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {hubs.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            {isRefreshing ? "Loading hubs..." : "No hubs in the network yet. Add your first hub above."}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {hubs.map(hub => (
                                <div key={hub.id} className="hub-item">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">{hub.name}</h4>
                                            <p className="text-sm text-muted-foreground">ID: {hub.id}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                {hub.connectedHubs?.length || 0} connections
                                            </Badge>
                                            <Badge
                                                variant={
                                                    (hub.connectedHubs?.length || 0) === 0 ? "destructive" :
                                                        (hub.connectedHubs?.length || 0) === 1 ? "secondary" : "default"
                                                }
                                                className="text-xs"
                                            >
                                                {(hub.connectedHubs?.length || 0) === 0 ? 'Isolated' :
                                                    (hub.connectedHubs?.length || 0) === 1 ? 'Endpoint' : 'Hub'}
                                            </Badge>
                                        </div>
                                    </div>
                                    {hub.connectedHubs?.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-xs text-muted-foreground mb-1">Connected to:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {hub.connectedHubs.map(connectedId => {
                                                    const connectedHub = hubs.find(h => h.id === connectedId);
                                                    return (
                                                        <span key={connectedId} onClick={() => handleDisconnectHubs(hub.id, connectedId)}>
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-800"
                                                                title="Click to disconnect"
                                                            >
                                                                {connectedHub?.name || connectedId} ×
                                                            </Badge>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 italic">
                                                Click on connection badges to disconnect
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <style>{`
        .hub-management-card {
          border: 1px solid hsl(var(--border));
          background: white;
          box-shadow: var(--shadow-network);
        }
        
        .hub-item {
          padding: 12px;
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          background: hsl(var(--card));
          transition: all 0.2s ease;
        }
        
        .hub-item:hover {
          border-color: hsl(var(--hub-secondary));
          transform: translateY(-1px);
          box-shadow: 0 4px 12px -4px hsl(var(--hub-primary) / 0.2);
        }
      `}</style>
        </div>
    );
};

export default HubManagement;