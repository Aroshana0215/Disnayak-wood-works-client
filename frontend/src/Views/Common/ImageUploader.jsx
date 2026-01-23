import { useState } from "react";
import { uploadToCloudinary } from "../../services/ImageUploadService/ImageUploadService";

const ImageUploader = () => {
  const [imageUrl, setImageUrl] = useState(null);

  const handleFileChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      try {
        const url = await uploadToCloudinary(event.target.files[0]);
        setImageUrl(url);
        console.log("File uploaded:", url);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {imageUrl && <img src={imageUrl} alt="Uploaded" width={200} />}
    </div>
  );
};

export default ImageUploader;
