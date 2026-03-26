import './Pricing.css'

function Pricing() {
  const plans = [
    {
      id: 1,
      name: 'Basic',
      tagline: 'For Individuals',
      price: '₹0',
      period: 'Free forever',
      description: 'Free for everyone',
      buttonText: 'Get Started',
      highlighted: false,
      features: [
        'Create unlimited groups',
        'Track expenses easily',
        'Split bills with friends',
        'Email notifications',
        'Basic expense reports',
        'Mobile app access',
        'Up to 5 groups',
        'Monthly transaction limit'
      ]
    },
    {
      id: 2,
      name: 'Pro',
      tagline: 'For Regular Users',
      price: '₹1',
      period: 'Per month',
      originalPrice: '₹199/year',
      description: 'Billed monthly',
      buttonText: 'Get Started',
      highlighted: true,
      badgeText: 'Most Popular',
      features: [
        'Everything in Basic, plus:',
        'Unlimited groups',
        'Advanced analytics',
        'Transaction categories',
        'Recurring expenses',
        'Custom currency support',
        'Priority support',
        'Export to CSV/PDF',
        'No transaction limits'
      ]
    },
    {
      id: 3,
      name: 'Enterprise',
      tagline: 'For Teams',
      price: 'Custom',
      period: 'Contact us',
      description: 'Billed annually',
      buttonText: 'Contact Sales',
      highlighted: false,
      features: [
        'Everything in Pro, plus:',
        'Team management',
        'Advanced permissions',
        'Audit logs',
        'API access',
        'Dedicated support',
        'Custom integrations',
        '24/7 Priority support',
        'SLA guarantee'
      ]
    }
  ]

  return (
    <div className="pricing-section">
      <div className="pricing-header">
        <p className="pricing-label">Explore plans</p>
        <h2 className="pricing-main-title">Simple, Transparent Pricing</h2>
        <p className="pricing-subtitle">Choose the plan that fits your commute style</p>
      </div>

      <div className="pricing-cards-container">
        {plans.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}>
            {plan.badgeText && (
              <div className="popular-badge">{plan.badgeText}</div>
            )}
            
            <div className="plan-icon">🎯</div>
            
            <h3 className="plan-name">{plan.name}</h3>
            <p className="plan-tagline">{plan.tagline}</p>

            <div className="price-section">
              <div className="price-main">{plan.price}</div>
              <div className="price-period">{plan.period}</div>
              {plan.originalPrice && (
                <div className="original-price">{plan.originalPrice}</div>
              )}
            </div>

            <p className="billing-text">{plan.description}</p>

            <button className={`plan-button ${plan.highlighted ? 'primary' : 'secondary'}`}>
              {plan.buttonText}
            </button>

            <div className="features-list">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <p>All plans include 30-day free trial. No credit card required.</p>
      </div>
    </div>
  )
}

export default Pricing
