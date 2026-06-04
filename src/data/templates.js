export const UX_TEMPLATES = [
  {
    id: 'website-usability',
    name: 'Website Usability Testing',
    description: 'Assess how easily users can navigate and perform key tasks on your website or landing page.',
    objective: 'Identify navigation friction, evaluate layout clarity, and uncover usability issues on key user flows.',
    participantCriteria: 'Desktop users who have purchased online in the last 30 days.',
    duration: 20,
    rewardAmount: 15,
    category: 'UX Research',
    testType: 'usability',
    questions: [
      {
        question_text: 'What was your first impression of the homepage layout and messaging?',
        question_type: 'open_text',
        options: [],
        required: true
      },
      {
        question_text: 'Were you able to find the product search and checkout button easily?',
        question_type: 'yes_no',
        options: [],
        required: true
      },
      {
        question_text: 'Rate the ease of navigating through the main menu (1 = Very Hard, 5 = Very Easy).',
        question_type: 'rating',
        options: [],
        required: true
      },
      {
        question_text: 'What, if anything, was confusing or difficult about completing the task?',
        question_type: 'open_text',
        options: [],
        required: false
      }
    ]
  },
  {
    id: 'mobile-app-feedback',
    name: 'Mobile App Feedback',
    description: 'Gather insights on user interactions, gestures, and layout responsiveness within a mobile application.',
    objective: 'Evaluate gesture intuitive-ness, visual layout, and mobile-specific flow satisfaction.',
    participantCriteria: 'iOS or Android mobile users aged 18-35.',
    duration: 15,
    rewardAmount: 12,
    category: 'Product Research',
    testType: 'unmoderated',
    questions: [
      {
        question_text: 'How easy or difficult was it to complete the onboarding flow?',
        question_type: 'open_text',
        options: [],
        required: true
      },
      {
        question_text: 'Did you experience any lag or styling bugs during the session?',
        question_type: 'yes_no',
        options: [],
        required: true
      },
      {
        question_text: 'Which feature in the mobile app did you find most useful?',
        question_type: 'open_text',
        options: [],
        required: true
      }
    ]
  },
  {
    id: 'concept-validation',
    name: 'Product Concept Validation',
    description: 'Present a new product concept mockup or landing page design to assess interest and utility.',
    objective: 'Validate user demand, value proposition clarity, and initial interest level before coding.',
    participantCriteria: 'Product Managers, Tech Startup founders, or UX Designers.',
    duration: 10,
    rewardAmount: 10,
    category: 'Product Research',
    testType: 'first_impression',
    questions: [
      {
        question_text: 'In your own words, what does this product concept do?',
        question_type: 'open_text',
        options: [],
        required: true
      },
      {
        question_text: 'Would you pay for a product like this to solve your daily problems?',
        question_type: 'yes_no',
        options: [],
        required: true
      },
      {
        question_text: 'What is the single most appealing feature of this concept?',
        question_type: 'open_text',
        options: [],
        required: true
      }
    ]
  },
  {
    id: 'user-interview',
    name: 'User Interview Study',
    description: 'Conduct live 1-on-1 interviews with target users to explore behavior, needs, and pain points.',
    objective: 'Deep dive into user workflows, motivations, frustrations, and professional tools.',
    participantCriteria: 'Active remote workers who use project management tools daily.',
    duration: 45,
    rewardAmount: 30,
    category: 'User Interviews',
    testType: 'moderated',
    questions: [
      {
        question_text: 'Walk me through your daily workflow for managing team tasks.',
        question_type: 'open_text',
        options: [],
        required: true
      },
      {
        question_text: 'What is the biggest bottleneck in your current software tools?',
        question_type: 'open_text',
        options: [],
        required: true
      },
      {
        question_text: 'How do you currently collaborate with external clients?',
        question_type: 'open_text',
        options: [],
        required: true
      }
    ]
  },
  {
    id: 'customer-satisfaction',
    name: 'Customer Satisfaction Survey',
    description: 'Measure customer happiness, Net Promoter Score (NPS), and request suggestions.',
    objective: 'Gather quantitative satisfaction ratings and qualitative improvement suggestions.',
    participantCriteria: 'Existing customers with at least 1 month of active usage.',
    duration: 5,
    rewardAmount: 5,
    category: 'Surveys',
    testType: 'survey',
    questions: [
      {
        question_text: 'On a scale of 0-10, how likely are you to recommend us to a colleague?',
        question_type: 'rating',
        options: [],
        required: true
      },
      {
        question_text: 'What is the main reason for your score?',
        question_type: 'open_text',
        options: [],
        required: true
      },
      {
        question_text: 'What one thing could we improve to make your experience better?',
        question_type: 'open_text',
        options: [],
        required: false
      }
    ]
  },
  {
    id: 'recruitment-screening',
    name: 'Recruitment Screening Study',
    description: 'Qualify participants for a larger study by filtering based on custom criteria.',
    objective: 'Filter out unqualified participants and recruit prime candidates for moderated studies.',
    participantCriteria: 'Anyone interested in participating in upcoming studies.',
    duration: 5,
    rewardAmount: 5,
    category: 'Recruitment',
    testType: 'survey',
    questions: [
      {
        question_text: 'Which of the following programming languages do you use professionally?',
        question_type: 'mcq',
        options: ['JavaScript/TypeScript', 'Python', 'Go', 'Rust', 'Java', 'Other'],
        required: true
      },
      {
        question_text: 'How many hours per week do you spend coding on average?',
        question_type: 'mcq',
        options: ['Under 10 hours', '10-25 hours', '25-40 hours', '40+ hours'],
        required: true
      },
      {
        question_text: 'Would you be available for a 30-minute follow-up video interview?',
        question_type: 'yes_no',
        options: [],
        required: true
      }
    ]
  },
  {
    id: 'saas-product-feedback',
    name: 'SaaS Product Feedback',
    description: 'Review the billing dashboard and setting configurations of a SaaS dashboard.',
    objective: 'Uncover settings friction and billing system understanding errors.',
    participantCriteria: 'Small business owners or operations managers.',
    duration: 25,
    rewardAmount: 20,
    category: 'Product Research',
    testType: 'unmoderated',
    questions: [
      {
        question_text: 'Locate the invoices page and download the latest invoice. Was it clear?',
        question_type: 'open_text',
        options: [],
        required: true
      },
      {
        question_text: 'How would you upgrade your plan to the Enterprise tier from the billing screen?',
        question_type: 'open_text',
        options: [],
        required: true
      },
      {
        question_text: 'Did you feel the pricing options were transparently presented?',
        question_type: 'yes_no',
        options: [],
        required: true
      }
    ]
  },
  {
    id: 'ecommerce-testing',
    name: 'E-commerce User Testing',
    description: 'Test prototype cart and checkout flows of a premium shopping website.',
    objective: 'Identify checkout drop-off triggers, address form completion errors, and optimize flow.',
    participantCriteria: 'Frequent online shoppers who purchase clothing or electronics monthly.',
    duration: 15,
    rewardAmount: 12,
    category: 'UX Research',
    testType: 'prototype',
    questions: [
      {
        question_text: 'Try applying the discount code "SAVE20". Did you notice the success feedback?',
        question_type: 'yes_no',
        options: [],
        required: true
      },
      {
        question_text: 'What payment options did you expect that were not present in the checkout?',
        question_type: 'open_text',
        options: [],
        required: true
      },
      {
        question_text: 'Rate your confidence in the security of this checkout process (1 = Low, 5 = High).',
        question_type: 'rating',
        options: [],
        required: true
      }
    ]
  },
  {
    id: 'ai-tool-eval',
    name: 'AI Tool Evaluation',
    description: 'Interactively test an AI chat assistant\'s responsiveness, speed, and accuracy.',
    objective: 'Assess conversational quality, response helpfulness, and prompt navigation.',
    participantCriteria: 'Users who use AI tools like ChatGPT, Claude, or Gemini weekly.',
    duration: 15,
    rewardAmount: 15,
    category: 'Product Research',
    testType: 'ai_interview',
    questions: [
      {
        question_text: 'Ask the AI assistant to plan a 3-day trip to Tokyo. How relevant was the result?',
        question_type: 'open_text',
        options: [],
        required: true
      },
      {
        question_text: 'Did the AI assistant follow all formatting instructions accurately?',
        question_type: 'yes_no',
        options: [],
        required: true
      },
      {
        question_text: 'What is the biggest difference between this tool and your preferred AI assistant?',
        question_type: 'open_text',
        options: [],
        required: true
      }
    ]
  },
  {
    id: 'ux-benchmark',
    name: 'UX Benchmark Study',
    description: 'Systematically measure usability KPIs of your platform over time.',
    objective: 'Establish baseline scores for SUS (System Usability Scale) and Task Success Rate.',
    participantCriteria: 'New users who have never seen or used the platform before.',
    duration: 30,
    rewardAmount: 20,
    category: 'UX Research',
    testType: 'usability',
    questions: [
      {
        question_text: 'I think that I would like to use this system frequently.',
        question_type: 'rating',
        options: [],
        required: true
      },
      {
        question_text: 'I found the system unnecessarily complex.',
        question_type: 'yes_no',
        options: [],
        required: true
      },
      {
        question_text: 'I thought the system was easy to use.',
        question_type: 'yes_no',
        options: [],
        required: true
      },
      {
        question_text: 'I felt very confident using the system.',
        question_type: 'rating',
        options: [],
        required: true
      }
    ]
  }
];
