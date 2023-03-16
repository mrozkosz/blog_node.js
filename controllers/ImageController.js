const HttpStatuses = require("http-status-codes");
const {Op} = require("sequelize");
const {readFile} = require('fs');
const fs = require('fs');
const path = require("path");
const filesUploader = require('../helpers/filesUploader')

class ImageController {
    constructor(imageRepository) {
        this.imageRepository = imageRepository;
    }

    async show(req, res) {
        const {name} = req.params;
        const publicPath = path.join(__dirname, '../public');

        const image = await this.imageRepository.findOne({where: {[Op.or]: [ {image:name}, {name} ] } });

        if(!image){
            return res.sendStatus(HttpStatuses.NOT_FOUND);
        }

        const filePath = `${publicPath}/static/${image.image}`;
        if (!fs.existsSync(filePath)) {
            return res.sendStatus(HttpStatuses.NOT_FOUND);
        }

        readFile(filePath, (err, fd) => {
            if (err) {
                return res.sendStatus(HttpStatuses.NOT_FOUND);
            }

            try {
                const mimeType = 'image/png';

                res.set('Content-Type', mimeType);
                return res.send(fd);
            } catch (e) {
                return res.sendStatus(HttpStatuses.NOT_FOUND);
            }
        });
    }

    async upload(req, res) {
        const {loggedUser} = req;
        const {files} = req;
        let images = files.files;
        const publicPath = path.join(__dirname, "../public/static");

        if (!files.files) {
            return res.status(HttpStatuses.BAD_REQUEST).send('Not found file');
        }

        try {
            if (images.name !== undefined) {
                images = [images];
            }

            const array = [];
            const arrayOfAllImages = []

            await Promise.all(images.map(async (file) => {
                const response = await filesUploader(file, publicPath);
                response.author = loggedUser.id;
                arrayOfAllImages.push(response);
                if (response.success) {
                    array.push(response);
                }
                return response;
            }));

            const response = await this.imageRepository.bulkCreate(array);

            if (!response) {
                return res.sendStatus(HttpStatuses.BAD_REQUEST);
            }

            return res.send(arrayOfAllImages);

        } catch (err) {
            return res.status(500).send(`Error: ${err}`);
        }
    }

    async delete(req, res) {
        const {loggedUser, params} = req;
        const {name} = params;

        await this.imageRepository.delete({
            where: {
                [Op.and]: [
                    {image:name},
                    {author: loggedUser.id}
                ]
            }
        });

        return res.sendStatus(HttpStatuses.NO_CONTENT);
    }
};

module.exports = ImageController;
