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

  // Modal content with proper viewport handling
  const modalContent = (
    <div className="fixed inset-0 z-[999999] bg-background/95 backdrop-blur-sm overflow-hidden">
      {/* Close button - Fixed position */}
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

      {/* Scrollable content container */}
      <div className="h-full w-full overflow-y-auto overscroll-contain">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl min-h-full">
          {/* Header - Responsive */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold">Choose Your Plan</h1>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground">
              Unlock the full potential of GlazeAI with our premium features
            </p>
          </div>

          {/* Plans Grid - Responsive layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? 'border-primary shadow-moderate lg:scale-105'
                    : plan.current
                    ? 'border-accent'
                    : 'border-border'
                } ${plan.popular ? 'order-first lg:order-none' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <CardHeader className="text-center p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-3 sm:mt-4">
                    <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm leading-tight">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations?.map((limitation) => (
                      <div key={limitation} className="flex items-start gap-2">
                        <X className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-muted-foreground leading-tight">{limitation}</span>
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
                    size="sm"
                  >
                    {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer info - Responsive */}
          <div className="text-center p-4 sm:p-6 bg-accent/20 rounded-lg max-w-4xl mx-auto">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              All plans include a 14-day free trial. Cancel anytime.
              <br className="hidden sm:block" />
              <span className="sm:inline block mt-1 sm:mt-0">
                Questions? Contact us at support@glazion.com
              </span>
            </p>
          </div>

          {/* Extra padding for mobile bottom spacing */}
          <div className="h-4 sm:h-0" />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};