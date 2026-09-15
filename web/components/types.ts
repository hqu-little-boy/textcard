export type Theme = 'literary-paper' | 'xiaohongshu' | 'minimal-dark' | 'newspaper';

export interface CardConfig {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  aspectRatio: '1:1' | '3:4' | '16:9' | 'auto';
  bgColor: string;
  showTitle: boolean;
  showAuthor: boolean;
  firstLineIndent: boolean;
  justify: boolean;
}
