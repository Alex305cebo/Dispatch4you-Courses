// ========================================
// BENEFITS MODAL SYSTEM
// ========================================

const benefitData = {
  practice: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
    title: 'Real Practice',
    subtitle: 'AI simulator for broker negotiations',
    stats: [
      { value: '1,247', label: 'Dialogues practiced' },
      { value: '87%', label: 'Successful deals' },
      { value: '24/7', label: 'AI availability' }
    ],
    features: [
      {
        icon: '🤖',
        title: 'AI Simulator',
        description: 'Interactive dialogues with brokers of varying difficulty and personality'
      },
      {
        icon: '📈',
        title: 'Progress Tracking',
        description: 'Detailed statistics of your results and recommendations'
      },
      {
        icon: '💡',
        title: 'Real Cases',
        description: 'Scenarios based on genuine situations from the industry'
      },
      {
        icon: '📚',
        title: 'Feedback',
        description: 'Instant analysis of your actions and tips for improvement'
      }
    ],
    ctaText: 'Try the AI Simulator',
    ctaLink: 'pages/ai-broker-chat.html'
  },
  mentor: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    title: 'Mentor Support',
    subtitle: 'Consultations with active dispatchers',
    stats: [
      { value: '24/7', label: 'Support' },
      { value: '15+', label: 'Mentors' },
      { value: '<2h', label: 'Response time' }
    ],
    features: [
      {
        icon: '👨‍🏫',
        title: 'Experienced Mentors',
        description: 'Mentors with 3+ years of experience in the US freight industry'
      },
      {
        icon: '💬',
        title: 'One-on-One Consultations',
        description: 'Individual sessions to work through your questions and situations'
      },
      {
        icon: '🎯',
        title: 'Mistake Review',
        description: 'Analysis of your actions and recommendations to improve your skills'
      },
      {
        icon: '🤝',
        title: 'Community',
        description: 'Access to a private chat with other students and mentors'
      }
    ],
    ctaText: 'Contact a Mentor',
    ctaLink: 'contacts.html'
  },
  career: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    title: 'Career Preparation',
    subtitle: 'Help with job placement and growth',
    stats: [
      { value: '85%', label: 'Employed' },
      { value: '30+', label: 'Partners' },
      { value: '$3K+', label: 'Average income' }
    ],
    features: [
      {
        icon: '📝',
        title: 'Resume Building',
        description: 'Help creating a professional resume for the US market'
      },
      {
        icon: '🎤',
        title: 'Interview Preparation',
        description: 'Practice answering common employer questions'
      },
      {
        icon: '🔍',
        title: 'Job Search',
        description: 'Access to a database of vetted companies and current openings'
      },
      {
        icon: '⭐',
        title: 'Recommendations',
        description: 'Receive letters of recommendation from our mentors'
      }
    ],
    ctaText: 'Learn More About Careers',
    ctaLink: 'career.html'
  },
  docs: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    title: 'Complete Documentation',
    subtitle: 'All freight documents with examples',
    stats: [
      { value: '20+', label: 'Document types' },
      { value: '100+', label: 'Examples' },
      { value: '∞', label: 'Lifetime access' }
    ],
    features: [
      {
        icon: '📄',
        title: 'Rate Confirmation',
        description: 'Detailed breakdown of the broker contract and all its clauses'
      },
      {
        icon: '📋',
        title: 'BOL & POD',
        description: 'Bill of Lading and Proof of Delivery with filled-in examples'
      },
      {
        icon: '💰',
        title: 'Invoice & Payment',
        description: 'Invoices, receipts, and documents for freight payment'
      },
      {
        icon: '📊',
        title: 'Carrier Packet',
        description: 'Complete carrier document packet for working with brokers'
      }
    ],
    ctaText: 'View Documents',
    ctaLink: 'pages/docs.html'
  },
  audio: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/></svg>',
    title: 'Audio Learning',
    subtitle: 'All materials in audio format',
    stats: [
      { value: '50+', label: 'Audio lessons' },
      { value: '20h', label: 'Of content' },
      { value: '🎧', label: 'Learn anywhere' }
    ],
    features: [
      {
        icon: '🎙️',
        title: 'Professional Narration',
        description: 'All materials narrated by professional voice artists'
      },
      {
        icon: '📱',
        title: 'Mobile App',
        description: 'Listen to lessons on the road, on a walk, or at the gym'
      },
      {
        icon: '⚡',
        title: 'Playback Speed',
        description: 'Adjust the speed from 0.5x to 2x for your convenience'
      },
      {
        icon: '💾',
        title: 'Offline Access',
        description: 'Download lessons and listen without internet'
      }
    ],
    ctaText: 'Listen to Samples',
    ctaLink: 'pages/documentation.html'
  },
  updates: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/></svg>',
    title: 'Constant Updates',
    subtitle: 'Up-to-date info on rules and trends',
    stats: [
      { value: '2x', label: 'Per month' },
      { value: '100%', label: 'Free' },
      { value: '🔔', label: 'Notifications' }
    ],
    features: [
      {
        icon: '📰',
        title: 'Industry News',
        description: 'Current changes in freight legislation and regulations'
      },
      {
        icon: '📊',
        title: 'Market Trends',
        description: 'Analysis of rates, demand, and supply in the freight market'
      },
      {
        icon: '🎓',
        title: 'New Materials',
        description: 'Regular addition of new lessons and practical cases'
      },
      {
        icon: '🔧',
        title: 'Platform Improvements',
        description: 'Ongoing development of features and new tools'
      }
    ],
    ctaText: 'View Updates',
    ctaLink: 'course.html'
  }
};

function openBenefitModal(benefitType) {
  const modal = document.getElementById('benefitModal');
  const modalContent = document.getElementById('modalContent');
  const data = benefitData[benefitType];

  if (!data) return;

  // Generate stats HTML
  const statsHTML = data.stats.map(stat => `
    <div class="modal-stat">
      <div class="modal-stat-value">${stat.value}</div>
      <div class="modal-stat-label">${stat.label}</div>
    </div>
  `).join('');

  // Generate features HTML
  const featuresHTML = data.features.map(feature => `
    <div class="modal-feature">
      <div class="modal-feature-icon">${feature.icon}</div>
      <div class="modal-feature-content">
        <h4>${feature.title}</h4>
        <p>${feature.description}</p>
      </div>
    </div>
  `).join('');

  // Build modal content
  modalContent.innerHTML = `
    <div class="modal-header">
      <div class="modal-icon">${data.icon}</div>
      <h2 class="modal-title">${data.title}</h2>
      <p class="modal-subtitle">${data.subtitle}</p>
    </div>

    <div class="modal-stats">
      ${statsHTML}
    </div>

    <div class="modal-features">
      ${featuresHTML}
    </div>

    <div class="modal-cta">
      <a href="${data.ctaLink}" class="modal-btn">
        <span>${data.ctaText}</span>
        <span>→</span>
      </a>
    </div>
  `;

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBenefitModal() {
  const modal = document.getElementById('benefitModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeBenefitModal();
  }
});
