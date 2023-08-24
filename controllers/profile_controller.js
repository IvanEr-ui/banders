const {createPath_profile} = require('../path/create-path')

const DomainName = "https://banders.onrender.com/"

class profileController {
    async profileEn(req, res) {
        try {
            res.render(createPath_profile("profile"), {})
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new profileController();
