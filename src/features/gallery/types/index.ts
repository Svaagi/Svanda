export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  placeholderPath: string;
  placeholderLabel: string;
  width: number;
  height: number;
}

export interface GalleryLayer {
  id: string;
  item: GalleryItem;
  parallaxFactor: number;
  zIndex: number;
  top: string;
  left: string;
  rotate: number;
  width: string;
}
