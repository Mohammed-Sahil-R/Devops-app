export type TopicId = 'cicd' | 'docker' | 'kubernetes' | 'terraform' | 'gitops';

export interface Command {
  cmd: string;
  desc: string;
}

export interface DocSection {
  title: string;
  content: string;
  codeSnippets?: {
    filename: string;
    language: string;
    code: string;
  }[];
  commands?: Command[];
}

export interface ConceptTopic {
  id: TopicId;
  title: string;
  subtitle: string;
  shortDesc: string;
  icon: string; // Lucide icon name
  sections: DocSection[];
  interactiveTitle: string;
  interactiveDesc: string;
}
