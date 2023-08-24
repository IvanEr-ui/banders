const {createPath_profile} = require('../path/create-path')

const DomainName = "http://localhost:4000/"

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