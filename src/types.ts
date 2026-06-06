/**
 * Cognitive distortion types used in traditional CBT.
 */
export enum DistortionType {
  CATASTROPHIZING = "Catastrophizing",
  ALL_OR_NOTHING = "All-or-Nothing Thinking",
  MIND_READING = "Mind Reading",
  EMOTIONAL_REASONING = "Emotional Reasoning",
  OVERGENERALIZATION = "Overgeneralization",
  SHOULD_STATEMENTS = "Should Statements",
  PERSONALIZATION = "Personalization",
  FILTERING = "Mental Filtering",
}

export interface DistortionInfo {
  type: DistortionType;
  description: string;
  example: string;
}

export const DISTORTION_INFOS: Record<DistortionType, DistortionInfo> = {
  [DistortionType.CATASTROPHIZING]: {
    type: DistortionType.CATASTROPHIZING,
    description: "Expecting the worst-case scenario to happen, even when it is highly unlikely or unsupported by evidence.",
    example: "'If I am 10 minutes late for the meeting because of this traffic jam, my boss will fire me and my career is ruined.'",
  },
  [DistortionType.ALL_OR_NOTHING]: {
    type: DistortionType.ALL_OR_NOTHING,
    description: "Viewing things in black-and-white categories. If your performance falls short of perfect, you see yourself as a total failure.",
    example: "'Since I missed one day of studying, this whole certification try is a total bust.'",
  },
  [DistortionType.MIND_READING]: {
    type: DistortionType.MIND_READING,
    description: "Arbitrarily concluding that someone is thinking negatively about you, without bothering to check it out or find proof.",
    example: "'The guy on the subway glanced at me and sighed. He must think I look absolutely ridiculous.'",
  },
  [DistortionType.EMOTIONAL_REASONING]: {
    type: DistortionType.EMOTIONAL_REASONING,
    description: "Assuming that your negative emotions reflect the actual reality of the situation.",
    example: "'I feel so incredibly overwhelmed and stupid with this spreadsheet assignment, therefore I must be incompetent.'",
  },
  [DistortionType.OVERGENERALIZATION]: {
    type: DistortionType.OVERGENERALIZATION,
    description: "Viewing a single negative event as a never-ending pattern of defeat.",
    example: "'This train is delayed again. My commutes are always ruined and nothing ever goes right for me.'",
  },
  [DistortionType.SHOULD_STATEMENTS]: {
    type: DistortionType.SHOULD_STATEMENTS,
    description: "Trying to motivate yourself or others with 'shoulds' and 'shouldn'ts,' which leads to guilt, frustration, and resentment.",
    example: "'I should be able to work 12 hours straight without getting distracted or tired.'",
  },
  [DistortionType.PERSONALIZATION]: {
    type: DistortionType.PERSONALIZATION,
    description: "Holding yourself personally responsible for an event that isn't entirely under your control.",
    example: "'My teammate seems stressed out today; it must be because of that comment I made yesterday.'",
  },
  [DistortionType.FILTERING]: {
    type: DistortionType.FILTERING,
    description: "Focusing exclusively on the negative aspects of a situation while dwelling on them and ignoring all positive or neutral aspects.",
    example: "'My presentation went well and I got 5 compliments, but I stumbled on slide 4 so it was a disaster.'",
  },
};

export interface ReframedThought {
  id: string;
  timestamp: string;
  situation: string; // e.g. "Stuck in train", "Looming deadline"
  context: "commute" | "work";
  negativeThought: string;
  distortions: DistortionType[];
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  aiExplanation?: string;
  usefulnessRating?: number; // 1-5 stars
}

export interface CBTLesson {
  id: string;
  title: string;
  shortDesc: string;
  category: "commute" | "work" | "foundation";
  durationMinutes: number;
  steps: {
    title: string;
    content: string;
    prompt?: string; // An option prompt to challenge the user
  }[];
}

