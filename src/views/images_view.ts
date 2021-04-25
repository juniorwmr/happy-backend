import Image from '../models/Image.entity';
export default {
  render(image: Image) {
    return {
      id: image.id,
      url: image.path,
      key: image.key,
    };
  },
  renderMany(images: Image[]) {
    return images.map((image) => this.render(image));
  },
};
