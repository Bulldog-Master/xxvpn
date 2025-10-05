import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Lock, HelpCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FAQ() {
  const navigate = useNavigate();

  const faqs = [
    {
      category: 'Getting Started',
      icon: Zap,
      questions: [
        {
          q: 'What is quantum-resistant VPN?',
          a: 'Our VPN uses xx network\'s cMixx protocol, which provides post-quantum cryptography that protects your data even against future quantum computers. Unlike traditional VPNs that only encrypt data, we also shred metadata through a decentralized mixnet.',
        },
        {
          q: 'How do I join the beta?',
          a: 'Click "Join Beta" on the homepage or visit /beta to sign up for our waitlist. We\'re accepting the first 100 users in small batches to ensure quality experience.',
        },
        {
          q: 'What do I need to get started?',
          a: 'You\'ll need: (1) An account on our platform, (2) Either xx network wallet or MetaMask, (3) XX tokens to pay for your subscription. Beta users get 30 days free!',
        },
        {
          q: 'Which wallet should I use?',
          a: 'We recommend the xx network native wallet for best security (quantum-resistant). However, MetaMask also works if you\'re already familiar with it.',
        },
      ],
    },
    {
      category: 'VPN Modes',
      icon: Shield,
      questions: [
        {
          q: 'What\'s the difference between Ultra-Secure and Ultra-Fast modes?',
          a: 'Ultra-Secure uses xx network\'s cMixx for quantum-resistant P2P encryption with metadata shredding (500ms-2s latency). Ultra-Fast provides direct connections with minimal latency. Secure mode (traditional VPN) is coming soon based on demand.',
        },
        {
          q: 'Why is Ultra-Secure mode slower?',
          a: 'The extra 500ms-2s is the cost of routing through the mixnet for quantum resistance and metadata protection. Each packet goes through multiple nodes to prevent traffic analysis.',
        },
        {
          q: 'Which mode should I use?',
          a: 'Use Ultra-Secure for maximum privacy and quantum resistance (browsing, messaging). Use Ultra-Fast for streaming, gaming, or when speed is critical.',
        },
        {
          q: 'What is metadata shredding?',
          a: 'Traditional VPNs hide what you\'re doing, but not when or how much. cMixx mixes your traffic with others, making it impossible to analyze patterns even if encrypted data is compromised.',
        },
      ],
    },
    {
      category: 'Payments & Subscriptions',
      icon: Lock,
      questions: [
        {
          q: 'Why use XX tokens instead of credit cards?',
          a: 'XX tokens provide true financial privacy - no credit card companies tracking your VPN usage. It also aligns with our decentralized, privacy-first philosophy.',
        },
        {
          q: 'Where do I get XX tokens?',
          a: 'XX tokens can be purchased on exchanges like CoinList, KuCoin, or directly from xx.network. You can also earn them through the xx network ecosystem.',
        },
        {
          q: 'How much does it cost?',
          a: 'Pricing is 5 XX tokens per month. Beta users get: 30-day free trial + lifetime 20% discount (4 XX/month). Bulk discounts: 6 months (5% off), 12 months (10% off).',
        },
        {
          q: 'Can I cancel anytime?',
          a: 'Yes! Subscriptions are on-chain, so you control them. Simply don\'t renew when your period ends. No hidden fees or cancellation penalties.',
        },
        {
          q: 'What happens if I run out of XX tokens?',
          a: 'You\'ll receive a notification 7 days before expiry. Your VPN will continue working until subscription ends, then you can top up and renew.',
        },
      ],
    },
    {
      category: 'Technical',
      icon: HelpCircle,
      questions: [
        {
          q: 'What is the xx network?',
          a: 'xx network is a blockchain platform designed by David Chaum (inventor of digital cash) with quantum-resistant cryptography and a mixnet for metadata protection. It has 850+ nodes globally.',
        },
        {
          q: 'Is my data really quantum-safe?',
          a: 'Yes. The cMixx protocol uses post-quantum cryptographic algorithms that are resistant to attacks from both classical and quantum computers, unlike RSA/ECC used in traditional VPNs.',
        },
        {
          q: 'What data do you log?',
          a: 'We log minimal data for service functionality: connection timestamps, data usage (not content), and error logs. We NEVER log: browsing history, DNS queries, IP addresses (hashed only), or traffic content.',
        },
        {
          q: 'Does this work on mobile?',
          a: 'Currently browser-based (desktop & mobile browsers). Native mobile apps for iOS/Android are planned for Q2 2025 based on beta feedback.',
        },
        {
          q: 'What browsers are supported?',
          a: 'Chrome, Firefox, Edge, Safari, and Brave are all supported. The WASM module works in any modern browser with WebAssembly support.',
        },
        {
          q: 'Can I use this in my country?',
          a: 'The xx network is decentralized with 850+ nodes globally. VPN legality varies by country - please check your local laws. We don\'t recommend using VPNs where they\'re illegal.',
        },
      ],
    },
    {
      category: 'Beta Program',
      icon: Zap,
      questions: [
        {
          q: 'What are the beta perks?',
          a: 'Beta users get: (1) 30-day free trial, (2) Lifetime 20% discount, (3) Direct access to dev team, (4) Influence product roadmap, (5) Early adopter recognition.',
        },
        {
          q: 'How long is the beta?',
          a: 'The beta runs for approximately 6-8 weeks. We\'ll onboard in batches: 10 users week 1, 20 more week 2, then scale to 100 total.',
        },
        {
          q: 'What if I find a bug?',
          a: 'Please report it! We have a dedicated support channel and error tracking. Critical bugs get top priority, and we appreciate detailed reports.',
        },
        {
          q: 'Will my subscription carry over after beta?',
          a: 'Yes! Your on-chain subscription and lifetime 20% discount remain. We\'ll migrate everything seamlessly to production.',
        },
      ],
    },
    {
      category: 'Troubleshooting',
      icon: HelpCircle,
      questions: [
        {
          q: 'My wallet won\'t connect. What do I do?',
          a: 'Make sure you\'re on xxChain network. Check that your wallet extension is updated. Try refreshing the page. If issues persist, contact support with your browser console errors.',
        },
        {
          q: 'Ultra-Secure mode is very slow. Is this normal?',
          a: 'Some latency (500ms-2s) is expected for quantum security. If it\'s >5s, check: (1) xx network health status, (2) your internet connection, (3) browser console for WASM errors.',
        },
        {
          q: 'I can\'t make a payment. Help!',
          a: 'Common issues: (1) Not enough XX tokens, (2) Wrong network (must be xxChain), (3) Insufficient gas fees. Check your wallet balance and network.',
        },
        {
          q: 'How do I contact support?',
          a: 'Email: support@[yourdomain].com or join our Discord/Telegram community for real-time help. Include your wallet address (last 4 chars) and error messages.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-2">
            Help Center
          </Badge>
          <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about quantum-secure VPN
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="glass-effect border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Join the Beta</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get 30 days free + lifetime 20% discount
                  </p>
                  <Button onClick={() => navigate('/beta')} size="sm" className="gap-2">
                    Sign Up Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">xx Network Docs</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn more about the technology
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://xxnetwork.wiki', '_blank')}
                    className="gap-2"
                  >
                    Visit Docs
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Sections */}
        {faqs.map((section, idx) => (
          <Card key={idx} className="glass-effect">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{section.category}</CardTitle>
                  <CardDescription>{section.questions.length} questions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((item, qIdx) => (
                  <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                    <AccordionTrigger className="text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}

        {/* Still Need Help */}
        <Card className="glass-effect border-primary/20 bg-primary/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Our team is here to help during the beta
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline">
                Email Support
              </Button>
              <Button variant="outline">
                Join Discord
              </Button>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
