const MAX_IMAGE_DIMENSION_WIDTH = 150, MAX_IMAGE_DIMENSION_HEIGHT = 100;

class Images {

    /**
     * From: https://stackoverflow.com/questions/20379027/javascript-reduce-the-size-and-quality-of-image-with-based64-encoded-code
     * Resize a base 64 Image
     * @param {String} base64 - The base64 string (must include MIME type)
     * @param {Number} newWidth - The width of the image in pixels
     * @param {Number} newHeight - The height of the image in pixels
     */
    static resizeBase64Img(base64) {
        return new Promise((resolve)=>{
            var canvas = document.createElement("canvas");
            let context = canvas.getContext("2d");
            let img = document.createElement("img");
            
            img.src = base64;

            img.onload = function () {
                const {width, height} = Images.getNewImageSize(img.width, img.height);

                canvas.width = width;
                canvas.height = height;

                context.scale(width/img.width, height/img.height);
                context.drawImage(img, 0, 0);
                resolve(canvas.toDataURL());
            }
        });
    }

    static getNewImageSize(originalWidth, originalHeight) {
        let width = originalWidth;
        let height = originalHeight;
        
        const scale_factor = Math.max(height/MAX_IMAGE_DIMENSION_HEIGHT, width/MAX_IMAGE_DIMENSION_WIDTH);
        width /= scale_factor;
        height /= scale_factor;

        return {width, height};
    }

    // Taken from: https://refine.dev/blog/how-to-base64-upload/
    static convertBase64(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    }

    static toImage(image) {
        return new TextDecoder("utf-8").decode(new Uint8Array( image.data ));
    }

}