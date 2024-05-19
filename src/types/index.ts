export type TextFormatter = (s: string) => string;
export type NormalizedLetterMap = { [key: string]: string };
export type Mimetype = 'video/mp4' | 'image/gif' | 'image' | 'application/octet-stream';
export type Button = {
    id: string;
    text: string;
};