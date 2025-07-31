const mongoose = require('mongoose');

class baseModel {
  constructor(modelName, schema) {
    this.model = mongoose.model(modelName, schema);
  }

  async createEntry(data) {
    const { _id } = await this.model.create(data);
    return _id;
  }

  async findById(id) {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async updateEntry(id, updateData, options = {}) {
    const { returnUpdated = true, runValidators = true } = options;

    const updateConfig = {
      new: returnUpdated,
      runValidators,
    };

    const result = await this.model.findByIdAndUpdate(
      id,
      updateData,
      updateConfig
    );
  }

  async softDelete(id) {
    const result = await this.model.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    return !!result;
  }
}

module.exports = baseModel;
