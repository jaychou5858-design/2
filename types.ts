export interface Example {
  sentence: string;
  translation: string;
  usage: string; // Explanation of why this example is relevant (collocation/nuance)
}

export interface Meaning {
  partOfSpeech: string;
  definition: string;
}

export interface DictionaryResult {
  word: string;
  phonetic: string;
  meanings: Meaning[];
  examples: Example[];
  synonyms: string[];
  etymology: string;
}

export interface SavedWord extends DictionaryResult {
  imageUrl: string | null;
  savedAt: number;
}

export interface SearchState {
  data: DictionaryResult | null;
  imageUrl: string | null;
  isLoadingText: boolean;
  isLoadingImage: boolean;
  error: string | null;
}
