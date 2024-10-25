require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors()); 

const upload = multer({ storage: multer.memoryStorage() });

app.post('/process-image', upload.single('image'), async (req, res) => {
    try {
        const { client } = await import('@gradio/client');

  
        const imageBase64 = req.file.buffer.toString('base64');
        
        const appClient = await client(process.env.GRADIO_API_URL);
        const result = await appClient.predict("/predict", [`data:image/jpeg;base64,${imageBase64}`]);

        console.log("API Response:", result);

        const goodTeethImage = result.data[0]; 
        const badTeethImage = result.data[1]; 

        // Create image URLs from Base64
        const goodTeethImageUrl = `data:image/jpeg;base64,${goodTeethImage}`;
        const badTeethImageUrl = `data:image/jpeg;base64,${badTeethImage}`;

        res.json({
            good_teeth_img: goodTeethImageUrl,
            bad_teeth_img: badTeethImageUrl
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error processing the image', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
