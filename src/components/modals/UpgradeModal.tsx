import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Crown, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
  
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  // Render to document body to ensure it's on top
  const modalContent = (
    <>
      <style>{`
        .upgrade-modal-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 999999 !important;
          background: hsl(var(--background) / 0.95) !important;
          backdrop-filter: blur(8px) !important;
          pointer-events: auto !important;
        }
      `}</style>
      <div className="upgrade-modal-overlay">
        {/* Close button - top right */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="h-full w-full overflow-y-auto sm:overflow-y-hidden">
          <div className="container mx-auto px-4 py-8 max-w-6xl min-h-full flex flex-col justify-center">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Choose Your Plan</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Unlock the full potential of GlazeAI with our premium features
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative ${
                    plan.popular
                      ? 'border-primary shadow-moderate scale-105'
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

            {/* Footer info */}
            <div className="text-center p-6 bg-accent/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                All plans include a 14-day free trial. Cancel anytime.
                <br />
                Questions? Contact us at support@glazion.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};