# ADVENT CALENDAR PROJECT

# KEY TECHNOLOGIES

**Back-end**: NodeJs with ExpressJs
**Database**: Mysql

# USAGE

### .ENV

Create a .env file in the root of the project with the following variables:
JWT_SECRET =
DB_HOST =
DB_USER =
DB_PASSWORD =
DB_NAME =
PORT =
IMAGE_WIDTH=
IMAGE_HEIGHT=

# Image Uploads

### Key Features

- **File Uploads**: Upload images in JPEG, JPG, or PNG formats.
- **Image Resizing**: Automatically resize uploaded images to configurable dimensions.
- **Environment Variables**: Resize parameters can be set in a `.env` file.
- **Modular Structure**: Middleware handles both uploading and resizing logic.
- **Error Handling**: Robust validation and error responses.

---

### Installation

Install the required dependencies:

```bash
npm install express multer sharp
```

---

### .env Configuration

Set image resizing parameters in a `.env` file:

```makefile
IMAGE_WIDTH=500    # Width of the resized image
IMAGE_HEIGHT=500   # Height of the resized image
```

---

### Middleware

The upload and resize logic is implemented in:

```
middlewares/uploadMiddleware.js
```

---

### API Endpoints

- **URL**: `/upload`
- **Method**: `POST`
- **Body**: Use `form-data` with the following key-value pair:
  - **Key**: `image`
  - **Value**: The image file to upload (JPEG, JPG, or PNG).

#### Example with Postman

1. Create a new `POST` request to `http://localhost:3000/upload`.
2. In the body, select `form-data` and add:
   - **Key**: `image`
   - **Value**: Upload the image file you want to process.

#### Example with cURL

```bash
curl -X POST -F "image=@your-image.jpg" http://localhost:3000/upload
```

---

### Filename

```
user.id + file.original_name
```

### Response Example

On success, the API returns:

```json
{
  "message": "Image uploaded and resized successfully!",
  "resizedFile": "/absolute/path/to/uploads/resized-image.jpg"
}
```

---

### Project Structure

```
project/
├── middlewares/
│   └── uploadMiddleware.js # Middleware for upload and resize
├── routes/
│   └── uploadRoutes.js     # Route for image upload
├── uploads/                # Directory for resized images
├── server.js               # Main server file
├── .env                    # Environment variables for configuration
├── package.json
```

---

### License

This project is licensed under the MIT License.