export const CBT_LESSONS: CBTLesson[] = [
  {
    id: "intro-cbt",
    title: "CBT Fundamentals",
    shortDesc: "Learn the core connection between thoughts, feelings, and actions.",
    category: "foundation",
    durationMinutes: 5,
    steps: [
      {
        title: "The Cognitive Triad",
        content: "Cognitive Behavioral Therapy (CBT) is based on a simple but powerful truth: our thoughts, feelings, and physical behaviors are interconnected. Often, we believe an external situation (like subways delay or a full inbox) directly causes our anxiety or anger. In reality, it is our interpretation of the event—our 'automatic thoughts'—that triggers how we feel and react.",
      },
      {
        title: "The Power of Automatic Thoughts",
        content: "Automatic thoughts pop into our minds effortlessly. They are quick, evaluative, and feel 100% true. However, when stressful situations occur (like a sudden commute delay or a difficult Slack message), these thoughts can become distorted, irrational, or unhelpful. By learning to notice them, we can test their validity.",
      },
      {
        title: "Identifying Cognitive Distortions",
        content: "Our brains use mental shortcuts, or 'errors in thinking,' when we are tired or stressed. CBT calls these 'cognitive distortions.' Common ones include Catastrophizing ('everything will fail') or Mind Reading ('everybody hates me'). Once you spot these shortcuts, the power they hold over your feelings immediately begins to weaken.",
      },
      {
        title: "Your First Exercise",
        content: "Try writing down one current stressor. It could be something tiny, like a coworker's email tone. Now ask yourself: 'Is my interpretation of this email the only possible explanation, or is my stress coloring my view?' This is the first step toward building a resilient mindset.",
        prompt: "Describe one small thing that stressed you out today. What was your immediate first thought about it?"
      }
    ]
  },
  {
    id: "commute-stress",
    title: "Commuting with Calm",
    shortDesc: "Reframe delays, transit crowd anxiety, and morning rush-hour dread.",
    category: "commute",
    durationMinutes: 4,
    steps: [
      {
        title: "The Transit Pressure Cooker",
        content: "Commuting is a hotbed for stress. We are crammed into confined spaces, dealing with loud environments, and feeling out of control. Our bodies react with high cortisol, while our minds leap to worst-case conclusions like 'This delay will make me fail at my job today.'",
      },
      {
        title: "Separating Fact from Fiction",
        content: "Let's look at the actual facts of a delay. Fact: The train has stopped. Fiction: 'I am irresponsible, I should have known this would happen, and this morning is officially ruined.' Notice how quickly your mind adds guilt and overgeneralizations to a simple physical setback.",
      },
      {
        title: "Reclaiming Your Control",
        content: "In CBT, we focus on what we can control. You cannot control the train schedule, the traffic, or how noisy people are. You CAN control your breathing and your internal dialogue. By accepting reality as it is ('I am temporarily delayed, which is inconvenient but survivable'), we defuse the emotional bomb.",
      },
      {
        title: "The Commuter Reframe",
        content: "Next time you are stuck in traffic or a delayed line, challenge your frustration. Reframe: 'I cannot speed up the train, but this is a perfect, uninterrupted pocket of time to listen to my favorite audio, close my eyes, or practice mindfulness.'",
        prompt: "Think about your last difficult commute. What catastrophic thought did your mind tell you, and how can you reframe it constructively now?"
      }
    ]
  },
  {
    id: "workplace-anxiety",
    title: "Overcoming Imposter Syndrome",
    shortDesc: "Defuse thoughts of self-doubt, perfectionism, and failure at work.",
    category: "work",
    durationMinutes: 6,
    steps: [
      {
        title: "The Unseen Work Stressor",
        content: "Work demands high focus and cognitive energy. But often, the heaviest burden is the pressure we put on ourselves. Imposter syndrome is the persistent feeling that you will be exposed as a 'fraud' despite clear achievements and skills.",
      },
      {
        title: "All-or-Nothing Trap",
        content: "High-achieving environments trigger 'All-or-Nothing' thinking and 'Should Statements.' Thoughts like 'If I don't answer every question perfectly, people will think I'm unqualified' or 'I should never make mistakes.' These are unrealistic, absolute standards.",
      },
      {
        title: "Examining the Evidence",
        content: "When doubt strikes, ask yourself: What objective, factual evidence exists that you are incompetent? Then, ask: What objective evidence exists that you *are* competent? (Past successes, completed tasks, positive feedback, qualifications). Put your anxious thoughts on trial as if you were an objective judge.",
      },
      {
        title: "Defining Constructive Standards",
        content: "Reframe your work mistakes as data points. An error is a signal for growth, not a verdict on your intelligence. True confidence comes from acknowledging your limitations with compassion while continuing to perform your best.",
        prompt: "Write down an automatic thought about a task at work where you felt out of your depth. Let's put this thought on trial together."
      }
    ]
  }
];
