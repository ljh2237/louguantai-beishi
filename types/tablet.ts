export interface TabletImage {
  path: string;
  type: "rubbing" | "stone" | "scan" | "other";
  caption: string;
  sourcePdfPages: number[];
}

export interface TabletSource {
  textFile: string | null;
  pdfFile: string | null;
  pdfPages: number[];
}

export interface Inscription {
  front: string | null;
  back: string | null;
  otherSections: string[];
  fullText: string;
}

export interface Tablet {
  id: number;
  slug: string;
  title: string;
  alternativeTitles: string[];
  category: "main" | "佚碑存文" | "佚碑存目";
  dynasty: string | null;
  dateText: string | null;
  location: string | null;
  author: string | null;
  calligrapher: string | null;
  engraver: string | null;
  otherPeople: string[];
  introduction: string | null;
  inscription: Inscription;
  images: TabletImage[];
  source: TabletSource;
  needsReview: boolean;
  reviewIssues: string[];
}
