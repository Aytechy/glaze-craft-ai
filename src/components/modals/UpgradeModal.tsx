import React from 'react';
import { Crown, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        '10 messages per day',
        'Basic pottery guidance',
        'Standard response time',
        'Community support',
      ],
      limitations: [
        'Limited daily usage',
        'No priority support',
        'No advanced features',
      ],
      current: true,
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'For serious pottery enthusiasts',
      features: [
        'Unlimited messages',
        'Advanced glaze recipes',
        'Priority response time',
        'Image analysis',
        'Firing schedule optimization',
        'Expert techniques',
        'Priority support',
        'Export chat history',
      ],
      popular: true,
    },
    {
      name: 'Studio',
      price: '$49',
      period: '/month',
      description: 'For professional studios',
      features: [
        'Everything in Pro',
        'Multiple user accounts',
        'Team collaboration',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
        'Training sessions',
      ],
    },
  ];

  const handleUpgrade = (planName: string) => {
    // In production, this would integrate with payment processing
    // TODO: Integrate with payment processing
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-primary" />
            Choose Your Plan
          </DialogTitle>
          <DialogDescription>
            Unlock the full potential of GlazeAI with our premium features
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? 'border-primary shadow-moderate'
                  : plan.current
                  ? 'border-accent'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations?.map((limitation) => (
                    <div key={limitation} className="flex items-center gap-2">
                      <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'gradient-primary text-primary-foreground'
                      : plan.current
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-accent/20 rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            All plans include a 14-day free trial. Cancel anytime.
            <br />
            Questions? Contact us at support@glazeai.com
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};