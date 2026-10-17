export interface Product {
  id: string;
  name: string;
  /** Marathi display name, used on the PDF bill */
  nameMr: string;
  packaging: string;
  /** Price in INR, per box */
  price: number;
  available: boolean;
}
