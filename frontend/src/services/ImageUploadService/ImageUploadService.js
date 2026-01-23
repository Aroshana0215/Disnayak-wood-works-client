import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const storage = getStorage();

export const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        const storageRef = ref(storage, `images/${file.name}`);
        const metadata = { contentType: file.type };
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

export const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "DTSpreset"); // Change this

        fetch("https://api.cloudinary.com/v1_1/dgbm12fat/image/upload", {
            method: "POST",
            body: formData,
        })
            .then(async (response) => {
                if (!response.ok) throw new Error("Upload failed");
                const data = await response.json();
                resolve(data.secure_url); // Cloudinary returns a secure URL
            })
            .catch((error) => reject(error));
    });
};



