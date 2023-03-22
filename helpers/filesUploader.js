const fs = require("fs");
const mime = require("mime-types");
const uuidGenerator = require('./uuidGenerator');
const imageRepository = require('../repositories/ImageRepository');
const {Op} = require("sequelize");
const config = require("../config");

module.exports = async (file, publicPath) => {
    const acceptedMimetypes = [
        "image/gif",
        "image/jpeg",
        "image/png",
        'image/jpg'
    ];

    const fileExtension = mime.extension(file.mimetype);
    const fileName = uuidGenerator(25) + "." + fileExtension;

    const image = await new imageRepository().findOne({ where:{ [Op.or]: [{image: file.name}, {name: file.name}] } });

    if(image){
        return {
            success:false,
            message: "Image already exist",
            name: file.name,
        }
    }

    if (fs.existsSync(`${publicPath}/${fileName}`)) {
        return {
            success:false,
            message: "Image already exist",
            name: file.name,
        }
    }

    if (file.size >= 2621440) {
        return {
            success:false,
            message: "Image is to large. Max image size: 2.5MB",
            size: file.size,
            name: file.name,
        };
    }

    if (!acceptedMimetypes.includes(file.mimetype)) {
        return {
            success: false,
            message: "File type not exist",
            mimetype: file.mimetype,
            name: file.name,
        }
    }

    try{
        await file.mv(`${publicPath}/${fileName}`);
        return {
            success: true,
            image: fileName,
            url: config.app.appUrl +'/image/'+ fileName,
            oldName:"null",
            name: file.name,
            mimetype: file.mimetype
        }
    }catch (e){
        console.error(e);
        return false;
    }
};
