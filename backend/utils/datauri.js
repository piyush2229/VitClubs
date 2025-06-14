import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
    const extName = path.extname(file.originalname);  // Use originalname (all lowercase)
    return parser.format(extName, file.buffer).content;  // Return the formatted content
};

export default getDataUri;
