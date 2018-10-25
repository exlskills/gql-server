import mongoose from 'mongoose';

const ConversionXrefSchema = new mongoose.Schema({
  field_name: {
    type: String,
    required: true,
    index: true
  },
  val_from: {
    type: String,
    required: true,
    index: true
  },
  val_to: {
    type: String,
    required: true,
    index: true
  }
});

export default mongoose.model(
  'ConversionXref',
  ConversionXrefSchema,
  'conversion_xref'
);
