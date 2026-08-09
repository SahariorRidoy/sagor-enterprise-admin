export interface ICategory {
  subCategories: []; 
  _id: string;
  name: string;
  slug: string;
  details: string;
  icon: {
    name: string;
    url: string;
  };
  image: File | string;
  bannerImg: File;
  createdAt: string;
  updatedAt: string; 
  __v: number;
}
