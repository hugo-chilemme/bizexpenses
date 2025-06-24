
const nScale = require('../../../../utils/nScale');
const database = require('../../utils/database');
const fs = require('fs');
const uuid = require('uuid');
const config = {
	post: {
    isAuthentified: true,
	}
}



const post = (req, res) => {
  const image = req.body.base64;
  if (!image) {
    return res.status(400).json({ status: 'error', error: 'Image is required' });
  }

  const uploadsDir = `${process.cwd()}/uploads`;
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const id = uuid.v4();
  const filePath = `${uploadsDir}/${id}.png`;

  // Remove base64 header if present
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      return res.status(500).json({ status: 'error', error: 'Failed to save image' });
    }
    nScale.analyzeImage(image).then((data) => {
      database().collection('expenses').insertOne({
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
        image: `${id}.png`,
        data: data,
        userId: req.user._id,
      }).then((result) => {
        console.log(`Expense ${id} created`);
        res.status(200).json({ status: 'success', data, file: `${id}.png`, rowId: result.insertedId });
      }).catch((error) => {
        console.error(`Failed to create expense ${id}:`, error);
        return res.status(500).json({ status: 'error', error: 'Failed to create expense' });
      });
    }).catch((error) => {
      res.status(500).json({ status: 'error', error: error.message });
    });
  });
}

module.exports = {
  post,
  config
};
