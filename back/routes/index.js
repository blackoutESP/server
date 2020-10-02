const express           = require('express');
const router            = express.Router();
const auth              = require('../middlewares/auth');
const files             = require('../utils/files');
const streaming         = require('../utils/streaming');
const image             = require('../utils/image');
const preview           = require('../utils/preview');

router.get('/', (request, response) => {
    response.status(200).json({ok: false});
});

router.post('/signup', auth.signup);

router.post('/signin', auth.signin);

router.get('/files/:path?*', auth.authenticate, files.ls);

router.get('/file/:path?*', auth.authenticate, files.fileDetails);

router.post('/files/:path?*', auth.authenticate, files.mkdir);

router.get('/download/:path?*', auth.authenticate, files.download);

router.post('/upload/:path?*', auth.authenticate, files.upload);

router.delete('/files/:path?*', auth.authenticate, files.rm);

router.get('/streaming/:path?*', auth.authenticate, streaming.preview);

router.get('/image/:path?*', auth.authenticate, image.preview);

router.get('/preview/:path?*', auth.authenticate, preview.preview);

module.exports = router;
