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
  AlertCircle,
  Plus
} from 'lucide-react';
import { useDAO } from '@/hooks/useDAO';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/numberFormat';

// Input validation schemas for DAO proposals
const proposalSchema = z.object({
  title: z.string()
    .trim()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(200, { message: "Title must be less than 200 characters" }),
  description: z.string()
    .trim()
    .min(20, { message: "Description must be at least 20 characters" })
    .max(2000, { message: "Description must be less than 2000 characters" }),
  type: z.string().min(1, { message: "Proposal type is required" }),
});

export const DAOGovernance = () => {
  const { t, i18n } = useTranslation();
  const { proposals, loading, createProposal, vote } = useDAO();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 'pricing' as const,
  });

  const handleCreateProposal = async () => {
    // Validate inputs using Zod
    try {
      const validatedData = proposalSchema.parse(newProposal);
      
      await createProposal(
        validatedData.title,
        validatedData.description,
        validatedData.type
      );
      setCreateDialogOpen(false);
      setNewProposal({ title: '', description: '', type: 'pricing' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Failed to create proposal:', error);
        toast.error('Failed to create proposal');
      }
    }
  };

  const handleVote = async (proposalId: string, support: 'for' | 'against' | 'abstain') => {
    // Voting power is now validated server-side based on XX Coin balance
    await vote(proposalId, support);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary/20 text-primary border-primary/30">{t('dao.status.active')}</Badge>;
      case 'passed':
        return <Badge className="bg-success/20 text-success border-success/30">{t('dao.status.passed')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('dao.status.rejected')}</Badge>;
      case 'executed':
        return <Badge variant="outline">{t('dao.status.executed')}</Badge>;
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
          <p className="text-center text-muted-foreground">{t('dao.loadingGovernance')}</p>
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
              <CardTitle>{t('dao.title')}</CardTitle>
              <CardDescription>
                {t('dao.description')}
              </CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Vote className="w-4 h-4 mr-2" />
                  {t('dao.createProposal')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('dao.createServiceProposal')}</DialogTitle>
                  <DialogDescription>
                    {t('dao.proposeChanges')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="title">{t('dao.title2')}</Label>
                    <Input
                      id="title"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                      placeholder={t('dao.proposalTitlePlaceholder')}
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">{t('dao.type')}</Label>
                    <Select
                      value={newProposal.type}
                      onValueChange={(value: any) => setNewProposal({ ...newProposal, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pricing">{t('dao.proposalTypes.pricing')}</SelectItem>
                        <SelectItem value="feature">{t('dao.proposalTypes.feature')}</SelectItem>
                        <SelectItem value="treasury">{t('dao.proposalTypes.treasury')}</SelectItem>
                        <SelectItem value="server">{t('dao.proposalTypes.server')}</SelectItem>
                        <SelectItem value="partnership">{t('dao.proposalTypes.partnership')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">{t('dao.proposalDescription')}</Label>
                    <Textarea
                      id="description"
                      value={newProposal.description}
                      onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                      placeholder={t('dao.detailedDescription')}
                      rows={6}
                      maxLength={2000}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleCreateProposal}
                    disabled={!newProposal.title || !newProposal.description}
                  >
                    {t('dao.submitProposal')}
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
            <h3 className="font-semibold mb-2">{t('dao.noProposals')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('dao.beFirst')}
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
                    <span className="text-muted-foreground">{t('dao.voting.quorumProgress')}</span>
                    <span className="font-medium">
                      {formatNumber(Math.min(100, progress), i18n.language, 1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(100, progress)} className="h-2" />
                   <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {(proposal.votesFor + proposal.votesAgainst).toLocaleString()} / {proposal.quorum.toLocaleString()} {t('common.daoTokens')}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{daysLeft} {t('common.daysLeft')}</span>
                    </div>
                  </div>
                </div>

                {/* Vote Results */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">{t('dao.voting.for')}</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {proposal.votesFor.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-xs font-medium text-destructive">{t('dao.voting.against')}</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {proposal.votesAgainst.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{t('dao.voting.abstain')}</span>
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
                      {t('dao.voting.voteFor')}
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleVote(proposal.id, 'against')}
                    >
                      {t('dao.voting.voteAgainst')}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleVote(proposal.id, 'abstain')}
                    >
                      {t('dao.voting.abstain')}
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
