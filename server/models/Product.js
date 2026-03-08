import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String,
    required: true
  },
  sizeType: {
    type: String,
    required: true,
    enum: ['Alpha', 'Numeric', 'Kids', 'Saree'],
    default: 'Alpha'
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  sizes: [{
    size: {
      type: String,
      required: true
    },
    colors: [{
      color: {
        type: String,
        required: true
      },
      stock: {
        type: Number,
        default: 0,
        min: 0
      },
      inStock: {
        type: Boolean,
        default: true
      }
    }]
  }],
  colors: [{
    type: String
  }],
  colorImages: [{
    color: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  }],
  fit: {
    type: String
  },
  pattern: {
    type: String
  },
  borderType: {
    type: String
  },
  occasion: {
    type: String
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  },
  purchaseCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  ratedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Enable advanced text search
productSchema.index(
  { name: 'text', description: 'text', category: 'text', subCategory: 'text' },
  { weights: { name: 10, category: 5, subCategory: 5, description: 1 } }
);

export default mongoose.model('Product', productSchema);
