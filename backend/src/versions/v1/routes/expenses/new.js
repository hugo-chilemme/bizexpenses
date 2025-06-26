
const nScale = require('../../../../utils/nScale');
const database = require('../../utils/database');
const fs = require('fs');
const uuid = require('uuid');
const config = {
	post: {
    isAuthentified: true,
	}
}


const post = async (req, res) => {
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

  fs.writeFile(filePath, buffer, async (err) => {
    if (err) {
      return res.status(500).json({ status: 'error', error: 'Failed to save image' });
    }

    // create database row 
    const row = await database().collection('expenses').insertOne({
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'preparing',
      image: `${id}.png`,
      data: {},
      userId: req.user._id,
    });



    // Réponse immédiate
    res.status(200).json({ status: 'success', id: row.insertedId });

    // Analyse et insertion en base en arrière-plan
    nScale.analyzeImage(image)
      .then((data) => {
        return database().collection('expenses').updateOne(
          { _id: row.insertedId },
          {
            $set: {
              status: 'processed',
              data: data,
              updatedAt: new Date(),
            },
          }
        );
      })
      .then((result) => {
        console.log(`Expense ${id} created`);
      })
      .catch((error) => {
        console.error(`Failed to process expense ${id}:`, error);
      });
  });
}


module.exports = {
  post,
  config
};
