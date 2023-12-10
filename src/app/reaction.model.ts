export interface Reaction {
    userId: string;
    type: 'like' | 'unlike' | 'angry' | 'sad' | 'heart';
  }