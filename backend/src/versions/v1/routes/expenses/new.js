
const nScale = require('../../../../utils/nScale');
const database = require('../../utils/database');
const fs = require('fs');
const uuid = require('uuid');
const config = {
	post: {
    isAuthentified: true,
	}
}

/** * Handles POST requests to create a new expense by saving an image and processing it.
 *
 * @async
 * @function post
 * @param {Object} req - Express request object, containing the base64 image in the body.
 * @param {Object} req.body - The request body containing the base64 image.
 * @param {string} req.body.base64 - The base64 encoded image string.
 * @param {Object} res - Express response object, used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the status of the operation or an error message.
 */
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
        if (data.status === 'error') {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Failed to delete file ${filePath}:`, err);
            }
          });
          return database().collection('expenses').updateOne(
            { _id: row.insertedId },
            {
              $set: {
                status: 'error',
                data: data,
                updatedAt: new Date(),
              },
            }
          );
        }


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
