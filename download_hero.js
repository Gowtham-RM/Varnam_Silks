
import fs from 'fs';
import https from 'https';

const url = "https://via.placeholder.com/800.png?text=Hero+Image";
const path = "src/assets/hero-image.jpg"; // Keeping extension for now, though it's png content, browsers handle it. Or rename.

const file = fs.createWriteStream(path);

https.get(url, function (response) {
    if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, function (redirectResponse) {
            redirectResponse.pipe(file);
        });
    } else {
        response.pipe(file);
    }

    file.on('finish', () => {
        file.close();
        console.log("Download completed.");
    });
}).on('error', (err) => {
    fs.unlink(path, () => { });
    console.error("Error downloading image:", err.message);
});
