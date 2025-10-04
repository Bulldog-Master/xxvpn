import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Vote, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle 
} from 'lucide-react';
import { useDAO } from '@/hooks/useDAO';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const DAOGovernance = () => {
  const { proposals, loading, createProposal, vote } = useDAO();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 'pricing' as const,
  });

  const handleCreateProposal = async () => {
    if (!newProposal.title || !newProposal.description) return;

    try {
      await createProposal(
        newProposal.title,
        newProposal.description,
        newProposal.type
      );
      setCreateDialogOpen(false);
      setNewProposal({ title: '', description: '', type: 'pricing' });
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  const handleVote = async (proposalId: string, support: 'for' | 'against' | 'abstain') => {
    // In production, this would check user's DAO token balance
    const votingPower = 1000; // Mock 1000 DAO tokens
    await vote(proposalId, support, votingPower);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>;
      case 'passed':
        return <Badge className="bg-success/20 text-success border-success/30">Passed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'executed':
        return <Badge variant="outline">Executed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (votesFor: number, votesAgainst: number, quorum: number) => {
    const totalVotes = votesFor + votesAgainst;
    return (totalVotes / quorum) * 100;
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading governance data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>VPN Service DAO</CardTitle>
              <CardDescription>
                Community governance for xxVPN service decisions and treasury
              </CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Vote className="w-4 h-4 mr-2" />
                  Create Proposal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create VPN Service Proposal</DialogTitle>
                  <DialogDescription>
                    Propose changes to xxVPN service. Community votes with DAO tokens.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                      placeholder="Proposal title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newProposal.type}
                      onValueChange={(value: any) => setNewProposal({ ...newProposal, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pricing">Pricing & Subscription</SelectItem>
                        <SelectItem value="feature">New Feature</SelectItem>
                        <SelectItem value="treasury">Treasury Allocation</SelectItem>
                        <SelectItem value="server">Server Selection</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProposal.description}
                      onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                      placeholder="Detailed description of the proposal..."
                      rows={6}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleCreateProposal}
                    disabled={!newProposal.title || !newProposal.description}
                  >
                    Submit Proposal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <Card className="glass-effect">
          <CardContent className="p-12 text-center">
            <Vote className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Active Proposals</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to create a governance proposal for the community
            </p>
          </CardContent>
        </Card>
      ) : (
        proposals.map((proposal) => {
          const progress = calculateProgress(
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.quorum
          );
          const timeLeft = proposal.endTime - Date.now();
          const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

          return (
            <Card key={proposal.id} className="glass-effect">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(proposal.status)}
                      <Badge variant="outline" className="text-xs">
                        {proposal.proposalType}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mb-2">{proposal.title}</CardTitle>
                    <CardDescription>{proposal.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Voting Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quorum Progress</span>
                    <span className="font-medium">
                      {Math.min(100, progress).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(100, progress)} className="h-2" />
                   <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {(proposal.votesFor + proposal.votesAgainst).toLocaleString()} / {proposal.quorum.toLocaleString()} DAO tokens
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{daysLeft} days left</span>
                    </div>
                  </div>
                </div>

                {/* Vote Results */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">For</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {proposal.votesFor.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-xs font-medium text-destructive">Against</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {proposal.votesAgainst.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Abstain</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {proposal.votesAbstain.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Voting Buttons */}
                {proposal.status === 'active' && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1 bg-success hover:bg-success/90"
                      onClick={() => handleVote(proposal.id, 'for')}
                    >
                      Vote For
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleVote(proposal.id, 'against')}
                    >
                      Vote Against
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleVote(proposal.id, 'abstain')}
                    >
                      Abstain
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};
