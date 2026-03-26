import { useState } from 'react'
import './FAQ.css'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      id: 1,
      question: 'What is Spllit and how does it work?',
      answer: 'Spllit is a smart expense splitting app that helps groups manage shared costs. Simply add expenses, assign them to group members, and Spllit calculates who owes whom automatically.'
    },
    {
      id: 2,
      question: 'What should I use Spllit for?',
      answer: 'Spllit is perfect for splitting rent with roommates, sharing trip expenses with friends, managing group project costs, splitting dinner bills, or coordinating any shared expenses.'
    },
    {
      id: 3,
      question: 'How much does it cost to use?',
      answer: 'Spllit is free to start! Our Commuter plan is completely free and includes all basic features. Upgrade to Pro for advanced analytics and unlimited groups.'
    },
    {
      id: 4,
      question: 'Can I use Spllit with a group?',
      answer: 'Yes! Create a group and invite friends or roommates. All group members can add expenses, and Spllit keeps track of who owes whom automatically.'
    },
    {
      id: 5,
      question: 'Is my data secure?',
      answer: 'Absolutely. We use industry-standard encryption to protect your data. Your financial information is never shared with third parties.'
    },
    {
      id: 6,
      question: 'Can I export my expense data?',
      answer: 'Yes, with our Pro plan you can export all your expense data to CSV or PDF formats for record-keeping or accounting purposes.'
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="faq-section">
      <div className="faq-header">
        <h2 className="faq-title">Frequently asked questions</h2>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div key={faq.id} className="faq-item">
            <button
              className="faq-question"
              onClick={() => toggleFAQ(index)}
            >
              <span className="question-text">{faq.question}</span>
              <span className={`toggle-icon ${openIndex === index ? 'open' : ''}`}>
                +
              </span>
            </button>
            
            {openIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQ
